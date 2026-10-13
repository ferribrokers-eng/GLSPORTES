import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  SUPABASE_URL as CONFIG_SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY as CONFIG_SUPABASE_KEY 
} from '../config';

/**
 * Valida se uma string é uma URL HTTP/HTTPS válida.
 */
function isValidHttpUrl(str?: string | null): boolean {
  if (!str || typeof str !== 'string') return false;
  const trimmed = str.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Resolve a URL e a Chave Pública do Supabase com prioridade e proteção estrita:
 * 1. Variáveis de ambiente VITE_SUPABASE_URL têm prioridade SOMENTE se forem uma URL HTTP/HTTPS válida.
 * 2. Se a variável de ambiente contiver um valor que não seja URL (ex.: uma chave inserida por engano no campo de URL),
 *    o sistema recorre com segurança à URL pública oficial de config.ts.
 * 3. Chaves secretas (sb_secret_...) são estritamente rejeitadas e ignoradas por segurança.
 */
function getSupabaseConfig(): { url: string; key: string; isConfigured: boolean } {
  const envUrl = (
    typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env.VITE_SUPABASE_URL as string | undefined)
      : undefined
  )?.trim();

  const envPublishableKey = (
    typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)
      : undefined
  )?.trim();

  const envAnonKey = (
    typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)
      : undefined
  )?.trim();

  // 1. Resolver URL válida
  let url = '';
  if (isValidHttpUrl(envUrl)) {
    url = envUrl!;
  } else if (isValidHttpUrl(CONFIG_SUPABASE_URL)) {
    url = CONFIG_SUPABASE_URL.trim();
  }

  // 2. Resolver chave pública (NUNCA aceitar sb_secret_...)
  let key = '';
  const candidateKeys = [
    envPublishableKey,
    // Se o usuário colocou a chave publishable na variável de URL por engano:
    envUrl && envUrl.startsWith('sb_publishable_') ? envUrl : undefined,
    envAnonKey,
    CONFIG_SUPABASE_KEY,
  ];

  for (const candidate of candidateKeys) {
    if (!candidate || typeof candidate !== 'string') continue;
    const trimmedCandidate = candidate.trim();

    // Rejeita categoricamente chave secreta
    if (trimmedCandidate.startsWith('sb_secret_')) {
      if (typeof console !== 'undefined') {
        console.warn('GL Sports: Chave secreta (sb_secret_...) detectada em variável de ambiente e ignorada por segurança. O site usa exclusivamente chaves públicas.');
      }
      continue;
    }

    if (trimmedCandidate.startsWith('sb_publishable_') || trimmedCandidate.length > 20) {
      key = trimmedCandidate;
      break;
    }
  }

  const isConfigured = Boolean(
    isValidHttpUrl(url) && 
    key && 
    !key.startsWith('sb_secret_') &&
    url !== 'https://placeholder.supabase.co'
  );

  return { url, key, isConfigured };
}

const config = getSupabaseConfig();

/**
 * Indica se as credenciais do Supabase estão ativas e válidas para operação real.
 */
export const isSupabaseConfigured: boolean = config.isConfigured;

// Garantia de inicialização segura: caso as chaves estejam ausentes, usa placeholder válido
// para que o createClient não lance exceção fatal em tempo de importação do bundle
const safeUrl = config.url && isValidHttpUrl(config.url) ? config.url : 'https://placeholder.supabase.co';
const safeKey = config.key && !config.key.startsWith('sb_secret_') ? config.key : 'placeholder-publishable-key-for-prep-mode';

export const supabase: SupabaseClient = createClient(safeUrl, safeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
