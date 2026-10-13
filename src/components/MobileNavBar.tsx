import React from 'react';
import { Home, Grid, Heart, ShoppingBag, PhoneCall } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { CONFIG } from '../config';

interface MobileNavBarProps {
  onNavigateHome: () => void;
  onOpenCategories: () => void;
  onNavigateFavorites: () => void;
  onOpenCart: () => void;
  activeTab?: string;
}

export const MobileNavBar: React.FC<MobileNavBarProps> = ({
  onNavigateHome,
  onOpenCategories,
  onNavigateFavorites,
  onOpenCart,
  activeTab = 'home',
}) => {
  const { totalItems } = useCart();
  const { totalFavorites } = useFavorites();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#14161A]/95 backdrop-blur-lg border-t border-[#1D2026] px-3 py-2 shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Início */}
        <button
          onClick={onNavigateHome}
          className={`flex flex-col items-center gap-1 p-1 transition-colors cursor-pointer ${
            activeTab === 'home' ? 'text-[#58E707]' : 'text-[#A7ADB5] hover:text-white'
          }`}
          aria-label="Início"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Início</span>
        </button>

        {/* Categorias */}
        <button
          onClick={onOpenCategories}
          className={`flex flex-col items-center gap-1 p-1 transition-colors cursor-pointer ${
            activeTab === 'categories' ? 'text-[#58E707]' : 'text-[#A7ADB5] hover:text-white'
          }`}
          aria-label="Categorias"
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Grupos</span>
        </button>

        {/* WhatsApp Direto Oficial no Centro */}
        <a
          href={CONFIG.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 p-1 -mt-5 text-white group"
          aria-label="WhatsApp Oficial"
        >
          <div className="w-12 h-12 rounded-full bg-[#58E707] p-0.5 shadow-[0_0_20px_rgba(88,231,7,0.45)] group-active:scale-95 transition-transform flex items-center justify-center">
            <div className="w-full h-full bg-[#0A0B0D] rounded-full flex items-center justify-center">
              <PhoneCall className="w-5 h-5 text-[#58E707] stroke-[2.5]" />
            </div>
          </div>
          <span className="text-[10px] font-black text-[#58E707] uppercase">WhatsApp</span>
        </a>

        {/* Favoritos */}
        <button
          onClick={onNavigateFavorites}
          className={`flex flex-col items-center gap-1 p-1 relative transition-colors cursor-pointer ${
            activeTab === 'favorites' ? 'text-[#58E707]' : 'text-[#A7ADB5] hover:text-white'
          }`}
          aria-label="Favoritos"
        >
          <Heart className="w-5 h-5" />
          {totalFavorites > 0 && (
            <span className="absolute top-0 right-1 w-4 h-4 bg-[#026FF6] text-white text-[9px] font-black rounded-full flex items-center justify-center">
              {totalFavorites}
            </span>
          )}
          <span className="text-[10px] font-bold uppercase tracking-wider">Favoritos</span>
        </button>

        {/* Carrinho */}
        <button
          onClick={onOpenCart}
          className="flex flex-col items-center gap-1 p-1 relative text-[#A7ADB5] hover:text-white transition-colors cursor-pointer"
          aria-label="Carrinho"
        >
          <ShoppingBag className="w-5 h-5" />
          {totalItems > 0 && (
            <span className="absolute top-0 right-1 w-4 h-4 bg-[#58E707] text-[#0A0B0D] text-[9px] font-black rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
          <span className="text-[10px] font-bold uppercase tracking-wider">Carrinho</span>
        </button>
      </div>
    </div>
  );
};
