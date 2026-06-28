import type { AppointmentStatus } from '@/lib/supabase/database.types';
import type { Service } from '@/lib/supabase/database.types';

export type AdminAppointment = {
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
  service: Service;
};

export type AdminDashboardData = {
  stats: {
    todayCount: number;
    pendingCount: number;
    confirmedCount: number;
    upcomingCount: number;
  };
  todayAppointments: AdminAppointment[];
  upcomingAppointments: AdminAppointment[];
  pendingAppointments: AdminAppointment[];
};

export type UpdateAppointmentInput = {
  status?: AppointmentStatus;
  startTime?: string;
  date?: string;
};
