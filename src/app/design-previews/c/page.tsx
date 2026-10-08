import type { CSSProperties } from "react";
import { brand, stays, experiences, review, nav, pairOf, PH } from "../content";
import { Chrome } from "../chrome";
import { CardStack, CircleReveal, Photo, WordReveal } from "@/components/site/fx";

type SP = Promise<{ fonts?: string; clean?: string }>;

export default async function PreviewC({ searchParams }: { searchParams: SP }) {
  const { fonts, clean } = await searchParams;
  const pair = pairOf("c", fonts);
  const style = { "--f-display": pair.display, "--f-body": pair.body } as CSSProperties;

  return (
    <div className="pc" style={style}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href={pair.href} />

      <section className="pc-hero">
        <Photo src={PH("domo-cover")} alt="Domo Estelar ao entardecer, sobre o deck" focus="70% 88%" zoom priority parallax={false} />
        <header className="pc-head">
          <a href="#" className="pc-mark" aria-label={brand.name}>
            Sítio Recanto Azul<small>{brand.place}</small>
          </a>
          <nav aria-label="Principal">{nav.slice(0, 4).map((n) => <a key={n} href="#">{n}</a>)}</nav>
          <a className="pc-btn" href="#">Reservar</a>
        </header>
        <div className="pc-hero-body">
          <div>
            <h1>Um recanto <em>para desacelerar</em></h1>
            <p className="lede">{brand.tagline}.</p>
          </div>
        </div>
        <form className="pc-find" aria-label="Busca de datas (demonstração)">
          <div><small>Chegada</small><span>Selecione</span></div>
          <div><small>Partida</small><span>Selecione</span></div>
          <div><small>Hóspedes</small><span>2 adultos</span></div>
          <button type="button" aria-disabled="true">Consultar datas</button>
        </form>
      </section>

      <section className="pc-manifest">
        <p className="pc-cap">O Sítio</p>
        <WordReveal text={`${brand.introTitle}.`} />
        <p className="body">{brand.intro}</p>
      </section>

      <section className="pc-circle" aria-label="Domo Estelar">
        <CircleReveal>
          <div className="fx-circle-media">
            <Photo src={PH("domo-estrelas")} alt="Hóspede deitada sob o teto transparente do Domo Estelar, olhando o céu à noite" focus="50% 45%" parallax={false} />
          </div>
          <div className="pc-circle-fade" />
          <div className="pc-circle-cap">
            <p className="pc-cap">Domo Estelar</p>
            <h2 style={{ marginTop: 14 }}>Dormir <em>sob as estrelas</em></h2>
            <p>Teto transparente, jacuzzi externa aquecida e lareira ecológica.</p>
          </div>
        </CircleReveal>
      </section>

      <section className="pc-stays" aria-labelledby="pc-stays-t">
        <div className="pc-stays-head">
          <h2 id="pc-stays-t">Seis <em>refúgios</em></h2>
          <p className="pc-cap">Cada espaço, uma forma diferente de desacelerar</p>
        </div>
        <CardStack className="pc-stack">
          {stays.map((s, i) => (
            <article className="fx-card pc-card" key={s.slug} style={{ "--i": i } as CSSProperties}>
              <div className="ph">
                <Photo src={s.photos.main} alt={s.photos.alt} focus={s.photos.focus} parallax={false} />
              </div>
              <div className="tx">
                <p className="no">{String(i + 1).padStart(2, "0")} / {String(stays.length).padStart(2, "0")} · {s.guests}</p>
                <h3>{s.name}</h3>
                <p className="line">{s.line}</p>
                <p className="det">{s.detail}</p>
                <div className="act">
                  <a className="pc-btn solid" href="#">Consultar disponibilidade</a>
                </div>
              </div>
            </article>
          ))}
        </CardStack>
      </section>

      <section className="pc-exp" aria-labelledby="pc-exp-t">
        <Photo src={PH("exp-cavalo")} alt="Casal a cavalo com o vale ao fundo" focus="50% 45%" />
        <div className="pc-exp-in">
          <p className="pc-cap">Experiências</p>
          <h2 id="pc-exp-t">Além da <em>hospedagem</em></h2>
          <ul>
            {experiences.map((e) => (
              <li key={e.name}><b>{e.name}</b><span>{e.text}</span></li>
            ))}
          </ul>
        </div>
      </section>

      <section className="pc-rev" aria-label="Avaliação de hóspede">
        <p className="pc-cap">Quem já ficou</p>
        <blockquote>“{review.quote}”</blockquote>
        <p className="pc-cap">{review.author} · {review.source} · {review.when} · {review.rating}</p>
      </section>

      <section className="pc-cta">
        <Photo src={PH("domo-aerial")} alt="Domo Estelar sobre o deck, visto do alto, com a mata ao fundo" focus="50% 45%" />
        <div className="pc-cta-in">
          <h2>Pronto para <em>desacelerar?</em></h2>
          <p className="sub">{brand.cta}</p>
          <div className="btns">
            <a className="pc-btn solid" href="#">Reservar</a>
            <a className="pc-btn" href="#">Falar pelo WhatsApp</a>
          </div>
        </div>
      </section>

      <footer className="pc-foot">
        <div className="pc-mark">Sítio Recanto Azul<small>{brand.place}</small></div>
        <div><h4>Navegue</h4><ul>{nav.map((n) => <li key={n}><a href="#">{n}</a></li>)}</ul></div>
        <div><h4>Contato</h4><ul><li>{brand.email}</li><li>Instagram</li><li>WhatsApp</li></ul></div>
        <div><h4>Informações</h4><ul><li>FAQ</li><li>Políticas</li></ul><p style={{ marginTop: 18 }}>© 2026 {brand.name}.</p></div>
      </footer>

      <Chrome v="c" fonts={fonts} clean={clean} />
    </div>
  );
}
