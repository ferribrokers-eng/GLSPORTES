import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { 
  Pedido, Orcamento, Arte, Pagamento, Producao, Envio, 
  PedidoListaItem, PedidoEvento, WhatsappMensagem, 
  STATUS_LABELS, EtapaProducao, MetodoPagamento, ModalidadeEnvio 
} from '../../lib/supabaseTypes';
import { formatPrice } from '../../utils/helpers';
import { UniformListSpreadsheet } from '../customer/UniformListSpreadsheet';
import { 
  ArrowLeft, Send, Upload, Check, CheckCircle2, AlertTriangle, 
  XCircle, Clock, MessageSquare, ExternalLink, Printer, 
  Scissors, PackageCheck, Truck, ShieldAlert, Loader2, DollarSign 
} from 'lucide-react';

interface Props {
  orderId: string;
  onBack: () => void;
}

type TabSecao = 
  | 'orcamento' 
  | 'arte' 
  | 'lista' 
  | 'pagamentos' 
  | 'producao' 
  | 'envio' 
  | 'historico' 
  | 'whatsapp';

export const CrmOrderDetail: React.FC<Props> = ({ orderId, onBack }) => {
  const { perfil } = useAuth();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [artes, setArtes] = useState<Arte[]>([]);
  const [lista, setLista] = useState<PedidoListaItem[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [producao, setProducao] = useState<Producao | null>(null);
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [eventos, setEventos] = useState<PedidoEvento[]>([]);
  const [mensagens, setMensagens] = useState<WhatsappMensagem[]>([]);

  const [activeTab, setActiveTab] = useState<TabSecao>('orcamento');
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Forms State
  // 1. Orçamento
  const [orcProdutos, setOrcProdutos] = useState<number>(0);
  const [orcFrete, setOrcFrete] = useState<number>(0);
  const [orcDesconto, setOrcDesconto] = useState<number>(0);
  const [orcValidade, setOrcValidade] = useState<string>('');
  const [isSubmittingOrc, setIsSubmittingOrc] = useState(false);

  // 2. Arte
  const [arteFile, setArteFile] = useState<File | null>(null);
  const [isUploadingArte, setIsUploadingArte] = useState(false);

  // 3. Pagamento
  const [pagValor, setPagValor] = useState<number>(0);
  const [pagMetodo, setPagMetodo] = useState<MetodoPagamento>('pix');
  const [pagComprovanteUrl, setPagComprovanteUrl] = useState<string>('');
  const [isSubmittingPag, setIsSubmittingPag] = useState(false);

  // 4. Envio
  const [envModalidade, setEnvModalidade] = useState<ModalidadeEnvio>('correios');
  const [envRastreio, setEnvRastreio] = useState<string>('');
  const [isSubmittingEnv, setIsSubmittingEnv] = useState(false);

  // 5. Cancelamento
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelMotivo, setCancelMotivo] = useState('');
  const [isCanceling, setIsCanceling] = useState(false);

  const fetchFullOrder = async () => {
    if (!isSupabaseConfigured || !orderId) return;

    try {
      const { data: pData, error: pError } = await supabase
        .from('pedidos')
        .select(`*, cliente:clientes(*), vendedor:perfis(*), itens:pedido_itens(*)`)
        .eq('id', orderId)
        .single();

      if (pError) throw pError;
      setPedido(pData as Pedido);

      const [
        { data: orcData },
        { data: artData },
        { data: lisData },
        { data: pagData },
        { data: prdData },
        { data: envData },
        { data: evtData },
        { data: msgData },
      ] = await Promise.all([
        supabase.from('orcamentos').select('*').eq('pedido_id', orderId).order('versao', { ascending: false }),
        supabase.from('artes').select('*').eq('pedido_id', orderId).order('versao', { ascending: false }),
        supabase.from('pedido_lista').select('*').eq('pedido_id', orderId),
        supabase.from('pagamentos').select('*').eq('pedido_id', orderId).order('criado_em', { ascending: false }),
        supabase.from('producao').select('*').eq('pedido_id', orderId).maybeSingle(),
        supabase.from('envios').select('*').eq('pedido_id', orderId).order('enviado_em', { ascending: false }),
        supabase.from('pedido_eventos').select('*').eq('pedido_id', orderId).order('criado_em', { ascending: false }),
        supabase.from('whatsapp_mensagens').select('*').eq('pedido_id', orderId).order('criado_em', { ascending: false }),
      ]);

      setOrcamentos((orcData as Orcamento[]) || []);
      setArtes((artData as Arte[]) || []);
      setLista((lisData as PedidoListaItem[]) || []);
      setPagamentos((pagData as Pagamento[]) || []);
      setProducao((prdData as Producao) || null);
      setEnvios((envData as Envio[]) || []);
      setEventos((evtData as PedidoEvento[]) || []);
      setMensagens((msgData as WhatsappMensagem[]) || []);

      if (orcData && orcData.length > 0) {
        const latest = orcData[0];
        setOrcProdutos(Number(latest.valor_produtos || 0));
        setOrcFrete(Number(latest.frete || 0));
        setOrcDesconto(Number(latest.desconto || 0));
      }
    } catch (err: any) {
      console.warn('Erro ao carregar detalhes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFullOrder();

    if (isSupabaseConfigured && orderId) {
      const channel = supabase
        .channel(`crm-order-detail-${orderId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos', filter: `id=eq.${orderId}` }, () => {
          fetchFullOrder();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-[#A7ADB5] gap-3">
        <Loader2 className="w-8 h-8 text-[#58E707] animate-spin" />
        <span className="text-xs">Carregando pedido da equipe...</span>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="p-6 bg-[#14161A] border border-[#1D2026] rounded-2xl text-center space-y-4">
        <p className="text-sm text-white">Pedido não encontrado.</p>
        <button onClick={onBack} className="py-2 px-4 bg-[#0A0B0D] border border-[#1D2026] text-white rounded-xl text-xs">
          Voltar
        </button>
      </div>
    );
  }

  // Cálculos financeiros
  const totalPagoConfirmado = pagamentos
    .filter((p) => p.confirmado_em)
    .reduce((acc, p) => acc + Number(p.valor || 0), 0);

  const valorTotalPedido = Number(pedido.valor_total || 0);
  const valorSinalEsperado = (valorTotalPedido * Number(pedido.sinal_percentual || 50)) / 100;
  const faltaSinal = Math.max(0, valorSinalEsperado - totalPagoConfirmado);
  const faltaTotal = Math.max(0, valorTotalPedido - totalPagoConfirmado);

  // AÇÃO 1: Enviar Orçamento (insere em orcamentos)
  const handleEnviarOrcamento = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingOrc(true);
    try {
      const nextVersao = (orcamentos[0]?.versao || 0) + 1;
      const { error } = await supabase.from('orcamentos').insert({
        pedido_id: pedido.id,
        versao: nextVersao,
        valor_produtos: orcProdutos,
        frete: orcFrete,
        desconto: orcDesconto,
        validade: orcValidade || null,
        enviado_em: new Date().toISOString(),
      });

      if (error) throw error;
      setFeedbackMsg({ type: 'ok', text: `Orçamento v${nextVersao} enviado com sucesso!` });
      fetchFullOrder();
    } catch (err: any) {
      setFeedbackMsg({ type: 'err', text: err.message || 'Erro ao enviar orçamento.' });
    } finally {
      setIsSubmittingOrc(false);
    }
  };

  // AÇÃO 2: Enviar Arte (upload no bucket artes e insere em artes)
  const handleUploadArte = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arteFile) return;

    setIsUploadingArte(true);
    try {
      const ext = arteFile.name.split('.').pop();
      const path = `${pedido.id}/${Date.now()}.${ext}`;

      let arquivoUrl = '';
      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('artes')
          .upload(path, arteFile);

        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage.from('artes').getPublicUrl(uploadData.path);
          arquivoUrl = urlData.publicUrl;
        }
      } catch (storageErr) {
        console.warn('Storage artes bucket fallback:', storageErr);
      }

      // Se o bucket de storage não estiver configurado no Supabase, salva como Data URL com segurança
      if (!arquivoUrl) {
        arquivoUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error('Erro ao processar imagem da arte.'));
          reader.readAsDataURL(arteFile);
        });
      }

      const nextVersao = (artes[0]?.versao || 0) + 1;

      const { error } = await supabase.from('artes').insert({
        pedido_id: pedido.id,
        versao: nextVersao,
        arquivo_url: arquivoUrl,
        enviada_em: new Date().toISOString(),
      });

      if (error) throw error;
      setFeedbackMsg({ type: 'ok', text: `Arte v${nextVersao} enviada para aprovação do cliente!` });
      setArteFile(null);
      fetchFullOrder();
    } catch (err: any) {
      setFeedbackMsg({ type: 'err', text: err.message || 'Erro ao enviar arte.' });
    } finally {
      setIsUploadingArte(false);
    }
  };

  // AÇÃO 3: Confirmar Pagamento (insere em pagamentos com confirmado_em = now())
  const handleConfirmarPagamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pagValor <= 0) return;

    setIsSubmittingPag(true);
    try {
      const { error } = await supabase.from('pagamentos').insert({
        pedido_id: pedido.id,
        valor: pagValor,
        metodo: pagMetodo,
        comprovante_url: pagComprovanteUrl || null,
        confirmado_em: new Date().toISOString(),
        registrado_por: perfil?.id || null,
      });

      if (error) throw error;
      setFeedbackMsg({ type: 'ok', text: 'Pagamento confirmado e registrado!' });
      setPagValor(0);
      setPagComprovanteUrl('');
      fetchFullOrder();
    } catch (err: any) {
      setFeedbackMsg({ type: 'err', text: err.message || 'Erro ao registrar pagamento.' });
    } finally {
      setIsSubmittingPag(false);
    }
  };

  // AÇÃO 4: Produção (botões em sequência)
  const handleAvancarProducao = async (etapa: EtapaProducao) => {
    try {
      if (!producao) {
        const { error } = await supabase.from('producao').insert({
          pedido_id: pedido.id,
          etapa,
          iniciada_em: new Date().toISOString(),
        });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('producao')
          .update({ etapa })
          .eq('pedido_id', pedido.id);
        if (error) throw error;
      }
      setFeedbackMsg({ type: 'ok', text: `Etapa de produção atualizada para ${etapa}!` });
      fetchFullOrder();
    } catch (err: any) {
      setFeedbackMsg({ type: 'err', text: err.message || 'Erro ao atualizar etapa.' });
    }
  };

  const handleFinalizarConferencia = async () => {
    try {
      const { error } = await supabase
        .from('producao')
        .update({ finalizada_em: new Date().toISOString(), etapa: 'conferencia' })
        .eq('pedido_id', pedido.id);
      if (error) throw error;
      setFeedbackMsg({ type: 'ok', text: 'Conferência finalizada com sucesso! O pedido foi marcado como PRONTO.' });
      fetchFullOrder();
    } catch (err: any) {
      setFeedbackMsg({ type: 'err', text: err.message || 'Erro ao finalizar conferência.' });
    }
  };

  // AÇÃO 5: Envio
  const handleConfirmarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingEnv(true);
    try {
      const { error } = await supabase.from('envios').insert({
        pedido_id: pedido.id,
        modalidade: envModalidade,
        codigo_rastreio: envRastreio.trim() || null,
        enviado_em: new Date().toISOString(),
      });

      if (error) throw error;
      setFeedbackMsg({ type: 'ok', text: 'Envio registrado com sucesso! O pedido foi para ENVIADO.' });
      fetchFullOrder();
    } catch (err: any) {
      setFeedbackMsg({ type: 'err', text: err.message || 'Erro ao registrar envio.' });
    } finally {
      setIsSubmittingEnv(false);
    }
  };

  // AÇÃO 6: Cancelar Pedido (Apenas Master/Admin, atualiza cancelado_em e cancelado_motivo)
  const handleCancelarPedido = async () => {
    if (!cancelMotivo.trim()) return;
    setIsCanceling(true);
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({
          cancelado_em: new Date().toISOString(),
          cancelado_motivo: cancelMotivo.trim(),
        })
        .eq('id', pedido.id);

      if (error) throw error;
      setShowCancelModal(false);
      setFeedbackMsg({ type: 'ok', text: 'Pedido cancelado.' });
      fetchFullOrder();
    } catch (err: any) {
      setFeedbackMsg({ type: 'err', text: err.message || 'Erro ao cancelar pedido.' });
    } finally {
      setIsCanceling(false);
    }
  };

  // Exportar grade para CSV
  const handleExportCsv = () => {
    if (lista.length === 0) return;
    const header = 'Nome,Numero,Tamanho,Observacao\n';
    const csvContent = header + lista.map((l) => `"${l.nome}","${l.numero}","${l.tamanho}","${l.observacao || ''}"`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `grade_uniformes_pedido_${pedido.numero}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isMasterOrAdmin = perfil?.papel === 'master' || perfil?.papel === 'admin';

  return (
    <div className="space-y-6">
      {/* Topo: Voltar + Identificação do Pedido */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 py-2 px-3.5 bg-[#14161A] hover:bg-[#1D2026] border border-[#1D2026] text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#58E707]" />
          <span>Voltar ao Quadro de Pedidos</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="font-mono font-black text-xl text-white">
            Pedido #{pedido.numero}
          </span>
          <span className="text-xs uppercase font-extrabold text-[#58E707] bg-[#58E707]/15 border border-[#58E707]/30 px-3 py-1 rounded-full">
            {STATUS_LABELS[pedido.status] || pedido.status}
          </span>

          {/* Botão Cancelar (Apenas Admin/Master) */}
          {isMasterOrAdmin && pedido.status !== 'cancelado' && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="py-1.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Cancelar Pedido
            </button>
          )}
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 ${
            feedbackMsg.type === 'ok'
              ? 'bg-[#58E707]/15 border-[#58E707]/40 text-[#58E707]'
              : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
          }`}
        >
          {feedbackMsg.type === 'ok' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Cartão de Dados do Cliente e Pedido */}
      <div className="bg-[#14161A] border border-[#1D2026] rounded-3xl p-5 sm:p-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-[#A7ADB5] block text-[11px] uppercase font-bold">Cliente</span>
          <strong className="text-white text-sm block">{pedido.cliente?.nome || 'Cliente'}</strong>
          <span className="text-[#A7ADB5] block">{pedido.cliente?.whatsapp || 'Sem WhatsApp'}</span>
        </div>

        <div>
          <span className="text-[#A7ADB5] block text-[11px] uppercase font-bold">Canal & Funil</span>
          <span className="text-white block uppercase font-mono font-bold">{pedido.canal}</span>
          <span className="text-[#58E707] block font-semibold">{pedido.funil}</span>
        </div>

        <div>
          <span className="text-[#A7ADB5] block text-[11px] uppercase font-bold">Data de Entrega</span>
          <span className="text-white block font-mono">
            {pedido.data_entrega ? new Date(pedido.data_entrega).toLocaleDateString('pt-BR') : 'Não definida'}
          </span>
          <span className="text-[10px] text-[#A7ADB5] block">
            Prazo prod.: {pedido.prazo_producao ? new Date(pedido.prazo_producao).toLocaleDateString('pt-BR') : '-'}
          </span>
        </div>

        <div>
          <span className="text-[#A7ADB5] block text-[11px] uppercase font-bold">Financeiro</span>
          <span className="font-mono font-bold text-white text-sm block">
            Total: {formatPrice(valorTotalPedido)}
          </span>
          <span className="text-[11px] text-[#58E707] block font-mono">
            Pago: {formatPrice(totalPagoConfirmado)}
          </span>
        </div>
      </div>

      {/* TABS DE AÇÕES DA EQUIPE */}
      <div className="border-b border-[#1D2026] flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'orcamento', label: '1. Orçamento' },
          { id: 'arte', label: '2. Arte' },
          { id: 'lista', label: '3. Grade / Lista' },
          { id: 'pagamentos', label: '4. Pagamentos' },
          { id: 'producao', label: '5. Produção' },
          { id: 'envio', label: '6. Envio' },
          { id: 'whatsapp', label: '7. WhatsApp' },
          { id: 'historico', label: '8. Histórico' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabSecao)}
            className={`py-2 px-4 rounded-xl font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#58E707] text-[#0A0B0D]'
                : 'text-[#A7ADB5] hover:text-white hover:bg-[#14161A]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTEÚDO DAS TABS */}

      {/* 1. ABA ORÇAMENTO */}
      {activeTab === 'orcamento' && (
        <div className="bg-[#14161A] border border-[#1D2026] rounded-3xl p-6 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white uppercase">Registrar e Enviar Orçamento</h3>
            <p className="text-xs text-[#A7ADB5]">
              Ao enviar o orçamento, o sistema avisa o cliente e atualiza o pedido para "Orçamento Enviado".
            </p>
          </div>

          <form onSubmit={handleEnviarOrcamento} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[#A7ADB5] font-bold mb-1">Valor dos Produtos (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={orcProdutos}
                  onChange={(e) => setOrcProdutos(Number(e.target.value))}
                  className="w-full bg-[#0A0B0D] text-white p-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[#A7ADB5] font-bold mb-1">Frete (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={orcFrete}
                  onChange={(e) => setOrcFrete(Number(e.target.value))}
                  className="w-full bg-[#0A0B0D] text-white p-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[#A7ADB5] font-bold mb-1">Desconto (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={orcDesconto}
                  onChange={(e) => setOrcDesconto(Number(e.target.value))}
                  className="w-full bg-[#0A0B0D] text-white p-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[#A7ADB5] font-bold mb-1">Validade do Orçamento</label>
                <input
                  type="date"
                  value={orcValidade}
                  onChange={(e) => setOrcValidade(e.target.value)}
                  className="w-full bg-[#0A0B0D] text-white p-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="p-3 bg-[#0A0B0D] rounded-xl border border-[#1D2026] flex items-center justify-between">
              <span className="text-[#A7ADB5]">Valor Total Calculado:</span>
              <span className="font-mono font-black text-base text-[#58E707]">
                {formatPrice(orcProdutos + orcFrete - orcDesconto)}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmittingOrc}
              className="py-3 px-5 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-extrabold uppercase rounded-xl flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(88,231,7,0.3)]"
            >
              {isSubmittingOrc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Enviar Orçamento para o Cliente</span>
            </button>
          </form>

          {/* Histórico de Orçamentos */}
          {orcamentos.length > 0 && (
            <div className="pt-4 border-t border-[#1D2026] space-y-3">
              <span className="text-xs font-bold text-white uppercase block">Histórico de Versões</span>
              <div className="divide-y divide-[#1D2026]">
                {orcamentos.map((orc) => (
                  <div key={orc.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-white">Versão #{orc.versao}</strong>
                      <span className="text-[#A7ADB5] ml-2">Total: {formatPrice(orc.valor_total)}</span>
                    </div>
                    <div>
                      {orc.aceito_em ? (
                        <span className="text-[#58E707] font-bold">Aceito pelo cliente</span>
                      ) : orc.recusado_em ? (
                        <span className="text-rose-400 font-bold">Recusado</span>
                      ) : (
                        <span className="text-[#A7ADB5]">Aguardando resposta</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. ABA ARTE */}
      {activeTab === 'arte' && (
        <div className="bg-[#14161A] border border-[#1D2026] rounded-3xl p-6 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white uppercase">Upload da Arte da Confecção</h3>
            <p className="text-xs text-[#A7ADB5]">
              Envie a imagem ou mock da arte (PNG, JPG). O cliente receberá para aprovação imediata.
            </p>
          </div>

          <form onSubmit={handleUploadArte} className="space-y-4 text-xs">
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setArteFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-[#A7ADB5] file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#0A0B0D] file:text-[#58E707] hover:file:bg-[#1D2026] cursor-pointer"
            />

            <button
              type="submit"
              disabled={isUploadingArte || !arteFile}
              className="py-3 px-5 bg-[#58E707] hover:bg-[#69f219] disabled:opacity-50 text-[#0A0B0D] font-extrabold uppercase rounded-xl flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(88,231,7,0.3)]"
            >
              {isUploadingArte ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span>Subir Nova Versão da Arte</span>
            </button>
          </form>

          {/* Histórico de Artes */}
          {artes.length > 0 && (
            <div className="pt-4 border-t border-[#1D2026] space-y-4">
              <span className="text-xs font-bold text-white uppercase block">Histórico de Artes</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {artes.map((art) => (
                  <div key={art.id} className="bg-[#0A0B0D] border border-[#1D2026] rounded-2xl p-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <strong className="text-white">Versão #{art.versao}</strong>
                      {art.aprovada_em ? (
                        <span className="text-[#58E707] font-bold">Aprovada por {art.aprovada_por}</span>
                      ) : art.reprovada_em ? (
                        <span className="text-rose-400 font-bold">Ajuste Solicitado</span>
                      ) : (
                        <span className="text-[#A7ADB5]">Em Aprovação</span>
                      )}
                    </div>

                    <img
                      src={art.arquivo_url}
                      alt={`Arte v${art.versao}`}
                      className="h-40 w-full object-contain rounded-lg bg-[#14161A] p-2"
                    />

                    {art.comentario_cliente && (
                      <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-300 text-[11px]">
                        <strong>Comentário do cliente:</strong> {art.comentario_cliente}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. ABA GRADE / LISTA */}
      {activeTab === 'lista' && (
        <div className="bg-[#14161A] border border-[#1D2026] rounded-3xl p-6 space-y-4">
          <UniformListSpreadsheet
            initialRows={lista}
            onExportCsv={handleExportCsv}
            onSaveDraft={async (rows) => {
              const { error } = await supabase.rpc('salvar_lista', {
                p_pedido: pedido.id,
                linhas: rows,
                confirmar: false,
              });
              if (error) throw error;
              fetchFullOrder();
            }}
          />
        </div>
      )}

      {/* 4. ABA PAGAMENTOS */}
      {activeTab === 'pagamentos' && (
        <div className="bg-[#14161A] border border-[#1D2026] rounded-3xl p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0A0B0D] p-4 rounded-2xl border border-[#1D2026] text-xs">
            <div>
              <span className="text-[#A7ADB5] block">Sinal Mínimo ({pedido.sinal_percentual}%)</span>
              <span className="font-bold font-mono text-white text-base">
                {formatPrice(valorSinalEsperado)}
              </span>
            </div>
            <div>
              <span className="text-[#A7ADB5] block">Falta para Sinal</span>
              <span className={`font-bold font-mono text-base ${faltaSinal > 0 ? 'text-amber-400' : 'text-[#58E707]'}`}>
                {formatPrice(faltaSinal)}
              </span>
            </div>
            <div>
              <span className="text-[#A7ADB5] block">Saldo Restante Total</span>
              <span className="font-bold font-mono text-base text-[#58E707]">
                {formatPrice(faltaTotal)}
              </span>
            </div>
          </div>

          <form onSubmit={handleConfirmarPagamento} className="space-y-4 text-xs">
            <h4 className="font-bold text-white uppercase">Registrar Novo Pagamento</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[#A7ADB5] font-bold mb-1">Valor Pago (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={pagValor}
                  onChange={(e) => setPagValor(Number(e.target.value))}
                  className="w-full bg-[#0A0B0D] text-white p-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[#A7ADB5] font-bold mb-1">Método</label>
                <select
                  value={pagMetodo}
                  onChange={(e) => setPagMetodo(e.target.value as MetodoPagamento)}
                  className="w-full bg-[#0A0B0D] text-white p-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none"
                >
                  <option value="pix">Pix</option>
                  <option value="cartao_credito">Cartão de Crédito</option>
                  <option value="cartao_debito">Cartão de Débito</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="boleto">Boleto</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-[#A7ADB5] font-bold mb-1">URL do Comprovante (opcional)</label>
                <input
                  type="text"
                  value={pagComprovanteUrl}
                  onChange={(e) => setPagComprovanteUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#0A0B0D] text-white p-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingPag || pagValor <= 0}
              className="py-2.5 px-5 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-extrabold uppercase rounded-xl flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(88,231,7,0.3)]"
            >
              {isSubmittingPag ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 stroke-[3]" />}
              <span>Confirmar Pagamento</span>
            </button>
          </form>

          {/* Lista de Pagamentos */}
          <div className="pt-4 border-t border-[#1D2026] space-y-2">
            <span className="text-xs font-bold text-white uppercase block">Pagamentos Registrados</span>
            {pagamentos.map((p) => (
              <div key={p.id} className="p-3 bg-[#0A0B0D] border border-[#1D2026] rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-white">{formatPrice(p.valor)}</span>
                  <span className="text-[#A7ADB5] ml-2 uppercase font-mono">({p.metodo})</span>
                </div>
                <div className="flex items-center gap-3">
                  {p.comprovante_url && (
                    <a href={p.comprovante_url} target="_blank" rel="noreferrer" className="text-[#58E707] hover:underline flex items-center gap-1">
                      <span>Ver Comprovante</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {p.confirmado_em ? (
                    <span className="text-[#58E707] font-bold">Confirmado</span>
                  ) : (
                    <span className="text-amber-400">Pendente de Confirmação</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. ABA PRODUÇÃO */}
      {activeTab === 'producao' && (
        <div className="bg-[#14161A] border border-[#1D2026] rounded-3xl p-6 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white uppercase">Fluxo da Linha de Produção</h3>
            <p className="text-xs text-[#A7ADB5]">
              Avance as etapas conforme a fábrica executa a sublimação e costura dos uniformes.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { key: 'impressao', label: '1. Impressão', icon: Printer },
              { key: 'prensa', label: '2. Prensa', icon: Scissors },
              { key: 'costura', label: '3. Costura', icon: Scissors },
              { key: 'conferencia', label: '4. Conferência', icon: PackageCheck },
            ].map((et) => {
              const isSelected = producao?.etapa === et.key;
              const Icon = et.icon;

              return (
                <button
                  key={et.key}
                  type="button"
                  onClick={() => handleAvancarProducao(et.key as EtapaProducao)}
                  className={`p-4 rounded-2xl border text-center space-y-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#58E707] text-[#0A0B0D] border-[#58E707] shadow-[0_0_20px_rgba(88,231,7,0.3)]'
                      : 'bg-[#0A0B0D] text-white border-[#1D2026] hover:border-[#58E707]/50'
                  }`}
                >
                  <Icon className="w-6 h-6 mx-auto" />
                  <span className="text-xs font-black uppercase block tracking-wider">{et.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#1D2026] flex justify-end">
            <button
              onClick={handleFinalizarConferencia}
              className="py-3 px-6 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-extrabold uppercase rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(88,231,7,0.3)]"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Finalizar Conferência (Pedido Pronto)</span>
            </button>
          </div>
        </div>
      )}

      {/* 6. ABA ENVIO */}
      {activeTab === 'envio' && (
        <div className="bg-[#14161A] border border-[#1D2026] rounded-3xl p-6 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white uppercase">Despacho e Rastreamento</h3>
            <p className="text-xs text-[#A7ADB5]">
              Registre a transportadora ou código dos Correios. O pedido irá para "Enviado".
            </p>
          </div>

          <form onSubmit={handleConfirmarEnvio} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#A7ADB5] font-bold mb-1">Modalidade de Envio</label>
                <select
                  value={envModalidade}
                  onChange={(e) => setEnvModalidade(e.target.value as ModalidadeEnvio)}
                  className="w-full bg-[#0A0B0D] text-white p-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none"
                >
                  <option value="correios">Correios (SEDEX / PAC)</option>
                  <option value="transportadora">Transportadora</option>
                  <option value="motoboy">Motoboy Express</option>
                  <option value="retirada">Retirada na Fábrica</option>
                </select>
              </div>

              <div>
                <label className="block text-[#A7ADB5] font-bold mb-1">Código de Rastreio</label>
                <input
                  type="text"
                  value={envRastreio}
                  onChange={(e) => setEnvRastreio(e.target.value)}
                  placeholder="Ex: QB123456789BR"
                  className="w-full bg-[#0A0B0D] text-white p-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingEnv}
              className="py-3 px-6 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-extrabold uppercase rounded-xl flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(88,231,7,0.3)]"
            >
              {isSubmittingEnv ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
              <span>Registrar Envio do Pedido</span>
            </button>
          </form>
        </div>
      )}

      {/* 7. ABA WHATSAPP */}
      {activeTab === 'whatsapp' && (
        <div className="bg-[#14161A] border border-[#1D2026] rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase">Mensagens do Pedido</h3>
          {mensagens.length === 0 ? (
            <p className="text-xs text-[#A7ADB5] py-4 text-center">Nenhuma mensagem registrada para este pedido.</p>
          ) : (
            <div className="space-y-3">
              {mensagens.map((msg) => (
                <div key={msg.id} className="p-3.5 bg-[#0A0B0D] border border-[#1D2026] rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white uppercase font-mono">{msg.modelo_chave || 'Notificação'}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${msg.status === 'enviada' ? 'bg-[#58E707]/15 text-[#58E707]' : 'bg-amber-500/15 text-amber-400'}`}>
                      {msg.status}
                    </span>
                  </div>
                  <p className="text-[#A7ADB5] whitespace-pre-wrap">{msg.texto}</p>
                  {msg.status === 'manual' && (
                    <div className="pt-1 flex items-center gap-3">
                      <a
                        href={`https://wa.me/55${msg.numero.replace(/\D/g, '')}?text=${encodeURIComponent(msg.texto)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-1.5 px-3 bg-[#58E707] text-[#0A0B0D] font-black uppercase rounded-lg text-[11px] flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Abrir no WhatsApp</span>
                      </a>
                      <button
                        onClick={async () => {
                          await supabase.from('whatsapp_mensagens').update({ status: 'enviada', enviada_em: new Date().toISOString() }).eq('id', msg.id);
                          fetchFullOrder();
                        }}
                        className="py-1.5 px-3 bg-[#14161A] text-white hover:bg-[#1D2026] rounded-lg text-[11px] font-bold"
                      >
                        Marcar como enviada
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 8. ABA HISTÓRICO */}
      {activeTab === 'historico' && (
        <div className="bg-[#14161A] border border-[#1D2026] rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase">Linha do Tempo de Eventos</h3>
          <div className="divide-y divide-[#1D2026]">
            {eventos.map((ev) => (
              <div key={ev.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#A7ADB5]">Status anterior: <strong>{ev.status_anterior || 'Início'}</strong></span>
                  <span className="mx-2">→</span>
                  <span className="text-[#58E707] font-bold uppercase">{STATUS_LABELS[ev.status_novo] || ev.status_novo}</span>
                </div>
                <span className="text-[#A7ADB5] font-mono text-[11px]">
                  {new Date(ev.criado_em).toLocaleString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL CANCELAR PEDIDO */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#14161A] border border-[#1D2026] rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white uppercase flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-400" />
              Cancelar Pedido #{pedido.numero}
            </h3>
            <p className="text-xs text-[#A7ADB5]">
              Informe o motivo do cancelamento. Essa ação registra o cancelamento definitivo do pedido.
            </p>
            <textarea
              rows={3}
              required
              value={cancelMotivo}
              onChange={(e) => setCancelMotivo(e.target.value)}
              placeholder="Ex: Desistência do cliente, prazo inviável..."
              className="w-full bg-[#0A0B0D] text-white text-xs p-3 rounded-xl border border-[#1D2026] focus:border-rose-500 focus:outline-none"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="py-2 px-4 bg-[#0A0B0D] text-[#A7ADB5] rounded-xl text-xs"
              >
                Voltar
              </button>
              <button
                type="button"
                disabled={isCanceling || !cancelMotivo.trim()}
                onClick={handleCancelarPedido}
                className="py-2 px-5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold uppercase"
              >
                {isCanceling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Cancelamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
