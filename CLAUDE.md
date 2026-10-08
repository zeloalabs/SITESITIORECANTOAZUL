# CLAUDE.md — Sítio Recanto Azul (site V2)

Fonte da verdade do projeto: `docs/superpowers/specs/2026-10-01-site-v2-design.md`.
Plano em execução: `docs/superpowers/plans/2026-10-01-site-v2-fase1-fundacao.md`.

## Estado do código
- Site real: `src/app/(site)/*`; componentes em `src/components/{site,sections}`; conteúdo em `src/lib/content/`.
  Previews (`/design-previews/*`) são só referência visual. Visão geral: `docs/fase2-implementacao.md`.

## Git
1. Repo canônico: `zeloalabs/SITESITIORECANTOAZUL`.
2. Nunca push direto em `main`. Desenvolvimento na branch `v2` (ou branches curtas com merge em `v2`).
3. Merge `v2 → main` só no lançamento, após "pode publicar" explícito da proprietária.
4. O site V1 está preservado na tag `site-v1-final` e na branch `archive/site-v1` (commit `6d3e8bf`).

## Escopo
5. Somente o site institucional do Sítio Recanto Azul. Não acessar Zeloa, CRM ou outros projetos.
6. Beds24 é a única fonte de preço, disponibilidade, mínimo de noites e restrições. Acesso somente leitura
   (`read:properties` + `read:inventory`). O site nunca cria nem altera reservas.
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
