import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { appointmentsService, type CreateAppointmentData } from '../../services/appointments.service';
import { patientsService, type Patient } from '../../services/patients.service';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

const AppointmentForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile, user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateAppointmentData, string>>>({});
  
  const preselectedPatient = searchParams.get('patient');

  const [formData, setFormData] = useState<CreateAppointmentData>({
    patient_id: preselectedPatient || '',
    therapist_id: user?.id || '',
    start_time: '',
    end_time: '',
    service_type: '',
    notes: '',
  });

  useEffect(() => {
    loadPatients();
  }, [profile]);

  const loadPatients = async () => {
    if (!profile?.clinic_id) return;
    try {
      const data = await patientsService.getAll(profile.clinic_id);
      setPatients(data);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof CreateAppointmentData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const calculateEndTime = (startTime: string, durationMinutes: number = 60) => {
    if (!startTime) return '';
    const start = new Date(startTime);
    start.setMinutes(start.getMinutes() + durationMinutes);
    return start.toISOString().slice(0, 16);
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startTime = e.target.value;
    setFormData((prev) => ({
      ...prev,
      start_time: startTime,
      end_time: calculateEndTime(startTime),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateAppointmentData, string>> = {};

    if (!formData.patient_id) {
      newErrors.patient_id = 'Selecione um paciente';
    }

    if (!formData.start_time) {
      newErrors.start_time = 'Data e hora são obrigatórias';
    }

    if (!formData.end_time) {
      newErrors.end_time = 'Hora de término é obrigatória';
    }

    if (formData.start_time && formData.end_time) {
      if (new Date(formData.end_time) <= new Date(formData.start_time)) {
        newErrors.end_time = 'Hora de término deve ser após o início';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !profile?.clinic_id || !user?.id) {
      return;
    }

    setIsLoading(true);

    try {
      const hasConflict = await appointmentsService.checkConflict(
        user.id,
        formData.start_time,
        formData.end_time
      );

      if (hasConflict) {
        alert('Você já tem um agendamento neste horário!');
        setIsLoading(false);
        return;
      }

      await appointmentsService.create(profile.clinic_id, {
        ...formData,
        therapist_id: user.id,
      });

      alert('Agendamento criado com sucesso!');
      navigate('/dashboard/schedule');
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      alert('Erro ao criar agendamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/dashboard/schedule')}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Novo Agendamento</h1>
          <p className="text-gray-600 mt-1">Agende uma nova consulta</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Informações do Agendamento</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paciente <span className="text-red-500">*</span>
              </label>
              <select
                name="patient_id"
                value={formData.patient_id}
                onChange={handleInputChange}
                className="w-full h-12 px-4 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-200"
              >
                <option value="">Selecione um paciente</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.full_name}
                  </option>
                ))}
              </select>
              {errors.patient_id && (
                <p className="mt-2 text-sm text-red-600">{errors.patient_id}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Data e Hora de Início"
                name="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={handleStartTimeChange}
                error={errors.start_time}
                required
              />

              <Input
                label="Data e Hora de Término"
                name="end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={handleInputChange}
                error={errors.end_time}
                required
              />
            </div>

            <Input
              label="Tipo de Serviço"
              name="service_type"
              value={formData.service_type}
              onChange={handleInputChange}
              placeholder="Ex: Fisioterapia Ortopédica, RPG, etc."
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                placeholder="Informações adicionais sobre a consulta..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-200 resize-none"
              />
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard/schedule')}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Criar Agendamento
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;
