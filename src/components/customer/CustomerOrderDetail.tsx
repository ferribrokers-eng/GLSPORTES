import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { 
  Pedido, Orcamento, Arte, Pagamento, Envio, PedidoListaItem,
  STATUS_LABELS, PedidoStatus 
} from '../../lib/supabaseTypes';
import { formatPrice } from '../../utils/helpers';
import { CONFIG } from '../../config';
import { UniformListSpreadsheet } from './UniformListSpreadsheet';
import { 
  ArrowLeft, Check, CheckCircle2, AlertCircle, Clock, 
  Upload, Copy, ExternalLink, MessageSquare, ShieldCheck, 
  Truck, Eye, Loader2, Sparkles, PhoneCall 
} from 'lucide-react';

interface Props {
  orderId: string;
  onBack: () => void;
}

// 9 etapas da timeline
const TIMELINE_STAGES: { id: string; label: string; statuses: PedidoStatus[] }[] = [
  { id: '1', label: 'Recebido', statuses: ['novo'] },
  { id: '2', label: 'Orçamento', statuses: ['orcamento_enviado'] },
  { id: '3', label: 'Arte', statuses: ['criando_arte', 'arte_em_aprovacao'] },
  { id: '4', label: 'Lista', statuses: ['aguardando_lista'] },
  { id: '5', label: 'Pagamento', statuses: ['aguardando_sinal'] },
  { id: '6', label: 'Produção', statuses: ['em_producao'] },
  { id: '7', label: 'Pronto', statuses: ['pronto'] },
  { id: '8', label: 'Enviado', statuses: ['enviado'] },
  { id: '9', label: 'Entregue', statuses: ['entregue'] },
];

export const CustomerOrderDetail: React.FC<Props> = ({ orderId, onBack }) => {
  const { cliente } = useAuth();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [artes, setArtes] = useState<Arte[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [envio, setEnvio] = useState<Envio | null>(null);
  const [lista, setLista] = useState<PedidoListaItem[]>([]);
  const [pixChave, setPixChave] = useState<string>(CONFIG.whatsappFormatted);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Ações modais/inputs
  const [aprovaNome, setAprovaNome] = useState('');
  const [showAprovaModal, setShowAprovaModal] = useState(false);
  const [ajusteComentario, setAjusteComentario] = useState('');
  const [showAjusteModal, setShowAjusteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Upload comprovante
  const [comprovanteFile, setComprovanteFile] = useState<File | null>(null);
  const [isUploadingComprovante, setIsUploadingComprovante] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);

  const fetchOrderDetails = async () => {
    if (!isSupabaseConfigured || !orderId) return;

    try {
      // 1. Pedido + itens
      const { data: pData, error: pError } = await supabase
        .from('pedidos')
        .select(`*, itens:pedido_itens(*)`)
        .eq('id', orderId)
        .single();

      if (pError) throw pError;
      setPedido(pData as Pedido);

      // 2. Orçamentos
      const { data: orcData } = await supabase
        .from('orcamentos')
        .select('*')
        .eq('pedido_id', orderId)
        .order('versao', { ascending: false });
      setOrcamentos((orcData as Orcamento[]) || []);

      // 3. Artes
      const { data: artesData } = await supabase
        .from('artes')
        .select('*')
        .eq('pedido_id', orderId)
        .order('versao', { ascending: false });
      setArtes((artesData as Arte[]) || []);

      // 4. Lista
      const { data: listaData } = await supabase
        .from('pedido_lista')
        .select('*')
        .eq('pedido_id', orderId);
      setLista((listaData as PedidoListaItem[]) || []);

      // 5. Pagamentos
      const { data: pagData } = await supabase
        .from('pagamentos')
        .select('*')
        .eq('pedido_id', orderId)
        .order('criado_em', { ascending: false });
      setPagamentos((pagData as Pagamento[]) || []);

      // 6. Envio
      const { data: envData } = await supabase
        .from('envios')
        .select('*')
        .eq('pedido_id', orderId)
        .maybeSingle();
      setEnvio((envData as Envio) || null);

      // 7. Configurações Pix
      const { data: cfgData } = await supabase
        .from('configuracoes')
        .select('valor')
        .eq('chave', 'whatsapp_loja')
        .maybeSingle();
      if (cfgData?.valor) {
        setPixChave(cfgData.valor);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao carregar detalhes do pedido.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();

    // Supabase Realtime no pedido
    if (isSupabaseConfigured && orderId) {
      const channel = supabase
        .channel(`pedido-detail-${orderId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'pedidos',
            filter: `id=eq.${orderId}`,
          },
          () => {
            fetchOrderDetails();
          }
        )
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
        <span className="text-xs">Carregando pedido...</span>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="p-6 bg-[#14161A] border border-[#1D2026] rounded-3xl text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
        <p className="text-sm text-white">Pedido não encontrado.</p>
        <button
          onClick={onBack}
          className="py-2 px-4 bg-[#0A0B0D] border border-[#1D2026] text-white text-xs rounded-xl cursor-pointer"
        >
          Voltar aos meus pedidos
        </button>
      </div>
    );
  }

  // Identifica índice do estágio atual na timeline
  const currentStageIndex = TIMELINE_STAGES.findIndex((st) =>
    st.statuses.includes(pedido.status)
  );

  const activeOrcamento = orcamentos.find((o) => o.enviado_em && !o.recusado_em);
  const latestArte = artes[0];

  // Ação: Aceitar orçamento
  const handleAceitarOrcamento = async () => {
    if (!activeOrcamento) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.rpc('aceitar_orcamento', {
        p_orcamento: activeOrcamento.id,
      });
      if (error) throw error;
      setActionSuccess('Orçamento aprovado com sucesso! Iniciando criação da arte.');
      fetchOrderDetails();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao aceitar orçamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ação: Aprovar arte
  const handleAprovarArte = async () => {
    if (!latestArte || !aprovaNome.trim()) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.rpc('aprovar_arte', {
        p_arte: latestArte.id,
        p_nome: aprovaNome.trim(),
      });
      if (error) throw error;
      setShowAprovaModal(false);
      setActionSuccess('Arte aprovada com sucesso!');
      fetchOrderDetails();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao aprovar arte.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ação: Pedir ajuste na arte
  const handlePedirAjuste = async () => {
    if (!latestArte || !ajusteComentario.trim()) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.rpc('pedir_ajuste_arte', {
        p_arte: latestArte.id,
        p_comentario: ajusteComentario.trim(),
      });
      if (error) throw error;
      setShowAjusteModal(false);
      setActionSuccess('Ajuste solicitado ao designer da GL Sports.');
      fetchOrderDetails();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao solicitar ajuste.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ação: Salvar ou confirmar lista de uniformes
  const handleSaveLista = async (linhas: PedidoListaItem[], confirmar: boolean) => {
    const { error } = await supabase.rpc('salvar_lista', {
      p_pedido: pedido.id,
      linhas: linhas.map((l) => ({
        nome: l.nome,
        numero: l.numero,
        tamanho: l.tamanho,
        observacao: l.observacao,
      })),
      confirmar,
    });
    if (error) throw error;
    fetchOrderDetails();
  };

  // Ação: Confirmar entrega do pedido
  const handleConfirmarEntrega = async () => {
    if (!window.confirm('Confirma que recebeu o seu pedido?')) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.rpc('confirmar_entrega', {
        p_pedido: pedido.id,
      });
      if (error) throw error;
      setActionSuccess('Entrega confirmada! Muito obrigado por escolher a GL Sports!');
      fetchOrderDetails();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao confirmar entrega.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ação: Enviar comprovante de Pix
  const handleUploadComprovante = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comprovanteFile) return;

    setIsUploadingComprovante(true);
    try {
      const fileExt = comprovanteFile.name.split('.').pop();
      const fileName = `${pedido.id}/${Date.now()}.${fileExt}`;

      let comprovanteUrl = '';
      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('comprovantes')
          .upload(fileName, comprovanteFile);

        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage
            .from('comprovantes')
            .getPublicUrl(uploadData.path);
          comprovanteUrl = urlData.publicUrl;
        }
      } catch (storageErr) {
        console.warn('Storage comprovantes bucket fallback:', storageErr);
      }

      if (!comprovanteUrl) {
        comprovanteUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error('Erro ao processar imagem do comprovante.'));
          reader.readAsDataURL(comprovanteFile);
        });
      }

      const valorSinal = (Number(pedido.valor_total) * Number(pedido.sinal_percentual)) / 100;

      // Insere o pagamento como pendente de confirmação pela equipe
      const { error: pError } = await supabase.from('pagamentos').insert({
        pedido_id: pedido.id,
        valor: valorSinal > 0 ? valorSinal : 1,
        metodo: 'pix',
        comprovante_url: comprovanteUrl,
      });

      if (pError) throw pError;

      setActionSuccess('Comprovante enviado com sucesso! Nossa equipe irá validar o pagamento.');
      setComprovanteFile(null);
      fetchOrderDetails();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao enviar comprovante.');
    } finally {
      setIsUploadingComprovante(false);
    }
  };

  const copyPix = () => {
    navigator.clipboard.writeText(pixChave);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2500);
  };

  const valorSinal = (Number(pedido.valor_total) * Number(pedido.sinal_percentual)) / 100;

  return (
    <div className="space-y-6">
      {/* Botão Voltar e Cabeçalho do Pedido */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 py-2 px-3.5 bg-[#14161A] hover:bg-[#1D2026] border border-[#1D2026] text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#58E707]" />
          <span>Voltar para meus pedidos</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-white text-base">
            Pedido #{pedido.numero}
          </span>
          <span className="text-xs uppercase font-extrabold text-[#58E707] bg-[#58E707]/15 border border-[#58E707]/30 px-3 py-1 rounded-full">
            {STATUS_LABELS[pedido.status] || pedido.status}
          </span>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-[#58E707]/15 border border-[#58E707]/40 rounded-2xl flex items-center gap-3 text-[#58E707] text-xs">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-500/15 border border-rose-500/40 rounded-2xl flex items-center gap-3 text-rose-300 text-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 9 ETAPAS DA TIMELINE */}
      <div className="bg-[#14161A] border border-[#1D2026] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
        <h3 className="text-xs font-black uppercase text-[#58E707] tracking-wider">
          Linha do Tempo de Confecção
        </h3>

        <div className="overflow-x-auto pb-2">
          <div className="flex items-center min-w-[720px] justify-between relative">
            {/* Linha de fundo */}
            <div className="absolute left-4 right-4 top-4 h-0.5 bg-[#1D2026] -z-0" />

            {TIMELINE_STAGES.map((stage, idx) => {
              const isPast = currentStageIndex > idx;
              const isCurrent = currentStageIndex === idx;

              return (
                <div key={stage.id} className="flex flex-col items-center relative z-10 space-y-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isCurrent
                        ? 'bg-[#58E707] text-[#0A0B0D] ring-4 ring-[#58E707]/25 scale-110 shadow-[0_0_15px_rgba(88,231,7,0.5)]'
                        : isPast
                        ? 'bg-[#58E707]/20 border border-[#58E707] text-[#58E707]'
                        : 'bg-[#0A0B0D] border border-[#1D2026] text-[#A7ADB5]'
                    }`}
                  >
                    {isPast ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[11px] font-bold uppercase tracking-tight text-center whitespace-nowrap ${
                      isCurrent
                        ? 'text-[#58E707]'
                        : isPast
                        ? 'text-white'
                        : 'text-[#A7ADB5]/60'
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* BLOCOS DINÂMICOS CONFORME O STATUS DO PEDIDO */}

      {/* 1. Status: orcamento_enviado */}
      {pedido.status === 'orcamento_enviado' && activeOrcamento && (
        <div className="bg-[#14161A] border border-[#58E707]/40 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#1D2026] pb-3">
            <div>
              <span className="text-xs font-black uppercase text-[#58E707]">Ação Necessária</span>
              <h3 className="text-lg font-bold text-white">Orçamento da Fábrica Disponível</h3>
            </div>
            {activeOrcamento.validade && (
              <span className="text-xs text-[#A7ADB5]">
                Válido até: {new Date(activeOrcamento.validade).toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0A0B0D] p-4 rounded-2xl border border-[#1D2026] text-xs">
            <div>
              <span className="text-[#A7ADB5] block">Produtos</span>
              <span className="font-bold text-white text-sm">
                {formatPrice(activeOrcamento.valor_produtos)}
              </span>
            </div>
            <div>
              <span className="text-[#A7ADB5] block">Frete</span>
              <span className="font-bold text-white text-sm">
                {formatPrice(activeOrcamento.frete)}
              </span>
            </div>
            <div>
              <span className="text-[#A7ADB5] block">Desconto</span>
              <span className="font-bold text-rose-400 text-sm">
                - {formatPrice(activeOrcamento.desconto)}
              </span>
            </div>
            <div>
              <span className="text-[#58E707] font-bold block uppercase">Total com Frete</span>
              <span className="font-bold text-[#58E707] text-base">
                {formatPrice(activeOrcamento.valor_total)}
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleAceitarOrcamento}
              disabled={isSubmitting}
              className="py-3 px-6 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-black uppercase rounded-xl text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(88,231,7,0.3)] transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Aceitar Orçamento e Iniciar Arte</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 2. Status: arte_em_aprovacao */}
      {pedido.status === 'arte_em_aprovacao' && latestArte && (
        <div className="bg-[#14161A] border border-[#58E707]/40 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#1D2026] pb-3">
            <div>
              <span className="text-xs font-black uppercase text-[#58E707]">Aprovação Visual</span>
              <h3 className="text-lg font-bold text-white">
                Sua Arte Personalizada está Pronta (Versão #{latestArte.versao})
              </h3>
            </div>
          </div>

          <div className="bg-[#0A0B0D] rounded-2xl border border-[#1D2026] p-3 text-center overflow-hidden">
            <img
              src={latestArte.arquivo_url}
              alt="Arte do Uniforme"
              className="max-h-[420px] mx-auto object-contain rounded-xl shadow-lg"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setShowAjusteModal(true)}
              className="w-full sm:w-auto py-3 px-5 bg-[#0A0B0D] hover:bg-[#1D2026] border border-[#1D2026] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-[#A7ADB5]" />
              <span>Pedir Ajuste</span>
            </button>

            <button
              onClick={() => setShowAprovaModal(true)}
              className="w-full sm:w-auto py-3 px-6 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(88,231,7,0.3)] cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Aprovar Arte</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Status: aguardando_lista */}
      {pedido.status === 'aguardando_lista' && (
        <div className="bg-[#14161A] border border-[#58E707]/40 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="border-b border-[#1D2026] pb-3">
            <span className="text-xs font-black uppercase text-[#58E707]">Grade de Uniformes</span>
            <h3 className="text-lg font-bold text-white">Preencha os Nomes, Números e Tamanhos</h3>
            <p className="text-xs text-[#A7ADB5] mt-1">
              Cole sua lista direto do WhatsApp ou planilha Excel. Avise se houver números repetidos.
            </p>
          </div>

          <UniformListSpreadsheet
            initialRows={lista}
            onSaveDraft={(rows) => handleSaveLista(rows, false)}
            onConfirmList={(rows) => handleSaveLista(rows, true)}
          />
        </div>
      )}

      {/* 4. Status: aguardando_sinal */}
      {pedido.status === 'aguardando_sinal' && (
        <div className="bg-[#14161A] border border-[#58E707]/40 rounded-3xl p-6 space-y-5 shadow-xl">
          <div className="border-b border-[#1D2026] pb-3">
            <span className="text-xs font-black uppercase text-[#58E707]">Pagamento do Sinal</span>
            <h3 className="text-lg font-bold text-white">
              Sinal de {pedido.sinal_percentual}% para Entrada em Produção
            </h3>
            <p className="text-xs text-[#A7ADB5] mt-0.5">
              A produção dos uniformes é iniciada imediatamente após o envio do comprovante do sinal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box Chave Pix */}
            <div className="bg-[#0A0B0D] border border-[#1D2026] rounded-2xl p-5 space-y-3">
              <span className="text-[11px] font-bold text-[#A7ADB5] uppercase">
                Chave Pix da Loja GL Sports
              </span>
              <div className="flex items-center justify-between bg-[#14161A] p-3 rounded-xl border border-[#1D2026]">
                <code className="text-sm font-bold text-[#58E707] font-mono">
                  {pixChave}
                </code>
                <button
                  type="button"
                  onClick={copyPix}
                  className="py-1 px-2.5 bg-[#0A0B0D] hover:bg-[#1D2026] border border-[#1D2026] text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  {pixCopied ? <Check className="w-3.5 h-3.5 text-[#58E707]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{pixCopied ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>

              <div className="pt-1 flex items-center justify-between text-xs">
                <span className="text-[#A7ADB5]">Valor do Sinal ({pedido.sinal_percentual}%):</span>
                <span className="font-bold font-mono text-base text-[#58E707]">
                  {formatPrice(valorSinal)}
                </span>
              </div>
            </div>

            {/* Box Upload de Comprovante */}
            <form
              onSubmit={handleUploadComprovante}
              className="bg-[#0A0B0D] border border-[#1D2026] rounded-2xl p-5 space-y-3 flex flex-col justify-between"
            >
              <div>
                <span className="text-[11px] font-bold text-[#A7ADB5] uppercase block mb-1">
                  Enviar Comprovante de Pagamento
                </span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  required
                  onChange={(e) => setComprovanteFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-[#A7ADB5] file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#14161A] file:text-white hover:file:bg-[#1D2026] cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={isUploadingComprovante || !comprovanteFile}
                className="w-full py-2.5 px-4 bg-[#58E707] hover:bg-[#69f219] disabled:opacity-50 text-[#0A0B0D] font-black uppercase text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(88,231,7,0.3)]"
              >
                {isUploadingComprovante ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Enviar Comprovante</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. Status: enviado */}
      {pedido.status === 'enviado' && envio && (
        <div className="bg-[#14161A] border border-[#58E707]/40 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="border-b border-[#1D2026] pb-3">
            <span className="text-xs font-black uppercase text-[#58E707]">Rastreamento do Envio</span>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#58E707]" />
              Seu Pedido está a Caminho!
            </h3>
          </div>

          <div className="bg-[#0A0B0D] p-4 rounded-2xl border border-[#1D2026] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[#A7ADB5] block">Modalidade de Envio:</span>
              <strong className="text-white uppercase font-bold text-sm">
                {envio.modalidade}
              </strong>
            </div>

            {envio.codigo_rastreio && (
              <div>
                <span className="text-[#A7ADB5] block">Código de Rastreio:</span>
                <code className="text-[#58E707] font-bold font-mono text-sm">
                  {envio.codigo_rastreio}
                </code>
              </div>
            )}

            <button
              onClick={handleConfirmarEntrega}
              disabled={isSubmitting}
              className="py-2.5 px-5 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-extrabold uppercase rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(88,231,7,0.3)] cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Recebi meu pedido</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ITENS DO PEDIDO */}
      <div className="bg-[#14161A] border border-[#1D2026] rounded-3xl p-6 space-y-4 shadow-xl">
        <h3 className="text-xs font-black uppercase text-[#58E707]">Itens do Pedido</h3>
        <div className="divide-y divide-[#1D2026]">
          {pedido.itens?.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-[#0A0B0D] border border-[#1D2026] overflow-hidden flex-shrink-0">
                  {item.imagem_url ? (
                    <img src={item.imagem_url} alt={item.produto_nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#A7ADB5]">#</div>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{item.produto_nome}</h4>
                  <div className="flex items-center gap-2 text-xs text-[#A7ADB5] mt-0.5">
                    <span className="uppercase text-[11px] bg-[#0A0B0D] px-2 py-0.5 rounded border border-[#1D2026]">
                      {item.tipo_peca}
                    </span>
                    <span>Qtd: {item.quantidade} peças</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CANAL DIRETO COM A EQUIPE VIA WHATSAPP (APENAS APÓS CONTA CRIADA E PEDIDO ABERTO) */}
      <div className="bg-[#14161A] border border-[#1D2026] rounded-3xl p-6 space-y-3 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase text-[#58E707] tracking-wider">
              Suporte & Atendimento ao Cliente
            </span>
            <h4 className="text-base font-bold text-white">
              Precisa falar com a equipe sobre o Pedido #{pedido.numero}?
            </h4>
            <p className="text-xs text-[#A7ADB5]">
              Tire dúvidas sobre prazos, tamanhos especiais ou ajuste de arte diretamente com a diretoria de confecção.
            </p>
          </div>

          <a
            href={`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(
              `Olá equipe GL Sports! Sou cliente da conta ${cliente?.nome || 'cadastrada'} e gostaria de falar sobre o meu Pedido #${pedido.numero}.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 px-5 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-black uppercase text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(88,231,7,0.3)] shrink-0 cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 stroke-[2.5]" />
            <span>Falar com a Equipe no WhatsApp</span>
          </a>
        </div>
      </div>

      {/* MODAL: Aprovar Arte */}
      {showAprovaModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#14161A] border border-[#1D2026] rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white uppercase flex items-center gap-2">
              <Check className="w-5 h-5 text-[#58E707] stroke-[3]" />
              Confirmar Aprovação da Arte
            </h3>
            <p className="text-xs text-[#A7ADB5]">
              Por favor, digite seu nome completo para registrar a aprovação formal da estampa.
            </p>

            <input
              type="text"
              required
              value={aprovaNome}
              onChange={(e) => setAprovaNome(e.target.value)}
              placeholder="Seu nome completo"
              className="w-full bg-[#0A0B0D] text-white text-xs px-3.5 py-3 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAprovaModal(false)}
                className="py-2.5 px-4 bg-[#0A0B0D] text-[#A7ADB5] hover:text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSubmitting || !aprovaNome.trim()}
                onClick={handleAprovarArte}
                className="py-2.5 px-5 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] rounded-xl text-xs font-black uppercase cursor-pointer shadow-[0_0_15px_rgba(88,231,7,0.3)]"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Aprovação'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Pedir Ajuste na Arte */}
      {showAjusteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#14161A] border border-[#1D2026] rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white uppercase flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#58E707]" />
              Solicitar Ajuste na Arte
            </h3>
            <p className="text-xs text-[#A7ADB5]">
              Descreva detalhadamente as modificações desejadas na estampa (ex: trocar cor do brasão, mudar fonte do número, etc.).
            </p>

            <textarea
              rows={4}
              required
              value={ajusteComentario}
              onChange={(e) => setAjusteComentario(e.target.value)}
              placeholder="Descreva aqui os ajustes..."
              className="w-full bg-[#0A0B0D] text-white text-xs p-3 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none resize-none"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAjusteModal(false)}
                className="py-2.5 px-4 bg-[#0A0B0D] text-[#A7ADB5] hover:text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSubmitting || !ajusteComentario.trim()}
                onClick={handlePedirAjuste}
                className="py-2.5 px-5 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] rounded-xl text-xs font-black uppercase cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar Ajuste'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
