export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      fragment_comments: {
        Row: {
          created_at: string
          fragment_id: string
          id: string
          text: string
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string
          fragment_id: string
          id?: string
          text: string
          user_id: string
          user_name: string
        }
        Update: {
          created_at?: string
          fragment_id?: string
          id?: string
          text?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "fragment_comments_fragment_id_fkey"
            columns: ["fragment_id"]
            isOneToOne: false
            referencedRelation: "fragments"
            referencedColumns: ["id"]
          },
        ]
      }
      fragment_likes: {
        Row: {
          created_at: string
          fragment_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          fragment_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          fragment_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fragment_likes_fragment_id_fkey"
            columns: ["fragment_id"]
            isOneToOne: false
            referencedRelation: "fragments"
            referencedColumns: ["id"]
          },
        ]
      }
      fragment_pads: {
        Row: {
          column_position: number
          fragment_id: string
          id: string
          is_active: boolean
          row_position: number
          sound_id: string | null
        }
        Insert: {
          column_position: number
          fragment_id: string
          id?: string
          is_active?: boolean
          row_position: number
          sound_id?: string | null
        }
        Update: {
          column_position?: number
          fragment_id?: string
          id?: string
          is_active?: boolean
          row_position?: number
          sound_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fragment_pads_fragment_id_fkey"
            columns: ["fragment_id"]
            isOneToOne: false
            referencedRelation: "fragments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fragment_pads_sound_id_fkey"
            columns: ["sound_id"]
            isOneToOne: false
            referencedRelation: "sounds"
            referencedColumns: ["id"]
          },
        ]
      }
      fragments: {
        Row: {
          author_id: string
          author_name: string
          bpm: number
          columns: number
          created_at: string
          id: string
          original_author_name: string | null
          original_fragment_id: string | null
          rows: number
          title: string | null
          updated_at: string
          view_count: number
        }
        Insert: {
          author_id: string
          author_name: string
          bpm?: number
          columns?: number
          created_at?: string
          id?: string
          original_author_name?: string | null
          original_fragment_id?: string | null
          rows?: number
          title?: string | null
          updated_at?: string
          view_count?: number
        }
        Update: {
          author_id?: string
          author_name?: string
          bpm?: number
          columns?: number
          created_at?: string
          id?: string
          original_author_name?: string | null
          original_fragment_id?: string | null
          rows?: number
          title?: string | null
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "fragments_original_fragment_id_fkey"
            columns: ["original_fragment_id"]
            isOneToOne: false
            referencedRelation: "fragments"
            referencedColumns: ["id"]
          },
        ]
      }
      sounds: {
        Row: {
          created_at: string
          id: string
          is_public: boolean
          name: string
          source_type: Database["public"]["Enums"]["sound_source_type"]
          source_url: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean
          name: string
          source_type: Database["public"]["Enums"]["sound_source_type"]
          source_url: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean
          name?: string
          source_type?: Database["public"]["Enums"]["sound_source_type"]
          source_url?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_fragment_with_pads: {
        Args: {
          author_id: string
          author_name: string
          title: string
          rows: number
          columns: number
          bpm: number
          original_fragment_id: string
          original_author_name: string
          pads: Json
        }
        Returns: string
      }
    }
    Enums: {
      sound_source_type: "predefined" | "recorded" | "uploaded"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      sound_source_type: ["predefined", "recorded", "uploaded"],
    },
  },
} as const
