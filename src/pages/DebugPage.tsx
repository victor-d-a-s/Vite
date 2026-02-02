import React, { useState } from 'react';
import { supabase, getSupabaseStatus } from '../lib/supabase';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const DebugPage: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  // Teste 1: Verificar variáveis de ambiente
  const testEnvVars = () => {
    clearLogs();
    addLog('🔍 Verificando variáveis de ambiente...');

    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!url) {
      addLog('❌ VITE_SUPABASE_URL não encontrada!');
      addLog('➡️ Crie arquivo .env na raiz com: VITE_SUPABASE_URL=sua-url');
    } else {
      addLog(`✅ VITE_SUPABASE_URL: ${url.substring(0, 30)}...`);
    }

    if (!key) {
      addLog('❌ VITE_SUPABASE_ANON_KEY não encontrada!');
      addLog('➡️ Crie arquivo .env na raiz com: VITE_SUPABASE_ANON_KEY=sua-chave');
    } else {
      addLog(`✅ VITE_SUPABASE_ANON_KEY: ${key.substring(0, 30)}...`);
    }

    const status = getSupabaseStatus();
    if (status.isInitialized) {
      addLog('✅ Cliente Supabase inicializado com sucesso!');
    } else {
      addLog(`❌ Erro ao inicializar Supabase: ${status.error}`);
    }
  };

  // Teste 2: Conectar ao Supabase
  const testConnection = async () => {
    clearLogs();
    setIsLoading(true);

    try {
      addLog('🔌 Testando conexão com Supabase...');

      if (!supabase) {
        addLog('❌ Cliente Supabase não está disponível');
        addLog('➡️ Configure as variáveis de ambiente primeiro');
        return;
      }

      addLog('📊 Tentando acessar tabela profiles...');

      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (error) {
        addLog(`❌ Erro ao conectar: ${error.message}`);
        addLog(`📋 Código: ${error.code}`);
        addLog(`📋 Detalhes: ${error.details || 'N/A'}`);
        
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          addLog('⚠️ A tabela "profiles" não existe!');
          addLog('➡️ Execute o schema SQL no Supabase');
        }
      } else {
        addLog('✅ Conexão estabelecida com sucesso!');
        addLog(`📊 Resultado: ${JSON.stringify(data)}`);
      }
    } catch (err) {
      addLog(`❌ Erro inesperado: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Teste 3: Verificar tabelas
  const testTables = async () => {
    clearLogs();
    setIsLoading(true);

    try {
      addLog('📋 Verificando tabelas do banco...');

      if (!supabase) {
        addLog('❌ Supabase não disponível');
        return;
      }

      const tables = ['clinics', 'profiles', 'patients', 'appointments', 'medical_records'];

      for (const table of tables) {
        addLog(`🔍 Testando tabela: ${table}`);
        
        const { error } = await supabase
          .from(table)
          .select('count')
          .limit(0);

        if (error) {
          addLog(`  ❌ ${table}: NÃO EXISTE (${error.message})`);
        } else {
          addLog(`  ✅ ${table}: OK`);
        }
      }

      addLog('✅ Verificação completa!');
    } catch (err) {
      addLog(`❌ Erro: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Teste 4: Simular cadastro
  const testSignup = async () => {
    clearLogs();
    setIsLoading(true);

    try {
      addLog('👤 Simulando cadastro de teste...');

      if (!supabase) {
        addLog('❌ Supabase não disponível');
        return;
      }

      const testEmail = `teste${Date.now()}@physioflow.com`;
      const testPassword = 'teste123456';

      addLog(`📧 Email de teste: ${testEmail}`);
      addLog('🔐 Senha de teste: teste123456');
      addLog('⏳ Criando usuário...');

      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

      if (error) {
        addLog(`❌ Erro no cadastro: ${error.message}`);
        addLog(`📋 Status: ${error.status}`);
      } else {
        addLog('✅ Usuário criado com sucesso!');
        addLog(`📋 User ID: ${data.user?.id}`);
        addLog('⚠️ Verifique o email para confirmação');
      }
    } catch (err) {
      addLog(`❌ Erro: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🔧 Debug do PhysioFlow
          </h1>
          <p className="text-gray-600">
            Execute os testes abaixo para diagnosticar problemas
          </p>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Testes Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={testEnvVars}
              disabled={isLoading}
              variant="outline"
            >
              1️⃣ Verificar .env
            </Button>

            <Button
              onClick={testConnection}
              disabled={isLoading}
              variant="outline"
            >
              2️⃣ Testar Conexão
            </Button>

            <Button
              onClick={testTables}
              disabled={isLoading}
              variant="outline"
            >
              3️⃣ Verificar Tabelas
            </Button>

            <Button
              onClick={testSignup}
              disabled={isLoading}
              variant="outline"
            >
              4️⃣ Testar Cadastro
            </Button>
          </div>
        </Card>

        {logs.length > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">📋 Logs</h2>
              <Button
                onClick={clearLogs}
                variant="ghost"
                size="sm"
              >
                Limpar
              </Button>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`py-1 ${
                    log.includes('❌') ? 'text-red-400' :
                    log.includes('✅') ? 'text-green-400' :
                    log.includes('⚠️') ? 'text-yellow-400' :
                    log.includes('➡️') ? 'text-blue-400' :
                    'text-gray-300'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="bg-yellow-50 border-l-4 border-yellow-500">
          <h3 className="font-bold text-yellow-800 mb-2">💡 Como usar:</h3>
          <ol className="text-yellow-700 space-y-1 text-sm">
            <li><strong>1️⃣</strong> Execute "Verificar .env" primeiro</li>
            <li><strong>2️⃣</strong> Se falhar, crie o arquivo .env na raiz</li>
            <li><strong>3️⃣</strong> Execute "Testar Conexão"</li>
            <li><strong>4️⃣</strong> Execute "Verificar Tabelas"</li>
            <li><strong>5️⃣</strong> Se falhar, execute o schema SQL no Supabase</li>
            <li><strong>6️⃣</strong> Por fim, teste o cadastro</li>
          </ol>
        </Card>

        <Card className="bg-blue-50 border-l-4 border-blue-500">
          <h3 className="font-bold text-blue-800 mb-2">📖 Informações do Sistema</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>URL atual:</strong> {window.location.href}</p>
            <p><strong>Modo:</strong> {import.meta.env.MODE}</p>
            <p><strong>Supabase URL configurada:</strong> {import.meta.env.VITE_SUPABASE_URL ? '✅ Sim' : '❌ Não'}</p>
            <p><strong>Supabase Key configurada:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Sim' : '❌ Não'}</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DebugPage;