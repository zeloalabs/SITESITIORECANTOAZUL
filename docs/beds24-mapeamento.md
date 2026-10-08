# Mapeamento Beds24 ↔ Sanity

propertyId: 357738 (Sítio Recanto Azul)

| Acomodação (Sanity) | roomId Beds24 | Nome na Beds24 | maxPeople | ocupacaoReferencia |
|---|---|---|---|---|
| Ágata | 737422 | Chalé Ágata | 4 | 2 |
| Mirante | 737427 | Chalé Mirante | 4 | 2 |
| Doce Recanto | 737430 | Chalé Doce Recanto | 4 | 2 |
| Domo Estelar | 737429 | Domo Estelar | 4 | 2 |
| Celeiro | 737433 | Celeiro Recanto | 11 | 11 |
| Chalé para Grupos | 737435 | Chalé Grupos | 20 | 6 |

## Formato observado da resposta `/properties` da Beds24 API V2

- Propriedade: `id`, `name`, `roomTypes`
- Quartos (`roomTypes[]`): `id`, `name`, `maxPeople`
- Exemplo do endpoint: `GET https://api.beds24.com/v2/properties?includeAllRooms=true`
- Autenticação: Header `token: <BEDS24_TOKEN>` (token long-life, somente leitura)
- Custo observado da chamada: `x-request-cost: 1.1`, créditos restantes `x-five-min-limit-remaining: 98.9`
