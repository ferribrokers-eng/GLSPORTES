import React from 'react';
import { ShieldCheck, PhoneCall, ArrowLeft, Lock } from 'lucide-react';
import { CONFIG } from '../../config';

interface Props {
  areaTitle?: string;
  isCrm?: boolean;
}

export const PreparationModeNotice: React.FC<Props> = ({ areaTitle = 'Área do Cliente', isCrm = false }) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#14161A] border border-[#1D2026] rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#58E707]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#026FF6]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-[#0A0B0D] border border-[#1D2026] flex items-center justify-center shadow-inner">
            {isCrm ? (
              <Lock className="w-8 h-8 text-[#58E707]" />
            ) : (
              <ShieldCheck className="w-8 h-8 text-[#58E707]" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-[#58E707]">
            {isCrm ? 'GL SPORTS CRM' : areaTitle}
          </span>
          <h2 className="text-2xl font-black text-white font-sport uppercase tracking-tight">
            Em breve: área do cliente em configuração
          </h2>
          <p className="text-xs sm:text-sm text-[#A7ADB5] leading-relaxed">
            Estamos integrando o sistema de gestão online da GL Sports. No momento, todos os orçamentos, pedidos e atendimentos continuam funcionando normalmente através do nosso WhatsApp oficial.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="/"
            className="w-full sm:w-auto py-3 px-5 bg-[#0A0B0D] hover:bg-[#1D2026] border border-[#1D2026] text-white text-xs font-bold uppercase rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para a Loja</span>
          </a>

          <a
            href={CONFIG.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto py-3 px-5 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] text-xs font-black uppercase rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(88,231,7,0.3)] cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 stroke-[2.5]" />
            <span>Falar no WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
