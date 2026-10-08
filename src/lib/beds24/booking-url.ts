import type { Stay } from "./search";

const BOOKING_PAGE = "https://beds24.com/booking2.php";
const DEFAULT_REFERER = "site-v2";

export function bookingUrl(opts: { propId: number; roomId: number; referer?: string; stay?: Stay }): string {
  const params = new URLSearchParams();
  params.set("propid", String(opts.propId));
  params.set("roomid", String(opts.roomId));
  if (opts.stay) {
    params.set("checkin", opts.stay.checkin);
    params.set("numnight", String(opts.stay.nights));
    params.set("numadult", String(opts.stay.adults));
    params.set("numchild", String(opts.stay.children));
    params.set(`br1-${opts.roomId}`, "Book");
  }
  params.set("referer", opts.referer ?? DEFAULT_REFERER);
  return `${BOOKING_PAGE}?${params.toString()}`;
}

/** Motor de reservas da propriedade (sem quarto nem datas). Só um link: o site nunca cria reserva. */
export function propertyBookingUrl(opts: { propId: number; referer?: string }): string {
  const params = new URLSearchParams();
  params.set("propid", String(opts.propId));
  params.set("referer", opts.referer ?? DEFAULT_REFERER);
  return `${BOOKING_PAGE}?${params.toString()}`;
}
