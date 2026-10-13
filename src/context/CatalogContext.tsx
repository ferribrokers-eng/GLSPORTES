import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { CatalogData, CategoryGroup, Product } from '../types';
import { CONFIG } from '../config';
import { processProductVariants } from '../utils/helpers';

interface CatalogContextType {
  products: Product[];
  groups: CategoryGroup[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  retryLoad: () => void;
  getProductById: (id: number) => Product | undefined;
  getProductBySlug: (slug: string) => Product | undefined;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

const GROUP_ICONS: Record<string, string> = {
  'Esportes': '⚽',
  'Escolar & Formatura': '🎓',
  'Festas & Datas': '🎉',
  'Cultura Pop': '🦸',
  'Estilo & Lifestyle': '🔥',
  'Fé': '✝️',
  'Infantil': '🧸',
  'Para Estampadores': '🔒',
};

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadCatalog = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    let data: CatalogData | null = null;

    // 1. Tenta API do servidor
    try {
      const res = await fetch('/api/catalog');
      if (res.ok) {
        data = await res.json();
      }
    } catch {
      // continua para o fallback direto
    }

    // 2. Se falhar, tenta link primário jsdelivr
    if (!data || !data.produtos) {
      try {
        const resPrimary = await fetch(CONFIG.primaryCatalogUrl);
        if (resPrimary.ok) {
          data = await resPrimary.json();
        }
      } catch {
        // continua para o link secundário
      }
    }

    // 3. Se falhar, tenta link secundário raw.githubusercontent
    if (!data || !data.produtos) {
      try {
        const resFallback = await fetch(CONFIG.fallbackCatalogUrl);
        if (resFallback.ok) {
          data = await resFallback.json();
        }
      } catch (err) {
        console.error('Falha nos links do catálogo:', err);
      }
    }

    if (data && data.produtos && Array.isArray(data.produtos)) {
      const processed = processProductVariants(data.produtos);
      setProducts(processed);
      setTotalCount(data.total_produtos || processed.length);

      if (data.grupos && Array.isArray(data.grupos)) {
        const mappedGroups = data.grupos.map((g) => ({
          ...g,
          icon: GROUP_ICONS[g.nome] || '👕',
          isRestricted: g.nome === 'Para Estampadores',
        }));
        setGroups(mappedGroups);
      }
      setIsLoading(false);
    } else {
      setError('Não foi possível carregar o catálogo');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const getProductById = (id: number) => {
    return products.find((p) => p.id === id);
  };

  const getProductBySlug = (slug: string) => {
    return products.find((p) => p.slug === slug || p.id.toString() === slug);
  };

  return (
    <CatalogContext.Provider
      value={{
        products,
        groups,
        totalCount,
        isLoading,
        error,
        retryLoad: loadCatalog,
        getProductById,
        getProductBySlug,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
};

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
}
