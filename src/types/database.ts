/**
 * Supabase数据库类型定义
 * 由Supabase自动生成或手动维护
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      mag_users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'operator' | 'engineer' | 'admin'
          avatar_url: string | null
          phone: string | null
          is_active: boolean
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          role: 'operator' | 'engineer' | 'admin'
          avatar_url?: string | null
          phone?: string | null
          is_active?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'operator' | 'engineer' | 'admin'
          avatar_url?: string | null
          phone?: string | null
          is_active?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      mag_workpieces: {
        Row: {
          id: string
          workpiece_no: string
          material: string
          dimensions: Json
          standard: string | null
          description: string | null
          image_url: string | null
          status: 'pending' | 'in_progress' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workpiece_no: string
          material: string
          dimensions: Json
          standard?: string | null
          description?: string | null
          image_url?: string | null
          status?: 'pending' | 'in_progress' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workpiece_no?: string
          material?: string
          dimensions?: Json
          standard?: string | null
          description?: string | null
          image_url?: string | null
          status?: 'pending' | 'in_progress' | 'completed'
          created_at?: string
          updated_at?: string
        }
      }
      mag_detection_records: {
        Row: {
          id: string
          workpiece_id: string
          operator_id: string
          detection_date: string
          parameters: Json
          probe1_data: Json | null
          probe2_data: Json | null
          probe3_data: Json | null
          defects: Json | null
          conclusion: string | null
          report_url: string | null
          status: 'draft' | 'completed' | 'approved'
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workpiece_id: string
          operator_id: string
          detection_date?: string
          parameters: Json
          probe1_data?: Json | null
          probe2_data?: Json | null
          probe3_data?: Json | null
          defects?: Json | null
          conclusion?: string | null
          report_url?: string | null
          status?: 'draft' | 'completed' | 'approved'
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workpiece_id?: string
          operator_id?: string
          detection_date?: string
          parameters?: Json
          probe1_data?: Json | null
          probe2_data?: Json | null
          probe3_data?: Json | null
          defects?: Json | null
          conclusion?: string | null
          report_url?: string | null
          status?: 'draft' | 'completed' | 'approved'
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      mag_parameter_templates: {
        Row: {
          id: string
          template_name: string
          material_type: string
          standard: string | null
          parameters: Json
          is_default: boolean
          is_public: boolean
          created_by: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          template_name: string
          material_type: string
          standard?: string | null
          parameters: Json
          is_default?: boolean
          is_public?: boolean
          created_by?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          template_name?: string
          material_type?: string
          standard?: string | null
          parameters?: Json
          is_default?: boolean
          is_public?: boolean
          created_by?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      mag_defect_images: {
        Row: {
          id: string
          record_id: string
          defect_id: string
          image_url: string
          thumbnail_url: string | null
          description: string | null
          position: Json | null
          annotations: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          record_id: string
          defect_id: string
          image_url: string
          thumbnail_url?: string | null
          description?: string | null
          position?: Json | null
          annotations?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          record_id?: string
          defect_id?: string
          image_url?: string
          thumbnail_url?: string | null
          description?: string | null
          position?: Json | null
          annotations?: Json | null
          created_at?: string
        }
      }
      mag_system_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource_type: string | null
          resource_id: string | null
          details: Json | null
          ip_address: string | null
          user_agent: string | null
          status: 'success' | 'failure' | null
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          resource_type?: string | null
          resource_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          status?: 'success' | 'failure' | null
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          resource_type?: string | null
          resource_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          status?: 'success' | 'failure' | null
          error_message?: string | null
          created_at?: string
        }
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
