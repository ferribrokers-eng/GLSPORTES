import React, { useState } from 'react';
import { 
  X, Trash2, PhoneCall, Plus, Minus, ShoppingBag, 
  ShieldCheck, User, Calendar, Check, Send, AlertCircle, 
  Loader2, LogIn, CheckCircle2 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { formatPrice } from '../utils/helpers';
import { Product, CartItem } from '../types';
import { CONFIG } from '../config';
import { FunilVenda } from '../lib/supabaseTypes';

interface CartDrawerProps {
  onSelectProduct: (product: Product) => void;
  onExploreCatalog?: () => void;
  onNavigateOrder?: (orderId: string) => void;
  onNavigateLogin?: () => void;
}

const TIPOS_PECA = [
  { value: 'camiseta', label: 'Camiseta Tradicional' },
  { value: 'regata', label: 'Regata Esportiva' },
  { value: 'manga longa', label: 'Manga Longa UV' },
  { value: 'abadá', label: 'Abadá de Bloco/Evento' },
  { value: 'short', label: 'Short / Calção' },
];

function determinarFunil(cart: CartItem[]): FunilVenda {
  const escolaKeywords = ['interclasse', 'jogos internos', 'nono ano', 'terceirao', 'terceirão', 'escola', 'turma'];
  const timesKeywords = ['futebol', 'ciclismo', 'pesca', 'motocross', 'artes marciais', 'torcida', 'basquete', 'volei'];

  for (const item of cart) {
    const cat = (item.product.categoria || '').toLowerCase();
    const grp = (item.product.grupo || '').toLowerCase();
    const nome = (item.product.nome || '').toLowerCase();
    const combined = `${cat} ${grp} ${nome}`;

    if (escolaKeywords.some((k) => combined.includes(k))) return 'escolas';
    if (timesKeywords.some((k) => combined.includes(k))) return 'times_empresas';
  }
  return 'varejo';
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ 
  onSelectProduct, 
  onExploreCatalog, 
  onNavigateOrder,
  onNavigateLogin 
}) => {
  const { 
    cart, removeFromCart, updateQuantity, updateItemConfig, 
    clearCart, totalItems, totalPrice, isCartOpen, setIsCartOpen 
  } = useCart();

  const { user, isClient } = useAuth();

  // Dados do pedido
  const [dataEntrega, setDataEntrega] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pedidoSucesso, setPedidoSucesso] = useState<{ id: string; numero: number | string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Cadastro de dados legado para envio via WhatsApp
  const [nomeCliente, setNomeCliente] = useState('');
  const [whatsappCliente, setWhatsappCliente] = useState('');
  const [cidadeUfCliente, setCidadeUfCliente] = useState('');
  const [showCadastroZap, setShowCadastroZap] = useState(false);

  if (!isCartOpen) return null;

  // Enviar Pedido via Supabase RPC ('criar_pedido')
  const handleEnviarPedidoSite = async () => {
    setErrorMsg(null);

    // Se o usuário não estiver logado, pede login
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const funil = determinarFunil(cart);

      const itens = cart.map((item) => ({
        produto_id: item.product.id,
        produto_nome: item.product.displayName || item.product.nome,
        imagem_url: item.product.imagens?.[0] || item.product.capa || null,
        tipo_peca: item.tipo_peca || 'camiseta',
        quantidade: Math.max(1, item.quantity),
        adicionais: {
          nome_numero: Boolean(item.com_nome_numero),
        },
      }));

      const { data: pedidoId, error } = await supabase.rpc('criar_pedido', {
        itens,
        data_entrega: dataEntrega || null,
        funil,
        observacoes: observacoes.trim() || null,
      });

      if (error) throw error;

      // Busca número do pedido criado
      let pedidoNumero: string | number = 'Confirmado';
      if (pedidoId) {
        const { data: pData } = await supabase
          .from('pedidos')
          .select('numero')
          .eq('id', pedidoId)
          .single();
        if (pData?.numero) {
          pedidoNumero = pData.numero;
        }
      }

      setPedidoSucesso({ id: pedidoId, numero: pedidoNumero });
      clearCart();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao enviar pedido para o sistema.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Monta link do WhatsApp com dados
  const itemsText = cart
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.product.displayName || item.product.nome}*\n   • Tipo: ${item.tipo_peca || 'Camiseta'}\n   • Nome e Número: ${item.com_nome_numero ? 'Sim' : 'Não'}\n   • Quantidade: ${item.quantity} peça(s)\n   • Código: #${item.product.id}`
    )
    .join('\n\n');

  const cadastroText = nomeCliente || whatsappCliente || cidadeUfCliente || observacoes
    ? `\n\n📋 *DADOS DA ENCOMENDA:*\n• Nome: ${nomeCliente || 'Não informado'}\n• WhatsApp: ${whatsappCliente || 'Não informado'}\n• Cidade/UF: ${cidadeUfCliente || 'Não informado'}\n• Prazo Desejado: ${dataEntrega || 'A combinar'}${observacoes ? `\n• Observações: ${observacoes}` : ''}`
    : '';

  const whatsappMessage = `Olá, equipe GL Esportes! Gostaria de encomendar as seguintes peças personalizadas:\n\n${itemsText}\n\n*Total de Peças:* ${totalItems} peça(s)${cadastroText}\n\nPor favor, confirmem os detalhes para personalização e envio.`;

  const whatsappUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-[#14161A] border-l border-[#1D2026] shadow-2xl flex flex-col">
          {/* Faixa tricolor no topo da gaveta */}
          <div className="h-[3.5px] w-full bg-gradient-to-r from-[#58E707] via-[#026FF6] to-[#FC6602]" />
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#1D2026] flex items-center justify-between bg-[#0A0B0D]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#58E707]" />
              <h2 className="font-sport font-black text-xl italic text-white tracking-wide uppercase">
                Carrinho de Encomenda
              </h2>
              <span className="text-xs text-[#58E707] font-extrabold font-mono">
                ({totalItems})
              </span>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-[#A7ADB5] hover:text-white rounded-xl hover:bg-[#1D2026] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* SUCESSO: PEDIDO RECEBIDO */}
          {pedidoSucesso ? (
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#58E707]/15 border border-[#58E707]/40 flex items-center justify-center text-[#58E707] shadow-[0_0_20px_rgba(88,231,7,0.3)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black font-sport uppercase text-white">
                Pedido #{pedidoSucesso.numero} recebido!
              </h3>
              <p className="text-xs text-[#A7ADB5] max-w-sm">
                Seu pedido foi registrado na GL Sports com sucesso. Acesse sua área do cliente para acompanhar o orçamento e a aprovação da arte.
              </p>
              <div className="pt-2 flex flex-col gap-2 w-full max-w-xs">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    if (onNavigateOrder) {
                      onNavigateOrder(pedidoSucesso.id);
                    } else {
                      window.location.href = `/minha-conta/pedido/${pedidoSucesso.id}`;
                    }
                  }}
                  className="w-full py-3 px-5 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-black uppercase text-xs rounded-xl shadow cursor-pointer"
                >
                  Ver Meu Pedido
                </button>
                <button
                  onClick={() => {
                    setPedidoSucesso(null);
                    setIsCartOpen(false);
                  }}
                  className="w-full py-2.5 px-4 bg-[#0A0B0D] border border-[#1D2026] text-[#A7ADB5] hover:text-white text-xs rounded-xl cursor-pointer"
                >
                  Continuar Navegando
                </button>
              </div>
            </div>
          ) : (
            /* Cart Content */
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {errorMsg && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {cart.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {cart.map((item) => {
                      const { product, quantity, tipo_peca = 'camiseta', com_nome_numero = false } = item;

                      return (
                        <div
                          key={product.id}
                          className="bg-[#0A0B0D] p-3.5 rounded-2xl border border-[#1D2026] hover:border-[#58E707]/50 transition-colors space-y-3"
                        >
                          <div className="flex gap-3 items-center">
                            {/* Thumbnail com proteção de imagem */}
                            <div
                              onClick={() => {
                                setIsCartOpen(false);
                                onSelectProduct(product);
                              }}
                              className="w-16 h-16 rounded-xl overflow-hidden bg-[#14161A] flex-shrink-0 cursor-pointer border border-[#1D2026] relative select-none"
                            >
                              <img
                                src={product.imagens[0]}
                                alt={product.nome}
                                draggable={false}
                                onContextMenu={(e) => e.preventDefault()}
                                onDragStart={(e) => e.preventDefault()}
                                className="w-full h-full object-cover pointer-events-none select-none"
                              />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] text-[#A7ADB5] font-mono block">
                                ID #{product.id} • {product.categoria}
                              </span>
                              <h4
                                onClick={() => {
                                  setIsCartOpen(false);
                                  onSelectProduct(product);
                                }}
                                className="font-semibold text-xs sm:text-sm text-white truncate hover:text-[#58E707] cursor-pointer"
                              >
                                {product.displayName || product.nome}
                              </h4>

                              {/* Quantity controls */}
                              <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center bg-[#14161A] rounded-lg border border-[#1D2026]">
                                  <button
                                    onClick={() => updateQuantity(product.id, Math.max(1, quantity - 1))}
                                    className="p-1 text-[#A7ADB5] hover:text-white cursor-pointer"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="px-2 text-xs font-bold text-white font-mono">
                                    {quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(product.id, quantity + 1)}
                                    className="p-1 text-[#A7ADB5] hover:text-white cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>

                                <button
                                  onClick={() => removeFromCart(product.id)}
                                  className="p-1 text-[#A7ADB5] hover:text-rose-400 transition-colors ml-auto cursor-pointer"
                                  title="Remover item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Configurações da Peça (Tipo e Nome/Número) */}
                          <div className="pt-2 border-t border-[#1D2026] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div>
                              <label className="block text-[10px] font-bold text-[#A7ADB5] uppercase mb-1">
                                Tipo de Peça:
                              </label>
                              <select
                                value={tipo_peca}
                                onChange={(e) => updateItemConfig(product.id, { tipo_peca: e.target.value })}
                                className="w-full bg-[#14161A] text-white p-1.5 rounded-lg border border-[#1D2026] focus:border-[#58E707] focus:outline-none text-xs"
                              >
                                {TIPOS_PECA.map((tp) => (
                                  <option key={tp.value} value={tp.value}>
                                    {tp.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="flex items-center gap-2 pt-3 sm:pt-4">
                              <input
                                type="checkbox"
                                id={`nome-num-${product.id}`}
                                checked={com_nome_numero}
                                onChange={(e) => updateItemConfig(product.id, { com_nome_numero: e.target.checked })}
                                className="accent-[#58E707] w-4 h-4 rounded cursor-pointer"
                              />
                              <label
                                htmlFor={`nome-num-${product.id}`}
                                className="text-[11px] text-white cursor-pointer"
                              >
                                Com nome e número?
                              </label>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Informações Globais do Pedido: Data de Entrega & Observações */}
                  <div className="p-4 bg-[#0A0B0D] rounded-2xl border border-[#1D2026] space-y-3 text-xs">
                    <span className="text-xs font-bold uppercase text-white flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#58E707]" />
                      Detalhes da Encomenda
                    </span>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#A7ADB5] mb-1">
                        Data em que precisa receber (Prazo Desejado):
                      </label>
                      <input
                        type="date"
                        value={dataEntrega}
                        onChange={(e) => setDataEntrega(e.target.value)}
                        className="w-full bg-[#14161A] text-white p-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#A7ADB5] mb-1">
                        Observações gerais (ex: cores da turma, gola, detalhes):
                      </label>
                      <textarea
                        rows={2}
                        value={observacoes}
                        onChange={(e) => setObservacoes(e.target.value)}
                        placeholder="Ex: Time Esporte Clube, cores verde e preto..."
                        className="w-full bg-[#14161A] text-white p-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-20 text-center space-y-3">
                  <ShoppingBag className="w-12 h-12 text-[#1D2026] mx-auto text-[#58E707]" />
                  <h3 className="text-base font-bold text-white uppercase font-sport tracking-wide">
                    Seu carrinho está vazio
                  </h3>
                  <p className="text-xs text-[#A7ADB5] max-w-xs mx-auto">
                    Navegue pelas 2.262 estampas do catálogo e adicione suas artes favoritas.
                  </p>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      if (onExploreCatalog) onExploreCatalog();
                    }}
                    className="py-2.5 px-5 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-extrabold uppercase text-xs rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(88,231,7,0.3)]"
                  >
                    Explorar Catálogo
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Footer & Checkout */}
          {cart.length > 0 && !pedidoSucesso && (
            <div className="p-4 sm:p-5 border-t border-[#1D2026] bg-[#0A0B0D] space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[#A7ADB5]">
                  <span>Total de peças</span>
                  <span className="font-mono text-white font-bold">{totalItems} peça(s)</span>
                </div>
                <div className="flex items-center justify-between text-[#A7ADB5]">
                  <span>Produção & Envio</span>
                  <span className="text-[#58E707] font-semibold">Fábrica Própria em Peruíbe/SP 🇧🇷</span>
                </div>
              </div>

              {/* Se o Supabase estiver configurado, oferece "Enviar Pedido pelo Site" */}
              {isSupabaseConfigured ? (
                <div className="space-y-2">
                  <button
                    onClick={handleEnviarPedidoSite}
                    disabled={isSubmitting}
                    className="w-full py-4 px-4 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-black text-sm uppercase rounded-xl flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(88,231,7,0.4)] transition-all hover:scale-[1.01] cursor-pointer"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 stroke-[2.5]" />
                        <span>Enviar Pedido para Produção</span>
                      </>
                    )}
                  </button>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 bg-[#14161A] hover:bg-[#1D2026] border border-[#1D2026] text-white hover:text-[#58E707] font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-[#58E707]" />
                    <span>Ou Finalizar pelo WhatsApp</span>
                  </a>
                </div>
              ) : (
                /* Modo de Preparação: Finaliza diretamente pelo WhatsApp */
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-4 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-extrabold text-sm uppercase rounded-xl flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(88,231,7,0.4)] transition-all hover:scale-[1.01] cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4 stroke-[2.5]" />
                  <span>Finalizar Pedido no WhatsApp</span>
                </a>
              )}

              <div className="flex items-center justify-between text-[11px] text-[#A7ADB5] pt-1">
                <span className="flex items-center gap-1 text-white">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#58E707]" />
                  Direto com a Fábrica GL Esportes
                </span>
                <button
                  onClick={clearCart}
                  className="text-[#A7ADB5] hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Esvaziar carrinho
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Login necessário para Enviar Pedido */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-[#14161A] border border-[#1D2026] rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-[#0A0B0D] border border-[#1D2026] flex items-center justify-center mx-auto text-[#58E707]">
              <LogIn className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white uppercase font-sport">
              Faça Login para Enviar
            </h3>
            <p className="text-xs text-[#A7ADB5]">
              Para acompanhar a aprovação da arte, o orçamento e a produção, acesse sua conta ou faça um cadastro rápido.
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowLoginPrompt(false);
                  setIsCartOpen(false);
                  if (onNavigateLogin) {
                    onNavigateLogin();
                  } else {
                    window.location.href = '/entrar';
                  }
                }}
                className="w-full py-3 px-4 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-extrabold uppercase rounded-xl text-xs cursor-pointer shadow"
              >
                Entrar ou Criar Conta
              </button>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="w-full py-2.5 px-4 bg-[#0A0B0D] border border-[#1D2026] text-[#A7ADB5] rounded-xl text-xs cursor-pointer"
              >
                Voltar ao Carrinho
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
