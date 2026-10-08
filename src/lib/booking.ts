import { bookingUrl, propertyBookingUrl } from "@/lib/beds24/booking-url";
import type { SiteSettings } from "@/lib/content/types";

/**
 * Link do botão "Reservar". Só abre o motor da Beds24 (nova aba); o site nunca cria reserva.
 * Com `roomId` abre a acomodação; sem propertyId cadastrado cai no link alternativo do CMS, ou `null`.
 */
export function reserveUrl(settings: Pick<SiteSettings, "beds24PropertyId" | "beds24Referer" | "bookingUrlOverride">, roomId?: number | null): string | null {
  if (settings.bookingUrlOverride && !roomId) return settings.bookingUrlOverride;
  if (!settings.beds24PropertyId) return settings.bookingUrlOverride;
  return roomId
    ? bookingUrl({ propId: settings.beds24PropertyId, roomId, referer: settings.beds24Referer })
    : propertyBookingUrl({ propId: settings.beds24PropertyId, referer: settings.beds24Referer });
}
