import React, { useState } from 'react';
import { 
  X, Lock, ShieldCheck, Mail, Phone, Building, User, 
  CheckCircle2, ArrowRight, ArrowLeft, Copy, Check, 
  Sparkles, Zap, Flame, Download, Layers, Award, Star
} from 'lucide-react';
import { CONFIG } from '../config';

interface EstampadorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface PlanoAssinatura {
  id: 'basico' | 'pro' | 'master';
  nome: string;
  badge: string;
  destaque?: boolean;
  preco: string;
  valorNumerico: number;
  periodo: string;
  downloadsMes: string;
  descricaoCurta: string;
  recursos: string[];
  limitacoes?: string[];
  cor: string;
  bgGradiente: string;
}

export const PLANOS_ESTAMPADORES: PlanoAssinatura[] = [
  {
    id: 'basico',
    nome: 'Plano Básico',
    badge: 'INICIANTE • OFICINAS PEQUENAS',
    preco: '23,90',
    valorNumerico: 23.90,
    periodo: 'por mês',
    downloadsMes: '30 downloads por mês',
    descricaoCurta: 'Ideal para quem está começando na sublimação e precisa de artes prontas em alta resolução.',
    cor: '#026FF6',
    bgGradiente: 'from-[#026FF6]/20 via-[#026FF6]/5 to-transparent',
    recursos: [
      'Até 30 downloads de templates por mês',
      'Artes prontas em alta resolução (PNG transparente e JPG em 300 DPI)',
      'Acesso aos temas essenciais: Futebol, Vôlei, Religioso e Escolar',
      'Mockups padrão para divulgação nas redes sociais e WhatsApp',
      'Arquivos configurados no padrão RGB para sublimação',
      'Acesso em 1 dispositivo da sua oficina',
      'Suporte padrão em horário comercial via WhatsApp',
    ],
    limitacoes: [
      'Limite de 30 downloads por mês (não cumulativo)',
      'Não inclui arquivos abertos em CorelDRAW (.CDR)',
      'Não inclui mockups em PSD com camadas inteligentes',
    ],
  },
  {
    id: 'pro',
    nome: 'Plano Pró',
    badge: 'MAIS POPULAR • MELHOR CUSTO-BENEFÍCIO',
    destaque: true,
    preco: '53,90',
    valorNumerico: 53.90,
    periodo: 'por mês',
    downloadsMes: '120 downloads por mês',
    descricaoCurta: 'O plano perfeito para estamparias e confecções ativas que precisam de vetores abertos e agilidade.',
    cor: '#58E707',
    bgGradiente: 'from-[#58E707]/25 via-[#58E707]/10 to-transparent',
    recursos: [
      'Até 120 downloads de templates por mês',
      'Arquivos 100% vetorizados e abertos em CorelDRAW (.CDR) e Illustrator (.AI)',
      'Pacote de Mockups profissionais em PSD (Photoshop) com camadas editáveis',
      'Moldes técnicos com gabaritos de corte (frente, costas e mangas)',
      'Acesso aos temas esportivos mais procurados: Futebol de Várzea, Ciclismo, Beach Tennis e Lutas',
      'Liberação em até 2 computadores/designers da sua equipe',
      'Novos lançamentos adicionados quinzenalmente',
      'Suporte prioritário via WhatsApp direto com nossa equipe técnica',
    ],
    limitacoes: [
      'Limite de 120 downloads por mês',
    ],
  },
  {
    id: 'master',
    nome: 'Plano Master',
    badge: 'ACESSO TOTAL • DOWNLOADS ILIMITADOS',
    destaque: false,
    preco: '89,90',
    valorNumerico: 89.90,
    periodo: 'por mês',
    downloadsMes: 'Downloads ILIMITADOS sem restrições',
    descricaoCurta: 'Para confecções e birôs de estamparia que produzem em grande escala e exigem o catálogo completo sem travas.',
    cor: '#FC6602',
    bgGradiente: 'from-[#FC6602]/25 via-[#FC6602]/10 to-transparent',
    recursos: [
      'DOWNLOADS 100% ILIMITADOS por mês (sem travas diárias ou mensais)',
      'TODOS os tipos de templates do catálogo GL Sports liberados sem exceção',
      'Artes vetorizadas abertas em CorelDRAW (todas as versões), Illustrator (.AI) e EPS',
      'Mockups 3D ultrarrealistas em alta resolução com modelos vestindo as peças',
      'Gabaritos de modelagem profissional para sublimação total e costura industrial',
      'Temas exclusivos: Futebol, Ciclismo, Jiu-Jitsu, Abadás de Carnaval, Terceirão e Quebrada',
      'Acesso antecipado a todos os lançamentos semanais',
      'Acesso multiusuário para toda a equipe da sua estamparia',
      'Direito comercial total para confecção e comercialização física das peças',
      'Atendimento e Suporte VIP exclusivo com a diretoria de criação da GL Sports',
    ],
  },
];

export const EstampadorModal: React.FC<EstampadorModalProps> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<'planos' | 'login' | 'solicitar'>('planos');
  const [selectedPlano, setSelectedPlano] = useState<PlanoAssinatura | null>(null);

  // Estado do Checkout PIX
  const [pixNome, setPixNome] = useState('');
  const [pixWhatsapp, setPixWhatsapp] = useState('');
  const [pixEmail, setPixEmail] = useState('');
  const [chaveCopied, setChaveCopied] = useState(false);

  // Form de login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Form de solicitação B2B
  const [solicitarNome, setSolicitarNome] = useState('');
  const [solicitarOficina, setSolicitarOficina] = useState('');
  const [solicitarWhatsapp, setSolicitarWhatsapp] = useState('');
  const [solicitarEmail, setSolicitarEmail] = useState('');
  const [solicitarCidadeUf, setSolicitarCidadeUf] = useState('');
  const [solicitarCapacidade, setSolicitarCapacidade] = useState('500 a 2000 pecas');
  const [isSolicitacaoEnviada, setIsSolicitacaoEnviada] = useState(false);

  if (!isOpen) return null;

  const chavePixOficial = CONFIG.whatsappFormatted || '(13) 99701-1514';
  const chavePixChavePura = '13997011514';

  const handleCopyChavePix = () => {
    navigator.clipboard.writeText(chavePixChavePura);
    setChaveCopied(true);
    setTimeout(() => setChaveCopied(false), 3000);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(true);
  };

  const handleSolicitarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!solicitarNome || !solicitarWhatsapp || !solicitarEmail) return;
    setIsSolicitacaoEnviada(true);
  };

  const resetAndClose = () => {
    setSelectedPlano(null);
    setChaveCopied(false);
    setLoginError(false);
    setIsSolicitacaoEnviada(false);
    onClose();
  };

  const getWhatsappPixUrl = (plano: PlanoAssinatura) => {
    const texto = `Olá, equipe GL Sports! Acabo de assinar o *${plano.nome.toUpperCase()}* para estampadores (R$ ${plano.preco}/mês).\n\n*Meus Dados:*\n• Nome: ${pixNome || 'Não informado'}\n• WhatsApp: ${pixWhatsapp || 'Não informado'}\n• E-mail: ${pixEmail || 'Não informado'}\n• Chave PIX utilizada: (13) 99701-1514\n\nEstou enviando o comprovante do PIX para liberação imediata do meu acesso aos downloads!`;
    return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(texto)}`;
  };

  const whatsappSolicitacaoUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(
    `Olá, equipe GL Sports! Sou estampador/confeccionista e enviei minha solicitação de homologação B2B.\n\n*Nome:* ${solicitarNome || 'Não informado'}\n*Oficina/Empresa:* ${solicitarOficina || 'Não informado'}\n*WhatsApp:* ${solicitarWhatsapp || 'Não informado'}\n*E-mail:* ${solicitarEmail || 'Não informado'}\n*Cidade/UF:* ${solicitarCidadeUf || 'Não informado'}\n\nGostaria de agilizar a liberação das artes e templates.`
  )}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
      onClick={resetAndClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-[#14161A] border border-[#1D2026] rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col"
      >
        {/* Linha tricolor oficial no topo */}
        <div className="h-[3.5px] w-full bg-gradient-to-r from-[#58E707] via-[#026FF6] to-[#FC6602]" />

        {/* Header do Modal */}
        <div className="p-4 sm:p-6 bg-[#0A0B0D] border-b border-[#1D2026] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#FC6602]/15 border border-[#FC6602]/40 flex items-center justify-center text-[#FC6602] shadow-[0_0_15px_rgba(252,102,2,0.25)]">
              <Layers className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#FC6602] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#58E707]" />
                CLUBE DOS ESTAMPADORES • PLANOS DE DOWNLOAD
              </span>
              <h2 className="font-sport font-black text-lg sm:text-2xl italic text-white uppercase tracking-wide leading-tight">
                Acervo Profissional para Estamparia & Sublimação
              </h2>
            </div>
          </div>

          <button
            onClick={resetAndClose}
            className="p-2 text-[#A7ADB5] hover:text-white rounded-xl hover:bg-[#1D2026] transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas Superiores */}
        <div className="bg-[#0A0B0D]/90 px-4 sm:px-6 pt-3 border-b border-[#1D2026]">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => {
                setTab('planos');
                setSelectedPlano(null);
              }}
              className={`py-2 px-4 rounded-xl font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                tab === 'planos'
                  ? 'bg-[#58E707] text-[#0A0B0D] shadow-[0_0_15px_rgba(88,231,7,0.3)]'
                  : 'text-[#A7ADB5] hover:text-white hover:bg-[#14161A]'
              }`}
            >
              <Zap className="w-3.5 h-3.5 stroke-[3]" />
              <span>Planos de Assinatura</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTab('login');
                setSelectedPlano(null);
                setLoginError(false);
              }}
              className={`py-2 px-4 rounded-xl font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                tab === 'login'
                  ? 'bg-[#026FF6] text-white shadow-[0_0_15px_rgba(2,111,246,0.3)]'
                  : 'text-[#A7ADB5] hover:text-white hover:bg-[#14161A]'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Já Sou Assinante (Login)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTab('solicitar');
                setSelectedPlano(null);
                setIsSolicitacaoEnviada(false);
              }}
              className={`py-2 px-4 rounded-xl font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                tab === 'solicitar'
                  ? 'bg-[#FC6602] text-white shadow-[0_0_15px_rgba(252,102,2,0.3)]'
                  : 'text-[#A7ADB5] hover:text-white hover:bg-[#14161A]'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Homologação B2B</span>
            </button>
          </div>
        </div>

        {/* Conteúdo Dinâmico */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* ============================================================== */}
          {/* 1. ABA DE PLANOS (OU TELA DE PAGAMENTO PIX SE PLANO ESCOLHIDO) */}
          {/* ============================================================== */}
          {tab === 'planos' && !selectedPlano && (
            <div className="space-y-6">
              {/* Apresentação / Header da seção */}
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#58E707]/10 border border-[#58E707]/30 rounded-full text-[11px] font-black text-[#58E707] uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5" />
                  Preços Promocionais de Lançamento
                </div>
                <h3 className="font-sport font-black text-2xl sm:text-3xl italic text-white uppercase tracking-tight">
                  Escolha o Plano Ideal Para a Sua Oficina
                </h3>
                <p className="text-xs sm:text-sm text-[#A7ADB5] leading-relaxed">
                  Tenha acesso imediato a mais de 2.200 artes prontas, mockups vetorizados e moldes esportivos em alta resolução 300 DPI prontos para sublimar.
                </p>
              </div>

              {/* Grid dos 3 Planos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 pt-2">
                {PLANOS_ESTAMPADORES.map((plano) => {
                  const isPro = plano.id === 'pro';
                  const isMaster = plano.id === 'master';

                  return (
                    <div
                      key={plano.id}
                      className={`relative rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 border bg-[#0A0B0D] ${
                        isPro
                          ? 'border-[#58E707] shadow-[0_0_35px_rgba(88,231,7,0.2)] md:-translate-y-2 ring-1 ring-[#58E707]/60'
                          : isMaster
                          ? 'border-[#FC6602]/80 hover:border-[#FC6602] shadow-[0_0_25px_rgba(252,102,2,0.15)]'
                          : 'border-[#1D2026] hover:border-[#026FF6]'
                      }`}
                    >
                      {/* Selo de Destaque Superior */}
                      {isPro && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#58E707] text-[#0A0B0D] text-[10px] font-black uppercase tracking-wider py-1 px-3.5 rounded-full shadow-lg flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          <span>Mais Recomendado</span>
                        </div>
                      )}

                      {isMaster && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FC6602] text-white text-[10px] font-black uppercase tracking-wider py-1 px-3 rounded-full shadow-lg flex items-center gap-1">
                          <Flame className="w-3 h-3 fill-current" />
                          <span>Acesso Ilimitado</span>
                        </div>
                      )}

                      <div className="space-y-4">
                        {/* Header do Card */}
                        <div>
                          <span
                            className="text-[10px] font-black uppercase tracking-wider block mb-1"
                            style={{ color: plano.cor }}
                          >
                            {plano.badge}
                          </span>
                          <h4 className="font-sport font-black text-xl sm:text-2xl italic text-white uppercase">
                            {plano.nome}
                          </h4>
                          <p className="text-xs text-[#A7ADB5] mt-1 leading-snug">
                            {plano.descricaoCurta}
                          </p>
                        </div>

                        {/* Preço */}
                        <div className="pt-2 pb-1 border-y border-[#1D2026]">
                          <div className="flex items-baseline gap-1">
                            <span className="text-xs text-[#A7ADB5] font-bold">R$</span>
                            <span className="font-sport font-black text-4xl sm:text-5xl italic text-white tracking-tight">
                              {plano.preco}
                            </span>
                            <span className="text-xs text-[#A7ADB5] font-medium">/ mês</span>
                          </div>
                          <div 
                            className="text-[11px] font-extrabold mt-1 flex items-center gap-1.5"
                            style={{ color: plano.cor }}
                          >
                            <Download className="w-3.5 h-3.5 shrink-0" />
                            <span>{plano.downloadsMes}</span>
                          </div>
                        </div>

                        {/* Recursos do Plano */}
                        <div className="space-y-2 pt-1 text-xs">
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#A7ADB5] block">
                            O que está incluso:
                          </span>
                          <ul className="space-y-2 text-white">
                            {plano.recursos.map((rec, rIdx) => (
                              <li key={rIdx} className="flex items-start gap-2 leading-tight">
                                <CheckCircle2
                                  className="w-3.5 h-3.5 shrink-0 mt-0.5"
                                  style={{ color: plano.cor }}
                                />
                                <span className="text-xs">{rec}</span>
                              </li>
                            ))}
                          </ul>

                          {/* Limitações informativas (se houver) */}
                          {plano.limitacoes && plano.limitacoes.length > 0 && (
                            <div className="pt-2 border-t border-[#1D2026]/80">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A7ADB5]/70 block mb-1">
                                Limitações do plano:
                              </span>
                              <ul className="space-y-1.5 text-[#A7ADB5] text-[11px]">
                                {plano.limitacoes.map((lim, lIdx) => (
                                  <li key={lIdx} className="flex items-start gap-1.5">
                                    <span className="text-[#A7ADB5]">•</span>
                                    <span>{lim}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Botão de Ação */}
                      <div className="pt-6">
                        <button
                          type="button"
                          onClick={() => setSelectedPlano(plano)}
                          className={`w-full py-3.5 px-4 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            isPro
                              ? 'bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] shadow-[0_0_20px_rgba(88,231,7,0.35)]'
                              : isMaster
                              ? 'bg-[#FC6602] hover:bg-[#ff771a] text-white shadow-[0_0_20px_rgba(252,102,2,0.35)]'
                              : 'bg-[#026FF6] hover:bg-[#1a7ff7] text-white shadow-[0_0_20px_rgba(2,111,246,0.35)]'
                          }`}
                        >
                          <span>Assinar {plano.nome}</span>
                          <ArrowRight className="w-4 h-4 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Informações de Mercado / Selos de Garantia */}
              <div className="bg-[#0A0B0D] border border-[#1D2026] rounded-2xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#58E707]/10 text-[#58E707] border border-[#58E707]/30">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white">Vetor 300 DPI Real</h5>
                    <p className="text-[11px] text-[#A7ADB5]">Artes sem perda de nitidez na plotter.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#026FF6]/10 text-[#026FF6] border border-[#026FF6]/30">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white">Liberação Imediata</h5>
                    <p className="text-[11px] text-[#A7ADB5]">Pagamento via PIX com envio no WhatsApp.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#FC6602]/10 text-[#FC6602] border border-[#FC6602]/30">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white">Sem Fidelidade</h5>
                    <p className="text-[11px] text-[#A7ADB5]">Cancele ou renove quando quiser sem taxas.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TELA DE CHECKOUT / PAGAMENTO PIX DO PLANO ESCOLHIDO */}
          {/* ============================================================== */}
          {tab === 'planos' && selectedPlano && (
            <div className="space-y-6 animate-fadeIn">
              {/* Botão de Voltar para os Planos */}
              <button
                type="button"
                onClick={() => setSelectedPlano(null)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A7ADB5] hover:text-[#58E707] transition-colors cursor-pointer uppercase"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar e Escolher Outro Plano</span>
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Coluna da Esquerda: Resumo do Plano Escolhido */}
                <div className="lg:col-span-5 bg-[#0A0B0D] border border-[#1D2026] rounded-3xl p-5 sm:p-6 space-y-4">
                  <div className="border-b border-[#1D2026] pb-4">
                    <span
                      className="text-[10px] font-black uppercase tracking-wider block mb-1"
                      style={{ color: selectedPlano.cor }}
                    >
                      {selectedPlano.badge}
                    </span>
                    <h3 className="font-sport font-black text-2xl italic text-white uppercase">
                      {selectedPlano.nome}
                    </h3>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-xs text-[#A7ADB5] font-bold">R$</span>
                      <span className="font-sport font-black text-4xl italic text-white">
                        {selectedPlano.preco}
                      </span>
                      <span className="text-xs text-[#A7ADB5]">/ mês</span>
                    </div>
                    <div 
                      className="text-xs font-extrabold mt-1.5 flex items-center gap-1.5"
                      style={{ color: selectedPlano.cor }}
                    >
                      <Download className="w-4 h-4" />
                      <span>{selectedPlano.downloadsMes}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#A7ADB5] block">
                      Recursos inclusos neste plano:
                    </span>
                    <ul className="space-y-2 text-white">
                      {selectedPlano.recursos.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs leading-snug">
                          <CheckCircle2
                            className="w-3.5 h-3.5 shrink-0 mt-0.5"
                            style={{ color: selectedPlano.cor }}
                          />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Coluna da Direita: Pagamento PIX e Envio do Comprovante */}
                <div className="lg:col-span-7 bg-[#14161A] border border-[#1D2026] rounded-3xl p-5 sm:p-6 space-y-5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#58E707] block">
                      PASSO FINAL • PAGAMENTO SEGURO VIA PIX
                    </span>
                    <h4 className="font-sport font-black text-xl italic text-white uppercase">
                      Copie a Chave PIX e Conclua a Assinatura
                    </h4>
                    <p className="text-xs text-[#A7ADB5]">
                      Pague no seu banco e nos envie o comprovante no WhatsApp para ativarmos seu login imediatamente.
                    </p>
                  </div>

                  {/* Caixa da Chave PIX */}
                  <div className="p-4 rounded-2xl bg-[#0A0B0D] border border-[#1D2026] space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#A7ADB5]">
                      <span className="font-bold uppercase text-[10px]">Chave PIX Oficial (Telefone Celular):</span>
                      <span className="text-[#58E707] font-bold">GL Sports Confecções</span>
                    </div>

                    <div className="flex items-center justify-between bg-[#14161A] border border-[#1D2026] rounded-xl p-3">
                      <span className="font-mono text-base font-bold text-white tracking-wider">
                        {chavePixOficial}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyChavePix}
                        className={`py-2 px-3.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                          chaveCopied
                            ? 'bg-[#58E707] text-[#0A0B0D]'
                            : 'bg-[#1D2026] hover:bg-[#58E707] hover:text-[#0A0B0D] text-white'
                        }`}
                      >
                        {chaveCopied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{chaveCopied ? 'Copiada!' : 'Copiar Chave'}</span>
                      </button>
                    </div>

                    <div className="text-[11px] text-[#A7ADB5] flex items-center justify-between">
                      <span>Valor exato da mensalidade:</span>
                      <span className="text-white font-black text-sm">R$ {selectedPlano.preco}</span>
                    </div>
                  </div>

                  {/* Formulário Rápido com Seus Dados para o Comprovante */}
                  <div className="space-y-3 text-xs">
                    <span className="font-bold text-white uppercase text-[11px] block">
                      Seus dados para ativação da conta:
                    </span>

                    <div>
                      <label className="block text-[#A7ADB5] font-bold mb-1">Seu Nome / Oficina *</label>
                      <input
                        type="text"
                        value={pixNome}
                        onChange={(e) => setPixNome(e.target.value)}
                        placeholder="Ex: Carlos - Estamparia Silva"
                        className="w-full bg-[#0A0B0D] text-white p-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[#A7ADB5] font-bold mb-1">WhatsApp com DDD *</label>
                        <input
                          type="tel"
                          value={pixWhatsapp}
                          onChange={(e) => setPixWhatsapp(e.target.value)}
                          placeholder="(11) 99999-9999"
                          className="w-full bg-[#0A0B0D] text-white p-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[#A7ADB5] font-bold mb-1">E-mail para Login *</label>
                        <input
                          type="email"
                          value={pixEmail}
                          onChange={(e) => setPixEmail(e.target.value)}
                          placeholder="seuemail@oficina.com"
                          className="w-full bg-[#0A0B0D] text-white p-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Botão de Enviar Comprovante no WhatsApp */}
                  <div className="pt-2">
                    <a
                      href={getWhatsappPixUrl(selectedPlano)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 px-6 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-black text-xs uppercase rounded-xl flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(88,231,7,0.35)] transition-all cursor-pointer"
                    >
                      <Phone className="w-4 h-4 stroke-[2.5]" />
                      <span>Enviar Comprovante pelo WhatsApp</span>
                    </a>
                    <span className="text-[10px] text-[#A7ADB5] text-center block mt-2">
                      Nosso atendente confirmará o PIX e enviará seu login e senha do acervo em poucos minutos.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 2. ABA: JÁ SOU ASSINANTE (LOGIN) */}
          {/* ============================================================== */}
          {tab === 'login' && (
            <div className="max-w-md mx-auto py-4 space-y-5 animate-fadeIn">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-[#026FF6]/15 border border-[#026FF6]/40 flex items-center justify-center mx-auto text-[#026FF6] mb-2">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="font-sport font-black text-2xl italic text-white uppercase">
                  Login do Estampador
                </h3>
                <p className="text-xs text-[#A7ADB5]">
                  Insira o e-mail cadastrado e a senha enviada pela equipe da GL Sports para acessar os downloads.
                </p>
              </div>

              {loginError && (
                <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs flex items-start gap-2.5 animate-fadeIn">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Credenciais em verificação ou plano inativo</strong>
                    <span>
                      Caso tenha realizado a assinatura recentemente, certifique-se de que enviou o comprovante no WhatsApp da GL Sports para ativação.
                    </span>
                  </div>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-white font-bold mb-1 uppercase">E-mail Cadastrado</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#A7ADB5] absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="seuemail@oficina.com"
                      className="w-full bg-[#0A0B0D] text-white pl-9 pr-3 py-2.5 rounded-xl border border-[#1D2026] focus:border-[#026FF6] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-bold mb-1 uppercase">Senha do Assinante</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#A7ADB5] absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={loginSenha}
                      onChange={(e) => setLoginSenha(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#0A0B0D] text-white pl-9 pr-3 py-2.5 rounded-xl border border-[#1D2026] focus:border-[#026FF6] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-[#026FF6] hover:bg-[#1a7ff7] text-white font-black text-xs uppercase rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(2,111,246,0.35)] transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Acessar Painel de Downloads</span>
                </button>
              </form>

              <div className="p-4 rounded-2xl bg-[#0A0B0D] border border-[#1D2026] text-center space-y-2 text-xs">
                <span className="text-[#A7ADB5] block">Ainda não é assinante ou precisa renovar?</span>
                <button
                  type="button"
                  onClick={() => setTab('planos')}
                  className="text-[#58E707] font-bold uppercase hover:underline cursor-pointer inline-flex items-center gap-1"
                >
                  <span>Conheça os Planos a partir de R$ 23,90/mês</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 3. ABA: HOMOLOGAÇÃO B2B (PARCERIAS INDUSTRIAIS) */}
          {/* ============================================================== */}
          {tab === 'solicitar' && (
            <div className="max-w-xl mx-auto py-2 space-y-5 animate-fadeIn">
              {isSolicitacaoEnviada ? (
                <div className="py-6 text-center space-y-4 animate-fadeIn">
                  <div className="w-16 h-16 rounded-full bg-[#58E707]/15 border-2 border-[#58E707] flex items-center justify-center mx-auto text-[#58E707] shadow-[0_0_25px_rgba(88,231,7,0.3)]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-sport font-black text-2xl italic uppercase text-white tracking-wide">
                      Solicitação Corporativa Enviada!
                    </h3>
                    <p className="text-base font-bold text-[#58E707]">
                      Nossa equipe comercial entrará em contato.
                    </p>
                    <p className="text-xs text-[#A7ADB5] max-w-md mx-auto leading-relaxed">
                      Os dados da sua estamparia foram recebidos com sucesso. Se preferir agilizar, fale diretamente com nossos consultores de confecção.
                    </p>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                    <a
                      href={whatsappSolicitacaoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-5 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-extrabold text-xs uppercase rounded-xl inline-flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(88,231,7,0.3)] transition-all cursor-pointer"
                    >
                      <Phone className="w-4 h-4 stroke-[2.5]" />
                      <span>Agilizar no WhatsApp da Equipe</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => setTab('planos')}
                      className="py-3 px-5 bg-[#0A0B0D] hover:bg-[#1D2026] text-white font-bold text-xs uppercase rounded-xl border border-[#1D2026] transition-all cursor-pointer"
                    >
                      Ver Planos de Assinatura
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSolicitarSubmit} className="space-y-4 text-xs">
                  <div className="text-xs text-[#A7ADB5] bg-[#0A0B0D] p-3.5 rounded-2xl border border-[#1D2026]">
                    Cadastre sua confecção para parcerias corporativas em larga escala, produção de abadás em lote e desenvolvimento de artes exclusivas sob demanda.
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-white font-bold mb-1 uppercase">Nome do Responsável *</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-[#A7ADB5] absolute left-3 top-3 pointer-events-none" />
                        <input
                          type="text"
                          required
                          value={solicitarNome}
                          onChange={(e) => setSolicitarNome(e.target.value)}
                          placeholder="Ex: Carlos Santos"
                          className="w-full bg-[#0A0B0D] text-white pl-9 pr-3 py-2.5 rounded-xl border border-[#1D2026] focus:border-[#FC6602] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-white font-bold mb-1 uppercase">Nome da Oficina / Estamparia</label>
                        <div className="relative">
                          <Building className="w-4 h-4 text-[#A7ADB5] absolute left-3 top-3 pointer-events-none" />
                          <input
                            type="text"
                            value={solicitarOficina}
                            onChange={(e) => setSolicitarOficina(e.target.value)}
                            placeholder="Ex: Confecções Santos"
                            className="w-full bg-[#0A0B0D] text-white pl-9 pr-3 py-2.5 rounded-xl border border-[#1D2026] focus:border-[#FC6602] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-white font-bold mb-1 uppercase">Cidade / UF</label>
                        <input
                          type="text"
                          value={solicitarCidadeUf}
                          onChange={(e) => setSolicitarCidadeUf(e.target.value)}
                          placeholder="Ex: Santos / SP"
                          className="w-full bg-[#0A0B0D] text-white px-3 py-2.5 rounded-xl border border-[#1D2026] focus:border-[#FC6602] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-white font-bold mb-1 uppercase">WhatsApp com DDD *</label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-[#A7ADB5] absolute left-3 top-3 pointer-events-none" />
                          <input
                            type="tel"
                            required
                            value={solicitarWhatsapp}
                            onChange={(e) => setSolicitarWhatsapp(e.target.value)}
                            placeholder="(13) 99999-9999"
                            className="w-full bg-[#0A0B0D] text-white pl-9 pr-3 py-2.5 rounded-xl border border-[#1D2026] focus:border-[#FC6602] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-white font-bold mb-1 uppercase">E-mail Comercial *</label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-[#A7ADB5] absolute left-3 top-3 pointer-events-none" />
                          <input
                            type="email"
                            required
                            value={solicitarEmail}
                            onChange={(e) => setSolicitarEmail(e.target.value)}
                            placeholder="contato@empresa.com"
                            className="w-full bg-[#0A0B0D] text-white pl-9 pr-3 py-2.5 rounded-xl border border-[#1D2026] focus:border-[#FC6602] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-white font-bold mb-1 uppercase">Capacidade Média de Produção</label>
                      <select
                        value={solicitarCapacidade}
                        onChange={(e) => setSolicitarCapacidade(e.target.value)}
                        className="w-full bg-[#0A0B0D] text-white px-3 py-2.5 rounded-xl border border-[#1D2026] focus:border-[#FC6602] focus:outline-none"
                      >
                        <option value="Ate 500 pecas">Até 500 peças / mês</option>
                        <option value="500 a 2000 pecas">500 a 2.000 peças / mês</option>
                        <option value="Acima de 2000 pecas">Mais de 2.000 peças / mês</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-[#FC6602] hover:bg-[#ff771a] text-white font-black text-xs uppercase rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(252,102,2,0.35)] transition-all cursor-pointer"
                  >
                    <span>Enviar Homologação B2B</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
