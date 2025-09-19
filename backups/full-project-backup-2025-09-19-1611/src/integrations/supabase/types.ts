export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_bots: {
        Row: {
          attack: number
          bot_id: string
          created_at: string
          defense: number
          difficulty: string
          experience: number
          gold: number
          health: number
          id: string
          image_url: string | null
          is_active: boolean
          level: number
          max_health: number
          name: string
          stats: Json | null
          updated_at: string
        }
        Insert: {
          attack?: number
          bot_id: string
          created_at?: string
          defense?: number
          difficulty?: string
          experience?: number
          gold?: number
          health?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          level?: number
          max_health?: number
          name: string
          stats?: Json | null
          updated_at?: string
        }
        Update: {
          attack?: number
          bot_id?: string
          created_at?: string
          defense?: number
          difficulty?: string
          experience?: number
          gold?: number
          health?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          level?: number
          max_health?: number
          name?: string
          stats?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      admin_hero_avatars: {
        Row: {
          avatar_id: string
          category: string | null
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          avatar_id: string
          category?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          avatar_id?: string
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_locations: {
        Row: {
          background_gradient: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          location_id: string
          name: string
          updated_at: string
        }
        Insert: {
          background_gradient?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          location_id: string
          name: string
          updated_at?: string
        }
        Update: {
          background_gradient?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          location_id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_shop_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          item_id: string
          name: string
          price: number
          rarity: string
          requirements: string | null
          stats: Json
          type: string
          updated_at: string
          weapon_type: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          item_id: string
          name: string
          price?: number
          rarity: string
          requirements?: string | null
          stats?: Json
          type: string
          updated_at?: string
          weapon_type?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          item_id?: string
          name?: string
          price?: number
          rarity?: string
          requirements?: string | null
          stats?: Json
          type?: string
          updated_at?: string
          weapon_type?: string | null
        }
        Relationships: []
      }
      admin_tower_floors: {
        Row: {
          bot_id: string | null
          created_at: string
          floor_number: number
          id: string
          is_active: boolean
          rewards: Json | null
          tower_id: string
          updated_at: string
        }
        Insert: {
          bot_id?: string | null
          created_at?: string
          floor_number: number
          id?: string
          is_active?: boolean
          rewards?: Json | null
          tower_id: string
          updated_at?: string
        }
        Update: {
          bot_id?: string | null
          created_at?: string
          floor_number?: number
          id?: string
          is_active?: boolean
          rewards?: Json | null
          tower_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_tower_floors_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "admin_bots"
            referencedColumns: ["bot_id"]
          },
          {
            foreignKeyName: "admin_tower_floors_tower_id_fkey"
            columns: ["tower_id"]
            isOneToOne: false
            referencedRelation: "admin_towers"
            referencedColumns: ["tower_id"]
          },
        ]
      }
      admin_towers: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          max_floors: number
          name: string
          tower_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          max_floors?: number
          name: string
          tower_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          max_floors?: number
          name?: string
          tower_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          player_id: string
          player_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          player_id: string
          player_name: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          player_id?: string
          player_name?: string
        }
        Relationships: []
      }
      equipment: {
        Row: {
          created_at: string
          id: string
          item_data: Json | null
          item_id: string | null
          player_id: string
          slot: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_data?: Json | null
          item_id?: string | null
          player_id: string
          slot: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          item_data?: Json | null
          item_id?: string | null
          player_id?: string
          slot?: string
          updated_at?: string
        }
        Relationships: []
      }
      player_inventory: {
        Row: {
          created_at: string
          id: string
          item_data: Json
          item_id: string
          player_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          item_data: Json
          item_id: string
          player_id: string
          quantity?: number
        }
        Update: {
          created_at?: string
          id?: string
          item_data?: Json
          item_id?: string
          player_id?: string
          quantity?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          attack: number
          avatar_url: string | null
          character_class: string
          character_image_url: string | null
          city: string | null
          created_at: string
          defense: number
          description: string | null
          dexterity: number
          endurance: number
          experience: number
          experience_to_next: number
          free_stat_points: number
          gold: number
          health: number
          id: string
          level: number
          luck: number
          magic: number
          mana: number
          max_health: number
          max_mana: number
          strength: number
          updated_at: string
          username: string
        }
        Insert: {
          attack?: number
          avatar_url?: string | null
          character_class?: string
          character_image_url?: string | null
          city?: string | null
          created_at?: string
          defense?: number
          description?: string | null
          dexterity?: number
          endurance?: number
          experience?: number
          experience_to_next?: number
          free_stat_points?: number
          gold?: number
          health?: number
          id: string
          level?: number
          luck?: number
          magic?: number
          mana?: number
          max_health?: number
          max_mana?: number
          strength?: number
          updated_at?: string
          username: string
        }
        Update: {
          attack?: number
          avatar_url?: string | null
          character_class?: string
          character_image_url?: string | null
          city?: string | null
          created_at?: string
          defense?: number
          description?: string | null
          dexterity?: number
          endurance?: number
          experience?: number
          experience_to_next?: number
          free_stat_points?: number
          gold?: number
          health?: number
          id?: string
          level?: number
          luck?: number
          magic?: number
          mana?: number
          max_health?: number
          max_mana?: number
          strength?: number
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          created_at: string
          id: string
          last_seen: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_seen?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_seen?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
