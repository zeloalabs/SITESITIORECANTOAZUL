import { describe, expect, it } from "vitest";
import { sitemapPaths } from "./sitemap";

describe("sitemapPaths", () => {
  it("inclui Home, páginas e acomodações sem repetir nem listar /home", () => {
    const out = sitemapPaths({ pageSlugs: ["home", "extras", "acomodacoes", "faq"], stayPaths: ["/acomodacoes/agata"] });
    expect(out).toEqual(["/", "/acomodacoes", "/extras", "/faq", "/acomodacoes/agata"]);
  });
});
