import { Product } from '../types';
import { CONFIG } from '../config';

/**
 * Remove acentos e converte para minúsculas
 * Ex: "terceirão" -> "terceirao", "Açúcar" -> "acucar"
 */
export function normalizeText(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export const removeAccents = normalizeText;

/**
 * Formata valor em Real brasileiro (R$ 2,88)
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(price);
}

/**
 * Cria slug amigável a partir de texto
 */
export function slugify(text: string): string {
  return normalizeText(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/**
 * Processa a lista bruta de produtos do JSON:
 * Diferencia produtos de mesmo nome adicionando "Modelo 1", "Modelo 2"... ordenado por id
 */
export function processProductVariants(products: Product[]): Product[] {
  // Agrupa produtos por nome base normalizado
  const nameGroups = new Map<string, Product[]>();

  for (const product of products) {
    const key = normalizeText(product.nome);
    if (!nameGroups.has(key)) {
      nameGroups.set(key, []);
    }
    nameGroups.get(key)!.push(product);
  }

  // Ordena por id dentro de cada grupo e atribui Modelo X se houver duplicatas
  const result: Product[] = [];

  for (const [, group] of nameGroups) {
    group.sort((a, b) => a.id - b.id);
    const hasMultiple = group.length > 1;

    group.forEach((p, idx) => {
      const modelNum = idx + 1;
      result.push({
        ...p,
        modelVariantNumber: hasMultiple ? modelNum : undefined,
        displayName: hasMultiple ? `${p.nome} - Modelo ${modelNum}` : p.nome,
      });
    });
  }

  // Mantém a ordem original do catálogo por id
  return result.sort((a, b) => a.id - b.id);
}

/**
 * Monta URL direta do WhatsApp com mensagem pré-formatada para finalização
 */
export function buildWhatsAppCartUrl(items: { product: Product; quantity: number }[], total: number): string {
  const number = CONFIG.whatsappNumber.replace(/\D/g, '');
  
  let msg = `👋 Olá, GL Sports! Gostaria de adquirir as seguintes artes digitais:\n\n`;
  
  items.forEach((item, index) => {
    const nome = item.product.displayName || item.product.nome;
    const preco = formatPrice(item.product.preco * item.quantity);
    msg += `📌 *${index + 1}. ${nome}*\n   - ID: #${item.product.id}\n   - Categoria: ${item.product.categoria}\n   - Qtd: ${item.quantity} un. (${preco})\n\n`;
  });

  msg += `💰 *TOTAL: ${formatPrice(total)}*\n`;
  msg += `📁 Formato: Arquivos digitais para sublimação em alta resolução.\n`;
  msg += `Por favor, me envie os dados para pagamento via Pix e o link para download! 🚀`;

  return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
}

/**
 * Monta URL direta do WhatsApp para um produto único
 */
export function buildWhatsAppSingleProductUrl(product: Product): string {
  const number = CONFIG.whatsappNumber.replace(/\D/g, '');
  const nome = product.displayName || product.nome;
  const preco = formatPrice(product.preco);
  
  const msg = `👋 Olá, GL Sports! Quero comprar a arte:\n\n` +
    `⭐ *${nome}*\n` +
    `🔖 ID: #${product.id}\n` +
    `📁 Categoria: ${product.categoria}\n` +
    `💰 Valor: ${preco}\n\n` +
    `Como posso fazer o pagamento via Pix para receber o arquivo digital? Obrigado!`;

  return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
}
