import React, { useState } from 'react';
import { X, ChevronDown, ChevronRight, Heart, PhoneCall, Lock, User } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { useFavorites } from '../context/FavoritesContext';
import { CONFIG } from '../config';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  groups: any[];
  onSelectGroup: (groupName: string) => void;
  onSelectCategory: (categorySlug: string) => void;
  onNavigateCustomerArea?: () => void;
  onOpenEstampadorModal?: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  groups,
  onSelectGroup,
  onSelectCategory,
  onNavigateCustomerArea,
  onOpenEstampadorModal,
}) => {
  const { totalFavorites } = useFavorites();
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleGroup = (groupName: string) => {
    setOpenGroup(openGroup === groupName ? null : groupName);
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-[#14161A] border-r border-[#1D2026] shadow-2xl flex flex-col z-50 overflow-hidden">
        {/* Faixa tricolor no topo da gaveta */}
        <div className="h-[3.5px] w-full bg-gradient-to-r from-[#58E707] via-[#026FF6] to-[#FC6602]" />

        {/* Header */}
        <div className="p-4 border-b border-[#1D2026] flex items-center justify-between bg-[#0A0B0D]">
          <div className="flex items-center gap-2.5">
            <img
              src={CONFIG.logoUrl}
              alt="GL Sports"
              className="h-10 w-auto object-contain drop-shadow-[0_0_10px_rgba(88,231,7,0.3)]"
            />
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#A7ADB5] hover:text-white rounded-lg hover:bg-[#1D2026] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Groups Accordion */}
          <div>
            <div className="text-xs font-bold uppercase tracking-menu text-[#58E707] mb-2 px-1">
              CATEGORIAS
            </div>

            <div className="space-y-1.5">
              {groups.map((group, idx) => {
                const isRestricted = group.isRestricted || group.nome === 'Para Estampadores';
                const isExpanded = openGroup === group.nome;
                const colors = ['#58E707', '#026FF6', '#FC6602'];
                const groupColor = isRestricted ? '#FC6602' : colors[idx % colors.length];

                const handleHeaderClick = () => {
                  if (isRestricted) {
                    onClose();
                    onOpenEstampadorModal?.();
                  } else {
                    toggleGroup(group.nome);
                  }
                };

                return (
                  <div key={group.nome} className={`rounded-xl border bg-[#0A0B0D] overflow-hidden ${
                    isRestricted ? 'border-[#FC6602]/50' : 'border-[#1D2026]'
                  }`}>
                    <button
                      onClick={handleHeaderClick}
                      className="w-full p-3 flex items-center justify-between text-left text-sm font-semibold text-white hover:text-[#58E707] transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span style={{ color: groupColor }}>
                          {isRestricted ? <Lock className="w-4 h-4 text-[#FC6602]" /> : (group.icon || '👕')}
                        </span>
                        <span className={`font-sport font-black uppercase italic tracking-wide ${
                          isRestricted ? 'text-[#FC6602]' : 'text-white'
                        }`}>
                          {group.nome}
                        </span>
                        {isRestricted && (
                          <span className="text-[9px] bg-[#FC6602]/20 text-[#FC6602] border border-[#FC6602]/40 px-1.5 py-0.5 rounded font-mono font-bold ml-1">
                            RESTRITO
                          </span>
                        )}
                      </span>
                      {isRestricted ? (
                        <span className="text-xs text-[#FC6602] font-bold">Entrar</span>
                      ) : isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-[#A7ADB5]" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-[#A7ADB5]" />
                      )}
                    </button>

                    {!isRestricted && isExpanded && (
                      <div className="p-2 pt-0 bg-[#14161A] border-t border-[#1D2026] space-y-1">
                        <button
                          onClick={() => onSelectGroup(group.nome)}
                          className="w-full text-left py-1.5 px-3 rounded-lg text-xs font-black uppercase text-[#58E707] hover:bg-[#0A0B0D] flex items-center justify-between cursor-pointer"
                        >
                          <span>Ver todas de {group.nome}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        {group.categorias.map((cat: any) => (
                          <button
                            key={cat.slug}
                            onClick={() => onSelectCategory(cat.slug)}
                            className="w-full text-left py-1.5 px-3 rounded-lg text-xs text-[#A7ADB5] hover:text-white hover:bg-[#0A0B0D] flex items-center justify-between transition-colors cursor-pointer"
                          >
                            <span>{cat.nome}</span>
                            <span className="text-[10px] text-[#A7ADB5] font-mono">{cat.total}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-[#1D2026] bg-[#0A0B0D] space-y-2">
          <button
            onClick={() => {
              onClose();
              if (onNavigateCustomerArea) onNavigateCustomerArea();
            }}
            className="w-full py-2.5 px-3 bg-[#14161A] hover:bg-[#1D2026] border border-[#1D2026] text-white rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <User className="w-4 h-4 text-[#58E707]" />
            <span>Minha Conta / Entrar</span>
          </button>

          <a
            href={CONFIG.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-extrabold text-xs uppercase rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(88,231,7,0.3)]"
          >
            <PhoneCall className="w-4 h-4 stroke-[2.5]" />
            <span>Falar no WhatsApp</span>
          </a>
          <p className="text-[10px] text-center text-[#A7ADB5] uppercase tracking-wider font-medium">
            GL Sports • Desde {CONFIG.sinceYear} • {CONFIG.city}/{CONFIG.state}
          </p>
        </div>
      </div>
    </div>
  );
};
