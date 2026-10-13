import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Tarefa } from '../../lib/supabaseTypes';
import { CheckSquare, Clock, Check, AlertTriangle, Loader2 } from 'lucide-react';

interface Props {
  onNavigateOrder?: (orderId: string) => void;
}

export const CrmTasks: React.FC<Props> = ({ onNavigateOrder }) => {
  const { perfil } = useAuth();
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterAba, setFilterAba] = useState<'minhas' | 'todas'>('minhas');
  const [somenteAtrasadas, setSomenteAtrasadas] = useState(false);

  const fetchTarefas = async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('tarefas')
        .select(`
          *,
          pedido:pedidos(id, numero),
          cliente:clientes(nome),
          responsavel:perfis(nome)
        `)
        .order('vence_em', { ascending: true });

      if (filterAba === 'minhas' && perfil?.id) {
        query = query.eq('responsavel_id', perfil.id);
      }

      const { data, error } = await query;
      if (!error && data) {
        setTarefas(data as Tarefa[]);
      }
    } catch (err) {
      console.warn('Erro ao carregar tarefas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTarefas();
  }, [filterAba, perfil?.id]);

  const handleConcluir = async (tarefaId: string) => {
    try {
      const { error } = await supabase
        .from('tarefas')
        .update({ concluida_em: new Date().toISOString() })
        .eq('id', tarefaId);

      if (!error) {
        fetchTarefas();
      }
    } catch (err) {
      console.warn('Erro ao concluir tarefa:', err);
    }
  };

  const now = new Date();

  const tarefasFiltradas = tarefas.filter((t) => {
    if (somenteAtrasadas) {
      return !t.concluida_em && new Date(t.vence_em) < now;
    }
    return true;
  });

  const isMasterOrAdmin = perfil?.papel === 'master' || perfil?.papel === 'admin';

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-[#A7ADB5] gap-3">
        <Loader2 className="w-8 h-8 text-[#58E707] animate-spin" />
        <span className="text-xs">Carregando tarefas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-sport uppercase text-white tracking-tight">
            Tarefas Operacionais
          </h1>
          <p className="text-xs text-[#A7ADB5] mt-0.5">
            Tarefas geradas automaticamente pelo banco para retorno de orçamentos, cobrança de sinal e avaliações.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2">
          {isMasterOrAdmin && (
            <div className="flex items-center bg-[#14161A] p-1 rounded-xl border border-[#1D2026] text-xs">
              <button
                onClick={() => setFilterAba('minhas')}
                className={`py-1.5 px-3 rounded-lg font-bold cursor-pointer transition-all ${
                  filterAba === 'minhas' ? 'bg-[#58E707] text-[#0A0B0D]' : 'text-[#A7ADB5] hover:text-white'
                }`}
              >
                Minhas Tarefas
              </button>
              <button
                onClick={() => setFilterAba('todas')}
                className={`py-1.5 px-3 rounded-lg font-bold cursor-pointer transition-all ${
                  filterAba === 'todas' ? 'bg-[#58E707] text-[#0A0B0D]' : 'text-[#A7ADB5] hover:text-white'
                }`}
              >
                Todas as Tarefas
              </button>
            </div>
          )}

          <button
            onClick={() => setSomenteAtrasadas(!somenteAtrasadas)}
            className={`py-2 px-3.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              somenteAtrasadas
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                : 'bg-[#14161A] border-[#1D2026] text-[#A7ADB5] hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Apenas Atrasadas</span>
          </button>
        </div>
      </div>

      {/* Lista de Tarefas */}
      <div className="bg-[#14161A] border border-[#1D2026] rounded-3xl overflow-hidden shadow-xl">
        {tarefasFiltradas.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#A7ADB5]">
            Nenhuma tarefa pendente com os filtros selecionados.
          </div>
        ) : (
          <div className="divide-y divide-[#1D2026]">
            {tarefasFiltradas.map((t) => {
              const isAtrasada = !t.concluida_em && new Date(t.vence_em) < now;
              const isConcluida = Boolean(t.concluida_em);

              return (
                <div
                  key={t.id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    isConcluida ? 'opacity-50 bg-[#0A0B0D]/30' : isAtrasada ? 'bg-rose-500/5' : 'hover:bg-[#181B20]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs uppercase">{t.tipo}</span>
                      {t.pedido && (
                        <button
                          onClick={() => onNavigateOrder && onNavigateOrder((t.pedido as any).id)}
                          className="font-mono font-bold text-[#58E707] hover:underline text-xs"
                        >
                          #{t.pedido.numero}
                        </button>
                      )}
                      {t.cliente && (
                        <span className="text-[11px] text-[#A7ADB5]">({t.cliente.nome})</span>
                      )}
                    </div>

                    <p className="text-xs text-[#A7ADB5]">{t.descricao}</p>

                    <div className="flex items-center gap-3 text-[11px] pt-1">
                      <span className={`flex items-center gap-1 ${isAtrasada ? 'text-rose-400 font-bold' : 'text-[#A7ADB5]'}`}>
                        <Clock className="w-3 h-3" />
                        Vence: {new Date(t.vence_em).toLocaleDateString('pt-BR')}
                      </span>
                      {t.responsavel && (
                        <span className="text-[#A7ADB5]">Responsável: {t.responsavel.nome}</span>
                      )}
                    </div>
                  </div>

                  {/* Ação */}
                  <div className="flex items-center gap-2">
                    {isConcluida ? (
                      <span className="text-xs font-bold text-[#58E707] flex items-center gap-1">
                        <Check className="w-4 h-4 stroke-[3]" />
                        Concluída
                      </span>
                    ) : (
                      <button
                        onClick={() => handleConcluir(t.id)}
                        className="py-2 px-4 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-extrabold uppercase rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Concluir</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
