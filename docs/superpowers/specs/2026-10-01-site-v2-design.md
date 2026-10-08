# Site Sítio Recanto Azul V2 — Design

Data: 2026-10-01 · Status: aprovado com ajustes (rev. 2), aguardando plano de implementação

## 1. Objetivo

Substituir o site atual do Sítio Recanto Azul por um site novo, de nível premium ("digno de awards"),
totalmente editável sem código: textos, fotos, acomodações, seções e páginas novas, com edição
visual clicando na própria página e preview ao vivo.

Beds24 é a única fonte de verdade de preço, disponibilidade, mínimo de noites e restrições.
O site não tem checkout próprio nem iframe na V1: ele mostra, convence e leva para o motor Beds24
(ou para o WhatsApp).

### Critérios de sucesso

- A proprietária edita qualquer texto/foto/seção pelo editor visual e vê a mudança antes de publicar.
- A proprietária cria uma página nova empilhando seções prontas, sem ajuda técnica.
- Cards e busca mostram somente preços e estados vindos da Beds24; nunca preço antigo como atual.
- "Reservar" abre a Beds24 com o máximo possível pré-preenchido.
- LCP < 2,0 s em 4G, CLS ≈ 0, Lighthouse ≥ 95 em todas as categorias, WCAG AA.
- Custo recorrente de infraestrutura: US$ 0/mês no início (Cloudflare Workers Free + Sanity free). Workers Paid
  (US$ 5/mês) só se a medição no preview mostrar necessidade real.

## 2. Repositório, branches e deploy

### Estado atual (verificado em 2026-10-01)

- Clone local: `~/sitesitiorecantoazul`.
- Remote: `https://github.com/zeloalabs/SITESITIORECANTOAZUL.git`.
  `brunabepplermkt/sitesitiorecantoazul` redireciona para esse repo (foi transferido para a org).
- Branch `main` sincronizada com `origin/main` em `6d3e8bf`.
- Deploy atual: Vercel via integração Git, produção a partir de `main`
  (último deploy de produção: `6d3e8bf`, 2026-09-19).
- Domínio `sitiorecantoazul.com.br`: DNS no Cloudflare, registros apontando para a Vercel.

### Regras

1. Reutilizar o repo existente (`zeloalabs/SITESITIORECANTOAZUL`, canônico). Não criar repo novo nem pasta nova.
   Nunca push direto em `main`.
2. Antes de remover qualquer código antigo:
   - confirmar remote e branch;
   - `git fetch && git pull --ff-only origin main`;
   - criar tag `site-v1-final` e branch `archive/site-v1` no último commit do site antigo, e enviá-las ao GitHub;
   - criar branch `v2` a partir de `main`.
3. Todo o desenvolvimento acontece em `v2` (ou branches curtas que fazem merge em `v2`).
4. Na `v2`, o código antigo é removido por completo. Não há duas aplicações misturadas.
5. Previews só da `v2`, no Cloudflare. O site público atual (Vercel + `main`) não muda durante o desenvolvimento.
6. Para a Vercel não construir a `v2`: `vercel.json` na `v2` com
   `{"git":{"deploymentEnabled":{"v2":false}}}`.
7. Merge `v2 → main` e troca de produção só na Fase 4, após "pode publicar" explícito da proprietária.

## 3. Stack

| Camada | Escolha | Motivo |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | Ecossistema, SSG/ISR, integração Sanity |
| Hospedagem | Cloudflare Workers via vinext | Uso comercial permitido, CDN global, DNS já no Cloudflare, CPU p50 de 2,0 ms (80% abaixo do limite Free de 10 ms), bundle ~560 KiB gzip |
| CMS | Sanity (plano free) | Edição visual (Presentation tool) inclusa no free, 20 usuários, 100 GB de assets |
| Imagens | CDN de imagens do Sanity | AVIF/WebP, recorte com ponto focal, tamanhos responsivos, sem custo de otimização no host |
| Movimento | Motion (motion.dev) | Scroll hooks e `layoutId` para os efeitos escolhidos |
| Studio | Hospedado no Sanity (`*.sanity.studio`, grátis) | Mantém o Worker do site pequeno; Presentation aponta para a rota de draft do site |
| Cache Beds24 | KV (só "a partir de", via Cron) + Cache API (buscas) + binding de rate limiting | KV free tem poucas escritas/dia; Cache API e rate limiting não gastam essa cota |
| Analytics | Cloudflare Web Analytics | Grátis, sem cookies |
| Testes | Vitest + Playwright + Lighthouse CI | Unidade, fluxo real e orçamento de performance |

Plano Cloudflare: começar no Workers Free. Limites relevantes do Free: 10 ms de CPU por requisição, 100 mil
requisições/dia, 50 subrequests por requisição, 5 Cron Triggers. Medir CPU e limites no preview (páginas públicas,
rota de draft do editor, `/api/quote`, cron). Migrar para Workers Paid (US$ 5/mês) só se alguma medição exceder o Free. Fallback de hospedagem: Vercel Pro (US$ 20/mês), só se vinext/Cloudflare mostrar bloqueio técnico real.

Descartados: Storyblok (free com 1–2 usuários, próximo plano US$ 99/mês); Payload self-hosted
(edição visual menos madura, exige banco e storage próprios); Vercel Hobby (termos proíbem uso comercial).

## 4. Rotas

Mesmas URLs do site atual, para preservar SEO:

`/`, `/acomodacoes`, `/acomodacoes/[slug]`, `/experiencias`, `/sobre`, `/localizacao`, `/faq`,
`/politicas`, `/contato`, `/[slug]` (páginas criadas no CMS). Studio fica fora do site, em `*.sanity.studio`.

Idioma: PT sem prefixo. Estrutura pronta para `/en/...` (campos e rotas com locale), sem conteúdo em inglês na V1.

## 5. Modelo de conteúdo (Sanity)

- `siteSettings` (singleton): nome oficial "Sítio Recanto Azul", logo, menu, rodapé, redes sociais, SEO padrão,
  `beds24PropertyId`, `beds24Referer` (valor fixo usado nos links de reserva).
- `whatsappContact` (lista): rótulo, número, mensagem pré-preenchida, onde aparece
  (header, rodapé, botão flutuante, página). Vários contatos permitidos.
- `accommodation`: nome, slug, galeria com ponto focal, descrição rica, diferenciais, capacidade,
  comodidades, `beds24RoomId` (obrigatório para exibir preço/reserva), `ocupacaoReferencia`
  (adultos usados no cálculo do "a partir de"; padrão 2; configurável, essencial para Chalé para Grupos e Celeiro),
  `mostrarOcupacaoBase` (exibe indicação discreta da ocupação-base junto ao preço), destaque na Home + ordem, SEO.
- `experience`, `faq`, `review` (depoimento), `policy`.
- `page`: título, slug, SEO, lista ordenada de seções. A Home também é um `page`.

Não existe campo de preço no CMS. Preço vem só da Beds24.

### Seções do page builder

Cada seção é desenhada no padrão premium; a editora controla conteúdo e variantes limitadas, não layout livre.

- Hero (foto com zoom lento ou vídeo) com barra de busca opcional
- Texto editorial
- Galeria
- Faixa de acomodações (grid assimétrico)
- Destaque de acomodação
- Experiências
- Depoimentos (faixa escura)
- FAQ
- Localização/mapa
- CTA reserva/WhatsApp
- Foto em tela cheia com citação
- Pilha de cartões (efeito 01)
- Galeria horizontal (efeito 02)
- Frase manifesto (efeito 04)
- Revelação com máscara circular (efeito 05)
- Linha do tempo (efeito 07)

Efeito 22 (janela que nasce do card) é um comportamento de cards e fotos, não uma seção.
Onde cada efeito será usado é decidido depois, direto no CMS.

## 6. Integração Beds24 (somente leitura)

### Credencial

- Token exclusivo do site, long-life, somente leitura, escopos `read:properties` e `read:inventory`.
  Nenhum escopo de escrita, nenhum escopo de bookings.
- Gerado pela proprietária direto no painel Beds24 (Settings > Marketplace > API > long life token).
  Não usa invite code nem `/authentication/setup` (que gera token de 24 h + refresh token).
- Guardado só como secret do Cloudflare (`BEDS24_TOKEN`) e no `.env` local não commitado.
- Long-life token expira após 90 dias sem uso. O cron diário mantém o uso ativo; falha de autenticação gera alerta
  no log e o site cai para "Consultar disponibilidade".

### Endpoints usados

| Endpoint | Uso |
|---|---|
| `GET /properties` | Identificar `propertyId` e listar `roomId`s (setup e checagem de mapeamento) |
| `GET /inventory/rooms/availability` | Disponibilidade por período (só se está disponível ou não) |
| `GET /inventory/rooms/calendar` | Dados por dia em lote: preço diário, mínimo de noites, restrições de chegada/saída. Fonte dos motivos de indisponibilidade e dos candidatos do "a partir de" |
| `GET /inventory/rooms/offers` | Preço real calculado por check-in, check-out e ocupação. Único valor exibido como preço |

O site nunca cria, altera ou cancela reservas via API.

### Módulo `lib/beds24/` (server-only)

- `client.ts`: HTTP com header `token`, timeout de 4 s, lê `x-five-min-limit-remaining`, `x-five-min-limit-resets-in`
  e `x-request-cost`, e passa toda chamada pelo circuit breaker.
- `computeFromPrices()`: "A partir de" por acomodação (algoritmo abaixo).
- `quote({ checkin, checkout, adults, children })`: availability + offers para a propriedade inteira. Para quarto
  sem oferta, consulta o calendar do período para identificar motivo (mínimo de noites, restrição de chegada/saída).
  Availability sozinho não explica causa. Retorna por `roomId` um destes estados:
  - `available` com total real da estadia (de offers);
  - `unavailable` com motivo quando o calendar indicar; sem motivo identificável, só "Indisponível nessas datas";
  - `error` (timeout, rate limit, autenticação, resposta inesperada).
- `bookingUrl({ roomId, checkin?, numnight?, adults?, children? })`: monta o link do booking engine.
- Nenhuma página ou componente chama a Beds24 diretamente; só por este módulo.

### Limite de consumo e cache

Limite padrão da conta: 100 créditos a cada 5 minutos, compartilhado com tudo que usa a API da conta.

- "A partir de" = menor estadia válida de 2 noites numa janela móvel de 90 dias, para a `ocupacaoReferencia` da
  acomodação. Exibição: "A partir de R$ X/noite", onde X = total real dessa estadia ÷ 2. Nunca diária teórica.
  Cron Trigger a cada ~6 h:
  1. Uma chamada `calendar` em lote (todos os quartos, 90 dias): preço diário, mínimo de noites, restrições.
  2. Para cada quarto, gerar candidatos de 2 noites: datas disponíveis, mínimo de noites ≤ 2, chegada e saída
     permitidas. Ordenar pela soma dos preços diários e manter os 3 mais baratos.
  3. Validar candidatos com `offers` na `ocupacaoReferencia` (chamadas agrupadas por data de chegada, cada uma cobre
     todos os quartos). O primeiro candidato com oferta válida define X.
  4. Gravar no KV `{ roomId, total, noites: 2, ocupacao, checkin, calculadoEm }`.
  5. Sem estadia válida na janela: sem "a partir de"; card mostra "Consultar disponibilidade".
  A renderização das páginas nunca chama a Beds24. Valor com mais de 24 h é tratado como inexistente.
  Indicação discreta de ocupação-base (ex.: "base 10 hóspedes") quando `mostrarOcupacaoBase` estiver ligado.
- Busca por datas: rota `/api/quote`, availability + offers por combinação (datas + ocupação), mais calendar só
  quando houver quarto sem oferta. Cache de 5 min na Cache API do Cloudflare. Após a busca, o total real da estadia
  aparece com destaque em cada acomodação disponível.
- Proteções da rota: validação de entrada (datas futuras, checkout depois do check-in, máx. 30 noites,
  limites de hóspedes) e limite por IP via binding de rate limiting do Cloudflare.
- Circuit breaker de créditos (em todo o módulo, cron e busca):
  - toda resposta atualiza créditos restantes e tempo de reset (`x-five-min-limit-remaining`,
    `x-five-min-limit-resets-in`);
  - margem reservada de 20 créditos para os demais consumidores da conta;
  - antes de cada chamada: se restantes − custo estimado < 20, o breaker abre e nenhuma chamada sai até o reset;
  - HTTP 429 também abre o breaker até o reset;
  - breaker aberto: busca responde `error` ("Consultar disponibilidade"); cron interrompe e mantém o último valor
    válido dentro da janela de 24 h;
  - estado do breaker guardado no KV só quando muda (abre/fecha), para não gastar a cota de escritas.
- Logs: só `roomId`, status e custo. Nada de dados de visitante.

### Regra de exibição

- Estado `available`: total da estadia + "Reservar".
- Estado `unavailable`: motivo, sem preço.
- Estado `error` ou sem dado válido: "Consultar disponibilidade" + WhatsApp.
- Nunca exibir preço antigo como atual.
- Enquanto a validação da seção 7 não fechar, todos os cards usam "Consultar disponibilidade"
  (flag `PRICES_ENABLED=false`).

### Fluxo de reserva

- Sem pesquisa: "Reservar" abre `booking2.php?propid=…&roomid=…&referer=…`.
- Após pesquisa: lista mostra só acomodações e estados conforme a resposta da Beds24. "Reservar" abre
  `booking2.php?propid=…&roomid=…&checkin=…&numnight=…&numadult=…&numchild=…&br1-<roomid>=Book&referer=…`.
- Link abre em nova aba. Parâmetros de busca ficam na URL do site (link compartilhável, botão voltar funciona).

## 7. Validação obrigatória antes de exibir preços

Testes live somente leitura (a Beds24 não tem sandbox fiel à produção):

1. Escolher períodos reais: fim de semana, meio de semana, feriado, alta temporada.
2. Consultar offers pela API para cada período e ocupação.
3. Abrir o booking engine com exatamente as mesmas datas e hóspedes.
4. Comparar total da API com total do booking engine.
5. Cobrir: mínimo de noites, datas indisponíveis, adulto + criança, pelo menos uma tarifa com variação,
   uma acomodação de grupo (Chalé para Grupos ou Celeiro) com ocupação alta, e a estadia escolhida pelo
   "a partir de" de cada acomodação (total ÷ 2 confere com o checkout).
6. Registrar resultado em `docs/beds24-validacao.md`.
7. `PRICES_ENABLED` só vira `true` quando todos os casos passarem. Qualquer divergência: continua `false` até a
   regra ser entendida.

## 8. Direção visual

- Referência principal: Tide / Stay (editorial boutique). Da Riviera Palace, só a faixa escura de depoimentos e o rodapé escuro.
  Evitar fileira de ícones genéricos, grade de Instagram e cards brancos iguais em linha.
- Paleta: azul-marinho da logo como cor principal (texto, CTAs, faixas escuras) + neutros
  (off-white quente, areia, pedra, grafite suave). Laranja só dentro da própria logo, nunca na interface.
- Tipografia: serifada fina para títulos (não compete com o nome manuscrito da logo) + sans limpa para texto;
  rótulos pequenos em caixa alta com espaçamento largo.
- Logo vetorizada em SVG a partir do PNG master; aprovação final da proprietária.
- Traço da serra com araucárias da logo vira elemento gráfico (divisor que se desenha na rolagem).
- Fotos: somente do sítio, da `Biblioteca Oficial` (cópias; originais nunca alterados). Cada acomodação usa só suas fotos.
- Conteúdo factual conforme `acomodacoes.md` da direção de marca; nada inventado.
- Fase 2 entrega 2–3 propostas visuais (Home mobile + desktop com fotos reais) para a proprietária escolher;
  a escolha vira tokens de design.

## 9. Movimento

- Hero: zoom lento contínuo (escala 1 → 1,06 em ~20 s).
- Demais fotos: parallax sutil (deslocamento ~6% dentro da moldura).
- Efeitos 01, 02, 04, 05, 07 e 22, reescritos como componentes React (os trechos de referência não são colados:
  usam contêiner de demo, HTML trocado e função `aoRolar` ausente).
- Só `transform`, `opacity` e `clip-path`. Escurecimento do efeito 01 por camada com opacidade, não `filter`.
- Animação só roda com a seção visível.
- `prefers-reduced-motion`: tudo estático e legível.
- Texto do efeito 04 é texto real no HTML.
- Janela do efeito 22: fecha com Esc, botão voltar e toque fora; foco preso dentro dela.
- No máximo um efeito pesado por tela visível.

## 10. Testes

TDD: teste antes do código.

- Vitest: validação de entrada da busca, `bookingUrl`, conversão de respostas/erros da Beds24 nos três estados,
  regra de cache e corte por rate limit, links de WhatsApp.
- Playwright (Beds24 simulada): Home carrega, busca mostra cada estado, "Reservar" e WhatsApp com link correto,
  `prefers-reduced-motion` desliga efeitos, edição de rascunho não aparece para visitante.
- Lighthouse CI com orçamento ≥ 95.
- Revisão visual em 390, 430, 768 e 1440 px antes de cada entrega.

## 11. Fases

### Fase 1 — Fundação

- Confirmar repo, atualizar `main`, criar tag `site-v1-final` + branch `archive/site-v1`, criar `v2`.
- `CLAUDE.md` antigo fica preservado na tag `site-v1-final` e em `archive/site-v1`.
- Primeiro commit da `v2`: novo `CLAUDE.md`/`AGENTS.md` com o fluxo de branches deste documento (o antigo manda
  push direto em `main`) + esta spec.
- Remover código antigo na `v2`; `vercel.json` desativando build da `v2`.
- Next.js + Sanity (Studio hospedado no Sanity, schemas, Presentation tool) + Cloudflare Workers com preview da `v2`.
- Medir CPU e limites no Workers Free (páginas, draft, `/api/quote`, cron); migrar para Workers Paid só se exceder.
- `lib/beds24/` com client, tipos, testes e secrets configurados.
- Identificar `propertyId` e listar `roomId`s via `GET /properties`; registrar o mapeamento.
- Pronto quando: preview da `v2` no ar; clicar num texto, editar e ver mudar ao vivo; chamada autenticada a
  `GET /properties` funcionando só no servidor.

Ação da proprietária: gerar invite code Beds24 com escopos `read:properties` + `read:inventory`; criar projeto
Sanity (ou autorizar criação); acesso à conta Cloudflare.

### Fase 2 — Design e páginas

- Propostas visuais, escolha, tokens de design, logo SVG.
- Todas as seções, efeitos e rotas.
- Conteúdo migrado e `beds24RoomId` de cada acomodação preenchido. Textos vêm do site em produção / Supabase antigo
  (somente leitura), não do seed do repo, que está desatualizado; inclui páginas customizadas da tabela `pages`.
  Fotos da Biblioteca Oficial.
- Links Beds24 corretos; cards ainda com "Consultar disponibilidade" (`PRICES_ENABLED=false`).
- Pronto quando: site completo navegável no preview e aprovado visualmente.

### Fase 3 — Beds24 live

- Disponibilidade, "A partir de", busca por datas/hóspedes, total da estadia, links pré-preenchidos.
- Validação da seção 7 completa e registrada.
- `PRICES_ENABLED=true` só após validação sem divergência.

### Fase 4 — Lançamento

- Testes finais, redirects 301 de URLs antigas que mudarem, sitemap, SEO, Cloudflare Web Analytics.
- Pré-requisito: V2 validada no preview do Cloudflare.
- Sequência:
  1. "Pode publicar" explícito da proprietária.
  2. Trocar registros DNS no Cloudflare da Vercel para o Worker.
  3. Smoke test em produção (rotas, busca, Reservar, WhatsApp, editor).
  4. Desligar/desconectar o deploy automático da Vercel (projeto fica pausado alguns dias para rollback).
  5. Merge `v2 → main`.
  6. Cloudflare passa a usar `main` como branch de produção.
- Rollback: voltar os registros DNS para a Vercel.
- Depois de estável: desativar o projeto Supabase antigo (ação da proprietária).

## 12. Fora da V1

Motor de reserva próprio, checkout, iframe Beds24, escrita na Beds24, blog, newsletter, conteúdo em inglês,
formulário de contato (WhatsApp cobre).
