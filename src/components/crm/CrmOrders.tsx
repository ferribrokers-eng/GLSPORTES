import React, { useState, useEffect, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { 
  Pedido, PedidoStatus, FunilVenda, STATUS_LABELS, 
  FUNIL_LABELS, Perfil 
} from '../../lib/supabaseTypes';
import { formatPrice } from '../../utils/helpers';
import { 
  Search, Filter, ShoppingBag, Calendar, AlertTriangle, 
  Loader2, User 
} from 'lucide-react';

interface Props {
  onSelectOrder: (orderId: string) => void;
}

// Colunas por status (ordem do fluxo produtivo)
const COLUNAS_STATUS: { key: PedidoStatus; label: string }[] = [
  { key: 'novo', label: 'Novo Pedido' },
  { key: 'orcamento_enviado', label: 'Orçamento Enviado' },
  { key: 'criando_arte', label: 'Criando Arte' },
  { key: 'arte_em_aprovacao', label: 'Arte em Aprovação' },
  { key: 'aguardando_lista', label: 'Aguardando Grade/Lista' },
  { key: 'aguardando_sinal', label: 'Aguardando Sinal' },
  { key: 'em_producao', label: 'Em Produção' },
  { key: 'pronto', label: 'Pronto' },
  { key: 'enviado', label: 'Enviado' },
  { key: 'entregue', label: 'Entregue' },
];

export const CrmOrders: React.FC<Props> = ({ onSelectOrder }) => {
  const { perfil } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [vendedores, setVendedores] = useState<Perfil[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState('');
  const [funilFilter, setFunilFilter] = useState<string>('todos');
  const [vendedorFilter, setVendedorFilter] = useState<string>('todos');

  const fetchPedidos = async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('pedidos')
        .select(`
          *,
          cliente:clientes(*),
          vendedor:perfis(*),
          itens:pedido_itens(*)
        `)
        .neq('status', 'cancelado')
        .order('criado_em', { ascending: false });

      if (perfil?.papel === 'vendedor') {
        // Vendedor vê os próprios pedidos e os sem vendedor
        query = query.or(`vendedor_id.eq.${perfil.id},vendedor_id.is.null`);
      }

      const { data, error } = await query;
      if (!error && data) {
        setPedidos(data as Pedido[]);
      }

      // Vendedores para o filtro
      const { data: perfisData } = await supabase
        .from('perfis')
        .select('*')
        .eq('ativo', true);
      if (perfisData) {
        setVendedores(perfisData as Perfil[]);
      }
    } catch (err) {
      console.warn('Erro ao carregar pedidos CRM:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();

    // Supabase Realtime para cards mudarem de coluna automaticamente
    if (isSupabaseConfigured) {
      const channel = supabase
        .channel('crm-orders-board')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'pedidos' },
          () => {
            fetchPedidos();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [perfil?.id, perfil?.papel]);

  // Filtra pedidos em memória
  const filteredPedidos = useMemo(() => {
    return pedidos.filter((p) => {
      // Busca por número ou nome do cliente
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const numMatch = String(p.numero).includes(q);
        const nameMatch = p.cliente?.nome?.toLowerCase().includes(q);
        if (!numMatch && !nameMatch) return false;
      }

      // Funil
      if (funilFilter !== 'todos' && p.funil !== funilFilter) {
        return false;
      }

      // Vendedor
      if (vendedorFilter !== 'todos') {
        if (vendedorFilter === 'sem_vendedor' && p.vendedor_id) return false;
        if (vendedorFilter !== 'sem_vendedor' && p.vendedor_id !== vendedorFilter) return false;
      }

      return true;
    });
  }, [pedidos, search, funilFilter, vendedorFilter]);

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-[#A7ADB5] gap-3">
        <Loader2 className="w-8 h-8 text-[#58E707] animate-spin" />
        <span className="text-xs">Carregando quadro de pedidos...</span>
      </div>
    );
  }

  const now = new Date();

  return (
    <div className="space-y-5 h-full flex flex-col">
      {/* Header & Filtros */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-sport uppercase text-white tracking-tight">
            Quadro de Pedidos
          </h1>
          <p className="text-xs text-[#A7ADB5] mt-0.5">
            Fluxo automatizado por eventos. As colunas são apenas para visualização em tempo real.
          </p>
        </div>

        {/* Barra de Filtros */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Busca */}
          <div className="relative w-56 sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nº ou cliente..."
              className="w-full bg-[#14161A] text-white text-xs pl-8 pr-3 py-2 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-[#A7ADB5] absolute left-2.5 top-2.5" />
          </div>

          {/* Filtro Funil */}
          <select
            value={funilFilter}
            onChange={(e) => setFunilFilter(e.target.value)}
            className="bg-[#14161A] text-white text-xs px-3 py-2 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none cursor-pointer"
          >
            <option value="todos">Todos os Funis</option>
            <option value="times_empresas">Times & Empresas</option>
            <option value="escolas">Escolas & Turmas</option>
            <option value="varejo">Varejo / Geral</option>
          </select>

          {/* Filtro Vendedor (admin/master) */}
          {perfil?.papel !== 'vendedor' && (
            <select
              value={vendedorFilter}
              onChange={(e) => setVendedorFilter(e.target.value)}
              className="bg-[#14161A] text-white text-xs px-3 py-2 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos os Vendedores</option>
              <option value="sem_vendedor">Sem Vendedor Atribuído</option>
              {vendedores.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nome} ({v.papel})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* COLUNAS KANBAN (SÓ DE VISUALIZAÇÃO - REGRA PRINCIPAL: SEM ARRASTAR CARD) */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[2600px] h-full items-start">
          {COLUNAS_STATUS.map((col) => {
            const colPedidos = filteredPedidos.filter((p) => p.status === col.key);

            return (
              <div
                key={col.key}
                className="w-64 bg-[#14161A] border border-[#1D2026] rounded-2xl flex flex-col max-h-[82vh] shadow-lg flex-shrink-0"
              >
                {/* Cabeçalho da Coluna */}
                <div className="p-3.5 border-b border-[#1D2026] flex items-center justify-between bg-[#0A0B0D]/50 rounded-t-2xl">
                  <span className="text-xs font-black uppercase tracking-tight text-white line-clamp-1">
                    {col.label}
                  </span>
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-[#1D2026] text-[#58E707]">
                    {colPedidos.length}
                  </span>
                </div>

                {/* Lista de Cards da Coluna */}
                <div className="p-2.5 space-y-2.5 overflow-y-auto flex-1 divide-y divide-[#1D2026]/40">
                  {colPedidos.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-[#A7ADB5]/50">
                      Nenhum pedido
                    </div>
                  ) : (
                    colPedidos.map((pedido) => {
                      const firstItem = pedido.itens?.[0];
                      const dataEntrega = pedido.data_entrega ? new Date(pedido.data_entrega) : null;
                      const isAtrasado = dataEntrega ? dataEntrega < now : false;

                      return (
                        <div
                          key={pedido.id}
                          onClick={() => onSelectOrder(pedido.id)}
                          className="pt-2.5 first:pt-0 bg-[#0A0B0D] hover:bg-[#181B20] border border-[#1D2026] hover:border-[#58E707]/60 rounded-xl p-3 cursor-pointer transition-all space-y-2 group shadow-sm hover:scale-[1.01]"
                        >
                          {/* Top: Número + Selo de Atraso */}
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-black text-xs text-white group-hover:text-[#58E707] transition-colors">
                              #{pedido.numero}
                            </span>

                            {isAtrasado ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/15 border border-rose-500/40 px-1.5 py-0.5 rounded">
                                <AlertTriangle className="w-3 h-3 text-rose-400" />
                                Atrasado
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-[#A7ADB5] uppercase">
                                {FUNIL_LABELS[pedido.funil] || pedido.funil}
                              </span>
                            )}
                          </div>

                          {/* Foto e Cliente */}
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-lg bg-[#14161A] border border-[#1D2026] overflow-hidden flex-shrink-0">
                              {firstItem?.imagem_url ? (
                                <img
                                  src={firstItem.imagem_url}
                                  alt={firstItem.produto_nome}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#A7ADB5]">
                                  <ShoppingBag className="w-4 h-4" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <span className="text-xs font-bold text-white block truncate">
                                {pedido.cliente?.nome || 'Cliente'}
                              </span>
                              <span className="text-[11px] text-[#A7ADB5] block truncate">
                                {firstItem?.produto_nome || 'Uniforme'}
                              </span>
                            </div>
                          </div>

                          {/* Valor e Data de Entrega */}
                          <div className="pt-1 border-t border-[#1D2026] flex items-center justify-between text-[11px]">
                            <span className="font-mono font-bold text-[#58E707]">
                              {pedido.valor_total > 0 ? formatPrice(pedido.valor_total) : 'A orçar'}
                            </span>

                            {pedido.data_entrega && (
                              <span className="flex items-center gap-1 text-[#A7ADB5]">
                                <Calendar className="w-3 h-3 text-[#58E707]" />
                                {new Date(pedido.data_entrega).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
