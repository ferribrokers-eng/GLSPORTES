import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { ArrowDownUp, Sparkles, Layers } from 'lucide-react';
import { TricolorStripe } from './TricolorStripe';

interface ProductGridProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  title?: string;
  subtitle?: string;
  initialBatchSize?: number;
}

export type SortOption = 'relevance' | 'newest' | 'price-asc' | 'price-desc' | 'name-asc';

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onSelectProduct,
  title,
  subtitle,
  initialBatchSize = 24,
}) => {
  const [displayedCount, setDisplayedCount] = useState(initialBatchSize);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDisplayedCount(initialBatchSize);
  }, [products, initialBatchSize]);

  const sortedProducts = React.useMemo(() => {
    const result = [...products];

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => b.id - a.id);
        break;
      case 'price-asc':
        result.sort((a, b) => a.preco - b.preco);
        break;
      case 'price-desc':
        result.sort((a, b) => b.preco - a.preco);
        break;
      case 'name-asc':
        result.sort((a, b) => a.nome.localeCompare(b.nome));
        break;
      case 'relevance':
      default:
        break;
    }

    return result;
  }, [products, sortBy]);

  // Infinite scroll observer: load 24 at a time
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayedCount((prev) => Math.min(prev + 24, sortedProducts.length));
        }
      },
      { rootMargin: '300px' }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [sortedProducts.length]);

  const visibleProducts = sortedProducts.slice(0, displayedCount);
  const hasMore = displayedCount < sortedProducts.length;

  return (
    <div className="w-full space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1D2026]">
        <div>
          {title && (
            <div className="space-y-1">
              <h2 className="font-sport font-black text-2xl sm:text-3xl italic tracking-tight text-white flex items-center gap-2 uppercase">
                <span>{title}</span>
                <span className="text-xs text-[#58E707] font-bold not-italic font-sans">
                  ({sortedProducts.length} estampas)
                </span>
              </h2>
              <TricolorStripe width="w-[100px]" height="h-[3px]" />
            </div>
          )}
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#A7ADB5] mt-1">{subtitle}</p>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 bg-[#14161A] px-3.5 py-2 rounded-xl border border-[#1D2026] text-xs text-[#A7ADB5]">
            <ArrowDownUp className="w-3.5 h-3.5 text-[#58E707]" />
            <span className="text-[#A7ADB5] hidden sm:inline">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="relevance" className="bg-[#14161A] text-white">Mais Relevantes</option>
              <option value="newest" className="bg-[#14161A] text-white">Mais Novos (ID)</option>
              <option value="price-asc" className="bg-[#14161A] text-white">Menor Preço</option>
              <option value="price-desc" className="bg-[#14161A] text-white">Maior Preço</option>
              <option value="name-asc" className="bg-[#14161A] text-white">Nome (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {visibleProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
          {visibleProducts.map((product) => (
            <ProductCard
              key={`${product.id}-${product.modelVariantNumber || 0}`}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-[#14161A] rounded-2xl border border-dashed border-[#1D2026] p-8">
          <Sparkles className="w-10 h-10 text-[#A7ADB5] mx-auto mb-3 text-[#58E707]" />
          <h3 className="text-lg font-bold text-white uppercase font-sport">Nenhuma estampa encontrada</h3>
          <p className="text-xs text-[#A7ADB5] mt-1 max-w-sm mx-auto">
            Tente pesquisar por outro time, modalidade ou categoria.
          </p>
        </div>
      )}

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="py-6 flex items-center justify-center">
        {hasMore ? (
          <div className="flex items-center gap-2 text-xs text-[#A7ADB5] animate-pulse">
            <div className="w-2 h-2 rounded-full bg-[#58E707]" />
            <span>Carregando mais estampas (+24)...</span>
          </div>
        ) : visibleProducts.length > 0 ? (
          <div className="text-xs text-[#A7ADB5] font-medium flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#58E707]" />
            <span>Exibindo todas as {sortedProducts.length} estampas catalogadas.</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};
