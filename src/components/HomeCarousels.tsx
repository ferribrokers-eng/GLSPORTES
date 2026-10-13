import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Product, CategoryItem } from '../types';
import { ProductCard } from './ProductCard';
import { useCatalog } from '../context/CatalogContext';
import { TricolorStripe } from './TricolorStripe';

interface HomeCarouselsProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onNavigateCategory: (slug: string) => void;
}

export const HomeCarousels: React.FC<HomeCarouselsProps> = ({
  products,
  onSelectProduct,
  onNavigateCategory,
}) => {
  const { groups } = useCatalog();
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);

  // Apenas grupos voltados para o consumidor final nos carrosséis da vitrine
  const publicGroups = groups.filter((g) => g.nome !== 'Para Estampadores' && !g.isRestricted);

  if (!publicGroups || publicGroups.length === 0) return null;

  const currentGroup = publicGroups[selectedGroupIndex] || publicGroups[0];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Group Switcher Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col items-start pb-3 border-b border-[#1D2026]">
          <span className="text-xs font-semibold uppercase tracking-menu text-[#58E707] block mb-2">
            VITRINE DINÂMICA · CATÁLOGO COMPLETO
          </span>
          <h2 className="font-sport font-black text-2xl sm:text-4xl italic text-white tracking-tight uppercase leading-none mb-3">
            CARROSSÉIS DE ESTAMPAS POR <span className="text-[#58E707]">MODALIDADE</span>
          </h2>
          <TricolorStripe width="w-[120px]" height="h-[3.5px]" className="mb-3" />
          <p className="text-xs sm:text-sm text-[#A7ADB5] mt-1">
            Selecione a modalidade abaixo para ver os modelos de uniformes e camisetas disponíveis.
          </p>
        </div>

        {/* Group Tabs (Abas limpas sem ícones de IA ou caixinhas de spam) */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-none">
          {publicGroups.map((group, idx) => {
            const isSelected = selectedGroupIndex === idx;
            return (
              <button
                key={group.nome}
                onClick={() => setSelectedGroupIndex(idx)}
                className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2 whitespace-nowrap transition-all duration-200 border cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'bg-[#58E707] text-[#0A0B0D] border-[#58E707] shadow-[0_0_20px_rgba(88,231,7,0.35)] font-extrabold'
                    : 'bg-[#14161A] text-[#A7ADB5] hover:text-white border-[#1D2026] hover:border-[#58E707]/40 hover:bg-[#1D2026]'
                }`}
              >
                <span>{group.nome}</span>
                <span className={`text-[11px] font-mono font-bold ${isSelected ? 'text-[#0A0B0D]/75' : 'text-[#A7ADB5]'}`}>
                  ({group.categorias.length})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* For each category in the selected group: a carousel with the first estampas and the button "Ver todas (N)" */}
      <div className="space-y-10">
        {currentGroup.categorias.map((cat: CategoryItem) => {
          const categoryProducts = products.filter(
            (p) => p.categoria.toLowerCase() === cat.nome.toLowerCase()
          );
          const firstProducts = categoryProducts.slice(0, 8);

          return (
            <section
              key={cat.slug}
              className="bg-[#14161A] p-4 sm:p-6 rounded-2xl border border-[#1D2026] space-y-5"
            >
              {/* Category Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1D2026]">
                <div>
                  <h3 className="font-sport font-black text-xl sm:text-2xl italic text-white tracking-tight uppercase flex items-center gap-2">
                    <span>{cat.nome}</span>
                    <span className="text-xs text-[#58E707] font-sans font-bold not-italic">
                      ({cat.total} estampas)
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#A7ADB5] mt-0.5">
                    Grupo: {currentGroup.nome} • Qualidade oficial GL Esportes
                  </p>
                </div>

                {/* Button "Ver todas (N)" */}
                <button
                  onClick={() => onNavigateCategory(cat.slug)}
                  className="py-2 px-4 rounded-xl bg-[#58E707]/15 hover:bg-[#58E707] text-[#58E707] hover:text-[#0A0B0D] font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 border border-[#58E707]/40 hover:border-[#58E707] transition-all self-start sm:self-auto cursor-pointer"
                >
                  <span>Ver todas ({cat.total})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Products Row / Grid (1:1 Fixed Aspect Ratio) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
                {firstProducts.map((product) => (
                  <ProductCard
                    key={`${product.id}-${product.modelVariantNumber || 0}`}
                    product={product}
                    onSelect={onSelectProduct}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
