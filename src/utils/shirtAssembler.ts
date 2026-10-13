/**
 * Utilitário de composição dinâmica da camiseta montada (Frente + Costas)
 * Conforme especificação PROMPT_MONTADA_MOLDE:
 * - Se layout === 'molde':
 *    Corta as peças com margem de segurança de 1.2%
 *    Aplica recorte preciso (ou remoção de fundo com tolerância/máscara suave)
 *    Monta composição em canvas 800x800px:
 *      * Fundo gradiente/cinza suave (#F3F4F6 a #E5E7EB) ou tema escuro suave (#14161A com glow)
 *      * Sombra sutil projetada embaixo
 *      * Frente centralizada/à esquerda
 *      * Costas ligeiramente deslocada à direita (efeito vitrine profissional)
 * - Se layout === 'so_frente' ou 'kit':
 *    Recorta a frente e exibe montada
 * - Caso não seja possível renderizar (ex: 'foto' ou falha de imagem):
 *    Retorna a imagem original.
 */

import { Visual3D, Visual3DPecas } from '../types';

// Cache em memória para evitar reprocessamento desnecessário
const assembledImagesCache = new Map<string, string>();
const pendingPromises = new Map<string, Promise<string>>();

interface CropCoords {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Converte coordenadas relativas [x, y, w, h] (0 a 1) para pixels com margem de 1.2%
 */
function getCropCoords(
  box: number[],
  imgWidth: number,
  imgHeight: number,
  marginPercent = 0.012
): CropCoords {
  const [rx, ry, rw, rh] = box;
  
  // Margem de segurança de 1.2%
  const mx = rw * marginPercent;
  const my = rh * marginPercent;

  const x = Math.max(0, Math.floor((rx + mx) * imgWidth));
  const y = Math.max(0, Math.floor((ry + my) * imgHeight));
  const width = Math.min(imgWidth - x, Math.ceil((rw - 2 * mx) * imgWidth));
  const height = Math.min(imgHeight - y, Math.ceil((rh - 2 * my) * imgHeight));

  return { x, y, width, height };
}

/**
 * Carrega uma imagem HTML de forma segura com crossOrigin anônimo
 */
function loadHtmlImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = url;
  });
}

/**
 * Recorta uma peça da imagem original e aplica transparência no fundo branco/cinza claro da área externa
 */
function cropPieceCanvas(
  sourceImg: HTMLImageElement,
  coords: CropCoords,
  removeBg = true
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, coords.width);
  canvas.height = Math.max(1, coords.height);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return canvas;

  ctx.drawImage(
    sourceImg,
    coords.x,
    coords.y,
    coords.width,
    coords.height,
    0,
    0,
    coords.width,
    coords.height
  );

  if (!removeBg) {
    return canvas;
  }

  try {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const w = canvas.width;
    const h = canvas.height;

    // Flood fill dos cantos externos para remover fundo branco/cinza fora do molde
    // Considera fundo se for muito claro (r,g,b > 240) ou próximo de branco
    const isBackground = (idx: number) => {
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      return r > 235 && g > 235 && b > 235;
    };

    const visited = new Uint8Array(w * h);
    const queue: number[] = [];

    // Adiciona as 4 bordas na fila de inundação se forem fundo claro
    for (let x = 0; x < w; x++) {
      const topIdx = (0 * w + x) * 4;
      if (isBackground(topIdx) && !visited[0 * w + x]) {
        visited[0 * w + x] = 1;
        queue.push(x, 0);
      }
      const btmIdx = ((h - 1) * w + x) * 4;
      if (isBackground(btmIdx) && !visited[(h - 1) * w + x]) {
        visited[(h - 1) * w + x] = 1;
        queue.push(x, h - 1);
      }
    }

    for (let y = 0; y < h; y++) {
      const lftIdx = (y * w + 0) * 4;
      if (isBackground(lftIdx) && !visited[y * w + 0]) {
        visited[y * w + 0] = 1;
        queue.push(0, y);
      }
      const rgtIdx = (y * w + (w - 1)) * 4;
      if (isBackground(rgtIdx) && !visited[y * w + (w - 1)]) {
        visited[y * w + (w - 1)] = 1;
        queue.push(w - 1, y);
      }
    }

    // BFS Flood Fill
    let qHead = 0;
    while (qHead < queue.length) {
      const cx = queue[qHead++];
      const cy = queue[qHead++];
      const cPixelIdx = (cy * w + cx) * 4;

      // Torna pixel transparente
      data[cPixelIdx + 3] = 0;

      // 4 vizinhos
      const neighbors = [
        [cx + 1, cy],
        [cx - 1, cy],
        [cx, cy + 1],
        [cx, cy - 1]
      ];

      for (let i = 0; i < 4; i++) {
        const nx = neighbors[i][0];
        const ny = neighbors[i][1];
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
          const nPos = ny * w + nx;
          if (!visited[nPos]) {
            visited[nPos] = 1;
            const nPixelIdx = nPos * 4;
            if (isBackground(nPixelIdx)) {
              queue.push(nx, ny);
            }
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  } catch (e) {
    // Se ocorrer erro de leitura de pixels, mantém canvas desenhado
    console.warn('Flood fill fallback:', e);
  }

  return canvas;
}

/**
 * Desenha uma sombra sutil sob a peça
 */
function drawDropShadow(
  ctx: CanvasRenderingContext2D,
  pieceCanvas: HTMLCanvasElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number
) {
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 12;
  ctx.drawImage(pieceCanvas, dx, dy, dw, dh);
  ctx.restore();
}

/**
 * Gera a imagem da Camiseta Montada (800x800px)
 */
export async function generateAssembledImage(
  imageUrl: string,
  visual3d?: Visual3D
): Promise<string> {
  if (!imageUrl) return '';
  if (!visual3d || !visual3d.layout || visual3d.layout === 'foto') {
    return imageUrl;
  }

  // Verifica cache
  const cacheKey = `${imageUrl}_${visual3d.layout}`;
  if (assembledImagesCache.has(cacheKey)) {
    return assembledImagesCache.get(cacheKey)!;
  }

  if (pendingPromises.has(cacheKey)) {
    return pendingPromises.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const img = await loadHtmlImage(imageUrl);
      const iw = img.naturalWidth || img.width || 800;
      const ih = img.naturalHeight || img.height || 800;

      const TARGET_SIZE = 800;
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = TARGET_SIZE;
      finalCanvas.height = TARGET_SIZE;
      const ctx = finalCanvas.getContext('2d');
      if (!ctx) return imageUrl;

      // 1. Fundo profissional da GL Sports: gradiente sutil com estúdio fotográfico
      const bgGrad = ctx.createRadialGradient(
        TARGET_SIZE / 2,
        TARGET_SIZE / 2,
        50,
        TARGET_SIZE / 2,
        TARGET_SIZE / 2,
        TARGET_SIZE * 0.7
      );
      bgGrad.addColorStop(0, '#1D2026');
      bgGrad.addColorStop(0.6, '#14161A');
      bgGrad.addColorStop(1, '#0A0B0D');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE);

      // Glow sutil esportivo azul / verde nos fundos
      const glowGrad = ctx.createRadialGradient(
        TARGET_SIZE * 0.45,
        TARGET_SIZE * 0.45,
        20,
        TARGET_SIZE * 0.45,
        TARGET_SIZE * 0.45,
        340
      );
      glowGrad.addColorStop(0, 'rgba(2, 111, 246, 0.08)');
      glowGrad.addColorStop(0.5, 'rgba(88, 231, 7, 0.05)');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE);

      const pecas: Visual3DPecas = visual3d.pecas || {};

      if (visual3d.layout === 'molde' && pecas.frente && pecas.costas) {
        // --- LAYOUT MOLDE: FRENTE & COSTAS MONTADAS ---
        const frenteCoords = getCropCoords(pecas.frente, iw, ih);
        const costasCoords = getCropCoords(pecas.costas, iw, ih);

        const frenteCanvas = cropPieceCanvas(img, frenteCoords);
        const costasCanvas = cropPieceCanvas(img, costasCoords);

        // Dimensões no canvas 800x800:
        // Altura padrão da camisa: ~640px (80% da altura)
        const shirtHeight = 640;
        const frenteAspectRatio = frenteCoords.width / frenteCoords.height;
        const costasAspectRatio = costasCoords.width / costasCoords.height;

        const frenteW = shirtHeight * frenteAspectRatio;
        const costasW = shirtHeight * costasAspectRatio;

        // Posição: Costas ligeiramente atrás à direita, Frente em destaque à frente à esquerda
        // Se couber as duas lado a lado com sobreposição sutil:
        const overlap = 60;
        const totalW = frenteW + costasW - overlap;
        let startX = (TARGET_SIZE - totalW) / 2;
        if (startX < 30) startX = 30;

        const costasX = startX + frenteW - overlap;
        const costasY = 85;
        const frenteX = startX;
        const frenteY = 70;

        // Desenha Costas (ao fundo, levemente menor / escala 0.95 para profundidade)
        const scaleCostas = 0.96;
        const cW = costasW * scaleCostas;
        const cH = shirtHeight * scaleCostas;
        drawDropShadow(ctx, costasCanvas, costasX, costasY + (shirtHeight - cH), cW, cH);
        ctx.drawImage(costasCanvas, costasX, costasY + (shirtHeight - cH), cW, cH);

        // Desenha Frente (em primeiro plano)
        drawDropShadow(ctx, frenteCanvas, frenteX, frenteY, frenteW, shirtHeight);
        ctx.drawImage(frenteCanvas, frenteX, frenteY, frenteW, shirtHeight);

        // Selos sutis no rodapé da camisa: "FRENTE" & "COSTAS"
        ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#A7ADB5';
        ctx.fillText('FRENTE', frenteX + frenteW * 0.35, frenteY + shirtHeight + 35);
        ctx.fillText('COSTAS', costasX + cW * 0.35, costasY + (shirtHeight - cH) + cH + 35);

      } else if (pecas.frente) {
        // --- LAYOUT SÓ FRENTE ou KIT ---
        const frenteCoords = getCropCoords(pecas.frente, iw, ih);
        const frenteCanvas = cropPieceCanvas(img, frenteCoords);

        const shirtHeight = 680;
        const frenteAspectRatio = frenteCoords.width / frenteCoords.height;
        const frenteW = Math.min(TARGET_SIZE * 0.85, shirtHeight * frenteAspectRatio);
        const frenteX = (TARGET_SIZE - frenteW) / 2;
        const frenteY = (TARGET_SIZE - shirtHeight) / 2;

        drawDropShadow(ctx, frenteCanvas, frenteX, frenteY, frenteW, shirtHeight);
        ctx.drawImage(frenteCanvas, frenteX, frenteY, frenteW, shirtHeight);

      } else {
        // Fallback: desenha imagem centralizada
        ctx.drawImage(img, 0, 0, TARGET_SIZE, TARGET_SIZE);
      }

      const assembledDataUrl = finalCanvas.toDataURL('image/jpeg', 0.88);
      assembledImagesCache.set(cacheKey, assembledDataUrl);
      return assembledDataUrl;
    } catch (err) {
      console.warn('Falha na geração dinâmica da imagem montada, usando original:', err);
      return imageUrl;
    } finally {
      pendingPromises.delete(cacheKey);
    }
  })();

  pendingPromises.set(cacheKey, promise);
  return promise;
}
