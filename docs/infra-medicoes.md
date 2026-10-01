# Infraestrutura — decisão de hospedagem e medições

Limites do Workers Free: 10 ms de CPU por requisição, 100 mil requisições/dia, 50 subrequests por requisição,
5 Cron Triggers, Worker de até 3 MiB comprimido.

## Decisão de hospedagem (Task 3, 2026-10-01): vinext (Aprovado)

Adaptador escolhido: `vinext` 1.0.0 (`@vinext/cloudflare` 1.0.0, `@cloudflare/vite-plugin` 2.0.0-beta.sha-ad79608dd, `cf` 1.0.0-beta.10, `vite` 8.3.2, `next-sanity` 13.3.4, `react-server-dom-webpack` 19.2.8 pinned, Node 24).

### Motivo da escolha do vinext vs descarte do OpenNext

1. **CPU e limites Workers Free (10 ms):**
   - O OpenNext opera consistentemente **acima do limite de 10 ms do Workers Free**: 12,0 ms p50 na base estática, 14,5 ms p50 com Sanity, p95 de ~95 ms e picos de até 105 ms. Isso exigiria migração imediata para o plano Workers Paid (US$ 5/mês) para evitar erros e cortes de execução.
   - O vinext mediu **2,00 ms p50**, **3,00 ms p95** e **3,00 ms máx** — mas eram HITs do cache em memória do vinext (ver Task 5).
     Render real aquecido do vinext: **~7–8 ms p50** (Task 5), ainda abaixo do OpenNext (14,5 ms p50).
2. **Tamanho do Worker:**
   - O bundle vinext com Sanity tem **560,20 KiB gzip** (1.869,89 KiB total), cerca de **3× menor** que o OpenNext (1.695 KiB gzip / ~5,5 MiB descompactado).
3. **Segurança de secrets:**
   - O OpenNext embute arquivos `.env*` no Worker compilado (`.open-next/cloudflare/next-env.mjs`).
   - O vinext utiliza estritamente `bindings.secret()` do `@vinext/cloudflare` / Cloudflare Workers, garantindo zero vazamento de secrets em bundles e HTML.
4. **Arquitetura mínima:**
   - Adotada arquitetura sem `workers-cache`, sem Cache Components (`cacheComponents: false`), sem R2, sem KV e sem Durable Objects.
   - (Corrigido no Task 5) Os 2 ms vinham do cache em memória do vinext, não de render por requisição. Ver "Workers Cache (Task 5)".

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

> **Superado em 2026-10-01 (Task 5)** — ver "Workers Cache (Task 5)" abaixo. A medição de 2,00 ms do gate era de
> cache HIT em memória do vinext, não de render real.

- Arquitetura mínima adotada: sem R2, sem KV, sem Durable Objects.
- Não utilizar Cache Components (`'use cache'`).
- Segredos lidos exclusivamente via `getCloudflareContext().env` ou `bindings.secret()`, nunca embutidos em `.env.local` de produção.

## Medições (Workers Free, `*.workers.dev`, `wrangler tail`)

| Data | Adaptador | Worker | Rota | Cache | CPU p50 | CPU p95 | CPU máx | Wall p50 | Gzip Worker | Observação |
|---|---|---|---|---|---|---|---|---|---|---|
| 2026-10-01 | OpenNext | `sitio-recanto-azul-site` | `/` com Sanity (gate) | nenhum | 14,5 ms | ~95 ms | 105 ms | 47,5 ms | 1.695 KiB | n=12; estoura limite Free (10 ms) |
| 2026-10-01 | OpenNext | `sitio-recanto-azul-site` | `/` base estática (v2) | nenhum | 12,0 ms | 17,6 ms | 19,0 ms | 14,0 ms | 960,9 KiB | n=15; estoura limite Free (10 ms) |
| 2026-10-01 | vinext | `sitio-recanto-azul-vinext-spike` | `/` base estática (spike) | nenhum | 2,0 ms | 3,0 ms | 3,0 ms | 3,0 ms | 387,0 KiB | n=15; sem dados externos |
| 2026-10-01 | vinext | `sitio-recanto-azul-vinext-spike` | `/` com Sanity (spike) | nenhum | 2,0 ms | 2,3 ms | 49,0 ms (cold) / 3,0 ms (warm) | 2,0 ms | 559,0 KiB | n=15; dados do Sanity em produção |
| 2026-10-01 | vinext | `sitio-recanto-azul-site` | `/` com Sanity (v2 final) | nenhum | **2,00 ms** | **3,00 ms** | **3,00 ms** | **2,00 ms** | **560,20 KiB** | n=20; **cache HIT em memória do vinext** (ver Task 5), não render real |

Contexto das medições:
- Coleta direta via `wrangler tail --format json` dos eventos de runtime do Cloudflare via script `/tmp/measure_cpu.py`.
- Benchmark final executado no Worker oficial `sitio-recanto-azul-site` gerado pelo build da branch `v2`.
- Condições: Node 24, query Sanity real, dataset `production`, sem Cache Components, secret via `bindings.secret()`.
- Erros ou exceções observadas nas 20 requisições: 0.


## Workers Cache (Task 5, 2026-10-01) — decisão: Workers Free + Workers Cache

### Problema encontrado
- O vinext guarda páginas num cache **em memória por isolate** (`x-vinext-cache: HIT`, `s-maxage=31536000`).
  O `next-sanity` busca com `revalidate: false`, e a revalidação on-demand do `SanityLive` só limpa o isolate
  que recebe a server action. Resultado observado: a Home ficou presa vazia depois de apagar o documento do spike.
- A Home passou a ser dinâmica (`export const dynamic = "force-dynamic"` no layout). Render real, aquecido:
  **CPU p50 7 ms, p95 8 ms, máx 9–11 ms** (n=24) — perto/acima do limite Free.

### Arquitetura adotada
- Entrada própria do Worker: `src/worker/index.ts`.
  - Gateway `default`: **sem** Workers Cache (`cache.enabled: false` global).
  - `PublicPages` (`WorkerEntrypoint`): **com** Workers Cache (`exports.PublicPages.cache.enabled: true`), chamado via
    `ctx.exports.PublicPages.fetch()`.
  - Declarar `default` em `exports` quebra o `vite dev` do `@cloudflare/vite-plugin` (gera `export const default`),
    por isso o desligamento do gateway é pelo `cache` global.
- Só vai ao cache (`src/worker/cache-policy.ts`): `GET`/`HEAD`, fora de `/api/*`, sem cookie
  `__prerender_bypass`/`sanity-preview-perspective`, sem `Authorization`, sem `RSC`/`_rsc`.
- Resposta pública 200 sem `Set-Cookie`: `Cache-Control: public, max-age=0, must-revalidate`,
  `CDN-Cache-Control: max-age=60`, `Cache-Tag: public-pages`. Qualquer outra: `private, no-store`.
- Draft Mode/Presentation e páginas fora do cache: `Cache-Control: private, no-store`.
- Invalidação: webhook Sanity `site-v2-purge-cache` (id `6mwqYU2DEAh4yeS5`, dataset `production`, sem drafts,
  `create/update/delete` de `page`, `siteSettings`, `accommodation`, `whatsappContact`) →
  `POST /api/sanity-webhook` (assinatura HMAC via `@sanity/webhook`, secret `SANITY_WEBHOOK_SECRET`) →
  RPC `PublicPages.purgePublicCache()` → `ctx.cache.purge({ tags: ["public-pages"] })`.
  O purge é por entrypoint; por isso roda dentro do `PublicPages`.
- TTL de 60 s na borda é o fallback se o purge falhar.
- Cache-key inclui a versão do Worker: cada deploy começa frio.
- Sem R2, KV, Durable Objects ou Cache Components. `workers-cache` do vinext continua fora.

### Medições (preview `sitio-recanto-azul-site`, `wrangler tail`)

| Caso | n | CPU p50 | CPU p95 | CPU máx | Observação |
|---|---|---|---|---|---|
| HIT (`/`) | 25 | 0 ms (gateway) | 0 ms | 0 ms | `PublicPages` não executa; só o gateway roda |
| MISS `PublicPages` (1ª rodada, deploy novo) | 15 | 52 ms | 119 ms | 120 ms | isolates frios; MISS roda no tier superior |
| MISS `PublicPages` (2ª rodada) | 30 | 19 ms | 89 ms | 113 ms | wall ~640 ms nos frios |
| Render sem cache no gateway (cookie inválido) | 17 | 8 ms | 15 ms | 49 ms | mesmo render, isolate local aquecido |

Leitura: HIT não gasta CPU de render. MISS fica acima de 10 ms com frequência, porque quase sempre cai num isolate
frio (tiered cache). Todos os eventos com `outcome: ok` (nenhum corte). Com TTL de 60 s, MISS ≈ 1 por minuto por
local de cache. **Repetir a medição com a Home real da Fase 2; se os MISS passarem de 10 ms de forma consistente,
migrar para Workers Paid.**

### Verificação ponta a ponta (preview remoto)
| Teste | Resultado |
|---|---|
| 1ª requisição pública | `MISS`, conteúdo correto; seguintes `HIT` |
| Draft Mode | 307 + cookies `__prerender_bypass`, `sanity-preview-perspective`, `sanity-preview-variant`; resposta `private, no-store`, sem `cf-cache-status` |
| Clique → campo (stega) | Hero → `page-home` `sections[_key=="hero1"].title`; Texto → `sections[_key=="texto1"].title` e `.body[...].text` |
| Draft visível em draft mode | sim (título de rascunho + stega) |
| Anônimo durante draft (20×) | 0 rascunho, 0 stega, 0 `drafts.`; 19 HIT / 1 EXPIRED |
| Descartar draft | draft view e anônimo voltam ao publicado |
| Publicar | visível ao anônimo em 2,7 s (webhook → purge → MISS); 20/20 seguintes com o novo título |
| Fallback sem purge (webhook desativado) | novo conteúdo visível em 34 s (`EXPIRED`) |
| Tokens | prefixos do token server, browser e do secret do webhook: 0 no HTML/RSC anônimo, 0 nos ~850 KB de JS, 0 no build, 0 em `wrangler tail`, logs de build/deploy e `vite dev`. Token browser: 1 ocorrência só em draft mode (HTML e RSC). Token server: 0 em draft mode |
| Beds24/API | `/api/*` nunca vai ao `PublicPages`; sem `cdn-cache-control` (teste unitário + e2e) |

Limite desta verificação: clique → campo foi provado pelo destino do stega (o mesmo que o overlay usa), e o draft por
render em draft mode. A atualização ao vivo dentro do iframe do Presentation não foi observada visualmente nesta sessão.

### Pontos de atenção para a Fase 2
- `<SanityLive />` no público: a cada evento de publicação, a action responde `"refresh"` e o navegador faz
  `router.refresh()` (requisição RSC, fora do cache) em cada aba aberta. Proposta pendente de decisão: renderizar
  `<SanityLive />` só em draft mode; visitante passa a ver novo conteúdo ao recarregar (purge + TTL 60 s).
- Navegação/prefetch RSC (`RSC`/`_rsc`) sempre pula o cache (render no gateway).
- Parâmetros de rastreio únicos (`fbclid`, `gclid`, `utm_*`) criam chave de cache nova por link; normalizar no gateway.
- Com Workers Cache ligado, toda requisição conta na cota de 100 mil/dia (inclusive HIT e a chamada loopback ao
  `PublicPages`); assets estáticos também passam a contar, segundo a documentação.
- HEAD em chave fria seguido de GET: verificado, GET recebe HIT com corpo completo.

### Desvios do plano
1. Home dinâmica na origem + Workers Cache na borda, não estática/ISR (Step 6b).
2. `compatibilityDate` `2026-10-01` → `2026-09-28` (workerd local só suporta até 2026-09-28).
3. `npm run dev` agora roda vinext (`vite dev --port 3000`, lê `.dev.vars`); `next dev` ficou em `dev:next`.
4. Entrada do Worker própria (`src/worker/index.ts`) em vez de `vinext/server/fetch-handler` direto.
