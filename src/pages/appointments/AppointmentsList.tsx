import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { appointmentsService, type Appointment } from '../../services/appointments.service';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const AppointmentsList: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadAppointments();
  }, [selectedDate, profile]);

  const loadAppointments = async () => {
    if (!profile?.clinic_id) return;

    setIsLoading(true);
    try {
      const startDate = `${selectedDate}T00:00:00`;
      const endDate = `${selectedDate}T23:59:59`;
      const data = await appointmentsService.getByDateRange(profile.clinic_id, startDate, endDate);
      setAppointments(data);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'success' | 'warning' | 'error' | 'info'; label: string }> = {
      scheduled: { variant: 'info', label: 'Agendado' },
      confirmed: { variant: 'success', label: 'Confirmado' },
      in_progress: { variant: 'warning', label: 'Em Andamento' },
      completed: { variant: 'success', label: 'Concluído' },
      cancelled: { variant: 'error', label: 'Cancelado' },
      no_show: { variant: 'warning', label: 'Faltou' },
    };
    const config = statusMap[status] || { variant: 'info' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-600">Carregando agendamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Agenda</h1>
          <p className="text-gray-600 mt-1">Gerencie seus agendamentos</p>
        </div>
        <Button onClick={() => navigate('/dashboard/schedule/new')} size="lg">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Novo Agendamento
        </Button>
      </div>

      <Card>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecionar Data
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full sm:w-auto h-12 px-4 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-200"
          />
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Nenhum agendamento para esta data
            </h3>
            <p className="text-gray-600 mb-6">
              Crie um novo agendamento ou selecione outra data
            </p>
            <Button onClick={() => navigate('/dashboard/schedule/new')}>
              Criar Agendamento
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
                onClick={() => navigate(`/dashboard/schedule/${apt.id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-lg text-gray-800">
                        {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                      </span>
                      {getStatusBadge(apt.status)}
                    </div>
                    <p className="font-medium text-gray-800">
                      {apt.patient?.full_name || 'Paciente não informado'}
                    </p>
                    {apt.service_type && (
                      <p className="text-sm text-gray-600 mt-1">{apt.service_type}</p>
                    )}
                    {apt.notes && (
                      <p className="text-sm text-gray-500 mt-2">{apt.notes}</p>
                    )}
                  </div>
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AppointmentsList;