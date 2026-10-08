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
          {/* Sem busca por datas ainda (Fase 3): a chamada leva à lista de acomodações. */}
          <div className="pd2-find pd2-find-desktop">
            <p className="v">Seis acomodações em Alfredo Wagner, SC. Escolha a sua para ver detalhes e reservar.</p>
            <a className="pd2-link" href="#acomodacoes">Ver acomodações</a>
          </div>
          <div className="pd2-hero-mobile-action">
            <a className="pd2-link pd2-hero-mobile-btn" href="#acomodacoes">Ver acomodações</a>
          </div>
        </>
      ) : null}
    </section>
  );
}
