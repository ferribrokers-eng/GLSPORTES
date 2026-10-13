import React, { useState, useEffect, useRef } from 'react';
import { Upload, Image as ImageIcon, Check, RotateCcw, X, Link2, AlertCircle, Eye, ChevronLeft, ChevronRight, Sparkles, Loader2 } from 'lucide-react';
import { CONFIG } from '../config';
import { 
  getStoredHeroImages, 
  saveHeroImage, 
  removeHeroImage, 
  loadHeroImagesFromDb,
  CustomHeroImages 
} from '../lib/heroStorage';

export { getStoredHeroImages, type CustomHeroImages };

interface HeroImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSlide?: (index: number) => void;
  currentSlideIndex?: number;
}

export const HeroImageModal: React.FC<HeroImageModalProps> = ({
  isOpen,
  onClose,
  onSelectSlide,
  currentSlideIndex = 0,
}) => {
  const slides = CONFIG.heroSlides || [];
  const [activeTab, setActiveTab] = useState<number>(currentSlideIndex || 0);
  const [customImages, setCustomImages] = useState<CustomHeroImages>(getStoredHeroImages());
  const [urlInput, setUrlInput] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tabsScrollRef = useRef<HTMLDivElement>(null);

  // Sincroniza a aba ativa sempre que o modal abre ou o índice muda externamente
  useEffect(() => {
    if (isOpen) {
      const targetIdx = typeof currentSlideIndex === 'number' && currentSlideIndex >= 0 && currentSlideIndex < slides.length
        ? currentSlideIndex
        : 0;
      setActiveTab(targetIdx);
      setFeedback(null);
      setUrlInput('');
    }
  }, [isOpen, currentSlideIndex, slides.length]);

  // Carrega e ouve atualizações de imagens do IndexedDB e de outros componentes
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

  if (!isOpen) return null;

  const currentSlide = slides[activeTab] || slides[0];
  const customImg = customImages[currentSlide.id] || (currentSlide.id === 'ciclismo' ? customImages['interclasse'] : undefined);
  const effectiveImg = customImg || currentSlide.bgImage;

  // Processa o arquivo de imagem com compressão inteligente via Canvas
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'err', text: 'Por favor, selecione um arquivo de imagem válido (JPG, PNG ou WebP).' });
      return;
    }

    setIsProcessing(true);
    setFeedback(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        try {
          // Otimiza para 1600px largura máxima mantendo proporção ideal
          const maxW = 1600;
          let width = img.width;
          let height = img.height;

          if (width > maxW) {
            height = Math.round((height * maxW) / width);
            width = maxW;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            throw new Error('Falha ao inicializar o renderizador');
          }

          ctx.drawImage(img, 0, 0, width, height);
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.82);

          // Salva no IndexedDB e em cache persistente
          const updated = await saveHeroImage(currentSlide.id, optimizedDataUrl);
          setCustomImages(updated);

          setFeedback({
            type: 'ok',
            text: `Imagem de "${currentSlide.tag}" salva e aplicada com sucesso!`,
          });

          if (onSelectSlide) onSelectSlide(activeTab);
        } catch (err) {
          console.error('Erro ao processar imagem:', err);
          setFeedback({
            type: 'err',
            text: 'Ocorreu um erro ao processar a imagem. Tente uma imagem diferente.',
          });
        } finally {
          setIsProcessing(false);
        }
      };

      img.onerror = () => {
        setIsProcessing(false);
        setFeedback({ type: 'err', text: 'Não foi possível carregar o arquivo de imagem.' });
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      setIsProcessing(false);
      setFeedback({ type: 'err', text: 'Erro ao ler arquivo do dispositivo.' });
    };

    reader.readAsDataURL(file);

    // Reseta o input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleApplyUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = urlInput.trim();
    if (!cleanUrl) return;

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://') && !cleanUrl.startsWith('/')) {
      setFeedback({ type: 'err', text: 'A URL deve começar com http://, https:// ou /' });
      return;
    }

    try {
      setIsProcessing(true);
      const updated = await saveHeroImage(currentSlide.id, cleanUrl);
      setCustomImages(updated);
      setUrlInput('');
      setFeedback({
        type: 'ok',
        text: `Link aplicado para o banner de "${currentSlide.tag}"!`,
      });
      if (onSelectSlide) onSelectSlide(activeTab);
    } catch (err) {
      setFeedback({ type: 'err', text: 'Erro ao aplicar o link da imagem.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestoreDefault = async () => {
    try {
      setIsProcessing(true);
      const updated = await removeHeroImage(currentSlide.id);
      setCustomImages(updated);
      setFeedback({
        type: 'ok',
        text: `Imagem padrão restaurada para "${currentSlide.tag}".`,
      });
      if (onSelectSlide) onSelectSlide(activeTab);
    } catch (err) {
      setFeedback({ type: 'err', text: 'Erro ao restaurar imagem padrão.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsScrollRef.current) {
      const scrollAmount = 240;
      tabsScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const goToTab = (index: number) => {
    setActiveTab(index);
    setFeedback(null);
    setUrlInput('');
    if (onSelectSlide) onSelectSlide(index);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-4xl bg-[#14161A] border border-[#1D2026] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className="p-4 sm:p-6 border-b border-[#1D2026] flex items-center justify-between bg-[#0A0B0D]/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#58E707]/10 border border-[#58E707]/30 flex items-center justify-center text-[#58E707]">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-sport font-black uppercase tracking-wide text-white">
                  Trocar Imagens de Fundo do Banner
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#58E707]/20 text-[#58E707] font-bold">
                  {slides.length} Banners Disponíveis
                </span>
              </div>
              <p className="text-xs text-[#A7ADB5] mt-0.5">
                Escolha qualquer uma das 7 modalidades abaixo e envie a foto da sua equipe ou arena esportiva.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#A7ADB5] hover:text-white hover:bg-[#1D2026] transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Navegação entre os 7 Banners com Controles de Scroll */}
        <div className="relative border-b border-[#1D2026] bg-[#0E1013] px-2 sm:px-4 py-2.5 flex items-center">
          <button
            type="button"
            onClick={() => scrollTabs('left')}
            className="hidden sm:flex p-1.5 rounded-lg bg-[#14161A] text-[#A7ADB5] hover:text-white hover:bg-[#1D2026] transition-colors cursor-pointer mr-1 z-10"
            title="Rolar abas para a esquerda"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div 
            ref={tabsScrollRef}
            className="flex overflow-x-auto gap-2 scrollbar-none py-1 px-1 flex-1 scroll-smooth"
          >
            {slides.map((s, idx) => {
              const isSelected = activeTab === idx;
              const hasCustom = !!customImages[s.id] || (s.id === 'ciclismo' && !!customImages['interclasse']);
              return (
                <button
                  key={s.id}
                  onClick={() => goToTab(idx)}
                  className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-[#1D2026] text-white border border-[#58E707] shadow-[0_0_14px_rgba(88,231,7,0.25)] scale-102'
                      : 'text-[#A7ADB5] hover:text-white hover:bg-[#14161A] border border-transparent'
                  }`}
                >
                  <span 
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: s.accentColor }} 
                  />
                  <span className="whitespace-nowrap font-sport font-extrabold">
                    {idx + 1}. {s.tag}
                  </span>
                  {hasCustom && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#58E707]/20 text-[#58E707] font-mono font-black">
                      Sua Foto
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => scrollTabs('right')}
            className="hidden sm:flex p-1.5 rounded-lg bg-[#14161A] text-[#A7ADB5] hover:text-white hover:bg-[#1D2026] transition-colors cursor-pointer ml-1 z-10"
            title="Rolar abas para a direita"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo do Gerenciador */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Informações da Sessão Ativa */}
          <div className="p-4 rounded-2xl bg-[#0A0B0D] border border-[#1D2026] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider">
                <span 
                  className="px-2 py-0.5 rounded-md font-extrabold"
                  style={{ backgroundColor: `${currentSlide.accentColor}20`, color: currentSlide.accentColor }}
                >
                  Parte {activeTab + 1} de {slides.length}
                </span>
                <span className="text-[#A7ADB5] font-semibold">{currentSlide.badge}</span>
              </div>
              <h3 className="text-sm sm:text-base font-sport font-black uppercase text-white mt-1">
                {currentSlide.title}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {customImg && (
                <button
                  onClick={handleRestoreDefault}
                  disabled={isProcessing}
                  className="px-3 py-1.5 rounded-lg bg-[#14161A] hover:bg-[#1D2026] text-xs text-[#FC6602] hover:text-[#FC6602]/90 border border-[#FC6602]/30 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar Padrão</span>
                </button>
              )}
            </div>
          </div>

          {/* Mensagem de Feedback */}
          {feedback && (
            <div
              className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 animate-fadeIn ${
                feedback.type === 'ok'
                  ? 'bg-[#58E707]/15 border-[#58E707]/40 text-[#58E707]'
                  : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
              }`}
            >
              {feedback.type === 'ok' ? (
                <Check className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span className="font-semibold">{feedback.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Opções de Envio da Imagem */}
            <div className="space-y-4">
              {/* Botão de Upload do Arquivo Local com suporte a Drag & Drop */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#A7ADB5] uppercase tracking-wider">
                    1. Enviar Foto do seu Computador / Celular
                  </label>
                  <span className="text-[10px] text-[#58E707] font-semibold">
                    Banner: {currentSlide.tag}
                  </span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                  id={`hero-file-upload-input`}
                />
                
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer ${
                    isDragging
                      ? 'border-[#58E707] bg-[#58E707]/15 scale-[1.01]'
                      : isProcessing
                      ? 'border-[#58E707] bg-[#58E707]/10 opacity-70 pointer-events-none'
                      : 'border-[#1D2026] hover:border-[#58E707] bg-[#0A0B0D]/70 hover:bg-[#0A0B0D]'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#1D2026] flex items-center justify-center text-[#58E707] shadow-inner">
                    {isProcessing ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">
                      {isProcessing 
                        ? 'Otimizando e aplicando foto...' 
                        : isDragging 
                        ? 'Solte a imagem aqui' 
                        : 'Clique para escolher a sua foto'}
                    </span>
                    <span className="text-[11px] text-[#A7ADB5] block mt-0.5">
                      JPG, PNG ou WebP • Resolução sugerida: 1920 x 1080 (16:9)
                    </span>
                  </div>
                  <span className="mt-1 py-1.5 px-4 rounded-xl text-[11px] font-extrabold uppercase bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] shadow-[0_0_15px_rgba(88,231,7,0.3)]">
                    {isProcessing ? 'Gravando...' : 'Selecionar Arquivo'}
                  </span>
                </div>
              </div>

              {/* Opção alternativa: Colar URL direta */}
              <div className="pt-1">
                <label className="block text-xs font-bold text-[#A7ADB5] uppercase tracking-wider mb-2">
                  2. Ou colar o link direto da imagem na internet
                </label>
                <form onSubmit={handleApplyUrl} className="flex gap-2">
                  <div className="relative flex-1">
                    <Link2 className="w-4 h-4 text-[#A7ADB5] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://exemplo.com/sua-foto-esportiva.jpg"
                      className="w-full bg-[#0A0B0D] border border-[#1D2026] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-[#5A606A] focus:outline-none focus:border-[#58E707]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!urlInput.trim() || isProcessing}
                    className="px-4 py-2.5 bg-[#1D2026] hover:bg-[#58E707] text-white hover:text-[#0A0B0D] disabled:opacity-40 font-bold text-xs uppercase rounded-xl transition-all cursor-pointer"
                  >
                    Aplicar
                  </button>
                </form>
              </div>

              {/* Navegação Rápida entre Banners */}
              <div className="pt-2 flex items-center justify-between border-t border-[#1D2026]">
                <button
                  type="button"
                  onClick={() => goToTab((activeTab - 1 + slides.length) % slides.length)}
                  className="px-3 py-2 rounded-xl bg-[#0A0B0D] hover:bg-[#1D2026] text-[#A7ADB5] hover:text-white text-xs font-bold uppercase border border-[#1D2026] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Banner Anterior</span>
                </button>

                <span className="text-[11px] text-[#A7ADB5] font-semibold">
                  {activeTab + 1} de {slides.length}
                </span>

                <button
                  type="button"
                  onClick={() => goToTab((activeTab + 1) % slides.length)}
                  className="px-3 py-2 rounded-xl bg-[#0A0B0D] hover:bg-[#1D2026] text-[#A7ADB5] hover:text-white text-xs font-bold uppercase border border-[#1D2026] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Próximo Banner</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Pré-visualização em Tempo Real */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-[#A7ADB5] uppercase tracking-wider">
                  Pré-visualização do Banner ({currentSlide.tag})
                </label>
                <span className="text-[10px] text-[#58E707] font-mono flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {customImg ? 'Sua Foto Personalizada' : 'Foto Padrão'}
                </span>
              </div>

              <div className="relative aspect-video rounded-2xl overflow-hidden border border-[#1D2026] bg-[#0A0B0D] shadow-xl group">
                {(() => {
                  const previewPosition = currentSlide.id === 'referencia'
                    ? 'object-center'
                    : currentSlide.id === 'ciclismo'
                    ? 'object-[85%_top]'
                    : 'object-[right_top]';

                  return (
                    <img
                      src={effectiveImg}
                      alt={currentSlide.title}
                      className={`w-full h-full object-cover ${previewPosition}`}
                    />
                  );
                })()}
                {/* Degradê apenas do ladinho esquerdo: mantendo uniformes, pessoas e camisetas 100% nítidos e visíveis */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A0B0D] via-[#0A0B0D]/80 via-30% to-transparent to-60%" />
                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#0A0B0D] to-transparent" />

                {/* Conteúdo simulado */}
                <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-end text-left pointer-events-none">
                  <span 
                    className="text-[10px] font-black uppercase tracking-wider"
                    style={{ color: currentSlide.accentColor }}
                  >
                    {currentSlide.badge}
                  </span>
                  <h4 className="text-xs sm:text-sm font-sport font-black uppercase text-white mt-0.5 line-clamp-1">
                    {currentSlide.title}
                  </h4>
                  <p className="text-[10px] text-white/90 line-clamp-2 mt-1 leading-snug">
                    {currentSlide.subtitle}
                  </p>
                  <div className="mt-2.5 inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-[#58E707] text-[#0A0B0D] text-[10px] font-extrabold uppercase w-fit">
                    <span>Botão do WhatsApp</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 p-3 rounded-xl bg-[#0A0B0D] border border-[#1D2026] text-[11px] text-[#A7ADB5] flex items-start gap-2">
                <Eye className="w-4 h-4 text-[#58E707] flex-shrink-0 mt-0.5" />
                <p>
                  A imagem fica salva no seu navegador com tecnologia de alta capacidade (IndexedDB) e continuará visível mesmo após recarregar a página.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="p-3 sm:p-4 border-t border-[#1D2026] bg-[#0A0B0D] flex items-center justify-between">
          <div className="text-[11px] text-[#A7ADB5] hidden sm:block">
            Modificando: <strong className="text-white">{currentSlide.tag}</strong> ({activeTab + 1} de {slides.length})
          </div>
          <button
            onClick={onClose}
            className="py-2 px-5 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-extrabold text-xs uppercase rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(88,231,7,0.25)] ml-auto"
          >
            Concluir & Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
