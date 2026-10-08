import type { HeroSection } from "@/lib/content/types";
import { Photo } from "@/components/site/fx";
import { photo } from "@/components/site/util";
import { placeholderImg } from "@/lib/images";

export function Hero({ section }: { section: HeroSection }) {
  const img = section.image ?? placeholderImg("Hero — foto de capa");
  return (
    <section className="pd2-hero">
      <Photo {...photo(img)} zoom priority parallax={false} />
      <div className="pd2-hero-body">
        <h1>{section.title}</h1>
        {section.text ? <p className="lede">{section.text}</p> : null}
      </div>
      {section.showSearch !== false ? (
        <>
          {/* Sem busca por datas ainda (Fase 3): chamada para a lista de acomodações. */}
          <div className="pd2-find pd2-find-desktop">
            <span className="f"><span className="k">Reservas</span><span className="v">Escolha a acomodação e consulte as datas</span></span>
            <a className="pd2-link" href="#acomodacoes">Consultar disponibilidade</a>
          </div>
          <div className="pd2-hero-mobile-action">
            <a className="pd2-link pd2-hero-mobile-btn" href="#acomodacoes">Consultar disponibilidade</a>
          </div>
        </>
      ) : null}
    </section>
  );
}
