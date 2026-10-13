import React, { useState, useEffect, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Cliente, TipoCliente, Pedido } from '../../lib/supabaseTypes';
import { formatPrice } from '../../utils/helpers';
import { 
  Users, Search, Plus, Building, Phone, Mail, MapPin, 
  ShoppingBag, Tag, ChevronRight, X, Loader2, Check, AlertCircle 
} from 'lucide-react';

interface Props {
  onNavigateOrder?: (orderId: string) => void;
}

export const CrmCustomers: React.FC<Props> = ({ onNavigateOrder }) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [clientePedidos, setClientePedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPedidos, setIsLoadingPedidos] = useState(false);

  // Filtros
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('todos');

  // Modal Novo Cliente
  const [showModalNovo, setShowModalNovo] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novoWhatsapp, setNovoWhatsapp] = useState('');
  const [novoTipo, setNovoTipo] = useState<TipoCliente>('pessoa');
  const [novoCidade, setNovoCidade] = useState('');
  const [novoUf, setNovoUf] = useState('');
  const [isSavingNovo, setIsSavingNovo] = useState(false);
  const [novoError, setNovoError] = useState<string | null>(null);

  // Modal Novo Pedido para Cliente
  const [showNovoPedidoModal, setShowNovoPedidoModal] = useState(false);
  const [novoPedidoCanal, setNovoPedidoCanal] = useState<'whatsapp' | 'loja'>('whatsapp');
  const [novoPedidoObs, setNovoPedidoObs] = useState('');
  const [isCreatingPedido, setIsCreatingPedido] = useState(false);
  const [novoPedidoError, setNovoPedidoError] = useState<string | null>(null);

  const fetchClientes = async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('criado_em', { ascending: false });

      if (!error && data) {
        setClientes(data as Cliente[]);
      }
    } catch (err) {
      console.warn('Erro ao carregar clientes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleSelectCliente = async (c: Cliente) => {
    setSelectedCliente(c);
    setIsLoadingPedidos(true);
    try {
      const { data } = await supabase
        .from('pedidos')
        .select('*, itens:pedido_itens(*)')
        .eq('cliente_id', c.id)
        .order('criado_em', { ascending: false });
      setClientePedidos((data as Pedido[]) || []);
    } finally {
      setIsLoadingPedidos(false);
    }
  };

  const handleSalvarNovoCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim() || !novoWhatsapp.trim()) return;

    setIsSavingNovo(true);
    setNovoError(null);
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert({
          nome: novoNome.trim(),
          email: novoEmail.trim() || null,
          whatsapp: novoWhatsapp.trim(),
          tipo: novoTipo,
          cidade: novoCidade.trim() || null,
          uf: novoUf.trim().toUpperCase() || null,
          origem: 'CRM Equipe',
        })
        .select()
        .single();

      if (error) throw error;
      setShowModalNovo(false);
      setNovoNome('');
      setNovoEmail('');
      setNovoWhatsapp('');
      setNovoError(null);
      fetchClientes();
      if (data) handleSelectCliente(data as Cliente);
    } catch (err: any) {
      setNovoError(err.message || 'Erro ao criar cliente.');
    } finally {
      setIsSavingNovo(false);
    }
  };

  // Criar Pedido Manual pelo CRM (Canal WhatsApp ou Loja)
  const handleCriarPedidoManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCliente) return;

    setIsCreatingPedido(true);
    setNovoPedidoError(null);
    try {
      const { data: novoPed, error } = await supabase
        .from('pedidos')
        .insert({
          cliente_id: selectedCliente.id,
          canal: novoPedidoCanal,
          funil: selectedCliente.tipo === 'escola' ? 'escolas' : selectedCliente.tipo === 'time' || selectedCliente.tipo === 'empresa' ? 'times_empresas' : 'varejo',
          observacoes: novoPedidoObs.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      setShowNovoPedidoModal(false);
      setNovoPedidoObs('');
      setNovoPedidoError(null);
      if (novoPed && onNavigateOrder) {
        onNavigateOrder(novoPed.id);
      } else {
        handleSelectCliente(selectedCliente);
      }
    } catch (err: any) {
      setNovoPedidoError(err.message || 'Erro ao criar pedido.');
    } finally {
      setIsCreatingPedido(false);
    }
  };

  const filteredClientes = useMemo(() => {
    return clientes.filter((c) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchNome = c.nome?.toLowerCase().includes(q);
        const matchZap = c.whatsapp?.toLowerCase().includes(q);
        const matchEmail = c.email?.toLowerCase().includes(q);
        if (!matchNome && !matchZap && !matchEmail) return false;
      }
      if (tipoFilter !== 'todos' && c.tipo !== tipoFilter) return false;
      return true;
    });
  }, [clientes, search, tipoFilter]);

  const totalCompradoCliente = clientePedidos.reduce((acc, p) => acc + Number(p.valor_total || 0), 0);

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-[#A7ADB5] gap-3">
        <Loader2 className="w-8 h-8 text-[#58E707] animate-spin" />
        <span className="text-xs">Carregando carteira de clientes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-sport uppercase text-white tracking-tight">
            Base de Clientes
          </h1>
          <p className="text-xs text-[#A7ADB5] mt-0.5">
            Gerenciamento de contatos, histórico de compras e abertura de novos pedidos.
          </p>
        </div>

        <button
          onClick={() => setShowModalNovo(true)}
          className="py-2.5 px-4 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-black uppercase text-xs rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(88,231,7,0.3)] cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Novo Cliente</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, WhatsApp ou e-mail..."
            className="w-full bg-[#14161A] text-white text-xs pl-8 pr-3 py-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 text-[#A7ADB5] absolute left-2.5 top-3" />
        </div>

        <select
          value={tipoFilter}
          onChange={(e) => setTipoFilter(e.target.value)}
          className="bg-[#14161A] text-white text-xs px-3 py-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none cursor-pointer"
        >
          <option value="todos">Todos os Tipos</option>
          <option value="pessoa">Pessoa Física</option>
          <option value="time">Time / Atlética</option>
          <option value="escola">Escola / Turma</option>
          <option value="empresa">Empresa</option>
          <option value="igreja">Igreja</option>
          <option value="outro">Outro</option>
        </select>
      </div>

      {/* Layout Split: Lista e Ficha Detalhada */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Tabela de Clientes */}
        <div className="lg:col-span-7 bg-[#14161A] border border-[#1D2026] rounded-3xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1D2026] bg-[#0A0B0D]/50 text-[#A7ADB5] font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Nome</th>
                  <th className="py-3 px-3">WhatsApp</th>
                  <th className="py-3 px-3">Tipo</th>
                  <th className="py-3 px-3">Cidade/UF</th>
                  <th className="py-3 px-3 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1D2026]">
                {filteredClientes.map((c) => {
                  const isSelected = selectedCliente?.id === c.id;

                  return (
                    <tr
                      key={c.id}
                      onClick={() => handleSelectCliente(c)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#58E707]/10' : 'hover:bg-[#181B20]'
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-white">
                        {c.nome}
                      </td>
                      <td className="py-3 px-3 text-[#A7ADB5] font-mono">
                        {c.whatsapp || '-'}
                      </td>
                      <td className="py-3 px-3">
                        <span className="capitalize text-[11px] bg-[#0A0B0D] px-2 py-0.5 rounded border border-[#1D2026] text-[#58E707]">
                          {c.tipo}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[#A7ADB5]">
                        {c.cidade ? `${c.cidade}/${c.uf || ''}` : '-'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <ChevronRight className="w-4 h-4 text-[#A7ADB5] mx-auto" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ficha do Cliente Selecionado */}
        <div className="lg:col-span-5 bg-[#14161A] border border-[#1D2026] rounded-3xl p-6 space-y-5 shadow-xl">
          {selectedCliente ? (
            <>
              <div className="flex items-center justify-between border-b border-[#1D2026] pb-3">
                <div>
                  <h3 className="text-base font-bold text-white uppercase">{selectedCliente.nome}</h3>
                  <span className="text-[11px] text-[#58E707] font-semibold uppercase">{selectedCliente.tipo}</span>
                </div>

                <button
                  onClick={() => setShowNovoPedidoModal(true)}
                  className="py-1.5 px-3 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-extrabold uppercase text-[11px] rounded-lg shadow cursor-pointer"
                >
                  + Novo Pedido
                </button>
              </div>

              {/* Informações de Contato */}
              <div className="space-y-2 text-xs bg-[#0A0B0D] p-3.5 rounded-2xl border border-[#1D2026]">
                <div className="flex items-center gap-2 text-[#A7ADB5]">
                  <Phone className="w-3.5 h-3.5 text-[#58E707]" />
                  <span className="text-white font-mono">{selectedCliente.whatsapp || 'Sem WhatsApp'}</span>
                </div>
                {selectedCliente.email && (
                  <div className="flex items-center gap-2 text-[#A7ADB5]">
                    <Mail className="w-3.5 h-3.5 text-[#58E707]" />
                    <span className="text-white">{selectedCliente.email}</span>
                  </div>
                )}
                {selectedCliente.cidade && (
                  <div className="flex items-center gap-2 text-[#A7ADB5]">
                    <MapPin className="w-3.5 h-3.5 text-[#58E707]" />
                    <span className="text-white">{selectedCliente.cidade}/{selectedCliente.uf}</span>
                  </div>
                )}
              </div>

              {/* Total Comprado */}
              <div className="p-3.5 bg-[#0A0B0D] rounded-2xl border border-[#1D2026] flex items-center justify-between text-xs">
                <span className="text-[#A7ADB5] uppercase font-bold text-[11px]">Total Já Comprado:</span>
                <span className="font-mono font-black text-base text-[#58E707]">
                  {formatPrice(totalCompradoCliente)}
                </span>
              </div>

              {/* Histórico de Pedidos */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-white uppercase block">
                  Histórico ({clientePedidos.length} pedidos)
                </span>

                {isLoadingPedidos ? (
                  <div className="py-4 text-center text-xs text-[#A7ADB5]">Carregando pedidos...</div>
                ) : clientePedidos.length === 0 ? (
                  <p className="text-xs text-[#A7ADB5] py-2">Nenhum pedido registrado.</p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {clientePedidos.map((ped) => (
                      <div
                        key={ped.id}
                        onClick={() => onNavigateOrder && onNavigateOrder(ped.id)}
                        className="p-3 bg-[#0A0B0D] hover:bg-[#181B20] border border-[#1D2026] rounded-xl flex items-center justify-between text-xs cursor-pointer transition-colors"
                      >
                        <div>
                          <span className="font-mono font-bold text-white">#{ped.numero}</span>
                          <span className="text-[10px] uppercase font-bold text-[#58E707] ml-2">
                            {ped.status}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-white">
                          {formatPrice(ped.valor_total)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-xs text-[#A7ADB5]">
              Selecione um cliente para visualizar sua ficha completa.
            </div>
          )}
        </div>
      </div>

      {/* MODAL NOVO CLIENTE */}
      {showModalNovo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#14161A] border border-[#1D2026] rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white uppercase flex items-center gap-2">
              <Users className="w-5 h-5 text-[#58E707]" />
              Cadastrar Novo Cliente
            </h3>

            <form onSubmit={handleSalvarNovoCliente} className="space-y-3 text-xs">
              {novoError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{novoError}</span>
                </div>
              )}
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
                <label className="block text-[#A7ADB5] font-bold mb-1">WhatsApp com DDD *</label>
                <input
                  type="tel"
                  required
                  value={novoWhatsapp}
                  onChange={(e) => setNovoWhatsapp(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full bg-[#0A0B0D] text-white p-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#A7ADB5] font-bold mb-1">E-mail (opcional)</label>
                <input
                  type="email"
                  value={novoEmail}
                  onChange={(e) => setNovoEmail(e.target.value)}
                  className="w-full bg-[#0A0B0D] text-white p-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#A7ADB5] font-bold mb-1">Tipo</label>
                  <select
                    value={novoTipo}
                    onChange={(e) => setNovoTipo(e.target.value as TipoCliente)}
                    className="w-full bg-[#0A0B0D] text-white p-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none"
                  >
                    <option value="pessoa">Pessoa</option>
                    <option value="time">Time</option>
                    <option value="escola">Escola</option>
                    <option value="empresa">Empresa</option>
                    <option value="igreja">Igreja</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#A7ADB5] font-bold mb-1">Cidade / UF</label>
                  <input
                    type="text"
                    value={novoCidade}
                    onChange={(e) => setNovoCidade(e.target.value)}
                    placeholder="Peruíbe"
                    className="w-full bg-[#0A0B0D] text-white p-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModalNovo(false)}
                  className="py-2 px-4 bg-[#0A0B0D] text-[#A7ADB5] rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingNovo}
                  className="py-2.5 px-5 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-extrabold uppercase rounded-xl text-xs cursor-pointer shadow"
                >
                  {isSavingNovo ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVO PEDIDO MANUAL */}
      {showNovoPedidoModal && selectedCliente && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#14161A] border border-[#1D2026] rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white uppercase flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#58E707]" />
              Novo Pedido para {selectedCliente.nome}
            </h3>

            <form onSubmit={handleCriarPedidoManual} className="space-y-3 text-xs">
              {novoPedidoError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{novoPedidoError}</span>
                </div>
              )}
              <div>
                <label className="block text-[#A7ADB5] font-bold mb-1">Canal de Origem</label>
                <select
                  value={novoPedidoCanal}
                  onChange={(e) => setNovoPedidoCanal(e.target.value as 'whatsapp' | 'loja')}
                  className="w-full bg-[#0A0B0D] text-white p-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none"
                >
                  <option value="whatsapp">WhatsApp Comercial</option>
                  <option value="loja">Loja Física / Balcão</option>
                </select>
              </div>

              <div>
                <label className="block text-[#A7ADB5] font-bold mb-1">Observações do Pedido</label>
                <textarea
                  rows={3}
                  value={novoPedidoObs}
                  onChange={(e) => setNovoPedidoObs(e.target.value)}
                  placeholder="Ex: Pedido fechado no zap para 15 regatas de basquete..."
                  className="w-full bg-[#0A0B0D] text-white p-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNovoPedidoModal(false)}
                  className="py-2 px-4 bg-[#0A0B0D] text-[#A7ADB5] rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingPedido}
                  className="py-2.5 px-5 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-extrabold uppercase rounded-xl text-xs cursor-pointer shadow"
                >
                  {isCreatingPedido ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Abrir Pedido'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
