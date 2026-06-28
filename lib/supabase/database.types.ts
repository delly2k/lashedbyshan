export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show';

export type AvailabilityOverrideType = 'available' | 'unavailable';

export type UserRole = 'admin';

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          id: string;
          service_id: string;
          customer_name: string;
          customer_phone: string;
          customer_instagram: string | null;
          notes: string | null;
          start_time: string;
          end_time: string;
          status: AppointmentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          service_id: string;
          customer_name: string;
          customer_phone: string;
          customer_instagram?: string | null;
          notes?: string | null;
          start_time: string;
          end_time: string;
          status?: AppointmentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          service_id?: string;
          customer_name?: string;
          customer_phone?: string;
          customer_instagram?: string | null;
          notes?: string | null;
          start_time?: string;
          end_time?: string;
          status?: AppointmentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'appointments_service_id_fkey';
            columns: ['service_id'];
            isOneToOne: false;
            referencedRelation: 'services';
            referencedColumns: ['id'];
          },
        ];
      };
      availability_overrides: {
        Row: {
          id: string;
          date: string;
          start_time: string;
          end_time: string;
          type: AvailabilityOverrideType;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          start_time: string;
          end_time: string;
          type: AvailabilityOverrideType;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          start_time?: string;
          end_time?: string;
          type?: AvailabilityOverrideType;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      availability_rules: {
        Row: {
          id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          name: string;
          description: string;
          price_jmd: number;
          duration_minutes: number;
          buffer_minutes: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          price_jmd: number;
          duration_minutes: number;
          buffer_minutes?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          price_jmd?: number;
          duration_minutes?: number;
          buffer_minutes?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      unavailable_blocks: {
        Row: {
          id: string;
          start_time: string;
          end_time: string;
          reason: string | null;
          is_recurring: boolean;
          recurrence_rule: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          start_time: string;
          end_time: string;
          reason?: string | null;
          is_recurring?: boolean;
          recurrence_rule?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          start_time?: string;
          end_time?: string;
          reason?: string | null;
          is_recurring?: boolean;
          recurrence_rule?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      appointment_status: AppointmentStatus;
      availability_override_type: AvailabilityOverrideType;
      user_role: UserRole;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type Service = Tables<'services'>;
export type Appointment = Tables<'appointments'>;
export type AvailabilityRule = Tables<'availability_rules'>;
export type AvailabilityOverride = Tables<'availability_overrides'>;
export type UnavailableBlock = Tables<'unavailable_blocks'>;
export type Profile = Tables<'profiles'>;

export type NewAppointmentRequest = Pick<
  TablesInsert<'appointments'>,
  | 'service_id'
  | 'customer_name'
  | 'customer_phone'
  | 'customer_instagram'
  | 'notes'
  | 'start_time'
  | 'end_time'
>;

/** Customer-safe unavailable block without admin-only reason field. */
export type PublicUnavailableBlock = Pick<
  UnavailableBlock,
  'id' | 'start_time' | 'end_time' | 'is_recurring'
>;
