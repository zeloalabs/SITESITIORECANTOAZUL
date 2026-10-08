# Site V2 — Fase 2: Design e páginas (plano)

Data: 2026-10-01 · Status: **aprovado com ajustes; previews A/B/C → D → D2 em andamento (somente UI/UX)** · Branch: `v2` (base `3dc5866`)

Fonte da verdade: `docs/superpowers/specs/2026-10-01-site-v2-design.md` (§5, §8, §9, §11 Fase 2).
Este plano é enxuto e em dois níveis: a Etapa 2 (propostas) está detalhada; as etapas seguintes dependem da direção
escolhida e serão detalhadas (tasks TDD passo a passo) logo após a escolha, num adendo a este arquivo.

## Decisões já fechadas (não serão redecididas)

1. Stack e arquitetura da Fase 1 intactas: Next.js App Router via vinext no Cloudflare Workers Free, Workers Cache na
   borda, Sanity (Studio hospedado, Presentation/edição visual, `<SanityLive />` só em Draft Mode), purge por webhook.
2. Rotas fixas (§4): `/`, `/acomodacoes`, `/acomodacoes/[slug]`, `/experiencias`, `/sobre`, `/localizacao`, `/faq`,
   `/politicas`, `/contato`, `/[slug]`. PT sem prefixo, estrutura pronta para `/en`.
3. Conteúdo só do Sanity; nenhum campo de preço no CMS. Page builder com as 16 seções do §5; editora controla
   conteúdo e variantes limitadas, não layout livre.
4. Direção visual (§8): editorial boutique (Tide / Stay); da Riviera Palace só faixa escura de depoimentos e rodapé
   escuro. Azul-marinho da logo + neutros quentes; laranja nunca na interface. Serifada fina + sans limpa; rótulos
   pequenos em caixa alta espaçada. Traço da serra com araucárias como divisor. Proibido: fileira de ícones
   genéricos, grade de Instagram, cards brancos iguais em linha.
5. Fotos só do sítio, cópias da Biblioteca Oficial; cada acomodação usa só as próprias fotos. Imagens servidas pelo
   CDN do Sanity (não por `public/`).
6. Conteúdo factual: `acomodacoes.md` da direção de marca é o teto. Nada de comodidade, vista, material ou
   avaliação inventada. Textos vêm do site em produção / Supabase antigo (somente leitura), não do seed do repo.
7. Movimento (§9): hero com zoom lento 1 → 1,06 em ~20 s; parallax ~6%; efeitos 01, 02, 04, 05, 07 e 22 reescritos
   como componentes React; só `transform`/`opacity`/`clip-path`; roda só visível; `prefers-reduced-motion` = estático;
   no máximo um efeito pesado por tela.
8. Beds24 na Fase 2: só `bookingUrl` sem datas (`propid`, `roomid`, `referer`), `PRICES_ENABLED=false`, todos os
   cards com "Consultar disponibilidade" + WhatsApp. Nenhuma página chama a Beds24.
9. Fora da Fase 2 (Fase 3): pricing, disponibilidade, `/api/quote`, "a partir de", cron, motor de busca, links com
   datas.
10. Git: nada em `main`, DNS ou produção. Trabalho em `v2` ou branches curtas com merge em `v2`. Push só com pedido.
11. Qualidade: TDD; revisão visual em 390, 430, 768 e 1440 px; WCAG AA; Lighthouse ≥ 95; LCP < 2,0 s em 4G; CLS ≈ 0.

## Conflitos e pendências encontrados no estado atual

- **Protótipos não commitados na `v2`** (`src/app/previews/{a,b,c}`, `src/app/previews/data.ts`,
  `scripts/capture-previews.mts`, `public/images/oficial/*`, `public/images/previews/*`, criados em 2026-10-01
  ~21:50). Problemas: texto inventado ("madeira nobre", "ponto mais alto da encosta", "cozinha de fazenda",
  "iluminação cênica"); Celeiro com jacuzzi "aquecida" (fonte diz "coberta"); depoimento fabricado
  ("Avaliação Verificada"); dados fixos no código e fotos em `public/`. O texto não pode ser aproveitado. Aproveitar
  ou descartar as ideias visuais é decisão da proprietária. Este plano não usa nem apaga esses arquivos.
- **Trechos de referência dos efeitos 01/02/04/05/07/22** não foram encontrados no disco. A proprietária precisa
  indicar a fonte (ou aceitar reinterpretação a partir da descrição).
- **Lighthouse CI** está na spec mas não foi configurado na Fase 1.
- **CPU do Worker** precisa ser re-medida com a Home real (`docs/infra-medicoes.md`, "Pontos de atenção").

## Etapas

### Etapa 1 — Insumos (somente leitura)

- Extrair textos do site em produção e do Supabase antigo (inclui tabela `pages`) para
  `docs/conteudo-v1-extraido.md`; marcar cada afirmação como "confere" ou "não confere" com `acomodacoes.md`.
- Curadoria de fotos por acomodação e experiência a partir da Biblioteca Oficial (`web-avif` / `master`,
  rastreadas pelo `manifest.json`): lista em `docs/fotos-curadoria.md` com arquivo, uso e ponto focal sugerido.
- Pronto quando: textos e fotos listados; divergências de fonte apontadas para a proprietária.

### Etapa 2 — Propostas visuais (gate de aprovação)

- 3 direções da Home, distintas entre si dentro das regras fechadas (paleta e classe tipográfica fixas). Diferenças
  em: par tipográfico, grid/composição, tratamento do hero, ritmo e densidade, uso das faixas escuras e do divisor.
  Esboço inicial das direções (a refinar na entrega):
  - **A — Editorial de revista:** hero de foto inteira, título serifado muito grande, grid assimétrico com
    sangrias, legendas em caixa alta; ritmo lento.
  - **B — Galeria silenciosa:** muito espaço negativo, fotos em molduras de proporções variadas, tipografia contida,
    navegação mínima; o divisor das araucárias como fio condutor.
  - **C — Imersivo cinematográfico:** sequência de fotos em tela cheia, frase manifesto (efeito 04), faixas
    marinho alternando com off-white; mais movimento, um efeito pesado por tela.
- Cada direção: Home completa em 390 e 1440 px, fotos reais, só texto factual da Etapa 1, mesmo conteúdo nas três.
- Entrega: capturas 390/1440 + rota de preview navegável no Cloudflare. Rotas de preview respondem 404 em produção
  (mesmo padrão do fixture `/e2e`) e não entram no Workers Cache público.
- **Parar.** A proprietária escolhe uma direção (ou combinação explícita). Só então o restante é detalhado.

### Etapa 3 — Design system

- Tokens da direção escolhida via `@theme` do Tailwind v4 (cor, tipo, espaçamento, raio, sombra, movimento).
- Fontes: verificar antes se `next/font` funciona sob vinext (docs em `node_modules/next/dist/docs` e do vinext);
  senão, self-host com `@font-face` + preload, sem CLS.
- Logo vetorizada em SVG a partir do PNG master (aprovação da proprietária); divisor das araucárias em SVG.
- Primitivas: tipografia, botão/CTA, link WhatsApp, imagem Sanity responsiva com ponto focal (AVIF/WebP, `sizes`).
- Pronto quando: tokens documentados e primitivas testadas.

### Etapa 4 — Schemas e seções

- Schemas novos: `experience`, `faq`, `review`, `policy`; completar `page`, `accommodation`, `siteSettings`,
  `whatsappContact` conforme §5.
- As 16 seções do page builder, cada uma com teste de renderização (TDD) e edição visual no Presentation (stega).
- Efeitos 01, 02, 04, 05, 07 e 22 como componentes isolados com testes de `prefers-reduced-motion`. Efeito 22:
  foco preso, fecha com Esc, botão voltar e toque fora. Bundle de movimento carregado só onde usado.
- **Revisão independente 1** (agente diferente, lê o `git diff`).

### Etapa 5 — Rotas e páginas

- Home (page do CMS), `/acomodacoes`, template único `/acomodacoes/[slug]` para as 6 acomodações, páginas
  institucionais (`/experiencias`, `/sobre`, `/localizacao`, `/faq`, `/politicas`, `/contato`) e `/[slug]`.
- Header, menu mobile, rodapé escuro, metadados/SEO por página.
- WhatsApp: contatos do CMS no header, rodapé, botão flutuante e página; teste Vitest dos links.
- "Reservar" com `bookingUrl` sem datas, nova aba. Cards com "Consultar disponibilidade" (`PRICES_ENABLED=false`).
- **Estrutura pronta para busca (sem motor):** componente da barra de busca (datas + hóspedes) com tipo de estado
  definido e slot no Hero, desligado por flag. Não colocar `checkin`/`checkout` como parâmetro em rotas cacheadas
  (qualquer parâmetro desconhecido faz BYPASS do Workers Cache e força render no gateway). A forma da rota de
  resultados (rota dedicada `no-store` vs. client-side) fica como decisão aberta da Fase 3.
- e2e Playwright: navegação das rotas, Reservar e WhatsApp com link correto, reduced motion, rascunho invisível.

### Etapa 6 — Conteúdo no Sanity

- Script de importação idempotente (textos revisados + upload das fotos da curadoria + `beds24RoomId` já mapeado).
- Escreve no dataset com token de escrita: **passo autorizado pela proprietária antes de rodar**. Token só no `.env`
  local, nunca commitado. Deploy do Studio também só com autorização.
- Pronto quando: todas as páginas preenchidas no CMS e editáveis pelo editor visual.

### Etapa 7 — Qualidade e entrega

- Revisão visual em 390, 430, 768 e 1440 px; auditoria WCAG AA (contraste, foco, teclado, alt das fotos).
- Configurar Lighthouse CI com orçamento ≥ 95; LCP < 2,0 s em 4G; CLS ≈ 0.
- Re-medir CPU do Worker com a Home real (HIT/MISS/frio). Workers Paid só com autorização explícita.
- **Revisão independente final** da branch contra a spec e este plano.
- Pronto quando: site completo navegável no preview da `v2` e aprovado visualmente pela proprietária.

## Decisões que precisam da proprietária

1. Direção visual (A, B, C ou combinação) — Etapa 2.
2. Par tipográfico final dentro da direção escolhida.
3. Aprovação da logo em SVG.
4. Hero: foto ou vídeo, e qual.
5. Fotos por acomodação; acomodações em destaque na Home e ordem.
6. Contatos de WhatsApp: números, mensagens pré-preenchidas e onde aparecem.
7. Fonte dos trechos de referência dos efeitos 01/02/04/05/07/22.
8. Destino dos protótipos não commitados em `src/app/previews` (aproveitar ideias visuais ou descartar).
9. Qual fonte de texto vence se site em produção e Supabase antigo divergirem.
10. Autorização para escrever no dataset Sanity e fazer deploy do Studio (Etapa 6).


---

## Adendo — direção escolhida e páginas de acomodação (2026-10-02)

### Direção visual: D2 (rodadas de preview aprovadas até aqui)
- Base: C (escuro, cinematográfico) + índice/lista editorial do A + silêncio do B. Sem máscara circular, pilha de cartões ou galeria horizontal.
- Fontes: **Par 1 no desktop (Fraunces + Figtree) e Par 2 no mobile (Bodoni Moda + Albert Sans)** — preferência da proprietária "por enquanto"; decisão final de fontes ainda aberta.
- Mobile-first. Home: no desktop, acomodações em painéis que se abrem (2 grupos: Românticas / Para grupos). No mobile, **lista editorial compacta (M2)**: 6 itens com o mesmo peso (foto 16:10, ~216 px; nome, capacidade, diferencial e CTA abaixo; sem texto sobre a foto; sem carrossel).
- Regras de acabamento: sem eyebrows, sem numeração, itálico só onde a voz pede, display ≤ 6rem, links em texto, sem cartões/sombras/pills, movimento lento (expo-out), áreas claras alternando com o escuro.
- Efeitos mantidos: zoom lento do hero, expansão dos painéis (desktop), traço da serra desenhando, entrada suave de poucos textos, parallax sutil nas fotos de experiências. Não usados: 01, 02, 04, 05, 07, 22 (disponíveis se a proprietária pedir).

### Páginas individuais de acomodação (UI/UX apenas)
Rota de preview: `/design-previews/d2/acomodacao/[slug]` (os 6 slugs). Todas usam **o mesmo template e o mesmo peso visual**: hero com nome + diferencial + CTAs ("Consultar disponibilidade" rola até `#disponibilidade`, "Falar pelo WhatsApp"), introdução + capacidade, 3 fotos (cada acomodação tem exatamente 4 fotos), seção **Disponibilidade**, "Outras acomodações" em lista, rodapé.

**Seção "Disponibilidade" (componente `AvailabilityCalendar`)**
- Calendário próprio no design D2 (não é embed/widget Beds24). 2 meses no desktop, 1 mês no mobile; navegação mês a mês (até 11 meses à frente).
- Estados: `Disponível`, `Indisponível` (nunca "Ocupado"), `Hoje`, chegada/saída/intervalo selecionado; dias passados ficam esmaecidos e não selecionáveis. Legenda visível.
- Seleção: 1º toque = chegada; 2º = saída. Regras: as **noites** entre chegada e saída precisam estar livres; o dia de saída pode ser um dia indisponível (saída pela manhã); intervalo com noite indisponível mostra "Há datas indisponíveis nesse período."; tocar numa data anterior à chegada reinicia; "Limpar" zera.
- Após intervalo válido aparece o CTA **"Reservar estas datas"** (nesta fase sem destino; é `preventDefault`). Antes do intervalo não há CTA de reserva.
- Acessibilidade: cada dia é `<button>` com `aria-label` ("12 de outubro de 2026, Disponível"), `aria-pressed` nas pontas, status em `role="status"`/`aria-live`, foco visível, alvo de toque 46–50 px.
- **Dados de demonstração**: função determinística por slug (blocos de 2–5 noites indisponíveis). Não é disponibilidade real, não há preço, não há chamada de rede. Qualquer captura/preview deve dizer que é demonstração.

### Fase 3 — como o componente será conectado (registro)
O componente já separa a UI dos dados; na Fase 3 só a fonte de dados troca:
1. **`roomId`**: vem do Sanity (`accommodation.beds24RoomId`, já mapeado em `docs/beds24-mapeamento.md`). O componente passa a receber `roomId` (e `slug`/`name`) por props.
2. **Calendário**: dados do mês por `GET /inventory/rooms/calendar` (módulo `lib/beds24/`, server-only, via rota própria do site — o navegador nunca fala com a Beds24 nem vê o token). Mapeamento por dia: sem disponibilidade, `minStay`/restrição de chegada ou de saída → `Indisponível` (ou saída-permitida / chegada-bloqueada, conforme a restrição); demais → `Disponível`. **Nunca exibir o preço diário que o calendar traz** enquanto `PRICES_ENABLED=false`.
3. **Validação ao escolher o intervalo**: `GET /inventory/rooms/availability` para confirmar o período e `GET /inventory/rooms/offers` (ocupação de referência da acomodação) para obter oferta válida antes de liberar "Reservar estas datas"; estados `available` / `unavailable` com motivo / `error` do módulo, com "Consultar disponibilidade" + WhatsApp em caso de `error`.
4. **CTA "Reservar estas datas"**: passa a abrir `bookingUrl({ roomId, checkin, numnight, adults, children })` em nova aba.
5. **Consumo/cache**: calendar em lote por mês com cache (Cache API, ~5 min) e circuit breaker de créditos (spec §6); a rota de dados **não** pode usar `checkin`/`checkout` como query em página cacheada (qualquer parâmetro desconhecido faz BYPASS do Workers Cache — ver `docs/infra-medicoes.md`). Decisão aberta herdada: rota dedicada `no-store`/POST vs. client-side.
6. **Testes (TDD)**: mapeamento calendar → estados, regra de noites livres/saída em dia indisponível, erro/rate-limit → "Consultar disponibilidade", e2e com Beds24 simulada. A validação da spec §7 (total da API = total do booking engine) continua pré-requisito para ligar `PRICES_ENABLED`.

### Galeria completa por acomodação (2026-10-02)
- A página de acomodação tem uma seção **Fotos** com todas as fotos da acomodação em **proporção original (sem recorte)**, em colunas (2 no mobile, 3 no desktop), e **visualizador em tela cheia**: setas ← → (teclado e botões), deslize no toque, contador "3 / 15", Esc / botão Voltar / "Fechar", foco preso e devolvido, vizinhas pré-carregadas.
- Mesmo componente para as 6 acomodações; a quantidade varia com o que a proprietária subir (no preview: 14 a 15 fotos por acomodação, da Biblioteca Oficial, já sem duplicatas da capa).
- No CMS (Etapa 4/6): `accommodation.gallery` = array de imagens **sem limite**, com `alt` obrigatório, ordem editável e ponto focal; `width`/`height` vêm do asset (evita CLS). A primeira imagem marcada como capa alimenta o hero. Imagens servidas pelo CDN do Sanity (AVIF/WebP, `sizes` responsivos, `loading="lazy"`); no preview são JPEGs de 1800 px em `public/design-previews/stays/`.
- Alt de demonstração é genérico ("Ágata, foto 3 de 15"); alt real é conteúdo a ser escrito no CMS.

### Modelo de conteúdo editável (decisão da proprietária, 2026-10-02) — para a Etapa 4
Princípio: **todo texto, foto, ordem, grupo e contato visível no site é editável no Studio.** Só ficam no código o layout, os tokens de design e as regras de comportamento (ex.: regra de noites do calendário). Nada abaixo foi implementado; "schemas" só na Etapa 4, após aprovação.

**Grupos de acomodação (novo tipo `accommodationGroup`)** — hoje "Românticas" e "Para grupos"; a proprietária pode renomear, criar, reordenar ou remover grupos.
- `name`, `slug`, `order`, `intro` (texto curto opcional), `whatsapp` (referência a `whatsappContact`) e `showOnHome`.
- O nome "Românticas" **não implica só casais**: as românticas também aceitam crianças (ver capacidade abaixo).

**Acomodação (`accommodation`)** — acrescentar aos campos que já existem, todos editáveis:
- `group` (referência obrigatória a `accommodationGroup`) e ordem dentro do grupo;
- `tagline` (o diferencial curto, ex.: "Hidro com vista e rede horizontal para dias lentos");
- `capacityLabel` (texto livre exibido, ex.: "2 a 4 hóspedes") e `capacity` (número máximo, já existe);
- `acceptsChildren` (boolean) + `childrenNote` (texto opcional, ex.: regra de idade) — **as românticas aceitam crianças**; o texto "2 hóspedes" do site em produção está desatualizado nesse ponto e **não deve ser copiado sem a proprietária confirmar o rótulo de cada uma** (Beds24 hoje informa `maxPeople` 4 para Ágata, Mirante, Doce Recanto e Domo);
- `detail` (parágrafo da página), `highlights`, `amenities`;
- `coverImage` (capa/hero; senão a 1ª da galeria) e `gallery` sem limite, cada foto com `alt` obrigatório, `caption` opcional, ponto focal e ordem editável;
- `whatsappOverride` (opcional) — senão herda o do grupo;
- `ctaLabels` opcionais (ex.: "Consultar disponibilidade") com padrão do site;
- `beds24RoomId`, `ocupacaoReferencia` (já existem), SEO.
Criar uma acomodação nova gera automaticamente: página `/acomodacoes/[slug]`, entrada na lista/painéis da Home (no grupo escolhido), calendário (ativo quando houver `beds24RoomId`) e galeria.

**WhatsApp: um número para as românticas e outro para as de grupos**
- Cada `accommodationGroup` aponta para um `whatsappContact` (rótulo, número, mensagem pré-preenchida).
- Resolução: `accommodation.whatsappOverride` → `group.whatsapp` → contato geral do site.
- A mensagem aceita variável (ex.: "Olá! Tenho interesse no {acomodacao}") e, com datas escolhidas no calendário, pode incluí-las.
- Na página de acomodação, header/rodapé/botão flutuante e o link do hero usam o número do **grupo daquela página**. **Decisão aberta:** na Home e nas páginas sem grupo, qual número aparece no header e no botão flutuante (um contato geral? um seletor "Românticas / Grupos"?).

**Crianças no calendário (UI da Fase 2 a acrescentar)**: junto do calendário entra seleção de **adultos e crianças** (limites vêm de `capacity`/`acceptsChildren`); na Fase 3 viram `numadult`/`numchild` no link da Beds24 e a ocupação da consulta.

**Conteúdo global editável (`siteSettings` + blocos de página)**: nome, logo, menu, rodapé, redes; textos do hero e da busca; títulos e textos das seções da Home (intro, Experiências, depoimento, fecho/CTA); `experience`, `faq`, `review`, `policy`; textos da interface (legenda e mensagens do calendário, rótulos de botões) com valores padrão; SEO por página. Páginas novas = lista ordenada de blocos prontos (somente os blocos que a D2 usa).

### Decisões de 2026-10-02 (D2 aprovada com ajustes)
- **D2 aprovada** como direção visual. Fase 2 segue só UI/UX.
- **WhatsApp sem grupo (Home e páginas gerais): seletor pequeno** "Românticas / Para grupos" (botão flutuante e link do fecho). Na página de acomodação o link vai direto ao número do grupo daquela página. O botão flutuante só aparece depois do hero (não cobre a busca nem os CTAs). Números e mensagens vêm de `whatsappContact` via `accommodationGroup`.
- **Abas na página de acomodação: "Sobre | Comodidades"** (acessíveis: `role=tablist`, setas ← → Home End). Rótulos das abas, texto "Sobre", capacidade e a lista de **comodidades** são editáveis (`accommodation.amenities`: lista de itens; opcionalmente com rótulo de grupo). Nos previews a lista traz **somente o que está confirmado no `acomodacoes.md`**; o restante (cozinha, banheiro, ar-condicionado etc., que aparecem nas fotos mas não estão documentados) é a proprietária quem preenche no CMS.
- **Títulos e descrições editáveis**: títulos de seção/página, subtítulos, descrições, rótulos de abas e botões, SEO — todos campos do Studio (`siteSettings`, blocos de página e documentos), com valor padrão. Layout e tokens de design ficam no código.
- Pendente de resposta: seletor de adultos/crianças junto do calendário.
- **Galeria: 8 fotos visíveis + "Ver todas as fotos (N)"** (e "Mostrar menos"). O visualizador em tela cheia navega por todas as N, mesmo com a grade recolhida. O número inicial (8) é um padrão editável em `siteSettings`; quando N ≤ 8 o botão não aparece.

### Hóspedes no calendário (2026-10-02) — implementado só como UI
- Seletor de **adultos e crianças** na seção Disponibilidade (botões − / +, 44 px, `output` com `aria-live`, dica de limite sempre visível). **Sempre pelo menos 1 adulto.**
- **Românticas** (Domo Estelar, Ágata, Mirante, Doce Recanto): até **2 adultos e 2 crianças**. **Celeiro**: até **11 hóspedes** no total. **Chalé para Grupos**: até **23 hóspedes** no total.
- Regras são campos editáveis da acomodação: `minAdults` (padrão 1), `maxAdults`, `maxChildren`, `maxGuests`. O rótulo exibido ("Até 2 adultos e 2 crianças") passou a refletir isso nos previews.
- O resumo da seleção mostra as noites e os hóspedes; o CTA "Reservar estas datas" já carrega adultos/crianças (atributos `data-*`). **Fase 3:** viram `numadult`/`numchild` no `bookingUrl` e a ocupação da consulta `offers`.
- **Conflito a resolver antes da Fase 3:** a Beds24 informa `maxPeople` 20 para o Chalé Grupos (e 11 para o Celeiro, 4 para as românticas). Com 23 hóspedes a proprietária precisa ajustar a capacidade/ocupação máxima do quarto na Beds24, senão `offers` pode recusar. O `acomodacoes.md` (até 20) também está desatualizado.

### Nova aba do site: "Casamentos no sítio" (2026-10-02)
- Entra no menu principal (entre Experiências e O Sítio) e vira uma página própria (slug editável, sugestão `/casamentos`), montada como as demais páginas: lista ordenada de blocos editáveis do Studio. Reaproveita o D2 (hero em foto, texto editorial, galeria com "Ver todas", lista com fios, fecho com CTA) — sem inventar blocos novos além do necessário.
- **Nada de conteúdo foi escrito**: não há texto, política, capacidade, valores nem foto de casamento em nenhuma fonte (site em produção, `acomodacoes.md`, Biblioteca Oficial). Tudo vem da proprietária.
- Perguntas abertas: (1) textos e o que o sítio oferece para casamentos; (2) fotos reais de casamentos no sítio (a Biblioteca Oficial hoje não tem); (3) contato: terceiro número de WhatsApp "Casamentos" ou um dos dois atuais; (4) CTA: "Falar sobre o seu casamento" via WhatsApp / formulário de contato (formulário está fora da V1 na spec) / outro; (5) esta aba não usa calendário Beds24 (datas de casamento não são hospedagem).

- **Texto de limite no seletor (editável, `guestHint` na acomodação):** românticas "Máximo: 2 adultos e 2 crianças. Aceitamos pets sem custo extra."; Celeiro "Máximo: 11 hóspedes."; Chalé para Grupos "Máximo: 23 hóspedes." A regra de pelo menos 1 adulto continua valendo no seletor, mas não é escrita na dica (só aparece a mensagem "É necessário pelo menos 1 adulto." ao tentar remover o último). "Aceitamos pets sem custo extra" passa a ser informação oficial das românticas (a confirmar se vale também para Celeiro e Chalé).

- **Casamentos — contato (respostas da proprietária, 2026-10-02):** atende pelo **mesmo número do grupo "Para grupos"**, mas a aba usa um **link de WhatsApp próprio, com mensagem personalizada**. Modelo: `whatsappContact` "Casamentos" com o número herdado do contato de "Para grupos" (campo `numberFrom` = referência, sem duplicar o número) e `message` própria (ex.: "Olá! Quero saber sobre casamentos no sítio."). **Só WhatsApp por enquanto** — sem formulário (fora da V1). Todos os CTAs da página (hero, fecho, botão flutuante) usam esse link; o seletor "Românticas / Para grupos" não aparece nessa página.
- Pendentes de Casamentos: textos, fotos reais e o que o sítio oferece (a proprietária fornece).

- **Extras das românticas (2026-10-02):** decorações, pedidos de casamento e café da manhã. Terceira aba **"Extras"** na página das românticas (some nas de grupos enquanto não houver extras). Modelo: documento `extra` (nome, descrição, imagem, ordem) referenciado por grupo ou acomodação, 100% editável; o rótulo da aba também. Nesta fase **sem preços** e sem descrição inventada (só os nomes dados pela proprietária + foto real da Biblioteca Oficial: cama com decoração, cama com "Casa comigo", mesa de café). CTA da aba: "Consultar extras pelo WhatsApp" (número do grupo). Se os extras também forem oferecidos no Celeiro/Chalé, basta referenciar os mesmos documentos.

- **Extras (atualização, 2026-10-02):** além da aba "Extras" em cada página das românticas, há um bloco **Extras** na **Home** (fim da seção de acomodações): fotos pequenas + nome + descrição + "Consultar extras pelo WhatsApp" (número das românticas). **Descrições são simuladas** (a proprietária altera no Studio ou com a equipe de desenvolvimento); sem valores. Mesmos documentos `extra` alimentam a Home e as páginas.
- **Pets:** "Aceitamos pets sem custo extra" vale para **todas** as acomodações (românticas, Celeiro e Chalé para Grupos). Dica do seletor: "Máximo: 2 adultos e 2 crianças. Aceitamos pets sem custo extra." / "Máximo: 11 hóspedes. Aceitamos pets sem custo extra." / "Máximo: 23 hóspedes. Aceitamos pets sem custo extra." Por ser regra do sítio, no CMS vira um campo global (`siteSettings.petsPolicy`) concatenado à dica, em vez de repetido por acomodação.

### Menu principal, páginas internas e localização (2026-10-02)
**Menu do topo:** `Acomodações ▾ · Extras · Experiências · Casamentos no sítio · Políticas · Localização · WhatsApp ▾ · Reservar`.
- **Acomodações ▾**: lista as seis, em "Românticas" e "Para grupos", cada nome leva à própria página; itens e grupos vêm do CMS (nova acomodação aparece sozinha).
- **WhatsApp ▾**: lista os **3 contatos** (Românticas, Para grupos, Casamentos). Casamentos usa o número de "Para grupos" com link/mensagem próprios.
- **Extras** → página completa (cada extra em destaque, foto grande, descrição, WhatsApp das românticas). **Experiências** → página de experiências + seção "Turismo na região" (conteúdo da proprietária). **Políticas** → página única com privacidade, hospedagem e formas de pagamento (índice lateral; **textos oficiais a fornecer — não simulados, têm efeito legal**). **Casamentos no sítio** → página própria (conteúdo a fornecer; contato só WhatsApp).
- **Localização** → seção da Home (`#localizacao`) com mapa do Google; no menu rola até ela (das outras páginas leva à Home).
- **Reservar abre o motor de reservas da Beds24** (`https://beds24.com/booking2.php?propid=357738&referer=site-v2`) em **nova aba** (`rel="noopener noreferrer"`), sem datas. Link só de leitura/redirecionamento; o site nunca cria reserva. Em produção o `referer` vem de `siteSettings.beds24Referer` e `propid` do mapeamento; `bookingUrl()` precisa de variante sem `roomId` (hoje exige `roomId`).
- **Mobile**: botão "Menu" (abaixo de 1120 px) abre tela cheia com sanfonas (Acomodações, WhatsApp), links grandes e "Reservar" no fim; fecha com Esc/"Fechar".
- **Mapa**: carregado **sob demanda** (clique em "Ver mapa"): antes do clique não há requisição ao Google (privacidade/LCP); link "Abrir no Google Maps" sempre visível. Local: Sítio Recanto Azul (Rua Santa Bárbara, Santa Bárbara, Alfredo Wagner – SC, 88450-000, segundo o próprio Google Maps; **a proprietária confirma o endereço exibido**). O mapa vem do identificador do lugar (`cid`) fornecido pela proprietária.
- Dropdowns acessíveis: `aria-expanded`, abrem por hover com atraso/clique/teclado, fecham com Esc e clique fora.
- **Experiências na Home (mobile-first, 2026-10-02):** no mobile a ordem é título → foto grande → duas fotos lado a lado → lista compacta (5 itens) → "Ver todas as experiências →" (leva à página de Experiências). Altura da seção caiu de ~1560 para ~1320 px e a primeira coisa vista é a foto, não texto. Desktop mantém texto à esquerda (fixo) e fotos à direita.
- **Rodapé compacto (mobile-first, 2026-10-02):** logo + local na primeira linha; "Navegue" e "Contato" lado a lado (2 colunas); e-mail e © em linhas próprias. ~445 px no mobile (antes ~800 px, uma coluna por grupo). No desktop: 3 colunas. Links e contatos editáveis no Studio (`siteSettings`).

### Refinamento premium / mobile-first (2026-10-02) — aplicado no D2
Snapshot anterior em `docs/design-previews/snapshots/d2-v1-src` (os previews não estão versionados).
- **Home em capítulos:** Hero → Introdução (clara) → Acomodações → **Extras e casamentos** (faixa clara, 2 fotos-link; o bloco de Extras saiu de dentro de Acomodações) → foto cheia → Experiências (foto primeiro no mobile) → Localização (mapa sob demanda) → depoimento com peso próprio → CTA → rodapé compacto.
- **Acomodações no mobile = lista M2 por padrão** (foto 16:10 de 216 px, nome + capacidade + diferencial; **a linha inteira é o link**; "Consultar disponibilidade" saiu da lista e fica na página de cada acomodação). Carrossel descartado. Desktop mantém os painéis.
- **Hero mobile:** título sobe, o domo fica à vista, busca numa linha discreta; escurecimento do topo reforçado para contraste.
- **Cabeçalho fixo:** transparente no topo, sólido ao rolar; **esconde ao rolar para baixo e volta ao rolar para cima** (240 ms, `cubic-bezier(.23,1,.32,1)`).
- **Régua de design:** títulos de seção com uma escala (`--h2`: 32–44 px mobile, 40–60 px desktop) e espaçamento de seção único (`--section-y`: 72 px mobile, 144 px desktop). Fios (linhas) só em listas de dados.
- **Movimento (revisão Emil):** menus 160–180 ms, troca de abas 220 ms, dia do calendário 150 ms (antes 500 ms–1 s); `:active` com `scale(.97)` em botões/links/steppers; `:hover` só com `(hover: hover) and (pointer: fine)`; efeitos lentos ficam só no que é decorativo e raro (zoom do hero, painéis, traço da serra).
- **Pendente (Etapa 3):** símbolo da serra em SVG como marca e favicon (hoje é desenho provisório); texto alternativo/legendas reais das fotos.
