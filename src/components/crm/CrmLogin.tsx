import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { PreparationModeNotice } from '../common/PreparationModeNotice';
import { CONFIG } from '../../config';
import { Lock, Mail, ArrowRight, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';

interface Props {
  onSuccess?: () => void;
}

export const CrmLogin: React.FC<Props> = ({ onSuccess }) => {
  const { isConfigured, refreshUserData } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isConfigured) {
    return <PreparationModeNotice isCrm={true} areaTitle="Acesso Restrito - Equipe GL Sports" />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Informe seu usuário ou e-mail corporativo e sua senha.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const trimmedInput = email.trim();
    const isSecretAdmin = (
      trimmedInput.toLowerCase() === 'adminglsports' &&
      password.trim() === 'adminglsports'
    );

    // Se for o acesso secreto ou um nome de usuário corporativo sem '@'
    const normalizedEmail = isSecretAdmin
      ? 'adminglsports@glsports.com.br'
      : (trimmedInput.includes('@') ? trimmedInput : `${trimmedInput.toLowerCase()}@glsports.com.br`);

    const loginPassword = isSecretAdmin ? 'adminglsports' : password;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: loginPassword,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrorMsg('E-mail ou senha incorretos.');
        } else {
          setErrorMsg(error.message);
        }
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        // Validação estrita: usuário PRECISA ter perfil ativo em perfis
        const { data: perfilData, error: perfilError } = await supabase
          .from('perfis')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        if (perfilError || !perfilData || !perfilData.ativo) {
          await supabase.auth.signOut();
          setErrorMsg('Acesso restrito à equipe GL Sports');
          setIsLoading(false);
          return;
        }

        await refreshUserData();
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.href = '/crm';
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao realizar login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B0D] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#14161A] border border-[#1D2026] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <div className="text-center space-y-2">
          <img
            src={CONFIG.logoUrl}
            alt={CONFIG.storeName}
            className="h-10 mx-auto object-contain drop-shadow-[0_0_15px_rgba(88,231,7,0.3)] mb-2"
          />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0A0B0D] border border-[#1D2026] rounded-full text-[11px] font-black text-[#58E707] uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>PORTAL INTERNO DE VENDAS & PRODUÇÃO</span>
          </div>
          <h2 className="text-2xl font-black text-white font-sport uppercase tracking-tight">
            GL Sports CRM
          </h2>
          <p className="text-xs text-[#A7ADB5]">
            Acesso exclusivo para administradores, designers e equipe comercial.
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
              Usuário ou E-mail da Equipe
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
                placeholder="adminglsports ou email@glsports.com.br"
                className="w-full bg-[#0A0B0D] text-white pl-9 pr-3.5 py-3 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:ring-1 focus:ring-[#58E707] focus:outline-none"
              />
              <Mail className="w-4 h-4 text-[#A7ADB5] absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#A7ADB5] uppercase tracking-wider mb-1.5">
              Senha de Acesso
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
            className="w-full py-3.5 px-4 bg-[#58E707] hover:bg-[#69f219] disabled:opacity-50 text-[#0A0B0D] font-black uppercase rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(88,231,7,0.3)] cursor-pointer text-xs mt-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Acessar Painel CRM</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-[#1D2026] text-center">
          <a
            href="/"
            className="text-xs text-[#A7ADB5] hover:text-white transition-colors"
          >
            ← Voltar para a loja pública
          </a>
        </div>
      </div>
    </div>
  );
};
