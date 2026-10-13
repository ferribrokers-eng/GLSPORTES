import React from 'react';
import { X, ShieldCheck, PhoneCall, CheckCircle2, MapPin, ExternalLink, Star, Award, Clock } from 'lucide-react';
import { CONFIG } from '../config';

interface InfoModalProps {
  type: 'sobre' | 'como-comprar' | 'contato' | 'politica' | null;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#14161A] border border-[#1D2026] rounded-3xl shadow-2xl overflow-hidden my-auto">
        
        {/* Faixa tricolor no topo do modal */}
        <div className="h-[3.5px] w-full bg-gradient-to-r from-[#58E707] via-[#026FF6] to-[#FC6602]" />

        {/* Header */}
        <div className="p-5 border-b border-[#1D2026] flex items-center justify-between bg-[#0A0B0D]">
          <div className="flex items-center gap-2">
            <h3 className="font-sport font-black text-xl italic text-white uppercase tracking-wider">
              {type === 'sobre' && 'Sobre a GL Sports • A Nº 1 do Brasil'}
              {type === 'como-comprar' && 'Como Encomendar Camisetas Personalizadas'}
              {type === 'contato' && 'Contato & Localização Oficial'}
              {type === 'politica' && 'Garantia & Produção das Peças'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#A7ADB5] hover:text-white rounded-xl hover:bg-[#1D2026] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-xs sm:text-sm text-[#A7ADB5] space-y-4 max-h-[75vh] overflow-y-auto leading-relaxed">
          {type === 'sobre' && (
            <>
              {/* Highlight Banner */}
              <div className="p-4 bg-[#0A0B0D] rounded-2xl border border-[#58E707]/30 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#58E707]/20 text-[#58E707]">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm uppercase font-sport tracking-wide">
                    A Empresa Nº 1 do Brasil • Referência no Mercado
                  </h4>
                  <p className="text-xs text-[#A7ADB5]">
                    Líder nacional na confecção de camisetas personalizadas, uniformes esportivos e sublimação total.
                  </p>
                </div>
              </div>

              <p>
                A <strong className="text-white">GL Sports</strong> consolidou-se como a <strong className="text-white">empresa número um e referência no mercado</strong> de camisetas personalizadas e vestuário esportivo. Atendemos com agilidade e compromisso times, atléticas, escolas, empresas e clientes em <strong className="text-white">todo o território brasileiro</strong>.
              </p>

              <p>
                Com sede em <strong className="text-white">Peruíbe, São Paulo</strong>, oferecemos confecção com tecido Dry-Fit tecnológico, proteção UV50+ e sublimação total digital de alta durabilidade, garantindo acabamento profissional, conforto e cores vivas.
              </p>

              {/* Avaliação 5,0 no Google */}
              <div className="p-4 bg-[#0A0B0D] rounded-2xl border border-[#1D2026] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex text-[#FC6602]">
                    {'★★★★★'.split('').map((s, i) => (
                      <span key={i} className="text-base">{s}</span>
                    ))}
                  </div>
                  <span className="font-bold text-white text-sm">{CONFIG.googleRating.text}</span>
                </div>
                <span className="text-xs text-[#A7ADB5]">
                  Avaliação máxima comprovada
                </span>
              </div>

              <div className="p-4 bg-[#0A0B0D] rounded-2xl border border-[#1D2026] space-y-2 mt-2">
                <h4 className="font-bold text-xs uppercase tracking-menu text-[#58E707]">
                  DIFERENCIAIS DE QUEM É REFERÊNCIA NACIONAL:
                </h4>
                <ul className="space-y-1.5 pl-4 list-disc text-[#A7ADB5]">
                  <li>Atendimento e suporte especializado para todo o Brasil</li>
                  <li>Arquivos 100% vetorizados em 300 DPI (CorelDraw, Photoshop e PNG)</li>
                  <li>Preço justo e acessível: R$ 2,88 por arte</li>
                  <li>Envio imediato via WhatsApp e nuvem logo após o Pix</li>
                </ul>
              </div>
            </>
          )}

          {type === 'como-comprar' && (
            <>
              <p className="text-white font-medium">Encomendar suas camisetas na GL Esportes é rápido, seguro e sem burocracia:</p>
              <ol className="space-y-3 pl-4 list-decimal text-[#A7ADB5]">
                <li>
                  <strong className="text-white">Escolha o modelo & estampa:</strong> Navegue pelo catálogo organizado por modalidades (futebol, interclasse, formandos, abadás) ou utilize a busca rápida.
                </li>
                <li>
                  <strong className="text-white">Defina a quantidade:</strong> Adicione as camisetas ao carrinho indicando a quantidade de peças que você precisa para seu time, turma ou evento.
                </li>
                <li>
                  <strong className="text-white">Preencha seus dados:</strong> Se desejar, informe nome, WhatsApp, cidade/UF e os detalhes da personalização (nomes, números e tamanhos).
                </li>
                <li>
                  <strong className="text-white">Alinhamento no WhatsApp:</strong> Nossa equipe de design recebe seu pedido diretamente no WhatsApp oficial ({CONFIG.whatsappFormatted}) e prepara o layout final com seu escudo/logo.
                </li>
                <li>
                  <strong className="text-white">Produção & Envio:</strong> Fabricamos em alta tecnologia Dry-Fit com sublimação total e enviamos diretamente para seu endereço em todo o Brasil.
                </li>
              </ol>
            </>
          )}

          {type === 'contato' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#0A0B0D] rounded-2xl border border-[#1D2026] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#58E707] tracking-wider block">
                  Atendimento para Todo o Brasil 🇧🇷
                </span>
                <h4 className="font-bold text-white text-base uppercase font-sport">
                  GL Sports • Loja Oficial
                </h4>
                <p className="text-xs text-[#A7ADB5]">
                  Loja de camisetas personalizadas em Peruíbe, São Paulo.
                </p>
              </div>

              {/* Endereço da Sede */}
              <div className="p-4 bg-[#0A0B0D] rounded-2xl border border-[#1D2026] space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#58E707] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Endereço da Sede</span>
                    <p className="text-xs text-[#A7ADB5] mt-0.5">
                      {CONFIG.address.full}
                    </p>
                  </div>
                </div>
              </div>

              {/* Telefone e WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={CONFIG.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-[#0A0B0D] hover:bg-[#1D2026] rounded-2xl border border-[#1D2026] hover:border-[#58E707] flex items-center gap-3 transition-colors text-white"
                >
                  <PhoneCall className="w-5 h-5 text-[#58E707] flex-shrink-0" />
                  <div>
                    <span className="font-bold text-xs block">WhatsApp Oficial</span>
                    <span className="text-xs text-[#A7ADB5]">{CONFIG.whatsappFormatted}</span>
                  </div>
                </a>

                <a
                  href={`tel:${CONFIG.phoneRaw}`}
                  className="p-4 bg-[#0A0B0D] hover:bg-[#1D2026] rounded-2xl border border-[#1D2026] flex items-center gap-3 transition-colors text-white"
                >
                  <PhoneCall className="w-5 h-5 text-[#026FF6] flex-shrink-0" />
                  <div>
                    <span className="font-bold text-xs block">Telefone (clicável)</span>
                    <span className="text-xs text-[#A7ADB5]">{CONFIG.whatsappFormatted}</span>
                  </div>
                </a>
              </div>

              {/* Horário */}
              <div className="p-4 bg-[#0A0B0D] rounded-2xl border border-[#1D2026] flex items-center gap-3 text-[#A7ADB5]">
                <Clock className="w-5 h-5 text-[#FC6602] flex-shrink-0" />
                <div>
                  <span className="font-bold text-white block">Horário de Atendimento</span>
                  <p className="text-xs text-[#A7ADB5] mt-0.5">
                    Segunda-feira: a partir das 08:00
                  </p>
                </div>
              </div>
            </div>
          )}

          {type === 'politica' && (
            <>
              <p className="text-white font-medium">
                Todas as artes da GL Sports acompanham licença comercial ampla para produção física:
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#58E707] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Uso Permitido:</strong> Impressão, sublimação e venda de camisetas, abadás, agasalhos, uniformes e brindes físicos em quantidade ilimitada.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#58E707] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Personalização:</strong> Você pode alterar nomes, números, patrocínios e tamanhos nos arquivos editáveis (CDR e PSD).
                  </span>
                </div>
                <div className="flex items-start gap-2 text-rose-300">
                  <span className="font-bold">❌ Proibido:</span>
                  <span>
                    Revenda, doação ou redistribuição dos arquivos digitais em plataformas de download ou redes sociais.
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1D2026] bg-[#0A0B0D] flex items-center justify-between">
          <span className="text-xs text-[#A7ADB5]">
            GL Sports • {CONFIG.nationalCoverage}
          </span>
          <button
            onClick={onClose}
            className="py-2 px-5 bg-[#14161A] hover:bg-[#1D2026] text-white font-bold text-xs uppercase rounded-xl transition-colors border border-[#1D2026] cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
