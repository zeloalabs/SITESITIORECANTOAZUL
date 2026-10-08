import Link from "next/link";
import type { CSSProperties } from "react";
import { brand, stays, experiences, review, nav, pairOf, PH } from "../content";
import { Photo, Reveal, Ridge } from "@/components/site/fx";
import { Panels, type PanelItem } from "../panels";

type SP = Promise<{ fonts?: string; clean?: string; stays?: string }>;

const RIDGE = "M0 16 C10 15 18 13 28 14 C38 15 44 9 55 8 C64 7 69 3 80 2 C88 1 94 5 104 7 C111 8 116 12 120 12";

function Mark() {
  return (
    <a href="#" className="pd-mark" aria-label={brand.name}>
      <svg viewBox="0 0 120 18" aria-hidden="true"><path d={RIDGE} /></svg>
      <span>Sítio Recanto Azul</span>
    </a>
  );
}

// Foto principal de cada acomodação no palco (o Domo usa a foto interna; o hero já usa a externa).
const stageOverride: Record<string, Partial<PanelItem>> = {
  "domo-estelar": {
    src: PH("domo-estrelas"),
    alt: "Hóspede deitada sob o teto transparente do Domo Estelar, olhando o céu à noite",
    focus: "50% 40%",
  },
};

export default async function PreviewD({ searchParams }: { searchParams: SP }) {
  const { fonts, clean, stays: mode } = await searchParams;
  const variant = mode === "mosaic" || mode === "groups" ? mode : "panels";
  const pair = pairOf("c", fonts);
  const style = { "--f-display": pair.display, "--f-body": pair.body } as CSSProperties;
  const items: PanelItem[] = stays.map((s) => ({
    slug: s.slug,
    name: s.name,
    line: s.line,
    guests: s.guests,
    src: s.photos.main,
    alt: s.photos.alt,
    focus: s.photos.focus,
    ...stageOverride[s.slug],
  }));
  const cur = fonts === "2" ? "2" : "1";
  const q = (o: { f?: string; s?: string }) => `/design-previews/d?fonts=${o.f ?? cur}&stays=${o.s ?? variant}`;

  return (
    <div className="pd" style={style}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href={pair.href} />

      <section className="pd-hero">
        <Photo src={PH("domo-cover")} alt="Domo Estelar ao entardecer, sobre o deck" focus="70% 88%" zoom priority parallax={false} />
        <header className="pd-head">
          <Mark />
          <nav aria-label="Principal">{nav.slice(0, 4).map((n) => <a key={n} href="#">{n}</a>)}</nav>
          <a className="pd-link" href="#">Reservar</a>
        </header>
        <p className="pd-cap pd-rail">Domo Estelar · {brand.place}</p>
        <div className="pd-hero-body">
          <h1>Um recanto <em>para desacelerar</em></h1>
          <p className="lede">{brand.tagline}.</p>
        </div>
        <form className="pd-find" aria-label="Busca de datas (demonstração)">
          <div><small>Chegada</small><span>Selecione</span></div>
          <div><small>Partida</small><span>Selecione</span></div>
          <div><small>Hóspedes</small><span>2 adultos</span></div>
          <button type="button" className="pd-link" aria-disabled="true">Consultar datas</button>
        </form>
      </section>

      <section className="pd-intro">
        <div className="pd-intro-copy">
          <p className="pd-cap">O Sítio</p>
          <Reveal as="h2">{brand.introTitle}</Reveal>
          <Reveal as="p" className="body" delay={100}>
            O Sítio Recanto Azul reúne acomodações pensadas para casais e grupos que buscam uma pausa real.
          </Reveal>
        </div>
        <div className="pd-intro-ph">
          <figure>
            <Photo src={PH("mirante-aerea")} alt="Chalé Mirante visto do alto, com mata e montanhas ao fundo" />
            <figcaption>Chalé Mirante</figcaption>
          </figure>
          <figure>
            <Photo src={PH("exp-araucaria")} alt="Passeio a cavalo entre campo e araucária" />
            <figcaption>Passeio a cavalo</figcaption>
          </figure>
        </div>
      </section>

      <div className="pd-rule"><Ridge /></div>

      <section className="pd-stays" aria-labelledby="pd-stays-t">
        <div className="pd-stays-head">
          <h2 id="pd-stays-t">Acomodações</h2>
          <p className="pd-cap">Seis espaços</p>
        </div>
        {variant === "panels" ? <Panels items={items} /> : null}
        {variant === "groups" ? (
          <>
            <div className="pd-group">
              <div className="pd-group-head"><p className="pd-cap">Para casais</p><h3>Românticas</h3></div>
              <Panels items={items.slice(0, 4)} />
            </div>
            <div className="pd-group">
              <div className="pd-group-head"><p className="pd-cap">Para grupos</p><h3>Celeiro e Chalé</h3></div>
              <Panels items={items.slice(4)} className="two" />
            </div>
          </>
        ) : null}
        {variant === "mosaic" ? (
          <div className="pd-mosaic">
            {items.map((it) => (
              <a key={it.slug} href="#" className="pd-tile">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.src} alt={it.alt} loading="lazy" decoding="async" style={{ objectPosition: it.focus }} />
                <figcaption>
                  <b>{it.name}</b>
                  <span>{it.guests}</span>
                  <em>Consultar disponibilidade →</em>
                </figcaption>
              </a>
            ))}
          </div>
        ) : null}
      </section>

      <figure className="pd-break">
        <Photo src={PH("grupos-vista")} alt="Vista do sítio a partir da varanda do Chalé para Grupos, ao entardecer" focus="50% 55%" />
        <figcaption>Vista a partir do Chalé para Grupos</figcaption>
      </figure>

      <div className="pd-light">
        <section className="pa-exp" aria-labelledby="pd-exp-t">
          <div className="pa-exp-text">
            <p className="pa-eyebrow">Experiências</p>
            <h2 id="pd-exp-t">Viva o Recanto Azul <em>além da hospedagem</em></h2>
            <ol>
              {experiences.map((e) => (
                <li key={e.name}><b>{e.name}</b><span>{e.text}</span></li>
              ))}
            </ol>
          </div>
          <div className="pa-exp-col">
            <Photo className="a" src={PH("exp-cavalo")} alt="Casal a cavalo com o vale ao fundo" focus="50% 45%" />
            <Photo className="b" src={PH("exp-cavalo-por-do-sol")} alt="Cavalos ao pôr do sol no campo" focus="50% 55%" />
            <Photo className="c" src={PH("exp-balanco")} alt="Balanços sobre o morro, com o vale ao fundo" focus="30% 55%" />
          </div>
        </section>
      </div>

      <section className="pd-voice" aria-label="Avaliação de hóspede">
        <p className="pd-cap">Quem já ficou</p>
        <div>
          <p className="q">“{review.quote}”</p>
          <p className="pd-cap" style={{ marginTop: 16 }}>{review.author} · {review.source} · {review.when}</p>
        </div>
      </section>

      <section className="pd-cta">
        <Photo src={PH("domo-aerial")} alt="Domo Estelar sobre o deck, visto do alto, com a mata ao fundo" focus="50% 45%" />
        <div className="pd-cta-in">
          <h2>Escolha sua <em>acomodação</em></h2>
          <div className="links">
            <a className="pd-link" href="#">Reservar</a>
            <a className="pd-link" href="#">Falar pelo WhatsApp</a>
          </div>
        </div>
      </section>

      <footer className="pd-foot">
        <div><Mark /><p style={{ marginTop: 14 }}>{brand.place}</p></div>
        <div><h4>Navegue</h4><ul>{nav.map((n) => <li key={n}><a href="#">{n}</a></li>)}</ul></div>
        <div><h4>Contato</h4><ul><li>{brand.email}</li><li>Instagram</li><li>WhatsApp</li></ul></div>
        <div><h4>Informações</h4><ul><li>FAQ</li><li>Políticas</li></ul><p style={{ marginTop: 18 }}>© 2026 {brand.name}.</p></div>
      </footer>

      {clean ? null : (
        <div className="pv-chrome" role="navigation" aria-label="Controles do preview">
          <span>D · {pair.label}</span>
          <Link href={q({ s: "panels" })} aria-current={variant === "panels"}>Painéis</Link>
          <Link href={q({ s: "groups" })} aria-current={variant === "groups"}>Painéis em 2 grupos</Link>
          <Link href={q({ s: "mosaic" })} aria-current={variant === "mosaic"}>Mosaico</Link>
          <Link href={q({ f: "1" })} aria-current={cur === "1"}>Par 1</Link>
          <Link href={q({ f: "2" })} aria-current={cur === "2"}>Par 2</Link>
          <Link href="/design-previews">Todas</Link>
        </div>
      )}
    </div>
  );
}
