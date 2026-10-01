# Infraestrutura — decisão de hospedagem e medições

Limites do Workers Free: 10 ms de CPU por requisição, 100 mil requisições/dia, 50 subrequests por requisição,
5 Cron Triggers, Worker de até 3 MiB comprimido.

## Decisão de hospedagem (Task 3, 2026-10-01): OpenNext

Adaptador escolhido: `@opennextjs/cloudflare` 1.20.7 (Wrangler 4.145.0, Next 16.3.8, Node 24).
vinext reprovou no gate: draft mode entra em loop com o adaptador de cache escolhido (`workers-cache`) e o
toolchain só funciona em beta (detalhes abaixo). Os dois spikes ficaram em branches locais (`spike/vinext-gate`, `spike/opennext-gate`),
nunca enviadas ao GitHub.

### Modo de integração Sanity: sem Cache Components

`cacheComponents: true` foi descartado. Evidência: um app trivial com Cache Components (um `'use cache'` e um
`<Suspense>` lendo `draftMode()`, sem nenhum Sanity) trava no runtime Workers via OpenNext — HTTP 500,
"The Workers runtime canceled this request because it detected that your Worker's code had hung", e o Next avisa
"Next.js cannot guarantee that Cache Components will run as expected due to the current runtime's implementation
of `setTimeout()`". `next-sanity` 13 suporta o modo sem Cache Components (guia de migração v12→v13); nesse modo cada
`sanityFetch` faz duas consultas ao Content Lake (tags + resultado). É o desenho original do plano (Task 5).

### Gate vinext — reprovado

Versões: vinext 1.0.0, @vinext/cloudflare 1.0.0, @cloudflare/vite-plugin 2.0.0-beta.sha-ad79608dd, cf 1.0.0-beta.10,
vite 8.3.2, next-sanity 13.3.4. O plugin estável (1.62.3) gera Worker só de assets (404 em todas as rotas); só a
beta v2 funciona. Toolchain inteiro em beta.

| # | Critério | Com Cache Components | Sem Cache Components |
|---|---|---|---|
| 1 | Build, Worker < 3 MiB | passa (~635 KiB gzip) | passa |
| 2 | Home lê Sanity | passa | passa |
| 3 | `/api/draft-mode/enable` | **falha** com o adaptador escolhido (`workers-cache`; o `vinext init` também oferece response-store, static-assets, data-cache e none, não testados): "TypeError: Too many redirects", loop em `/?sanity-preview-perspective=drafts`, requisição interna com `__vinext_cache_key`. Sem o adaptador: 307 + cookie | **falha** igual com o adaptador; sem adaptador não há cache nenhum |
| 4 | Presentation: overlays + rascunho ao vivo | **falha**: `'use cache'` devolve rascunho antigo em draft mode (Next documenta que em draft mode funções em cache são reexecutadas) | inconclusivo: o Presentation reaproveitou cookie de outro build e não chamou o enable |
| 5 | Anônimo não vê rascunho | passa | passa |
| 6 | Publicar atualiza público | passa (com visitante conectado) | não medido |
| 7 | Secret só no servidor | passa após declarar `bindings.secret()` em `cloudflare.config.ts` | passa |

Também: em `vite dev`, "Invalid hook call" no `SanityLive` (duas cópias de React no otimizador do Vite).

Comparação em pé de igualdade: o OpenNext também roda sem cache hoje. Sem nenhum adaptador de cache, o vinext
passou no critério 3. Nessa condição, o que sobra contra o vinext é o critério 4 inconclusivo no modo final e o
toolchain só em beta. A CPU do vinext não foi medida (bundle ~635 KiB gzip, cerca de um terço do OpenNext com
next-sanity).

### Gate OpenNext — aprovado localmente (sem Cache Components); critérios 3 e 4 pendentes no deploy

| # | Critério | Resultado | Onde |
|---|---|---|---|
| 1 | Build, Worker < 3 MiB | passa: 961 KiB gzip só a base; 1.695 KiB gzip com o código do gate (next-sanity) | dry-run e deploy |
| 2 | Home lê Sanity | passa | `wrangler dev` e `*.workers.dev` |
| 3 | `/api/draft-mode/enable` | passa: 401 com secret inválido; Presentation liga draft mode | `wrangler dev` |
| 4 | Presentation: overlays + rascunho ao vivo | passa: overlay, clique abre o campo, rascunho atualiza no preview sem recarregar | `wrangler dev` |
| 5 | Anônimo não vê rascunho | passa | `wrangler dev` |
| 6 | Publicar atualiza público | passa: publicado sem nenhum visitante conectado, requisição nova mostrou o título novo em ≤ 5 s. Só porque nada é cacheado (toda requisição renderiza e busca no Sanity); se cache for adicionado, refazer este teste e usar webhook/Live para revalidar | `*.workers.dev` |
| 7 | Secret só no servidor | passa: tokens como Worker secrets; 0 ocorrências em `.open-next/` | deploy |

Pendente no `*.workers.dev`: critérios 3 e 4 (precisam da origem `https://sitio-recanto-azul-site.zeloapms.workers.dev`
nas CORS origins do Sanity, com credentials, e do Studio com `SANITY_STUDIO_PREVIEW_URL` apontando para ela).

Achado de segurança: o OpenNext embute arquivos `.env*` no Worker (`.open-next/cloudflare/next-env.mjs`).
Secrets ficam só em `.dev.vars` (local) e em Worker secrets (deploy); `.env.local` só com variáveis `NEXT_PUBLIC_*`.

Dependência: `esbuild` ^0.28 explícito em devDependencies (o OpenNext importa esbuild sem declará-lo de forma
resolvível; 0.25 conflita com o peer do vite).

### Cache

Configuração atual: nenhum override (`defineCloudflareConfig()`), sem R2, D1, KV ou Durable Objects.
Sem cache incremental, o Worker renderiza a página a cada requisição.

## Medições (Workers Free, `*.workers.dev`, `wrangler tail`)

| Data | Adaptador | Worker | Rota | Cache | CPU p50 | CPU p95 | CPU máx | Wall p50 | Gzip Worker | Observação |
|---|---|---|---|---|---|---|---|---|---|---|
| 2026-10-01 | OpenNext | `sitio-recanto-azul-site` | `/` com Sanity (gate) | nenhum | 14,5 ms | ~95 ms | 105 ms | 47,5 ms | 1.695 KiB | n=12; renderiza a cada requisição |
| 2026-10-01 | OpenNext | `sitio-recanto-azul-site` | `/` base estática (v2) | nenhum | 12,0 ms | 17,6 ms | 19,0 ms | 14,0 ms | 960,9 KiB | n=15; sem dados externos |
| 2026-10-01 | vinext | `sitio-recanto-azul-vinext-spike` | `/` base estática (spike) | nenhum | 2,0 ms | 3,0 ms | 3,0 ms | 3,0 ms | 387,0 KiB | n=15; sem dados externos |
| 2026-10-01 | vinext | `sitio-recanto-azul-vinext-spike` | `/` com Sanity (spike) | nenhum | 2,0 ms | 2,3 ms | 49,0 ms (cold) / 3,0 ms (warm) | 2,0 ms | 559,0 KiB | n=15; dados do Sanity em produção |

Contexto das medições:
- Coleta direta via `wrangler tail --format json` dos eventos de runtime do Cloudflare.
- OpenNext medido no Worker baseline `sitio-recanto-azul-site`.
- vinext medido em Worker isolado `sitio-recanto-azul-vinext-spike`.
- Condições idênticas: Node 24, mesma query Sanity (`*[_type == "page" && slug.current == "home"][0]{ _id, title }`), mesmo dataset `production`, sem Cache Components (`cacheComponents` desativado em ambos).

### Análise comparativa

1. **CPU:**
   - Página estática mínima: vinext gasta **2,0 ms p50** contra **12,0 ms p50** do OpenNext (6× menor).
   - Home lendo Sanity: vinext gasta **2,0 ms p50** (warm 1–3 ms, máx 49 ms em cold start) contra **14,5 ms p50** do OpenNext (máx 105 ms).
   - O vinext opera confortavelmente **abaixo do limite de 10 ms do Workers Free**.
   - O OpenNext opera consistentemente **acima do limite de 10 ms do Workers Free** (12–14,5 ms p50), exigindo plano Workers Paid (US$ 5/mês) para produção estável sem risco de corte por CPU.

2. **Tamanho do Worker:**
   - Estática: vinext **387 KiB gzip** vs OpenNext **961 KiB gzip** (2,5× menor).
   - Com Sanity: vinext **559 KiB gzip** vs OpenNext **1.695 KiB gzip** (3× menor).

3. **Status dos critérios restantes no deploy remoto (`*.workers.dev`):**
   - **CORS Sanity:** A origem `https://sitio-recanto-azul-site.zeloapms.workers.dev` (e a do spike `https://sitio-recanto-azul-vinext-spike.zeloapms.workers.dev`) ainda **não** está adicionada nas CORS Origins do Sanity. Tokens disponíveis localmente (`SANITY_API_READ_TOKEN` e `SANITY_API_BROWSER_TOKEN`) são tokens de Viewer (read-only) e não possuem grant `sanity.project.cors/write`. Requer inclusão manual pela proprietária no painel Sanity Manage (API → CORS Origins → Add CORS origin com credentials).
   - **Draft Mode remoto:** No Worker vinext do spike, as rotas `/api/draft-mode/enable` (401 com secret ausente/inválido) e `/api/draft-mode/disable` (307 limpando cookie) estão ativas e funcionando. No OpenNext baseline na `v2`, a base atual está estática (404 em rotas de draft até serem integradas no Task 5).
   - **Visitante comum:** Confirmado que visitante anônimo nunca vê rascunho (vê apenas conteúdo `published`). Tokens nunca são expostos.

