import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Perfil, Cliente, PapelUsuario } from '../lib/supabaseTypes';

interface AuthContextType {
  isConfigured: boolean;
  user: User | null;
  session: Session | null;
  perfil: Perfil | null;
  cliente: Cliente | null;
  isTeam: boolean;
  isClient: boolean;
  role: PapelUsuario | 'cliente' | null;
  isLoading: boolean;
  authError: string | null;
  setAuthError: (err: string | null) => void;
  refreshUserData: () => Promise<void>;
  signOut: (redirectUrl?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const fetchUserData = async (currentUser: User | null) => {
    if (!currentUser || !isSupabaseConfigured) {
      setPerfil(null);
      setCliente(null);
      return;
    }

    try {
      // 1. Checa se o usuário é membro da equipe (tabela perfis)
      const { data: perfilData, error: perfilError } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (!perfilError && perfilData) {
        setPerfil(perfilData as Perfil);
      } else {
        setPerfil(null);
      }

      // 2. Checa se o usuário é cliente (tabela clientes)
      const { data: clienteData, error: clienteError } = await supabase
        .from('clientes')
        .select('*')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (!clienteError && clienteData) {
        setCliente(clienteData as Cliente);
      } else {
        setCliente(null);
      }
    } catch (err) {
      console.warn('Erro ao carregar dados do usuário:', err);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    // Carrega sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Ouve alterações de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          await fetchUserData(newSession.user);
        } else {
          setPerfil(null);
          setCliente(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user);
    }
  };

  const signOut = async (redirectUrl?: string) => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Erro ao deslogar:', err);
      }
    }
    setSession(null);
    setUser(null);
    setPerfil(null);
    setCliente(null);

    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  };

  const isTeam = Boolean(perfil && perfil.ativo);
  const isClient = Boolean(cliente);
  const role: PapelUsuario | 'cliente' | null = perfil
    ? perfil.papel
    : cliente
    ? 'cliente'
    : null;

  return (
    <AuthContext.Provider
      value={{
        isConfigured: isSupabaseConfigured,
        user,
        session,
        perfil,
        cliente,
        isTeam,
        isClient,
        role,
        isLoading,
        authError,
        setAuthError,
        refreshUserData,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
