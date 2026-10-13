export type ProductType = 'estampa' | 'recurso';

export type Visual3DLayout = 'molde' | 'so_frente' | 'kit' | 'foto' | 'recurso';

export interface Visual3DPecas {
  frente?: number[];
  costas?: number[];
  manga_esq?: number[];
  manga_dir?: number[];
  frente_2?: number[];
  [key: string]: number[] | undefined;
}

export interface Visual3D {
  layout: Visual3DLayout;
  imagem: string;
  pecas: Visual3DPecas;
}

export interface Product {
  id: number;
  nome: string;
  slug: string;
  categoria: string;
  grupo: string;
  preco: number;
  tags: string[];
  tipo: ProductType;
  imagens: string[];
  visual3d?: Visual3D;
  imagem_montada?: string | null;
  imagem_costas?: string | null;
  imagem_molde?: string | null;
  capa?: string;
  capa_hover?: string | null;
  // Calculated / assigned display properties
  modelVariantNumber?: number; // e.g., Modelo 1, Modelo 2
  displayName?: string;        // e.g. "Camisa Bayern de Munique (Modelo 2)"
}

export interface CategoryItem {
  nome: string;
  slug: string;
  total: number;
}

export interface CategoryGroup {
  nome: string;
  slug?: string;
  icon?: string;
  isRestricted?: boolean;
  categorias: CategoryItem[];
}

export interface CatalogData {
  loja: string;
  total_produtos: number;
  grupos: CategoryGroup[];
  produtos: Product[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  tipo_peca?: string;
  com_nome_numero?: boolean;
  addedAt: number;
}
