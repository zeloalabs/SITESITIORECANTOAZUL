import type { CSSProperties } from "react";
import { brand, stays, experiences, review, nav, pairOf, PH } from "../content";
import { Chrome } from "../chrome";
import { HScroll, Photo, Reveal, Ridge } from "@/components/site/fx";

type SP = Promise<{ fonts?: string; clean?: string }>;

// proporção e altura de cada moldura da galeria (ritmo irregular, como parede de galeria)
const frames: { ar: string; h: string }[] = [
  { ar: "4 / 5", h: "64vh" },
  { ar: "4 / 5", h: "50vh" },
  { ar: "4 / 5", h: "70vh" },
  { ar: "4 / 5", h: "56vh" },
  { ar: "4 / 3", h: "46vh" },
  { ar: "4 / 3", h: "60vh" },
];

export default async function PreviewB({ searchParams }: { searchParams: SP }) {
  const { fonts, clean } = await searchParams;
  const pair = pairOf("b", fonts);
  const style = { "--f-display": pair.display, "--f-body": pair.body } as CSSProperties;

  return (
    <div className="pb" style={style}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href={pair.href} />

      <header className="pb-head">
        <a href="#" aria-label={brand.name}><span className="pv-logo" role="img" aria-label={brand.name} /></a>
        <div className="pb-head-r">
          <a href="#">Reservar</a>
          <span>Menu</span>
        </div>
      </header>

      <section className="pb-hero">
        <div className="pb-hero-copy">
          <p className="pb-cap">{brand.place}</p>
          <h1>Um recanto <em>para desacelerar</em></h1>
          <p className="lede">{brand.tagline}.</p>
          <form className="pb-find" aria-label="Busca de datas (demonstração)">
            <div><small>Chegada</small><span>Selecione</span></div>
            <div><small>Partida</small><span>Selecione</span></div>
            <button type="button" aria-disabled="true">Consultar datas · 2 adultos</button>
          </form>
        </div>
        <figure className="pb-hero-ph">
          <Photo src={PH("domo-vale")} alt="Domo Estelar visto do alto, com o vale e as montanhas ao fundo" focus="50% 55%" zoom priority parallax={false} />
        </figure>
        <div className="pb-hero-note">
          <p className="pb-cap">Domo Estelar</p>
          <p className="pb-cap">Role ↓</p>
        </div>
      </section>

      <section className="pb-gal" aria-label="Acomodações">
        <div className="pb-gal-head">
          <h2 className="pb-title">Seis <em>acomodações</em></h2>
          <p className="pb-cap" style={{ marginTop: 14 }}>Deslize →</p>
        </div>
        <HScroll>
          <div className="pb-gal-intro">
            <p className="pb-cap">Acomodações</p>
            <h2 className="pb-title">Cada espaço, uma forma de <em>desacelerar</em></h2>
            <p>Role para atravessar as seis acomodações do sítio.</p>
          </div>
          {stays.map((s, i) => (
            <figure className="pb-frame" key={s.slug} style={{ "--ar": frames[i]?.ar, "--h": frames[i]?.h } as CSSProperties}>
              <div className="box">
                <Photo src={s.photos.main} alt={s.photos.alt} focus={s.photos.focus} parallax={false} />
              </div>
              <figcaption>
                <div className="cap"><i>{String(i + 1).padStart(2, "0")}</i><b>{s.name}</b><span>{s.guests}</span></div>
                <p className="sub">{s.line}</p>
                <a className="more" href="#">Consultar disponibilidade</a>
              </figcaption>
            </figure>
          ))}
          <div className="pb-end"><a href="#">Ver todas →</a></div>
        </HScroll>
      </section>

      <figure className="pb-full">
        <Photo src={PH("grupos-vista")} alt="Vista do sítio a partir da varanda do Chalé para Grupos, ao entardecer" focus="50% 55%" />
        <figcaption>
          <p>{brand.manifesto}</p>
          <small>{brand.name}</small>
        </figcaption>
      </figure>

      <section className="pb-sec pb-about" aria-labelledby="pb-about-t">
        <div className="lab"><p className="pb-cap">O Sítio</p></div>
        <div className="col">
          <Reveal as="h2" className="pb-title"><span id="pb-about-t">{brand.siteTitle}</span></Reveal>
          <Reveal as="p" className="body" delay={100}>{brand.siteText}</Reveal>
        </div>
        <div className="pb-about-ph">
          <Photo className="a" src={PH("agata-deck")} alt="Deck do chalé Ágata sobre o campo" focus="50% 55%" />
          <Photo className="b" src={PH("celeiro-fogo")} alt="Cadeiras e fogueira de chão no campo do Celeiro" focus="50% 55%" />
        </div>
      </section>

      <section className="pb-sec pb-exp" aria-labelledby="pb-exp-t">
        <div className="in">
          <div className="head">
            <p className="pb-cap">Experiências</p>
            <h2 className="pb-title" id="pb-exp-t" style={{ marginTop: 14 }}>Além da <em>hospedagem</em></h2>
          </div>
          <ul>
            {experiences.map((e) => (
              <li key={e.name}><b>{e.name}</b><span>{e.text}</span></li>
            ))}
          </ul>
          <div className="pb-exp-ph">
            <Photo className="a" src={PH("exp-cavalo")} alt="Casal a cavalo com o vale ao fundo" focus="50% 45%" />
            <Photo className="b" src={PH("exp-balanco")} alt="Balanços sobre o morro, com o vale ao fundo" focus="30% 50%" />
          </div>
        </div>
      </section>

      <section className="pb-rev" aria-label="Avaliação de hóspede">
        <p>“{review.quote}”</p>
        <small className="pb-cap">{review.author} · {review.source} · {review.when} · {review.rating}</small>
      </section>

      <Ridge />

      <section className="pb-cta">
        <h2 className="pb-title">Pronto para <em>desacelerar?</em></h2>
        <p>{brand.cta}</p>
        <div className="links"><a href="#">Reservar</a><a href="#">Falar pelo WhatsApp</a></div>
      </section>

      <footer className="pb-foot">
        <div className="word">Sítio <i>Recanto Azul</i></div>
        <div className="cols">
          <div><h4>{brand.place}</h4><p>{brand.tagline}</p></div>
          <div><h4>Navegue</h4><ul>{nav.map((n) => <li key={n}><a href="#">{n}</a></li>)}</ul></div>
          <div><h4>Contato</h4><ul><li>{brand.email}</li><li>Instagram</li><li>WhatsApp</li></ul></div>
          <div><h4>Informações</h4><ul><li>FAQ</li><li>Políticas</li></ul></div>
        </div>
        <p>© 2026 {brand.name}. Todos os direitos reservados.</p>
      </footer>

      <Chrome v="b" fonts={fonts} clean={clean} />
    </div>
  );
}
