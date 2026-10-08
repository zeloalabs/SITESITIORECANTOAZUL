"use client";

// Seção "Reserve sua estadia" da página de acomodação (id interno `disponibilidade`).
// Hoje (sem disponibilidade ao vivo): hóspedes + "Falar no WhatsApp" (com a seleção) + "Reservar" (motor Beds24).
// Fase 3: passar `availability` (dados reais, vindos de uma rota do servidor) liga o calendário sem mudar o resto da página.
import { AvailabilityCalendar } from "./calendar";
import { GuestControls, useGuests, type GuestRules } from "./guests";
import { whatsappUrl } from "@/lib/whatsapp";

export type Availability = {
  /** `day` = índice UTC em dias desde 1970. */
  isUnavailable: (day: number) => boolean;
  /** Link do motor da Beds24 já com as datas (montado no servidor/Fase 3). */
  bookingHref: (sel: { checkin: string; nights: number; adults: number; children: number }) => string;
};

type Props = {
  slug: string;
  name: string;
  rules: GuestRules;
  contact: { number: string | null; message: string } | null;
  reserveHref: string | null;
  availability?: Availability;
};

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function StayBooking({ slug, name, rules, contact, reserveHref, availability }: Props) {
  if (availability) {
    return <AvailabilityCalendar slug={slug} name={name} rules={rules} isUnavailable={availability.isUnavailable} bookingHref={availability.bookingHref} />;
  }
  return <GuestsAndContact name={name} rules={rules} contact={contact} reserveHref={reserveHref} />;
}

function GuestsAndContact({ name, rules, contact, reserveHref }: Omit<Props, "slug" | "availability">) {
  const guests = useGuests(rules);
  const text = `${plural(guests.adults, "adulto", "adultos")}${guests.children ? `, ${plural(guests.children, "criança", "crianças")}` : ""}`;
  const wa = whatsappUrl(contact, { acomodacao: name, extra: `Somos ${text}. Gostaria de combinar as datas.` });
  return (
    <div className="cal cal-soon">
      <GuestControls guests={guests} hint={rules.hint} />
      <div className="cal-bar">
        <p role="status" aria-live="polite">Para {text} em {name}: reserve no motor de reservas ou combine as datas pelo WhatsApp.</p>
        {wa ? <a className="pd2-link strong" href={wa} target="_blank" rel="noopener noreferrer">Combinar datas no WhatsApp<span className="sr"> (nova aba)</span></a> : null}
        {reserveHref ? <a className="pd2-link" href={reserveHref} target="_blank" rel="noopener noreferrer">Reservar<span className="sr"> — {name} (abre o motor de reservas em nova aba)</span></a> : null}
        {!wa && !reserveHref ? <p>Em breve você poderá reservar por aqui.</p> : null}
      </div>
    </div>
  );
}
