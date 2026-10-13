import React, { useState } from 'react';
import { MousePointerClick, Shirt, Truck, Star, ChevronDown, Send, Check, ShieldCheck, MapPin, PhoneCall, Award, Globe, ExternalLink } from 'lucide-react';
import { CONFIG } from '../config';
import { TricolorStripe } from './TricolorStripe';

export const HowItWorks: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const steps = [
    {
      step: '01',
      title: 'Escolha a Estampa & Modelo',
      desc: 'Navegue pelo acervo oficial com mais de 2.100 modelos de uniformes esportivos, interclasse, formandos, abadás e blocos.',
      icon: MousePointerClick,
    },
    {
      step: '02',
      title: 'Personalize com seu Time',
      desc: 'Defina a quantidade de camisetas que precisa, informe os tamanhos da equipe, nomes, números e envie o escudo da sua turma.',
      icon: Shirt,
    },
    {
      step: '03',
      title: 'Produção & Entrega Nacional',
      desc: 'Confeccionamos em Dry-Fit de alta performance com sublimação total toque zero e entregamos em qualquer cidade do Brasil.',
      icon: Truck,
    },
  ];

  const faqs = [
    {
      q: 'A GL Esportes atende pedidos para todo o Brasil?',
      a: 'Sim! Entregamos camisetas e uniformes personalizados para times de futebol, turmas de escola/faculdade, atléticas e eventos em todos os estados do Brasil com envio seguro e rastreado.',
    },
    {
      q: 'Como personalizo as camisetas com nomes, números e patrocinadores?',
      a: 'É muito simples! Ao escolher a estampa e adicionar ao carrinho, você envia os detalhes no WhatsApp. Nossa equipe técnica ajusta a lista de nomes, números e adiciona seu escudo oficial antes de produzir.',
    },
    {
      q: 'Qual o tipo de tecido e tecnologia utilizada?',
      a: 'Utilizamos Dry-Fit Esportivo de alto padrão com proteção UV50+, tecnologia antitranspirante e sublimação total digital 300 DPI de toque zero: as cores permanecem vivas e não desbotam com as lavagens.',
    },
    {
      q: 'Vocês atendem encomendas de times de várzea e interclasse?',
      a: 'Com certeza! Somos a empresa número 1 do Brasil especialista em fardamentos completos de futebol, camisas de interclasse, terceirão, cursos universitários e blocos de carnaval.',
    },
    {
      q: 'Onde fica a sede oficial da GL Esportes?',
      a: `Nossa sede fica em ${CONFIG.address.full}. Você pode traçar a rota pelo Google Maps ou falar diretamente com nossos especialistas pelo WhatsApp (${CONFIG.whatsappFormatted}).`,
    },
  ];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <div className="w-full bg-[#0A0B0D] border-t border-[#1D2026] py-16 space-y-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* SECTION 1: COMO FUNCIONA */}
        <section className="text-center space-y-10">
          <div className="flex flex-col items-center">
            <span className="text-xs font-semibold uppercase tracking-menu text-[#58E707] block mb-2">
              PROCESSO SIMPLES E ÁGIL
            </span>
            <h2 className="font-sport font-black text-3xl sm:text-5xl italic text-white tracking-tight uppercase leading-none mb-3">
              COMO FUNCIONA EM <span className="text-[#58E707]">3 PASSOS</span>
            </h2>
            <TricolorStripe width="w-[120px]" height="h-[3.5px]" centered className="mb-3" />
            <p className="text-xs sm:text-sm text-[#A7ADB5] max-w-lg mx-auto">
              Do catálogo da GL Sports para a sua prensa térmica em poucos minutos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#14161A] p-8 rounded-2xl border border-[#1D2026] relative group hover:border-[#58E707] transition-all text-left flex flex-col justify-between hover:shadow-[0_0_24px_rgba(88,231,7,0.2)]"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-[#0A0B0D] border border-[#1D2026] flex items-center justify-center text-[#58E707] group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6 text-[#58E707]" />
                      </div>
                      <span className="font-sport font-black text-4xl italic text-[#1D2026] group-hover:text-[#58E707] transition-colors">
                        {step.step}
                      </span>
                    </div>

                    <h3 className="font-sport font-black text-2xl italic text-white uppercase">
                      {step.title}
                    </h3>

                    <p className="text-xs text-[#A7ADB5] leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 2: AUTORIDADE NACIONAL • Nº 1 DO BRASIL & AVALIAÇÃO GOOGLE */}
        <section className="bg-[#14161A] p-8 sm:p-12 rounded-3xl border border-[#1D2026] relative overflow-hidden shadow-2xl">
          {/* Faixa tricolor no topo */}
          <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-gradient-to-r from-[#58E707] via-[#026FF6] to-[#FC6602]" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4 text-left">
              <span className="text-xs font-black text-[#58E707] uppercase tracking-wider block">
                REFERÊNCIA NACIONAL NO MERCADO
              </span>

              <h3 className="font-sport font-black text-3xl sm:text-5xl italic text-white uppercase leading-tight tracking-tight">
                A EMPRESA Nº 1 DO BRASIL EM <span className="text-[#58E707]">CAMISETAS PERSONALIZADAS</span>
              </h3>

              <p className="text-xs sm:text-sm text-[#A7ADB5] leading-relaxed">
                Reconhecida nacionalmente pela excelência na confecção de uniformes esportivos, camisetas personalizadas e sublimação total de alta performance. Sede em Peruíbe/SP com atendimento a equipes e clientes de todo o Brasil.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-[#A7ADB5]">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-[#FC6602] fill-[#FC6602]" />
                  <span className="font-bold text-white text-sm">{CONFIG.googleRating.text}</span>
                  <span className="text-[#A7ADB5]">• Avaliação Máxima no Google</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-[#026FF6]" />
                  <span className="font-semibold text-white">Atendemos em todo o Brasil</span>
                </div>
              </div>
            </div>

            {/* Right Card: Localização & Atendimento */}
            <div className="lg:col-span-5 bg-[#0A0B0D] p-6 rounded-2xl border border-[#1D2026] space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-[#14161A] border border-[#1D2026] text-[#58E707]">
                  <MapPin className="w-5 h-5 text-[#58E707]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white uppercase font-sport tracking-wide">
                    Sede Oficial GL Sports
                  </h4>
                  <p className="text-xs text-[#A7ADB5] mt-1 leading-relaxed">
                    {CONFIG.address.full}
                  </p>
                  <p className="text-[11px] text-[#58E707] mt-1 font-semibold">
                    Segunda-feira a partir das 08:00
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={CONFIG.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-extrabold text-xs uppercase rounded-xl flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(88,231,7,0.3)]"
                >
                  <PhoneCall className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Falar com Atendimento no WhatsApp</span>
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 3: PERGUNTAS FREQUENTES */}
        <section className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center flex flex-col items-center">
            <span className="text-xs font-semibold uppercase tracking-menu text-[#58E707] block mb-2">
              DÚVIDAS COMUNS
            </span>
            <h2 className="font-sport font-black text-3xl sm:text-4xl italic text-white tracking-tight uppercase leading-none mb-3">
              PERGUNTAS <span className="text-[#58E707]">FREQUENTES</span>
            </h2>
            <TricolorStripe width="w-[120px]" height="h-[3.5px]" centered />
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-[#14161A] rounded-xl border border-[#1D2026] overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-[#1D2026]/40 transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-sm text-white">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#58E707] transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-[#A7ADB5] border-t border-[#1D2026] leading-relaxed bg-[#0A0B0D]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 4: NEWSLETTER / LANÇAMENTOS */}
        <section className="bg-[#14161A] p-8 sm:p-12 rounded-3xl border border-[#1D2026] text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-gradient-to-r from-[#58E707] via-[#026FF6] to-[#FC6602]" />

          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="font-sport font-black text-2xl sm:text-4xl italic text-white uppercase tracking-tight">
              RECEBA LANÇAMENTOS & <span className="text-[#58E707]">NOVAS ESTAMPAS</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#A7ADB5]">
              Cadastre seu e-mail para receber avisos sobre novas artes esportivas, interclasse, blocos e novidades da GL Sports.
            </p>
          </div>

          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Digite seu melhor e-mail..."
              required
              className="flex-1 bg-[#0A0B0D] text-white placeholder-[#A7ADB5]/60 px-4 py-3 rounded-xl border border-[#1D2026] text-xs sm:text-sm focus:outline-none focus:border-[#58E707]"
            />
            <button
              type="submit"
              className="py-3 px-6 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-extrabold uppercase text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(88,231,7,0.3)] transition-transform active:scale-95 cursor-pointer"
            >
              {subscribed ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Inscrito!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Cadastrar</span>
                </>
              )}
            </button>
          </form>
        </section>

      </div>
    </div>
  );
};
