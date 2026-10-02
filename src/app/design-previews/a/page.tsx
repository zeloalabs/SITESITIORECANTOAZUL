import type { CSSProperties } from "react";
import { brand, stays, experiences, review, nav, pairOf, PH } from "../content";
import { Chrome } from "../chrome";
import { Photo, Reveal, Ridge, WordReveal } from "../fx";

type SP = Promise<{ fonts?: string; clean?: string }>;

export default async function PreviewA({ searchParams }: { searchParams: SP }) {
  const { fonts, clean } = await searchParams;
  const pair = pairOf("a", fonts);
  const style = { "--f-display": pair.display, "--f-body": pair.body } as CSSProperties;
  const landscape = new Set(["celeiro", "chale-para-grupos"]);

  return (
    <div className="pa" style={style}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href={pair.href} />

      <header className="pa-head">
        <button className="pa-menu" type="button">Menu</button>
        <nav aria-label="Principal">
          {nav.slice(0, 3).map((n) => (
            <a key={n} href="#">{n}</a>
          ))}
        </nav>
        <a href="#" aria-label={brand.name}>
          <span className="pv-logo" role="img" aria-label={brand.name} />
        </a>
        <div className="pa-head-r">
          <a className="pa-btn ghost" href="#">WhatsApp</a>
          <a className="pa-btn" href="#">Reservar</a>
        </div>
      </header>

      <section className="pa-hero">
        <figure className="pa-hero-main">
          <Photo src={PH("domo-cover")} alt="Domo Estelar ao entardecer, sobre o deck" focus="72% 100%" zoom priority parallax={false} />
          <figcaption className="pa-hero-cap">Domo Estelar</figcaption>
        </figure>
        <figure className="pa-hero-inset" aria-hidden="true">
          <Photo src={PH("agata-exterior")} alt="" focus="50% 45%" />
        </figure>
        <div className="pa-hero-text">
          <p className="pa-eyebrow">{brand.place}</p>
          <h1>
            Um recanto <em>para desacelerar</em>
          </h1>
          <p className="pa-lede">{brand.tagline}.</p>
          <form className="pa-search" aria-label="Busca de datas (demonstração)">
            <div><small>Chegada</small><span>Selecione</span></div>
            <div><small>Partida</small><span>Selecione</span></div>
            <div><small>Hóspedes</small><span>2 adultos</span></div>
            <button type="button" aria-disabled="true">Consultar datas</button>
          </form>
          <p className="pa-search-note">Busca por datas entra na próxima fase.</p>
        </div>
      </section>

      <div className="pa-rule"><Ridge /></div>

      <section className="pa-intro">
        <div className="pa-intro-label"><p className="pa-eyebrow">O Sítio</p></div>
        <div className="pa-intro-copy">
          <Reveal as="h2">
            Natureza, privacidade e <em>tempo para o que importa</em>
          </Reveal>
          <Reveal as="p" className="body" delay={120}>{brand.intro}</Reveal>
        </div>
        <div className="pa-intro-photos">
          <Photo src={PH("mirante-aerea")} alt="Chalé Mirante visto do alto, com mata e montanhas ao fundo" focus="50% 50%" />
          <Photo src={PH("exp-araucaria")} alt="Passeio a cavalo entre campo e araucária" focus="50% 50%" />
        </div>
      </section>

      <section className="pa-stays" aria-labelledby="pa-stays-t">
        <div className="pa-stays-head">
          <h2 id="pa-stays-t">
            Seis <em>refúgios</em>
          </h2>
          <p>Cada espaço, uma forma diferente de desacelerar.</p>
        </div>
        <ul className="pa-grid">
          {stays.map((s, i) => (
            <Reveal key={s.slug} as="li" className={`pa-stay ${landscape.has(s.slug) ? "land" : ""}`}>
              <div className="ph">
                <Photo src={s.photos.main} alt={s.photos.alt} focus={s.photos.focus} />
              </div>
              <div className="meta">
                <span className="n">{String(i + 1).padStart(2, "0")}</span>
                <h3>{s.name}</h3>
                <p className="line">{s.line}</p>
                <p className="foot">
                  <span>{s.guests}</span>
                  <b>Consultar disponibilidade</b>
                </p>
              </div>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="pa-manifest">
        <div className="pa-manifest-in">
          <span className="pa-eyebrow">O Recanto Azul</span>
          <WordReveal text={brand.manifesto} />
        </div>
      </section>

      <section className="pa-exp" aria-labelledby="pa-exp-t">
        <div className="pa-exp-text">
          <p className="pa-eyebrow">Experiências</p>
          <h2 id="pa-exp-t">
            Viva o Recanto Azul <em>além da hospedagem</em>
          </h2>
          <ol>
            {experiences.map((e) => (
              <li key={e.name}>
                <b>{e.name}</b>
                <span>{e.text}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="pa-exp-col">
          <Photo className="a" src={PH("exp-cavalo")} alt="Casal a cavalo com o vale ao fundo" focus="50% 45%" />
          <Photo className="b" src={PH("exp-cavalo-por-do-sol")} alt="Cavalos ao pôr do sol no campo" focus="50% 55%" />
          <Photo className="c" src={PH("domo-deck")} alt="Mirante de madeira sobre o campo, com montanhas ao fundo" focus="50% 40%" />
        </div>
      </section>

      <section className="pa-quote" aria-label="Avaliação de hóspede">
        <p className="pa-eyebrow">Quem já ficou</p>
        <blockquote>“{review.quote}”</blockquote>
        <cite>{review.author} · {review.source} · {review.when} · {review.rating}</cite>
      </section>

      <section className="pa-cta">
        <div className="pa-cta-in">
          <h2>Pronto para <em>desacelerar?</em></h2>
          <p className="sub">{brand.cta}</p>
          <div className="btns">
            <a className="pa-btn" href="#">Reservar</a>
            <a className="pa-btn ghost" href="#">Falar pelo WhatsApp</a>
          </div>
          <Ridge />
          <footer className="pa-foot">
            <div className="mark">{brand.name}<small>{brand.place}</small></div>
            <div><h4>Navegue</h4><ul>{nav.map((n) => <li key={n}><a href="#">{n}</a></li>)}</ul></div>
            <div><h4>Contato</h4><ul><li>{brand.email}</li><li>Instagram</li><li>WhatsApp</li></ul></div>
            <div><h4>Informações</h4><ul><li>FAQ</li><li>Políticas</li></ul></div>
          </footer>
          <p className="pa-copy">© 2026 {brand.name}. Todos os direitos reservados.</p>
        </div>
      </section>

      <Chrome v="a" fonts={fonts} clean={clean} />
    </div>
  );
}
