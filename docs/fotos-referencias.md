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
