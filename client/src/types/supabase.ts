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
export type LogCategory = 'strength' | 'run' | 'surf' | 'maint' | 'breath';

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
