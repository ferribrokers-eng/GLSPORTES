import React from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import { CategoryGroup } from '../types';
import { TricolorStripe } from './TricolorStripe';
import esportesImg from '../assets/images/regenerated_image_1791829727959.jpg';
import futebolImg from '../assets/images/regenerated_image_1791831172921.jpg';
import festasDatasImg from '../assets/images/regenerated_image_1791832605513.jpg';
import estiloFreestyleImg from '../assets/images/regenerated_image_1791832604038.jpg';
import culturaPopImg from '../assets/images/regenerated_image_1791834706956.jpg';
import feImg from '../assets/images/regenerated_image_1791834709473.jpg';
import infantilImg from '../assets/images/regenerated_image_1791834710795.jpg';

interface GroupsGridProps {
  groups: CategoryGroup[];
  onSelectGroup: (groupName: string) => void;
  onOpenEstampadorModal?: () => void;
}

// Imagens reais oficiais do acervo GL Sports
const GROUP_IMAGES: Record<string, string> = {
  'Esportes': esportesImg,
  'Camisetas de Futebol': futebolImg,
  'Escolar & Formatura': futebolImg,
  'Festas & Datas': festasDatasImg,
  'Cultura Pop': culturaPopImg,
  'Estilo & Lifestyle': estiloFreestyleImg,
  'Fé': feImg,
  'Infantil': infantilImg,
  'Para Estampadores': 'https://cdn.jsdelivr.net/gh/ferribrokers-eng/claude@cc30edc16a57509c153da55217133e2e879f1d89/estampashirt_imagens/Mockups/CAMISA-MASCULINA-M.C.-MODELO-006-FRENTE.jpg',
};

// Cores da marca alternadas para os 8 grupos: Verde, Azul e Laranja
const BRAND_COLORS_SEQUENCE = ['#58E707', '#026FF6', '#FC6602'];

export const GroupsGrid: React.FC<GroupsGridProps> = ({ groups, onSelectGroup, onOpenEstampadorModal }) => {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Section Header com Faixa Tricolor */}
      <div className="flex flex-col items-start mb-8">
        <span className="text-xs font-semibold uppercase tracking-menu text-[#58E707] block mb-2">
          ORGANIZAÇÃO POR MODALIDADES
        </span>
        <h2 className="font-sport font-black text-3xl sm:text-5xl italic text-white tracking-tight uppercase leading-none mb-3">
          OS 8 GRANDES GRUPOS DE <span className="text-[#58E707]">ESTAMPAS</span>
        </h2>
        <TricolorStripe width="w-[120px]" height="h-[3.5px]" className="mb-3" />
        <p className="text-sm text-[#A7ADB5] max-w-xl leading-relaxed">
          Encontre exatamente o que você precisa: do futebol de várzea aos abadás de micareta e uniformes de terceirão.
        </p>
      </div>

      {/* Grid of 8 Group Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {groups.map((group, idx) => {
          // Card 2 foi personalizado a pedido do cliente para "Camisetas de Futebol"
          const isFirstCard = idx === 0 || group.nome.toLowerCase() === 'esportes';
          const isSoccerCard = idx === 1 || group.nome === 'Escolar & Formatura' || group.nome === 'Camisetas de Futebol';
          const isFestasCard = idx === 2 || group.nome === 'Festas & Datas';
          const isCulturaCard = idx === 3 || group.nome === 'Cultura Pop';
          const isEstiloCard = idx === 4 || group.nome === 'Estilo & Lifestyle';
          const isFeCard = idx === 5 || group.nome === 'Fé';
          const isInfantilCard = idx === 6 || group.nome === 'Infantil';
          const cardTitle = isSoccerCard ? 'Camisetas de Futebol' : group.nome;
          const isRestricted = !isSoccerCard && (group.isRestricted || group.nome === 'Para Estampadores');
          const groupColor = isRestricted ? '#FC6602' : BRAND_COLORS_SEQUENCE[idx % BRAND_COLORS_SEQUENCE.length];
          const image = isSoccerCard 
            ? (futebolImg || '/regenerated_image_1791831172921.jpg')
            : isFirstCard
            ? (esportesImg || '/regenerated_image_1791829727959.jpg')
            : isFestasCard
            ? (festasDatasImg || '/regenerated_image_1791832605513.jpg')
            : isCulturaCard
            ? (culturaPopImg || '/regenerated_image_1791834706956.jpg')
            : isEstiloCard
            ? (estiloFreestyleImg || '/estilo_freestyle.jpg' || '/regenerated_image_1791832604038.jpg')
            : isFeCard
            ? (feImg || '/regenerated_image_1791834709473.jpg')
            : isInfantilCard
            ? (infantilImg || '/regenerated_image_1791834710795.jpg')
            : (GROUP_IMAGES[group.nome] || GROUP_IMAGES['Esportes']);
          const isEstampadorCard = isRestricted;
          const totalGroupProducts = isSoccerCard ? 475 : group.categorias.reduce((sum, c) => sum + (c.total || 0), 0);
          const description = isEstampadorCard
            ? 'Planos Básico, Pró e Master com download de templates vetorizados em 300 DPI (CDR, AI, PSD) e mockups 3D para sua estamparia.'
            : isSoccerCard
            ? 'Uniformes completos de futebol, times de várzea, camisas de jogo e goleiro em 300 DPI.'
            : group.categorias.map((c) => c.nome).slice(0, 4).join(', ');

          const isPortraitFocus = isEstiloCard || isFeCard || isInfantilCard || isFirstCard || isSoccerCard || isCulturaCard || isFestasCard;

          const handleClick = () => {
            if (isRestricted || isEstampadorCard || group.nome === 'Para Estampadores' || cardTitle === 'Para Estampadores') {
              if (onOpenEstampadorModal) {
                onOpenEstampadorModal();
              } else {
                onSelectGroup('Para Estampadores');
              }
              return;
            }
            if (isSoccerCard) {
              onSelectGroup('Camisetas de Futebol');
              return;
            }
            onSelectGroup(group.nome);
          };

          return (
            <div
              key={cardTitle}
              onClick={handleClick}
              className={`group relative h-84 sm:h-[400px] rounded-2xl overflow-hidden border shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-end p-5 sm:p-6 bg-[#14161A] ${
                isRestricted
                  ? 'border-[#FC6602]/50 hover:border-[#FC6602] hover:shadow-[0_0_30px_rgba(252,102,2,0.3)]'
                  : 'border-[#1D2026] hover:border-[#58E707] hover:shadow-[0_0_30px_rgba(88,231,7,0.25)]'
              }`}
            >
              {/* Faixa colorida do grupo no topo do card (alternando verde, azul, laranja) */}
              <div 
                className="absolute top-0 left-0 right-0 h-[4px] transition-all group-hover:h-[6px]"
                style={{ backgroundColor: groupColor }}
              />

              {/* Background Image - Com enquadramento focado no topo para valorizar rosto e estampas */}
              <img
                src={image}
                alt={cardTitle}
                loading="eager"
                decoding="async"
                style={{
                  objectPosition: isPortraitFocus ? 'center 10%' : 'center center',
                }}
                onError={(e) => {
                  const el = e.currentTarget;
                  if (isSoccerCard && !el.src.includes('futebol.jpg')) {
                    el.src = '/futebol.jpg';
                  } else if (isFirstCard && !el.src.includes('esportes.jpg')) {
                    el.src = '/esportes.jpg';
                  } else if (isFestasCard && !el.src.includes('festas_datas.jpg')) {
                    el.src = '/festas_datas.jpg';
                  } else if (isCulturaCard && !el.src.includes('cultura_pop.jpg')) {
                    el.src = '/cultura_pop.jpg';
                  } else if (isEstiloCard && !el.src.includes('estilo_freestyle.jpg')) {
                    el.src = '/estilo_freestyle.jpg';
                  } else if (isFeCard && !el.src.includes('fe.jpg')) {
                    el.src = '/fe.jpg';
                  } else if (isInfantilCard && !el.src.includes('infantil.jpg')) {
                    el.src = '/infantil.jpg';
                  }
                }}
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 pointer-events-none select-none ${
                  isPortraitFocus 
                    ? 'object-[center_10%] origin-top group-hover:scale-104' 
                    : 'object-center group-hover:scale-108'
                }`}
              />

              {/* 1. Sombreamento perimetral em volta (vinheta sutil nas bordas, sem tocar nas estampas da camiseta) */}
              <div 
                className="absolute inset-0 pointer-events-none transition-opacity duration-300 [background:radial-gradient(ellipse_at_center,transparent_45%,rgba(10,11,13,0.55)_100%)] group-hover:[background:radial-gradient(ellipse_at_center,transparent_45%,rgba(10,11,13,0.65)_100%)]" 
              />

              {/* 2. Gradiente suave compacto apenas no rodapé (abaixo da camiseta) para proteger os textos sem cobrir a estampa */}
              <div 
                className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#0A0B0D] via-[#0A0B0D]/50 via-40% to-transparent pointer-events-none" 
              />

              {/* Accent Glow on Hover */}
              <div
                className="absolute -bottom-10 -right-10 w-36 h-36 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none"
                style={{ backgroundColor: groupColor }}
              />

              {/* Content */}
              <div className="relative z-10 space-y-2">
                <div className="flex items-center justify-between">
                  <span 
                    className="text-xs font-black uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                    style={{ color: groupColor }}
                  >
                    {isRestricted ? 'Planos a partir de R$ 23,90' : `${totalGroupProducts} estampas`}
                  </span>
                </div>

                <h3 className={`font-sport font-black text-2xl sm:text-3xl italic tracking-wide uppercase transition-colors drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] leading-none ${
                  isRestricted ? 'text-white group-hover:text-[#FC6602]' : 'text-white group-hover:text-[#58E707]'
                }`}>
                  {cardTitle}
                </h3>

                <p className="text-xs text-[#A7ADB5] line-clamp-2 leading-relaxed drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                  {description}
                </p>

                <div 
                  className="pt-2 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider group-hover:translate-x-1.5 transition-transform drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                  style={{ color: groupColor }}
                >
                  <span>{isRestricted ? 'Conhecer Planos & Assinar' : 'Explorar Estampas'}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
