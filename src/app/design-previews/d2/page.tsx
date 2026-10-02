import Link from "next/link";
import { brand, stays, experiences, review, stayHref, romanticExtras, waContacts, siteLinks, MAPS_URL, MAPS_EMBED, PH } from "../content";
import { MapFacade } from "./map";
import { WhatsApp } from "./whatsapp";
import { Footer, Header, d2Fonts } from "./parts";
import { Photo, Reveal, Ridge } from "../fx";
import { HeroSearch } from "./hero-search";
import { Panels, type PanelItem } from "../panels2";

type SP = Promise<{ fonts?: string; clean?: string }>;

// Enquadramento de cada foto no formato 16:10 da lista mobile.
const mFocus: Record<string, string> = {
  "domo-estelar": "50% 38%",
  agata: "50% 42%",
  mirante: "50% 52%",
  "doce-recanto": "50% 52%",
  celeiro: "50% 58%",
  "chale-para-grupos": "50% 55%",
};

// O Domo usa a foto interna nos painéis (o hero já usa a externa).
const override: Record<string, Partial<PanelItem>> = {
  "domo-estelar": {
    src: PH("domo-estrelas"),
    alt: "Hóspede deitada sob o teto transparente do Domo Estelar, olhando o céu à noite",
    focus: "50% 40%",
  },
};

export default async function PreviewD2({ searchParams }: { searchParams: SP }) {
  const { fonts, clean } = await searchParams;
  const f = d2Fonts(fonts);
  const items: PanelItem[] = stays.map((s) => ({
    slug: s.slug,
    name: s.name,
    line: s.line,
    guests: s.guests,
    src: s.photos.main,
    alt: s.photos.alt,
    focus: s.photos.focus,
    href: stayHref(s.slug),
    ...override[s.slug],
  }));

  return (
    <div className={f.className} style={f.style}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      {f.hrefs.map((h) => <link key={h} rel="stylesheet" href={h} />)}

      <section className="pd2-hero">
        <Photo src={PH("domo-cover")} alt="Domo Estelar ao entardecer, sobre o deck" focus="70% 88%" zoom priority parallax={false} />
        <Header />
        <div className="pd2-hero-body">
          <h1>Um recanto para desacelerar</h1>
          <p className="lede">{brand.tagline}.</p>
        </div>
        <HeroSearch />
      </section>

      <div className="pd2-light">
        <section className="pd2-intro">
          <div className="pd2-intro-copy">
            <Reveal as="h2">{brand.introTitle}</Reveal>
            <Reveal as="p" className="body" delay={150}>
              O Sítio Recanto Azul reúne acomodações pensadas para casais e grupos que buscam uma pausa real.
            </Reveal>
          </div>
          <div className="pd2-intro-ph">
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
        <div className="pd2-rule"><Ridge /></div>
      </div>

      <section className="pd2-stays" aria-labelledby="pd-stays-t">
        <div className="pd2-stays-head"><h2 id="pd-stays-t">Acomodações</h2></div>
        <div className="pd2-panels-wrap">
          <div className="pd2-group">
            <div className="pd2-group-head"><h3>Românticas</h3></div>
            <Panels items={items.slice(0, 4)} />
          </div>
          <div className="pd2-group">
            <div className="pd2-group-head"><h3>Para grupos</h3></div>
            <Panels items={items.slice(4)} tall={false} />
          </div>
        </div>
        <div className="pd2-list">
          {[
            { title: "Românticas", rows: items.slice(0, 4) },
            { title: "Para grupos", rows: items.slice(4) },
          ].map((g) => (
            <div key={g.title} className="pd2-list-group">
              <p className="pd2-divider"><span>{g.title}</span></p>
              <ul>
                {g.rows.map((it) => (
                  <li key={it.slug} className="pd2-row">
                    <a href={it.href}>
                      <div className="ph">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={it.src} alt="" loading="lazy" decoding="async" style={{ objectPosition: mFocus[it.slug] }} />
                      </div>
                      <div className="cap">
                        <h3>{it.name}</h3>
                        <p className="line">{it.line}</p>
                        <span className="g">{it.guests}</span>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <div className="pd2-light">
        <section className="pd2-occ" aria-labelledby="occ-t">
          <h2 id="occ-t">Extras e casamentos</h2>
          <div className="tiles">
            <a href={siteLinks.extras} className="tile">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={romanticExtras[0]?.image} alt="Cama com decoração de pétalas, balão em formato de coração e flores" loading="lazy" decoding="async" />
              <h3>Extras</h3>
              <p>Decorações, pedidos de casamento e café da manhã.</p>
            </a>
            <a href={siteLinks.casamentos} className="tile">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={PH("celeiro-pergola")} alt="Pergolado de vidro do Celeiro ao entardecer" loading="lazy" decoding="async" style={{ objectPosition: "50% 60%" }} />
              <h3>Casamentos no sítio</h3>
              <p>Fale com a gente sobre o seu casamento.</p>
            </a>
          </div>
        </section>
      </div>

      <figure className="pd2-break">
        <Photo src={PH("grupos-vista")} alt="Vista do sítio a partir da varanda do Chalé para Grupos, ao entardecer" focus="50% 55%" />
        <figcaption>Vista a partir do Chalé para Grupos</figcaption>
      </figure>

      <div className="pd2-light">
        <section className="pd2-exp" aria-labelledby="pd2-exp-t">
          <div className="pd2-exp-text">
            <h2 id="pd2-exp-t">Experiências</h2>
            <p className="lead">Viva o Recanto Azul além da hospedagem.</p>
            <ul>
              {experiences.map((e) => (
                <li key={e.name}><b>{e.name}</b><span>{e.text}</span></li>
              ))}
            </ul>
            <a className="pd2-link more" href={siteLinks.experiencias}>Ver todas as experiências</a>
          </div>
          <div className="pd2-exp-col">
            <Photo className="a" src={PH("exp-cavalo")} alt="Casal a cavalo com o vale ao fundo" focus="50% 45%" />
            <Photo className="b" src={PH("exp-cavalo-por-do-sol")} alt="Cavalos ao pôr do sol no campo" focus="50% 55%" />
            <Photo className="c" src={PH("exp-balanco")} alt="Balanços sobre o morro, com o vale ao fundo" focus="0% 40%" />
          </div>
        </section>
      </div>

      <section id="localizacao" className="pd2-loc" aria-labelledby="loc-t">
        <div className="txt">
          <h2 id="loc-t">Localização</h2>
          <p>{brand.place}</p>
          <p className="mut">O endereço completo e o trajeto estão no Google Maps.</p>
          <a className="pd2-link" href={MAPS_URL} target="_blank" rel="noopener noreferrer">Abrir no Google Maps<span className="sr"> (nova aba)</span></a>
        </div>
        <MapFacade embed={MAPS_EMBED} mapsUrl={MAPS_URL} />
      </section>

      <section className="pd2-voice" aria-label="Avaliação de hóspede">
        <div>
          <q>{review.quote}</q>
          <p>{review.author}, {review.source}, setembro de 2025</p>
        </div>
      </section>

      <section className="pd2-cta">
        <Photo src={PH("domo-aerial")} alt="Domo Estelar sobre o deck, visto do alto, com a mata ao fundo" focus="50% 45%" />
        <div className="pd2-cta-in">
          <h2>Escolha sua acomodação</h2>
          <div className="links">
            <a className="pd2-link" href="#">Reservar</a>
            <WhatsApp groups={waContacts} label="Falar pelo WhatsApp" />
          </div>
        </div>
      </section>

      <Footer />
      <WhatsApp groups={waContacts} variant="float" />

      {clean ? null : (
        <div className="pv-chrome" role="navigation" aria-label="Controles do preview">
          <span>D2</span>
          <Link href="/design-previews/d2" aria-current={f.mode === "auto"}>Auto</Link>
          <Link href="/design-previews/d2?fonts=1" aria-current={f.mode === "1"}>Par 1</Link>
          <Link href="/design-previews/d2?fonts=2" aria-current={f.mode === "2"}>Par 2</Link>
          <Link href="/design-previews">Todas</Link>
        </div>
      )}
    </div>
  );
}
