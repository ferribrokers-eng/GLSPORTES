import React from 'react';
import { Award, Globe, Layers, PhoneCall, Star } from 'lucide-react';
import { CONFIG } from '../config';

export const BenefitsBar: React.FC = () => {
  const benefits = [
    {
      icon: Award,
      title: 'Empresa Nº 1 do Brasil',
      desc: 'Referência nacional em sublimação esportiva e camisetas personalizadas',
      color: '#58E707', // Verde Oficial do Logo
    },
    {
      icon: Globe,
      title: 'Atendemos Todo o Brasil 🇧🇷',
      desc: 'Clientes atendidos e satisfeitos em todos os estados do país',
      color: '#026FF6', // Azul Oficial do Logo
    },
    {
      icon: Layers,
      title: 'Mais de 2.200 Modelos Exclusivos',
      desc: 'Camisetas personalizadas, uniformes completos e estampas premium',
      color: '#FC6602', // Laranja Oficial do Logo
    },
    {
      icon: PhoneCall,
      title: `WhatsApp (${CONFIG.whatsappFormatted})`,
      desc: 'Atendimento humanizado, envio imediato e avaliação 5,0 no Google',
      color: '#58E707', // Verde Oficial do Logo
    },
  ];

  return (
    <div className="w-full bg-[#0E1014] border-y border-[#1D2026] py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#14161A] border border-[#1D2026] hover:border-[#58E707]/40 transition-all hover:bg-[#181B22] group"
              >
                <div 
                  className="p-3 rounded-xl bg-[#0A0B0D] border border-[#1D2026] flex-shrink-0 group-hover:scale-105 transition-transform"
                  style={{ color: b.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-sport font-black text-base italic text-white uppercase tracking-tight">
                    {b.title}
                  </h4>
                  <p className="text-xs text-[#A7ADB5] mt-1 leading-relaxed">
                    {b.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
