// Disponibilidade de DEMONSTRAÇÃO dos previews: determinística por acomodação (blocos de 2–5 noites indisponíveis).
// Não é disponibilidade real e não deve ser usada em rotas públicas reais.
export function demoUnavailable(slug: string, day: number): boolean {
  let seed = 0;
  for (const ch of slug) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const block = Math.floor((day + (seed % 5)) / 4);
  const h = (Math.imul(block ^ seed, 2654435761) >>> 0) % 100;
  return h < 34;
}
