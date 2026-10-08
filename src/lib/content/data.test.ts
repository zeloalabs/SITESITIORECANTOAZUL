// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./client", () => ({ sanityFetch: vi.fn() }));

import { createContent, seedFetcher, type Fetcher } from "./data";

const down: Fetcher = async () => null;
const content = createContent(down, seedFetcher);

afterEach(() => vi.unstubAllEnvs());

describe("conteúdo-base (fallback) avaliado com a mesma GROQ", () => {
  it("monta cabeçalho/rodapé sem Sanity: configurações, 2 grupos, 6 acomodações", async () => {
    const chrome = await content.chrome();
    expect(chrome.settings.siteName).toBe("Sítio Recanto Azul");
    expect(chrome.settings.beds24PropertyId).toBe(357738);
    expect(chrome.groups.map((g) => g.name)).toEqual(["Românticas", "Para grupos"]);
    expect(chrome.groups.map((g) => g.stays.length)).toEqual([4, 2]);
    expect(chrome.groups[0]!.stays[0]!.name).toBe("Domo Estelar");
    expect(chrome.groups[0]!.stays[0]!.cover.placeholder).toBe(true);
  });

  it("contatos: Casamentos herda o número de Para grupos; sem número cadastrado fica null (sem inventar)", async () => {
    const { contacts } = await content.chrome();
    expect(contacts.map((c) => c.key)).toEqual(["romanticas", "grupos", "casamentos"]);
    expect(contacts.every((c) => c.number === null)).toBe(true);
  });

  it("capacidades corretas: românticas 2+2, Celeiro 11, Chalé para Grupos 20", async () => {
    const get = async (s: string) => (await content.accommodation(s))!.guests;
    expect(await get("agata")).toMatchObject({ maxAdults: 2, maxChildren: 2, maxTotal: 4, minAdults: 1 });
    expect(await get("domo-estelar")).toMatchObject({ maxAdults: 2, maxChildren: 2, maxTotal: 4 });
    expect((await get("celeiro")).maxTotal).toBe(11);
    expect((await get("chale-para-grupos")).maxTotal).toBe(20);
    expect((await get("chale-para-grupos")).hint).toContain("20 hóspedes");
  });

  it("roomIds da Beds24 vêm do mapeamento documentado", async () => {
    const ids = await Promise.all(["agata", "mirante", "doce-recanto", "domo-estelar", "celeiro", "chale-para-grupos"].map(async (s) => (await content.accommodation(s))!.beds24RoomId));
    expect(ids).toEqual([737422, 737427, 737430, 737429, 737433, 737435]);
  });

  it("extras só nas românticas", async () => {
    expect((await content.accommodation("mirante"))!.extras.map((e) => e.name)).toEqual(["Decorações", "Pedidos de casamento", "Café da manhã"]);
    expect((await content.accommodation("celeiro"))!.extras).toEqual([]);
  });

  it("acomodação inexistente é null", async () => {
    expect(await content.accommodation("nao-existe")).toBeNull();
  });

  it("páginas institucionais e Home vêm da seed", async () => {
    const home = await content.page("home");
    expect(home!.sections!.map((s) => s._type)).toEqual(["hero", "intro", "acomodacoes", "blocosDestaque", "fotoCheia", "experienciasBloco", "localizacao", "depoimento", "chamadaFinal"]);
    for (const slug of ["extras", "experiencias", "casamentos", "politicas", "faq", "contato", "localizacao"]) {
      expect((await content.page(slug))?.sections?.length).toBeGreaterThan(0);
    }
    expect(await content.page("nao-existe")).toBeNull();
  });

  it("listas editoriais: 5 experiências, 3 extras, 3 políticas, FAQ e depoimento aprovado", async () => {
    expect((await content.experiences()).length).toBe(5);
    expect((await content.extras()).length).toBe(3);
    expect((await content.policies()).map((p) => p.anchor)).toEqual(["privacidade", "hospedagem", "pagamento"]);
    expect((await content.faqs()).length).toBe(4);
    expect((await content.reviews())[0]!.author).toBe("Bruna");
  });

  it("política de hospedagem cita as capacidades corretas", async () => {
    const p = (await content.policies()).find((x) => x.anchor === "hospedagem")!;
    expect(p.paragraphs.join(" ")).toContain("até 20 hóspedes");
  });
});

describe("Sanity tem prioridade; fallback cobre stubs e indisponibilidade", () => {
  const migratedStay = { slug: "agata", name: "Ágata (CMS)", tagline: "Frase do CMS", capacityLabel: "x", groupId: "romanticas", groupName: "Românticas", maxGuests: 4, gallery: [{ ref: "image-abc-1200x800-jpg", alt: "Fachada" }] };

  it("usa a acomodação do Sanity quando já migrada", async () => {
    const c = createContent(async (q) => (q.includes('slug.current == $slug') && q.includes("accommodation") ? migratedStay : null));
    const stay = await c.accommodation("agata");
    expect(stay!.name).toBe("Ágata (CMS)");
    expect(stay!.gallery[0]!.img.alt).toBe("Fachada");
    expect(stay!.gallery[0]!.img.src).toContain("cdn.sanity.io");
  });

  it("stub da Fase 1 (sem frase/grupo) cai na seed, mantendo o roomId", async () => {
    const c = createContent(async () => ({ slug: "agata", name: "Ágata", beds24RoomId: 737422 }));
    const stay = await c.accommodation("agata");
    expect(stay!.tagline).toContain("Hidro com vista");
    expect(stay!.beds24RoomId).toBe(737422);
  });

  it("Home de teste da Fase 1 (sem seção acomodacoes) cai na seed", async () => {
    const c = createContent(async () => ({ _id: "page-home", title: "Home", slug: "home", sections: [{ _type: "hero", _key: "h", title: "Teste" }] }));
    const home = await c.page("home");
    expect(home!.sections!.some((s) => s._type === "acomodacoes")).toBe(true);
  });

  it("Home migrada do Sanity é usada", async () => {
    const c = createContent(async () => ({ _id: "page-home", title: "Home", slug: "home", sections: [{ _type: "acomodacoes", _key: "a", title: "Nossas casas" }] }));
    expect((await c.page("home"))!.sections![0]).toMatchObject({ _type: "acomodacoes", title: "Nossas casas" });
  });

  it("CONTENT_FALLBACK=off desliga a seed", async () => {
    vi.stubEnv("CONTENT_FALLBACK", "off");
    const c = createContent(down);
    expect(await c.page("home")).toBeNull();
    expect(await c.accommodation("agata")).toBeNull();
    expect((await c.chrome()).groups).toEqual([]);
  });
});
