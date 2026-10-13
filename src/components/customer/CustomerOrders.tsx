import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Pedido, STATUS_LABELS } from '../../lib/supabaseTypes';
import { formatPrice } from '../../utils/helpers';
import { 
  Package, Calendar, ChevronRight, Clock, AlertCircle, 
  ShoppingBag, Loader2 
} from 'lucide-react';

interface Props {
  onSelectOrder: (orderId: string) => void;
}

export const CustomerOrders: React.FC<Props> = ({ onSelectOrder }) => {
  const { cliente } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchPedidos = async () => {
    if (!isSupabaseConfigured || !cliente?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          itens:pedido_itens(*)
        `)
        .eq('cliente_id', cliente.id)
        .order('criado_em', { ascending: false });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setPedidos((data as Pedido[]) || []);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao carregar pedidos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();

    // Supabase Realtime para atualizar lista se houver alteração
    if (isSupabaseConfigured && cliente?.id) {
      const channel = supabase
        .channel(`pedidos-cliente-${cliente.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'pedidos',
            filter: `cliente_id=eq.${cliente.id}`,
          },
          () => {
            fetchPedidos();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [cliente?.id]);

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-[#A7ADB5] gap-3">
        <Loader2 className="w-7 h-7 text-[#58E707] animate-spin" />
        <span className="text-xs">Carregando seus pedidos...</span>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-rose-400 text-xs">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <span>{errorMsg}</span>
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <div className="bg-[#14161A] border border-[#1D2026] rounded-3xl p-10 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#0A0B0D] border border-[#1D2026] flex items-center justify-center mx-auto text-[#58E707]">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold font-sport uppercase text-white">
          Nenhum pedido encontrado
        </h3>
        <p className="text-xs text-[#A7ADB5] max-w-sm mx-auto">
          Você ainda não realizou nenhum pedido na GL Sports. Navegue pelas mais de 2.200 estampas e envie seu primeiro pedido!
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 py-2.5 px-5 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-extrabold uppercase text-xs rounded-xl shadow-[0_0_15px_rgba(88,231,7,0.3)] transition-all cursor-pointer"
        >
          <span>Ver Catálogo de Estampas</span>
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold font-sport uppercase text-white flex items-center gap-2">
          <Package className="w-5 h-5 text-[#58E707]" />
          Meus Pedidos ({pedidos.length})
        </h2>
        <span className="text-xs text-[#A7ADB5]">Clique para ver detalhes e aprovações</span>
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        {pedidos.map((pedido) => {
          const firstItem = pedido.itens?.[0];
          const totalPecas = pedido.itens?.reduce((acc, it) => acc + it.quantidade, 0) || 0;

          return (
            <div
              key={pedido.id}
              onClick={() => onSelectOrder(pedido.id)}
              className="bg-[#14161A] hover:bg-[#181B20] border border-[#1D2026] hover:border-[#58E707]/50 rounded-2xl p-4 sm:p-5 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group shadow-md"
            >
              <div className="flex items-center gap-4">
                {/* Imagem da Estampa */}
                <div className="w-16 h-16 rounded-xl bg-[#0A0B0D] border border-[#1D2026] overflow-hidden flex-shrink-0">
                  {firstItem?.imagem_url ? (
                    <img
                      src={firstItem.imagem_url}
                      alt={firstItem.produto_nome}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#A7ADB5]">
                      <Package className="w-6 h-6" />
                    </div>
                  )}
                </div>

                {/* Detalhes do Pedido */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white text-sm">
                      Pedido #{pedido.numero}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-[#58E707] bg-[#58E707]/10 px-2 py-0.5 rounded-full border border-[#58E707]/30">
                      {STATUS_LABELS[pedido.status] || pedido.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#A7ADB5] line-clamp-1">
                    {firstItem?.produto_nome || 'Uniforme Personalizado GL Sports'}
                    {pedido.itens && pedido.itens.length > 1 && ` e mais ${pedido.itens.length - 1} item(ns)`}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-[#A7ADB5] pt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#58E707]" />
                      {new Date(pedido.criado_em).toLocaleDateString('pt-BR')}
                    </span>
                    <span>•</span>
                    <span>{totalPecas} peça(s)</span>
                  </div>
                </div>
              </div>

              {/* Valor e Botão */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-[#1D2026]">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-[#A7ADB5] uppercase block">Valor Total</span>
                  <span className="font-bold font-mono text-sm text-[#58E707]">
                    {pedido.valor_total > 0 ? formatPrice(pedido.valor_total) : 'Aguardando orçamento'}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-[#58E707] group-hover:translate-x-1 transition-transform sm:mt-1">
                  <span>Acompanhar</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
