import Link from "next/link";
import { pairOf, type Variant } from "./content";

export function Chrome({ v, fonts, clean }: { v: Variant; fonts?: string; clean?: string }) {
  if (clean) return null;
  const cur = fonts === "2" ? "2" : "1";
  return (
    <div className="pv-chrome" role="navigation" aria-label="Controles do preview">
      <span>Proposta {v.toUpperCase()} · {pairOf(v, cur).label}</span>
      <Link href={`/design-previews/${v}?fonts=1`} aria-current={cur === "1"}>Par 1</Link>
      <Link href={`/design-previews/${v}?fonts=2`} aria-current={cur === "2"}>Par 2</Link>
      <Link href="/design-previews">Todas</Link>
    </div>
  );
}
