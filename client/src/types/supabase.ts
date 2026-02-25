// Database types for Supabase
// These match the schema we created in Supabase

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Categories that get logged to the database
export type LogCategory = 'strength' | 'run' | 'surf' | 'maint' | 'breath' | 'yoga';

// Extended categories for internal use (warmup/cooldown routines that don't get logged)
export type RoutineCategory = LogCategory | 'run_warmup' | 'run_cooldown' | 'surf_warmup' | 'surf_cooldown';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          created_at: string | null;
        };
        Insert: {
          id: string;
          name: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string | null;
        };
        Relationships: [];
      };
      logs: {
        Row: {
          id: number;
          user_id: string;
          category: LogCategory;
          date: string;
          metadata: Json | null;
          created_at: string | null;
        };
        Insert: {
          id?: number;
          user_id: string;
          category: LogCategory;
          date: string;
          metadata?: Json | null;
          created_at?: string | null;
        };
        Update: {
          id?: number;
          user_id?: string;
          category?: LogCategory;
          date?: string;
          metadata?: Json | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      user_progress: {
        Row: {
          user_id: string;
          streak_count: number;
          streak_week: string | null;
          gbc_unlocked_at: string | null;
          gold_unlocked_at: string | null;
          lightning_unlocked_at: string | null;
          total_mastery: number;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          user_id: string;
          streak_count?: number;
          streak_week?: string | null;
          gbc_unlocked_at?: string | null;
          gold_unlocked_at?: string | null;
          lightning_unlocked_at?: string | null;
          total_mastery?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          user_id?: string;
          streak_count?: number;
          streak_week?: string | null;
          gbc_unlocked_at?: string | null;
          gold_unlocked_at?: string | null;
          lightning_unlocked_at?: string | null;
          total_mastery?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      milestones: {
        Row: {
          id: number;
          user_id: string;
          achievement: string;
          week_id: string;
          created_at: string | null;
        };
        Insert: {
          id?: number;
          user_id: string;
          achievement: string;
          week_id: string;
          created_at?: string | null;
        };
        Update: {
          id?: number;
          user_id?: string;
          achievement?: string;
          week_id?: string;
          created_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Log = Database['public']['Tables']['logs']['Row'];
export type LogInsert = Database['public']['Tables']['logs']['Insert'];
export type UserProgress = Database['public']['Tables']['user_progress']['Row'];
export type UserProgressUpdate = Database['public']['Tables']['user_progress']['Update'];
export type Milestone = Database['public']['Tables']['milestones']['Row'];
export type MilestoneInsert = Database['public']['Tables']['milestones']['Insert'];

// Achievement types
export type Achievement = 'GBC_UNLOCK' | 'GOLD_UNLOCK' | 'LIGHTNING_UNLOCK' | 'GOLD_STATUS';
