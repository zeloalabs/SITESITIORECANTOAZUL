import Link from "next/link";
import { notFound } from "next/navigation";
import { stays, stayGalleries, stayHref, stayAmenities, stayExtras, stayGuestRules, groups, groupOf, PH } from "../../../content";
import { Photo } from "../../../fx";
import { Footer, Header, d2Fonts } from "../../parts";
import { AvailabilityCalendar } from "../../calendar";
import { StayGallery, type GalleryPhoto } from "../../gallery";
import { StayTabs } from "../../tabs";
import { WhatsApp } from "../../whatsapp";
import stayPhotos from "../../../stay-photos.json";

type P = Promise<{ slug: string }>;
type SP = Promise<{ fonts?: string; clean?: string }>;

export function generateStaticParams() {
  return stays.map((s) => ({ slug: s.slug }));
}

export default async function StayPage({ params, searchParams }: { params: P; searchParams: SP }) {
  const { slug } = await params;
  const { fonts, clean } = await searchParams;
  const stay = stays.find((s) => s.slug === slug);
  const g = stayGalleries[slug];
  if (!stay || !g) notFound();
  const f = d2Fonts(fonts);
  const grp = groupOf(slug);
  const others = stays.filter((s) => s.slug !== slug);
  const photos = (stayPhotos as Record<string, GalleryPhoto[]>)[slug] ?? [];
  const alt = (n: number) => `${stay.name}, foto ${n}`;

  return (
    <div className={f.className} style={f.style}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      {f.hrefs.map((h) => <link key={h} rel="stylesheet" href={h} />)}

      <section className="pd2-hero pd2-stayhero">
        <Photo src={PH(g.hero)} alt={alt(1)} focus={g.focus} zoom priority parallax={false} />
        <Header />
        <div className="pd2-hero-body">
          <h1>{stay.name}</h1>
          <p className="lede">{stay.line}.</p>
          <div className="pd2-stay-cta">
            <a className="pd2-link" href="#disponibilidade">Consultar disponibilidade</a>
            <WhatsApp groups={groups} label="Falar pelo WhatsApp" direct={grp?.id} />
          </div>
        </div>
      </section>

      <div className="pd2-light">
        <section className="pd2-stay-intro" aria-label={`Sobre ${stay.name}`}>
          <p className="lead">{stay.line}.</p>
          <div className="copy">
            <StayTabs about={stay.detail} capacity={stay.guests} amenities={stayAmenities[slug] ?? []} extras={stayExtras[slug] ?? []} whatsappHref={`#whatsapp-${grp?.id}`} />
          </div>
        </section>
        <section className="pd2-stay-photos" aria-labelledby="fotos-t">
          <div className="head">
            <h2 id="fotos-t">Fotos</h2>
            <p>{photos.length} fotos</p>
          </div>
          <StayGallery name={stay.name} photos={photos} />
        </section>
      </div>

      <section id="disponibilidade" className="pd2-avail" aria-labelledby="disp-t">
        <div className="pd2-avail-head">
          <h2 id="disp-t">Disponibilidade</h2>
          <p>Escolha a chegada e a saída.</p>
        </div>
        <div className="pd2-avail-cal">
          <AvailabilityCalendar slug={slug} name={stay.name} rules={stayGuestRules[slug] ?? { minAdults: 1, maxTotal: 2, hint: "" }} />
        </div>
      </section>

      <div className="pd2-light">
        <section className="pd2-others" aria-label="Outras acomodações">
          <h2>Outras acomodações</h2>
          <ul>
            {others.map((s) => (
              <li key={s.slug}>
                <Link href={stayHref(s.slug)}><b>{s.name}</b><span>{s.guests}</span></Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <Footer />
      <WhatsApp groups={groups} variant="float" direct={grp?.id} />

      {clean ? null : (
        <div className="pv-chrome" role="navigation" aria-label="Controles do preview">
          <span>D2 · {stay.name}</span>
          {stays.map((s) => <Link key={s.slug} href={stayHref(s.slug)} aria-current={s.slug === slug}>{s.name.split(" ")[0]}</Link>)}
          <Link href="/design-previews/d2">Home</Link>
        </div>
      )}
    </div>
  );
}
