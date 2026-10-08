// Conteúdo-base (RASCUNHO editável) no formato dos documentos do Sanity.
// Fontes: site V1 em produção, previews D2 e docs do projeto. Nada de preço, comodidade ou política inventada.
// Dois usos: (1) fallback em desenvolvimento/dataset ainda vazio (consultado com a MESMA GROQ via groq-js);
// (2) importação no Sanity por `scripts/seed-sanity.mts` (só com autorização e token de escrita).
// Fotos NÃO fazem parte da seed: o que não tem foto no CMS vira placeholder identificável.

export type SeedDoc = { _id: string; _type: string; [key: string]: unknown };

const ref = (id: string) => ({ _type: "reference", _ref: id });
const slug = (s: string) => ({ _type: "slug", current: s });
let k = 0;
const key = (prefix: string) => `${prefix}${++k}`;

const PETS = "Aceitamos pets sem custo extra.";
const ROMANTICA = { minAdults: 1, maxAdults: 2, maxChildren: 2, maxGuests: 4, capacity: 4, capacityLabel: "Até 2 adultos e 2 crianças", guestHint: `Máximo: 2 adultos e 2 crianças. ${PETS}` };

type StaySeed = {
  slug: string;
  name: string;
  group: "romanticas" | "grupos";
  order: number;
  tagline: string;
  detail: string;
  amenities: string[];
  roomId: number;
  occupancy: number;
  guests: typeof ROMANTICA | { minAdults: number; maxGuests: number; capacity: number; capacityLabel: string; guestHint: string };
};

const stays: StaySeed[] = [
  {
    slug: "domo-estelar", name: "Domo Estelar", group: "romanticas", order: 0, roomId: 737429, occupancy: 2, guests: ROMANTICA,
    tagline: "Teto transparente para dormir sob as estrelas",
    detail: "Um mezanino com teto transparente para dormir sob o céu, jacuzzi externa aquecida, banheira interna e lareira ecológica.",
    amenities: ["Jacuzzi externa aquecida", "Banheira interna", "Lareira ecológica", "Chuveiro duplo", "Telão e projetor", "Mezanino com teto transparente"],
  },
  {
    slug: "agata", name: "Ágata", group: "romanticas", order: 1, roomId: 737422, occupancy: 2, guests: ROMANTICA,
    tagline: "Hidromassagem com vista e rede horizontal para dias lentos",
    detail: "Acomodação romântica pensada para quem busca sossego: hidromassagem com vista e uma rede horizontal para tardes sem pressa.",
    amenities: ["Hidromassagem com vista", "Rede horizontal"],
  },
  {
    slug: "mirante", name: "Mirante", group: "romanticas", order: 2, roomId: 737427, occupancy: 2, guests: ROMANTICA,
    tagline: "Hidromassagem com vista panorâmica e rede horizontal",
    detail: "Acomodação romântica com hidromassagem de vista panorâmica e rede horizontal, para acompanhar o fim de tarde com calma.",
    amenities: ["Hidromassagem com vista panorâmica", "Rede horizontal"],
  },
  {
    slug: "doce-recanto", name: "Doce Recanto", group: "romanticas", order: 3, roomId: 737430, occupancy: 2, guests: ROMANTICA,
    tagline: "Hidromassagem interna para uma estadia intimista",
    detail: "Acomodação romântica e intimista, com hidromassagem interna, para uma pausa a dois.",
    amenities: ["Hidromassagem interna"],
  },
  {
    slug: "celeiro", name: "Celeiro", group: "grupos", order: 0, roomId: 737433, occupancy: 11,
    guests: { minAdults: 1, maxGuests: 11, capacity: 11, capacityLabel: "Até 11 hóspedes", guestHint: `Máximo: 11 hóspedes. ${PETS}` },
    tagline: "Até 11 hóspedes, com jacuzzi, lareira e sinuca",
    detail: "Ponto de encontro para grupos maiores: jacuzzi externa coberta, lareira, sinuca e churrasqueira.",
    amenities: ["Jacuzzi externa coberta", "Lareira", "Sinuca", "Churrasqueira"],
  },
  {
    slug: "chale-para-grupos", name: "Chalé para Grupos", group: "grupos", order: 1, roomId: 737435, occupancy: 6,
    guests: { minAdults: 1, maxGuests: 20, capacity: 20, capacityLabel: "Até 20 hóspedes", guestHint: `Máximo: 20 hóspedes. ${PETS}` },
    tagline: "Espaço amplo com galpão de festas e jacuzzi externa",
    detail: "Casa com 3 quartos e galpão de festas completo, para reunir família e amigos, com jacuzzi externa para relaxar.",
    amenities: ["Galpão de festas completo", "Casa com 3 quartos", "Jacuzzi externa"],
  },
];

const wa = (id: string, label: string, message: string, order: number, extra: Record<string, unknown> = {}): SeedDoc => ({
  _id: `whatsappContact-${id}`, _type: "whatsappContact", key: id, label, message, order, ...extra,
});

export const seedDocuments: SeedDoc[] = [
  {
    _id: "siteSettings", _type: "siteSettings",
    siteName: "Sítio Recanto Azul",
    tagline: "Natureza, privacidade e experiências para casais e grupos",
    place: "Alfredo Wagner · SC",
    email: "sitiorecantoazulsc@gmail.com",
    instagramUrl: "https://www.instagram.com/sitiorecantoazul/",
    // Link oficial do Maps. Endereço postal ainda não confirmado: `address` fica vazio (nada é inventado).
    mapsUrl: "https://maps.app.goo.gl/7PnFkeAq9G3v4pa99?g_st=ic",
    mapsEmbedUrl: "https://maps.google.com/maps?cid=4665824037594793665&hl=pt-BR&z=14&output=embed",
    galleryInitial: 8,
    seoTitle: "Sítio Recanto Azul — hospedagem em Alfredo Wagner, SC",
    seoDescription: "Chalés e domo com hidromassagem, natureza e privacidade para casais e grupos em Alfredo Wagner, Santa Catarina.",
    beds24PropertyId: 357738,
    beds24Referer: "site-v2",
  },
  // Números oficiais (55 + DDD + número). Casamentos herda o de Para grupos. Editáveis no Studio (`whatsappContact`).
  wa("romanticas", "Românticas", "Olá! Tenho interesse em uma acomodação romântica do Sítio Recanto Azul.", 0, { number: "5548988445797" }),
  wa("grupos", "Para grupos", "Olá! Tenho interesse em uma acomodação para grupos do Sítio Recanto Azul.", 1, { number: "5548996620808" }),
  wa("casamentos", "Casamentos", "Olá! Quero conversar sobre um casamento no Sítio Recanto Azul.", 2, { numberFrom: ref("whatsappContact-grupos") }),
  { _id: "accommodationGroup-romanticas", _type: "accommodationGroup", name: "Românticas", slug: slug("romanticas"), order: 0, showOnHome: true, whatsapp: ref("whatsappContact-romanticas") },
  { _id: "accommodationGroup-grupos", _type: "accommodationGroup", name: "Para grupos", slug: slug("grupos"), order: 1, showOnHome: true, whatsapp: ref("whatsappContact-grupos") },
  ...stays.map((s): SeedDoc => ({
    _id: `accommodation-${s.slug}`, _type: "accommodation",
    name: s.name, slug: slug(s.slug), group: ref(`accommodationGroup-${s.group}`), order: s.order,
    tagline: s.tagline, detail: s.detail, amenities: s.amenities,
    capacityLabel: s.guests.capacityLabel, capacity: s.guests.capacity,
    minAdults: s.guests.minAdults, maxGuests: s.guests.maxGuests,
    ...("maxAdults" in s.guests ? { maxAdults: s.guests.maxAdults, maxChildren: s.guests.maxChildren } : {}),
    guestHint: s.guests.guestHint,
    beds24RoomId: s.roomId, ocupacaoReferencia: s.occupancy,
  })),
  { _id: "extra-decoracoes", _type: "extra", name: "Decorações", description: "Decoração no quarto para aniversários, datas especiais e momentos a dois.", order: 0, groups: [ref("accommodationGroup-romanticas")] },
  { _id: "extra-pedidos", _type: "extra", name: "Pedidos de casamento", description: "Cenário preparado no quarto para fazer o pedido.", order: 1, groups: [ref("accommodationGroup-romanticas")] },
  { _id: "extra-cafe", _type: "extra", name: "Café da manhã", description: "Café da manhã servido para começar o dia sem pressa.", order: 2, groups: [ref("accommodationGroup-romanticas")] },
  ...[
    ["mirante-por-do-sol", "Mirante para o pôr do sol", "Um ponto alto do sítio reservado para acompanhar o fim de tarde em silêncio."],
    ["deck-nascer-do-sol", "Deck para o nascer do sol", "Um deck voltado para o horizonte, ideal para começar o dia com calma."],
    ["balancos", "Balanços pelo sítio", "Balanços espalhados pela propriedade, para pausas simples em meio à natureza."],
    ["piquenique", "Piquenique", "Um momento a dois ou em grupo, ao ar livre, cercado pela paisagem do Recanto Azul."],
    ["passeio-a-cavalo", "Passeio a cavalo", "Uma forma tranquila de conhecer mais do sítio e da paisagem ao redor."],
  ].map(([id, name, text], i): SeedDoc => ({ _id: `experience-${id}`, _type: "experience", name, text, order: i, showOnHome: true })),
  {
    _id: "review-bruna-airbnb", _type: "review", quote: "Perfeito!!!", author: "Bruna", source: "Airbnb", when: "setembro de 2025",
    approved: true, featured: true,
  },
  ...[
    ["Como faço para reservar?", "Use o botão “Reservar” em qualquer página para abrir o nosso motor de reservas, ou fale com a gente pelo WhatsApp."],
    ["Qual o horário de check-in e check-out?", "Os horários são informados no momento da confirmação da reserva."],
    ["O sítio aceita animais de estimação?", PETS],
    ["Existe um número mínimo de noites?", "As condições variam conforme a temporada e são informadas no momento da reserva."],
  ].map(([question, answer], i): SeedDoc => ({ _id: `faq-${i + 1}`, _type: "faq", question, answer, order: i })),
  {
    _id: "policy-privacidade", _type: "policy", title: "Política de privacidade", anchor: slug("privacidade"), order: 0,
    body: "Este site não possui formulários nem área de cadastro: não coletamos dados pessoais diretamente por ele.\n\nO mapa só é carregado quando você clica em “Ver mapa”; nesse momento o Google pode usar cookies. Ao abrir o WhatsApp ou o motor de reservas (Beds24), você passa a ser atendido por esses serviços, que têm as suas próprias políticas de privacidade.\n\nPara dúvidas sobre dados pessoais, escreva para sitiorecantoazulsc@gmail.com.",
  },
  {
    _id: "policy-hospedagem", _type: "policy", title: "Política de hospedagem", anchor: slug("hospedagem"), order: 1,
    body: "A capacidade de cada acomodação é informada na sua página: as românticas recebem até 2 adultos e 2 crianças, o Celeiro até 11 hóspedes e o Chalé para Grupos até 20 hóspedes.\n\nAceitamos pets sem custo extra.\n\nOs horários de check-in e check-out, as regras de cancelamento e as demais condições são informados no momento da confirmação da reserva.",
  },
  {
    _id: "policy-pagamento", _type: "policy", title: "Formas de pagamento", anchor: slug("pagamento"), order: 2,
    body: "As formas de pagamento disponíveis são informadas no momento da reserva, no motor de reservas ou pelo atendimento no WhatsApp.",
  },
  // ---------- páginas ----------
  {
    _id: "page-home", _type: "page", title: "Home", slug: slug("home"),
    sections: [
      { _key: key("s"), _type: "hero", title: "Um recanto para desacelerar", text: "Natureza, privacidade e experiências para casais e grupos.", showSearch: true },
      {
        _key: key("s"), _type: "intro", title: "Natureza, privacidade e tempo para o que importa",
        text: "O Sítio Recanto Azul reúne acomodações pensadas para casais e grupos que buscam uma pausa real.",
        facts: ["Pets sem custo extra"],
        photos: [{ _key: key("p"), caption: "Chalé Mirante" }, { _key: key("p"), caption: "Passeio a cavalo" }],
      },
      { _key: key("s"), _type: "acomodacoes", title: "Acomodações" },
      {
        _key: key("s"), _type: "blocosDestaque", title: "Extras e casamentos",
        tiles: [
          { _key: key("t"), title: "Extras", text: "Decorações, pedidos de casamento e café da manhã.", href: "/extras" },
          { _key: key("t"), title: "Casamentos", text: "Fale com a gente sobre o seu casamento.", href: "/casamentos" },
        ],
      },
      { _key: key("s"), _type: "fotoCheia", caption: "Vista a partir do Chalé para Grupos" },
      { _key: key("s"), _type: "experienciasBloco", title: "Experiências", lead: "Viva o Recanto Azul além da hospedagem.", onlyHome: true, linkLabel: "Ver todas as experiências", linkHref: "/experiencias" },
      { _key: key("s"), _type: "localizacao", title: "Localização", note: "O endereço completo e o trajeto estão no Google Maps." },
      { _key: key("s"), _type: "depoimento" },
      { _key: key("s"), _type: "chamadaFinal", title: "Escolha sua acomodação" },
    ],
    seoTitle: "Sítio Recanto Azul — hospedagem em Alfredo Wagner, SC",
    seoDescription: "Chalés e domo com hidromassagem, natureza e privacidade para casais e grupos em Alfredo Wagner, Santa Catarina.",
  },
  {
    _id: "page-acomodacoes", _type: "page", title: "Acomodações", slug: slug("acomodacoes"),
    sections: [
      { _key: key("s"), _type: "cabecalhoPagina", title: "Acomodações", lead: "Chalés e domo para casais, e espaços amplos para grupos." },
      { _key: key("s"), _type: "acomodacoes", title: "Escolha onde ficar" },
    ],
    seoTitle: "Acomodações", seoDescription: "Domo Estelar, Ágata, Mirante, Doce Recanto, Celeiro e Chalé para Grupos em Alfredo Wagner, SC.",
  },
  {
    _id: "page-extras", _type: "page", title: "Extras", slug: slug("extras"),
    sections: [
      { _key: key("s"), _type: "cabecalhoPagina", title: "Extras", lead: "Para tornar a estadia ainda mais especial, nas acomodações românticas." },
      { _key: key("s"), _type: "extrasLista", whatsappKey: "romanticas" },
    ],
    seoTitle: "Extras", seoDescription: "Decorações, pedidos de casamento e café da manhã nas acomodações românticas do Sítio Recanto Azul.",
  },
  {
    _id: "page-experiencias", _type: "page", title: "Experiências", slug: slug("experiencias"),
    sections: [
      { _key: key("s"), _type: "cabecalhoPagina", title: "Experiências", lead: "Viva o Recanto Azul além da hospedagem." },
      { _key: key("s"), _type: "experienciasBloco", title: "No sítio", onlyHome: false },
    ],
    seoTitle: "Experiências", seoDescription: "Pôr do sol no mirante, balanços, piquenique e passeio a cavalo no Sítio Recanto Azul.",
  },
  {
    _id: "page-casamentos", _type: "page", title: "Casamentos", slug: slug("casamentos"),
    sections: [
      { _key: key("s"), _type: "cabecalhoPagina", title: "Casamentos", lead: "Fale com a gente sobre o seu casamento.", whatsappKey: "casamentos", whatsappLabel: "Falar pelo WhatsApp" },
      {
        _key: key("s"), _type: "textoComFoto", title: "O sítio para o seu casamento",
        body: "O Recanto Azul reúne espaços pensados para grupos e celebrações, como o galpão de festas do Chalé para Grupos e o pergolado de vidro do Celeiro, em meio à natureza de Alfredo Wagner.\n\nConte para a gente a data, o número de convidados e o que você imagina para o seu dia. Respondemos pelo WhatsApp com as possibilidades.",
      },
    ],
    seoTitle: "Casamentos no sítio", seoDescription: "Converse com o Sítio Recanto Azul sobre o seu casamento em Alfredo Wagner, SC.",
  },
  {
    _id: "page-politicas", _type: "page", title: "Políticas", slug: slug("politicas"),
    sections: [
      { _key: key("s"), _type: "cabecalhoPagina", title: "Políticas", lead: "Privacidade, hospedagem e formas de pagamento." },
      { _key: key("s"), _type: "politicasLista" },
    ],
    seoTitle: "Políticas",
  },
  {
    _id: "page-faq", _type: "page", title: "Perguntas frequentes", slug: slug("faq"),
    sections: [
      { _key: key("s"), _type: "cabecalhoPagina", title: "Perguntas frequentes", lead: "Dúvidas sobre reservas e estadia." },
      { _key: key("s"), _type: "faqLista" },
    ],
    seoTitle: "Perguntas frequentes",
  },
  {
    _id: "page-contato", _type: "page", title: "Contato", slug: slug("contato"),
    sections: [
      { _key: key("s"), _type: "cabecalhoPagina", title: "Contato", lead: "Fale com a gente para tirar dúvidas ou planejar a sua estadia." },
      { _key: key("s"), _type: "contatoBloco", title: "Fale com a gente" },
    ],
    seoTitle: "Contato",
  },
  {
    _id: "page-localizacao", _type: "page", title: "Localização", slug: slug("localizacao"),
    sections: [
      { _key: key("s"), _type: "cabecalhoPagina", title: "Localização", lead: "Alfredo Wagner, Santa Catarina." },
      { _key: key("s"), _type: "localizacao", title: "Como chegar", note: "O endereço completo e o trajeto estão no Google Maps." },
    ],
    seoTitle: "Localização",
  },
];
