// Shared TypeScript types for every DB entity the app talks to.
// Column names stay snake_case here to match the Postgres schema exactly.
// Conversion to camelCase (if ever desired) happens at the services/supabase.ts
// boundary when that file exists — not in this module.
//
// Source of truth for shapes: supabase/migrations/*_init_core_tables.sql.
// Keep these interfaces in lockstep with future migrations.

export type UserRole = 'consumer' | 'operator';
export type AppLanguage = 'en' | 'fr';
export type TruckPlan = 'free' | 'starter' | 'pro' | 'festival';
export type TruckScheduleStatus = 'scheduled' | 'live' | 'cancelled';

export interface Profile {
  id: string;
  roles: UserRole[];
  display_name: string | null;
  avatar_url: string | null;
  language: AppLanguage;
  created_at: string;
  updated_at: string;
}

export interface Truck {
  id: string;
  operator_id: string;
  name: string;
  cuisine_tags: string[];
  description: string | null;
  cover_url: string | null;
  plan: TruckPlan;
  is_active: boolean;
  catering_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface TruckSchedule {
  id: string;
  truck_id: string;
  /** ISO date (yyyy-MM-dd). */
  date: string;
  location_lat: number;
  location_lng: number;
  location_label: string;
  /** HH:mm:ss. */
  open_time: string;
  /** HH:mm:ss. */
  close_time: string;
  is_recurring: boolean;
  status: TruckScheduleStatus;
  created_at: string;
  updated_at: string;
}

export interface Follow {
  consumer_id: string;
  truck_id: string;
  notify_open: boolean;
  notify_location_change: boolean;
  notify_special: boolean;
  created_at: string;
}

// Minimal Database shape for `createClient<Database>()` in services/supabase.ts.
// Hand-crafted from the table shapes above; Insert makes columns with a DB
// default optional (id where gen_random_uuid() applies, created_at / updated_at,
// plan default 'free', is_active default true, etc.), Update is always Partial.
// A future ticket should replace this with `supabase gen types typescript`
// output so the file stays in lockstep with migrations automatically — until
// then, keep in sync by hand when schemas change.
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          roles: Profile['roles'];
          display_name?: string | null;
          avatar_url?: string | null;
          language?: AppLanguage;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Profile>;
        Relationships: [];
      };
      trucks: {
        Row: Truck;
        Insert: {
          id?: string;
          operator_id: string;
          name: string;
          cuisine_tags?: string[];
          description?: string | null;
          cover_url?: string | null;
          plan?: TruckPlan;
          is_active?: boolean;
          catering_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Truck>;
        Relationships: [];
      };
      truck_schedules: {
        Row: TruckSchedule;
        Insert: {
          id?: string;
          truck_id: string;
          date: string;
          location_lat: number;
          location_lng: number;
          location_label: string;
          open_time: string;
          close_time: string;
          is_recurring?: boolean;
          status?: TruckScheduleStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<TruckSchedule>;
        Relationships: [];
      };
      follows: {
        Row: Follow;
        Insert: {
          consumer_id: string;
          truck_id: string;
          notify_open?: boolean;
          notify_location_change?: boolean;
          notify_special?: boolean;
          created_at?: string;
        };
        Update: Partial<Follow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
