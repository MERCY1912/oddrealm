-- Create dungeon system tables

-- Create dungeons table
CREATE TABLE public.dungeons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    dungeon_id text UNIQUE NOT NULL,
    name text NOT NULL,
    description text DEFAULT '',
    min_level integer NOT NULL DEFAULT 1,
    max_level integer NOT NULL DEFAULT 10,
    difficulty text NOT NULL DEFAULT 'normal', -- normal, heroic, mythic
    rooms_count integer NOT NULL DEFAULT 5,
    base_reward_gold integer NOT NULL DEFAULT 100,
    base_reward_exp integer NOT NULL DEFAULT 50,
    image_url text,
    background_gradient text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create dungeon_rooms table
CREATE TABLE public.dungeon_rooms (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    dungeon_id text REFERENCES public.dungeons(dungeon_id) ON DELETE CASCADE NOT NULL,
    room_number integer NOT NULL,
    room_type text NOT NULL DEFAULT 'battle', -- battle, event, boss, treasure
    enemy_data jsonb, -- Bot data for battle rooms
    event_data jsonb, -- Event configuration for event rooms
    rewards jsonb DEFAULT '{}',
    is_boss boolean NOT NULL DEFAULT false,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE (dungeon_id, room_number)
);

-- Create dungeon_runs table (active dungeon runs)
CREATE TABLE public.dungeon_runs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    dungeon_id text REFERENCES public.dungeons(dungeon_id) NOT NULL,
    current_room integer NOT NULL DEFAULT 1,
    player_health integer NOT NULL,
    player_mana integer NOT NULL,
    player_gold integer NOT NULL, -- Gold earned during run
    player_exp integer NOT NULL DEFAULT 0, -- Experience earned during run
    inventory_snapshot jsonb, -- Player inventory at start
    completed_rooms jsonb DEFAULT '[]', -- Array of completed room numbers
    status text NOT NULL DEFAULT 'active', -- active, completed, abandoned, died
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    UNIQUE (player_id) -- One active dungeon run per player
);

-- Create dungeon_events table (configuration for events)
CREATE TABLE public.dungeon_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id text UNIQUE NOT NULL,
    name text NOT NULL,
    description text DEFAULT '',
    event_type text NOT NULL, -- trader, trap, rest, treasure, puzzle
    effects jsonb NOT NULL DEFAULT '{}', -- Event effects (healing, damage, rewards, etc.)
    image_url text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.dungeons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dungeon_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dungeon_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dungeon_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dungeons
CREATE POLICY "Everyone can view active dungeons" ON public.dungeons
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage dungeons" ON public.dungeons
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for dungeon_rooms
CREATE POLICY "Everyone can view active dungeon rooms" ON public.dungeon_rooms
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage dungeon rooms" ON public.dungeon_rooms
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for dungeon_runs
CREATE POLICY "Users can view their own dungeon runs" ON public.dungeon_runs
    FOR SELECT USING (auth.uid() = player_id);

CREATE POLICY "Users can manage their own dungeon runs" ON public.dungeon_runs
    FOR ALL USING (auth.uid() = player_id);

CREATE POLICY "Admins can view all dungeon runs" ON public.dungeon_runs
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for dungeon_events
CREATE POLICY "Everyone can view active dungeon events" ON public.dungeon_events
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage dungeon events" ON public.dungeon_events
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create triggers for updated_at columns
CREATE TRIGGER update_dungeons_updated_at
    BEFORE UPDATE ON public.dungeons
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dungeon_rooms_updated_at
    BEFORE UPDATE ON public.dungeon_rooms
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dungeon_events_updated_at
    BEFORE UPDATE ON public.dungeon_events
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_dungeon_rooms_dungeon_id ON public.dungeon_rooms(dungeon_id);
CREATE INDEX idx_dungeon_runs_player_id ON public.dungeon_runs(player_id);
CREATE INDEX idx_dungeon_runs_status ON public.dungeon_runs(status);
CREATE INDEX idx_dungeon_events_active ON public.dungeon_events(is_active);

-- Insert default dungeons
INSERT INTO public.dungeons (dungeon_id, name, description, min_level, max_level, difficulty, rooms_count, base_reward_gold, base_reward_exp, background_gradient) VALUES
('catacombs', 'Катакомбы Ада', 'Темные катакомбы, полные нежити и древних проклятий. Только самые храбрые воины осмелятся ступить в эти залы смерти.', 1, 5, 'normal', 5, 150, 75, 'linear-gradient(180deg, #2d1b2e 0%, #0f0f23 100%)'),
('goblin_mines', 'Гоблинские Шахты', 'Заброшенные шахты, захваченные племенами гоблинов. Золото и драгоценности ждут тех, кто сможет пережить ловушки и засады.', 3, 8, 'normal', 7, 250, 120, 'linear-gradient(180deg, #3e2723 0%, #1a1a1a 100%)'),
('dragon_lair', 'Логово Дракона', 'Древнее логово огненного дракона. Горы золота и магических артефактов охраняются могучим змеем и его слугами.', 10, 20, 'heroic', 10, 1000, 500, 'linear-gradient(180deg, #d32f2f 0%, #212121 100%)');

-- Insert default dungeon rooms for catacombs
INSERT INTO public.dungeon_rooms (dungeon_id, room_number, room_type, enemy_data, is_boss) VALUES
('catacombs', 1, 'battle', '{"id": "skeleton_warrior", "name": "Скелет-воин", "level": 2, "health": 80, "maxHealth": 80, "attack": 15, "defense": 8, "experience": 25, "gold": 15, "difficulty": "easy", "image": "💀"}', false),
('catacombs', 2, 'battle', '{"id": "zombie", "name": "Зомби", "level": 3, "health": 120, "maxHealth": 120, "attack": 18, "defense": 5, "experience": 35, "gold": 20, "difficulty": "easy", "image": "🧟"}', false),
('catacombs', 3, 'event', null, false),
('catacombs', 4, 'battle', '{"id": "wraith", "name": "Призрак", "level": 4, "health": 100, "maxHealth": 100, "attack": 25, "defense": 3, "experience": 50, "gold": 30, "difficulty": "medium", "image": "👻"}', false),
('catacombs', 5, 'battle', '{"id": "lich_king", "name": "Король-Лич", "level": 5, "health": 200, "maxHealth": 200, "attack": 35, "defense": 15, "experience": 100, "gold": 75, "difficulty": "boss", "image": "👑"}', true);

-- Insert default dungeon events
INSERT INTO public.dungeon_events (event_id, name, description, event_type, effects) VALUES
('ancient_altar', 'Древний Алтарь', 'Вы нашли древний алтарь, излучающий магическую энергию. Прикосновение к нему восстанавливает ваши силы.', 'rest', '{"heal": 50, "mana": 25}'),
('goblin_trader', 'Гоблинский Торговец', 'Подземный торговец предлагает товары за золото. У него есть полезные зелья и прокрутки.', 'trader', '{"items": ["health_potion", "mana_potion"], "prices": [50, 75]}'),
('spike_trap', 'Ловушка с Шипами', 'Вы случайно наступили на скрытую ловушку! Шипы вылетают из стен.', 'trap', '{"damage": 20}'),
('treasure_chest', 'Сундук с Сокровищами', 'Вы обнаружили древний сундук, полный золота и драгоценностей.', 'treasure', '{"gold": 100, "exp": 25}'),
('mysterious_potion', 'Таинственное Зелье', 'Вы находите странное зелье. Неизвестно, что оно делает...', 'puzzle', '{"random_effect": true}');



