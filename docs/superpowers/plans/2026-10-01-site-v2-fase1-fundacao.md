# Site V2 — Fase 1 (Fundação) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Execução escolhida pela proprietária:** Native nesta sessão. Revisões independentes focalizadas: (1) após Cloudflare/Sanity (Tasks 3–5), (2) após Beds24/secrets (Tasks 6–8), (3) revisão final da branch no Task 9. Parar após o Task 1 para conferência.

**Goal:** Ter a branch `v2` do repo `zeloalabs/SITESITIORECANTOAZUL` com o site antigo arquivado, uma app Next.js nova publicada em preview no Cloudflare Workers, edição visual Sanity funcionando ponta a ponta, e o núcleo Beds24 server-side (client com circuit breaker, validação de busca, link de reserva, descoberta de property/rooms) testado.

**Architecture:** Next.js (App Router) roda no Cloudflare Workers via vinext (gate aprovado no Task 3). Conteúdo vem do Sanity (Studio hospedado em `*.sanity.studio`, Presentation tool apontando para a rota de draft do site). Toda chamada Beds24 passa por `src/lib/beds24/`, módulo `server-only`, com um client único que consulta um circuit breaker de créditos antes de cada requisição.

**Tech Stack:** Next.js + TypeScript, vinext (`@vinext/cloudflare`) + `wrangler`, Sanity (`sanity`, `next-sanity`), Vitest + Testing Library, Playwright, Tailwind CSS.

**Spec:** `docs/superpowers/specs/2026-10-01-site-v2-design.md` (até o Task 1, está em
`/private/tmp/claude-501/-Users-brunabeppler-Projects-copilotositio/f19baa7c-1817-460f-a12a-eef43d5a0960/scratchpad/2026-10-01-site-v2-design.md`).

**Fora deste plano:**
- Fase 2: design, páginas, efeitos, migração de conteúdo.
- Fase 3: cron do "a partir de", `/api/quote`, KV, Cache API, rate limiting.
- Fase 4: lançamento.

Cada uma dessas fases recebe seu próprio plano.

## Global Constraints

- Repo: `~/sitesitiorecantoazul`, remote `https://github.com/zeloalabs/SITESITIORECANTOAZUL.git`. Nunca push direto em `main`.
- Branches/tags: tag `site-v1-final`, branch `archive/site-v1`, branch de trabalho `v2`.
- O site público (Vercel + `main`) não muda durante esta fase.
- Beds24 API V2, somente leitura. Token long-life com escopos `read:properties` + `read:inventory` apenas. O site nunca cria nem altera reservas.
- `BEDS24_TOKEN` só no servidor: secret do Cloudflare + `.env.local` não commitado. Nunca em log, nunca no navegador.
- Circuit breaker Beds24: abre quando `x-five-min-limit-remaining < 20` (`CREDIT_RESERVE = 20`) ou em HTTP 429; fica aberto até `x-five-min-limit-resets-in` (5 min se o header faltar); aberto = nenhuma chamada nova e degradação para "Consultar disponibilidade". Limite da conta: 100 créditos a cada 5 min.
- Timeout de chamada Beds24: 4000 ms.
- Busca: datas `YYYY-MM-DD`, check-in ≥ hoje (fuso `America/Sao_Paulo`), checkout > check-in, máx. 30 noites, adultos 1–20, crianças 0–10, total de hóspedes ≤ 20.
- Logs de Beds24: só `roomId`, path, status e custo. Nada de dados de visitante.
- `PRICES_ENABLED=false` durante toda a Fase 1.
- Cloudflare: começar no Workers Free. Só migrar para Paid (US$ 5/mês) com medição registrada que mostre necessidade.
- Nome oficial: "Sítio Recanto Azul". Idioma `pt-BR`.
- Commits pequenos, mensagem em inglês no padrão `feat:` / `chore:` / `test:` / `docs:`, terminando com
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Datas na virada do dia (fuso):** visitante às 23h30 em SP pesquisando check-in "hoje" não pode ser rejeitado porque o servidor está em UTC. Teste no Task 7.
2. **Créditos esgotados por outro consumidor da conta:** se o header mostrar só 15 créditos restantes, a próxima chamada não sai e o client responde `breaker_open`, mesmo sem 429. Teste no Task 6.
3. **Resposta Beds24 com `success: false` e HTTP 200:** precisa virar erro, não lista vazia (lista vazia pareceria "indisponível"). Teste no Task 6.
4. **Link de reserva com crianças = 0 e sem datas:** sem pesquisa, o link não pode levar `checkin`/`numnight` vazios, que quebram a pré-seleção. Teste no Task 7.
5. **Token ausente ou expirado (90 dias sem uso):** client devolve `auth` sem lançar exceção; página nunca quebra. Teste no Task 6.

---

## File Structure (ao fim da Fase 1, na branch `v2`)

```
CLAUDE.md                         regras do projeto V2 (substitui o antigo)
AGENTS.md                         aponta para CLAUDE.md
vercel.json                       desliga build da Vercel na branch v2
.env.example                      variáveis sem valores
cloudflare.config.ts              config do Worker (vinext)
vite.config.ts                    config do Vite / plugins Cloudflare e RSC (vinext)
next.config.ts
vitest.config.ts
playwright.config.ts
docs/superpowers/specs/2026-10-01-site-v2-design.md
docs/superpowers/plans/2026-10-01-site-v2-fase1-fundacao.md
docs/beds24-mapeamento.md         propertyId e roomIds descobertos
docs/infra-medicoes.md            medições de CPU/limites no Workers Free
scripts/beds24-discover.mts       descoberta read-only de property/rooms
studio/                           Sanity Studio (deploy em *.sanity.studio)
  sanity.config.ts
  sanity.cli.ts
  schemas/index.ts
  schemas/siteSettings.ts
  schemas/whatsappContact.ts
  schemas/accommodation.ts
  schemas/page.ts
  schemas/sections/hero.ts
  schemas/sections/textoEditorial.ts
src/app/layout.tsx
src/app/page.tsx                  Home = documento page com slug "home"
src/app/api/draft-mode/enable/route.ts
src/app/api/draft-mode/disable/route.ts
src/components/sections/SectionRenderer.tsx
src/components/sections/Hero.tsx
src/components/sections/TextoEditorial.tsx
src/lib/env.ts                    leitura/validação de variáveis
src/lib/content/client.ts         client Sanity + defineLive
src/lib/content/queries.ts        GROQ
src/lib/content/types.ts          tipos das seções usadas pelo renderer
src/lib/beds24/types.ts
src/lib/beds24/breaker.ts         circuit breaker de créditos
src/lib/beds24/client.ts          HTTP + timeout + breaker
src/lib/beds24/search.ts          validação de busca
src/lib/beds24/booking-url.ts     link do booking engine
src/lib/beds24/properties.ts      getPropertyRooms()
```

Testes ficam ao lado do código (`*.test.ts` / `*.test.tsx`); e2e em `e2e/`.

---

### Task 1: Arquivar site antigo e abrir branch `v2`

**Pré-requisito:** "ok" explícito da proprietária para este task. Ele faz push de tag e branches.

**Files:**
- Delete: tudo do app antigo (`src/`, `public/`, `supabase/`, `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `README.md`, `PROJECT_STATUS.md`, `.env.example`, `.claude/`)
- Create: `CLAUDE.md`, `AGENTS.md`, `vercel.json`, `docs/superpowers/specs/2026-10-01-site-v2-design.md`, `docs/superpowers/plans/2026-10-01-site-v2-fase1-fundacao.md`
- Keep: `.git`, `.gitignore`

**Interfaces:** nenhuma.

- [ ] **Step 1: Confirmar repo e sincronizar `main`**

```bash
cd ~/sitesitiorecantoazul
git remote -v          # esperado: zeloalabs/SITESITIORECANTOAZUL
git status --short     # esperado: vazio
git checkout main
git fetch origin
git pull --ff-only origin main
git log --oneline -1   # anotar o hash; esperado 6d3e8bf ou mais novo
```

Se o remote ou o status forem diferentes do esperado: PARAR e reportar.

- [ ] **Step 2: Criar tag e branch de arquivo e enviar**

```bash
git tag -a site-v1-final -m "Último estado do site V1 antes da V2"
git branch archive/site-v1
git push origin site-v1-final
git push origin archive/site-v1
git ls-remote --tags --heads origin | grep -E "site-v1-final|archive/site-v1"
```

Expected: as duas refs aparecem no remote.

- [ ] **Step 3: Criar branch `v2` a partir de `6d3e8bf`**

```bash
git checkout -b v2 6d3e8bff34fc6eccd3dfae3690b4e9ad21e86168
```

Remoção do app antigo acontece no Task 2, Step 0 (primeiro commit da `v2` contém só regras, spec e plano).

- [ ] **Step 4: Escrever `CLAUDE.md`**

```markdown
# CLAUDE.md — Sítio Recanto Azul (site V2)

Fonte da verdade do projeto: `docs/superpowers/specs/2026-10-01-site-v2-design.md`.

## Git
1. Repo canônico: `zeloalabs/SITESITIORECANTOAZUL`.
2. Nunca push direto em `main`. Desenvolvimento na branch `v2` (ou branches curtas com merge em `v2`).
3. Merge `v2 → main` só no lançamento, após "pode publicar" explícito da proprietária.
4. O site V1 está preservado na tag `site-v1-final` e na branch `archive/site-v1`.

## Escopo
5. Somente o site institucional do Sítio Recanto Azul. Não acessar Zeloa, CRM ou outros projetos.
6. Beds24 é a única fonte de preço, disponibilidade, mínimo de noites e restrições. Acesso somente leitura.
   O site nunca cria nem altera reservas.
7. Sanity é a única fonte de conteúdo. Não existe campo de preço no CMS.

## Segurança
8. Segredos só por variável de ambiente. Nunca commitar `.env*` (exceto `.env.example`).
9. `BEDS24_TOKEN` e `SANITY_API_READ_TOKEN` só no servidor. Nunca em log. Único token que pode ir ao navegador:
   `SANITY_API_BROWSER_TOKEN` (Viewer), só em draft mode. Nunca token com permissão de escrita.
10. Logs de Beds24: só `roomId`, path, status e custo.

## Qualidade
11. TDD: teste antes do código.
12. Mobile-first; revisão visual em 390, 430, 768 e 1440 px antes de entregar tela.
13. Fotos só do sítio, da Biblioteca Oficial (cópias). Conteúdo factual sem inventar comodidades.
14. `prefers-reduced-motion` respeitado em todo efeito.
```

- [ ] **Step 5: Escrever `AGENTS.md` e `vercel.json`**

`AGENTS.md`:
```markdown
Leia e siga `CLAUDE.md`.
```

`vercel.json`:
```json
{
  "git": {
    "deploymentEnabled": {
      "v2": false
    }
  }
}
```

- [ ] **Step 6: Copiar spec e plano para `docs/`**

```bash
mkdir -p docs/superpowers/specs docs/superpowers/plans
cp /private/tmp/claude-501/-Users-brunabeppler-Projects-copilotositio/f19baa7c-1817-460f-a12a-eef43d5a0960/scratchpad/2026-10-01-site-v2-design.md docs/superpowers/specs/
cp /private/tmp/claude-501/-Users-brunabeppler-Projects-copilotositio/f19baa7c-1817-460f-a12a-eef43d5a0960/scratchpad/2026-10-01-site-v2-fase1-fundacao.md docs/superpowers/plans/
```

- [ ] **Step 7: Commit e push da `v2`**

```bash
git add -A
git commit -m "docs: start V2 branch with new project rules, spec and plan

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push -u origin v2
```

Expected: push OK. Na Vercel, nenhum deploy novo para `v2` (conferir no dashboard ou com `gh api repos/zeloalabs/SITESITIORECANTOAZUL/deployments --jq '.[0].ref'`; o ref não pode ser o commit da `v2`).

---

### Task 2: Scaffold Next.js + testes

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `vitest.config.ts`, `vitest.setup.ts`, `playwright.config.ts`, `e2e/smoke.spec.ts`, `src/lib/env.ts`, `src/lib/env.test.ts`, `.env.example`
- Modify: `.gitignore`

**Interfaces:**
- Produces: `getServerEnv(): ServerEnv` e o tipo `ServerEnv` em `src/lib/env.ts`.

```ts
type ServerEnv = {
  beds24Token: string | null;
  sanityReadToken: string | null;
  pricesEnabled: boolean;
};
```

- [ ] **Step 0: Remover o app antigo da `v2`**

```bash
git rm -r -q src public supabase package.json package-lock.json next.config.ts tsconfig.json \
  eslint.config.mjs postcss.config.mjs README.md PROJECT_STATUS.md .env.example .claude
git commit -m "chore: remove V1 app from v2 (preserved in site-v1-final)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 1: Gerar scaffold fora do repo e copiar**

```bash
SCAF="$TMPDIR/v2-scaffold" && rm -rf "$SCAF"
npx create-next-app@latest "$SCAF" --ts --app --src-dir --eslint --tailwind --use-npm --import-alias "@/*" --yes
rsync -a --exclude .git --exclude node_modules --exclude README.md --exclude CLAUDE.md --exclude AGENTS.md --exclude docs "$SCAF"/ ~/sitesitiorecantoazul/
cd ~/sitesitiorecantoazul && npm install
```

Anotar a versão instalada (`npm ls next`). Compatibilidade com o adaptador do Cloudflare é decidida no gate do Task 3;
se o adaptador escolhido não suportar essa versão, fixar `next` e `eslint-config-next` na maior versão suportada.

- [ ] **Step 2: Instalar ferramentas de teste**

```bash
npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @playwright/test
npm i server-only
npx playwright install chromium
```

- [ ] **Step 3: Configurar Vitest**

`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "server-only": path.resolve(__dirname, "vitest.server-only-stub.ts"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
```

`vitest.setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
```

`vitest.server-only-stub.ts`:
```ts
export {};
```

Excluir `studio/` (tem `node_modules` próprio) do TypeScript e do ESLint da raiz:
- `tsconfig.json`: `"exclude": ["node_modules", "studio"]`.
- `eslint.config.mjs`: incluir `"studio/**"` na lista de `ignores` (criar o objeto `{ ignores: ["studio/**", ".open-next/**", "dist/**"] }` se não existir).

Adicionar em `package.json` → `scripts`:
```json
"test": "vitest run",
"test:watch": "vitest",
"e2e": "playwright test",
"typecheck": "tsc --noEmit"
```

- [ ] **Step 4: Escrever teste que falha para `env.ts`**

`src/lib/env.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { readServerEnv } from "./env";

describe("readServerEnv", () => {
  it("returns nulls and prices disabled when vars are missing", () => {
    expect(readServerEnv({})).toEqual({
      beds24Token: null,
      sanityReadToken: null,
      pricesEnabled: false,
    });
  });

  it("enables prices only for the exact string 'true'", () => {
    expect(readServerEnv({ PRICES_ENABLED: "true" }).pricesEnabled).toBe(true);
    expect(readServerEnv({ PRICES_ENABLED: "1" }).pricesEnabled).toBe(false);
    expect(readServerEnv({ PRICES_ENABLED: "TRUE" }).pricesEnabled).toBe(false);
  });

  it("treats blank tokens as missing", () => {
    expect(readServerEnv({ BEDS24_TOKEN: "  " }).beds24Token).toBeNull();
  });
});
```

- [ ] **Step 5: Rodar e ver falhar**

Run: `npx vitest run src/lib/env.test.ts`
Expected: FAIL, `Cannot find module './env'` ou `readServerEnv is not a function`.

- [ ] **Step 6: Implementar `env.ts`**

`src/lib/env.ts`:
```ts
import "server-only";

export type ServerEnv = {
  beds24Token: string | null;
  sanityReadToken: string | null;
  pricesEnabled: boolean;
};

type RawEnv = Record<string, string | undefined>;

function nonBlank(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function readServerEnv(raw: RawEnv): ServerEnv {
  return {
    beds24Token: nonBlank(raw.BEDS24_TOKEN),
    sanityReadToken: nonBlank(raw.SANITY_API_READ_TOKEN),
    pricesEnabled: raw.PRICES_ENABLED === "true",
  };
}

export function getServerEnv(): ServerEnv {
  return readServerEnv(process.env);
}
```

- [ ] **Step 7: Rodar e ver passar**

Run: `npx vitest run src/lib/env.test.ts`
Expected: PASS (3 testes).

- [ ] **Step 8: `.env.example`, `.gitignore`, smoke e2e**

`.env.example`:
```bash
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_STUDIO_URL=https://sitiorecantoazul.sanity.studio
# Somente servidor (Viewer)
SANITY_API_READ_TOKEN=
# Viewer dedicado, enviado ao navegador só em draft mode
SANITY_API_BROWSER_TOKEN=

# Beds24 (somente servidor, token long-life read-only: read:properties + read:inventory)
BEDS24_TOKEN=

# Preços ficam desligados até a validação API x checkout passar
PRICES_ENABLED=false

NEXT_PUBLIC_SITE_URL=https://sitiorecantoazul.com.br
```

Garantir em `.gitignore` as linhas:
```
.env*
!.env.example
.dev.vars*
.open-next
.wrangler
```

`playwright.config.ts`:
```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  use: { baseURL: "http://localhost:3000" },
  webServer: { command: "npm run dev", url: "http://localhost:3000", reuseExistingServer: true },
  projects: [
    { name: "mobile", use: { ...devices["iPhone 13"] } },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
});
```

`e2e/smoke.spec.ts`:
```ts
import { test, expect } from "@playwright/test";

test("home responds and declares pt-BR", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
});
```

Em `src/app/layout.tsx`, trocar `<html lang="en">` por `<html lang="pt-BR">` e o `metadata.title` por `"Sítio Recanto Azul"`.

- [ ] **Step 9: Verificar tudo**

Run: `npm run typecheck && npm run lint && npm test && npm run e2e`
Expected: tudo verde.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app with Vitest and Playwright

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Gate de hospedagem (vinext × OpenNext) + preview da `v2` no Cloudflare

**Pré-requisito (ação da proprietária):** acesso à conta Cloudflare onde está a zona `sitiorecantoazul.com.br`.

**Decisão tomada neste task:** `vinext` APROVADO.
- O gate remoto no Cloudflare Workers passou em 100% dos 8 critérios (draft mode, overlays, live preview no Presentation tool, isolamento de rascunhos, visitante anônimo e secrets em `bindings.secret()`).
- O OpenNext foi descartado por exceder o limite de 10 ms do Workers Free (12–14,5 ms p50, máx 105 ms) e por embutir `.env` nos bundles compilados (`.open-next/cloudflare/next-env.mjs`).
- O vinext consome apenas **2,00 ms p50** e **3,00 ms p95/máx** (80% abaixo do teto de 10 ms), com bundle de **560,20 KiB gzip** (3× menor que OpenNext).
- Cache: arquitetura mínima sem `workers-cache`, sem Cache Components, sem R2, sem KV e sem Durable Objects.

**Files:**
- Create: `docs/infra-medicoes.md` (decisão e tabela comparativa consolidada)
- Create: `cloudflare.config.ts`, `vite.config.ts`
- Modify: `package.json`, `next.config.ts`, `eslint.config.mjs`, `vitest.config.ts`, `.gitignore`
- Delete: `open-next.config.ts`, `wrangler.jsonc`

**Interfaces:** Scripts `build:vinext`, `preview` e `deploy` via `vinext-cloudflare` em `package.json`.

- [x] **Step 1: Ler a documentação atual** (concluído: documentado em `docs/infra-medicoes.md`).
- [x] **Step 2: Gate vinext em branch descartável / Worker de spike** (concluído: validado em `sitio-recanto-azul-vinext-spike.zeloapms.workers.dev` com 8/8 critérios aprovados).
- [x] **Step 3: Decidir** (concluído: vinext aprovado unanimemente por CPU 2,0 ms vs 14,5 ms e segurança de secrets).
- [x] **Step 4: Cache mínimo** (concluído: sem `workers-cache`, sem Cache Components, sem R2/KV/DOs adicionais).
- [x] **Step 5: Conectar / provisionar preview Worker** (concluído: worker `sitio-recanto-azul-site` criado e configurado com secrets `SANITY_API_READ_TOKEN` e `SANITY_API_BROWSER_TOKEN`).
- [x] **Step 6: Commit, push e conferir preview** (concluído: deploy em `sitio-recanto-azul-site.zeloapms.workers.dev` respondendo HTTP 200).
- [x] **Step 7: Registrar medição** (concluído: n=20 acessos medidos via `wrangler tail` / `/tmp/measure_cpu.py`: p50 2,00 ms, p95 3,00 ms, max 3,00 ms).

---

### Task 4: Sanity — projeto, Studio e schemas

**Pré-requisito (ação da proprietária):** criar (ou autorizar criar) o projeto Sanity no plano Free, dataset `production`.

**Files:**
- Create: `studio/package.json`, `studio/sanity.config.ts`, `studio/sanity.cli.ts`, `studio/schemas/index.ts`, `studio/schemas/siteSettings.ts`, `studio/schemas/whatsappContact.ts`, `studio/schemas/accommodation.ts`, `studio/schemas/page.ts`, `studio/schemas/sections/hero.ts`, `studio/schemas/sections/textoEditorial.ts`, `studio/schemas/accommodation.test.ts`
- Modify: `vitest.config.ts` (incluir `studio/**/*.test.ts`)

**Interfaces:**
- Produces (nomes de tipo Sanity usados pelo site): `siteSettings`, `whatsappContact`, `accommodation`, `page`, `hero`, `textoEditorial`.
- Campos usados depois: `siteSettings.beds24PropertyId: number`, `siteSettings.beds24Referer: string`, `accommodation.beds24RoomId: number`, `accommodation.ocupacaoReferencia: number`, `accommodation.mostrarOcupacaoBase: boolean`, `page.slug.current: string`, `page.sections: Array<Hero | TextoEditorial>`.

- [ ] **Step 1: Criar o Studio**

```bash
cd ~/sitesitiorecantoazul
npm create sanity@latest -- --project <PROJECT_ID> --dataset production --template clean --typescript --output-path studio
```

- [ ] **Step 2: Teste que falha para as regras de `accommodation`**

`studio/schemas/accommodation.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { validateOcupacaoReferencia, validateBeds24RoomId } from "./accommodation";

describe("accommodation field rules", () => {
  it("accepts reference occupancy from 1 to 20", () => {
    expect(validateOcupacaoReferencia(1)).toBe(true);
    expect(validateOcupacaoReferencia(20)).toBe(true);
  });

  it("rejects reference occupancy outside 1..20 or fractional", () => {
    expect(validateOcupacaoReferencia(0)).not.toBe(true);
    expect(validateOcupacaoReferencia(21)).not.toBe(true);
    expect(validateOcupacaoReferencia(2.5)).not.toBe(true);
  });

  it("accepts a missing Beds24 room id (site shows 'Consultar disponibilidade')", () => {
    expect(validateBeds24RoomId(undefined)).toBe(true);
  });

  it("rejects non-positive or fractional Beds24 room ids", () => {
    expect(validateBeds24RoomId(0)).not.toBe(true);
    expect(validateBeds24RoomId(12.3)).not.toBe(true);
    expect(validateBeds24RoomId(123456)).toBe(true);
  });
});
```

Em `vitest.config.ts`, mudar `include` para `["src/**/*.test.{ts,tsx}", "studio/**/*.test.ts"]`.

- [ ] **Step 3: Rodar e ver falhar**

Run: `npx vitest run studio/schemas/accommodation.test.ts`
Expected: FAIL, módulo não encontrado.

- [ ] **Step 4: Escrever schemas**

`studio/schemas/accommodation.ts`:
```ts
import { defineField, defineType } from "sanity";

export function validateOcupacaoReferencia(value: number | undefined): true | string {
  if (value === undefined) return "Obrigatório";
  if (!Number.isInteger(value) || value < 1 || value > 20) return "Use um número inteiro de 1 a 20";
  return true;
}

export function validateBeds24RoomId(value: number | undefined): true | string {
  if (value === undefined) return true;
  if (!Number.isInteger(value) || value <= 0) return "roomId da Beds24 deve ser inteiro positivo";
  return true;
}

export const accommodation = defineType({
  name: "accommodation",
  title: "Acomodação",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Nome", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "name" }, validation: (r) => r.required() }),
    defineField({ name: "gallery", title: "Galeria", type: "array", of: [{ type: "image", options: { hotspot: true }, fields: [{ name: "alt", title: "Texto alternativo", type: "string" }] }] }),
    defineField({ name: "description", title: "Descrição", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "highlights", title: "Diferenciais", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "capacity", title: "Capacidade máxima", type: "number" }),
    defineField({ name: "amenities", title: "Comodidades", type: "array", of: [{ type: "string" }] }),
    defineField({
      name: "beds24RoomId",
      title: "Beds24 roomId",
      description: "Sem este campo, o site mostra 'Consultar disponibilidade' e não monta link de reserva com quarto.",
      type: "number",
      validation: (r) => r.custom((v) => validateBeds24RoomId(v as number | undefined)),
    }),
    defineField({
      name: "ocupacaoReferencia",
      title: "Ocupação de referência (adultos)",
      description: "Usada no cálculo do 'A partir de'. Padrão 2; grupos usam valor maior.",
      type: "number",
      initialValue: 2,
      validation: (r) => r.custom((v) => validateOcupacaoReferencia(v as number | undefined)),
    }),
    defineField({ name: "mostrarOcupacaoBase", title: "Mostrar ocupação-base junto ao preço", type: "boolean", initialValue: false }),
    defineField({ name: "featuredHome", title: "Destaque na Home", type: "boolean", initialValue: false }),
    defineField({ name: "homeOrder", title: "Ordem na Home", type: "number" }),
    defineField({ name: "seoTitle", title: "SEO título", type: "string" }),
    defineField({ name: "seoDescription", title: "SEO descrição", type: "text", rows: 3 }),
  ],
});
```

`studio/schemas/siteSettings.ts`:
```ts
import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Configurações do site",
  type: "document",
  fields: [
    defineField({ name: "siteName", title: "Nome", type: "string", initialValue: "Sítio Recanto Azul", validation: (r) => r.required() }),
    defineField({ name: "logo", title: "Logo (SVG)", type: "image" }),
    defineField({ name: "seoTitle", title: "SEO título padrão", type: "string" }),
    defineField({ name: "seoDescription", title: "SEO descrição padrão", type: "text", rows: 3 }),
    defineField({ name: "beds24PropertyId", title: "Beds24 propertyId", type: "number", validation: (r) => r.integer().positive() }),
    defineField({ name: "beds24Referer", title: "Beds24 referer", description: "Identifica reservas originadas no site.", type: "string", initialValue: "site-v2" }),
  ],
});
```

`studio/schemas/whatsappContact.ts`:
```ts
import { defineField, defineType } from "sanity";

export const whatsappContact = defineType({
  name: "whatsappContact",
  title: "Contato WhatsApp",
  type: "document",
  fields: [
    defineField({ name: "label", title: "Rótulo", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "number",
      title: "Número (com DDI, só dígitos)",
      type: "string",
      validation: (r) => r.required().regex(/^\d{12,13}$/, { name: "E.164 sem +" }),
    }),
    defineField({ name: "message", title: "Mensagem pré-preenchida", type: "text", rows: 3 }),
    defineField({
      name: "placements",
      title: "Onde aparece",
      type: "array",
      of: [{ type: "string" }],
      options: { list: ["header", "footer", "floating", "page"] },
    }),
  ],
});
```

`studio/schemas/sections/hero.ts`:
```ts
import { defineField, defineType } from "sanity";

export const hero = defineType({
  name: "hero",
  title: "Hero",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", title: "Rótulo", type: "string" }),
    defineField({ name: "title", title: "Título", type: "string", validation: (r) => r.required() }),
    defineField({ name: "text", title: "Texto", type: "text", rows: 3 }),
    defineField({ name: "image", title: "Foto", type: "image", options: { hotspot: true }, fields: [{ name: "alt", title: "Texto alternativo", type: "string" }] }),
    defineField({ name: "showSearch", title: "Mostrar busca", type: "boolean", initialValue: true }),
  ],
});
```

`studio/schemas/sections/textoEditorial.ts`:
```ts
import { defineField, defineType } from "sanity";

export const textoEditorial = defineType({
  name: "textoEditorial",
  title: "Texto editorial",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", title: "Rótulo", type: "string" }),
    defineField({ name: "title", title: "Título", type: "string" }),
    defineField({ name: "body", title: "Texto", type: "array", of: [{ type: "block" }] }),
  ],
});
```

`studio/schemas/page.ts`:
```ts
import { defineField, defineType } from "sanity";

export const page = defineType({
  name: "page",
  title: "Página",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Título", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Slug", description: "Use 'home' para a página inicial.", type: "slug", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "sections", title: "Seções", type: "array", of: [{ type: "hero" }, { type: "textoEditorial" }] }),
    defineField({ name: "seoTitle", title: "SEO título", type: "string" }),
    defineField({ name: "seoDescription", title: "SEO descrição", type: "text", rows: 3 }),
  ],
});
```

`studio/schemas/index.ts`:
```ts
import { accommodation } from "./accommodation";
import { page } from "./page";
import { siteSettings } from "./siteSettings";
import { whatsappContact } from "./whatsappContact";
import { hero } from "./sections/hero";
import { textoEditorial } from "./sections/textoEditorial";

export const schemaTypes = [siteSettings, whatsappContact, accommodation, page, hero, textoEditorial];
```

- [ ] **Step 5: Rodar e ver passar**

Run: `npx vitest run studio/schemas/accommodation.test.ts`
Expected: PASS (4 testes).

- [ ] **Step 6: Deploy do Studio e documento inicial**

```bash
cd studio && npx sanity deploy   # hostname: sitiorecantoazul
```

No Studio publicado: criar `siteSettings` e um `page` com slug `home`, contendo um Hero (título "Sítio Recanto Azul") e um Texto editorial.

- [ ] **Step 7: Commit**

```bash
cd ~/sitesitiorecantoazul && git add -A
git commit -m "feat: add Sanity studio with core schemas

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 5: Conteúdo no site + edição visual (Presentation)

**Files:**
- Create: `src/lib/content/client.ts`, `src/lib/content/queries.ts`, `src/lib/content/types.ts`, `src/components/sections/SectionRenderer.tsx`, `src/components/sections/Hero.tsx`, `src/components/sections/TextoEditorial.tsx`, `src/components/sections/SectionRenderer.test.tsx`, `src/app/api/draft-mode/enable/route.ts`, `src/app/api/draft-mode/disable/route.ts`
- Modify: `src/app/layout.tsx`, `src/app/page.tsx`, `studio/sanity.config.ts`

**Interfaces:**
- Consumes: tipos Sanity do Task 4.
- Produces:
  - `sanityFetch` e `SanityLive` (de `defineLive`) em `src/lib/content/client.ts`.
  - `PAGE_BY_SLUG_QUERY` em `queries.ts`.
  - Tipos em `types.ts`: `HeroSection`, `TextoEditorialSection`, `Section`, `PageDoc`.
  - `<SectionRenderer sections={Section[]} />`.

- [ ] **Step 1: Instalar**

```bash
npm i next-sanity @sanity/image-url
```

- [ ] **Step 2: Tipos e teste que falha do renderer**

`src/lib/content/types.ts`:
```ts
export type SanityImage = { asset?: { _ref: string }; alt?: string; hotspot?: { x: number; y: number } };

export type HeroSection = {
  _type: "hero";
  _key: string;
  eyebrow?: string;
  title: string;
  text?: string;
  image?: SanityImage;
  showSearch?: boolean;
};

export type TextoEditorialSection = {
  _type: "textoEditorial";
  _key: string;
  eyebrow?: string;
  title?: string;
  body?: unknown[];
};

export type Section = HeroSection | TextoEditorialSection;

export type PageDoc = {
  _id: string;
  title: string;
  slug: string;
  sections: Section[] | null;
  seoTitle?: string;
  seoDescription?: string;
};
```

`src/components/sections/SectionRenderer.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SectionRenderer } from "./SectionRenderer";
import type { Section } from "@/lib/content/types";

describe("SectionRenderer", () => {
  it("renders sections in the given order", () => {
    const sections: Section[] = [
      { _type: "textoEditorial", _key: "b", title: "Segundo" },
      { _type: "hero", _key: "a", title: "Primeiro" },
    ];
    render(<SectionRenderer sections={sections} />);
    const headings = screen.getAllByRole("heading").map((h) => h.textContent);
    expect(headings).toEqual(["Segundo", "Primeiro"]);
  });

  it("skips unknown section types without crashing", () => {
    const sections = [
      { _type: "desconhecida", _key: "x" },
      { _type: "hero", _key: "a", title: "Ok" },
    ] as unknown as Section[];
    render(<SectionRenderer sections={sections} />);
    expect(screen.getByRole("heading", { name: "Ok" })).toBeInTheDocument();
  });

  it("renders nothing for null sections", () => {
    const { container } = render(<SectionRenderer sections={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `npx vitest run src/components/sections/SectionRenderer.test.tsx`
Expected: FAIL, módulo não encontrado.

- [ ] **Step 4: Implementar renderer e seções (sem estilo final; design é Fase 2)**

`src/components/sections/Hero.tsx`:
```tsx
import type { HeroSection } from "@/lib/content/types";

export function Hero({ section }: { section: HeroSection }) {
  return (
    <section>
      {section.eyebrow ? <p>{section.eyebrow}</p> : null}
      <h1>{section.title}</h1>
      {section.text ? <p>{section.text}</p> : null}
    </section>
  );
}
```

`src/components/sections/TextoEditorial.tsx`:
```tsx
import { PortableText, type PortableTextBlock } from "next-sanity";
import type { TextoEditorialSection } from "@/lib/content/types";

export function TextoEditorial({ section }: { section: TextoEditorialSection }) {
  return (
    <section>
      {section.eyebrow ? <p>{section.eyebrow}</p> : null}
      {section.title ? <h2>{section.title}</h2> : null}
      {section.body ? <PortableText value={section.body as PortableTextBlock[]} /> : null}
    </section>
  );
}
```

`src/components/sections/SectionRenderer.tsx`:
```tsx
import type { Section } from "@/lib/content/types";
import { Hero } from "./Hero";
import { TextoEditorial } from "./TextoEditorial";

export function SectionRenderer({ sections }: { sections: Section[] | null }) {
  if (!sections?.length) return null;
  return (
    <>
      {sections.map((section) => {
        switch (section._type) {
          case "hero":
            return <Hero key={section._key} section={section} />;
          case "textoEditorial":
            return <TextoEditorial key={section._key} section={section} />;
          default:
            return null;
        }
      })}
    </>
  );
}
```

- [ ] **Step 5: Rodar e ver passar**

Run: `npx vitest run src/components/sections/SectionRenderer.test.tsx`
Expected: PASS (3 testes).

- [ ] **Step 6: Client, query, live e draft mode**

`src/lib/content/client.ts`:
```ts
import { createClient, defineLive } from "next-sanity";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2026-10-01",
  useCdn: true,
  stega: { studioUrl: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL },
});

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: process.env.SANITY_API_READ_TOKEN,
  // Token Viewer dedicado. A integração oficial só o envia ao navegador em draft mode.
  browserToken: process.env.SANITY_API_BROWSER_TOKEN,
});
```

`src/lib/content/queries.ts`:
```ts
import { defineQuery } from "next-sanity";

export const PAGE_BY_SLUG_QUERY = defineQuery(`
  *[_type == "page" && slug.current == $slug][0]{
    _id, title, "slug": slug.current, sections, seoTitle, seoDescription
  }
`);
```

`src/app/api/draft-mode/enable/route.ts`:
```ts
import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { client } from "@/lib/content/client";

export const { GET } = defineEnableDraftMode({
  client: client.withConfig({ token: process.env.SANITY_API_READ_TOKEN }),
});
```

`src/app/api/draft-mode/disable/route.ts`:
```ts
import { draftMode } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  (await draftMode()).disable();
  return NextResponse.redirect(new URL("/", request.url));
}
```

`src/app/page.tsx`:
```tsx
import { sanityFetch } from "@/lib/content/client";
import { PAGE_BY_SLUG_QUERY } from "@/lib/content/queries";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import type { PageDoc } from "@/lib/content/types";

export default async function Home() {
  const { data } = await sanityFetch({ query: PAGE_BY_SLUG_QUERY, params: { slug: "home" } });
  const page = data as PageDoc | null;
  return <main>{page ? <SectionRenderer sections={page.sections} /> : null}</main>;
}
```

Em `src/app/layout.tsx`, dentro de `<body>`, depois de `{children}`:
```tsx
<SanityLive />
{(await draftMode()).isEnabled ? <VisualEditing /> : null}
```
Com os imports `import { draftMode } from "next/headers";`, `import { VisualEditing } from "next-sanity/visual-editing";`, `import { SanityLive } from "@/lib/content/client";`. Tornar `RootLayout` `async`.

Em `studio/sanity.config.ts`, adicionar o plugin:
```ts
import { presentationTool } from "sanity/presentation";
// em plugins: [structureTool(), presentationTool({
//   previewUrl: {
//     initial: process.env.SANITY_STUDIO_PREVIEW_URL ?? "http://localhost:3000",
//     previewMode: { enable: "/api/draft-mode/enable" },
//   },
// })]
```

Escrever o array `plugins` completo no arquivo (não deixar comentado):
```ts
plugins: [
  structureTool(),
  presentationTool({
    previewUrl: {
      initial: process.env.SANITY_STUDIO_PREVIEW_URL ?? "http://localhost:3000",
      previewMode: { enable: "/api/draft-mode/enable" },
    },
  }),
],
```

- [ ] **Step 6b: Conferir que a Home continua estática**

Run: `npm run build`
Expected: na tabela de rotas, `/` aparece como estática/ISR (○ ou ◐), não dinâmica (ƒ). Se `draftMode()` no layout
tornar as rotas dinâmicas, mover `<VisualEditing />` para um componente que só lê `draftMode()` dentro de um
`<Suspense>` e repetir o build.

- [ ] **Step 7: Secrets e CORS**

1. Sanity → API → Tokens: criar dois tokens **Viewer** (somente leitura): `site-v2-server` e `site-v2-browser`.
   Nunca criar token Editor/Deploy para o site. Guardar em `.env.local` e como secrets no Cloudflare:
   `npx wrangler secret put SANITY_API_READ_TOKEN` e `npx wrangler secret put SANITY_API_BROWSER_TOKEN`.
   Conferir no painel que ambos têm papel Viewer.
2. Sanity → API → CORS: adicionar `http://localhost:3000` e a URL `*.workers.dev` do Task 3 (sem credenciais).
3. Studio: `SANITY_STUDIO_PREVIEW_URL=<url workers.dev> npx sanity deploy` dentro de `studio/`.

- [ ] **Step 8: Verificação ponta a ponta (manual, registrar resultado)**

1. `npm run dev` → `/` mostra o título do Hero vindo do Sanity.
2. Studio → Presentation → clicar no título do Hero no preview → editar → texto muda no preview sem publicar.
3. Aba anônima em `/` → texto antigo (rascunho não vaza).
4. Publicar → aba anônima mostra o novo texto em poucos segundos.
5. Repetir 2–4 no preview `*.workers.dev`.
6. Aba anônima (sem draft mode): no HTML e nos scripts carregados, nenhum valor de `SANITY_API_BROWSER_TOKEN` aparece
   (`curl -s <url>/ | grep -c "<primeiros 8 caracteres do token>"` → `0`).
7. Registrar CPU p50/p99 de `/` e de `/api/draft-mode/enable` em `docs/infra-medicoes.md`.

- [ ] **Step 9: Verificar e commitar**

Run: `npm run typecheck && npm run lint && npm test`
Expected: verde.

```bash
git add -A
git commit -m "feat: render Sanity pages with live visual editing

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Revisão independente 1 (após Tasks 3–5)

Depois do Task 5, um revisor independente (agente diferente, sem histórico desta sessão) lê o `git diff` desde o
commit do Task 2 e verifica: decisão vinext/OpenNext justificada, cache mínimo, nenhum token de escrita, `browserToken`
só em draft mode, rascunho não vaza, Home estática/ISR, Vercel intocada. Achados confirmados voltam como correção
antes do Task 6.

---

### Task 6: Beds24 — client com circuit breaker

**Files:**
- Create: `src/lib/beds24/types.ts`, `src/lib/beds24/breaker.ts`, `src/lib/beds24/breaker.test.ts`, `src/lib/beds24/client.ts`, `src/lib/beds24/client.test.ts`

**Interfaces:**
- Produces:

```ts
// types.ts
export type Beds24ErrorKind = "breaker_open" | "rate_limited" | "auth" | "timeout" | "http" | "network" | "api_error";
export type Beds24Result<T> = { ok: true; data: T } | { ok: false; error: Beds24ErrorKind };

// breaker.ts
export type BreakerState = { openUntil: number | null };
export interface BreakerStore { load(): Promise<BreakerState | null>; save(state: BreakerState): Promise<void>; }
export const CREDIT_RESERVE = 20;
export class CreditBreaker {
  constructor(store: BreakerStore, now?: () => number);
  isOpen(): Promise<boolean>;
  record(headers: Headers, status: number): Promise<void>;
}
export class MemoryBreakerStore implements BreakerStore {}

// client.ts
export type Beds24Client = {
  get<T>(path: string, params: Record<string, string | number | boolean | Array<string | number>>): Promise<Beds24Result<T>>;
};
export function createBeds24Client(opts: {
  token: string | null;
  breaker: CreditBreaker;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  baseUrl?: string;
  log?: (entry: { path: string; status: number | "timeout" | "network" | "skipped"; cost: number | null }) => void;
}): Beds24Client;
```

- [x] **Step 1: Testes que falham do breaker**

`src/lib/beds24/breaker.test.ts`:
```ts
// @vitest-environment node
import { describe, it, expect } from "vitest";
import { CreditBreaker, MemoryBreakerStore, CREDIT_RESERVE } from "./breaker";

function headers(remaining: number, resetsIn: number) {
  return new Headers({
    "x-five-min-limit-remaining": String(remaining),
    "x-five-min-limit-resets-in": String(resetsIn),
  });
}

describe("CreditBreaker", () => {
  it("starts closed", async () => {
    const breaker = new CreditBreaker(new MemoryBreakerStore(), () => 0);
    expect(await breaker.isOpen()).toBe(false);
  });

  it("stays closed with exactly 20 credits remaining", async () => {
    expect(CREDIT_RESERVE).toBe(20);
    const breaker = new CreditBreaker(new MemoryBreakerStore(), () => 0);
    await breaker.record(headers(20, 120), 200);
    expect(await breaker.isOpen()).toBe(false);
  });

  it("opens with 19 or fewer credits remaining, even without a 429", async () => {
    const breaker = new CreditBreaker(new MemoryBreakerStore(), () => 0);
    await breaker.record(headers(19, 120), 200);
    expect(await breaker.isOpen()).toBe(true);
  });

  it("opens on 429 and respects resets-in, then closes", async () => {
    let now = 0;
    const breaker = new CreditBreaker(new MemoryBreakerStore(), () => now);
    await breaker.record(headers(0, 90), 429);
    expect(await breaker.isOpen()).toBe(true);
    now = 89_999;
    expect(await breaker.isOpen()).toBe(true);
    now = 90_000;
    expect(await breaker.isOpen()).toBe(false);
  });

  it("falls back to 5 minutes when resets-in is missing", async () => {
    let now = 0;
    const breaker = new CreditBreaker(new MemoryBreakerStore(), () => now);
    await breaker.record(new Headers(), 429);
    now = 299_999;
    expect(await breaker.isOpen()).toBe(true);
    now = 300_000;
    expect(await breaker.isOpen()).toBe(false);
  });

  it("persists only when the open state changes", async () => {
    const store = new MemoryBreakerStore();
    let saves = 0;
    const original = store.save.bind(store);
    store.save = async (s) => { saves++; return original(s); };
    const breaker = new CreditBreaker(store, () => 0);
    await breaker.record(headers(80, 120), 200);
    await breaker.record(headers(70, 110), 200);
    expect(saves).toBe(0);
    await breaker.record(headers(10, 100), 200);
    await breaker.record(headers(5, 90), 200);
    expect(saves).toBe(1);
  });

  it("shares an open breaker through the store across instances", async () => {
    const store = new MemoryBreakerStore();
    const a = new CreditBreaker(store, () => 0);
    await a.record(headers(5, 60), 200);
    const b = new CreditBreaker(store, () => 1_000);
    expect(await b.isOpen()).toBe(true);
  });

  it("ignores malformed headers on a 200", async () => {
    const breaker = new CreditBreaker(new MemoryBreakerStore(), () => 0);
    await breaker.record(new Headers({ "x-five-min-limit-remaining": "abc" }), 200);
    expect(await breaker.isOpen()).toBe(false);
  });
});
```

- [x] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/lib/beds24/breaker.test.ts`
Expected: FAIL, módulo não encontrado.

- [x] **Step 3: Implementar tipos e breaker**

`src/lib/beds24/types.ts`:
```ts
export type Beds24ErrorKind = "breaker_open" | "rate_limited" | "auth" | "timeout" | "http" | "network" | "api_error";
export type Beds24Result<T> = { ok: true; data: T } | { ok: false; error: Beds24ErrorKind };
```

`src/lib/beds24/breaker.ts`:
```ts
export type BreakerState = { openUntil: number | null };

export interface BreakerStore {
  load(): Promise<BreakerState | null>;
  save(state: BreakerState): Promise<void>;
}

export const CREDIT_RESERVE = 20;
const DEFAULT_OPEN_MS = 5 * 60 * 1000;

export class MemoryBreakerStore implements BreakerStore {
  private state: BreakerState | null = null;
  async load() { return this.state; }
  async save(state: BreakerState) { this.state = { ...state }; }
}

function readNumber(headers: Headers, name: string): number | null {
  const raw = headers.get(name);
  if (raw === null) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export class CreditBreaker {
  private openUntil: number | null = null;
  private loaded = false;

  constructor(private readonly store: BreakerStore, private readonly now: () => number = Date.now) {}

  private async ensureLoaded() {
    if (this.loaded) return;
    this.openUntil = (await this.store.load())?.openUntil ?? null;
    this.loaded = true;
  }

  async isOpen(): Promise<boolean> {
    await this.ensureLoaded();
    if (this.openUntil === null) return false;
    if (this.now() < this.openUntil) return true;
    this.openUntil = null;
    await this.store.save({ openUntil: null });
    return false;
  }

  async record(headers: Headers, status: number): Promise<void> {
    await this.ensureLoaded();
    const now = this.now();
    const remaining = readNumber(headers, "x-five-min-limit-remaining");
    const resetsIn = readNumber(headers, "x-five-min-limit-resets-in");
    const shouldOpen = status === 429 || (remaining !== null && remaining < CREDIT_RESERVE);
    const alreadyOpen = this.openUntil !== null && now < this.openUntil;
    if (!shouldOpen || alreadyOpen) return;
    this.openUntil = resetsIn !== null ? now + resetsIn * 1000 : now + DEFAULT_OPEN_MS;
    await this.store.save({ openUntil: this.openUntil });
  }
}
```

- [x] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/lib/beds24/breaker.test.ts`
Expected: PASS (8 testes).

- [x] **Step 5: Testes que falham do client**

`src/lib/beds24/client.test.ts`:
```ts
// @vitest-environment node
import { describe, it, expect, vi } from "vitest";
import { createBeds24Client } from "./client";
import { CreditBreaker, MemoryBreakerStore } from "./breaker";

function okResponse(body: unknown, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json", "x-five-min-limit-remaining": "90", "x-five-min-limit-resets-in": "200", "x-request-cost": "1", ...extra },
  });
}

function makeClient(fetchImpl: typeof fetch, token: string | null = "tkn", log = vi.fn()) {
  const breaker = new CreditBreaker(new MemoryBreakerStore(), () => 0);
  return { client: createBeds24Client({ token, breaker, fetchImpl, timeoutMs: 50, log }), breaker, log };
}

describe("beds24 client", () => {
  it("sends the token header and query params, returns data", async () => {
    const fetchImpl = vi.fn(async () => okResponse({ success: true, data: [{ id: 1 }] }));
    const { client } = makeClient(fetchImpl as unknown as typeof fetch);
    const result = await client.get<{ id: number }[]>("/properties", { includeAllRooms: true, id: [10, 20] });
    expect(result).toEqual({ ok: true, data: [{ id: 1 }] });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.beds24.com/v2/properties?includeAllRooms=true&id=10&id=20");
    expect(new Headers(init.headers).get("token")).toBe("tkn");
  });

  it("returns auth without calling the API when the token is missing", async () => {
    const fetchImpl = vi.fn();
    const { client } = makeClient(fetchImpl as unknown as typeof fetch, null);
    expect(await client.get("/properties", {})).toEqual({ ok: false, error: "auth" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("maps 401/403 to auth", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 401 }));
    const { client } = makeClient(fetchImpl as unknown as typeof fetch);
    expect(await client.get("/properties", {})).toEqual({ ok: false, error: "auth" });
  });

  it("maps 429 to rate_limited and opens the breaker", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 429, headers: { "x-five-min-limit-resets-in": "60" } }));
    const { client, breaker } = makeClient(fetchImpl as unknown as typeof fetch);
    expect(await client.get("/properties", {})).toEqual({ ok: false, error: "rate_limited" });
    expect(await breaker.isOpen()).toBe(true);
  });

  it("returns breaker_open without calling the API once credits drop below 20", async () => {
    const fetchImpl = vi.fn(async () => okResponse({ success: true, data: [] }, { "x-five-min-limit-remaining": "15" }));
    const { client } = makeClient(fetchImpl as unknown as typeof fetch);
    await client.get("/properties", {});
    expect(await client.get("/properties", {})).toEqual({ ok: false, error: "breaker_open" });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("treats success:false with HTTP 200 as api_error, not empty data", async () => {
    const fetchImpl = vi.fn(async () => okResponse({ success: false, error: "something" }));
    const { client } = makeClient(fetchImpl as unknown as typeof fetch);
    expect(await client.get("/inventory/rooms/offers", {})).toEqual({ ok: false, error: "api_error" });
  });

  it("returns timeout when the API is slower than timeoutMs", async () => {
    const fetchImpl = vi.fn((_url: string, init: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
      }),
    );
    const { client } = makeClient(fetchImpl as unknown as typeof fetch);
    expect(await client.get("/properties", {})).toEqual({ ok: false, error: "timeout" });
  });

  it("returns network on fetch failure", async () => {
    const fetchImpl = vi.fn(async () => { throw new TypeError("fetch failed"); });
    const { client } = makeClient(fetchImpl as unknown as typeof fetch);
    expect(await client.get("/properties", {})).toEqual({ ok: false, error: "network" });
  });

  it("never logs the token or query values", async () => {
    const fetchImpl = vi.fn(async () => okResponse({ success: true, data: [] }));
    const { client, log } = makeClient(fetchImpl as unknown as typeof fetch);
    await client.get("/inventory/rooms/offers", { arrival: "2026-12-01", numAdults: 2 });
    expect(log).toHaveBeenCalledWith({ path: "/inventory/rooms/offers", status: 200, cost: 1 });
    expect(JSON.stringify(log.mock.calls)).not.toContain("tkn");
    expect(JSON.stringify(log.mock.calls)).not.toContain("2026-12-01");
  });
});
```

- [x] **Step 6: Rodar e ver falhar**

Run: `npx vitest run src/lib/beds24/client.test.ts`
Expected: FAIL, módulo não encontrado.

- [x] **Step 7: Implementar client**

`src/lib/beds24/client.ts`:
```ts
import "server-only";
import type { Beds24Result } from "./types";
import type { CreditBreaker } from "./breaker";

type ParamValue = string | number | boolean | Array<string | number>;
type LogEntry = { path: string; status: number | "timeout" | "network" | "skipped"; cost: number | null };

export type Beds24Client = {
  get<T>(path: string, params: Record<string, ParamValue>): Promise<Beds24Result<T>>;
};

function buildUrl(baseUrl: string, path: string, params: Record<string, ParamValue>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) value.forEach((v) => search.append(key, String(v)));
    else search.append(key, String(value));
  }
  const query = search.toString();
  return `${baseUrl}${path}${query ? `?${query}` : ""}`;
}

export function createBeds24Client(opts: {
  token: string | null;
  breaker: CreditBreaker;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  baseUrl?: string;
  log?: (entry: LogEntry) => void;
}): Beds24Client {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const timeoutMs = opts.timeoutMs ?? 4000;
  const baseUrl = opts.baseUrl ?? "https://api.beds24.com/v2";
  const log = opts.log ?? ((entry: LogEntry) => console.info("beds24", entry));

  return {
    async get<T>(path: string, params: Record<string, ParamValue>): Promise<Beds24Result<T>> {
      if (!opts.token) return { ok: false, error: "auth" };
      if (await opts.breaker.isOpen()) {
        log({ path, status: "skipped", cost: null });
        return { ok: false, error: "breaker_open" };
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      let response: Response;
      try {
        response = await fetchImpl(buildUrl(baseUrl, path, params), {
          method: "GET",
          headers: { token: opts.token, accept: "application/json" },
          signal: controller.signal,
        });
      } catch (error) {
        const isAbort = (error as { name?: string } | null)?.name === "AbortError";
        log({ path, status: isAbort ? "timeout" : "network", cost: null });
        return { ok: false, error: isAbort ? "timeout" : "network" };
      } finally {
        clearTimeout(timer);
      }

      await opts.breaker.record(response.headers, response.status);
      const costHeader = Number(response.headers.get("x-request-cost"));
      log({ path, status: response.status, cost: Number.isFinite(costHeader) && response.headers.has("x-request-cost") ? costHeader : null });

      if (response.status === 401 || response.status === 403) return { ok: false, error: "auth" };
      if (response.status === 429) return { ok: false, error: "rate_limited" };
      if (!response.ok) return { ok: false, error: "http" };

      let body: { success?: boolean; data?: T };
      try {
        body = await response.json();
      } catch {
        return { ok: false, error: "api_error" };
      }
      if (body.success !== true || body.data === undefined) return { ok: false, error: "api_error" };
      return { ok: true, data: body.data };
    },
  };
}
```

- [x] **Step 8: Rodar e ver passar**

Run: `npx vitest run src/lib/beds24/`
Expected: PASS (17 testes).

- [ ] **Step 9: Commit**

```bash
git add src/lib/beds24
git commit -m "feat: add server-only Beds24 client with credit circuit breaker

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Beds24 — validação de busca e link de reserva

**Files:**
- Create: `src/lib/beds24/search.ts`, `src/lib/beds24/search.test.ts`, `src/lib/beds24/booking-url.ts`, `src/lib/beds24/booking-url.test.ts`

**Interfaces:**
- Produces:

```ts
// search.ts
export type Stay = { checkin: string; checkout: string; nights: number; adults: number; children: number };
export type SearchError = "invalid_date" | "checkin_in_past" | "checkout_not_after_checkin" | "too_many_nights" | "invalid_guests";
export function todayInSaoPaulo(now?: Date): string; // "YYYY-MM-DD"
export function parseSearch(params: URLSearchParams, today: string): { ok: true; stay: Stay } | { ok: false; error: SearchError };

// booking-url.ts
export function bookingUrl(opts: { propId: number; roomId: number; referer: string; stay?: Stay }): string;
```

Os nomes de parâmetro da URL do site são `checkin`, `checkout`, `adultos` e `criancas`.

- [ ] **Step 1: Testes que falham de `search`**

`src/lib/beds24/search.test.ts`:
```ts
// @vitest-environment node
import { describe, it, expect } from "vitest";
import { parseSearch, todayInSaoPaulo } from "./search";

const q = (s: string) => new URLSearchParams(s);
const TODAY = "2026-10-01";

describe("todayInSaoPaulo", () => {
  it("uses São Paulo date at 23:30 local even though UTC is already the next day", () => {
    // 2026-10-02T02:30Z = 2026-10-01 23:30 em SP (UTC-3)
    expect(todayInSaoPaulo(new Date("2026-10-02T02:30:00Z"))).toBe("2026-10-01");
  });
});

describe("parseSearch", () => {
  it("parses a valid stay and computes nights", () => {
    expect(parseSearch(q("checkin=2026-10-01&checkout=2026-10-03&adultos=2&criancas=1"), TODAY)).toEqual({
      ok: true,
      stay: { checkin: "2026-10-01", checkout: "2026-10-03", nights: 2, adults: 2, children: 1 },
    });
  });

  it("defaults children to 0", () => {
    const r = parseSearch(q("checkin=2026-10-05&checkout=2026-10-06&adultos=2"), TODAY);
    expect(r.ok && r.stay.children).toBe(0);
  });

  it("accepts check-in today", () => {
    expect(parseSearch(q("checkin=2026-10-01&checkout=2026-10-02&adultos=1"), TODAY).ok).toBe(true);
  });

  it("rejects check-in in the past", () => {
    expect(parseSearch(q("checkin=2026-09-30&checkout=2026-10-02&adultos=2"), TODAY)).toEqual({ ok: false, error: "checkin_in_past" });
  });

  it("rejects checkout equal to or before check-in", () => {
    expect(parseSearch(q("checkin=2026-10-05&checkout=2026-10-05&adultos=2"), TODAY)).toEqual({ ok: false, error: "checkout_not_after_checkin" });
  });

  it("rejects more than 30 nights", () => {
    expect(parseSearch(q("checkin=2026-10-01&checkout=2026-11-01&adultos=2"), TODAY)).toEqual({ ok: false, error: "too_many_nights" });
    expect(parseSearch(q("checkin=2026-10-01&checkout=2026-10-31&adultos=2"), TODAY).ok).toBe(true);
  });

  it("rejects impossible or malformed dates", () => {
    expect(parseSearch(q("checkin=2026-02-30&checkout=2026-03-02&adultos=2"), TODAY)).toEqual({ ok: false, error: "invalid_date" });
    expect(parseSearch(q("checkin=01/10/2026&checkout=2026-10-03&adultos=2"), TODAY)).toEqual({ ok: false, error: "invalid_date" });
    expect(parseSearch(q("adultos=2"), TODAY)).toEqual({ ok: false, error: "invalid_date" });
  });

  it("rejects guest counts out of range", () => {
    const base = "checkin=2026-10-05&checkout=2026-10-07";
    expect(parseSearch(q(`${base}&adultos=0`), TODAY)).toEqual({ ok: false, error: "invalid_guests" });
    expect(parseSearch(q(`${base}&adultos=21`), TODAY)).toEqual({ ok: false, error: "invalid_guests" });
    expect(parseSearch(q(`${base}&adultos=2&criancas=11`), TODAY)).toEqual({ ok: false, error: "invalid_guests" });
    expect(parseSearch(q(`${base}&adultos=15&criancas=6`), TODAY)).toEqual({ ok: false, error: "invalid_guests" });
    expect(parseSearch(q(`${base}&adultos=2.5`), TODAY)).toEqual({ ok: false, error: "invalid_guests" });
    expect(parseSearch(q(`${base}&adultos=20`), TODAY).ok).toBe(true);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/lib/beds24/search.test.ts`
Expected: FAIL, módulo não encontrado.

- [ ] **Step 3: Implementar `search.ts`**

`src/lib/beds24/search.ts`:
```ts
export type Stay = { checkin: string; checkout: string; nights: number; adults: number; children: number };
export type SearchError = "invalid_date" | "checkin_in_past" | "checkout_not_after_checkin" | "too_many_nights" | "invalid_guests";

const MAX_NIGHTS = 30;
const MAX_ADULTS = 20;
const MAX_CHILDREN = 10;
const MAX_GUESTS = 20;
const DAY_MS = 86_400_000;

export function todayInSaoPaulo(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

function parseIsoDate(value: string | null): number | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  const time = Date.UTC(y, m - 1, d);
  const check = new Date(time);
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m - 1 || check.getUTCDate() !== d) return null;
  return time;
}

function parseCount(value: string | null, fallback: number | null): number | null {
  if (value === null || value === "") return fallback;
  if (!/^\d+$/.test(value)) return null;
  return Number(value);
}

export function parseSearch(params: URLSearchParams, today: string): { ok: true; stay: Stay } | { ok: false; error: SearchError } {
  const checkinRaw = params.get("checkin");
  const checkoutRaw = params.get("checkout");
  const checkin = parseIsoDate(checkinRaw);
  const checkout = parseIsoDate(checkoutRaw);
  const todayTime = parseIsoDate(today);
  if (checkin === null || checkout === null || todayTime === null) return { ok: false, error: "invalid_date" };
  if (checkin < todayTime) return { ok: false, error: "checkin_in_past" };
  if (checkout <= checkin) return { ok: false, error: "checkout_not_after_checkin" };
  const nights = Math.round((checkout - checkin) / DAY_MS);
  if (nights > MAX_NIGHTS) return { ok: false, error: "too_many_nights" };

  const adults = parseCount(params.get("adultos"), null);
  const children = parseCount(params.get("criancas"), 0);
  if (adults === null || children === null) return { ok: false, error: "invalid_guests" };
  if (adults < 1 || adults > MAX_ADULTS || children > MAX_CHILDREN || adults + children > MAX_GUESTS) {
    return { ok: false, error: "invalid_guests" };
  }

  return { ok: true, stay: { checkin: checkinRaw!, checkout: checkoutRaw!, nights, adults, children } };
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/lib/beds24/search.test.ts`
Expected: PASS (9 testes).

- [ ] **Step 5: Testes que falham de `bookingUrl`**

`src/lib/beds24/booking-url.test.ts`:
```ts
// @vitest-environment node
import { describe, it, expect } from "vitest";
import { bookingUrl } from "./booking-url";

describe("bookingUrl", () => {
  it("without a search, preselects only property and room, plus referer", () => {
    const url = new URL(bookingUrl({ propId: 111, roomId: 222, referer: "site-v2" }));
    expect(url.origin + url.pathname).toBe("https://beds24.com/booking2.php");
    expect(Object.fromEntries(url.searchParams)).toEqual({ propid: "111", roomid: "222", referer: "site-v2" });
  });

  it("with a search, prefills dates, nights, guests and selects the room offer", () => {
    const url = new URL(
      bookingUrl({
        propId: 111,
        roomId: 222,
        referer: "site-v2",
        stay: { checkin: "2026-12-10", checkout: "2026-12-12", nights: 2, adults: 2, children: 0 },
      }),
    );
    expect(Object.fromEntries(url.searchParams)).toEqual({
      propid: "111",
      roomid: "222",
      checkin: "2026-12-10",
      numnight: "2",
      numadult: "2",
      numchild: "0",
      "br1-222": "Book",
      referer: "site-v2",
    });
  });

  it("encodes a referer with spaces safely", () => {
    const url = new URL(bookingUrl({ propId: 1, roomId: 2, referer: "site v2" }));
    expect(url.searchParams.get("referer")).toBe("site v2");
  });
});
```

- [ ] **Step 6: Rodar e ver falhar**

Run: `npx vitest run src/lib/beds24/booking-url.test.ts`
Expected: FAIL, módulo não encontrado.

- [ ] **Step 7: Implementar `booking-url.ts`**

`src/lib/beds24/booking-url.ts`:
```ts
import type { Stay } from "./search";

const BOOKING_PAGE = "https://beds24.com/booking2.php";

export function bookingUrl(opts: { propId: number; roomId: number; referer: string; stay?: Stay }): string {
  const params = new URLSearchParams();
  params.set("propid", String(opts.propId));
  params.set("roomid", String(opts.roomId));
  if (opts.stay) {
    params.set("checkin", opts.stay.checkin);
    params.set("numnight", String(opts.stay.nights));
    params.set("numadult", String(opts.stay.adults));
    params.set("numchild", String(opts.stay.children));
    params.set(`br1-${opts.roomId}`, "Book");
  }
  params.set("referer", opts.referer);
  return `${BOOKING_PAGE}?${params.toString()}`;
}
```

- [ ] **Step 8: Rodar e ver passar; commit**

Run: `npx vitest run src/lib/beds24/`
Expected: PASS (todos).

```bash
git add src/lib/beds24
git commit -m "feat: add Beds24 search validation and booking link builder

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Beds24 — token, descoberta de property/rooms e mapeamento

**Pré-requisito (ação da proprietária):**
1. Beds24 → Settings → Marketplace → API (`https://beds24.com/control3.php?pagetype=apiv2`) → gerar **long life
   token** (não invite code) com escopos `read:properties` e `read:inventory`. Nenhum escopo de escrita nem de bookings.
   Long-life tokens são somente leitura e saem direto dessa tela; `GET /authentication/setup` não é usado (ele
   devolve token de 24 h + refresh token, que não queremos).
2. Colar o token em `.env.local` (`BEDS24_TOKEN=`) e no Cloudflare (`npx wrangler secret put BEDS24_TOKEN`).
3. Lembrete: token long-life expira após 90 dias sem uso; o cron da Fase 3 mantém o uso.

O token nunca é colado no chat nem em commit.

**Files:**
- Create: `src/lib/beds24/properties.ts`, `src/lib/beds24/properties.test.ts`, `scripts/beds24-discover.mts`, `docs/beds24-mapeamento.md`, `src/lib/beds24/__fixtures__/properties.json`

**Interfaces:**
- Consumes: `Beds24Client` (Task 6).
- Produces:

```ts
export type PropertyRooms = { propertyId: number; propertyName: string; rooms: Array<{ roomId: number; name: string; maxPeople: number | null }> };
export function getPropertyRooms(client: Beds24Client): Promise<Beds24Result<PropertyRooms[]>>;
```

- [ ] **Step 1: Capturar resposta real (read-only) e gravar fixture sanitizada**

`scripts/beds24-discover.mts` (ESM, por causa do top-level await):
```ts
import { writeFileSync } from "node:fs";

const token = process.env.BEDS24_TOKEN;
if (!token) {
  console.error("BEDS24_TOKEN ausente");
  process.exit(1);
}

const res = await fetch("https://api.beds24.com/v2/properties?includeAllRooms=true", {
  headers: { token, accept: "application/json" },
});
console.error(`status=${res.status} remaining=${res.headers.get("x-five-min-limit-remaining")} cost=${res.headers.get("x-request-cost")}`);
const body = await res.json();

const sanitized = {
  success: body.success,
  data: (body.data ?? []).map((p: Record<string, unknown>) => ({
    id: p.id,
    name: p.name,
    roomTypes: ((p.roomTypes as Record<string, unknown>[]) ?? []).map((r) => ({ id: r.id, name: r.name, maxPeople: r.maxPeople })),
  })),
};
writeFileSync("src/lib/beds24/__fixtures__/properties.json", JSON.stringify(sanitized, null, 2) + "\n");
for (const p of sanitized.data) {
  console.log(`property ${p.id} — ${p.name}`);
  for (const r of p.roomTypes) console.log(`  room ${r.id} — ${r.name} (max ${r.maxPeople ?? "?"})`);
}
```

Run: `mkdir -p src/lib/beds24/__fixtures__ && node --env-file=.env.local --experimental-strip-types scripts/beds24-discover.mts`
Expected: `status=200`, lista de property e rooms. Se os nomes dos campos (`roomTypes`, `maxPeople`) forem diferentes na resposta real, ajustar o script ao formato real antes de seguir, e registrar o formato observado em `docs/beds24-mapeamento.md`.

- [ ] **Step 2: Teste que falha de `getPropertyRooms`**

`src/lib/beds24/properties.test.ts`:
```ts
// @vitest-environment node
import { describe, it, expect, vi } from "vitest";
import fixture from "./__fixtures__/properties.json";
import { getPropertyRooms } from "./properties";
import type { Beds24Client } from "./client";

describe("getPropertyRooms", () => {
  it("maps the real /properties response into property and room ids", async () => {
    const client: Beds24Client = { get: vi.fn(async () => ({ ok: true as const, data: fixture.data })) } as unknown as Beds24Client;
    const result = await getPropertyRooms(client);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.length).toBeGreaterThan(0);
    for (const property of result.data) {
      expect(Number.isInteger(property.propertyId)).toBe(true);
      for (const room of property.rooms) {
        expect(Number.isInteger(room.roomId)).toBe(true);
        expect(room.name.length).toBeGreaterThan(0);
      }
    }
    expect(client.get).toHaveBeenCalledWith("/properties", { includeAllRooms: true });
  });

  it("passes errors through unchanged", async () => {
    const client = { get: vi.fn(async () => ({ ok: false as const, error: "auth" as const })) } as unknown as Beds24Client;
    expect(await getPropertyRooms(client)).toEqual({ ok: false, error: "auth" });
  });
});
```

Adicionar `"resolveJsonModule": true` em `tsconfig.json` → `compilerOptions` se ainda não existir.

- [ ] **Step 3: Rodar e ver falhar**

Run: `npx vitest run src/lib/beds24/properties.test.ts`
Expected: FAIL, módulo não encontrado.

- [ ] **Step 4: Implementar `properties.ts`**

`src/lib/beds24/properties.ts`:
```ts
import "server-only";
import type { Beds24Client } from "./client";
import type { Beds24Result } from "./types";

type RawRoom = { id: number; name?: string; maxPeople?: number | null };
type RawProperty = { id: number; name?: string; roomTypes?: RawRoom[] };

export type PropertyRooms = {
  propertyId: number;
  propertyName: string;
  rooms: Array<{ roomId: number; name: string; maxPeople: number | null }>;
};

export async function getPropertyRooms(client: Beds24Client): Promise<Beds24Result<PropertyRooms[]>> {
  const result = await client.get<RawProperty[]>("/properties", { includeAllRooms: true });
  if (!result.ok) return result;
  return {
    ok: true,
    data: result.data.map((p) => ({
      propertyId: p.id,
      propertyName: p.name ?? "",
      rooms: (p.roomTypes ?? []).map((r) => ({ roomId: r.id, name: r.name ?? `room ${r.id}`, maxPeople: r.maxPeople ?? null })),
    })),
  };
}
```

- [ ] **Step 5: Rodar e ver passar**

Run: `npx vitest run src/lib/beds24/`
Expected: PASS (todos).

- [ ] **Step 6: Registrar mapeamento e preencher Sanity**

`docs/beds24-mapeamento.md` (preencher com a saída do Step 1):
```markdown
# Mapeamento Beds24 ↔ Sanity

propertyId: <id> (<nome>)

| Acomodação (Sanity) | roomId Beds24 | Nome na Beds24 | maxPeople | ocupacaoReferencia |
|---|---|---|---|---|
| Ágata | | | | 2 |
| Mirante | | | | 2 |
| Doce Recanto | | | | 2 |
| Domo Estelar | | | | 2 |
| Chalé para Grupos | | | | (definir com a proprietária) |
| Celeiro | | | | (definir com a proprietária) |

Formato observado da resposta `/properties`: <campos reais usados>.
```

A proprietária confirma cada linha e a ocupação de referência dos grupos. Depois:
- `siteSettings.beds24PropertyId` recebe o propertyId;
- as 6 acomodações são criadas no Studio (só nome, slug, `beds24RoomId`, `ocupacaoReferencia`);
- conteúdo completo das acomodações fica para a Fase 2.

- [ ] **Step 7: Verificação server-only**

```bash
npm run build
grep -rl "api.beds24.com" .next/static && echo "VAZOU PARA O CLIENTE" || echo "ok: nada no bundle do navegador"
```
Expected: `ok: nada no bundle do navegador`.

- [ ] **Step 8: Commit**

```bash
git add src/lib/beds24 scripts/beds24-discover.mts docs/beds24-mapeamento.md tsconfig.json
git commit -m "feat: discover Beds24 property and rooms, document mapping

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Revisão independente 2 (após Tasks 6–8)

Revisor independente lê o `git diff` dos Tasks 6–8 e verifica: breaker abre com `remaining < 20` ou 429, respeita
`resets-in`, não chama a API aberto; token Beds24 fora de logs, fixtures, commits e bundle do cliente; só escopos
`read:properties` + `read:inventory`; nenhuma chamada de escrita; `success:false` vira erro. Achados confirmados
voltam como correção antes do Task 9.

---

### Task 9: Fechamento da Fase 1

**Files:**
- Modify: `docs/infra-medicoes.md`

- [ ] **Step 1: Rodar tudo**

Run: `npm run typecheck && npm run lint && npm test && npm run e2e && npm run build`
Expected: tudo verde.

- [ ] **Step 2: Conferir critérios de pronto da Fase 1**

- [ ] Tag `site-v1-final` e branch `archive/site-v1` no GitHub.
- [ ] Preview `*.workers.dev` da `v2` responde 200.
- [ ] Edição visual: editar o Hero no Presentation e ver mudar ao vivo; rascunho não vaza.
- [ ] `getPropertyRooms` com token real devolve a property e os 6 quartos, e o mapeamento foi confirmado pela proprietária.
- [ ] `https://sitiorecantoazul.com.br` continua na Vercel, sem mudança.
- [ ] Nenhum deploy da Vercel para a `v2`.

- [ ] **Step 2b: Revisão independente final da branch**

Revisor independente lê `git diff archive/site-v1..v2` inteiro contra a spec e este plano. Achados confirmados
são corrigidos antes do relatório.

- [ ] **Step 3: Decisão de plano Cloudflare**

Completar `docs/infra-medicoes.md` com CPU p50/p99 de `/` e `/api/draft-mode/enable` no preview. Escrever no fim do arquivo uma das duas linhas:
- `Decisão: permanecer no Workers Free (nenhuma rota acima de 10 ms de CPU no p99).`
- `Decisão: necessidade de Workers Paid — <rota> com p99 de <x> ms. Aguardando aprovação da proprietária.`

Migrar de plano só com aprovação da proprietária.

- [ ] **Step 4: Commit e relatório**

```bash
git add docs/infra-medicoes.md
git commit -m "docs: close Phase 1 with infra measurements

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

Relatório curto à proprietária: o que está pronto, medições, ações pendentes dela e início do plano da Fase 2.
