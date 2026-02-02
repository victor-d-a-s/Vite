import { supabase } from '../lib/supabase';

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export interface Appointment {
  id: string;
  patient_id: string;
  therapist_id: string;
  clinic_id: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  service_type?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  patient?: {
    full_name: string;
    phone: string;
  };
  therapist?: {
    full_name: string;
  };
}

export interface CreateAppointmentData {
  patient_id: string;
  therapist_id: string;
  start_time: string;
  end_time: string;
  service_type?: string;
  notes?: string;
}

class AppointmentsService {
  async getByDateRange(
    clinicId: string,
    startDate: string,
    endDate: string
  ): Promise<Appointment[]> {
    if (!supabase) throw new Error('Supabase não disponível');

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:patients(full_name, phone),
        therapist:profiles(full_name)
      `)
      .eq('clinic_id', clinicId)
      .gte('start_time', startDate)
      .lte('start_time', endDate)
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getById(appointmentId: string): Promise<Appointment | null> {
    if (!supabase) throw new Error('Supabase não disponível');

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:patients(full_name, phone, email),
        therapist:profiles(full_name)
      `)
      .eq('id', appointmentId)
      .single();

    if (error) throw error;
    return data;
  }

  async getByPatient(patientId: string): Promise<Appointment[]> {
    if (!supabase) throw new Error('Supabase não disponível');

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        therapist:profiles(full_name)
      `)
      .eq('patient_id', patientId)
      .order('start_time', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async create(clinicId: string, data: CreateAppointmentData): Promise<Appointment> {
    if (!supabase) throw new Error('Supabase não disponível');

    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        ...data,
        clinic_id: clinicId,
        status: 'scheduled',
      })
      .select()
      .single();

    if (error) throw error;
    return appointment;
  }

  async update(appointmentId: string, data: Partial<CreateAppointmentData>): Promise<Appointment> {
    if (!supabase) throw new Error('Supabase não disponível');

    const { data: appointment, error } = await supabase
      .from('appointments')
      .update(data)
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) throw error;
    return appointment;
  }

  async updateStatus(appointmentId: string, status: AppointmentStatus): Promise<void> {
    if (!supabase) throw new Error('Supabase não disponível');

    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId);

    if (error) throw error;
  }

  async checkConflict(
    therapistId: string,
    startTime: string,
    endTime: string,
    excludeId?: string
  ): Promise<boolean> {
    if (!supabase) throw new Error('Supabase não disponível');

    let query = supabase
      .from('appointments')
      .select('id')
      .eq('therapist_id', therapistId)
      .neq('status', 'cancelled')
      .or(`and(start_time.lt.${endTime},end_time.gt.${startTime})`);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).length > 0;
  }
}

export const appointmentsService = new AppointmentsService();