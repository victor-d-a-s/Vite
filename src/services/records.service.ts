import { supabase } from '../lib/supabase';

export interface MedicalRecord {
  id: string;
  patient_id: string;
  therapist_id: string;
  appointment_id?: string;
  record_date: string;
  chief_complaint?: string;
  history?: string;
  physical_exam?: string;
  diagnosis?: string;
  treatment_plan?: string;
  evolution?: string;
  attachments?: string[];
  created_at: string;
  updated_at: string;
  patient?: {
    full_name: string;
  };
  therapist?: {
    full_name: string;
  };
}

export interface CreateRecordData {
  patient_id: string;
  appointment_id?: string;
  record_date: string;
  chief_complaint?: string;
  history?: string;
  physical_exam?: string;
  diagnosis?: string;
  treatment_plan?: string;
  evolution?: string;
}

class RecordsService {
  async getByPatient(patientId: string): Promise<MedicalRecord[]> {
    if (!supabase) throw new Error('Supabase não disponível');

    const { data, error } = await supabase
      .from('medical_records')
      .select(`
        *,
        therapist:profiles(full_name)
      `)
      .eq('patient_id', patientId)
      .order('record_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getById(recordId: string): Promise<MedicalRecord | null> {
    if (!supabase) throw new Error('Supabase não disponível');

    const { data, error } = await supabase
      .from('medical_records')
      .select(`
        *,
        patient:patients(full_name, birth_date),
        therapist:profiles(full_name)
      `)
      .eq('id', recordId)
      .single();

    if (error) throw error;
    return data;
  }

  async create(therapistId: string, data: CreateRecordData): Promise<MedicalRecord> {
    if (!supabase) throw new Error('Supabase não disponível');

    const { data: record, error } = await supabase
      .from('medical_records')
      .insert({
        ...data,
        therapist_id: therapistId,
      })
      .select()
      .single();

    if (error) throw error;
    return record;
  }

  async update(recordId: string, data: Partial<CreateRecordData>): Promise<MedicalRecord> {
    if (!supabase) throw new Error('Supabase não disponível');

    const { data: record, error } = await supabase
      .from('medical_records')
      .update(data)
      .eq('id', recordId)
      .select()
      .single();

    if (error) throw error;
    return record;
  }

  async addAttachment(recordId: string, fileName: string): Promise<void> {
    if (!supabase) throw new Error('Supabase não disponível');

    const { data: record, error: fetchError } = await supabase
      .from('medical_records')
      .select('attachments')
      .eq('id', recordId)
      .single();

    if (fetchError) throw fetchError;

    const attachments = record.attachments || [];
    attachments.push(fileName);

    const { error } = await supabase
      .from('medical_records')
      .update({ attachments })
      .eq('id', recordId);

    if (error) throw error;
  }

  async getRecentRecords(clinicId: string, limit = 10): Promise<MedicalRecord[]> {
    if (!supabase) throw new Error('Supabase não disponível');

    const { data, error } = await supabase
      .from('medical_records')
      .select(`
        *,
        patient:patients(full_name),
        therapist:profiles(full_name)
      `)
      .eq('patient.clinic_id', clinicId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
}

export const recordsService = new RecordsService();