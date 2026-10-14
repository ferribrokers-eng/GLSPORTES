/**
 * GL Sports - Identidade Visual Oficial & Configurações da Marca
 * Loja de camisetas personalizadas em Peruíbe, São Paulo. Atendemos todo o Brasil.
 */

export const CONFIG = {
  storeName: "GL Sports",
  logoUrl: "https://cdn.jsdelivr.net/gh/ferribrokers-eng/claude@371be0c/gl-sports/marca/logo-gl-sports.png",
  sinceYear: "2015",
  marketPosition: "Empresa Nº 1 do Brasil • Referência no Mercado",
  tagline: "Mais que um esporte, um estilo de vida",
  heroSubtitle: "Camisetas e uniformes personalizados para times, escolas, eventos e empresas. Sede em Peruíbe/SP. Atendemos todo o Brasil.",
  nationalCoverage: "Peruíbe/SP · Atendemos todo o Brasil",
  city: "Peruíbe",
  state: "SP",

  // NÚMERO DO WHATSAPP & TELEFONE OFICIAL
  whatsappNumber: "5513997011514",
  whatsappFormatted: "(13) 99701-1514",
  phoneRaw: "+5513997011514",
  whatsappUrl: "https://wa.me/5513997011514",

  // ENDEREÇO OFICIAL
  address: {
    street: "R. Tulipas Vermelhas, 175",
    neighborhood: "Jardim das Flores",
    city: "Peruíbe",
    state: "SP",
    cep: "11770-610",
    full: "R. Tulipas Vermelhas, 175, Jardim das Flores, Peruíbe, SP, 11770-610",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=GL+Sports+R.+Tulipas+Vermelhas+175+Peruibe+SP",
  },

  // HORÁRIOS DE ATENDIMENTO
  openingHours: {
    segunda: "A partir das 08:00",
    terca: "preencher", // preencher
    quarta: "preencher", // preencher
    quinta: "preencher", // preencher
    sexta: "preencher", // preencher
    sabado: "preencher", // preencher
    domingo: "preencher", // preencher
  },

  // AVALIAÇÃO GOOGLE
  googleRating: {
    score: "5,0",
    stars: 5,
    text: "5,0 no Google",
    verified: true,
  },

  // URLs oficiais do catálogo com 2.262 produtos
  primaryCatalogUrl: "https://cdn.jsdelivr.net/gh/ferribrokers-eng/claude@2bb6da8/gl-sports/catalogo.json",
  fallbackCatalogUrl: "https://cdn.jsdelivr.net/gh/ferribrokers-eng/claude@2bb6da8/gl-sports/catalogo.json",

  // TOKENS DA PALETA OFICIAL GL SPORTS
  colors: {
    preto: "#0A0B0D",      // Fundo do site
    grafite: "#14161A",    // Cards, cabeçalho, gavetas e menus
    grafite2: "#1D2026",   // Bordas, hover dos cards, campos
    verde: "#58E707",      // Cor principal: botões de comprar, preços, destaques
    azul: "#026FF6",       // Cor secundária: links e botões secundários
    laranja: "#FC6602",    // Cor de destaque: selos "Novo" e "Mais vendido", detalhes
    ciano: "#10C6EE",      // Só brilhos e realces (glow), nunca em texto
    branco: "#FFFFFF",     // Títulos
    texto2: "#A7ADB5",     // Textos secundários
  },

  // Gradiente tricolor da marca
  tricolorGradient: "linear-gradient(90deg, #58E707 0%, #026FF6 50%, #FC6602 100%)",

  // Redes sociais e contatos
  social: {
    instagram: "https://instagram.com/glsportscamisetas",
    instagramHandle: "@glsportscamisetas",
    email: "contato@glsports.com.br",
  },

  // Informações de entrega e formato dos arquivos
  fileSpecs: {
    formats: "PNG, CDR, PDF, PSD (Alta Resolução 300 DPI)",
    delivery: "Download Imediato e suporte via WhatsApp para todo o Brasil",
    usage: "Livre para sublimação e confecção de peças físicas",
  },

  // SLIDES DO BANNER PRINCIPAL (HERO)
  // DIMENSÕES RECOMENDADAS PARA AS IMAGENS:
  // - Proporção: 16:9 (Widescreen)
  // - Resolução Ideal: 1920 x 1080 px (Full HD) ou 2560 x 1440 px (2K)
  // - Resolução Mínima: 1600 x 900 px
  // - Formato: WebP ou JPG otimizado (~150 KB a 350 KB)
  // - Dica de Design: Mantenha a ação/tema visual principal no lado direito ou centro-direita,
  //   pois os textos, botões e selos ficam alinhados à esquerda com degradê escuro protetor.
  heroSlides: [
    {
      id: 'referencia',
      badge: 'REFERÊNCIA NACIONAL NO MERCADO',
      tag: 'CAMISETAS PERSONALIZADAS',
      title: 'A EMPRESA Nº 1 DO BRASIL EM CAMISETAS PERSONALIZADAS',
      subtitle: 'Artes em 300 DPI vetorizadas prontas para sublimação total. Uniformes de futebol, ciclismo, vôlei de praia, beach tennis, artes marciais e abadás.',
      category: 'futebol',
      accentColor: '#58E707', // Verde Oficial
      bgImage: '/hero/slide-referencia.jpg',
      objectPositionDesktop: 'center right',
      objectPositionMobile: 'center center', // Conforme solicitado: a primeira mantém o enquadramento mobile
    },
    {
      id: 'futebol',
      badge: 'UNIFORMES DE FUTEBOL E TIMES PROFISSIONAIS',
      tag: 'FUTEBOL & TIMES',
      title: 'UNIFORMES DE FUTEBOL E TIMES PROFISSIONAIS',
      subtitle: 'Mais de 2.000 modelos profissionais em alta resolução prontos para sublimar. Vista seu time com a mesma qualidade dos clubes de elite.',
      category: 'futebol',
      accentColor: '#026FF6', // Azul Oficial
      bgImage: '/hero/slide-futebol.jpg',
      objectPositionDesktop: 'right top',
      objectPositionMobile: 'center top', // Foco nas pessoas, uniformes e cabeças sem corte
    },
    {
      id: 'ciclismo',
      badge: 'ALTA PERFORMANCE EM DUAS RODAS • CICLISMO PROFISSIONAL',
      tag: 'CICLISMO & BIKE',
      title: 'CAMISETA DE CICLISMO PARA SUA EQUIPE DE CICLISMO',
      subtitle: 'Modelos de alta tecnologia para sua equipe de ciclismo, pelotão, grupos de pedal e mountain bike. Tecidos com proteção UV50+, zíper inteligente e secagem rápida.',
      category: 'esportes',
      accentColor: '#FC6602', // Laranja Oficial
      bgImage: '/hero/slide-ciclismo.jpg',
      objectPositionDesktop: '85% top', // Ciclistas alinhados à direita do topo para baixo
      objectPositionMobile: 'center top', // No mobile: foco nos ciclistas e camisas, cabeças 100% visíveis
    },
    {
      id: 'jiujitsu',
      badge: 'JIU-JITSU, RASH GUARDS & ARTES MARCIAIS',
      tag: 'JIU-JITSU & ARTES MARCIAIS',
      title: 'JIU-JITSU, RASH GUARDS E ARTES MARCIAIS',
      subtitle: 'Modelos exclusivos de rash guards, bermudas fight wear e uniformes personalizados em 300 DPI para academias, equipes de jiu-jitsu, muay thai e MMA com máxima resistência.',
      category: 'artes-marciais',
      accentColor: '#FC6602', // Laranja Oficial
      bgImage: '/hero/slide-jiujitsu.jpg',
      objectPositionDesktop: 'right top',
      objectPositionMobile: 'center top',
    },
    {
      id: 'volei-praia',
      badge: 'UNIFORMES DE AREIA • TIME DE VÔLEI DE PRAIA',
      tag: 'VÔLEI DE PRAIA',
      title: 'CAMISETAS E UNIFORMES PARA O SEU TIME DE VÔLEI DE PRAIA',
      subtitle: 'Regatas, tops e bermudas ultra leves com proteção solar UV50+ e tecnologia antitranspirante. Estampas vibrantes para o seu time de vôlei de praia, duplas e torneios de areia.',
      category: 'esportes',
      accentColor: '#026FF6', // Azul Oficial
      bgImage: '/hero/slide-volei-praia.jpg',
      objectPositionDesktop: 'right top',
      objectPositionMobile: 'center top',
    },
    {
      id: 'beach-tennis',
      badge: 'A MODALIDADE DO MOMENTO • BEACH TENNIS',
      tag: 'BEACH TENNIS',
      title: 'CAMISETAS E UNIFORMES DE BEACH TENNIS',
      subtitle: 'Conforto e liberdade total de movimento para sua arena, duplas e torneios. Estampas exclusivas em tecido Dry Fit tecnológico com proteção solar e secagem rápida.',
      category: 'esportes',
      accentColor: '#58E707', // Verde Oficial
      bgImage: '/hero/slide-beach-tennis.jpg',
      objectPositionDesktop: 'right top',
      objectPositionMobile: 'center top',
    },
    {
      id: 'abadas',
      badge: 'ABADÁS E EVENTOS EM TODO O BRASIL',
      tag: 'FESTAS & EVENTOS',
      title: 'ABADÁS E CAMISETAS PARA BLOCOS & CARNAVAL',
      subtitle: 'Produza seus abadás de micaretas, confraternizações e eventos com entrega rápida, tecidos leves e cores vibrantes.',
      category: 'abadas',
      accentColor: '#58E707', // Verde Oficial
      bgImage: '/hero/slide-abadas.jpg',
      objectPositionDesktop: 'right top',
      objectPositionMobile: 'center top',
    },
  ],
};

// Supabase Configuration (Chaves públicas da GL Sports)
export const SUPABASE_URL = "https://jzyogacfnhcwmzeypeoa.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_l81hG2lP2GPrxAhBTmfhQA_NpZCwTZY";
