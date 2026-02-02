import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
  crefito: string;
}

interface ClinicData {
  name: string;
  cnpj: string;
}

const Settings: React.FC = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'clinic' | 'security'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    email: '',
    phone: '',
    crefito: '',
  });

  const [clinicData, setClinicData] = useState<ClinicData>({
    name: '',
    cnpj: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        crefito: profile.crefito || '',
      });
    }
    loadClinicData();
  }, [profile]);

  const loadClinicData = async () => {
    if (!profile?.clinic_id || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('name, cnpj')
        .eq('id', profile.clinic_id)
        .single();

      if (error) throw error;
      if (data) {
        setClinicData({
          name: data.name || '',
          cnpj: data.cnpj || '',
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados da clínica:', error);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClinicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClinicData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const saveProfile = async () => {
    if (!user?.id || !supabase) return;

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
          crefito: profileData.crefito,
        })
        .eq('id', user.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar perfil. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const saveClinic = async () => {
    if (!profile?.clinic_id || !supabase) return;

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase
        .from('clinics')
        .update({
          name: clinicData.name,
          cnpj: clinicData.cnpj,
        })
        .eq('id', profile.clinic_id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Dados da clínica atualizados com sucesso!' });
    } catch (error) {
      console.error('Erro ao salvar clínica:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar dados da clínica. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async () => {
    if (!supabase) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'A senha deve ter no mínimo 6 caracteres' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      setMessage({ type: 'error', text: 'Erro ao alterar senha. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Configurações</h1>
        <p className="text-gray-600 mt-1">Gerencie seu perfil e preferências</p>
      </div>

      {message.text && (
        <Card className={`border-l-4 ${message.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
          <p className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {message.text}
          </p>
        </Card>
      )}

      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          {[
            { id: 'profile', label: 'Meu Perfil', icon: '👤' },
            { id: 'clinic', label: 'Clínica', icon: '🏥' },
            { id: 'security', label: 'Segurança', icon: '🔒' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-4 font-medium transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'profile' && (
        <Card>
          <h2 className="text-xl font-bold text-gray-800 mb-6">Informações Pessoais</h2>
          <div className="space-y-4">
            <Input
              label="Nome Completo"
              name="full_name"
              value={profileData.full_name}
              onChange={handleProfileChange}
              required
            />

            <Input
              label="E-mail"
              name="email"
              type="email"
              value={profileData.email}
              disabled
              helperText="O e-mail não pode ser alterado"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Telefone"
                name="phone"
                type="tel"
                value={profileData.phone}
                onChange={handleProfileChange}
                placeholder="(11) 98765-4321"
              />

              <Input
                label="CREFITO"
                name="crefito"
                value={profileData.crefito}
                onChange={handleProfileChange}
                placeholder="123456-F"
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={saveProfile} isLoading={isLoading}>
                Salvar Alterações
              </Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'clinic' && (
        <Card>
          <h2 className="text-xl font-bold text-gray-800 mb-6">Dados da Clínica</h2>
          <div className="space-y-4">
            <Input
              label="Nome da Clínica"
              name="name"
              value={clinicData.name}
              onChange={handleClinicChange}
              required
            />

            <Input
              label="CNPJ"
              name="cnpj"
              value={clinicData.cnpj}
              onChange={handleClinicChange}
              placeholder="00.000.000/0001-00"
              helperText="Deixe em branco se for autônomo sem CNPJ"
            />

            <div className="flex justify-end pt-4">
              <Button onClick={saveClinic} isLoading={isLoading}>
                Salvar Alterações
              </Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card>
          <h2 className="text-xl font-bold text-gray-800 mb-6">Alterar Senha</h2>
          <div className="space-y-4">
            <Input
              label="Nova Senha"
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              placeholder="Mínimo 6 caracteres"
              required
            />

            <Input
              label="Confirmar Nova Senha"
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Digite a senha novamente"
              required
            />

            <div className="flex justify-end pt-4">
              <Button onClick={changePassword} isLoading={isLoading}>
                Alterar Senha
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card className="bg-blue-50 border-l-4 border-blue-500">
        <h3 className="font-bold text-blue-800 mb-2">💡 Dica</h3>
        <p className="text-blue-700 text-sm">
          Mantenha seus dados atualizados para garantir a comunicação efetiva com seus pacientes.
        </p>
      </Card>
    </div>
  );
};

export default Settings;