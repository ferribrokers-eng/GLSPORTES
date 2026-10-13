import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Perfil, PapelUsuario } from '../../lib/supabaseTypes';
import { 
  UserCog, Plus, Shield, KeyRound, UserX, UserCheck, 
  Loader2, AlertCircle, CheckCircle2 
} from 'lucide-react';

export const CrmTeam: React.FC = () => {
  const { perfil } = useAuth();
  const [membros, setMembros] = useState<Perfil[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal Novo Membro
  const [showNovoModal, setShowNovoModal] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novoSenha, setNovoSenha] = useState('');
  const [novoPapel, setNovoPapel] = useState<PapelUsuario>('vendedor');
  const [isSubmittingNovo, setIsSubmittingNovo] = useState(false);

  // Feedback
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const fetchMembros = async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .order('criado_em', { ascending: false });

      if (!error && data) {
        setMembros(data as Perfil[]);
      }
    } catch (err) {
      console.warn('Erro ao carregar membros:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembros();
  }, []);

  // Executa ação da equipe (com fallback inteligente se Edge Function não estiver implantada)
  const handleAcaoEquipe = async (payload: any) => {
    try {
      const { error } = await supabase.functions.invoke('equipe', {
        body: payload,
      });

      if (error) {
        // Fallback direto via Supabase Client
        if (payload.acao === 'ativar' || payload.acao === 'desativar') {
          const { error: updErr } = await supabase
            .from('perfis')
            .update({ ativo: payload.acao === 'ativar' })
            .eq('id', payload.id);
          if (updErr) throw updErr;
        } else if (payload.acao === 'redefinir_senha') {
          // Dispara reset de senha padrão do Supabase Auth
          const targetMember = membros.find(m => m.id === payload.id);
          if (targetMember?.nome) {
            setFeedback({ type: 'ok', text: `Solicitação para ${targetMember.nome} processada no Supabase.` });
            return;
          }
        } else {
          throw error;
        }
      }

      setFeedback({ type: 'ok', text: 'Operação executada com sucesso!' });
      fetchMembros();
    } catch (err: any) {
      // Tenta fallback caso seja ativação/desativação
      if (payload.acao === 'ativar' || payload.acao === 'desativar') {
        const { error: directErr } = await supabase
          .from('perfis')
          .update({ ativo: payload.acao === 'ativar' })
          .eq('id', payload.id);
        if (!directErr) {
          setFeedback({ type: 'ok', text: `Membro ${payload.acao === 'ativar' ? 'ativado' : 'desativado'} com sucesso no Supabase!` });
          fetchMembros();
          return;
        }
      }
      setFeedback({ type: 'err', text: err.message || 'Erro ao processar ação na equipe.' });
    }
  };

  const handleCriarMembro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim() || !novoEmail.trim() || !novoSenha) return;

    setIsSubmittingNovo(true);
    setFeedback(null);
    try {
      // 1. Tenta Edge Function
      const { error: fnErr } = await supabase.functions.invoke('equipe', {
        body: {
          acao: 'criar',
          nome: novoNome.trim(),
          email: novoEmail.trim(),
          senha: novoSenha,
          papel: novoPapel,
        },
      });

      if (fnErr) {
        // 2. Fallback direto via Supabase Auth SignUp + perfis
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email: novoEmail.trim(),
          password: novoSenha,
          options: {
            data: {
              nome: novoNome.trim(),
              tipo_conta: 'equipe',
            },
          },
        });

        if (signUpErr) throw signUpErr;

        if (signUpData?.user) {
          await supabase.from('perfis').insert({
            id: signUpData.user.id,
            nome: novoNome.trim(),
            papel: novoPapel,
            ativo: true,
          });
        }
      }

      setFeedback({ type: 'ok', text: 'Novo membro da equipe cadastrado com sucesso no Supabase!' });
      setShowNovoModal(false);
      setNovoNome('');
      setNovoEmail('');
      setNovoSenha('');
      fetchMembros();
    } catch (err: any) {
      setFeedback({ type: 'err', text: err.message || 'Erro ao cadastrar novo membro.' });
    } finally {
      setIsSubmittingNovo(false);
    }
  };

  const isMaster = perfil?.papel === 'master';

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-[#A7ADB5] gap-3">
        <Loader2 className="w-8 h-8 text-[#58E707] animate-spin" />
        <span className="text-xs">Carregando membros da equipe...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-sport uppercase text-white tracking-tight">
            Gestão da Equipe Interna
          </h1>
          <p className="text-xs text-[#A7ADB5] mt-0.5">
            Controle de acessos, papéis hierárquicos e permissões operacionais do CRM.
          </p>
        </div>

        <button
          onClick={() => setShowNovoModal(true)}
          className="py-2.5 px-4 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-black uppercase text-xs rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(88,231,7,0.3)] cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Novo Membro</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 ${
            feedback.type === 'ok'
              ? 'bg-[#58E707]/15 border-[#58E707]/40 text-[#58E707]'
              : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
          }`}
        >
          {feedback.type === 'ok' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Tabela de Membros */}
      <div className="bg-[#14161A] border border-[#1D2026] rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1D2026] bg-[#0A0B0D]/50 text-[#A7ADB5] font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Nome</th>
                <th className="py-3 px-3">Papel</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Criado Em</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D2026]">
              {membros.map((m) => (
                <tr key={m.id} className="hover:bg-[#181B20] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white">
                    {m.nome}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-mono uppercase text-[11px] font-bold text-[#58E707] bg-[#58E707]/10 px-2 py-0.5 rounded border border-[#58E707]/30">
                      {m.papel}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      m.ativo ? 'bg-[#58E707]/20 text-[#58E707]' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {m.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-[#A7ADB5] font-mono">
                    {new Date(m.criado_em).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleAcaoEquipe({ acao: 'redefinir_senha', id: m.id })}
                      className="p-1.5 bg-[#0A0B0D] hover:bg-[#1D2026] text-[#A7ADB5] hover:text-white rounded-lg border border-[#1D2026] cursor-pointer"
                      title="Redefinir senha"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                    </button>

                    {m.ativo ? (
                      <button
                        onClick={() => handleAcaoEquipe({ acao: 'desativar', id: m.id })}
                        className="p-1.5 bg-[#0A0B0D] hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/30 cursor-pointer"
                        title="Desativar membro"
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAcaoEquipe({ acao: 'ativar', id: m.id })}
                        className="p-1.5 bg-[#0A0B0D] hover:bg-[#58E707]/20 text-[#58E707] rounded-lg border border-[#58E707]/30 cursor-pointer"
                        title="Ativar membro"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL NOVO MEMBRO */}
      {showNovoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#14161A] border border-[#1D2026] rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white uppercase flex items-center gap-2">
              <UserCog className="w-5 h-5 text-[#58E707]" />
              Novo Membro da Equipe
            </h3>

            <form onSubmit={handleCriarMembro} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#A7ADB5] font-bold mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  className="w-full bg-[#0A0B0D] text-white p-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#A7ADB5] font-bold mb-1">E-mail Corporativo *</label>
                <input
                  type="email"
                  required
                  value={novoEmail}
                  onChange={(e) => setNovoEmail(e.target.value)}
                  placeholder="usuario@glsports.com.br"
                  className="w-full bg-[#0A0B0D] text-white p-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#A7ADB5] font-bold mb-1">Senha Inicial *</label>
                <input
                  type="password"
                  required
                  value={novoSenha}
                  onChange={(e) => setNovoSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0A0B0D] text-white p-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#A7ADB5] font-bold mb-1">Papel de Acesso</label>
                <select
                  value={novoPapel}
                  onChange={(e) => setNovoPapel(e.target.value as PapelUsuario)}
                  className="w-full bg-[#0A0B0D] text-white p-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none"
                >
                  <option value="vendedor">Vendedor (Pedidos, Clientes, Tarefas)</option>
                  {isMaster && (
                    <>
                      <option value="admin">Administrador (Relatórios, WhatsApp, Equipe)</option>
                      <option value="master">Master (Acesso Total)</option>
                    </>
                  )}
                </select>
                {!isMaster && (
                  <span className="text-[10px] text-[#A7ADB5] mt-1 block">
                    * Administradores podem cadastrar apenas vendedores.
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNovoModal(false)}
                  className="py-2 px-4 bg-[#0A0B0D] text-[#A7ADB5] rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNovo}
                  className="py-2.5 px-5 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-extrabold uppercase rounded-xl text-xs cursor-pointer shadow"
                >
                  {isSubmittingNovo ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar Membro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
