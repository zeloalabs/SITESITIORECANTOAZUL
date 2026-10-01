// @vitest-environment node
import { describe, it, expect } from "vitest";
import { bookingUrl } from "./booking-url";

describe("bookingUrl", () => {
  it("without a search, preselects only property and room, plus referer", () => {
    const url = new URL(bookingUrl({ propId: 111, roomId: 222, referer: "site-v2" }));
    expect(url.origin + url.pathname).toBe("https://beds24.com/booking2.php");
    expect(Object.fromEntries(url.searchParams)).toEqual({ propid: "111", roomid: "222", referer: "site-v2" });
    expect(url.searchParams.has("checkin")).toBe(false);
    expect(url.searchParams.has("numnight")).toBe(false);
    expect(url.searchParams.has("firstnight")).toBe(false);
  });

  it("with a search, prefills dates, nights, guests and selects the room offer", () => {
    const url = new URL(
      bookingUrl({
        propId: 111,
        roomId: 222,
        referer: "site-v2",
        stay: { checkin: "2026-12-10", checkout: "2026-12-12", nights: 2, adults: 2, children: 0 },
      }),
    );
    expect(Object.fromEntries(url.searchParams)).toEqual({
      propid: "111",
      roomid: "222",
      checkin: "2026-12-10",
      numnight: "2",
      numadult: "2",
      numchild: "0",
      "br1-222": "Book",
      referer: "site-v2",
    });
    expect(url.searchParams.has("firstnight")).toBe(false);
  });

  it("encodes a referer with spaces safely", () => {
    const url = new URL(bookingUrl({ propId: 1, roomId: 2, referer: "site v2" }));
    expect(url.searchParams.get("referer")).toBe("site v2");
  });

  it("defaults referer to site-v2 when not specified", () => {
    const url = new URL(bookingUrl({ propId: 111, roomId: 222 }));
    expect(url.searchParams.get("referer")).toBe("site-v2");
  });
});
