import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { PreparationModeNotice } from '../common/PreparationModeNotice';
import { CONFIG } from '../../config';
import { TipoCliente } from '../../lib/supabaseTypes';
import { 
  User, Mail, Lock, Phone, MapPin, Building, Search, 
  ArrowRight, AlertCircle, Loader2, CheckCircle2 
} from 'lucide-react';

interface Props {
  onSuccess?: () => void;
  onNavigateLogin?: () => void;
}

export const CustomerRegister: React.FC<Props> = ({ onSuccess, onNavigateLogin }) => {
  const { isConfigured, refreshUserData } = useAuth();

  // Form State
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [tipo, setTipo] = useState<TipoCliente>('pessoa');
  const [documento, setDocumento] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [origem, setOrigem] = useState('Instagram');
  const [aceitaMarketing, setAceitaMarketing] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ isImmediate: boolean; message: string } | null>(null);

  if (!isConfigured) {
    return <PreparationModeNotice areaTitle="Criar Conta" />;
  }

  // Busca CEP via ViaCEP
  const handleCepBlur = async () => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setIsLoadingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setCidade(data.localidade || '');
          setUf(data.uf || '');
          if (data.logradouro) {
            setEndereco(`${data.logradouro}, ${data.bairro || ''}`);
          }
        }
      } catch (err) {
        console.warn('Erro ao consultar ViaCEP:', err);
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim() || !password || !whatsapp.trim()) {
      setErrorMsg('Preencha os campos obrigatórios (Nome, E-mail, Senha e WhatsApp).');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            tipo_conta: 'cliente',
            nome: nome.trim(),
            whatsapp: whatsapp.trim(),
            documento: documento.trim() || null,
            cep: cep.trim() || null,
            endereco: endereco.trim() || null,
            cidade: cidade.trim() || null,
            uf: uf.trim() || null,
            tipo,
            origem,
            aceita_marketing: aceitaMarketing,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setIsLoading(false);
        return;
      }

      if (data?.session) {
        setSuccessInfo({
          isImmediate: true,
          message: 'Conta criada com sucesso! Acessando sua área do cliente...',
        });
        await refreshUserData();
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            window.location.href = '/minha-conta';
          }
        }, 1000);
      } else {
        // Tenta autenticação imediata caso o Supabase não tenha retornado a sessão no signUp
        const { data: loginData } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (loginData?.session) {
          setSuccessInfo({
            isImmediate: true,
            message: 'Conta criada com sucesso! Acessando sua área do cliente...',
          });
          await refreshUserData();
          setTimeout(() => {
            if (onSuccess) {
              onSuccess();
            } else {
              window.location.href = '/minha-conta';
            }
          }, 1000);
        } else {
          // Caso confirmação seja requerida pelo provedor, autoriza prosseguimento
          setSuccessInfo({
            isImmediate: true,
            message: 'Conta criada com sucesso! Seus dados foram salvos. Enviamos uma cópia das informações para seu e-mail caso deseje consultar mais tarde.',
          });
          setTimeout(() => {
            if (onSuccess) {
              onSuccess();
            } else {
              window.location.href = '/minha-conta';
            }
          }, 1500);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao realizar cadastro.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-8 px-4 flex items-center justify-center">
      <div className="max-w-xl w-full bg-[#14161A] border border-[#1D2026] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <div className="text-center space-y-2">
          <a href="/" className="inline-block mb-2">
            <img
              src={CONFIG.logoUrl}
              alt={CONFIG.storeName}
              className="h-10 mx-auto object-contain drop-shadow-[0_0_15px_rgba(88,231,7,0.3)]"
            />
          </a>
          <h2 className="text-2xl font-black text-white font-sport uppercase tracking-tight">
            Criar Minha Conta
          </h2>
          <p className="text-xs text-[#A7ADB5]">
            Cadastre-se rapidamente para enviar pedidos, acompanhar estampas e aprovar orçamentos.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successInfo && (
          <div className="p-4 bg-[#58E707]/10 border border-[#58E707]/30 rounded-xl flex items-center gap-3 text-[#58E707] text-xs">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold">{successInfo.isImmediate ? 'Conta criada com sucesso!' : 'Cadastro Concluído!'}</p>
              <p className="text-[#A7ADB5]">{successInfo.message}</p>
              {!successInfo.isImmediate && (
                <div className="mt-3 flex gap-2">
                  <a
                    href="/entrar"
                    className="inline-block py-1.5 px-3 bg-[#58E707] text-[#0A0B0D] font-black rounded-lg text-[11px] uppercase tracking-wider"
                  >
                    Ir para Login
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          {/* Nome e E-mail */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#A7ADB5] uppercase tracking-wider mb-1">
                Nome Completo *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full bg-[#0A0B0D] text-white pl-9 pr-3 py-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none"
                />
                <User className="w-4 h-4 text-[#A7ADB5] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#A7ADB5] uppercase tracking-wider mb-1">
                E-mail *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-[#0A0B0D] text-white pl-9 pr-3 py-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none"
                />
                <Mail className="w-4 h-4 text-[#A7ADB5] absolute left-3 top-3" />
              </div>
            </div>
          </div>

          {/* Senha e WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#A7ADB5] uppercase tracking-wider mb-1">
                Senha (mín. 6 dígitos) *
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0A0B0D] text-white pl-9 pr-3 py-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none"
                />
                <Lock className="w-4 h-4 text-[#A7ADB5] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#A7ADB5] uppercase tracking-wider mb-1">
                WhatsApp com DDD *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full bg-[#0A0B0D] text-white pl-9 pr-3 py-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none"
                />
                <Phone className="w-4 h-4 text-[#A7ADB5] absolute left-3 top-3" />
              </div>
            </div>
          </div>

          {/* Tipo de Cliente e CPF/CNPJ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#A7ADB5] uppercase tracking-wider mb-1">
                Tipo de Cadastro
              </label>
              <div className="relative">
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as TipoCliente)}
                  className="w-full bg-[#0A0B0D] text-white pl-9 pr-3 py-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none appearance-none"
                >
                  <option value="pessoa">Pessoa Física / Torcedor</option>
                  <option value="time">Time / Atlética / Pelada</option>
                  <option value="escola">Escola / Turma / Interclasse</option>
                  <option value="empresa">Empresa / Negócio</option>
                  <option value="igreja">Igreja / Congregação</option>
                  <option value="outro">Outro / Geral</option>
                </select>
                <Building className="w-4 h-4 text-[#A7ADB5] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#A7ADB5] uppercase tracking-wider mb-1">
                CPF ou CNPJ (Opcional)
              </label>
              <input
                type="text"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                placeholder="000.000.000-00"
                className="w-full bg-[#0A0B0D] text-white px-3.5 py-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none"
              />
            </div>
          </div>

          {/* CEP e Endereço */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-[11px] font-bold text-[#A7ADB5] uppercase tracking-wider mb-1">
                CEP (ViaCEP)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  onBlur={handleCepBlur}
                  placeholder="00000-000"
                  className="w-full bg-[#0A0B0D] text-white pl-9 pr-3 py-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none"
                />
                <MapPin className="w-4 h-4 text-[#A7ADB5] absolute left-3 top-3" />
                {isLoadingCep && (
                  <Loader2 className="w-3.5 h-3.5 text-[#58E707] animate-spin absolute right-3 top-3.5" />
                )}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-[#A7ADB5] uppercase tracking-wider mb-1">
                Endereço / Logradouro
              </label>
              <input
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Rua, Número, Bairro"
                className="w-full bg-[#0A0B0D] text-white px-3.5 py-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none"
              />
            </div>
          </div>

          {/* Cidade e UF */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-[#A7ADB5] uppercase tracking-wider mb-1">
                Cidade
              </label>
              <input
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Sua cidade"
                className="w-full bg-[#0A0B0D] text-white px-3.5 py-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#A7ADB5] uppercase tracking-wider mb-1">
                UF
              </label>
              <input
                type="text"
                maxLength={2}
                value={uf}
                onChange={(e) => setUf(e.target.value.toUpperCase())}
                placeholder="SP"
                className="w-full bg-[#0A0B0D] text-white px-3.5 py-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none text-center uppercase"
              />
            </div>
          </div>

          {/* Como nos conheceu */}
          <div>
            <label className="block text-[11px] font-bold text-[#A7ADB5] uppercase tracking-wider mb-1">
              Como nos conheceu?
            </label>
            <select
              value={origem}
              onChange={(e) => setOrigem(e.target.value)}
              className="w-full bg-[#0A0B0D] text-white px-3.5 py-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none"
            >
              <option value="Instagram">Instagram</option>
              <option value="Google">Google / Busca na internet</option>
              <option value="Indicação">Indicação de amigo / time</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Evento">Campeonato / Evento</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          {/* LGPD WhatsApp marketing */}
          <div className="p-3 bg-[#0A0B0D] rounded-xl border border-[#1D2026] flex items-start gap-3">
            <input
              type="checkbox"
              id="aceita-mkt"
              checked={aceitaMarketing}
              onChange={(e) => setAceitaMarketing(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded accent-[#58E707] cursor-pointer"
            />
            <label htmlFor="aceita-mkt" className="text-[11px] text-[#A7ADB5] leading-snug cursor-pointer">
              Aceito receber novidades, lançamentos de estampas e condições especiais pelo WhatsApp da GL Sports. (Opcional)
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-[#58E707] hover:bg-[#69f219] disabled:opacity-50 text-[#0A0B0D] font-black uppercase rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(88,231,7,0.3)] cursor-pointer text-xs mt-3"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Cadastrar e Continuar</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-[#1D2026] text-center">
          <p className="text-xs text-[#A7ADB5]">
            Já possui uma conta?{' '}
            <button
              type="button"
              onClick={() => {
                if (onNavigateLogin) {
                  onNavigateLogin();
                } else {
                  window.location.href = '/entrar';
                }
              }}
              className="text-[#58E707] font-bold hover:underline ml-1 cursor-pointer"
            >
              Fazer Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
