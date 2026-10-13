import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { STATUS_LABELS } from '../../lib/supabaseTypes';
import { CONFIG } from '../../config';
import { 
  LayoutDashboard, ShoppingCart, Users, CheckSquare, 
  MessageSquare, BarChart3, UserCog, Settings, LogOut, 
  Bell, ShieldAlert, ArrowLeft 
} from 'lucide-react';

export type CrmTab = 
  | 'painel' 
  | 'pedidos' 
  | 'clientes' 
  | 'tarefas' 
  | 'mensagens' 
  | 'relatorios' 
  | 'equipe' 
  | 'configuracoes';

interface Props {
  activeTab: CrmTab;
  onNavigateTab: (tab: CrmTab) => void;
  children: React.ReactNode;
}

export const CrmLayout: React.FC<Props> = ({ activeTab, onNavigateTab, children }) => {
  const { perfil, signOut } = useAuth();
  const [realtimeToast, setRealtimeToast] = useState<string | null>(null);

  // Injeta meta tag noindex dinamicamente
  useEffect(() => {
    let metaTag = document.querySelector('meta[name="robots"]');
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', 'robots');
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', 'noindex, nofollow');

    return () => {
      metaTag?.setAttribute('content', 'index, follow');
    };
  }, []);

  // Realtime listener para mudanças de status em pedidos
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel('crm-status-listener')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pedidos' },
        (payload: any) => {
          const newStatus = payload.new?.status;
          const oldStatus = payload.old?.status;
          const num = payload.new?.numero || payload.new?.id?.slice(0, 5);

          if (newStatus && newStatus !== oldStatus) {
            const statusNome = STATUS_LABELS[newStatus as keyof typeof STATUS_LABELS] || newStatus;
            setRealtimeToast(`Pedido #${num} foi para ${statusNome}`);
            setTimeout(() => setRealtimeToast(null), 5000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const isMasterOrAdmin = perfil?.papel === 'master' || perfil?.papel === 'admin';

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-white flex">
      {/* SIDEBAR LATERAL FIXO */}
      <aside className="w-64 bg-[#14161A] border-r border-[#1D2026] flex flex-col justify-between flex-shrink-0 z-30">
        <div>
          {/* Header da Sidebar com Marca Oficial */}
          <div className="p-5 border-b border-[#1D2026] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={CONFIG.logoUrl}
                alt="GL Sports"
                className="h-8 w-auto object-contain drop-shadow-[0_0_12px_rgba(88,231,7,0.3)]"
              />
              <div>
                <span className="font-sport font-black text-white text-sm tracking-wide block">
                  GL SPORTS
                </span>
                <span className="text-[10px] text-[#58E707] font-black uppercase tracking-wider block">
                  CRM EQUIPE
                </span>
              </div>
            </div>
          </div>

          {/* Menu Lateral */}
          <nav className="p-3 space-y-1 text-xs">
            <button
              onClick={() => onNavigateTab('painel')}
              className={`w-full py-2.5 px-3.5 rounded-xl font-bold uppercase transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === 'painel'
                  ? 'bg-[#58E707] text-[#0A0B0D]'
                  : 'text-[#A7ADB5] hover:text-white hover:bg-[#1D2026]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Painel</span>
            </button>

            <button
              onClick={() => onNavigateTab('pedidos')}
              className={`w-full py-2.5 px-3.5 rounded-xl font-bold uppercase transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === 'pedidos'
                  ? 'bg-[#58E707] text-[#0A0B0D]'
                  : 'text-[#A7ADB5] hover:text-white hover:bg-[#1D2026]'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Pedidos</span>
            </button>

            <button
              onClick={() => onNavigateTab('clientes')}
              className={`w-full py-2.5 px-3.5 rounded-xl font-bold uppercase transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === 'clientes'
                  ? 'bg-[#58E707] text-[#0A0B0D]'
                  : 'text-[#A7ADB5] hover:text-white hover:bg-[#1D2026]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Clientes</span>
            </button>

            <button
              onClick={() => onNavigateTab('tarefas')}
              className={`w-full py-2.5 px-3.5 rounded-xl font-bold uppercase transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === 'tarefas'
                  ? 'bg-[#58E707] text-[#0A0B0D]'
                  : 'text-[#A7ADB5] hover:text-white hover:bg-[#1D2026]'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Tarefas</span>
            </button>

            <button
              onClick={() => onNavigateTab('mensagens')}
              className={`w-full py-2.5 px-3.5 rounded-xl font-bold uppercase transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === 'mensagens'
                  ? 'bg-[#58E707] text-[#0A0B0D]'
                  : 'text-[#A7ADB5] hover:text-white hover:bg-[#1D2026]'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Mensagens</span>
            </button>

            <button
              onClick={() => onNavigateTab('relatorios')}
              className={`w-full py-2.5 px-3.5 rounded-xl font-bold uppercase transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === 'relatorios'
                  ? 'bg-[#58E707] text-[#0A0B0D]'
                  : 'text-[#A7ADB5] hover:text-white hover:bg-[#1D2026]'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Relatórios</span>
            </button>

            {/* Itens Restritos: Master & Admin */}
            {isMasterOrAdmin && (
              <>
                <div className="pt-3 pb-1 px-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#A7ADB5]/60 block">
                    Gestão
                  </span>
                </div>

                <button
                  onClick={() => onNavigateTab('equipe')}
                  className={`w-full py-2.5 px-3.5 rounded-xl font-bold uppercase transition-all flex items-center gap-3 cursor-pointer ${
                    activeTab === 'equipe'
                      ? 'bg-[#58E707] text-[#0A0B0D]'
                      : 'text-[#A7ADB5] hover:text-white hover:bg-[#1D2026]'
                  }`}
                >
                  <UserCog className="w-4 h-4" />
                  <span>Equipe</span>
                </button>

                <button
                  onClick={() => onNavigateTab('configuracoes')}
                  className={`w-full py-2.5 px-3.5 rounded-xl font-bold uppercase transition-all flex items-center gap-3 cursor-pointer ${
                    activeTab === 'configuracoes'
                      ? 'bg-[#58E707] text-[#0A0B0D]'
                      : 'text-[#A7ADB5] hover:text-white hover:bg-[#1D2026]'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Configurações</span>
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Rodapé da Sidebar: Usuário + Logout */}
        <div className="p-4 border-t border-[#1D2026] bg-[#0A0B0D]/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate">
                {perfil?.nome || 'Membro da Equipe'}
              </span>
              <span className="text-[10px] uppercase font-black text-[#58E707] block tracking-wider">
                {perfil?.papel || 'VENDEDOR'}
              </span>
            </div>

            <button
              onClick={() => signOut('/crm/entrar')}
              className="p-2 text-[#A7ADB5] hover:text-rose-400 hover:bg-[#1D2026] rounded-xl transition-colors cursor-pointer"
              title="Sair do CRM"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-1.5 pt-1">
            <a
              href="/minha-conta"
              className="flex items-center gap-2 text-[11px] text-[#A7ADB5] hover:text-[#58E707] transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-[#58E707]" />
              <span>Ver Área do Cliente</span>
            </a>
            <a
              href="/"
              className="flex items-center gap-2 text-[11px] text-[#A7ADB5] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#58E707]" />
              <span>Ver Loja Pública</span>
            </a>
          </div>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Banner Realtime Toast Flutuante */}
        {realtimeToast && (
          <div className="fixed top-4 right-4 z-50 bg-[#14161A] border-2 border-[#58E707] rounded-2xl p-4 shadow-2xl flex items-center gap-3 animate-slideIn">
            <div className="w-8 h-8 rounded-full bg-[#58E707]/20 flex items-center justify-center text-[#58E707]">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-[#58E707] block">
                Atualização em Tempo Real
              </span>
              <span className="text-xs font-bold text-white block">{realtimeToast}</span>
            </div>
          </div>
        )}

        {/* Conteúdo da Aba */}
        <main className="p-6 lg:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
};
