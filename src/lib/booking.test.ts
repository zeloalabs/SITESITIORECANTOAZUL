// @vitest-environment node
import { describe, expect, it } from "vitest";
import { reserveUrl } from "./booking";

const s = { beds24PropertyId: 357738, beds24Referer: "site-v2", bookingUrlOverride: null };

describe("reserveUrl", () => {
  it("abre o motor da propriedade sem quarto", () => {
    expect(reserveUrl(s)).toBe("https://beds24.com/booking2.php?propid=357738&referer=site-v2");
  });
  it("abre o quarto quando há roomId, sem datas nem preço", () => {
    const url = reserveUrl(s, 737429)!;
    expect(url).toContain("roomid=737429");
    expect(url).not.toContain("checkin");
  });
  it("usa o link alternativo do CMS na reserva geral", () => {
    expect(reserveUrl({ ...s, bookingUrlOverride: "/contato" })).toBe("/contato");
  });
  it("sem propertyId nem alternativa não há link", () => {
    expect(reserveUrl({ ...s, beds24PropertyId: null })).toBeNull();
  });
});
