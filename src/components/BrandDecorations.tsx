import React from 'react';

/**
 * Pinceladas de tinta diagonais e respingos nas cores oficiais:
 * Verde (#58E707), Azul (#026FF6) e Laranja (#FC6602)
 * Renderizado puramente via SVG vetorial de alta definição.
 */
export const BrushStrokes: React.FC<{ className?: string; opacity?: number }> = ({
  className = '',
  opacity = 0.85,
}) => {
  return (
    <svg
      viewBox="0 0 600 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <defs>
        {/* Glow filter suave */}
        <filter id="brush-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Pincelada 1: Azul vibrante (#026FF6) */}
      <path
        d="M-40 220 C 80 180, 240 140, 520 60 C 560 50, 580 65, 540 85 C 380 140, 180 210, -20 270 Z"
        fill="#026FF6"
        opacity="0.8"
        filter="url(#brush-glow)"
      />

      {/* Pincelada 2: Verde principal (#58E707) */}
      <path
        d="M20 280 C 140 220, 310 160, 580 90 C 610 80, 620 100, 580 120 C 360 185, 180 260, 40 315 Z"
        fill="#58E707"
        opacity="0.9"
        filter="url(#brush-glow)"
      />

      {/* Pincelada 3: Laranja de destaque (#FC6602) */}
      <path
        d="M-10 160 C 110 120, 260 90, 490 30 C 520 20, 540 40, 500 55 C 320 105, 160 160, 10 210 Z"
        fill="#FC6602"
        opacity="0.75"
        filter="url(#brush-glow)"
      />

      {/* Respingos / Splatters estilizados */}
      <circle cx="120" cy="90" r="5" fill="#58E707" opacity="0.85" />
      <circle cx="145" cy="70" r="3" fill="#58E707" opacity="0.7" />
      <circle cx="480" cy="150" r="6" fill="#026FF6" opacity="0.8" />
      <circle cx="510" cy="180" r="3.5" fill="#FC6602" opacity="0.8" />
      <circle cx="280" cy="40" r="4.5" fill="#FC6602" opacity="0.75" />
      <circle cx="340" cy="240" r="4" fill="#58E707" opacity="0.7" />
    </svg>
  );
};

/**
 * Arcos do logo: um arco duplo verde e azul com brilho (glow),
 * como elemento decorativo oficial atrás do logo no hero e na página do produto.
 */
export const LogoArcs: React.FC<{
  className?: string;
  size?: number;
}> = ({ className = '', size = 320 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 320 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <defs>
        <filter id="arc-glow-green" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="arc-glow-blue" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Arco Azul (#026FF6) externo */}
      <path
        d="M 60 260 A 130 130 0 1 1 260 260"
        stroke="#026FF6"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="18 10"
        opacity="0.85"
        filter="url(#arc-glow-blue)"
      />

      {/* Arco Verde (#58E707) interno */}
      <path
        d="M 80 240 A 105 105 0 1 1 240 240"
        stroke="#58E707"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.95"
        filter="url(#arc-glow-green)"
      />

      {/* Toque Laranja sutil na ponta */}
      <circle cx="260" cy="260" r="6" fill="#FC6602" opacity="0.9" />
      <circle cx="60" cy="260" r="6" fill="#58E707" opacity="0.9" />
    </svg>
  );
};
