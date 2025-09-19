import { Item } from '@/types/game';

// Материалы для подземелий
export const dungeonMaterials: Item[] = [
  // Обычные материалы
  {
    id: 'iron_ingot',
    name: 'Слиток стали',
    type: 'material',
    rarity: 'common',
    stats: {},
    price: 25,
    description: 'Прочный слиток стали, добытый в глубинах подземелий. Используется для создания оружия и доспехов.',
    image_url: '/assets/items/iron_ingot.jpg',
    quantity: 1,
    weight: 2
  },
  {
    id: 'mystic_crystal',
    name: 'Мистический кристалл',
    type: 'material',
    rarity: 'rare',
    stats: {},
    price: 75,
    description: 'Светящийся кристалл, излучающий магическую энергию. Редко встречается в древних подземельях.',
    image_url: '/assets/items/mystic_crystal.jpg',
    quantity: 1,
    weight: 1
  },
  {
    id: 'shadow_essence',
    name: 'Сущность тени',
    type: 'material',
    rarity: 'epic',
    stats: {},
    price: 150,
    description: 'Концентрированная энергия тьмы, собранная из глубин подземелий. Обладает мощными магическими свойствами.',
    image_url: '/assets/items/shadow_essence.jpg',
    quantity: 1,
    weight: 0.5
  },
  {
    id: 'dragon_scale',
    name: 'Чешуя дракона',
    type: 'material',
    rarity: 'legendary',
    stats: {},
    price: 500,
    description: 'Чешуя древнего дракона, найденная в его логове. Невероятно редкий и ценный материал.',
    image_url: '/assets/items/dragon_scale.jpg',
    quantity: 1,
    weight: 3
  },
  {
    id: 'ancient_rune',
    name: 'Древняя руна',
    type: 'material',
    rarity: 'rare',
    stats: {},
    price: 100,
    description: 'Руна с древними символами, вырезанная в камне. Содержит в себе древние знания.',
    image_url: '/assets/items/ancient_rune.jpg',
    quantity: 1,
    weight: 0.3
  },
  {
    id: 'goblin_gold',
    name: 'Гоблинское золото',
    type: 'material',
    rarity: 'common',
    stats: {},
    price: 15,
    description: 'Золотые монеты, украденные гоблинами. Хотя и не чистое золото, но все же имеет ценность.',
    image_url: '/assets/items/goblin_gold.jpg',
    quantity: 1,
    weight: 0.1
  },
  {
    id: 'bone_fragment',
    name: 'Фрагмент кости',
    type: 'material',
    rarity: 'common',
    stats: {},
    price: 10,
    description: 'Костный фрагмент нежити. Может быть использован в темных ритуалах.',
    image_url: '/assets/items/bone_fragment.jpg',
    quantity: 1,
    weight: 0.5
  },
  {
    id: 'magic_ore',
    name: 'Магическая руда',
    type: 'material',
    rarity: 'rare',
    stats: {},
    price: 80,
    description: 'Руда, пропитанная магической энергией. Светится мягким голубым светом.',
    image_url: '/assets/items/magic_ore.jpg',
    quantity: 1,
    weight: 2.5
  },
  {
    id: 'phoenix_feather',
    name: 'Перо феникса',
    type: 'material',
    rarity: 'epic',
    stats: {},
    price: 300,
    description: 'Перо мифического феникса. Горит вечным огнем и никогда не сгорает.',
    image_url: '/assets/items/phoenix_feather.jpg',
    quantity: 1,
    weight: 0.1
  },
  {
    id: 'void_shard',
    name: 'Осколок пустоты',
    type: 'material',
    rarity: 'legendary',
    stats: {},
    price: 1000,
    description: 'Осколок из самого сердца пустоты. Поглощает свет и создает вокруг себя темноту.',
    image_url: '/assets/items/void_shard.jpg',
    quantity: 1,
    weight: 0.2
  }
];

// Функция для получения случайного материала из сундука
export function getRandomDungeonMaterial(roomNumber: number, isBoss: boolean = false): Item | null {
  // Определяем доступные материалы в зависимости от комнаты и типа
  let availableMaterials: Item[] = [];
  
  if (isBoss) {
    // Боссы могут дать любые материалы
    availableMaterials = dungeonMaterials;
  } else if (roomNumber <= 2) {
    // Первые комнаты - только обычные материалы
    availableMaterials = dungeonMaterials.filter(item => item.rarity === 'common');
  } else if (roomNumber <= 4) {
    // Средние комнаты - обычные и редкие
    availableMaterials = dungeonMaterials.filter(item => 
      item.rarity === 'common' || item.rarity === 'rare'
    );
  } else {
    // Поздние комнаты - все кроме легендарных
    availableMaterials = dungeonMaterials.filter(item => 
      item.rarity !== 'legendary'
    );
  }
  
  if (availableMaterials.length === 0) return null;
  
  // Случайный выбор материала
  const randomIndex = Math.floor(Math.random() * availableMaterials.length);
  const selectedMaterial = availableMaterials[randomIndex];
  
  // Создаем копию с уникальным ID
  return {
    ...selectedMaterial,
    id: `${selectedMaterial.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
}

// Функция для получения нескольких материалов (для больших сундуков)
export function getMultipleDungeonMaterials(roomNumber: number, isBoss: boolean = false, count: number = 1): Item[] {
  const materials: Item[] = [];
  
  for (let i = 0; i < count; i++) {
    const material = getRandomDungeonMaterial(roomNumber, isBoss);
    if (material) {
      materials.push(material);
    }
  }
  
  return materials;
}



