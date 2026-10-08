import { romanticExtras, waContacts } from "../../content";
import { Shell } from "../parts";
import { WhatsApp } from "@/components/site/whatsapp";

export default async function ExtrasPage({ searchParams }: { searchParams: Promise<{ fonts?: string }> }) {
  const { fonts } = await searchParams;
  return (
    <Shell fonts={fonts} direct="romanticas">
      <header className="pd2-pagehead">
        <h1>Extras</h1>
        <p>Para tornar a estadia ainda mais especial, nas acomodações românticas.</p>
      </header>
      <div className="pd2-light">
        <section className="pd2-extras-page" aria-label="Lista de extras">
          {romanticExtras.map((x) => (
            <article key={x.name}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={x.image} alt={x.alt} loading="lazy" decoding="async" />
              <div className="txt">
                <h2>{x.name}</h2>
                {x.description ? <p>{x.description}</p> : null}
                <WhatsApp groups={waContacts} label={`Consultar ${x.name.toLowerCase()}`} direct="romanticas" />
              </div>
            </article>
          ))}
        </section>
      </div>
    </Shell>
  );
}
