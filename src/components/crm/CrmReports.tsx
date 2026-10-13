import React, { useState, useEffect, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Pedido, FUNIL_LABELS } from '../../lib/supabaseTypes';
import { formatPrice } from '../../utils/helpers';
import { BarChart3, TrendingUp, Clock, AlertTriangle, PieChart, Loader2 } from 'lucide-react';

export const CrmReports: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('pedidos')
          .select(`
            *,
            cliente:clientes(uf, cidade),
            vendedor:perfis(nome),
            itens:pedido_itens(produto_nome)
          `);

        if (!error && data) {
          setPedidos(data as Pedido[]);
        }
      } catch (err) {
        console.warn('Erro ao carregar relatórios:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, []);

  // Métricas
  const now = new Date();

  // 1. Por Funil
  const vendasPorFunil = useMemo(() => {
    const acc: Record<string, { total: number; valor: number }> = {};
    pedidos.forEach((p) => {
      if (p.status === 'cancelado') return;
      const fn = p.funil || 'varejo';
      if (!acc[fn]) acc[fn] = { total: 0, valor: 0 };
      acc[fn].total += 1;
      acc[fn].valor += Number(p.valor_total || 0);
    });
    return acc;
  }, [pedidos]);

  // 2. Por UF
  const vendasPorUf = useMemo(() => {
    const acc: Record<string, { total: number; valor: number }> = {};
    pedidos.forEach((p) => {
      if (p.status === 'cancelado') return;
      const uf = p.cliente?.uf || 'SP';
      if (!acc[uf]) acc[uf] = { total: 0, valor: 0 };
      acc[uf].total += 1;
      acc[uf].valor += Number(p.valor_total || 0);
    });
    return acc;
  }, [pedidos]);

  // 3. Por Vendedor
  const vendasPorVendedor = useMemo(() => {
    const acc: Record<string, { total: number; valor: number }> = {};
    pedidos.forEach((p) => {
      if (p.status === 'cancelado') return;
      const nome = p.vendedor?.nome || 'Sem Vendedor';
      if (!acc[nome]) acc[nome] = { total: 0, valor: 0 };
      acc[nome].total += 1;
      acc[nome].valor += Number(p.valor_total || 0);
    });
    return acc;
  }, [pedidos]);

  // 4. Taxa de Conversão
  const totalValidos = pedidos.filter((p) => p.status !== 'cancelado').length;
  const fechados = pedidos.filter((p) => !['novo', 'orcamento_enviado', 'cancelado'].includes(p.status)).length;
  const taxaConversao = totalValidos > 0 ? (fechados / totalValidos) * 100 : 0;

  // 5. Prazo médio de produção (dias do pedido até pronto)
  const pedidosConcluidos = pedidos.filter((p) => ['pronto', 'enviado', 'entregue'].includes(p.status));
  const prazoMedioDias = pedidosConcluidos.length > 0
    ? (pedidosConcluidos.reduce((acc, p) => {
        const diff = (new Date(p.atualizado_em).getTime() - new Date(p.criado_em).getTime()) / (1000 * 3600 * 24);
        return acc + Math.max(1, Math.round(diff));
      }, 0) / pedidosConcluidos.length).toFixed(1)
    : '7.0';

  // 6. Pedidos Atrasados
  const pedidosAtrasados = pedidos.filter((p) => {
    if (!p.data_entrega || ['entregue', 'cancelado'].includes(p.status)) return false;
    return new Date(p.data_entrega) < now;
  });

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-[#A7ADB5] gap-3">
        <Loader2 className="w-8 h-8 text-[#58E707] animate-spin" />
        <span className="text-xs">Consolidando relatórios analíticos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black font-sport uppercase text-white tracking-tight">
          Relatórios & Inteligência Comercial
        </h1>
        <p className="text-xs text-[#A7ADB5] mt-0.5">
          Desempenho de vendas por funil, estado geográfico, equipe e prazos produtivos.
        </p>
      </div>

      {/* 3 KPIs Resumidos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#14161A] border border-[#1D2026] rounded-2xl p-5 space-y-1">
          <span className="text-[11px] font-bold text-[#A7ADB5] uppercase">Taxa Média de Conversão</span>
          <div className="font-mono font-black text-2xl text-[#58E707]">{taxaConversao.toFixed(1)}%</div>
          <p className="text-[11px] text-[#A7ADB5]">{fechados} de {totalValidos} pedidos convertidos</p>
        </div>

        <div className="bg-[#14161A] border border-[#1D2026] rounded-2xl p-5 space-y-1">
          <span className="text-[11px] font-bold text-[#A7ADB5] uppercase">Prazo Médio de Produção</span>
          <div className="font-mono font-black text-2xl text-white">{prazoMedioDias} dias</div>
          <p className="text-[11px] text-[#A7ADB5]">Média da criação até a finalização</p>
        </div>

        <div className="bg-[#14161A] border border-[#1D2026] rounded-2xl p-5 space-y-1">
          <span className="text-[11px] font-bold text-[#A7ADB5] uppercase">Pedidos em Atraso</span>
          <div className={`font-mono font-black text-2xl ${pedidosAtrasados.length > 0 ? 'text-rose-400' : 'text-[#58E707]'}`}>
            {pedidosAtrasados.length}
          </div>
          <p className="text-[11px] text-[#A7ADB5]">Requerem atenção da equipe</p>
        </div>
      </div>

      {/* Grid de Análises */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Vendas por Funil */}
        <div className="bg-[#14161A] border border-[#1D2026] rounded-3xl p-5 space-y-4 shadow-lg">
          <h3 className="text-xs font-bold uppercase text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#58E707]" />
            Vendas por Funil
          </h3>
          <div className="space-y-3">
            {Object.entries(vendasPorFunil).map(([fn, dados]) => (
              <div key={fn} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">{FUNIL_LABELS[fn as keyof typeof FUNIL_LABELS] || fn}</span>
                  <span className="font-mono font-bold text-[#58E707]">{formatPrice(dados.valor)}</span>
                </div>
                <div className="text-[11px] text-[#A7ADB5] flex justify-between">
                  <span>{dados.total} pedido(s)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vendas por Vendedor */}
        <div className="bg-[#14161A] border border-[#1D2026] rounded-3xl p-5 space-y-4 shadow-lg">
          <h3 className="text-xs font-bold uppercase text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#026FF6]" />
            Vendas por Vendedor
          </h3>
          <div className="space-y-3">
            {Object.entries(vendasPorVendedor).map(([vend, dados]) => (
              <div key={vend} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">{vend}</span>
                  <span className="font-mono font-bold text-white">{formatPrice(dados.valor)}</span>
                </div>
                <div className="text-[11px] text-[#A7ADB5]">
                  <span>{dados.total} pedido(s)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vendas por UF (Estados) */}
        <div className="bg-[#14161A] border border-[#1D2026] rounded-3xl p-5 space-y-4 shadow-lg">
          <h3 className="text-xs font-bold uppercase text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#58E707]" />
            Vendas por Estado (UF)
          </h3>
          <div className="space-y-3">
            {Object.entries(vendasPorUf).map(([uf, dados]) => (
              <div key={uf} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-white font-mono font-bold">{uf}</span>
                  <span className="font-mono font-bold text-[#58E707]">{formatPrice(dados.valor)}</span>
                </div>
                <div className="text-[11px] text-[#A7ADB5]">
                  <span>{dados.total} pedido(s)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
