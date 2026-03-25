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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      body_measurements: {
        Row: {
          belly: number | null
          bicep_left: number | null
          bicep_right: number | null
          calf_left: number | null
          calf_right: number | null
          chest: number | null
          created_at: string
          date: string
          hips: number | null
          id: string
          thigh_left: number | null
          thigh_right: number | null
          user_id: string
          waist: number | null
          weight: number | null
        }
        Insert: {
          belly?: number | null
          bicep_left?: number | null
          bicep_right?: number | null
          calf_left?: number | null
          calf_right?: number | null
          chest?: number | null
          created_at?: string
          date?: string
          hips?: number | null
          id?: string
          thigh_left?: number | null
          thigh_right?: number | null
          user_id: string
          waist?: number | null
          weight?: number | null
        }
        Update: {
          belly?: number | null
          bicep_left?: number | null
          bicep_right?: number | null
          calf_left?: number | null
          calf_right?: number | null
          chest?: number | null
          created_at?: string
          date?: string
          hips?: number | null
          id?: string
          thigh_left?: number | null
          thigh_right?: number | null
          user_id?: string
          waist?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      meals: {
        Row: {
          calories: number
          carbs: number
          created_at: string
          date: string
          fat: number
          id: string
          meal_type: string
          product_id: string | null
          product_name: string
          protein: number
          quantity: number
          user_id: string
        }
        Insert: {
          calories?: number
          carbs?: number
          created_at?: string
          date?: string
          fat?: number
          id?: string
          meal_type: string
          product_id?: string | null
          product_name: string
          protein?: number
          quantity?: number
          user_id: string
        }
        Update: {
          calories?: number
          carbs?: number
          created_at?: string
          date?: string
          fat?: number
          id?: string
          meal_type?: string
          product_id?: string | null
          product_name?: string
          protein?: number
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meals_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_exercises: {
        Row: {
          created_at: string
          id: string
          name: string
          plan_id: string
          reps: number
          rest_time: number
          sets: number
          sort_order: number
          weight: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          plan_id: string
          reps?: number
          rest_time?: number
          sets?: number
          sort_order?: number
          weight?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          plan_id?: string
          reps?: number
          rest_time?: number
          sets?: number
          sort_order?: number
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "plan_exercises_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "training_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          calories: number
          carbs: number
          created_at: string
          fat: number
          id: string
          is_global: boolean
          name: string
          protein: number
          serving_size: string
          user_id: string | null
        }
        Insert: {
          barcode?: string | null
          calories?: number
          carbs?: number
          created_at?: string
          fat?: number
          id?: string
          is_global?: boolean
          name: string
          protein?: number
          serving_size?: string
          user_id?: string | null
        }
        Update: {
          barcode?: string | null
          calories?: number
          carbs?: number
          created_at?: string
          fat?: number
          id?: string
          is_global?: boolean
          name?: string
          protein?: number
          serving_size?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity_level: string
          birth_date: string | null
          calorie_target: number
          carbs_target: number
          created_at: string
          display_name: string | null
          fat_target: number
          goal_type: string
          height: number | null
          id: string
          initial_weight: number | null
          monthly_change: number | null
          protein_target: number
          target_weight: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_level?: string
          birth_date?: string | null
          calorie_target?: number
          carbs_target?: number
          created_at?: string
          display_name?: string | null
          fat_target?: number
          goal_type?: string
          height?: number | null
          id?: string
          initial_weight?: number | null
          monthly_change?: number | null
          protein_target?: number
          target_weight?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_level?: string
          birth_date?: string | null
          calorie_target?: number
          carbs_target?: number
          created_at?: string
          display_name?: string | null
          fat_target?: number
          goal_type?: string
          height?: number | null
          id?: string
          initial_weight?: number | null
          monthly_change?: number | null
          protein_target?: number
          target_weight?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scheduled_workouts: {
        Row: {
          created_at: string
          date: string
          id: string
          plan_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          plan_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          plan_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_workouts_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "training_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      training_plans: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_exercises: {
        Row: {
          created_at: string
          id: string
          name: string
          rest_time: number
          sort_order: number
          workout_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          rest_time?: number
          sort_order?: number
          workout_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          rest_time?: number
          sort_order?: number
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sets: {
        Row: {
          completed: boolean
          created_at: string
          exercise_id: string
          id: string
          reps: number
          sort_order: number
          weight: number
        }
        Insert: {
          completed?: boolean
          created_at?: string
          exercise_id: string
          id?: string
          reps?: number
          sort_order?: number
          weight?: number
        }
        Update: {
          completed?: boolean
          created_at?: string
          exercise_id?: string
          id?: string
          reps?: number
          sort_order?: number
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "workout_sets_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "workout_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          completed: boolean
          created_at: string
          date: string
          duration: number
          id: string
          name: string
          plan_id: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          date?: string
          duration?: number
          id?: string
          name: string
          plan_id?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          date?: string
          duration?: number
          id?: string
          name?: string
          plan_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workouts_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "training_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
