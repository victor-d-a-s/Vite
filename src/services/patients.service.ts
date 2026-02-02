import { supabase } from '../lib/supabase';

export interface Patient {
  id: string;
  full_name: string;
  cpf: string;
  birth_date: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  health_insurance?: string;
  insurance_number?: string;
  notes?: string;
  clinic_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface CreatePatientData {
  full_name: string;
  cpf: string;
  birth_date: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  health_insurance?: string;
  insurance_number?: string;
  notes?: string;
}

class PatientsService {
  async getAll(clinicId: string, activeOnly = true): Promise<Patient[]> {
    if (!supabase) throw new Error('Supabase não disponível');

    let query = supabase
      .from('patients')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('full_name', { ascending: true });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getById(patientId: string): Promise<Patient | null> {
    if (!supabase) throw new Error('Supabase não disponível');

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();

    if (error) throw error;
    return data;
  }

  async search(clinicId: string, searchTerm: string): Promise<Patient[]> {
    if (!supabase) throw new Error('Supabase não disponível');

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('is_active', true)
      .or(`full_name.ilike.%${searchTerm}%,cpf.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
      .order('full_name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async create(clinicId: string, userId: string, data: CreatePatientData): Promise<Patient> {
    if (!supabase) throw new Error('Supabase não disponível');

    const { data: patient, error } = await supabase
      .from('patients')
      .insert({
        ...data,
        clinic_id: clinicId,
        created_by: userId,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return patient;
  }

  async update(patientId: string, data: Partial<CreatePatientData>): Promise<Patient> {
    if (!supabase) throw new Error('Supabase não disponível');

    const { data: patient, error } = await supabase
      .from('patients')
      .update(data)
      .eq('id', patientId)
      .select()
      .single();

    if (error) throw error;
    return patient;
  }

  async deactivate(patientId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase não disponível');

    const { error } = await supabase
      .from('patients')
      .update({ is_active: false })
      .eq('id', patientId);

    if (error) throw error;
  }

  async checkCpfExists(cpf: string, excludeId?: string): Promise<boolean> {
    if (!supabase) throw new Error('Supabase não disponível');

    let query = supabase
      .from('patients')
      .select('id')
      .eq('cpf', cpf);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).length > 0;
  }
}

export const patientsService = new PatientsService();