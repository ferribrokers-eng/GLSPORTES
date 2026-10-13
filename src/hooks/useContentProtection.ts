import { useEffect } from 'react';

/**
 * Hook para proteção de imagens e conteúdo contra cópia não autorizada,
 * clique com botão direito e extração por scrapers.
 */
export function useContentProtection() {
  useEffect(() => {
    // 1. Bloqueia o clique com botão direito (menu de contexto)
    const handleContextMenu = (e: MouseEvent) => {
      // Bloqueia em todo o site, principalmente quando o alvo é imagem ou elemento de vitrine
      e.preventDefault();
      return false;
    };

    // 2. Bloqueia arrastar imagens (drag and drop)
    const handleDragStart = (e: DragEvent) => {
      if (e.target instanceof HTMLImageElement || (e.target as HTMLElement).tagName === 'IMG') {
        e.preventDefault();
        return false;
      }
    };

    // 3. Bloqueia atalhos de salvar página/código-fonte (Ctrl+S, Cmd+S, Ctrl+U)
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        return false;
      }
      if (cmdOrCtrl && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        return false;
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('dragstart', handleDragStart);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('dragstart', handleDragStart);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}
