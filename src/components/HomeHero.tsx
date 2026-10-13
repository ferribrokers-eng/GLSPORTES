import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, PhoneCall, Award, ShieldCheck, Zap } from 'lucide-react';
import { CONFIG } from '../config';
import { getStoredHeroImages, loadHeroImagesFromDb, CustomHeroImages } from '../lib/heroStorage';

interface HomeHeroProps {
  onExplore: (categorySlug?: string) => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({ onExplore }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [customImages, setCustomImages] = useState<CustomHeroImages>(getStoredHeroImages());

  // Slides obtidos da configuração oficial
  const slides = CONFIG.heroSlides || [];

  // Escuta atualizações de imagens personalizadas salvas e carrega do IndexedDB
  useEffect(() => {
    loadHeroImagesFromDb().then((imgs) => {
      setCustomImages(imgs);
    });

    const handleUpdated = (e: Event) => {
      const customEvt = e as CustomEvent<CustomHeroImages>;
      if (customEvt.detail) {
        setCustomImages(customEvt.detail);
      } else {
        setCustomImages(getStoredHeroImages());
      }
    };

    window.addEventListener('glsports_hero_images_updated', handleUpdated);
    return () => window.removeEventListener('glsports_hero_images_updated', handleUpdated);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  const slide = slides[currentSlide] || slides[0];

  return (
    <div 
      className="relative w-full bg-[#0A0B0D] overflow-hidden border-b border-[#1D2026] select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Camadas de Imagens de Plano de Fundo com Transição Suave (Crossfade) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {slides.map((s, idx) => {
          const effectiveBg = customImages[s.id] || (s.id === 'ciclismo' ? customImages['interclasse'] : undefined) || s.bgImage;
          
          // Posicionamento inteligente para nunca cortar cabeças e destacar pessoas e uniformes
          const positionClass = s.id === 'referencia'
            ? 'object-center lg:object-right'
            : s.id === 'ciclismo'
            ? 'object-[center_top] md:object-[85%_top]'
            : 'object-[center_top] md:object-[right_top]';

          return (
            <div
              key={s.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                currentSlide === idx ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {effectiveBg && (
                <img
                  src={effectiveBg}
                  alt={s.title}
                  className={`w-full h-full object-cover transition-opacity duration-700 ease-out ${positionClass}`}
                  loading={idx === 0 ? "eager" : "lazy"}
                />
              )}
              
              {/* 1. Degradê Protetor Lateral (Desktop md+): Fica apenas do ladinho esquerdo (sobre os textos).
                  O centro e o lado direito onde ficam as pessoas, uniformes e camisetas ficam 100% livres de sombreamento */}
              <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#0A0B0D] via-[#0A0B0D]/80 via-28% lg:via-[#0A0B0D]/45 lg:via-42% to-transparent to-60%" />
              
              {/* 2. Degradê Protetor (Mobile < md): Suave a partir de baixo para garantir leitura dos botões/títulos,
                  deixando as pessoas e o trabalho das camisetas no topo e centro totalmente nítidos e luminosos */}
              <div className="md:hidden absolute inset-0 bg-gradient-to-t from-[#0A0B0D] via-[#0A0B0D]/55 via-45% to-transparent to-75%" />
              <div className="md:hidden absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#0A0B0D]/20 to-transparent" />

              {/* 3. Transição sutil na base para integrar com a seção de benefícios */}
              <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#0A0B0D] to-transparent" />
            </div>
          );
        })}
      </div>

      {/* Glow esportivo sutil apenas do lado esquerdo (atrás do texto, nunca cobrindo pessoas) */}
      <div 
        className="absolute -top-32 -left-20 w-[450px] h-[450px] rounded-full blur-[160px] opacity-15 pointer-events-none transition-colors duration-700 z-[1]" 
        style={{ backgroundColor: slide.accentColor }}
      />

      {/* Conteúdo Principal do Slide */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20 relative z-10">
        <div className="max-w-4xl space-y-6 text-left">
          
          {/* Texto Superior Limpo */}
          <div className="flex flex-wrap items-center gap-2 tracking-widest uppercase font-black text-xs sm:text-sm">
            <span 
              className="transition-colors duration-500 font-extrabold drop-shadow"
              style={{ color: slide.accentColor }}
            >
              {slide.badge}
            </span>
            <span className="text-white font-bold text-xs tracking-normal drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              • Atendemos todo o Brasil 🇧🇷
            </span>
          </div>

          {/* Título Principal Esportivo */}
          <h1 className="font-sport font-black text-3xl sm:text-5xl lg:text-6xl italic tracking-tight text-white uppercase leading-[0.95] drop-shadow-md">
            {slide.title}
          </h1>

          {/* Faixa tricolor sutil */}
          <div className="w-24 h-1 rounded-full bg-gradient-to-r from-[#58E707] via-[#026FF6] to-[#FC6602]" />

          {/* Subtítulo em Branco Puro com Sombra Protetora */}
          <p className="text-sm sm:text-base text-white font-medium max-w-2xl leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            {slide.subtitle}
          </p>

          {/* Botões de Ação */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <a
              href={CONFIG.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3.5 px-6 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-extrabold text-xs sm:text-sm uppercase rounded-xl flex items-center gap-2 shadow-[0_0_25px_rgba(88,231,7,0.35)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 stroke-[2.5]" />
              <span>Comprar pelo WhatsApp</span>
            </a>

            <button
              onClick={() => onExplore(slide.category)}
              className="py-3.5 px-6 bg-[#14161A]/90 hover:bg-[#1D2026] text-white hover:text-[#58E707] font-bold text-xs sm:text-sm uppercase rounded-xl border border-[#1D2026] hover:border-[#58E707]/50 flex items-center gap-2 transition-all cursor-pointer backdrop-blur-sm"
            >
              <span>Ver Catálogo Completo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Selos de Confiança Oficiais */}
          <div className="pt-4 grid grid-cols-3 gap-3 border-t border-[#1D2026]/80 max-w-lg backdrop-blur-[2px]">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#14161A]/80 border border-[#1D2026] text-[#FC6602]">
                <Award className="w-4 h-4 text-[#FC6602]" />
              </div>
              <div>
                <div className="text-xs font-bold text-white leading-none">5,0 ★</div>
                <div className="text-[10px] text-white/80 mt-0.5">no Google</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#14161A]/80 border border-[#1D2026] text-[#58E707]">
                <ShieldCheck className="w-4 h-4 text-[#58E707]" />
              </div>
              <div>
                <div className="text-xs font-bold text-white leading-none">300 DPI</div>
                <div className="text-[10px] text-white/80 mt-0.5">Vetorizado</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#14161A]/80 border border-[#1D2026] text-[#026FF6]">
                <Zap className="w-4 h-4 text-[#026FF6]" />
              </div>
              <div>
                <div className="text-xs font-bold text-white leading-none">Envio Rápido</div>
                <div className="text-[10px] text-white/80 mt-0.5">Via WhatsApp</div>
              </div>
            </div>
          </div>

          {/* Controles do Carrossel (Indicadores, Próximo/Anterior e Botão Trocar Imagem) */}
          <div className="flex flex-wrap items-center gap-4 pt-3">
            <div className="flex items-center gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentSlide === idx 
                      ? 'w-8 bg-[#58E707] shadow-[0_0_10px_rgba(88,231,7,0.5)]' 
                      : 'w-2 bg-[#1D2026] hover:bg-[#A7ADB5]'
                  }`}
                  aria-label={`Ir para slide ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                aria-label="Slide anterior"
                className="p-1.5 rounded-lg bg-[#14161A]/80 text-[#A7ADB5] hover:text-white hover:bg-[#1D2026] border border-[#1D2026] transition-colors cursor-pointer backdrop-blur-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                aria-label="Próximo slide"
                className="p-1.5 rounded-lg bg-[#14161A]/80 text-[#A7ADB5] hover:text-white hover:bg-[#1D2026] border border-[#1D2026] transition-colors cursor-pointer backdrop-blur-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
