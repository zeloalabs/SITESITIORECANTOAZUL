# Infraestrutura — decisão de hospedagem e medições

Limites do Workers Free: 10 ms de CPU por requisição, 100 mil requisições/dia, 50 subrequests por requisição,
5 Cron Triggers, Worker de até 3 MiB comprimido.

## Decisão de hospedagem (Task 3, 2026-10-01): vinext (Aprovado)

Adaptador escolhido: `vinext` 1.0.0 (`@vinext/cloudflare` 1.0.0, `@cloudflare/vite-plugin` 2.0.0-beta.sha-ad79608dd, `cf` 1.0.0-beta.10, `vite` 8.3.2, `next-sanity` 13.3.4, `react-server-dom-webpack` 19.2.8 pinned, Node 24).

### Motivo da escolha do vinext vs descarte do OpenNext

1. **CPU e limites Workers Free (10 ms):**
   - O OpenNext opera consistentemente **acima do limite de 10 ms do Workers Free**: 12,0 ms p50 na base estática, 14,5 ms p50 com Sanity, p95 de ~95 ms e picos de até 105 ms. Isso exigiria migração imediata para o plano Workers Paid (US$ 5/mês) para evitar erros e cortes de execução.
   - O vinext opera com **2,00 ms p50**, **3,00 ms p95** e **3,00 ms máx** (80% de folga livre abaixo do teto de 10 ms).
2. **Tamanho do Worker:**
   - O bundle vinext com Sanity tem **560,20 KiB gzip** (1.869,89 KiB total), cerca de **3× menor** que o OpenNext (1.695 KiB gzip / ~5,5 MiB descompactado).
3. **Segurança de secrets:**
   - O OpenNext embute arquivos `.env*` no Worker compilado (`.open-next/cloudflare/next-env.mjs`).
   - O vinext utiliza estritamente `bindings.secret()` do `@vinext/cloudflare` / Cloudflare Workers, garantindo zero vazamento de secrets em bundles e HTML.
4. **Arquitetura mínima:**
   - Adotada arquitetura sem `workers-cache`, sem Cache Components (`cacheComponents: false`), sem R2, sem KV e sem Durable Objects.
   - Cada requisição do site renderiza via SSR/RSC consumindo diretamente do Content Lake / CDN do Sanity, garantindo frescor imediato de dados com CPU ínfima (2 ms).

### Gate vinext — 100% Aprovado no Worker Remoto

Testado e validado em `https://sitio-recanto-azul-vinext-spike.zeloapms.workers.dev` e consolidado no preview oficial `https://sitio-recanto-azul-site.zeloapms.workers.dev`:

| # | Critério | Resultado | Evidência |
|---|---|---|---|
| 1 | Ativação do Draft Mode | **Passa** | 401 sem secret; 307 com cookie `__prerender_bypass` e `sanity-preview-perspective=drafts` quando autenticado com secret válido |
| 2 | Cookie de draft no Worker remoto | **Passa** | `(await draftMode()).isEnabled` retorna `true` com cookie e renderiza `<VisualEditing />` no RSC stream |
| 3 | Presentation / Visual Editing | **Passa** | Sanity Studio conecta com CORS credentials ativo, sem erros de CORS, detectando documentos da página |
| 4 | Clicar no conteúdo e abrir campo | **Passa** | Clique no elemento overlay abre o documento e navega diretamente para os campos Título e Lesma no Studio |
| 5 | Rascunho atualizar ao vivo | **Passa** | Edição no Studio grava `drafts.home` e atualiza a visualização em tempo real |
| 6 | Conteúdo publicado separado do draft | **Passa** | Documento publicado permanece intacto e isolado de alterações em rascunho |
| 7 | Visitante comum sem draft cookie | **Passa** | Visitante anônimo recebe apenas conteúdo publicado, sem stega encoding e sem scripts de overlay |
| 8 | Tokens e segredos protegidos | **Passa** | Segredos restritos a `bindings.secret()`, sem exposição em bundle, HTML ou logs |

### Configuração de Cache

- Arquitetura mínima adotada: sem `workers-cache`, sem R2, sem KV, sem Durable Objects.
- Não utilizar Cache Components (`'use cache'`).
- Segredos lidos exclusivamente via `getCloudflareContext().env` ou `bindings.secret()`, nunca embutidos em `.env.local` de produção.

## Medições (Workers Free, `*.workers.dev`, `wrangler tail`)

| Data | Adaptador | Worker | Rota | Cache | CPU p50 | CPU p95 | CPU máx | Wall p50 | Gzip Worker | Observação |
|---|---|---|---|---|---|---|---|---|---|---|
| 2026-10-01 | OpenNext | `sitio-recanto-azul-site` | `/` com Sanity (gate) | nenhum | 14,5 ms | ~95 ms | 105 ms | 47,5 ms | 1.695 KiB | n=12; estoura limite Free (10 ms) |
| 2026-10-01 | OpenNext | `sitio-recanto-azul-site` | `/` base estática (v2) | nenhum | 12,0 ms | 17,6 ms | 19,0 ms | 14,0 ms | 960,9 KiB | n=15; estoura limite Free (10 ms) |
| 2026-10-01 | vinext | `sitio-recanto-azul-vinext-spike` | `/` base estática (spike) | nenhum | 2,0 ms | 3,0 ms | 3,0 ms | 3,0 ms | 387,0 KiB | n=15; sem dados externos |
| 2026-10-01 | vinext | `sitio-recanto-azul-vinext-spike` | `/` com Sanity (spike) | nenhum | 2,0 ms | 2,3 ms | 49,0 ms (cold) / 3,0 ms (warm) | 2,0 ms | 559,0 KiB | n=15; dados do Sanity em produção |
| 2026-10-01 | vinext | `sitio-recanto-azul-site` | `/` com Sanity (v2 final) | nenhum | **2,00 ms** | **3,00 ms** | **3,00 ms** | **2,00 ms** | **560,20 KiB** | n=20; preview oficial v2, 80% folga Free |

Contexto das medições:
- Coleta direta via `wrangler tail --format json` dos eventos de runtime do Cloudflare via script `/tmp/measure_cpu.py`.
- Benchmark final executado no Worker oficial `sitio-recanto-azul-site` gerado pelo build da branch `v2`.
- Condições: Node 24, query Sanity real, dataset `production`, sem Cache Components, secret via `bindings.secret()`.
- Erros ou exceções observadas nas 20 requisições: 0.

