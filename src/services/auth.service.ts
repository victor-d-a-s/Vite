import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  crefito: string | null;
  role: 'owner' | 'therapist' | 'receptionist';
  clinic_id: string | null;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
}

/**
 * Serviço de autenticação - abstrai todas as chamadas ao Supabase Auth
 */
class AuthService {
  /**
   * Obtém o usuário autenticado atual
   */
  async getCurrentUser(): Promise<User | null> {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }
  }

  /**
   * Obtém o perfil completo do usuário
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }
  }

  /**
   * Faz login com e-mail e senha
   */
  async signIn(email: string, password: string) {
    if (!supabase) {
      throw new Error('Serviço de autenticação não disponível');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Faz logout
   */
  async signOut() {
    if (!supabase) return;

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  /**
   * Verifica se há sessão ativa
   */
  async getSession() {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
      return null;
    }
  }

  /**
   * Listener de mudanças no estado de autenticação
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    if (!supabase) return () => {};

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        callback(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }

  /**
   * Solicita reset de senha
   */
  async resetPassword(email: string) {
    if (!supabase) {
      throw new Error('Serviço de autenticação não disponível');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#/reset-password`,
    });

    if (error) throw error;
  }

  /**
   * Atualiza senha do usuário
   */
  async updatePassword(newPassword: string) {
    if (!supabase) {
      throw new Error('Serviço de autenticação não disponível');
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  }
}

export const authService = new AuthService();