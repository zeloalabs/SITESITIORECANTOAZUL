import "@/components/site/fx.css";
import "@/components/site/site.css";
import { d2Fonts } from "@/components/site/fonts";

// Raiz visual do site público: fontes provisórias da D2 (Par 1 no desktop, Par 2 no mobile) e resets do tema.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const f = d2Fonts();
  return (
    <div className={`site-root ${f.className}`} style={f.style}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      {f.hrefs.map((h) => <link key={h} rel="stylesheet" href={h} />)}
      <a className="pd2-skip" href="#conteudo">Pular para o conteúdo</a>
      {children}
    </div>
  );
}
