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

| Data | Adaptador | Rota | Cache | CPU p50 | CPU máx | Wall p50 | Observação |
|---|---|---|---|---|---|---|---|
| 2026-10-01 | OpenNext | `/` com Sanity (gate) | nenhum | 14,5 ms | 105 ms | 47,5 ms | n=12; renderiza a cada requisição |
| 2026-10-01 | OpenNext | `/` base estática (v2) | nenhum | 13,0 ms | 22 ms | 17 ms | n=14; sem nenhum dado |

Contexto: cada amostra tem 12–14 requisições, logo após um deploy; todas com outcome `ok`.

Conclusão provisória: acima do limite nominal de 10 ms, sem falhas observadas. O custo vem do runtime do
adaptador (a página base sem dados já mede 13 ms), não do Sanity. Cache incremental (R2 + D1) ainda passa pelo
Worker, então não está provado que baixe a CPU. Opções: cache do HTML na borda à frente do Worker (exige hostname
na zona, ou seja, DNS, decisão de lançamento), Workers Paid (US$ 5/mês), ou medir a CPU do vinext. Decisão da
proprietária.
