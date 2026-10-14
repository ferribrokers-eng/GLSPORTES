import React, { useState, useEffect } from 'react';
import { 
  CatalogProvider, useCatalog 
} from './context/CatalogContext';
import { CartProvider, useCart } from './context/CartContext';
import { FavoritesProvider, useFavorites } from './context/FavoritesContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { MobileDrawer } from './components/MobileDrawer';
import { MobileNavBar } from './components/MobileNavBar';
import { HomeHero } from './components/HomeHero';
import { BenefitsBar } from './components/BenefitsBar';
import { GroupsGrid } from './components/GroupsGrid';
import { HomeCarousels } from './components/HomeCarousels';
import { HowItWorks } from './components/HowItWorks';
import { ProductGrid } from './components/ProductGrid';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { InfoModal } from './components/InfoModal';
import { EstampadorModal } from './components/EstampadorModal';
import { Footer } from './components/Footer';
import { TricolorStripe } from './components/TricolorStripe';
import { PreparationModeNotice } from './components/common/PreparationModeNotice';

// Área do Cliente
import { CustomerLogin } from './components/customer/CustomerLogin';
import { CustomerRegister } from './components/customer/CustomerRegister';
import { CustomerLayout } from './components/customer/CustomerLayout';
import { CustomerOrders } from './components/customer/CustomerOrders';
import { CustomerOrderDetail } from './components/customer/CustomerOrderDetail';
import { CustomerProfile } from './components/customer/CustomerProfile';

// CRM
import { CrmLogin } from './components/crm/CrmLogin';
import { CrmLayout, CrmTab } from './components/crm/CrmLayout';
import { CrmDashboard } from './components/crm/CrmDashboard';
import { CrmOrders } from './components/crm/CrmOrders';
import { CrmOrderDetail } from './components/crm/CrmOrderDetail';
import { CrmCustomers } from './components/crm/CrmCustomers';
import { CrmTasks } from './components/crm/CrmTasks';
import { CrmMessages } from './components/crm/CrmMessages';
import { CrmReports } from './components/crm/CrmReports';
import { CrmTeam } from './components/crm/CrmTeam';
import { CrmSettings } from './components/crm/CrmSettings';

import { Product, CategoryItem } from './types';
import { normalizeText, slugify } from './utils/helpers';
import { useContentProtection } from './hooks/useContentProtection';
import { 
  ArrowLeft, Heart, RotateCcw, AlertTriangle, Layers, Loader2 
} from 'lucide-react';

type ViewMode = 
  | 'home' 
  | 'group' 
  | 'category' 
  | 'favorites'
  | 'login'
  | 'register'
  | 'customer'
  | 'crm_login'
  | 'crm';

function MainAppContent() {
  // Ativa proteção global contra clique com botão direito, arrasto de imagem e extração
  useContentProtection();

  const { isConfigured, user, isTeam, isClient, isLoading: authLoading, signOut } = useAuth();
  const { products, groups, totalCount, isLoading, error, retryLoad } = useCatalog();
  const { favorites } = useFavorites();
  const { setIsCartOpen } = useCart();

  // Navigation State
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [activeGroup, setActiveGroup] = useState<string>('');
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Sub-estados Área do Cliente
  const [customerTab, setCustomerTab] = useState<'pedidos' | 'dados'>('pedidos');
  const [customerOrderId, setCustomerOrderId] = useState<string | null>(null);

  // Sub-estados CRM
  const [crmTab, setCrmTab] = useState<CrmTab>('painel');
  const [crmOrderId, setCrmOrderId] = useState<string | null>(null);

  // Modais Institucionais da Loja
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEstampadorModalOpen, setIsEstampadorModalOpen] = useState(false);
  const [infoModalType, setInfoModalType] = useState<'sobre' | 'como-comprar' | 'contato' | 'politica' | null>(null);

  // Sync hash / history URL e roteamento unificado
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();

      // 1. Rotas do CRM (/crm/* e /crm/entrar)
      if (path === '/crm/entrar') {
        setViewMode('crm_login');
        return;
      }
      if (path === '/crm' || path.startsWith('/crm/')) {
        if (path.startsWith('/crm/pedido/')) {
          const pId = path.replace('/crm/pedido/', '');
          setCrmOrderId(pId);
          setCrmTab('pedidos');
        } else if (path.startsWith('/crm/pedidos')) {
          setCrmOrderId(null);
          setCrmTab('pedidos');
        } else if (path.startsWith('/crm/clientes')) {
          setCrmOrderId(null);
          setCrmTab('clientes');
        } else if (path.startsWith('/crm/tarefas')) {
          setCrmOrderId(null);
          setCrmTab('tarefas');
        } else if (path.startsWith('/crm/mensagens')) {
          setCrmOrderId(null);
          setCrmTab('mensagens');
        } else if (path.startsWith('/crm/relatorios')) {
          setCrmOrderId(null);
          setCrmTab('relatorios');
        } else if (path.startsWith('/crm/equipe')) {
          setCrmOrderId(null);
          setCrmTab('equipe');
        } else if (path.startsWith('/crm/configuracoes')) {
          setCrmOrderId(null);
          setCrmTab('configuracoes');
        } else {
          setCrmOrderId(null);
          setCrmTab('painel');
        }
        setViewMode('crm');
        return;
      }

      // 2. Rotas da Área do Cliente
      if (path === '/entrar') {
        setViewMode('login');
        return;
      }
      if (path === '/criar-conta') {
        setViewMode('register');
        return;
      }
      if (path === '/minha-conta' || path.startsWith('/minha-conta/')) {
        if (path.startsWith('/minha-conta/pedido/')) {
          const pId = path.replace('/minha-conta/pedido/', '');
          setCustomerOrderId(pId);
          setCustomerTab('pedidos');
        } else if (path.startsWith('/minha-conta/dados')) {
          setCustomerOrderId(null);
          setCustomerTab('dados');
        } else {
          setCustomerOrderId(null);
          setCustomerTab('pedidos');
        }
        setViewMode('customer');
        return;
      }

      // 3. Rotas da Loja
      if (path.startsWith('/grupo/')) {
        const groupSlug = decodeURIComponent(path.replace('/grupo/', ''));
        const matched = groups.find((g) => slugify(g.nome) === slugify(groupSlug) || normalizeText(g.nome) === normalizeText(groupSlug));
        if (matched) {
          setActiveGroup(matched.nome);
          setViewMode('group');
          return;
        }
      } else if (path.startsWith('/categoria/')) {
        const catSlug = decodeURIComponent(path.replace('/categoria/', ''));
        setActiveCategorySlug(catSlug);
        setViewMode('category');
        return;
      } else if (path.startsWith('/favoritos')) {
        setViewMode('favorites');
        return;
      } else if (path === '/planos' || path === '/estampadores' || path === '/planos-estampadores' || path === '/para-estampadores') {
        setIsEstampadorModalOpen(true);
        setViewMode('home');
        return;
      }

      setViewMode('home');
    };

    handlePopState();

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [groups]);

  // Funções de Navegação da Loja
  const navigateToHome = () => {
    setViewMode('home');
    window.history.pushState({}, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToGroup = (groupName: string) => {
    if (groupName.toLowerCase() === 'para estampadores') {
      setIsEstampadorModalOpen(true);
      window.history.pushState({}, '', '/planos');
      return;
    }
    if (groupName.toLowerCase() === 'camisetas de futebol') {
      navigateToCategory('futebol');
      return;
    }
    setActiveGroup(groupName);
    setViewMode('group');
    window.history.pushState({}, '', `/grupo/${slugify(groupName)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCategory = (catSlug: string) => {
    setActiveCategorySlug(catSlug);
    setViewMode('category');
    window.history.pushState({}, '', `/categoria/${catSlug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToFavorites = () => {
    setViewMode('favorites');
    window.history.pushState({}, '', '/favoritos');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCustomerArea = () => {
    if (user) {
      setViewMode('customer');
      setCustomerOrderId(null);
      setCustomerTab('pedidos');
      window.history.pushState({}, '', '/minha-conta');
    } else {
      setViewMode('login');
      window.history.pushState({}, '', '/entrar');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // -------------------------------------------------------------
  // RENDERIZAÇÃO CONDICIONAL DE ÁREAS (CRM, ÁREA DO CLIENTE, LOJA)
  // -------------------------------------------------------------

  // 1. TELA: CRM LOGIN (/crm/entrar)
  if (viewMode === 'crm_login') {
    if (!isConfigured) {
      return (
        <div className="min-h-screen bg-[#0A0B0D]">
          <PreparationModeNotice isCrm={true} areaTitle="CRM GL Sports" />
        </div>
      );
    }
    if (user && isTeam) {
      setViewMode('crm');
      window.history.pushState({}, '', '/crm');
    }
    return (
      <CrmLogin
        onSuccess={() => {
          setViewMode('crm');
          window.history.pushState({}, '', '/crm');
        }}
      />
    );
  }

  // 2. TELA: CRM COMPLETO (/crm/*)
  if (viewMode === 'crm') {
    if (!isConfigured) {
      return (
        <div className="min-h-screen bg-[#0A0B0D]">
          <PreparationModeNotice isCrm={true} areaTitle="CRM GL Sports" />
        </div>
      );
    }

    if (authLoading) {
      return (
        <div className="min-h-screen bg-[#0A0B0D] flex items-center justify-center text-[#58E707]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      );
    }

    // Proteção de rota do CRM: usuário PRECISA ter registro ativo em perfis
    if (!user || !isTeam) {
      if (user && !isTeam) {
        // Se cliente tentar entrar, faça logout e mostre "Acesso restrito à equipe GL Sports"
        signOut();
        return (
          <div className="min-h-screen bg-[#0A0B0D] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#14161A] border border-rose-500/40 p-8 rounded-3xl text-center space-y-4 shadow-2xl">
              <h2 className="text-xl font-bold font-sport uppercase text-rose-400">
                Acesso restrito à equipe GL Sports
              </h2>
              <p className="text-xs text-[#A7ADB5]">
                Esta área destina-se exclusivamente aos colaboradores da confecção e vendas.
              </p>
              <a
                href="/"
                className="inline-block py-2.5 px-5 bg-[#0A0B0D] border border-[#1D2026] text-white text-xs font-bold uppercase rounded-xl hover:bg-[#1D2026] transition-colors"
              >
                Voltar para a Loja
              </a>
            </div>
          </div>
        );
      }

      return (
        <CrmLogin
          onSuccess={() => {
            setViewMode('crm');
            window.history.pushState({}, '', '/crm');
          }}
        />
      );
    }

    return (
      <CrmLayout
        activeTab={crmTab}
        onNavigateTab={(tab) => {
          setCrmTab(tab);
          setCrmOrderId(null);
          window.history.pushState({}, '', `/crm/${tab === 'painel' ? '' : tab}`);
        }}
      >
        {crmOrderId ? (
          <CrmOrderDetail
            orderId={crmOrderId}
            onBack={() => {
              setCrmOrderId(null);
              window.history.pushState({}, '', '/crm/pedidos');
            }}
          />
        ) : crmTab === 'painel' ? (
          <CrmDashboard
            onNavigateOrder={(id) => {
              setCrmOrderId(id);
              window.history.pushState({}, '', `/crm/pedido/${id}`);
            }}
            onNavigateTab={(tab) => {
              setCrmTab(tab);
              window.history.pushState({}, '', `/crm/${tab}`);
            }}
          />
        ) : crmTab === 'pedidos' ? (
          <CrmOrders
            onSelectOrder={(id) => {
              setCrmOrderId(id);
              window.history.pushState({}, '', `/crm/pedido/${id}`);
            }}
          />
        ) : crmTab === 'clientes' ? (
          <CrmCustomers
            onNavigateOrder={(id) => {
              setCrmOrderId(id);
              window.history.pushState({}, '', `/crm/pedido/${id}`);
            }}
          />
        ) : crmTab === 'tarefas' ? (
          <CrmTasks
            onNavigateOrder={(id) => {
              setCrmOrderId(id);
              window.history.pushState({}, '', `/crm/pedido/${id}`);
            }}
          />
        ) : crmTab === 'mensagens' ? (
          <CrmMessages />
        ) : crmTab === 'relatorios' ? (
          <CrmReports />
        ) : crmTab === 'equipe' ? (
          <CrmTeam />
        ) : (
          <CrmSettings />
        )}
      </CrmLayout>
    );
  }

  // 3. TELA: CLIENTE LOGIN (/entrar)
  if (viewMode === 'login') {
    if (!isConfigured) {
      return (
        <div className="min-h-screen bg-[#0A0B0D]">
          <PreparationModeNotice areaTitle="Área do Cliente" />
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-[#0A0B0D]">
        <CustomerLogin
          onSuccess={() => {
            setViewMode('customer');
            window.history.pushState({}, '', '/minha-conta');
          }}
          onNavigateRegister={() => {
            setViewMode('register');
            window.history.pushState({}, '', '/criar-conta');
          }}
        />
      </div>
    );
  }

  // 4. TELA: CLIENTE CRIAR CONTA (/criar-conta)
  if (viewMode === 'register') {
    if (!isConfigured) {
      return (
        <div className="min-h-screen bg-[#0A0B0D]">
          <PreparationModeNotice areaTitle="Criar Conta" />
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-[#0A0B0D]">
        <CustomerRegister
          onSuccess={() => {
            setViewMode('customer');
            window.history.pushState({}, '', '/minha-conta');
          }}
          onNavigateLogin={() => {
            setViewMode('login');
            window.history.pushState({}, '', '/entrar');
          }}
        />
      </div>
    );
  }

  // 5. TELA: ÁREA DO CLIENTE (/minha-conta/*)
  if (viewMode === 'customer') {
    if (!isConfigured) {
      return (
        <div className="min-h-screen bg-[#0A0B0D]">
          <PreparationModeNotice areaTitle="Área do Cliente" />
        </div>
      );
    }

    if (authLoading) {
      return (
        <div className="min-h-screen bg-[#0A0B0D] flex items-center justify-center text-[#58E707]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      );
    }

    if (!user) {
      return (
        <div className="min-h-screen bg-[#0A0B0D]">
          <CustomerLogin
            onSuccess={() => {
              setViewMode('customer');
              window.history.pushState({}, '', '/minha-conta');
            }}
            onNavigateRegister={() => {
              setViewMode('register');
              window.history.pushState({}, '', '/criar-conta');
            }}
          />
        </div>
      );
    }

    return (
      <CustomerLayout
        activeTab={customerTab}
        onNavigateTab={(tab) => {
          setCustomerTab(tab);
          setCustomerOrderId(null);
          window.history.pushState({}, '', tab === 'pedidos' ? '/minha-conta' : '/minha-conta/dados');
        }}
      >
        {customerOrderId ? (
          <CustomerOrderDetail
            orderId={customerOrderId}
            onBack={() => {
              setCustomerOrderId(null);
              window.history.pushState({}, '', '/minha-conta');
            }}
          />
        ) : customerTab === 'pedidos' ? (
          <CustomerOrders
            onSelectOrder={(id) => {
              setCustomerOrderId(id);
              window.history.pushState({}, '', `/minha-conta/pedido/${id}`);
            }}
          />
        ) : (
          <CustomerProfile />
        )}
      </CustomerLayout>
    );
  }

  // -------------------------------------------------------------
  // LOJA PÚBLICA (HOME, GRUPOS, CATEGORIAS, FAVORITOS)
  // -------------------------------------------------------------

  // Filtra produtos para grupo ativo
  const groupData = groups.find((g) => g.nome.toLowerCase() === activeGroup.toLowerCase());
  const groupProducts = products.filter((p) => p.grupo.toLowerCase() === activeGroup.toLowerCase());

  // Filtra produtos para categoria ativa
  let activeCategoryName = '';
  let activeCategoryTotal = 0;
  for (const g of groups) {
    const found = g.categorias.find((c: CategoryItem) => c.slug === activeCategorySlug || slugify(c.nome) === activeCategorySlug);
    if (found) {
      activeCategoryName = found.nome;
      activeCategoryTotal = found.total;
      break;
    }
  }

  const categoryProducts = products.filter((p) => {
    if (!activeCategoryName) return false;
    return p.categoria.toLowerCase() === activeCategoryName.toLowerCase();
  });

  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-white flex flex-col font-barlow selection:bg-[#58E707] selection:text-[#0A0B0D]">
      {/* Header Fixo Oficial */}
      <Header
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onNavigateHome={navigateToHome}
        onNavigateGroup={navigateToGroup}
        onNavigateCategory={navigateToCategory}
        onNavigateFavorites={navigateToFavorites}
        onNavigateCustomerArea={navigateToCustomerArea}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onOpenInfoModal={(page) => setInfoModalType(page)}
        onOpenEstampadorModal={() => setIsEstampadorModalOpen(true)}
        onNavigateHowItWorks={() => {
          setViewMode('home');
          setTimeout(() => {
            const el = document.getElementById('como-funciona');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="max-w-7xl mx-auto px-4 py-16 space-y-12 animate-pulse">
            <div className="h-96 bg-[#14161A] rounded-3xl border border-[#1D2026]" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square bg-[#14161A] rounded-2xl border border-[#1D2026]" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="max-w-xl mx-auto my-24 p-8 bg-[#14161A] rounded-3xl border border-[#FC6602]/30 text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-[#FC6602] mx-auto" />
            <h2 className="font-sport font-black text-2xl uppercase tracking-wide text-white">
              Não foi possível carregar o catálogo
            </h2>
            <p className="text-xs sm:text-sm text-[#A7ADB5] max-w-md mx-auto">
              Verifique sua conexão com a internet e clique no botão abaixo para tentar novamente.
            </p>
            <button
              onClick={retryLoad}
              className="py-3 px-6 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-extrabold text-xs sm:text-sm rounded-xl inline-flex items-center gap-2 shadow-[0_0_20px_rgba(88,231,7,0.3)] transition-transform active:scale-95 cursor-pointer uppercase"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Tentar de novo</span>
            </button>
          </div>
        ) : (
          <>
            {/* View: Home */}
            {viewMode === 'home' && (
              <div className="space-y-12 pb-16">
                <HomeHero 
                  onExplore={(catSlug) => {
                    if (catSlug) {
                      navigateToCategory(catSlug);
                    } else {
                      const el = document.getElementById('categorias-populares');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                />

                <div id="categorias-populares">
                  <GroupsGrid 
                    groups={groups}
                    onSelectGroup={navigateToGroup}
                    onOpenEstampadorModal={() => {
                      setIsEstampadorModalOpen(true);
                      window.history.pushState({}, '', '/planos');
                    }}
                  />
                </div>

                <HomeCarousels
                  products={products}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                  onNavigateCategory={navigateToCategory}
                />

                <div id="como-funciona">
                  <HowItWorks />
                </div>
              </div>
            )}

            {/* View: Group Filter */}
            {viewMode === 'group' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1D2026] pb-6">
                  <div>
                    <button
                      onClick={navigateToHome}
                      className="inline-flex items-center gap-2 text-xs font-bold text-[#A7ADB5] hover:text-[#58E707] mb-2 uppercase transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Voltar para Início</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-[#58E707]">
                        GRUPO OFICIAL
                      </span>
                    </div>
                    <h1 className="font-sport font-black text-3xl sm:text-4xl italic text-white uppercase mt-1">
                      {activeGroup}
                    </h1>
                  </div>

                  {groupData && (
                    <div className="flex flex-wrap gap-2 max-w-xl">
                      {groupData.categorias.map((c: CategoryItem) => (
                        <button
                          key={c.slug}
                          onClick={() => navigateToCategory(c.slug)}
                          className="text-xs py-1.5 px-3 rounded-lg bg-[#14161A] hover:bg-[#1D2026] border border-[#1D2026] hover:border-[#58E707] text-[#A7ADB5] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>{c.nome}</span>
                          <span className="text-[10px] text-[#58E707] font-mono">({c.total})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <ProductGrid
                  products={groupProducts}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                  title={`Estampas de ${activeGroup}`}
                  subtitle={`${groupProducts.length} modelos de uniformes esportivos`}
                />
              </div>
            )}

            {/* View: Category Filter */}
            {viewMode === 'category' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <div className="border-b border-[#1D2026] pb-6">
                  <button
                    onClick={navigateToHome}
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#A7ADB5] hover:text-[#58E707] mb-2 uppercase transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Voltar para Início</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-[#58E707]">
                      CATEGORIA: {activeCategoryName}
                    </span>
                  </div>
                  <h1 className="font-sport font-black text-3xl sm:text-4xl italic text-white uppercase mt-1">
                    {activeCategoryName || 'Estampas'}
                  </h1>
                  <p className="text-xs text-[#A7ADB5] mt-1">
                    Exibindo todas as {categoryProducts.length} artes criadas para esta modalidade.
                  </p>
                </div>

                <ProductGrid
                  products={categoryProducts}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                  title={activeCategoryName}
                  subtitle={`${categoryProducts.length} estampas no catálogo`}
                />
              </div>
            )}

            {/* View: Favorites */}
            {viewMode === 'favorites' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <div className="border-b border-[#1D2026] pb-6 flex items-center justify-between">
                  <div>
                    <button
                      onClick={navigateToHome}
                      className="inline-flex items-center gap-2 text-xs font-bold text-[#A7ADB5] hover:text-[#58E707] mb-2 uppercase transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Voltar para Início</span>
                    </button>
                    <h1 className="font-sport font-black text-3xl sm:text-4xl italic text-white uppercase flex items-center gap-3">
                      <Heart className="w-8 h-8 text-[#026FF6] fill-[#026FF6]" />
                      <span>Minhas Estampas Favoritas</span>
                    </h1>
                  </div>
                  <span className="text-sm font-mono text-[#58E707] font-bold">
                    {favoriteProducts.length} salva(s)
                  </span>
                </div>

                <ProductGrid
                  products={favoriteProducts}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                  title="Suas Artes Salvas"
                  subtitle={`${favoriteProducts.length} estampas marcadas`}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer Oficial */}
      <Footer
        onNavigateHome={navigateToHome}
        onNavigateGroup={navigateToGroup}
        onNavigateCategory={navigateToCategory}
        onOpenInfoModal={(page) => setInfoModalType(page)}
      />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          allProducts={products}
          onClose={() => setSelectedProduct(null)}
          onSelectProduct={(p) => setSelectedProduct(p)}
          onNavigateCategory={navigateToCategory}
          onNavigateGroup={navigateToGroup}
        />
      )}

      {/* Shopping Cart Drawer */}
      <CartDrawer
        onSelectProduct={(p) => {
          setSelectedProduct(p);
        }}
        onExploreCatalog={navigateToHome}
        onNavigateOrder={(id) => {
          setCustomerOrderId(id);
          setViewMode('customer');
          window.history.pushState({}, '', `/minha-conta/pedido/${id}`);
        }}
        onNavigateLogin={() => {
          setViewMode('login');
          window.history.pushState({}, '', '/entrar');
        }}
        onNavigateRegister={() => {
          setViewMode('register');
          window.history.pushState({}, '', '/criar-conta');
        }}
      />

      {/* Mobile Category Drawer */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        groups={groups}
        onSelectGroup={(g) => {
          setIsMobileMenuOpen(false);
          navigateToGroup(g);
        }}
        onSelectCategory={(c) => {
          setIsMobileMenuOpen(false);
          navigateToCategory(c);
        }}
        onNavigateCustomerArea={() => {
          setIsMobileMenuOpen(false);
          navigateToCustomerArea();
        }}
        onOpenEstampadorModal={() => {
          setIsMobileMenuOpen(false);
          setIsEstampadorModalOpen(true);
        }}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileNavBar
        onNavigateHome={navigateToHome}
        onOpenCategories={() => setIsMobileMenuOpen(true)}
        onNavigateFavorites={navigateToFavorites}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Área Restrita para Estampadores & Confeccionistas */}
      <EstampadorModal
        isOpen={isEstampadorModalOpen}
        onClose={() => {
          setIsEstampadorModalOpen(false);
          if (window.location.pathname === '/planos' || window.location.pathname === '/estampadores') {
            window.history.pushState({}, '', '/');
          }
        }}
      />

      {/* Institutional Info Modals */}
      {infoModalType && (
        <InfoModal
          type={infoModalType}
          onClose={() => setInfoModalType(null)}
        />
      )}
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <CatalogProvider>
        <FavoritesProvider>
          <CartProvider>
            <MainAppContent />
          </CartProvider>
        </FavoritesProvider>
      </CatalogProvider>
    </AuthProvider>
  );
}

export default App;
