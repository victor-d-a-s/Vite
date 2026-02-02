import { useState, useEffect } from 'react';
import { authService, type AuthState, type UserProfile } from '../services/auth.service';
import type { User } from '@supabase/supabase-js';

/**
 * Hook personalizado para gerenciar estado de autenticação
 * Simplifica o uso do authService nos componentes
 */
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
  });

  useEffect(() => {
    // Inicializa verificando se há usuário logado
    initializeAuth();

    // Listener para mudanças no estado de autenticação
    const unsubscribe = authService.onAuthStateChange(async (user) => {
      if (user) {
        // Carrega perfil quando usuário é autenticado
        const profile = await authService.getUserProfile(user.id);
        setAuthState({
          user,
          profile,
          isLoading: false,
        });
      } else {
        // Limpa estado quando usuário faz logout
        setAuthState({
          user: null,
          profile: null,
          isLoading: false,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  async function initializeAuth() {
    try {
      const session = await authService.getSession();
      
      if (session?.user) {
        const profile = await authService.getUserProfile(session.user.id);
        setAuthState({
          user: session.user,
          profile,
          isLoading: false,
        });
      } else {
        setAuthState({
          user: null,
          profile: null,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Erro ao inicializar autenticação:', error);
      setAuthState({
        user: null,
        profile: null,
        isLoading: false,
      });
    }
  }

  const signOut = async () => {
    try {
      await authService.signOut();
      setAuthState({
        user: null,
        profile: null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  };

  return {
    user: authState.user,
    profile: authState.profile,
    isLoading: authState.isLoading,
    isAuthenticated: !!authState.user,
    signOut,
  };
}