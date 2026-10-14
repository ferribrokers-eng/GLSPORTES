import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ShoppingBag, Heart, Menu, X, ArrowRight, PhoneCall, Lock, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useCatalog } from '../context/CatalogContext';
import { formatPrice, removeAccents } from '../utils/helpers';
import { Product } from '../types';
import { CONFIG } from '../config';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onNavigateHome: () => void;
  onNavigateGroup: (groupName: string) => void;
  onNavigateCategory: (categorySlug: string) => void;
  onNavigateFavorites: () => void;
  onNavigateCustomerArea?: () => void;
  onSelectProduct: (product: Product) => void;
  onOpenInfoModal?: (type: 'sobre' | 'como-comprar' | 'contato' | 'politica') => void;
  onNavigateHowItWorks?: () => void;
  onOpenEstampadorModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onNavigateHome,
  onNavigateGroup,
  onNavigateCategory,
  onNavigateFavorites,
  onNavigateCustomerArea,
  onSelectProduct,
  onOpenInfoModal,
  onNavigateHowItWorks,
  onOpenEstampadorModal,
}) => {
  const { totalItems, setIsCartOpen } = useCart();
  const { favorites } = useFavorites();
  const { products, groups, totalCount } = useCatalog();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const totalFavorites = favorites.length;
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Busca em tempo real sobre os 2.262 produtos
  const searchResults = useMemo(() => {
    const query = removeAccents(searchQuery.trim().toLowerCase());
    if (query.length < 2) return [];

    return products
      .filter((p) => {
        const nameMatch = removeAccents(p.nome.toLowerCase()).includes(query);
        const catMatch = removeAccents(p.categoria.toLowerCase()).includes(query);
        const groupMatch = removeAccents(p.grupo.toLowerCase()).includes(query);
        const tagMatch = p.tags?.some((t) => removeAccents(t.toLowerCase()).includes(query));
        const idMatch = p.id.toString() === query;
        return nameMatch || catMatch || groupMatch || tagMatch || idMatch;
      })
      .slice(0, 8);
  }, [searchQuery, products]);

  const handleMouseEnterMenu = () => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    setIsMegaMenuOpen(true);
  };

  const handleMouseLeaveMenu = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
    }, 200);
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* Top Banner Rotativo Contínuo - No desktop mantém tamanho normal padrão, no mobile dá o destaque desejado */}
      <div className="w-full bg-[#0A0B0D] border-b border-[#1D2026] overflow-hidden py-2 sm:py-1.5 select-none relative z-50">
        <div className="animate-marquee flex items-center">
          {[1, 2].map((groupKey) => (
            <div
              key={groupKey}
              className="flex items-center gap-6 sm:gap-8 whitespace-nowrap text-xs sm:text-[11px] uppercase font-bold tracking-wider pr-6 sm:pr-8"
            >
              {[1, 2].map((repeat) => (
                <React.Fragment key={repeat}>
                  {/* 1. A Número 1 do Brasil */}
                  <span className="flex items-center gap-2 text-[#58E707] font-black">
                    <span className="w-2 h-2 rounded-full bg-[#58E707] animate-pulse" />
                    <span className="tracking-wide">
                      A NÚMERO 1 DO BRASIL EM VESTUÁRIO ESPORTIVO E SUBLIMAÇÃO
                    </span>
                  </span>

                  <span className="text-[#323742] font-bold">•</span>

                  {/* 2. Qualidade Premium */}
                  <span className="text-white font-extrabold flex items-center gap-1.5">
                    <span className="text-[#026FF6]">★</span>
                    <span>QUALIDADE PREMIUM</span>
                  </span>

                  <span className="text-[#323742] font-bold">•</span>

                  {/* 3. Times e equipes de todo o Brasil usam a nossa qualidade */}
                  <span className="text-[#FC6602] font-black tracking-wide">
                    TIMES E EQUIPES DE TODO O BRASIL USAM A NOSSA QUALIDADE
                  </span>

                  <span className="text-[#323742] font-bold">•</span>
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Main Header em Grafite Translúcido com Backdrop Blur */}
      <div
        className={`w-full transition-all duration-300 bg-[#14161A]/95 backdrop-blur-md ${
          isScrolled ? 'py-2 sm:py-2.5 shadow-2xl' : 'py-2 sm:py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Esquerda: Mobile Menu + Logo Oficial GL Sports (Menorzinha apenas no mobile: h-8, no desktop h-11 sm:h-12) */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={onOpenMobileMenu}
              aria-label="Abrir menu de categorias"
              className="lg:hidden p-1.5 text-[#A7ADB5] hover:text-white hover:bg-[#1D2026] rounded-xl transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1.5 group text-left cursor-pointer"
              title="GL Sports - Página Inicial"
            >
              <img
                src={CONFIG.logoUrl}
                alt="GL Sports"
                className="h-8 sm:h-12 w-auto object-contain drop-shadow-[0_0_15px_rgba(88,231,7,0.3)] transition-transform group-hover:scale-105"
              />
            </button>
          </div>

          {/* Menus Principais (Desktop intacto) */}
          <nav className="hidden xl:flex items-center gap-6 shrink-0">
            <button
              onClick={onNavigateHome}
              className="text-xs font-semibold text-white hover:text-[#58E707] uppercase tracking-menu transition-colors py-2 cursor-pointer"
            >
              INÍCIO
            </button>

            <div 
              onMouseEnter={handleMouseEnterMenu}
              onMouseLeave={handleMouseLeaveMenu}
              className="relative"
            >
              <button
                className={`text-xs font-semibold uppercase tracking-menu transition-colors py-2 cursor-pointer ${
                  isMegaMenuOpen ? 'text-[#58E707]' : 'text-white hover:text-[#58E707]'
                }`}
              >
                CATEGORIAS
              </button>
            </div>

            <button
              onClick={onNavigateHowItWorks}
              className="text-xs font-semibold text-white hover:text-[#58E707] uppercase tracking-menu transition-colors py-2 cursor-pointer"
            >
              COMO FUNCIONA
            </button>

            <button
              onClick={() => onOpenInfoModal?.('sobre')}
              className="text-xs font-semibold text-white hover:text-[#58E707] uppercase tracking-menu transition-colors py-2 cursor-pointer"
            >
              SOBRE NÓS
            </button>

            <button
              onClick={() => onOpenInfoModal?.('contato')}
              className="text-xs font-semibold text-white hover:text-[#58E707] uppercase tracking-menu transition-colors py-2 cursor-pointer"
            >
              CONTATO
            </button>
          </nav>

          {/* Centro: Barra de Busca (Desktop com largura normal original, Mobile compacta embutida) */}
          <div className="flex-1 max-w-md relative min-w-0 mx-1 sm:mx-0">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Buscar nas mais de 2.100 estampas..."
                className="w-full bg-[#0A0B0D] text-white placeholder-[#A7ADB5]/60 pl-8 sm:pl-10 pr-7 sm:pr-8 py-1.5 sm:py-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:ring-2 focus:ring-[#58E707]/20 focus:outline-none text-[11px] sm:text-sm transition-all shadow-inner"
              />
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#A7ADB5] absolute left-2.5 sm:left-3.5 top-2.5 sm:top-3.5 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 sm:right-3 top-2 sm:top-3 text-[#A7ADB5] hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>

            {/* Dropdown de Busca Instantânea */}
            {isSearchFocused && searchQuery.trim().length >= 2 && (
              <div 
                className="absolute left-0 right-0 top-full mt-2 bg-[#14161A] border border-[#1D2026] rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl"
                onMouseDown={(e) => e.preventDefault()}
              >
                <div className="p-3 bg-[#0A0B0D] border-b border-[#1D2026] flex items-center justify-between text-xs text-[#A7ADB5]">
                  <span>Resultados para "{searchQuery}"</span>
                  <span className="text-[#58E707] font-bold">{searchResults.length} encontrados</span>
                </div>

                {searchResults.length > 0 ? (
                  <div className="divide-y divide-[#1D2026] max-h-96 overflow-y-auto">
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => {
                          onSelectProduct(product);
                          setIsSearchFocused(false);
                          setSearchQuery('');
                        }}
                        className="w-full p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3.5 hover:bg-[#1D2026]/60 transition-colors text-left group cursor-pointer"
                      >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#0A0B0D] overflow-hidden shrink-0 border border-[#1D2026] aspect-square">
                          <img
                            src={product.imagens[0]}
                            alt={product.nome}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-[#58E707] transition-colors">
                            {product.displayName || product.nome}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] sm:text-xs text-[#A7ADB5]">
                            <span className="bg-[#0A0B0D] px-1.5 py-0.5 rounded text-[10px] border border-[#1D2026]">
                              {product.categoria}
                            </span>
                            <span>•</span>
                            <span>ID #{product.id}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-extrabold text-[#58E707] text-xs sm:text-sm">
                            {formatPrice(product.preco)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-5 text-center text-xs text-[#A7ADB5]">
                    Nenhuma estampa encontrada para "{searchQuery}".
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Direita: WhatsApp Oficial, Área do Cliente (Logar) e Carrinho (Coração oculto no mobile) */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            {/* Botão de WhatsApp Oficial Verde (Desktop) */}
            <a
              href={CONFIG.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Falar no WhatsApp oficial"
              className="hidden lg:flex items-center gap-2 py-2 px-3.5 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-extrabold text-xs uppercase rounded-xl transition-all shadow-[0_0_15px_rgba(88,231,7,0.3)] hover:scale-105"
            >
              <PhoneCall className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>WhatsApp</span>
            </a>

            {/* Área do Cliente / Entrar */}
            <button
              onClick={onNavigateCustomerArea}
              aria-label="Área do Cliente"
              className="p-1.5 sm:p-2.5 text-[#A7ADB5] hover:text-[#58E707] hover:bg-[#1D2026] rounded-xl transition-colors cursor-pointer"
              title="Área do Cliente / Entrar"
            >
              <User className="w-5 h-5" />
            </button>

            {/* Favoritos (Oculto no mobile conforme solicitado) */}
            <button
              onClick={onNavigateFavorites}
              aria-label="Ver produtos favoritos"
              className="hidden md:flex p-2.5 text-[#A7ADB5] hover:text-white hover:bg-[#1D2026] rounded-xl transition-colors relative cursor-pointer"
            >
              <Heart className="w-5 h-5" />
              {totalFavorites > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#026FF6] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow">
                  {totalFavorites}
                </span>
              )}
            </button>

            {/* Carrinho */}
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="Abrir carrinho de compras"
              className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-2 bg-[#0A0B0D] hover:bg-[#1D2026] border border-[#1D2026] hover:border-[#58E707] rounded-xl transition-all shadow-md text-white group cursor-pointer"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-[#58E707] group-hover:scale-110 transition-transform" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-[#58E707] text-[#0A0B0D] text-[10px] font-black rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-bold text-white uppercase tracking-wider">
                Carrinho
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Faixa Tricolor na borda inferior do cabeçalho */}
      <div className="h-[3px] w-full bg-gradient-to-r from-[#58E707] via-[#026FF6] to-[#FC6602]" />

      {/* Mega Menu Dropdown */}
      {isMegaMenuOpen && (
        <div
          onMouseEnter={handleMouseEnterMenu}
          onMouseLeave={handleMouseLeaveMenu}
          className="hidden lg:block absolute left-0 right-0 top-full bg-[#14161A]/98 backdrop-blur-2xl border-b border-[#1D2026] shadow-2xl py-8 px-6 z-50 animate-fadeIn"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#1D2026]">
              <div>
                <h3 className="font-sport font-black text-2xl italic tracking-wide text-white uppercase flex items-center gap-2">
                  <span>Todas as Categorias</span>
                  <span className="text-xs text-[#58E707] font-bold not-italic">
                    • {totalCount.toLocaleString('pt-BR')} Estampas Oficiais
                  </span>
                </h3>
                <p className="text-xs text-[#A7ADB5] mt-1">
                  Artes digitais completas vetorizadas prontas para sublimação total
                </p>
              </div>
              <button
                onClick={() => {
                  setIsMegaMenuOpen(false);
                  onNavigateHome();
                }}
                className="text-xs font-extrabold uppercase text-[#58E707] hover:underline flex items-center gap-1 cursor-pointer"
              >
                Ver tudo na vitrine <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Grupos de Categorias em Grid (Apenas grupos esportivos para clientes finais) */}
            <div className="grid grid-cols-4 xl:grid-cols-7 gap-4">
              {groups.filter((g) => !g.isRestricted && g.nome !== 'Para Estampadores').map((group, gIdx) => {
                const brandColors = ['#58E707', '#026FF6', '#FC6602'];
                const groupColor = brandColors[gIdx % brandColors.length];

                const handleGroupClick = () => {
                  setIsMegaMenuOpen(false);
                  onNavigateGroup(group.nome);
                };

                return (
                  <div 
                    key={group.nome}
                    className="bg-[#0A0B0D] p-3.5 rounded-2xl border border-[#1D2026] hover:border-[#58E707] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <button
                        onClick={handleGroupClick}
                        className="w-full text-left font-sport font-black text-base italic flex items-center gap-1.5 pb-2 border-b border-[#1D2026] mb-2.5 uppercase text-white hover:text-[#58E707] transition-colors cursor-pointer"
                      >
                        <span className="truncate">{group.nome}</span>
                      </button>

                      <ul className="space-y-1.5 text-xs">
                        {group.categorias.map((cat) => (
                          <li key={cat.slug}>
                            <button
                              onClick={() => {
                                setIsMegaMenuOpen(false);
                                onNavigateCategory(cat.slug);
                              }}
                              className="w-full text-left py-1 px-1.5 rounded-lg text-[#A7ADB5] hover:text-white hover:bg-[#1D2026] flex items-center justify-between transition-colors group/item cursor-pointer"
                            >
                              <span className="truncate group-hover/item:text-[#58E707]">
                                {cat.nome}
                              </span>
                              <span className="text-[10px] text-[#A7ADB5] font-mono ml-1">
                                {cat.total}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#1D2026]">
                      <button
                        onClick={handleGroupClick}
                        className="text-[11px] font-bold flex items-center justify-between w-full uppercase cursor-pointer text-[#58E707]"
                      >
                        <span>Explorar</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
