import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { patientsService, type CreatePatientData, type Patient } from '../../services/patients.service';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

const PatientForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { profile, user } = useAuth();
  const isEditMode = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  const [errors, setErrors] = useState<Partial<Record<keyof CreatePatientData, string>>>({});
  const [formData, setFormData] = useState<CreatePatientData>({
    full_name: '',
    cpf: '',
    birth_date: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    emergency_contact: '',
    emergency_phone: '',
    health_insurance: '',
    insurance_number: '',
    notes: '',
  });

  useEffect(() => {
    if (isEditMode && id) {
      loadPatient(id);
    }
  }, [id, isEditMode]);

  const loadPatient = async (patientId: string) => {
    setIsFetching(true);
    try {
      const patient = await patientsService.getById(patientId);
      if (patient) {
        setFormData({
          full_name: patient.full_name,
          cpf: patient.cpf,
          birth_date: patient.birth_date,
          phone: patient.phone,
          email: patient.email || '',
          address: patient.address || '',
          city: patient.city || '',
          state: patient.state || '',
          zip_code: patient.zip_code || '',
          emergency_contact: patient.emergency_contact || '',
          emergency_phone: patient.emergency_phone || '',
          health_insurance: patient.health_insurance || '',
          insurance_number: patient.insurance_number || '',
          notes: patient.notes || '',
        });
      }
    } catch (error) {
      console.error('Erro ao carregar paciente:', error);
      alert('Erro ao carregar dados do paciente');
      navigate('/dashboard/patients');
    } finally {
      setIsFetching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof CreatePatientData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreatePatientData, string>> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Nome completo é obrigatório';
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (formData.cpf.replace(/\D/g, '').length !== 11) {
      newErrors.cpf = 'CPF inválido';
    }

    if (!formData.birth_date) {
      newErrors.birth_date = 'Data de nascimento é obrigatória';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
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
      if (isEditMode && id) {
        await patientsService.update(id, formData);
        alert('Paciente atualizado com sucesso!');
      } else {
        const cpfExists = await patientsService.checkCpfExists(formData.cpf);
        if (cpfExists) {
          setErrors({ cpf: 'CPF já cadastrado' });
          setIsLoading(false);
          return;
        }

        await patientsService.create(profile.clinic_id, user.id, formData);
        alert('Paciente cadastrado com sucesso!');
      }
      navigate('/dashboard/patients');
    } catch (error) {
      console.error('Erro ao salvar paciente:', error);
      alert('Erro ao salvar paciente. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard/patients')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {isEditMode ? 'Editar Paciente' : 'Novo Paciente'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditMode ? 'Atualize os dados do paciente' : 'Preencha os dados do novo paciente'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Dados Pessoais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Nome Completo"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                error={errors.full_name}
                required
                placeholder="Ex: João Silva Santos"
              />
            </div>

            <Input
              label="CPF"
              name="cpf"
              value={formData.cpf}
              onChange={handleInputChange}
              error={errors.cpf}
              required
              placeholder="000.000.000-00"
            />

            <Input
              label="Data de Nascimento"
              name="birth_date"
              type="date"
              value={formData.birth_date}
              onChange={handleInputChange}
              error={errors.birth_date}
              required
            />

            <Input
              label="Telefone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              error={errors.phone}
              required
              placeholder="(11) 98765-4321"
            />

            <Input
              label="E-mail"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="email@exemplo.com"
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Endereço</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Endereço"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Rua, número, complemento"
              />
            </div>

            <Input
              label="Cidade"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="São Paulo"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Estado"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="SP"
                maxLength={2}
              />

              <Input
                label="CEP"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleInputChange}
                placeholder="00000-000"
              />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Contato de Emergência</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome do Contato"
              name="emergency_contact"
              value={formData.emergency_contact}
              onChange={handleInputChange}
              placeholder="Nome completo"
            />

            <Input
              label="Telefone do Contato"
              name="emergency_phone"
              type="tel"
              value={formData.emergency_phone}
              onChange={handleInputChange}
              placeholder="(11) 98765-4321"
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Convênio</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome do Convênio"
              name="health_insurance"
              value={formData.health_insurance}
              onChange={handleInputChange}
              placeholder="Ex: Unimed, SulAmérica (deixe vazio se for particular)"
            />

            <Input
              label="Número da Carteirinha"
              name="insurance_number"
              value={formData.insurance_number}
              onChange={handleInputChange}
              placeholder="Número do convênio"
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Observações</h2>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={4}
            placeholder="Anotações gerais sobre o paciente..."
            className="w-full px-4 py-3 text-base rounded-lg border-2 border-gray-300 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-colors resize-none"
          />
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard/patients')}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
          >
            {isEditMode ? 'Atualizar Paciente' : 'Cadastrar Paciente'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;