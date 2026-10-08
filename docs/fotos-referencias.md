# Referências das fotos (para recuperar os originais)

As fotos **não estão no repositório** (`public/design-previews/` é ignorado pelo Git) e a "Biblioteca Oficial"
(`web-avif` / `master`, rastreada por `manifest.json`) ainda precisa ser localizada. O site real usa **placeholders
identificáveis** ("FOTO PENDENTE" + rótulo) onde não há foto no Sanity. Esta lista preserva os nomes usados nos previews D2
(`src/app/design-previews/content.ts` → `PH(nome)` = `/design-previews/photos/<nome>.avif`, exceto `exp-araucaria`.jpg)
para achar o arquivo certo depois e enviá-lo pelo Studio (campo indicado).

## Acomodações (capa → `coverImage`; demais → `gallery`)

| Acomodação | Capa (preview) | Ponto focal | Fotos da página (preview) |
|---|---|---|---|
| Domo Estelar | `domo-cover` (lista: `domo-cover`; painel: `domo-estrelas`) | 70% 88% | `domo-estrelas`, `domo-jacuzzi`, `domo-vale` |
| Ágata | `agata-exterior` | 50% 40% | `agata-cover`, `agata-deck`, `agata-fachada` |
| Mirante | `mirante-cover` | 50% 50% | `mirante-deck`, `mirante-aerea`, `mirante-sala` |
| Doce Recanto | `doce-janela` | 50% 55% | `doce-por-do-sol`, `doce-exterior`, `doce-cover` |
| Celeiro | `celeiro-jacuzzi` | 50% 55% | `celeiro-fogo`, `celeiro-sala`, `celeiro-pergola` |
| Chalé para Grupos | `grupos-varanda` | 50% 50% | `grupos-vista`, `grupos-galpao`, `grupos-lareira` |

Galeria completa (14–15 fotos por acomodação, proporção original): `src/app/design-previews/stay-photos.json`
(`/design-previews/stays/<slug>/NN.jpg`, com largura/altura).

## Home e páginas (seções do Studio)

| Onde (seção → campo) | Foto no preview |
|---|---|
| Hero da Home → `image` | `domo-cover` (foco 70% 88%) |
| Introdução → foto 1 / foto 2 | `mirante-aerea` ("Chalé Mirante"); `exp-araucaria`.jpg ("Passeio a cavalo") |
| Blocos de destaque → Extras / Casamentos | `/design-previews/extras/decoracao.jpg`; `celeiro-pergola` |
| Foto em tela cheia | `grupos-vista` ("Vista a partir do Chalé para Grupos") |
| Experiências → fotos a / b / c | `exp-cavalo`; `exp-cavalo-por-do-sol`; `exp-balanco` (foco 0% 40%) |
| Chamada final → foto de fundo | `domo-aerial` |
| Casamentos → texto com foto (provisória) | `grupos-vista` |
| Extras (documentos `extra`) | `extras/decoracao.jpg`, `extras/pedido.jpg`, `extras/cafe.jpg` |

Todos os campos de foto têm ponto focal (hotspot) e texto alternativo no Studio; o alt de cada foto é conteúdo a escrever.

## Inventário por acomodação/página (auditoria de 2026-10-08)

Status: **disponível** = arquivo no repositório · **referência apenas** = nome conhecido, arquivo fora do repositório · **ausente** = sem fonte conhecida.
Hoje **nenhuma foto real está no repositório** (único conteúdo de imagem do V1 são SVGs de placeholder, `archive/site-v1:public/images/placeholder/`).

| Onde | Foto necessária | Referência/nome | Função no site | Campo no Studio | Status |
|---|---|---|---|---|---|
| Domo Estelar | capa + 14 da galeria (15 no preview) | `domo-cover`, `domo-estrelas`, `domo-jacuzzi`, `domo-vale`; galeria `stays/domo-estelar/01–15.jpg` | hero da página, cartão, og:image | `accommodation.coverImage` / `gallery` | referência apenas |
| Ágata | capa + galeria (15) | `agata-exterior`, `agata-cover`, `agata-deck`, `agata-fachada`; `stays/agata/01–15.jpg` | idem | idem | referência apenas |
| Mirante | capa + galeria (14) | `mirante-cover`, `mirante-deck`, `mirante-aerea`, `mirante-sala`; `stays/mirante/01–14.jpg` | idem | idem | referência apenas |
| Doce Recanto | capa + galeria (15) | `doce-janela`, `doce-por-do-sol`, `doce-exterior`, `doce-cover`; `stays/doce-recanto/01–15.jpg` | idem | idem | referência apenas |
| Celeiro | capa + galeria (14) | `celeiro-jacuzzi`, `celeiro-fogo`, `celeiro-sala`, `celeiro-pergola`; `stays/celeiro/01–14.jpg` | idem | idem | referência apenas |
| Chalé para Grupos | capa + galeria (14) | `grupos-varanda`, `grupos-vista`, `grupos-galpao`, `grupos-lareira`; `stays/chale-para-grupos/01–14.jpg` | idem | idem | referência apenas |
| Home — hero | 1 horizontal/vertical com foco | `domo-cover` (70% 88%) | primeira dobra; og:image da Home | `hero.image` | referência apenas |
| Home — introdução | 2 | `mirante-aerea`, `exp-araucaria`.jpg | introdução | `intro.photos` | referência apenas |
| Home — blocos Extras/Casamentos | 2 | `extras/decoracao.jpg`, `celeiro-pergola` | atalhos | `blocosDestaque.tiles[].image` | referência apenas |
| Home — foto em tela cheia | 1 | `grupos-vista` | respiro visual | `fotoCheia.image` | referência apenas |
| Home/Experiências | 3 | `exp-cavalo`, `exp-cavalo-por-do-sol`, `exp-balanco` | bloco de experiências | `experienciasBloco.photos` | referência apenas |
| Chamada final | 1 | `domo-aerial` | fundo | `chamadaFinal.image` | referência apenas |
| Extras (3 documentos) | 3 | `extras/decoracao.jpg`, `extras/pedido.jpg`, `extras/cafe.jpg` | cartões | `extra.image` | referência apenas |
| Experiências (5 documentos) | opcional, 1 cada | só `exp-cavalo`, `exp-balanco`, `exp-araucaria` têm nome | cartões | `experience.image` | 3 referência / 2 ausentes (mirante pôr do sol, deck nascer do sol, piquenique sem nome) |
| Casamentos | fotos reais de casamentos no sítio | provisória: `grupos-vista` | texto com foto | `textoComFoto.image` | **ausente** (a Biblioteca não tinha) |
| Imagem social padrão (WhatsApp/Google) | 1 horizontal ≥ 1200×630 | — | `og:image` de páginas sem foto | `siteSettings.seoImage` (novo) | **ausente** |
| Sobre / Localização | opcional | — | `/sobre` ainda não existe | — | ausente |

Os 87 arquivos de galeria (15+15+14+15+14+14) estão contados em `src/app/design-previews/stay-photos.json` com largura/altura; os nomes originais dos
arquivos foram perdidos (viraram `NN.jpg`), então a ordem original só se recupera abrindo a Biblioteca.

### Onde estava a "Biblioteca Oficial" e como recuperar

- **No repositório não há nada**: nem os arquivos, nem o `manifest.json`, nem um caminho. As únicas pistas são os textos de `CLAUDE.md` (regra 13), do plano da Fase 2
  e deste arquivo: pastas `web-avif` (cópias web, AVIF) e `master` (originais), rastreadas por um `manifest.json`; o plano previa `docs/fotos-curadoria.md`, que **nunca foi criado**.
- As cópias usadas nos previews ficavam em `public/design-previews/{photos,stays,extras}/`, pasta **ignorada pelo Git** (`.gitignore`), portanto só existem na máquina/sessão onde foram geradas
  (a mesma de `acomodacoes.md`, também fora do repositório). Nenhum commit contém `public/design-previews`.
- Recuperar: (1) localizar a pasta "Biblioteca Oficial" (provavelmente no computador/nuvem da proprietária); (2) usar `web-avif` ou `master` + `manifest.json`; (3) casar pelos nomes desta tabela;
  (4) enviar pelo Studio (ou pela API de assets do Sanity). Ver o V1 não ajuda: ele só tinha SVGs de placeholder.
