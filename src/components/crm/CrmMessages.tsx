import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { 
  WhatsappMensagem, MensagemModelo, WhatsappConexao, 
  StatusMensagem, TipoConexaoWhatsapp 
} from '../../lib/supabaseTypes';
import { 
  MessageSquare, Send, CheckCircle2, AlertTriangle, 
  Settings, ExternalLink, Edit3, Save, Plus, Loader2, AlertCircle 
} from 'lucide-react';

export const CrmMessages: React.FC = () => {
  const { perfil } = useAuth();
  const [subAba, setSubAba] = useState<'fila' | 'modelos' | 'conexoes'>('fila');
  const [statusFila, setStatusFila] = useState<StatusMensagem | 'todas'>('pendente');

  const [mensagens, setMensagens] = useState<WhatsappMensagem[]>([]);
  const [modelos, setModelos] = useState<MensagemModelo[]>([]);
  const [conexoes, setConexoes] = useState<WhatsappConexao[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edição de Modelo
  const [editingModelo, setEditingModelo] = useState<MensagemModelo | null>(null);
  const [modeloTexto, setModeloTexto] = useState('');
  const [isSavingModelo, setIsSavingModelo] = useState(false);

  // Nova Conexão
  const [showNovaConexao, setShowNovaConexao] = useState(false);
  const [conNome, setConNome] = useState('');
  const [conTipo, setConTipo] = useState<TipoConexaoWhatsapp>('manual');
  const [conNumero, setConNumero] = useState('');
  const [conPadrao, setConPadrao] = useState(false);
  const [isSavingCon, setIsSavingCon] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const fetchData = async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    try {
      const [
        { data: msgData },
        { data: modData },
        { data: conData },
      ] = await Promise.all([
        supabase.from('whatsapp_mensagens').select('*, cliente:clientes(nome), pedido:pedidos(numero)').order('criado_em', { ascending: false }),
        supabase.from('mensagem_modelos').select('*').order('chave'),
        supabase.from('whatsapp_conexoes').select('*').order('nome'),
      ]);

      setMensagens((msgData as WhatsappMensagem[]) || []);
      setModelos((modData as MensagemModelo[]) || []);
      setConexoes((conData as WhatsappConexao[]) || []);
    } catch (err) {
      console.warn('Erro ao carregar mensagens:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSalvarModelo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModelo) return;
    setIsSavingModelo(true);
    setActionFeedback(null);
    try {
      const { error } = await supabase
        .from('mensagem_modelos')
        .update({ texto: modeloTexto })
        .eq('id', editingModelo.id);

      if (error) throw error;
      setEditingModelo(null);
      setActionFeedback({ type: 'ok', text: 'Modelo de mensagem salvo com sucesso!' });
      fetchData();
    } catch (err: any) {
      setActionFeedback({ type: 'err', text: err.message || 'Erro ao salvar modelo.' });
    } finally {
      setIsSavingModelo(false);
    }
  };

  const handleSalvarConexao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conNome.trim() || !conNumero.trim()) return;

    setIsSavingCon(true);
    setActionFeedback(null);
    try {
      if (conPadrao) {
        await supabase.from('whatsapp_conexoes').update({ padrao: false }).neq('id', '00000000-0000-0000-0000-000000000000');
      }

      const { error } = await supabase.from('whatsapp_conexoes').insert({
        nome: conNome.trim(),
        tipo: conTipo,
        numero: conNumero.trim(),
        ativa: true,
        padrao: conPadrao,
        config: {},
      });

      if (error) throw error;
      setShowNovaConexao(false);
      setConNome('');
      setConNumero('');
      setActionFeedback({ type: 'ok', text: 'Conexão do WhatsApp salva com sucesso!' });
      fetchData();
    } catch (err: any) {
      setActionFeedback({ type: 'err', text: err.message || 'Erro ao salvar conexão.' });
    } finally {
      setIsSavingCon(false);
    }
  };

  const mensagensFiltradas = mensagens.filter((m) => {
    if (statusFila !== 'todas') return m.status === statusFila;
    return true;
  });

  const isMasterOrAdmin = perfil?.papel === 'master' || perfil?.papel === 'admin';

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-[#A7ADB5] gap-3">
        <Loader2 className="w-8 h-8 text-[#58E707] animate-spin" />
        <span className="text-xs">Carregando módulo de WhatsApp...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-sport uppercase text-white tracking-tight">
            Central de WhatsApp
          </h1>
          <p className="text-xs text-[#A7ADB5] mt-0.5">
            Fila de notificações automáticas, templates dinâmicos e conexões com a API oficial da Meta.
          </p>
        </div>

        {/* Sub-abas */}
        <div className="flex items-center bg-[#14161A] p-1 rounded-xl border border-[#1D2026] text-xs">
          <button
            onClick={() => setSubAba('fila')}
            className={`py-1.5 px-3 rounded-lg font-bold cursor-pointer transition-all ${
              subAba === 'fila' ? 'bg-[#58E707] text-[#0A0B0D]' : 'text-[#A7ADB5] hover:text-white'
            }`}
          >
            Fila de Mensagens
          </button>
          <button
            onClick={() => setSubAba('modelos')}
            className={`py-1.5 px-3 rounded-lg font-bold cursor-pointer transition-all ${
              subAba === 'modelos' ? 'bg-[#58E707] text-[#0A0B0D]' : 'text-[#A7ADB5] hover:text-white'
            }`}
          >
            Modelos de Texto
          </button>
          {isMasterOrAdmin && (
            <button
              onClick={() => setSubAba('conexoes')}
              className={`py-1.5 px-3 rounded-lg font-bold cursor-pointer transition-all ${
                subAba === 'conexoes' ? 'bg-[#58E707] text-[#0A0B0D]' : 'text-[#A7ADB5] hover:text-white'
              }`}
            >
              Conexões
            </button>
          )}
        </div>
      </div>

      {actionFeedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 ${
            actionFeedback.type === 'ok'
              ? 'bg-[#58E707]/15 border-[#58E707]/40 text-[#58E707]'
              : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
          }`}
        >
          {actionFeedback.type === 'ok' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{actionFeedback.text}</span>
        </div>
      )}

      {/* 1. SUB-ABA: FILA DE MENSAGENS */}
      {subAba === 'fila' && (
        <div className="space-y-4">
          {/* Filtro de Status da Fila */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {[
              { key: 'pendente', label: 'Pendentes' },
              { key: 'manual', label: 'Envio Manual' },
              { key: 'enviada', label: 'Enviadas' },
              { key: 'falhou', label: 'Falhas' },
              { key: 'todas', label: 'Todas' },
            ].map((st) => (
              <button
                key={st.key}
                onClick={() => setStatusFila(st.key as any)}
                className={`py-1.5 px-3 rounded-xl font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                  statusFila === st.key
                    ? 'bg-[#58E707] text-[#0A0B0D]'
                    : 'bg-[#14161A] border border-[#1D2026] text-[#A7ADB5] hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <div className="bg-[#14161A] border border-[#1D2026] rounded-3xl overflow-hidden shadow-xl">
            {mensagensFiltradas.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#A7ADB5]">
                Nenhuma mensagem nesta fila.
              </div>
            ) : (
              <div className="divide-y divide-[#1D2026]">
                {mensagensFiltradas.map((msg) => (
                  <div key={msg.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2">
                        <strong className="text-white">{msg.cliente?.nome || 'Cliente'}</strong>
                        <span className="text-[#A7ADB5] font-mono">({msg.numero})</span>
                        {msg.pedido && (
                          <span className="text-[10px] font-mono text-[#58E707] bg-[#58E707]/10 px-2 py-0.5 rounded">
                            Pedido #{msg.pedido.numero}
                          </span>
                        )}
                      </div>
                      <p className="text-[#A7ADB5] whitespace-pre-wrap">{msg.texto}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {msg.status === 'manual' && (
                        <a
                          href={`https://wa.me/55${msg.numero.replace(/\D/g, '')}?text=${encodeURIComponent(msg.texto)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="py-2 px-3 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-extrabold uppercase rounded-xl text-xs flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Abrir no WhatsApp</span>
                        </a>
                      )}
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                        msg.status === 'enviada' ? 'bg-[#58E707]/20 text-[#58E707]' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {msg.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. SUB-ABA: MODELOS DE TEXTO */}
      {subAba === 'modelos' && (
        <div className="bg-[#14161A] border border-[#1D2026] rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="border-b border-[#1D2026] pb-3">
            <h3 className="text-sm font-bold text-white uppercase">Modelos de Mensagens Automáticas</h3>
            <p className="text-xs text-[#A7ADB5] mt-0.5">
              Você pode usar as variáveis <code className="text-[#58E707]">{'{nome}'}</code>, <code className="text-[#58E707]">{'{numero}'}</code> e <code className="text-[#58E707]">{'{link}'}</code> nos textos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modelos.map((mod) => (
              <div key={mod.id} className="bg-[#0A0B0D] border border-[#1D2026] rounded-2xl p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#58E707] uppercase">{mod.chave}</span>
                  <button
                    onClick={() => {
                      setEditingModelo(mod);
                      setModeloTexto(mod.texto);
                    }}
                    className="p-1 text-[#A7ADB5] hover:text-white cursor-pointer"
                    title="Editar modelo"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[#A7ADB5] whitespace-pre-wrap">{mod.texto}</p>
              </div>
            ))}
          </div>

          {/* Modal Edição */}
          {editingModelo && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="max-w-md w-full bg-[#14161A] border border-[#1D2026] rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase">
                  Editar Modelo: {editingModelo.chave}
                </h3>
                <form onSubmit={handleSalvarModelo} className="space-y-3 text-xs">
                  <textarea
                    rows={6}
                    required
                    value={modeloTexto}
                    onChange={(e) => setModeloTexto(e.target.value)}
                    className="w-full bg-[#0A0B0D] text-white p-3 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingModelo(null)}
                      className="py-2 px-4 bg-[#0A0B0D] text-[#A7ADB5] rounded-xl text-xs"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingModelo}
                      className="py-2 px-5 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-bold rounded-xl text-xs uppercase"
                    >
                      {isSavingModelo ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Alteração'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. SUB-ABA: CONEXÕES DE WHATSAPP (ADMIN/MASTER) */}
      {subAba === 'conexoes' && isMasterOrAdmin && (
        <div className="bg-[#14161A] border border-[#1D2026] rounded-3xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#1D2026] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase">Conexões de Envio de WhatsApp</h3>
              <p className="text-xs text-[#A7ADB5] mt-0.5">
                Tokens e senhas NÃO são digitados no site: ficam armazenados com segurança nos Secrets do Supabase.
              </p>
            </div>
            <button
              onClick={() => setShowNovaConexao(true)}
              className="py-2 px-4 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-extrabold uppercase rounded-xl text-xs flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nova Conexão</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {conexoes.map((con) => (
              <div key={con.id} className="bg-[#0A0B0D] border border-[#1D2026] rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <strong className="text-white text-sm">{con.nome}</strong>
                  {con.padrao && (
                    <span className="text-[10px] uppercase font-bold text-[#58E707] bg-[#58E707]/10 px-2 py-0.5 rounded border border-[#58E707]/30">
                      Padrão
                    </span>
                  )}
                </div>
                <div className="text-[#A7ADB5]">
                  <span>Tipo: <strong className="text-white uppercase font-mono">{con.tipo}</strong></span>
                </div>
                <div className="text-[#A7ADB5]">
                  <span>Número: <code className="text-[#58E707] font-mono">{con.numero}</code></span>
                </div>
              </div>
            ))}
          </div>

          {/* Modal Nova Conexão */}
          {showNovaConexao && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="max-w-md w-full bg-[#14161A] border border-[#1D2026] rounded-3xl p-6 space-y-4">
                <h3 className="text-base font-bold text-white uppercase">Cadastrar Conexão WhatsApp</h3>

                <form onSubmit={handleSalvarConexao} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[#A7ADB5] font-bold mb-1">Nome Identificador</label>
                    <input
                      type="text"
                      required
                      value={conNome}
                      onChange={(e) => setConNome(e.target.value)}
                      placeholder="Ex: WhatsApp Oficial da Loja"
                      className="w-full bg-[#0A0B0D] text-white p-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#A7ADB5] font-bold mb-1">Tipo de Conexão</label>
                    <select
                      value={conTipo}
                      onChange={(e) => setConTipo(e.target.value as TipoConexaoWhatsapp)}
                      className="w-full bg-[#0A0B0D] text-white p-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none"
                    >
                      <option value="manual">Manual (Abre link wa.me para o vendedor)</option>
                      <option value="cloud_api">Cloud API (WhatsApp Business verificado pela Meta)</option>
                      <option value="nao_oficial">Não Oficial (Gateway WhatsApp Web)</option>
                    </select>
                  </div>

                  {/* AVISO OBRIGATÓRIO SE NÃO OFICIAL */}
                  {conTipo === 'nao_oficial' && (
                    <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-xl text-amber-300 text-xs flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Aviso importante:</strong> Pode causar bloqueio do número. Use um número separado.
                      </span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[#A7ADB5] font-bold mb-1">Número com DDD</label>
                    <input
                      type="text"
                      required
                      value={conNumero}
                      onChange={(e) => setConNumero(e.target.value)}
                      placeholder="5513997011514"
                      className="w-full bg-[#0A0B0D] text-white p-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="con-padrao"
                      checked={conPadrao}
                      onChange={(e) => setConPadrao(e.target.checked)}
                      className="accent-[#58E707] rounded"
                    />
                    <label htmlFor="con-padrao" className="text-white cursor-pointer">
                      Definir como conexão padrão da loja
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowNovaConexao(false)}
                      className="py-2 px-4 bg-[#0A0B0D] text-[#A7ADB5] rounded-xl text-xs"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingCon}
                      className="py-2.5 px-5 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-bold rounded-xl text-xs uppercase"
                    >
                      {isSavingCon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Conexão'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
