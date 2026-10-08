# Auditoria de conteúdo para o site real (2026-10-08)

Fontes: código atual, seed (`src/lib/content/seed.ts`), schemas do Studio, V1 (`archive/site-v1`), docs e `docs/fotos-referencias.md`. Nada foi inventado.
Legenda: ✅ confirmado por fonte existente · 📝 precisa de revisão da proprietária · ❌ falta.

> **Atualização 2026-10-08 (dados oficiais recebidos):** WhatsApp, Instagram, e-mail e link do Maps já estão na seed (ver `docs/fase2-implementacao.md`).
> Seguem pendentes: endereço postal, políticas (`docs/politicas-pendentes.md`) e fotos (recuperação no Mac, `docs/fotos-referencias.md`). As linhas abaixo refletem a auditoria original.

## Dados do sítio

| Item | Estado | Fonte / observação |
|---|---|---|
| WhatsApp (Românticas, Para grupos; Casamentos herda de Grupos) | ❌ | Nenhum número existe em fonte alguma (V1 só tinha `5500000000000`). Sem número o site esconde o botão em produção. Campo: `whatsappContact.number` |
| Instagram | 📝 | Só o `https://instagram.com/sitiorecantoazul` do seed do V1, nunca confirmado → **não está na seed nova**; campo `siteSettings.instagramUrl` vazio |
| E-mail | 📝 | `contato@sitiorecantoazul.com.br` vem do V1 e está na seed e na política de privacidade; confirmar que a caixa existe |
| Endereço | ❌ | V1: "Endereço a confirmar". Hoje só há "Alfredo Wagner · SC" e o link do Google Maps (✅ no seed). Campo `siteSettings.address` |
| Telefone | ❌ | V1: `(00) 00000-0000`. Não há campo no V2 (WhatsApp cobre); só criar se ela quiser |
| Mapa (link + embed) | ✅ | Google Maps do V1 |
| Beds24 propertyId/roomIds | ✅ | `357738`; quartos 737422/27/29/30/33/35 (não alterados) |

## Conteúdo editorial

| Bloco | Estado | Observação |
|---|---|---|
| Nome, frase de apresentação, "Um recanto para desacelerar", introdução | ✅ | V1/previews; voz preservada |
| Acomodações: nome, frase, capacidade, comodidades | ✅ | Capacidades: românticas 2 adultos + 2 crianças; Celeiro 11; Chalé para Grupos 20 (decisão registrada). Comodidades só as do V1/`acomodacoes.md` |
| Acomodações: textos "Sobre" | 📝 | Curtos e factuais (reescritos a partir do V1); a proprietária pode querer mais descrição |
| Acomodações: cama, banheiro, metragem, enxoval, cozinha, ar-condicionado, Wi-Fi, estacionamento | ❌ | Não existem em nenhuma fonte → não publicados. Entram em `amenities` quando ela informar |
| Extras (Decorações, Pedidos de casamento, Café da manhã) | 📝 | Nomes dela; descrições simuladas nos previews. Sem preço (regra: sem preço no CMS). Extras do Celeiro/Chalé: não definido |
| Experiências (5) | ✅ nomes / 📝 textos | Vêm do V1; "Turismo na região" sem fonte, não criada |
| Casamentos | 📝 | Texto reaproveita só fatos existentes (galpão, pergolado); falta o que o sítio realmente oferece, capacidade, fotos |
| Depoimentos | 📝 | Um só: **"Perfeito!!!", Bruna, Airbnb, set/2025**, marcado aprovado; confirmar autorização de uso. Faltam mais |
| FAQ (4) | 📝 | Vieram do V1 e dizem "informado na reserva" para check-in/out e mínimo de noites |
| Políticas (privacidade, hospedagem, pagamento) | 📝 / ❌ | Privacidade descreve o comportamento real do site. **Faltam**: horários de check-in/out, cancelamento, pagamento, regras de pets (limites?), silêncio/visitantes |
| Página Sobre | ❌ | Rota `/sobre` não existe; criar no Studio quando houver texto |

## SEO / social

| Item | Estado |
|---|---|
| Título/descrição padrão, da Home e das páginas | ✅ rascunhos na seed (📝 revisar tom) |
| Título/descrição por acomodação | geram-se automaticamente de frase+capacidade; campo próprio no Studio |
| og:image | Home = hero; acomodação = capa; demais páginas = **nova imagem padrão** `siteSettings.seoImage` (❌ foto ausente). Placeholder nunca vira og:image |
| sitemap/robots/canonical/JSON-LD de acomodação | ✅ |
| JSON-LD do sítio (telefone, endereço completo) | ❌ depende de endereço/telefone |

## Prontidão do Studio (resumo)

Já pronto: capa + galeria ordenada (ordem do array), ponto focal (hotspot) e alt obrigatório nas fotos de galeria/capa; comodidades e diferenciais (listas livres);
extras ligados a grupo ou acomodação; capacidade/limites validados; SEO título/descrição em páginas, acomodações e padrão do site; contatos WhatsApp com herança;
dados gerais (e-mail, Instagram, endereço, mapa). **Ajuste feito**: `siteSettings.seoImage` (imagem social padrão). Nada mais foi alterado: foto de capa sem alt só
tem aviso em seções e é obrigatória em acomodações; o design continua no código.
