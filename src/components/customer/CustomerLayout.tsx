import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { CONFIG } from '../../config';
import { 
  Package, User, LogOut, ArrowLeft, ExternalLink, 
  ShoppingBag, ShieldCheck 
} from 'lucide-react';

interface Props {
  activeTab: 'pedidos' | 'dados';
  onNavigateTab: (tab: 'pedidos' | 'dados') => void;
  children: React.ReactNode;
}

export const CustomerLayout: React.FC<Props> = ({ activeTab, onNavigateTab, children }) => {
  const { cliente, user, isTeam, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-white flex flex-col">
      {/* Top Header da Área do Cliente */}
      <header className="bg-[#14161A] border-b border-[#1D2026] sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2 group">
              <img
                src={CONFIG.logoUrl}
                alt={CONFIG.storeName}
                className="h-9 sm:h-10 w-auto object-contain drop-shadow-[0_0_15px_rgba(88,231,7,0.3)] transition-transform group-hover:scale-105"
              />
            </a>
            <div className="hidden sm:block h-6 w-px bg-[#1D2026]" />
            <span className="hidden sm:inline-block text-xs font-black uppercase tracking-wider text-[#58E707]">
              Área do Cliente
            </span>
          </div>

          {/* Navegação e Usuário */}
          <div className="flex items-center gap-2 sm:gap-4">
            {isTeam && (
              <a
                href="/crm"
                className="flex items-center gap-1.5 py-1.5 px-3 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-extrabold text-xs uppercase rounded-xl transition-all shadow-[0_0_15px_rgba(88,231,7,0.3)] cursor-pointer"
                title="Acessar o Painel Interno CRM"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Painel CRM</span>
              </a>
            )}

            <nav className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => onNavigateTab('pedidos')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'pedidos'
                    ? 'bg-[#58E707] text-[#0A0B0D]'
                    : 'text-[#A7ADB5] hover:text-white hover:bg-[#1D2026]'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Meus Pedidos</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('dados')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'dados'
                    ? 'bg-[#58E707] text-[#0A0B0D]'
                    : 'text-[#A7ADB5] hover:text-white hover:bg-[#1D2026]'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Meus Dados</span>
              </button>
            </nav>

            <div className="h-6 w-px bg-[#1D2026]" />

            <a
              href="/"
              className="hidden md:flex items-center gap-1.5 text-xs text-[#A7ADB5] hover:text-[#58E707] transition-colors py-1 px-2 rounded-lg"
              title="Voltar ao catálogo"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Loja</span>
            </a>

            <button
              type="button"
              onClick={() => signOut('/')}
              className="p-2 text-[#A7ADB5] hover:text-rose-400 hover:bg-[#1D2026] rounded-xl transition-colors cursor-pointer"
              title="Sair da conta"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Banner de Boas-Vindas */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#14161A] p-4 sm:p-5 rounded-2xl border border-[#1D2026]">
          <div>
            <h1 className="text-lg sm:text-xl font-bold font-sport uppercase text-white flex items-center gap-2">
              Olá, {cliente?.nome || user?.email?.split('@')[0] || 'Cliente'}!
            </h1>
            <p className="text-xs text-[#A7ADB5] mt-0.5">
              Acompanhe suas criações, aprove orçamentos e veja o status da confecção direto com a fábrica.
            </p>
          </div>

          <a
            href={CONFIG.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start sm:self-auto py-2 px-3.5 bg-[#0A0B0D] hover:bg-[#1D2026] border border-[#1D2026] text-white hover:text-[#58E707] text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-[#58E707]" />
            <span>Suporte WhatsApp</span>
            <ExternalLink className="w-3 h-3 text-[#A7ADB5]" />
          </a>
        </div>

        {/* Banner Especial de Acesso Administrativo (se o usuário for da equipe) */}
        {isTeam && (
          <div className="mb-6 bg-[#58E707]/10 border border-[#58E707]/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_0_20px_rgba(88,231,7,0.1)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#58E707]/20 border border-[#58E707]/30 flex items-center justify-center text-[#58E707] flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-white tracking-wider">
                    Sessão de Administrador GL Sports
                  </span>
                  <span className="px-2 py-0.5 bg-[#58E707] text-[#0A0B0D] font-black text-[10px] rounded uppercase">
                    Equipe
                  </span>
                </div>
                <p className="text-xs text-[#A7ADB5] mt-0.5">
                  Você está logado com privilégios de administrador. Você pode acessar o CRM completo de vendas e produção.
                </p>
              </div>
            </div>

            <a
              href="/crm"
              className="py-2.5 px-5 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-extrabold text-xs uppercase rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(88,231,7,0.25)] flex-shrink-0 cursor-pointer"
            >
              <span>Acessar Painel CRM</span>
            </a>
          </div>
        )}

        {children}
      </main>

      {/* Rodapé Simples */}
      <footer className="border-t border-[#1D2026] py-6 text-center text-xs text-[#A7ADB5]">
        <p>© {new Date().getFullYear()} GL Sports Uniformes Personalizados • Peruíbe/SP</p>
      </footer>
    </div>
  );
};
