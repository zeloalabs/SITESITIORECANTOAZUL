// Conteúdo factual dos previews de design (Fase 2).
// Fontes: site em produção (principal) e `acomodacoes.md` (conferência). Nada aqui é inventado.
// Previews não gravam nada no Sanity e não usam preço, disponibilidade nem Beds24.

// exp-araucaria: o AVIF desta foto não renderiza no Chromium; usa-se a cópia JPEG da mesma biblioteca.
const JPEG = new Set(["exp-araucaria"]);
export const PH = (name: string) => `/design-previews/photos/${name}.${JPEG.has(name) ? "jpg" : "avif"}`;

export const brand = {
  name: "Sítio Recanto Azul",
  place: "Alfredo Wagner · SC",
  tagline: "Natureza, privacidade e experiências para casais e grupos",
  headline: "Um recanto para desacelerar",
  intro:
    "O Sítio Recanto Azul reúne acomodações pensadas para casais e grupos que buscam uma pausa real: hidromassagens com vista, lareiras, redes e um cenário natural que convida ao silêncio. Cada detalhe foi escolhido para transformar uma estadia em experiência.",
  introTitle: "Natureza, privacidade e tempo para o que importa",
  siteTitle: "Um cenário construído para experiências, não apenas hospedagem",
  siteText:
    "Entre mirantes, decks e trilhas, o Recanto Azul foi pensado para que cada hóspede viva a natureza de perto — do nascer ao pôr do sol.",
  manifesto: "Mais do que hospedagem, o Recanto Azul é um convite à experiência.",
  cta: "Escolha sua acomodação e reserve seu tempo de descanso.",
  ctaTitle: "Pronto para desacelerar?",
  email: "contato@sitiorecantoazul.com.br",
};

export type Stay = {
  slug: string;
  name: string;
  line: string;
  guests: string;
  detail: string;
  photos: { main: string; alt: string; focus?: string; second?: string };
};

export const stays: Stay[] = [
  {
    slug: "domo-estelar",
    name: "Domo Estelar",
    line: "Teto transparente para dormir sob as estrelas",
    guests: "Até 2 adultos e 2 crianças",
    detail: "Jacuzzi externa aquecida, banheira interna, lareira ecológica e mezanino com teto transparente.",
    photos: { main: PH("domo-cover"), alt: "Domo Estelar ao entardecer, sobre o deck", focus: "50% 72%", second: PH("domo-estrelas") },
  },
  {
    slug: "agata",
    name: "Ágata",
    line: "Hidro com vista e rede horizontal para dias lentos",
    guests: "Até 2 adultos e 2 crianças",
    detail: "Acomodação romântica com hidromassagem com vista e rede horizontal.",
    photos: { main: PH("agata-exterior"), alt: "Chalé Ágata com deck e fogueira de chão", focus: "50% 40%", second: PH("agata-cover") },
  },
  {
    slug: "mirante",
    name: "Mirante",
    line: "Hidro com vista panorâmica e rede horizontal",
    guests: "Até 2 adultos e 2 crianças",
    detail: "Acomodação romântica com hidromassagem com vista panorâmica e rede horizontal.",
    photos: { main: PH("mirante-cover"), alt: "Hidromassagem do Chalé Mirante ao pôr do sol", focus: "50% 50%", second: PH("mirante-deck") },
  },
  {
    slug: "doce-recanto",
    name: "Doce Recanto",
    line: "Hidro interna para uma estadia intimista",
    guests: "Até 2 adultos e 2 crianças",
    detail: "Acomodação romântica com hidromassagem interna.",
    photos: { main: PH("doce-janela"), alt: "Hidromassagem do Doce Recanto diante da janela", focus: "50% 55%", second: PH("doce-por-do-sol") },
  },
  {
    slug: "celeiro",
    name: "Celeiro",
    line: "Até 11 hóspedes, com jacuzzi, lareira e sinuca",
    guests: "Até 11 hóspedes",
    detail: "Acomodação para grupos com jacuzzi externa coberta, lareira, sinuca e churrasqueira.",
    photos: { main: PH("celeiro-jacuzzi"), alt: "Jacuzzi externa coberta do Celeiro com vista", focus: "50% 55%", second: PH("celeiro-fogo") },
  },
  {
    slug: "chale-para-grupos",
    name: "Chalé para Grupos",
    line: "Espaço amplo com galpão de festas e jacuzzi externa",
    guests: "Até 23 hóspedes",
    detail: "Galpão de festas completo, casa com 3 quartos e jacuzzi externa.",
    photos: { main: PH("grupos-varanda"), alt: "Varanda do Chalé para Grupos com rede e vista", focus: "50% 50%", second: PH("grupos-galpao") },
  },
];

export const experiences = [
  { name: "Mirante para o pôr do sol", text: "Um ponto alto do sítio reservado para acompanhar o fim de tarde em silêncio." },
  { name: "Deck para o nascer do sol", text: "Um deck voltado para o horizonte, ideal para começar o dia com calma." },
  { name: "Balanços pelo sítio", text: "Balanços espalhados pela propriedade, para pausas simples em meio à natureza." },
  { name: "Piquenique", text: "Um momento a dois ou em grupo, ao ar livre, cercado pela paisagem do Recanto Azul." },
  { name: "Passeio a cavalo", text: "Uma forma tranquila de conhecer mais do sítio e da paisagem ao redor." },
];

// Única avaliação publicada hoje no site em produção. Uso depende de aprovação da proprietária.
export const review = { quote: "Perfeito!!!", author: "Bruna", source: "Airbnb", when: "Setembro 2025", rating: "5/5" };

export const nav = ["Acomodações", "Extras", "Experiências", "Casamentos no sítio", "Políticas", "Localização", "Contato"];

export const fontPairs = {
  a: {
    "1": {
      label: "Cormorant Garamond + Jost",
      href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&display=swap",
      display: "'Cormorant Garamond', 'Times New Roman', serif",
      body: "'Jost', system-ui, sans-serif",
    },
    "2": {
      label: "Newsreader + Hanken Grotesk",
      href: "https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300;1,6..72,400&family=Hanken+Grotesk:wght@300;400;500&display=swap",
      display: "'Newsreader', Georgia, serif",
      body: "'Hanken Grotesk', system-ui, sans-serif",
    },
  },
  b: {
    "1": {
      label: "Instrument Serif + Inter Tight",
      href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@300;400;500&display=swap",
      display: "'Instrument Serif', Georgia, serif",
      body: "'Inter Tight', system-ui, sans-serif",
    },
    "2": {
      label: "Libre Caslon Display + DM Sans",
      href: "https://fonts.googleapis.com/css2?family=Libre+Caslon+Display&family=DM+Sans:wght@300;400;500&display=swap",
      display: "'Libre Caslon Display', Georgia, serif",
      body: "'DM Sans', system-ui, sans-serif",
    },
  },
  c: {
    "1": {
      label: "Fraunces + Figtree",
      href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,200;0,9..144,300;1,9..144,200;1,9..144,300&family=Figtree:wght@300;400;500&display=swap",
      display: "'Fraunces', Georgia, serif",
      body: "'Figtree', system-ui, sans-serif",
    },
    "2": {
      label: "Bodoni Moda + Albert Sans",
      href: "https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400&family=Albert+Sans:wght@300;400;500&display=swap",
      display: "'Bodoni Moda', Georgia, serif",
      body: "'Albert Sans', system-ui, sans-serif",
    },
  },
} as const;

export type Variant = keyof typeof fontPairs;
export const pairOf = (v: Variant, f?: string) => fontPairs[v][f === "2" ? "2" : "1"];

export function guard(): boolean {
  return process.env.NODE_ENV !== "production";
}

// Páginas individuais (D2): cada acomodação tem exatamente 4 fotos (capa + 3), para o mesmo peso visual.
export const stayGalleries: Record<string, { hero: string; focus: string; gallery: string[] }> = {
  "domo-estelar": { hero: "domo-cover", focus: "70% 88%", gallery: ["domo-estrelas", "domo-jacuzzi", "domo-vale"] },
  agata: { hero: "agata-exterior", focus: "50% 40%", gallery: ["agata-cover", "agata-deck", "agata-fachada"] },
  mirante: { hero: "mirante-cover", focus: "50% 50%", gallery: ["mirante-deck", "mirante-aerea", "mirante-sala"] },
  "doce-recanto": { hero: "doce-janela", focus: "50% 55%", gallery: ["doce-por-do-sol", "doce-exterior", "doce-cover"] },
  celeiro: { hero: "celeiro-jacuzzi", focus: "50% 55%", gallery: ["celeiro-fogo", "celeiro-sala", "celeiro-pergola"] },
  "chale-para-grupos": { hero: "grupos-varanda", focus: "50% 50%", gallery: ["grupos-vista", "grupos-galpao", "grupos-lareira"] },
};

export const stayHref = (slug: string) => `/design-previews/d2/acomodacao/${slug}`;

// Grupos de acomodação (no CMS: documento `accommodationGroup`, editável) e o WhatsApp de cada grupo.
export const groups = [
  { id: "romanticas", name: "Românticas", slugs: ["domo-estelar", "agata", "mirante", "doce-recanto"] },
  { id: "grupos", name: "Para grupos", slugs: ["celeiro", "chale-para-grupos"] },
] as const;
export const groupOf = (slug: string) => groups.find((g) => (g.slugs as readonly string[]).includes(slug));

// Comodidades: SÓ o que está confirmado em `acomodacoes.md`. A proprietária completa o resto no CMS (lista editável).
export const stayAmenities: Record<string, string[]> = {
  "domo-estelar": ["Jacuzzi externa aquecida", "Banheira interna", "Lareira ecológica", "Chuveiro duplo", "Telão e projetor", "Mezanino com teto transparente"],
  agata: ["Hidromassagem com vista", "Rede horizontal"],
  mirante: ["Hidromassagem com vista panorâmica", "Rede horizontal"],
  "doce-recanto": ["Hidromassagem interna"],
  celeiro: ["Jacuzzi externa coberta", "Lareira", "Sinuca", "Churrasqueira"],
  "chale-para-grupos": ["Galpão de festas completo", "Casa com 3 quartos", "Jacuzzi externa"],
};

// Regras de hóspedes por acomodação (no CMS: campos editáveis da acomodação). Sempre pelo menos 1 adulto.
export type GuestRules = { minAdults: number; maxAdults?: number; maxChildren?: number; maxTotal: number; hint: string };
const ROMANTICA: GuestRules = { minAdults: 1, maxAdults: 2, maxChildren: 2, maxTotal: 4, hint: "Máximo: 2 adultos e 2 crianças. Aceitamos pets sem custo extra." };
export const stayGuestRules: Record<string, GuestRules> = {
  "domo-estelar": ROMANTICA,
  agata: ROMANTICA,
  mirante: ROMANTICA,
  "doce-recanto": ROMANTICA,
  celeiro: { minAdults: 1, maxTotal: 11, hint: "Máximo: 11 hóspedes. Aceitamos pets sem custo extra." },
  "chale-para-grupos": { minAdults: 1, maxTotal: 23, hint: "Máximo: 23 hóspedes. Aceitamos pets sem custo extra." },
};

// Extras das românticas (no CMS: documentos `extra`, editáveis, referenciados pelo grupo/acomodação).
// Nomes informados pela proprietária. DESCRIÇÕES SIMULADAS (ela altera depois no Studio); sem valores nesta fase.
export type Extra = { name: string; description?: string; image: string; alt: string };
export const romanticExtras: Extra[] = [
  { name: "Decorações", description: "Decoração no quarto para aniversários, datas especiais e momentos a dois.", image: "/design-previews/extras/decoracao.jpg", alt: "Cama com decoração de pétalas, balão em formato de coração e flores" },
  { name: "Pedidos de casamento", description: "Cenário preparado no quarto para fazer o pedido.", image: "/design-previews/extras/pedido.jpg", alt: "Cama decorada com a frase “Casa comigo” em letras luminosas e pétalas" },
  { name: "Café da manhã", description: "Café da manhã servido para começar o dia sem pressa.", image: "/design-previews/extras/cafe.jpg", alt: "Mesa de café da manhã vista de cima" },
];
export const stayExtras: Record<string, Extra[]> = {
  "domo-estelar": romanticExtras,
  agata: romanticExtras,
  mirante: romanticExtras,
  "doce-recanto": romanticExtras,
  celeiro: [],
  "chale-para-grupos": [],
};

// Motor de reservas da Beds24 (página pública de reserva; o site só abre o link, nunca cria reserva). propId do mapeamento.
export const BOOKING_ENGINE = "https://beds24.com/booking2.php?propid=357738&referer=site-v2";

// Contatos de WhatsApp (no CMS: `whatsappContact`). Casamentos usa o mesmo número de "Para grupos", com mensagem própria.
export const waContacts = [
  { id: "romanticas", name: "Românticas" },
  { id: "grupos", name: "Para grupos" },
  { id: "casamentos", name: "Casamentos" },
] as const;

export const MAPS_URL = "https://www.google.com/maps/place/sitio+recanto+azul/data=!4m2!3m1!1s0x952089648e85adf1:0x40c0563dd95106c1";
export const MAPS_EMBED = "https://maps.google.com/maps?cid=4665824037594793665&hl=pt-BR&z=14&output=embed";

const D2 = "/design-previews/d2";
export const siteLinks = {
  extras: `${D2}/extras`,
  experiencias: `${D2}/experiencias`,
  casamentos: `${D2}/casamentos`,
  politicas: `${D2}/politicas`,
  localizacao: `${D2}#localizacao`,
  home: D2,
};
