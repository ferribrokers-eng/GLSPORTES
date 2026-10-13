import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Pedido, Tarefa } from '../../lib/supabaseTypes';
import { formatPrice } from '../../utils/helpers';
import { 
  TrendingUp, DollarSign, ShoppingCart, Percent, 
  AlertTriangle, Clock, CheckCircle2, ChevronRight, 
  Loader2, AlertCircle 
} from 'lucide-react';

interface Props {
  onNavigateOrder: (orderId: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const CrmDashboard: React.FC<Props> = ({ onNavigateOrder, onNavigateTab }) => {
  const { perfil } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
      }

      try {
        // Pedidos
        let query = supabase.from('pedidos').select('*, cliente:clientes(*), itens:pedido_itens(*)');
        if (perfil?.papel === 'vendedor') {
          query = query.or(`vendedor_id.eq.${perfil.id},vendedor_id.is.null`);
        }
        const { data: pData } = await query;
        setPedidos((pData as Pedido[]) || []);

        // Tarefas
        let tQuery = supabase.from('tarefas').select('*, pedido:pedidos(numero), cliente:clientes(nome)');
        if (perfil?.papel === 'vendedor') {
          tQuery = tQuery.eq('responsavel_id', perfil.id);
        }
        const { data: tData } = await tQuery;
        setTarefas((tData as Tarefa[]) || []);
      } catch (err) {
        console.warn('Erro ao carregar dados do dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [perfil?.id, perfil?.papel]);

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-[#A7ADB5] gap-3">
        <Loader2 className="w-8 h-8 text-[#58E707] animate-spin" />
        <span className="text-xs">Carregando indicadores do painel...</span>
      </div>
    );
  }

  // Cálculos do Mês
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const pedidosDoMes = pedidos.filter((p) => {
    const d = new Date(p.criado_em);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && p.status !== 'cancelado';
  });

  const faturamentoMes = pedidosDoMes.reduce((acc, p) => acc + Number(p.valor_total || 0), 0);
  const ticketMedio = pedidosDoMes.length > 0 ? faturamentoMes / pedidosDoMes.length : 0;

  // Taxa de conversão: pedidos que passaram de orçamento (ou seja, status além de novo/orcamento_enviado/cancelado)
  const pedidosComOrcamento = pedidosDoMes.length;
  const pedidosFechados = pedidosDoMes.filter(
    (p) => !['novo', 'orcamento_enviado', 'cancelado'].includes(p.status)
  ).length;
  const taxaConversao = pedidosComOrcamento > 0 ? (pedidosFechados / pedidosComOrcamento) * 100 : 0;

  // Tarefas de hoje e atrasadas
  const hojeStr = now.toISOString().split('T')[0];
  const tarefasAbertas = tarefas.filter((t) => !t.concluida_em);

  const tarefasAtrasadas = tarefasAbertas.filter((t) => {
    return new Date(t.vence_em) < now;
  });

  const tarefasHoje = tarefasAbertas.filter((t) => {
    const dStr = new Date(t.vence_em).toISOString().split('T')[0];
    return dStr === hojeStr;
  });

  // Pedidos com prazo_producao em até 3 dias ou vencido
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(now.getDate() + 3);

  const pedidosPrazoUrgente = pedidos.filter((p) => {
    if (!p.prazo_producao || ['entregue', 'cancelado'].includes(p.status)) return false;
    const prazo = new Date(p.prazo_producao);
    return prazo <= threeDaysFromNow;
  });

  return (
    <div className="space-y-6">
      {/* Título do Painel */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black font-sport uppercase text-white tracking-tight">
            Painel Geral
          </h1>
          <p className="text-xs text-[#A7ADB5] mt-0.5">
            Métricas comerciais, prazos de confecção e tarefas operacionais.
          </p>
        </div>
        <span className="text-xs font-mono bg-[#14161A] border border-[#1D2026] px-3 py-1.5 rounded-xl text-[#58E707]">
          {now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
        </span>
      </div>

      {/* 4 CARDS DE MÉTRICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pedidos do Mês */}
        <div className="bg-[#14161A] border border-[#1D2026] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-[#A7ADB5]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pedidos do Mês</span>
            <div className="w-8 h-8 rounded-lg bg-[#0A0B0D] border border-[#1D2026] flex items-center justify-center text-[#58E707]">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono font-black text-2xl text-white">
            {pedidosDoMes.length}
          </div>
          <p className="text-[11px] text-[#A7ADB5]">Pedidos ativos no período</p>
        </div>

        {/* Faturamento do Mês */}
        <div className="bg-[#14161A] border border-[#1D2026] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-[#A7ADB5]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Faturamento</span>
            <div className="w-8 h-8 rounded-lg bg-[#0A0B0D] border border-[#1D2026] flex items-center justify-center text-[#58E707]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono font-black text-2xl text-[#58E707]">
            {formatPrice(faturamentoMes)}
          </div>
          <p className="text-[11px] text-[#A7ADB5]">Valor total orçado/fechado</p>
        </div>

        {/* Ticket Médio */}
        <div className="bg-[#14161A] border border-[#1D2026] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-[#A7ADB5]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Ticket Médio</span>
            <div className="w-8 h-8 rounded-lg bg-[#0A0B0D] border border-[#1D2026] flex items-center justify-center text-[#026FF6]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono font-black text-2xl text-white">
            {formatPrice(ticketMedio)}
          </div>
          <p className="text-[11px] text-[#A7ADB5]">Média por pedido</p>
        </div>

        {/* Taxa de Conversão */}
        <div className="bg-[#14161A] border border-[#1D2026] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-[#A7ADB5]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Taxa Conversão</span>
            <div className="w-8 h-8 rounded-lg bg-[#0A0B0D] border border-[#1D2026] flex items-center justify-center text-[#58E707]">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono font-black text-2xl text-[#58E707]">
            {taxaConversao.toFixed(1)}%
          </div>
          <p className="text-[11px] text-[#A7ADB5]">Orçamento → Pedido aprovado</p>
        </div>
      </div>

      {/* ALERTAS DE PRAZO DE PRODUÇÃO VENCENDO (EM VERMELHO) */}
      {pedidosPrazoUrgente.length > 0 && (
        <div className="bg-[#14161A] border-2 border-rose-500/60 rounded-3xl p-5 sm:p-6 space-y-3 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 animate-pulse" />
              <h3 className="font-bold uppercase text-sm font-sport">
                Prazos Críticos de Produção ({pedidosPrazoUrgente.length} pedidos em até 3 dias ou vencidos)
              </h3>
            </div>
            <span className="text-[10px] font-black uppercase text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/30">
              Ação Imediata
            </span>
          </div>

          <div className="divide-y divide-[#1D2026]">
            {pedidosPrazoUrgente.map((ped) => {
              const prazo = new Date(ped.prazo_producao!);
              const isExpired = prazo < now;

              return (
                <div
                  key={ped.id}
                  onClick={() => onNavigateOrder(ped.id)}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-[#181B20] px-2 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-white text-xs">
                      #{ped.numero}
                    </span>
                    <div>
                      <span className="text-xs font-semibold text-white block">
                        {ped.cliente?.nome || 'Cliente'}
                      </span>
                      <span className="text-[11px] text-[#A7ADB5] block">
                        Entrega prometida: {ped.data_entrega ? new Date(ped.data_entrega).toLocaleDateString('pt-BR') : 'Não informada'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg ${
                        isExpired
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      {isExpired ? 'VENCIDO!' : `Prazo: ${prazo.toLocaleDateString('pt-BR')}`}
                    </span>
                    <ChevronRight className="w-4 h-4 text-rose-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAREFAS DE HOJE E ATRASADAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tarefas Atrasadas */}
        <div className="bg-[#14161A] border border-[#1D2026] rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400 uppercase flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Tarefas Atrasadas ({tarefasAtrasadas.length})
            </span>
            <button
              onClick={() => onNavigateTab('tarefas')}
              className="text-[11px] text-[#58E707] hover:underline cursor-pointer"
            >
              Ver todas
            </button>
          </div>

          {tarefasAtrasadas.length === 0 ? (
            <p className="text-xs text-[#A7ADB5] py-4 text-center">
              Nenhuma tarefa atrasada. Parabéns equipe!
            </p>
          ) : (
            <div className="space-y-2">
              {tarefasAtrasadas.slice(0, 4).map((t) => (
                <div key={t.id} className="p-2.5 bg-[#0A0B0D] border border-rose-500/30 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-300">{t.tipo}</span>
                    <span className="text-[10px] text-rose-400 font-mono">
                      Venceu: {new Date(t.vence_em).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-[#A7ADB5] line-clamp-1">{t.descricao}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tarefas de Hoje */}
        <div className="bg-[#14161A] border border-[#1D2026] rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#58E707] uppercase flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Tarefas para Hoje ({tarefasHoje.length})
            </span>
            <button
              onClick={() => onNavigateTab('tarefas')}
              className="text-[11px] text-[#58E707] hover:underline cursor-pointer"
            >
              Ver todas
            </button>
          </div>

          {tarefasHoje.length === 0 ? (
            <p className="text-xs text-[#A7ADB5] py-4 text-center">
              Nenhuma tarefa pendente para hoje.
            </p>
          ) : (
            <div className="space-y-2">
              {tarefasHoje.slice(0, 4).map((t) => (
                <div key={t.id} className="p-2.5 bg-[#0A0B0D] border border-[#1D2026] rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{t.tipo}</span>
                    <span className="text-[10px] text-[#58E707] font-mono">Hoje</span>
                  </div>
                  <p className="text-[#A7ADB5] line-clamp-1">{t.descricao}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
