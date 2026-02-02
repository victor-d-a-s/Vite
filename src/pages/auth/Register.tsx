import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { getSupabaseStatus, supabase } from '../../lib/supabase';

type AccountType = 'autonomous' | 'clinic';

interface FormData {
  // Dados Pessoais
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  
  // Dados Profissionais
  crefito: string;
  
  // Dados da Clínica (condicional)
  clinicName?: string;
  clinicCnpj?: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState<AccountType>('autonomous');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    crefito: '',
    clinicName: '',
    clinicCnpj: '',
  });

  // Verifica status do Supabase
  const supabaseStatus = getSupabaseStatus();

  // Handler de mudança de tipo de conta
  const handleAccountTypeChange = (type: AccountType) => {
    setAccountType(type);
    setErrors({});
  };

  // Handler genérico de inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpa erro do campo ao digitar
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // Validações básicas
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nome completo é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    if (!formData.crefito.trim()) {
      newErrors.crefito = 'CREFITO é obrigatório';
    }

    // Validações específicas para clínica
    if (accountType === 'clinic') {
      if (!formData.clinicName?.trim()) {
        newErrors.clinicName = 'Nome da clínica é obrigatório';
      }
      if (!formData.clinicCnpj?.trim()) {
        newErrors.clinicCnpj = 'CNPJ é obrigatório';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submissão do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // 🔍 DEBUG
      console.log('🔍 Iniciando cadastro...');
      console.log('Supabase disponível?', !!supabase);
      
      // Verifica se Supabase está disponível
      if (!supabase) {
        throw new Error('Serviço de cadastro indisponível. Verifique se as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão configuradas no arquivo .env');
      }

      console.log('📧 Criando usuário com email:', formData.email);

      // 1. Criar usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            crefito: formData.crefito,
            account_type: accountType,
          },
        },
      });

      if (authError) {
        console.error('❌ Erro no Auth:', authError);
        throw authError;
      }
      
      console.log('✅ Usuário criado no Auth:', authData.user?.id);

      const userId = authData.user?.id;
      if (!userId) throw new Error('Erro ao criar usuário');

      console.log('👤 User ID:', userId);

      // 2. Criar clínica (para ambos os tipos)
      let clinicId: string | null = null;
      
      if (accountType === 'clinic') {
        // Clínica: usar dados do formulário
        console.log('🏥 Criando clínica com dados do formulário...');
        const { data: clinicData, error: clinicError } = await supabase
          .from('clinics')
          .insert({
            name: formData.clinicName!,
            cnpj: formData.clinicCnpj!,
            owner_id: userId,
          })
          .select()
          .single();

        if (clinicError) {
          console.error('❌ Erro ao criar clínica:', clinicError);
          throw clinicError;
        }
        clinicId = clinicData.id;
        console.log('✅ Clínica criada:', clinicId);
      } else {
        // Autônomo: criar clínica pessoal automaticamente
        console.log('👤 Criando clínica pessoal para autônomo...');
        const { data: clinicData, error: clinicError } = await supabase
          .from('clinics')
          .insert({
            name: `Clínica ${formData.fullName}`,
            owner_id: userId,
          })
          .select()
          .single();

        if (clinicError) {
          console.error('❌ Erro ao criar clínica pessoal:', clinicError);
          throw clinicError;
        }
        clinicId = clinicData.id;
        console.log('✅ Clínica pessoal criada:', clinicId);
      }

      // 3. Criar perfil do usuário
      console.log('👤 Criando perfil...');
      const { error: profileError } = await supabase.from('profiles').insert({
        id: userId,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        crefito: formData.crefito,
        role: accountType === 'autonomous' ? 'therapist' : 'owner',
        clinic_id: clinicId,
      });

      if (profileError) {
        console.error('❌ Erro ao criar perfil:', profileError);
        throw profileError;
      }
      
      console.log('✅ Perfil criado com sucesso!');

      // Sucesso! Redirecionar para login ou dashboard
      alert('Cadastro realizado com sucesso! Verifique seu e-mail.');
      navigate('/login');
    } catch (error) {
      console.error('❌ Erro no cadastro:', error);
      
      let errorMessage = 'Erro ao realizar cadastro. ';
      
      if (error instanceof Error) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Tente novamente.';
      }
      
      // Mostra erro detalhado no console
      console.log('📋 Detalhes do erro:', JSON.stringify(error, null, 2));
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback se Supabase não estiver configurado
  if (!supabaseStatus.isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <div className="text-center">
            <svg
              className="w-16 h-16 text-red-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Configuração Pendente
            </h2>
            <p className="text-gray-600 mb-6">{supabaseStatus.error}</p>
            <Button onClick={() => navigate('/')} fullWidth>
              Voltar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Bem-vindo ao PhysioFlow
          </h1>
          <p className="text-gray-600">
            Crie sua conta e comece a gerenciar sua prática
          </p>
        </div>

        <Card>
          {/* Toggle de Tipo de Conta */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Tipo de Conta
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleAccountTypeChange('autonomous')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  accountType === 'autonomous'
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <svg
                    className={`w-8 h-8 ${
                      accountType === 'autonomous' ? 'text-blue-600' : 'text-gray-400'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="font-medium text-gray-800">Sou Autônomo</span>
                  <span className="text-xs text-gray-500 text-center">
                    Atendo em consultório próprio ou home care
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleAccountTypeChange('clinic')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  accountType === 'clinic'
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <svg
                    className={`w-8 h-8 ${
                      accountType === 'clinic' ? 'text-blue-600' : 'text-gray-400'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <span className="font-medium text-gray-800">Sou Clínica</span>
                  <span className="text-xs text-gray-500 text-center">
                    Gerencio uma clínica com equipe
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados Pessoais */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Dados Pessoais
              </h3>
              <div className="space-y-4">
                <Input
                  label="Nome Completo"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  error={errors.fullName}
                  required
                  placeholder="Ex: João Silva Santos"
                />

                <Input
                  label="E-mail"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                  required
                  placeholder="seu@email.com"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    label="CREFITO"
                    name="crefito"
                    value={formData.crefito}
                    onChange={handleInputChange}
                    error={errors.crefito}
                    required
                    placeholder="123456-F"
                  />
                </div>
              </div>
            </div>

            {/* Dados da Clínica (Condicional) */}
            {accountType === 'clinic' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Dados da Clínica
                </h3>
                <div className="space-y-4">
                  <Input
                    label="Nome da Clínica"
                    name="clinicName"
                    value={formData.clinicName}
                    onChange={handleInputChange}
                    error={errors.clinicName}
                    required
                    placeholder="Clínica Fisio Saúde"
                  />

                  <Input
                    label="CNPJ"
                    name="clinicCnpj"
                    value={formData.clinicCnpj}
                    onChange={handleInputChange}
                    error={errors.clinicCnpj}
                    required
                    placeholder="00.000.000/0001-00"
                  />
                </div>
              </div>
            )}

            {/* Senha */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Segurança
              </h3>
              <div className="space-y-4">
                <Input
                  label="Senha"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={errors.password}
                  required
                  helperText="Mínimo de 6 caracteres"
                />

                <Input
                  label="Confirmar Senha"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  error={errors.confirmPassword}
                  required
                />
              </div>
            </div>

            {/* Botões */}
            <div className="flex flex-col gap-3 pt-4">
              <Button
                type="submit"
                size="lg"
                fullWidth
                isLoading={isLoading}
              >
                Criar Conta
              </Button>

              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={() => navigate('/login')}
                disabled={isLoading}
              >
                Já tenho conta
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;