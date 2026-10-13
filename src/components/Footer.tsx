import React from 'react';
import { ShieldCheck, PhoneCall, Instagram, ArrowUp, Layers, MapPin, ExternalLink, Star, Globe } from 'lucide-react';
import { CONFIG } from '../config';
import { useCatalog } from '../context/CatalogContext';
import { TricolorStripe } from './TricolorStripe';

interface FooterProps {
  onNavigateHome: () => void;
  onNavigateGroup: (groupName: string) => void;
  onNavigateCategory: (slug: string) => void;
  onOpenInfoModal: (page: 'sobre' | 'como-comprar' | 'contato' | 'politica') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateHome,
  onNavigateGroup,
  onNavigateCategory,
  onOpenInfoModal,
}) => {
  const { groups, totalCount } = useCatalog();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative w-full bg-[#0A0B0D] border-t border-[#1D2026] pt-0 pb-24 lg:pb-12 text-[#A7ADB5] text-xs">
      {/* Faixa Tricolor no topo do rodapé */}
      <div className="h-[3.5px] w-full bg-gradient-to-r from-[#58E707] via-[#026FF6] to-[#FC6602]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 space-y-12">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Logo, Slogan e Informações da Marca */}
          <div className="lg:col-span-2 space-y-4">
            {/* Logo Oficial GL Sports */}
            <div className="flex items-center gap-3">
              <img
                src={CONFIG.logoUrl}
                alt="GL Sports"
                className="h-12 sm:h-14 w-auto object-contain drop-shadow-[0_0_15px_rgba(88,231,7,0.3)]"
              />
            </div>

            {/* Slogan Oficial */}
            <p className="font-sport font-black text-lg italic text-white uppercase tracking-tight">
              “{CONFIG.tagline}”
            </p>

            <p className="text-[#A7ADB5] max-w-sm leading-relaxed">
              Camisetas e uniformes personalizados para times, escolas, eventos e empresas.
              Sede em Peruíbe/SP. Atendemos todo o Brasil com tecnologia dry-fit e estampas de alta resolução.
            </p>

            {/* Badges Oficiais */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-2 bg-[#14161A] px-3 py-1.5 rounded-xl border border-[#1D2026] text-white font-semibold">
                <Layers className="w-4 h-4 text-[#58E707]" />
                <span className="text-xs">
                  {totalCount > 0 ? `${totalCount.toLocaleString('pt-BR')} estampas` : '2.262 estampas'}
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 bg-[#14161A] px-3 py-1.5 rounded-xl border border-[#1D2026] text-[#FC6602] font-bold">
                <Star className="w-3.5 h-3.5 fill-[#FC6602]" />
                <span className="text-xs">{CONFIG.googleRating.text}</span>
              </div>

              <div className="inline-flex items-center gap-1.5 bg-[#14161A] px-3 py-1.5 rounded-xl border border-[#1D2026] text-white font-medium">
                <Globe className="w-3.5 h-3.5 text-[#026FF6]" />
                <span className="text-xs">Todo o Brasil</span>
              </div>
            </div>

            {/* Redes Sociais Oficiais: Instagram @glsportscamisetas */}
            <div className="pt-2 flex items-center gap-3">
              <a
                href={CONFIG.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#14161A] hover:bg-[#1D2026] border border-[#1D2026] hover:border-[#58E707] text-white transition-all text-xs font-bold"
                title="Instagram da GL Sports"
                aria-label="Instagram @glsportscamisetas"
              >
                <Instagram className="w-4 h-4 text-[#58E707]" />
                <span>{CONFIG.social.instagramHandle}</span>
              </a>

              <a
                href={CONFIG.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-[#14161A] hover:bg-[#58E707] border border-[#1D2026] flex items-center justify-center text-[#58E707] hover:text-[#0A0B0D] transition-all"
                title="WhatsApp Oficial"
                aria-label="WhatsApp"
              >
                <PhoneCall className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Modalidades Esportivas */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-menu text-xs">
              MODALIDADES
            </h4>
            <ul className="space-y-2">
              {groups.slice(0, 4).map((g) => (
                <li key={g.nome}>
                  <button
                    onClick={() => onNavigateGroup(g.nome)}
                    className="hover:text-[#58E707] transition-colors text-left flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{g.icon}</span>
                    <span>{g.nome}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Eventos & Estilos */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-menu text-xs">
              EVENTOS & LINHAS
            </h4>
            <ul className="space-y-2">
              {groups.slice(4, 8).map((g) => (
                <li key={g.nome}>
                  <button
                    onClick={() => onNavigateGroup(g.nome)}
                    className="hover:text-[#58E707] transition-colors text-left flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{g.icon}</span>
                    <span>{g.nome}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Sede Peruíbe, Atendimento Brasil & Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-menu text-xs">
              SEDE & ATENDIMENTO
            </h4>
            <div className="space-y-2 text-xs">
              <p className="text-white font-semibold">
                {CONFIG.nationalCoverage}
              </p>
              <p className="text-[#A7ADB5] flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#58E707] flex-shrink-0 mt-0.5" />
                <span>{CONFIG.address.full}</span>
              </p>
              <div className="pt-1 flex flex-col gap-1.5">
                <a
                  href={CONFIG.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#58E707] flex items-center gap-1 font-semibold"
                >
                  <PhoneCall className="w-3 h-3 text-[#58E707]" />
                  <span>{CONFIG.whatsappFormatted}</span>
                </a>
              </div>
            </div>

            <ul className="space-y-1.5 pt-2 border-t border-[#1D2026]">
              <li>
                <button
                  onClick={() => onOpenInfoModal('sobre')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Sobre a GL Sports
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenInfoModal('como-comprar')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Como Comprar
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenInfoModal('contato')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Contato & Suporte
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenInfoModal('politica')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Política de Uso
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Linha final com a assinatura oficial solicitada */}
        <div className="pt-8 border-t border-[#1D2026] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#A7ADB5]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1 text-white font-medium">
              <ShieldCheck className="w-4 h-4 text-[#58E707]" />
              Pagamento 100% Seguro via Pix
            </span>
            <span>•</span>
            <span className="text-[#A7ADB5]">{CONFIG.nationalCoverage}</span>
            <span>•</span>
            <span className="text-[#FC6602] font-bold">{CONFIG.googleRating.text}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Linha exigida: GL SPORTS · DESDE 2015 */}
            <span className="font-bold text-white uppercase tracking-menu">
              GL SPORTS · DESDE {CONFIG.sinceYear}
            </span>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-xl bg-[#14161A] hover:bg-[#1D2026] text-white hover:text-[#58E707] transition-colors border border-[#1D2026] cursor-pointer"
              title="Voltar ao topo"
              aria-label="Voltar ao topo"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
