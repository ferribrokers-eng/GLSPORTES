/**
 * Gerenciador de armazenamento persistente para imagens do banner principal da GL Sports.
 * Utiliza IndexedDB como motor primário (sem limite de 5MB) com espelho seguro em localStorage e cache em memória.
 */

export interface CustomHeroImages {
  [slideId: string]: string; // slideId -> dataUrl (base64) ou url externa
}

const DB_NAME = 'glsports_banners_db';
const DB_VERSION = 1;
const STORE_NAME = 'banner_images';
const STORAGE_KEY_LOCAL = 'glsports_hero_custom_images';

// Cache em memória para acesso síncrono ultra-rápido na renderização inicial
let memoryCache: CustomHeroImages = (() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOCAL);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Erro ao ler cache do localStorage:', err);
  }
  return {};
})();

// Inicializa IndexedDB de forma resiliente
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB não suportado neste navegador'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Erro ao abrir IndexedDB'));
    };
  });
}

/**
 * Lê todas as imagens salvas do IndexedDB e sincroniza com o cache de memória
 */
export async function loadHeroImagesFromDb(): Promise<CustomHeroImages> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.openCursor();
      const loaded: CustomHeroImages = { ...memoryCache };

      request.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest).result as IDBCursorWithValue;
        if (cursor) {
          loaded[cursor.key as string] = cursor.value as string;
          cursor.continue();
        } else {
          memoryCache = loaded;
          resolve(loaded);
        }
      };

      request.onerror = () => {
        resolve(memoryCache);
      };
    });
  } catch (err) {
    console.warn('Fallback para cache de memória ao ler do IndexedDB:', err);
    return memoryCache;
  }
}

/**
 * Retorna as imagens armazenadas de forma síncrona (usando o cache em memória / localStorage)
 */
export function getStoredHeroImages(): CustomHeroImages {
  return { ...memoryCache };
}

/**
 * Salva uma imagem para um slide específico no IndexedDB e no cache
 */
export async function saveHeroImage(slideId: string, imageData: string): Promise<CustomHeroImages> {
  // Atualiza cache em memória
  memoryCache[slideId] = imageData;

  // Migra alias se for ciclismo/interclasse
  if (slideId === 'ciclismo') {
    delete memoryCache['interclasse'];
  }

  // Salva no IndexedDB (sem limite de 5MB do localStorage)
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(imageData, slideId);
      if (slideId === 'ciclismo') {
        store.delete('interclasse');
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Aviso: Não foi possível gravar no IndexedDB, mantendo em memória e localStorage:', err);
  }

  // Tenta manter cópia compacta no localStorage se couber
  try {
    localStorage.setItem(STORAGE_KEY_LOCAL, JSON.stringify(memoryCache));
  } catch (err) {
    // Se o localStorage estourar quota (5MB), não quebra o salvamento porque o IndexedDB já gravou!
    console.warn('LocalStorage cheio, imagem persistida seguramente via IndexedDB.');
  }

  // Notifica todos os componentes da aplicação
  notifyUpdated();
  return { ...memoryCache };
}

/**
 * Remove a imagem customizada de um slide e volta ao padrão
 */
export async function removeHeroImage(slideId: string): Promise<CustomHeroImages> {
  delete memoryCache[slideId];
  if (slideId === 'ciclismo') {
    delete memoryCache['interclasse'];
  }

  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(slideId);
      if (slideId === 'ciclismo') {
        store.delete('interclasse');
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Aviso ao remover do IndexedDB:', err);
  }

  try {
    localStorage.setItem(STORAGE_KEY_LOCAL, JSON.stringify(memoryCache));
  } catch (err) {
    console.warn('Erro ao atualizar localStorage após remoção:', err);
  }

  notifyUpdated();
  return { ...memoryCache };
}

/**
 * Dispara evento global de atualização dos banners
 */
function notifyUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('glsports_hero_images_updated', {
      detail: { ...memoryCache }
    }));
  }
}

// Inicia sincronização com IndexedDB imediatamente ao carregar
if (typeof window !== 'undefined') {
  loadHeroImagesFromDb().then(() => {
    notifyUpdated();
  }).catch(() => {});
}
