# Plano de redesign — "Hora azul" (menos serifa, menos cara de IA)

Status: **proposta para aprovação, nenhum código alterado.** Base: site real da branch `feat/site-real-d2`, revisão de UX/copy e a skill `frontend-design` do projeto
(calibração de "tells" de página gerada por IA) + `ux-copy` + `design-critique`.

Honestidade primeiro: "nível Oscar" aqui significa um padrão de prêmio de design (Awwwards/FWA): fotografia/vídeo de verdade, copy preciso, performance e uma
ideia memorável. O código e o design só chegam lá com **fotos reais fortes**; hoje não há nenhuma no site. Nenhum plano substitui isso.

## 1. Onde o D2 hoje parece "feito por IA" (e por quê o incômodo é justo)

Pela calibração da skill, estes são padrões estatísticos de página gerada. O D2 tem vários, todos verificáveis no código:

| Sinal | Onde está | Decisão |
|---|---|---|
| Serifa de alto contraste nos títulos (Fraunces / Bodoni Moda) | `fonts.ts`, `--f-display` | **Sai.** Títulos em sans. |
| Fundo creme quente + serifa (`#f4efe6`) | `.pd2-light` | **Sai.** Claro vira "neblina" (cinza-esverdeado frio). |
| Seta "→" colada em todo link/botão | `.pd2-link::after` | **Sai.** Link sem seta; botão é botão. |
| Textos com ponto médio ("Alfredo Wagner · SC", "Domo Estelar · 2 adultos") | rodapé, hero, seletor | **Sai.** Frases ou rótulos separados. |
| Fade-and-slide de entrada em quase toda seção (`Reveal`) | `fx.tsx`, Home | **Reduz** a um único momento (hero). |
| Fundo quase-preto azulado (`#070d1f`) em seções inteiras | `.pd2` | **Troca** por azul-noite de verdade, usado só em 1–2 capítulos. |
| Tudo em linhas finas/listas uniformes, mesmo peso em tudo | listas, FAQ, contatos | **Varia** o ritmo: fotos grandes, ficha de dados, blocos assimétricos. |
| Tipografia como entrega neutra (sem personalidade) | todo o site | **Muda:** a fonte vira parte do desenho. |

O que o D2 acertou e **fica**: mobile-first, foto como protagonista, painéis que se abrem no desktop, sem cartões/sombras genéricas, acessibilidade de base.

## 2. Conceito: "Hora azul na serra"

Assunto real: um sítio na Serra Catarinense (Alfredo Wagner) com domo de teto transparente, hidromassagens, lareiras, balanços, cavalos, noites frias e neblina.
O nome já é uma cor. A ideia: **o site é organizado pela luz do dia na serra** — manhã de neblina, tarde, hora azul, noite de estrelas — e a cor de cada capítulo vem dessa luz,
não de uma paleta decorativa. A coisa memorável (gastar a ousadia em um lugar só): **a transição do capítulo "tarde" para o "noite"** na Home, que leva da foto do
pôr do sol no mirante para a foto do domo sob as estrelas. Todo o resto fica quieto e disciplinado.

### Cores (contrastes calculados)

| Nome | Hex | Uso |
|---|---|---|
| Noite | `#0F2442` | capítulo escuro, rodapé, textos sobre claro (13,6:1 com Neblina) |
| Neblina | `#EDF0EF` | fundo claro principal (frio, não creme) |
| Mata | `#1F3A33` | um capítulo (experiências) — verde de araucária |
| Geada | `#C9D5DA` | divisões, campos, estados de foco no escuro (10,4:1 sobre Noite) |
| Azul Recanto | `#1F5FD6` | único acento: botão principal e link ativo (5,7:1 com branco) |
| Pedra | `#5B6770` | texto secundário sobre Neblina (5,1:1, AA) |

Laranja continua só dentro da logo. Sem terracota, sem verde-ácido, sem gradiente decorativo.

### Tipografia (uma ideia, duas famílias sans bem distintas)
- **Títulos: Archivo, eixo de largura expandido** (peso 500–600, sentença com `letter-spacing` levemente negativo). Dá cara de arquitetura/natureza contemporânea, sem serifa.
- **Texto e interface: Figtree** (já está no projeto, legível, humana).
- Sem caixa-alta espaçada, sem itálico decorativo, sem destacar uma palavra do título em outra cor/estilo.
- Escala: 14 / 16 / 18 / 24 / 36 / 56 / 88 px (fluida com `clamp`), linha ≤ 68 caracteres.
- Fontes **self-hosted** (variável, `font-display: swap`, preload só da família de título) — acaba de vez com o carregamento duplo dos dois pares do Google.

### Estrutura e espaçamento
- Alinhamento à esquerda, grade de 12 colunas no desktop, margens de 20 px no mobile e 72 px no desktop.
- Raio de borda único e pequeno (4 px) só em campos e botões; fotos sem raio.
- Estrutura visual só quando informa: **ficha de dados** (capacidade, hidromassagem, pets, lareira) é uma lista real; numeração só em sequência real (não usar).

### Movimento (orçamento)
- Um zoom lento no hero (já existe) + a transição do capítulo tarde → noite (CSS, sem biblioteca). O resto é resposta a ação (abrir menu, abas, galeria).
- Remover o `Reveal` das seções; `prefers-reduced-motion` desliga tudo.

## 3. Wireframes (ideias a validar com protótipo)

Home, mobile (390):
```
[ logo            Menu ]
┌────────────────────────┐
│  FOTO HERO (domo, fim  │  título 56px sans expandida, 2 linhas
│  de tarde)             │  "Dormir sob as estrelas, na serra"? (ver copy)
│  Ver acomodações  Reservar │  botão azul + link
└────────────────────────┘  [capítulo Manhã · Neblina]
 texto curto + 2 fotos desencontradas
[capítulo Tarde] acomodações: 6 linhas, foto 4:3, nome, 1 frase, capacidade
[capítulo Noite · Noite] foto do domo em tela cheia + frase + Reservar
[Mata] experiências: 1 foto grande + lista curta
[Neblina] pets · extras · casamentos (3 blocos de foto)
depoimentos reais (3) · localização · chamada final · rodapé
```
Página de acomodação, mobile: foto → nome/frase → **ficha de dados** → galeria → "Reserve sua estadia" → outras; **barra fixa inferior** (Reservar + WhatsApp) depois do hero.

## 4. Conversão (da revisão, incorporada ao desenho)
1. Hero: "Ver acomodações" (principal) + "Reservar" (motor Beds24, nova aba). "Consultar disponibilidade" só quando houver datas reais (Fase 3).
2. Barra fixa de reserva no mobile nas páginas de acomodação e na lista.
3. Seção "Reserve sua estadia" (hóspedes + WhatsApp + motor). Volta a "Disponibilidade" com calendário real.
4. Faixa de fatos confirmados na Home: pets sem custo extra, hidromassagem, aceita crianças nas românticas.
5. Prova social: 3–5 avaliações reais (Airbnb/Google) com origem e data; uma por acomodação. Sem dados reais, bloco menor.
6. Medição: Cloudflare Web Analytics; eventos de clique em Reservar e WhatsApp por página.
7. Dados estruturados `LodgingBusiness` na Home e nas acomodações; `alt` real das fotos.

## 5. Copy (voz: direta, calorosa, português do dia a dia, frase em minúscula após o primeiro termo)

Regras: nada de "experiência única/paraíso/refúgio dos sonhos"; verbo no botão; um mesmo termo para a mesma coisa; só fatos confirmados.

| Onde | Hoje | Proposta |
|---|---|---|
| Hero (título) | Um recanto para desacelerar | **Dormir sob as estrelas, na serra** (domo) *— a confirmar com a proprietária; alternativa: manter o título atual* |
| Hero (apoio) | Natureza, privacidade e experiências para casais e grupos. | Seis acomodações com hidromassagem em Alfredo Wagner, SC. Para casais, famílias e grupos. *(conferir "seis" e "hidromassagem em todas")* |
| CTA principal | Consultar disponibilidade | Ver acomodações |
| CTA secundário | Reservar | Reservar |
| Cards | Hidro com vista e rede horizontal… | Hidromassagem com vista e rede horizontal |
| Seção de reserva | Disponibilidade | Reserve sua estadia |
| Texto da seção | Domo Estelar · 2 adultos. Consulte datas e valores com a nossa equipe… | Quantas pessoas vão? Reserve direto ou fale com a gente para combinar as datas. |
| Chamada final | Escolha sua acomodação | Pronto para desacelerar? |
| Rótulos | Extras & ocasiões / Extras / Casamentos no sítio | **Extras** e **Casamentos** (um nome só em menu, título e card) |
| Mapa | Ver mapa | Carregar mapa |
| Pets | letra miúda | "Pets são bem-vindos, sem custo extra." em destaque |

## 6. Fotografia (o fator que decide)
- Hero: 1 foto horizontal de fim de tarde (domo) ou **vídeo curto de 6–8 s** (neblina/estrelas), poster em AVIF, vídeo só em conexões boas.
- Por acomodação: 1 foto de capa 16:10 + 8–15 na galeria, proporção original; alt descritivo.
- Sem texto sobre a foto, exceto hero e capítulo "noite". Corte por ponto focal do Sanity.
- Se faltar foto de casamentos/extras, usar bloco de texto, nunca foto de banco.

## 7. Orçamentos de qualidade
- Lighthouse ≥ 95 nas quatro categorias, LCP < 2,0 s em 4G, CLS ≈ 0, JS inicial enxuto (sem biblioteca de animação).
- WCAG AA: contraste validado por token (tabela acima), foco visível, alvos ≥ 44 px, reduced motion.
- Revisão visual em 390, 430, 768 e 1440 px a cada etapa.

## 8. Execução em etapas pequenas e verificáveis
0. **Prévia de tokens** (uma rota `/design-previews/hora-azul`, só cor + tipo + botões + um card), para aprovar a direção antes de mexer no site. *Verificação:* captura 390/1440.
1. **Troca de tokens** no CSS compartilhado (cores, fontes self-hosted, remoção da seta e do `Reveal`). *Verificação:* e2e atual passa; capturas; contraste.
2. **Chrome e CTAs:** header/nav, hero, barra fixa mobile, rodapé; copy da seção 5.
3. **Home em capítulos de luz**, incluindo a transição tarde → noite e a faixa de fatos.
4. **Página de acomodação:** ficha de dados, ordem nova, "Reserve sua estadia", barra fixa.
5. **Páginas internas** (Extras, Experiências, Casamentos, Políticas, FAQ, Contato, Localização).
6. **Página de links** (`/links`, mesma linguagem) — depende da lista de links (domínio bloqueado nesta sessão).
7. **QA final:** Lighthouse, acessibilidade, 5 larguras, SEO/estruturados, analytics, revisão independente.

## 9. Autocrítica do plano (o que mudei para não cair no padrão)
- Primeira ideia: manter creme + Archivo + azul "luxo". Descartei: creme + qualquer display é o clichê nº 1. O claro virou neblina fria.
- Primeira ideia: eyebrows e numeração por capítulo ("01 Manhã"). Descartei: não é sequência numérica real e é traço de template.
- Primeira ideia: efeito de rolagem em todas as seções. Reduzi a um único momento.

## 10. Decisões que preciso de você (com minha recomendação)
1. Direção "Hora azul" + Archivo/Figtree + azul `#1F5FD6`: **seguir?** (recomendo sim; faço a prévia da etapa 0 antes de qualquer mudança no site).
2. Hero: **foto** agora e vídeo depois (recomendado) ou já com vídeo (você tem imagens em movimento?).
3. Título do hero: manter "Um recanto para desacelerar" ou trocar por "Dormir sob as estrelas, na serra"?
4. Lista dos links da página `/links` (ou liberar o domínio para eu ler).
