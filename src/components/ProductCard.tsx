import React, { useState } from 'react';
import { Heart, ShoppingBag, Eye, Check } from 'lucide-react';
import { Product } from '../types';
import { formatPrice } from '../utils/helpers';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [isHovered, setIsHovered] = useState(false);
  const [isAddedAnimation, setIsAddedAnimation] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const favorited = isFavorite(product.id);

  const originalArtUrl = product.imagens[0];
  const secondaryArtUrl = product.imagens[1] || originalArtUrl;

  const currentImageUrl = isHovered && product.imagens.length > 1 ? secondaryArtUrl : originalArtUrl;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setIsAddedAnimation(true);
    setTimeout(() => setIsAddedAnimation(false), 1500);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  // Selos especiais (Laranja da marca)
  const isBestSeller = product.id % 7 === 0;
  const isNew = product.id % 5 === 0 && !isBestSeller;

  return (
    <div
      onClick={() => onSelect(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-[#14161A] rounded-[14px] overflow-hidden border border-[#1D2026] hover:border-[#58E707] shadow-lg hover:shadow-[0_0_20px_rgba(88,231,7,0.25)] transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-0.5"
    >
      {/* Container da imagem com proporção 1:1 fixa */}
      <div className="relative aspect-square w-full bg-[#0A0B0D] overflow-hidden">
        {/* Placeholder skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#14161A] via-[#1D2026] to-[#14161A] animate-pulse" />
        )}

        <img
          src={currentImageUrl}
          alt={product.displayName || product.nome}
          loading="lazy"
          decoding="async"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-106 pointer-events-none select-none ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Camada transparente de proteção contra download / captura direta */}
        <div 
          className="absolute inset-0 z-10 select-none" 
          onContextMenu={(e) => e.preventDefault()} 
        />

        {/* Marca d'água sutil oficial para inibir extração */}
        <div className="absolute bottom-2 right-2.5 z-10 pointer-events-none text-[8px] font-mono font-bold tracking-widest text-white/25 uppercase select-none">
          GL ESPORTES
        </div>

        {/* Gradiente sutil */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B0D]/90 via-transparent to-[#0A0B0D]/40 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="bg-[#0A0B0D]/85 backdrop-blur-md text-[10px] uppercase font-bold tracking-wider text-white px-2 py-0.5 rounded-md border border-[#1D2026]">
              {product.categoria}
            </span>

            {isBestSeller && (
              <span className="bg-[#FC6602] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md shadow-sm tracking-wider">
                MAIS VENDIDO
              </span>
            )}

            {isNew && (
              <span className="bg-[#026FF6] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md shadow-sm tracking-wider">
                NOVO
              </span>
            )}
          </div>

          {/* Botão Favoritar */}
          <button
            onClick={handleToggleFavorite}
            aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            className={`pointer-events-auto p-1.5 rounded-full backdrop-blur-md transition-all ${
              favorited
                ? 'bg-rose-500 text-white shadow-md scale-110'
                : 'bg-[#0A0B0D]/60 text-[#A7ADB5] hover:text-white hover:bg-[#0A0B0D]'
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 ${favorited ? 'fill-white stroke-white' : ''}`}
            />
          </button>
        </div>

        {/* Quick View Button no Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <span className="bg-[#0A0B0D]/90 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-[#58E707]/40 backdrop-blur-md flex items-center gap-1.5 shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5 text-[#58E707]" />
            <span>Ver Detalhes</span>
          </span>
        </div>

        {/* ID do produto */}
        <div className="absolute bottom-2 left-2.5 pointer-events-none">
          <span className="text-[10px] text-[#A7ADB5] font-mono bg-[#0A0B0D]/80 backdrop-blur-sm px-1.5 py-0.5 rounded border border-[#1D2026]">
            ID #{product.id}
          </span>
        </div>
      </div>

      {/* Info Section em Grafite */}
      <div className="p-3.5 flex flex-col flex-1 justify-between bg-[#14161A]">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#A7ADB5] font-medium">
            <span>{product.grupo}</span>
            {product.modelVariantNumber && (
              <>
                <span>•</span>
                <span className="text-[#026FF6] font-semibold">
                  Modelo {product.modelVariantNumber}
                </span>
              </>
            )}
          </div>

          <h3 className="font-semibold text-sm text-white mt-1 line-clamp-1 group-hover:text-[#58E707] transition-colors">
            {product.displayName || product.nome}
          </h3>
        </div>

        <div className="mt-3 pt-2.5 border-t border-[#1D2026] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#A7ADB5] uppercase tracking-wider block">
              Arte Vetor 300 DPI
            </span>
            <span className="font-sport font-black text-xl italic text-[#58E707]">
              {formatPrice(product.preco)}
            </span>
          </div>

          {/* Botão de Adicionar ao Carrinho */}
          <button
            onClick={handleAddToCart}
            aria-label="Adicionar estampa ao carrinho"
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isAddedAnimation
                ? 'bg-[#58E707] text-[#0A0B0D] border-[#58E707] scale-105'
                : 'bg-[#0A0B0D] hover:bg-[#58E707] text-white hover:text-[#0A0B0D] border-[#1D2026] hover:border-[#58E707] hover:shadow-[0_0_12px_rgba(88,231,7,0.3)]'
            }`}
          >
            {isAddedAnimation ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
