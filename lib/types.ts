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

// DB-entity shapes use `type` rather than `interface` so they cleanly
// extend Supabase's `Record<string, unknown>` constraint on
// GenericTable.Row / Insert / Update. CLI-generated types follow the
// same convention; swapping to interfaces breaks `.from('x').select(…)`
// inference (rows resolve to `never`). CLAUDE.md's "always interface"
// rule applies to React component props, not DB entities.
export type Profile = {
  id: string;
  roles: UserRole[];
  display_name: string | null;
  avatar_url: string | null;
  language: AppLanguage;
  created_at: string;
  updated_at: string;
};

export type Truck = {
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
};

export type TruckSchedule = {
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
};

export type Follow = {
  consumer_id: string;
  truck_id: string;
  notify_open: boolean;
  notify_location_change: boolean;
  notify_special: boolean;
  created_at: string;
};

// Derived shape for the consumer map / list surfaces. The useTrucks
// hook (TT-35) joins trucks with today's truck_schedules row (or null
// if the truck has no schedule today). Open/closed is NOT cached here —
// callers compute it at render via deriveIsOpen(schedule) from
// lib/schedule.ts so a pin flips state the moment the wall clock
// crosses close_time, not on the next refetch.
export type TruckWithSchedule = Truck & {
  schedule: TruckSchedule | null;
};

// Lat/lng pair used by distance helpers (lib/utils.ts) and the
// locationStore (TT-36). Matches the Mapbox/Geo convention of lat
// before lng in object form.
export interface Coord {
  lat: number;
  lng: number;
}

// Minimal Database shape for `createClient<Database>()` in services/supabase.ts.
// Hand-crafted from the table shapes above; Insert makes columns with a DB
// default optional (id where gen_random_uuid() applies, created_at / updated_at,
// plan default 'free', is_active default true, etc.), Update is always Partial.
// A future ticket should replace this with `supabase gen types typescript`
// output so the file stays in lockstep with migrations automatically — until
// then, keep in sync by hand when schemas change.
export type Database = {
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
    // Supabase CLI-generated types use `{ [_ in never]: never }` for
    // empty namespaces rather than `Record<string, never>`. The two are
    // NOT equivalent for supabase-js's table-inference — Record forces
    // every key to map to `never` (which the type checker folds into
    // `never` for the schema), while `[_ in never]` is a genuinely empty
    // object type. Using the CLI pattern so `.from('profiles').select(…)`
    // resolves to the row type instead of `never`.
    Views: { [_ in never]: never };
    Functions: {
      profiles_add_role: {
        Args: { p_user_id: string; p_role: UserRole };
        Returns: void;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
