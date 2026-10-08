# Fase 2 — D2 transformado no site real (estado)

Branch: `feat/site-real-d2` (base `feat/fase2-previews`). O D2 em `/design-previews/*` segue como referência visual;
o site real vive em `src/app/(site)/*` e reaproveita os mesmos componentes e CSS.

## Rotas reais

| Rota | Origem |
|---|---|
| `/` | página `home` do CMS (seções: hero, introdução, acomodações, blocos de destaque, foto cheia, experiências, localização, depoimento, chamada final) |
| `/acomodacoes` | página `acomodacoes` (cabeçalho + grupos) |
| `/acomodacoes/[slug]` | documento `accommodation` (6 acomodações) |
| `/extras`, `/experiencias`, `/casamentos`, `/politicas`, `/faq`, `/contato`, `/localizacao` | documentos `page` (rota única `/[slug]`) |
| `/[slug]` | qualquer página criada no Studio (404 se não existir) |
| `/sitemap.xml`, `/robots.txt` | gerados a partir do CMS |

`/sobre` (spec §4) não tem conteúdo nem D2: pode ser criada no Studio como página (`/[slug]`) quando houver texto.

## Arquitetura

- `src/components/site/` — chrome e componentes compartilhados (header, nav, menu mobile, WhatsApp, footer, mapa sob demanda, abas,
  galeria com visualizador, painéis, calendário, `StayBooking`, efeitos `fx`). Os previews importam daqui (sem duplicação).
- `src/components/sections/` — uma seção por tipo do page builder + `SectionRenderer` (tipo desconhecido é ignorado).
- `src/lib/content/` — `queries.ts` (GROQ), `normalize.ts` (cru → tipos fortes), `data.ts` (busca + fallback), `seed.ts`
  (conteúdo-base), `seed-plan.ts` (regras de importação), `gallery.ts`, `page-helpers.ts`.
- `src/lib/images.ts` — URLs do CDN do Sanity (srcSet, ponto focal, dimensões sem CLS) e placeholder identificável.
- `src/lib/whatsapp.ts`, `src/lib/booking.ts`, `src/lib/seo.ts`, `src/lib/sitemap.ts`.
- `studio/schemas/` — `siteSettings`, `whatsappContact`, `accommodationGroup`, `accommodation`, `extra`, `experience`, `faq`,
  `review`, `policy`, `page` e 16 seções.

### Conteúdo e fallback

`data.ts` consulta o Sanity; se estiver indisponível ou o conteúdo ainda não tiver sido migrado, usa a **seed** avaliada com a
**mesma GROQ** (groq-js). Assim o site nunca vira 500 sem credencial e o fallback não diverge do real. Regras:
- stub de acomodação da Fase 1 (sem frase/grupo) e Home de teste (sem seção `acomodacoes`) → seed;
- `CONTENT_FALLBACK=off` desliga a seed (útil para validar o Sanity de verdade);
- Sanity indisponível gera um aviso por minuto no log (sem token/headers).

Importar a seed no Sanity (**passo autorizado, escreve no dataset**): `node scripts/seed-sanity.mts` (simulação) e
`SANITY_API_WRITE_TOKEN=… node scripts/seed-sanity.mts --apply`. Nunca sobrescreve edições (ver `planSeed`); `--force` substitui tudo.
Fotos não fazem parte da seed (ver `docs/fotos-referencias.md`).

### Decisões técnicas

1. Links do site são `<a>` simples (não `next/link`): navegação completa serve a página do Workers Cache e evita o prefetch RSC,
   que renderiza sempre no gateway (sem cache) e gasta CPU do Workers Free. Regra do ESLint desligada só para `src/components` e `(site)`.
2. WhatsApp: números **não existem** em nenhuma fonte (V1 só tem `5500000000000`). Contato sem número é escondido em produção e
   aparece desabilitado ("número pendente") em desenvolvimento. Nunca se gera `wa.me` sem número válido.
3. Chalé para Grupos = **20 hóspedes** (decisão da proprietária; Beds24 `maxPeople` = 20). Românticas 2 adultos + 2 crianças; Celeiro 11.
4. Rotas públicas reais **não** usam disponibilidade de demonstração: a seção "Disponibilidade" mostra hóspedes + "Consultar
   disponibilidade" (WhatsApp) + "Reservar" (motor Beds24, nova aba). O calendário de demonstração existe só nos previews.
   `StayBooking` aceita `availability` (dados reais) para a Fase 3 sem refazer a página.
5. Placeholders: "FOTO PENDENTE" + rótulo, gerados em SVG (sem rede). Substituem-se enviando a foto no Studio.
6. Fontes provisórias D2 (Fraunces + Figtree no desktop, Bodoni Moda + Albert Sans no mobile), via Google Fonts; self-host antes do lançamento.
7. `playwright.config.ts`: `PW_CHROMIUM_PATH` opcional e projeto mobile em Chromium (sem WebKit).

## Textos que são rascunho (revisão editorial pendente)

- Casamentos (`page-casamentos`): só reaproveita fatos já presentes (galpão de festas do Chalé para Grupos, pergolado de vidro do Celeiro).
- Extras: nomes informados pela proprietária; descrições simuladas nos previews.
- Políticas: privacidade descreve o comportamento real do site; hospedagem usa capacidades e "aceitamos pets sem custo extra";
  check-in/out, cancelamento e pagamento dizem apenas "informados no momento da reserva" (fonte: FAQ do V1). **Nenhuma regra comercial inventada.**
- FAQ: 4 perguntas do V1, ajustadas (reserva via motor/WhatsApp; pets).
- Depoimento: único publicado hoje no V1 (Bruna, Airbnb, setembro de 2025) — marcado `approved`; confirmar uso.
- Experiências: as 5 do V1. "Turismo na região": sem fonte, não foi criada.
- Descrições das acomodações: curtas, só com fatos confirmados em `acomodacoes.md`/previews.

## Pendências por dependência externa

- **Fotos** (Biblioteca Oficial): enviar pelo Studio. Sem elas o site mostra placeholders.
- **Números de WhatsApp** (Românticas, Para grupos; Casamentos herda de Para grupos): preencher em `whatsappContact`.
- **Sanity** (token de escrita) para rodar a seed e confirmar o fluxo com dados reais; Studio precisa ser reimplantado com os novos schemas.
- **Cloudflare**: re-medir CPU (Home real, HIT/MISS/frio) no preview antes de decidir Workers Paid. Bundle do Worker ≈ 700 KiB gzip (era 560).
- **Instagram, e-mail oficial, endereço**: campos de `siteSettings` (hoje só o e-mail do V1 e o mapa).
- **Fase 3** (Beds24 ao vivo): `/api/quote`, calendário real, "a partir de", validação API × checkout.
