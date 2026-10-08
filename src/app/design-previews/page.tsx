import Link from "next/link";
import { notFound } from "next/navigation";
import { guard } from "./content";

export default function PreviewsHub() {
  if (!guard()) notFound();
  const items = [
    { v: "a", t: "A — Editorial / revista", d: "Quiet luxury. Hero em colagem de fotos, grid assimétrico, serifa fina em grande escala." },
    { v: "b", t: "B — Galeria silenciosa", d: "Muito espaço, uma foto por vez, parede de galeria com rolagem horizontal." },
    { v: "c", t: "C — Imersiva", d: "Fundo escuro, fotos em tela cheia, máscara circular e pilha de cartões." },
  ];

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", maxWidth: 760, margin: "0 auto", padding: "56px 20px", color: "#0f1b3a" }}>
      <h1 style={{ fontSize: 28, fontWeight: 500 }}>Previews de design — Home</h1>
      <p style={{ color: "#575c69", margin: "10px 0 28px" }}>Sítio Recanto Azul V2 · Fase 2. Cada proposta tem 2 pares de fontes (Par 1 / Par 2).</p>
      <ul style={{ display: "grid", gap: 14, listStyle: "none", padding: 0 }}>
        {items.map((i) => (
          <li key={i.v} style={{ border: "1px solid #d7d0c2", padding: 18 }}>
            <b>{i.t}</b>
            <p style={{ margin: "6px 0 12px", color: "#575c69" }}>{i.d}</p>
            <Link href={`/design-previews/${i.v}?fonts=1`}>Par 1</Link> · <Link href={`/design-previews/${i.v}?fonts=2`}>Par 2</Link>
          </li>
        ))}
      </ul>
      <h2 style={{ fontSize: 20, fontWeight: 500, margin: "36px 0 12px" }}>Rodada 2 — síntese</h2>
      <ul style={{ display: "grid", gap: 14, listStyle: "none", padding: 0 }}>
        <li style={{ border: "1px solid #d7d0c2", padding: 18 }}>
          <b>D — Base C + índice editorial do A + silêncio do B</b>
          <p style={{ margin: "10px 0 0" }}>
            <Link href="/design-previews/d?fonts=1">Par 1</Link> · <Link href="/design-previews/d?fonts=2">Par 2</Link>
          </p>
        </li>
      </ul>
    </main>
  );
}
