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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      events: {
        Row: {
          created_at: string
          description: string | null
          event_date: string
          id: string
          image_url: string | null
          registration_url: string | null
          title: string
          venue: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date?: string
          id?: string
          image_url?: string | null
          registration_url?: string | null
          title: string
          venue?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string
          id?: string
          image_url?: string | null
          registration_url?: string | null
          title?: string
          venue?: string | null
        }
        Relationships: []
      }
      fees: {
        Row: {
          amount: number
          created_at: string
          due_date: string | null
          id: string
          paid_at: string | null
          status: Database["public"]["Enums"]["fee_status"]
          title: string
          transaction_ref: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          due_date?: string | null
          id?: string
          paid_at?: string | null
          status?: Database["public"]["Enums"]["fee_status"]
          title?: string
          transaction_ref?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string | null
          id?: string
          paid_at?: string | null
          status?: Database["public"]["Enums"]["fee_status"]
          title?: string
          transaction_ref?: string | null
          user_id?: string
        }
        Relationships: []
      }
      gallery: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string
          title: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          title: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          title?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          apply_url: string | null
          company: string | null
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          job_type: string | null
          location: string | null
          title: string
        }
        Insert: {
          apply_url?: string | null
          company?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          job_type?: string | null
          location?: string | null
          title: string
        }
        Update: {
          apply_url?: string | null
          company?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          job_type?: string | null
          location?: string | null
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          blood_group: string | null
          certificate_issued_at: string | null
          certificate_no: string | null
          created_at: string
          date_of_birth: string | null
          department: string | null
          designation: string | null
          email: string
          employee_code: string | null
          full_name: string
          grade: string | null
          id: string
          is_paid: boolean
          line_of_business: string | null
          location: string | null
          mobile_no: string | null
          organization: string | null
          photo_url: string | null
          reporting_manager_code: string | null
          status: Database["public"]["Enums"]["membership_status"]
          updated_at: string
        }
        Insert: {
          blood_group?: string | null
          certificate_issued_at?: string | null
          certificate_no?: string | null
          created_at?: string
          date_of_birth?: string | null
          department?: string | null
          designation?: string | null
          email?: string
          employee_code?: string | null
          full_name?: string
          grade?: string | null
          id: string
          is_paid?: boolean
          line_of_business?: string | null
          location?: string | null
          mobile_no?: string | null
          organization?: string | null
          photo_url?: string | null
          reporting_manager_code?: string | null
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
        }
        Update: {
          blood_group?: string | null
          certificate_issued_at?: string | null
          certificate_no?: string | null
          created_at?: string
          date_of_birth?: string | null
          department?: string | null
          designation?: string | null
          email?: string
          employee_code?: string | null
          full_name?: string
          grade?: string | null
          id?: string
          is_paid?: boolean
          line_of_business?: string | null
          location?: string | null
          mobile_no?: string | null
          organization?: string | null
          photo_url?: string | null
          reporting_manager_code?: string | null
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
        }
        Relationships: []
      }
      quiz_locks: {
        Row: {
          locked_at: string
          question_id: string | null
          user_id: string
          wrong_count: number
        }
        Insert: {
          locked_at?: string
          question_id?: string | null
          user_id: string
          wrong_count?: number
        }
        Update: {
          locked_at?: string
          question_id?: string | null
          user_id?: string
          wrong_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_locks_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          answer_index: number
          created_at: string
          explanation: string | null
          id: string
          options: string[]
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer_index?: number
          created_at?: string
          explanation?: string | null
          id?: string
          options: string[]
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer_index?: number
          created_at?: string
          explanation?: string | null
          id?: string
          options?: string[]
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      training_logs: {
        Row: {
          created_at: string
          description: string | null
          duration_hours: number | null
          id: string
          location: string | null
          resource_url: string | null
          title: string
          trainer: string | null
          training_date: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          id?: string
          location?: string | null
          resource_url?: string | null
          title: string
          trainer?: string | null
          training_date?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          id?: string
          location?: string | null
          resource_url?: string | null
          title?: string
          trainer?: string | null
          training_date?: string
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
          role: Database["public"]["Enums"]["app_role"]
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
      is_paid_member: { Args: { _user_id: string }; Returns: boolean }
      lock_my_quiz: { Args: { _question_id: string }; Returns: undefined }
      reset_quiz_lock: { Args: { _user_id: string }; Returns: undefined }
      submit_fee_payment: {
        Args: { _fee_id: string; _ref: string }
        Returns: undefined
      }
      todays_birthdays: {
        Args: never
        Returns: {
          designation: string
          full_name: string
          organization: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "member"
      fee_status: "unpaid" | "pending_verification" | "paid"
      membership_status: "pending" | "active" | "rejected"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "member"],
      fee_status: ["unpaid", "pending_verification", "paid"],
      membership_status: ["pending", "active", "rejected"],
    },
  },
} as const
