import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageFrame } from "@/components/site/chrome";
import { Photo } from "@/components/site/fx";
import { StayGallery } from "@/components/site/gallery";
import { StayBooking } from "@/components/site/stay-booking";
import { StayTabs } from "@/components/site/tabs";
import { WhatsApp } from "@/components/site/whatsapp";
import { photo, stayHref, waGroups } from "@/components/site/util";
import { reserveUrl } from "@/lib/booking";
import { getAccommodation, getChrome } from "@/lib/content/data";
import { galleryPhotos } from "@/lib/content/gallery";
import { pickContact, whatsappUrl } from "@/lib/whatsapp";
import { buildMetadata } from "@/lib/seo";

type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  const [{ settings }, stay] = await Promise.all([getChrome(), getAccommodation(slug)]);
  if (!stay) return {};
  return buildMetadata({
    path: stayHref(slug),
    title: stay.seoTitle || `${stay.name} — ${stay.groupName ?? "Acomodação"}`,
    description: stay.seoDescription || `${stay.tagline}. ${stay.capacityLabel}.`,
    settings,
    image: stay.cover,
  });
}

export default async function StayPage({ params }: P) {
  const { slug } = await params;
  const [stay, { settings, contacts, groups }] = await Promise.all([getAccommodation(slug), getChrome()]);
  if (!stay) notFound();

  const groupKey = groups.find((g) => g.id === stay.groupId)?.whatsappKey;
  const contact = pickContact(contacts, [stay.whatsappKey, groupKey]);
  const photos = galleryPhotos(stay, process.env.NODE_ENV !== "production");
  const others = groups.flatMap((g) => g.stays).filter((s) => s.slug !== slug);
  const tabsWa = whatsappUrl(contact, { acomodacao: stay.name, extra: "Gostaria de consultar os extras." });
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: `${settings.siteName} — ${stay.name}`,
    description: stay.tagline,
    image: stay.cover.placeholder ? undefined : stay.cover.full ?? stay.cover.src,
    address: { "@type": "PostalAddress", addressLocality: "Alfredo Wagner", addressRegion: "SC", addressCountry: "BR" },
  };

  return (
    <PageFrame direct={contact?.key} acomodacao={stay.name}>
      <main id="conteudo">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
        <section className="pd2-hero pd2-stayhero">
          <Photo {...photo(stay.cover)} zoom priority parallax={false} />
          <div className="pd2-hero-body">
            <h1>{stay.name}</h1>
            <p className="lede">{stay.tagline}.</p>
            <div className="pd2-stay-cta">
              <a className="pd2-link" href="#disponibilidade">Consultar disponibilidade</a>
              {contact ? <WhatsApp groups={waGroups(contacts, { acomodacao: stay.name })} label="Falar pelo WhatsApp" direct={contact.key} /> : null}
            </div>
          </div>
        </section>

        <div className="pd2-light">
          <section className="pd2-stay-intro" aria-label={`Sobre ${stay.name}`}>
            <p className="lead">{stay.tagline}.</p>
            <div className="copy">
              <StayTabs
                about={stay.detail.map((t, i) => <p key={i}>{t}</p>)}
                capacity={stay.capacityLabel}
                amenities={stay.amenities}
                extras={stay.extras.map((x) => ({ name: x.name, description: x.description ?? undefined, image: x.image.src, srcSet: x.image.srcSet, alt: x.image.alt }))}
                whatsappHref={tabsWa ?? undefined}
              />
            </div>
          </section>
          {photos.length ? (
            <section className="pd2-stay-photos" aria-labelledby="fotos-t">
              <div className="head">
                <h2 id="fotos-t">Fotos</h2>
                <p>{photos.length} fotos</p>
              </div>
              <StayGallery name={stay.name} photos={photos} initial={settings.galleryInitial} />
            </section>
          ) : null}
        </div>

        <section id="disponibilidade" className="pd2-avail" aria-labelledby="disp-t">
          <div className="pd2-avail-head">
            <h2 id="disp-t">Disponibilidade</h2>
            <p>Informe os hóspedes e consulte as datas.</p>
          </div>
          <div className="pd2-avail-cal">
            <StayBooking slug={slug} name={stay.name} rules={stay.guests} contact={contact ? { number: contact.number, message: contact.message } : null} reserveHref={reserveUrl(settings, stay.beds24RoomId)} />
          </div>
        </section>

        <div className="pd2-light">
          <section className="pd2-others" aria-label="Outras acomodações">
            <h2>Outras acomodações</h2>
            <ul>
              {others.map((s) => (
                <li key={s.slug}>
                  <a href={stayHref(s.slug)}><b>{s.name}</b><span>{s.capacityLabel}</span></a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </PageFrame>
  );
}
