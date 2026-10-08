import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { guard } from "./content";
import "@/components/site/fx.css";
import "./a.css";
import "./b.css";
import "./c.css";
import "./d.css";
import "@/components/site/site.css";

export const metadata: Metadata = { title: "Previews de design — Sítio Recanto Azul", robots: { index: false, follow: false } };

export default function PreviewsLayout({ children }: { children: React.ReactNode }) {
  // Previews não existem em produção (mesmo padrão do fixture /e2e).
  if (!guard()) notFound();
  return <div className="site-root">{children}</div>;
}
