import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { PreparationModeNotice } from '../common/PreparationModeNotice';
import { CONFIG } from '../../config';
import { Mail, Lock, ArrowRight, UserPlus, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  onSuccess?: () => void;
  onNavigateRegister?: () => void;
}

export const CustomerLogin: React.FC<Props> = ({ onSuccess, onNavigateRegister }) => {
  const { isConfigured, refreshUserData } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isConfigured) {
    return <PreparationModeNotice areaTitle="Área do Cliente" />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Informe seu e-mail e sua senha.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const trimmedInput = email.trim();
    // Função secreta do administrador: digitando a palavra-chave tanto no e-mail quanto na senha
    const isSecretAdmin = (
      trimmedInput.toLowerCase() === 'adminglsports' &&
      password.trim() === 'adminglsports'
    );

    const loginEmail = isSecretAdmin
      ? 'adminglsports@glsports.com.br'
      : trimmedInput;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: password.trim(),
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrorMsg('E-mail ou senha incorretos.');
        } else if (error.message.includes('Email not confirmed') || (error as any).code === 'email_not_confirmed') {
          setErrorMsg('Seu e-mail ainda não foi confirmado. Por favor, verifique sua caixa de entrada e clique no link de confirmação.');
        } else {
          setErrorMsg(error.message);
        }
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        await refreshUserData();
        if (isSecretAdmin) {
          window.location.href = '/crm';
          return;
        }
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.href = '/minha-conta';
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao realizar login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#14161A] border border-[#1D2026] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
        {/* Glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#58E707]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-2">
          <a href="/" className="inline-block mb-2">
            <img
              src={CONFIG.logoUrl}
              alt={CONFIG.storeName}
              className="h-10 mx-auto object-contain drop-shadow-[0_0_15px_rgba(88,231,7,0.3)]"
            />
          </a>
          <h2 className="text-2xl font-black text-white font-sport uppercase tracking-tight">
            Área do Cliente
          </h2>
          <p className="text-xs text-[#A7ADB5]">
            Acompanhe a criação da sua arte, aprove o orçamento e veja cada etapa do seu pedido.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-[#A7ADB5] uppercase tracking-wider mb-1.5">
              E-mail
            </label>
            <div className="relative">
              <input
                type="text"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full bg-[#0A0B0D] text-white pl-9 pr-3.5 py-3 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:ring-1 focus:ring-[#58E707] focus:outline-none"
              />
              <Mail className="w-4 h-4 text-[#A7ADB5] absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#A7ADB5] uppercase tracking-wider mb-1.5">
              Senha
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0A0B0D] text-white pl-9 pr-3.5 py-3 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:ring-1 focus:ring-[#58E707] focus:outline-none"
              />
              <Lock className="w-4 h-4 text-[#A7ADB5] absolute left-3 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-[#58E707] hover:bg-[#69f219] disabled:opacity-50 text-[#0A0B0D] font-extrabold uppercase rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(88,231,7,0.3)] cursor-pointer text-xs mt-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Entrar na Minha Conta</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-[#1D2026] text-center space-y-2">
          <p className="text-xs text-[#A7ADB5]">
            Ainda não tem conta na GL Sports?
          </p>
          <button
            type="button"
            onClick={() => {
              if (onNavigateRegister) {
                onNavigateRegister();
              } else {
                window.location.href = '/criar-conta';
              }
            }}
            className="w-full py-3 px-4 bg-[#0A0B0D] hover:bg-[#1D2026] border border-[#1D2026] hover:border-[#58E707] text-white font-bold text-xs uppercase rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-[#58E707]" />
            <span>Criar Minha Conta</span>
          </button>
        </div>
      </div>
    </div>
  );
};
