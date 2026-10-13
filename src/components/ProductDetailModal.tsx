import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Heart,
  ZoomIn,
  ZoomOut,
  ShoppingBag,
  PhoneCall,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  FileCheck,
  Layers,
  ShieldCheck,
  Image as ImageIcon,
} from 'lucide-react';
import { Product } from '../types';
import { formatPrice, buildWhatsAppSingleProductUrl } from '../utils/helpers';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { CONFIG } from '../config';
import { LogoArcs } from './BrandDecorations';
import { TricolorStripe } from './TricolorStripe';

interface ProductDetailModalProps {
  product: Product;
  allProducts: Product[];
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onNavigateCategory: (categorySlug: string) => void;
  onNavigateGroup: (groupName: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  allProducts,
  onClose,
  onSelectProduct,
  onNavigateCategory,
  onNavigateGroup,
}) => {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [quantity, setQuantity] = useState(1);
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const favorited = isFavorite(product.id);

  // Fecha com tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Bloqueia scroll do body
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const currentGalleryImg = product.imagens[selectedGalleryIndex] || product.imagens[0];

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/produto/${product.slug || product.id}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Recomendações da mesma categoria
  const relatedProducts = allProducts
    .filter((p) => p.categoria.toLowerCase() === product.categoria.toLowerCase() && p.id !== product.id)
    .slice(0, 4);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl bg-[#14161A] border border-[#1D2026] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh]"
      >
        {/* Linha tricolor no topo do modal */}
        <div className="h-[3.5px] w-full bg-gradient-to-r from-[#58E707] via-[#026FF6] to-[#FC6602]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#1D2026] bg-[#0A0B0D]">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-[#A7ADB5] truncate">
            <button
              onClick={() => {
                onClose();
                onNavigateGroup(product.grupo);
              }}
              className="hover:text-[#58E707] transition-colors"
            >
              {product.grupo}
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-[#1D2026] flex-shrink-0" />
            <button
              onClick={() => {
                onClose();
                onNavigateCategory(product.categoria.toLowerCase());
              }}
              className="text-[#58E707] font-semibold hover:underline"
            >
              {product.categoria}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              title="Compartilhar estampa"
              className="p-2 text-[#A7ADB5] hover:text-white rounded-xl hover:bg-[#1D2026] transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-[#58E707]" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => toggleFavorite(product.id)}
              title={favorited ? 'Remover dos favoritos' : 'Favoritar'}
              className="p-2 text-[#A7ADB5] hover:text-white rounded-xl hover:bg-[#1D2026] transition-colors cursor-pointer"
            >
              <Heart className={`w-4 h-4 ${favorited ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#A7ADB5] hover:text-white rounded-xl hover:bg-[#1D2026] transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Imagem Grande com Brilho Radial Azul e Verde + Arcos do Logo Atrás */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              
              {/* Display Header */}
              <div className="flex items-center justify-between bg-[#0A0B0D] px-4 py-2.5 rounded-2xl border border-[#1D2026]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#58E707]" />
                    <span>Arte Original para Sublimação</span>
                  </span>
                  {product.imagens.length > 1 && (
                    <span className="text-[11px] text-[#A7ADB5]">
                      (Imagem {selectedGalleryIndex + 1} de {product.imagens.length})
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="p-1.5 text-[#A7ADB5] hover:text-white hover:bg-[#1D2026] rounded-xl transition-colors flex items-center gap-1 text-xs cursor-pointer"
                  title="Alternar zoom"
                >
                  {isZoomed ? (
                    <>
                      <ZoomOut className="w-4 h-4 text-[#58E707]" />
                      <span>Reduzir</span>
                    </>
                  ) : (
                    <>
                      <ZoomIn className="w-4 h-4" />
                      <span>Ampliar</span>
                    </>
                  )}
                </button>
              </div>

              {/* Main Image Showcase com Brilho Radial Azul e Verde + Arcos Decorativos Atrás */}
              <div 
                className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#0A0B0D] border border-[#1D2026] shadow-2xl flex items-center justify-center p-4 cursor-pointer select-none group"
                onClick={() => setIsZoomed(!isZoomed)}
              >
                {/* Brilho Radial Azul e Verde Atrás */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(2,111,246,0.25)_0%,_rgba(88,231,7,0.18)_40%,_transparent_75%)] pointer-events-none" />

                {/* Arcos do Logo Decorativos Atrás da Imagem Principal */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                  <LogoArcs size={380} />
                </div>

                {/* Imagem do Produto com Zoom e Proteções Anti-Download */}
                <img
                  src={currentGalleryImg}
                  alt={product.displayName || product.nome}
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                  className={`max-w-full max-h-full object-contain relative z-10 transition-transform duration-300 drop-shadow-2xl pointer-events-none select-none ${
                    isZoomed ? 'scale-150' : 'group-hover:scale-105'
                  }`}
                />

                {/* Camada invisível de proteção contra clique com botão direito e extração */}
                <div 
                  className="absolute inset-0 z-20 select-none"
                  onContextMenu={(e) => e.preventDefault()}
                />

                {/* Marca d'água sutil oficial */}
                <div className="absolute top-3 right-3 z-20 pointer-events-none text-[9px] font-mono font-bold tracking-widest text-white/30 uppercase select-none bg-[#0A0B0D]/60 px-2 py-0.5 rounded border border-white/10">
                  GL ESPORTES • MODELO EXCLUSIVO
                </div>

                <div className="absolute bottom-3 left-3 z-20 bg-[#0A0B0D]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#1D2026] text-xs text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#58E707]" />
                  <span>Sublimação Total Toque Zero</span>
                </div>
              </div>

              {/* Miniaturas da galeria em pílulas escuras (selecionada com borda verde) */}
              {product.imagens.length > 1 && (
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-1">
                  {product.imagens.map((img, idx) => {
                    const isSelected = selectedGalleryIndex === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedGalleryIndex(idx)}
                        className={`h-16 px-2.5 rounded-full bg-[#0A0B0D] border-2 flex items-center gap-2 flex-shrink-0 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#58E707] shadow-[0_0_15px_rgba(88,231,7,0.35)] scale-105'
                            : 'border-[#1D2026] hover:border-[#58E707]/40 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div className="w-11 h-11 rounded-full overflow-hidden bg-[#14161A] flex-shrink-0">
                          <img
                            src={img}
                            alt={`Imagem ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className={`text-xs font-bold pr-1 ${isSelected ? 'text-[#58E707]' : 'text-[#A7ADB5]'}`}>
                          Foto {idx + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Product Details & Purchase Actions */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div>
                {/* Categoria e Identificação */}
                <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
                  <span className="text-[#58E707] font-black uppercase tracking-wider text-[11px]">
                    Nº 1 DO BRASIL
                  </span>
                  <span className="text-[#1D2026]">•</span>
                  <span className="text-white font-bold uppercase">
                    {product.categoria}
                  </span>
                  <span className="text-[#1D2026]">•</span>
                  <span className="text-[#A7ADB5] font-mono">
                    ID #{product.id}
                  </span>
                  {product.modelVariantNumber && (
                    <>
                      <span className="text-[#1D2026]">•</span>
                      <span className="text-[#026FF6] font-bold">
                        Modelo {product.modelVariantNumber}
                      </span>
                    </>
                  )}
                </div>

                {/* Title */}
                <h1 className="font-sport font-black text-2xl sm:text-4xl italic tracking-tight text-white leading-tight uppercase">
                  {product.displayName || product.nome}
                </h1>
                <TricolorStripe width="w-[100px]" height="h-[3px]" className="mt-2" />

                {/* Price in Verde #58E707 */}
                <div className="mt-4 flex items-baseline gap-3 pb-4 border-b border-[#1D2026]">
                  <span className="font-sport font-black text-3xl sm:text-4xl italic text-[#58E707] drop-shadow-[0_0_15px_rgba(88,231,7,0.3)]">
                    Camiseta Personalizada
                  </span>
                  <span className="text-xs text-[#A7ADB5]">
                    Produção Oficial GL Esportes
                  </span>
                </div>

                {/* Especificações da Peça Personalizada */}
                <div className="mt-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-menu text-[#58E707]">
                    ESPECIFICAÇÕES DO UNIFORME & PRODUÇÃO
                  </h4>
                  <ul className="text-xs text-[#A7ADB5] space-y-2.5 bg-[#0A0B0D] p-4 rounded-2xl border border-[#1D2026]">
                    <li className="flex items-start gap-2">
                      <FileCheck className="w-4 h-4 text-[#58E707] flex-shrink-0 mt-0.5" />
                      <span><strong className="text-white">Tecido:</strong> Dry-Fit Esportivo Premium com proteção UV50+ e respirabilidade máxima.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Layers className="w-4 h-4 text-[#026FF6] flex-shrink-0 mt-0.5" />
                      <span><strong className="text-white">Estampa & Sublimação:</strong> Sublimação digital total toque zero, cores vivas que não desbotam nem descascam.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Download className="w-4 h-4 text-[#FC6602] flex-shrink-0 mt-0.5" />
                      <span><strong className="text-white">Personalização Inclusa:</strong> Coloque nomes dos atletas, numeração, escudo do seu clube/turma e patrocinadores.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#58E707] flex-shrink-0 mt-0.5" />
                      <span><strong className="text-white">Garantia GL Esportes:</strong> Empresa Nº 1 do Brasil • Sede em Peruíbe/SP • Entregamos para times e turmas em todo o Brasil.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Botões de Compra Oficiais */}
              <div className="space-y-3 pt-4 border-t border-[#1D2026]">
                <div className="flex items-center gap-3">
                  {/* Seletor de Quantidade */}
                  <div className="flex items-center bg-[#0A0B0D] border border-[#1D2026] rounded-xl p-1 text-sm">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#A7ADB5] hover:text-white hover:bg-[#1D2026] cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#A7ADB5] hover:text-white hover:bg-[#1D2026] cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Botão Secundário: Contorno Azul e Texto Branco */}
                  <button
                    onClick={() => {
                      addToCart(product, quantity);
                      onClose();
                    }}
                    className="flex-1 py-3.5 px-4 border-2 border-[#026FF6] hover:bg-[#026FF6]/15 text-white font-bold text-xs sm:text-sm uppercase rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(2,111,246,0.3)] cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#026FF6]" />
                    <span>Adicionar ao Carrinho</span>
                  </button>
                </div>

                {/* Botão Principal: Fundo Verde #58E707, Texto Preto #0A0B0D em Negrito e Caixa Alta */}
                <a
                  href={buildWhatsAppSingleProductUrl(product)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-extrabold text-sm uppercase rounded-xl flex items-center justify-center gap-2.5 shadow-[0_0_24px_rgba(88,231,7,0.4)] hover:scale-[1.01] transition-all cursor-pointer"
                >
                  <PhoneCall className="w-5 h-5 stroke-[2.5]" />
                  <span>Comprar pelo WhatsApp ({CONFIG.whatsappFormatted})</span>
                </a>
              </div>
            </div>
          </div>

          {/* "Você também pode gostar" */}
          {relatedProducts.length > 0 && (
            <div className="mt-10 pt-8 border-t border-[#1D2026]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-sport font-black text-xl italic tracking-wide text-white uppercase flex items-center gap-2">
                  <span>Você também pode gostar</span>
                </h3>
                <span className="text-xs text-[#A7ADB5] font-semibold">
                  Mais de {product.categoria}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {relatedProducts.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectProduct(rel)}
                    className="bg-[#0A0B0D] p-2.5 rounded-xl border border-[#1D2026] hover:border-[#58E707] transition-all cursor-pointer group"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-[#14161A] mb-2">
                      <img
                        src={rel.imagens[0]}
                        alt={rel.nome}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <p className="text-xs font-semibold text-white truncate group-hover:text-[#58E707]">
                      {rel.displayName || rel.nome}
                    </p>
                    <span className="text-xs font-black text-[#58E707] mt-1 block font-sport italic">
                      {formatPrice(rel.preco)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
