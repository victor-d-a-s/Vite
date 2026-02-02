import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Variáveis de ambiente (substitua pelos valores reais)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseInstance: SupabaseClient | null = null;
let initializationError: string | null = null;

/**
 * Inicializa o cliente Supabase com tratamento de erros robusto.
 * Crucial para não travar o app em ambientes sem credenciais.
 */
function initializeSupabase(): SupabaseClient | null {
  try {
    // Validação das credenciais
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Credenciais do Supabase não configuradas');
    }

    // Validação de formato URL
    if (!SUPABASE_URL.startsWith('https://')) {
      throw new Error('URL do Supabase inválida');
    }

    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // Importante para HashRouter
      },
    });

    return supabaseInstance;
  } catch (error) {
    initializationError = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('❌ Falha ao inicializar Supabase:', initializationError);
    return null;
  }
}

// Singleton pattern
export const supabase = initializeSupabase();

/**
 * Hook de verificação para componentes que dependem do Supabase
 */
export function getSupabaseStatus() {
  return {
    isInitialized: supabaseInstance !== null,
    error: initializationError,
  };
}

/**
 * Helper para componentes renderizarem fallback
 */
export function requireSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    throw new Error(initializationError || 'Supabase não inicializado');
  }
  return supabaseInstance;
}