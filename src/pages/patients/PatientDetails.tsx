import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { patientsService, type Patient } from '../../services/patients.service';
import { appointmentsService, type Appointment } from '../../services/appointments.service';
import { recordsService, type MedicalRecord } from '../../services/records.service';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const PatientDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'appointments' | 'records'>('info');

  useEffect(() => {
    if (id) {
      loadPatientData(id);
    }
  }, [id]);

  const loadPatientData = async (patientId: string) => {
    setIsLoading(true);
    try {
      const [patientData, appointmentsData, recordsData] = await Promise.all([
        patientsService.getById(patientId),
        appointmentsService.getByPatient(patientId),
        recordsService.getByPatient(patientId),
      ]);

      setPatient(patientData);
      setAppointments(appointmentsData);
      setRecords(recordsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados do paciente');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'success' | 'warning' | 'error' | 'info'; label: string }> = {
      scheduled: { variant: 'info', label: 'Agendado' },
      confirmed: { variant: 'success', label: 'Confirmado' },
      completed: { variant: 'success', label: 'Concluído' },
      cancelled: { variant: 'error', label: 'Cancelado' },
      no_show: { variant: 'warning', label: 'Faltou' },
    };

    const config = statusMap[status] || { variant: 'info' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Paciente não encontrado</p>
        <Button onClick={() => navigate('/dashboard/patients')} className="mt-4">
          Voltar para Pacientes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard/patients')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{patient.full_name}</h1>
            <p className="text-gray-600">{calculateAge(patient.birth_date)} anos • CPF: {patient.cpf}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/dashboard/patients/${id}/edit`)}>
            Editar
          </Button>
          <Button onClick={() => navigate(`/dashboard/appointments/new?patient=${id}`)}>
            Agendar Consulta
          </Button>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          {[
            { id: 'info', label: 'Informações' },
            { id: 'appointments', label: 'Consultas' },
            { id: 'records', label: 'Prontuários' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Contato</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Telefone</p>
                <p className="text-gray-800">{patient.phone}</p>
              </div>
              {patient.email && (
                <div>
                  <p className="text-sm text-gray-600">E-mail</p>
                  <p className="text-gray-800">{patient.email}</p>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Endereço</h3>
            <div className="space-y-3">
              {patient.address && (
                <div>
                  <p className="text-sm text-gray-600">Rua</p>
                  <p className="text-gray-800">{patient.address}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {patient.city && (
                  <div>
                    <p className="text-sm text-gray-600">Cidade</p>
                    <p className="text-gray-800">{patient.city}</p>
                  </div>
                )}
                {patient.state && (
                  <div>
                    <p className="text-sm text-gray-600">Estado</p>
                    <p className="text-gray-800">{patient.state}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Emergência</h3>
            <div className="space-y-3">
              {patient.emergency_contact && (
                <div>
                  <p className="text-sm text-gray-600">Contato</p>
                  <p className="text-gray-800">{patient.emergency_contact}</p>
                </div>
              )}
              {patient.emergency_phone && (
                <div>
                  <p className="text-sm text-gray-600">Telefone</p>
                  <p className="text-gray-800">{patient.emergency_phone}</p>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Convênio</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Plano</p>
                <p className="text-gray-800">{patient.health_insurance || 'Particular'}</p>
              </div>
              {patient.insurance_number && (
                <div>
                  <p className="text-sm text-gray-600">Número</p>
                  <p className="text-gray-800">{patient.insurance_number}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'appointments' && (
        <Card>
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Nenhuma consulta agendada</p>
              <Button onClick={() => navigate(`/dashboard/appointments/new?patient=${id}`)}>
                Agendar Primeira Consulta
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div key={apt.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{formatDateTime(apt.start_time)}</p>
                      <p className="text-sm text-gray-600 mt-1">{apt.service_type || 'Consulta'}</p>
                      {apt.notes && <p className="text-sm text-gray-500 mt-2">{apt.notes}</p>}
                    </div>
                    <div>{getStatusBadge(apt.status)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'records' && (
        <Card>
          {records.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Nenhum prontuário registrado</p>
              <Button onClick={() => navigate(`/dashboard/records/new?patient=${id}`)}>
                Criar Primeiro Prontuário
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/dashboard/records/${record.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{formatDate(record.record_date)}</p>
                      {record.chief_complaint && (
                        <p className="text-sm text-gray-600 mt-1">{record.chief_complaint}</p>
                      )}
                      {record.diagnosis && (
                        <p className="text-sm text-gray-500 mt-1">Diagnóstico: {record.diagnosis}</p>
                      )}
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default PatientDetails;