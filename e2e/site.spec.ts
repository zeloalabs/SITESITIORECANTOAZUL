import { test, expect, type Page } from "@playwright/test";

// O site real roda sem credenciais usando o conteúdo-base (fallback). Estes testes cobrem rotas, links e fluxos.
// Sem disponibilidade ao vivo: nunca devem aparecer preço (R$) nem calendário com dados de demonstração.

// Espera a hidratação (as interações dependem de JavaScript) antes de clicar.
async function ready(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
}

const ROUTES = ["/", "/acomodacoes", "/extras", "/experiencias", "/casamentos", "/politicas", "/faq", "/contato", "/localizacao"];
const STAYS = ["domo-estelar", "agata", "mirante", "doce-recanto", "celeiro", "chale-para-grupos"];

for (const route of ROUTES) {
  test(`rota ${route} responde com um h1 e sem preço`, async ({ page }) => {
    const res = await page.goto(route);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main")).not.toContainText("R$");
  });
}

for (const slug of STAYS) {
  test(`acomodação ${slug}: reservar abre o motor Beds24 e não há calendário fake`, async ({ page }) => {
    const res = await page.goto(`/acomodacoes/${slug}`);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator(".cal-day")).toHaveCount(0);
    const reservar = page.locator("#disponibilidade").getByRole("link", { name: /Reservar/ });
    await expect(reservar).toHaveAttribute("href", /^https:\/\/beds24\.com\/booking2\.php\?propid=357738&roomid=\d+&referer=site-v2$/);
    await expect(reservar).toHaveAttribute("target", "_blank");
    await expect(reservar).toHaveAttribute("rel", /noopener/);
  });
}

test("capacidades: Celeiro até 11 e Chalé para Grupos até 20", async ({ page }) => {
  await page.goto("/acomodacoes/celeiro");
  await expect(page.locator(".cal-guests .hint")).toContainText("Máximo: 11 hóspedes");
  await page.goto("/acomodacoes/chale-para-grupos");
  await expect(page.locator(".cal-guests .hint")).toContainText("Máximo: 20 hóspedes");
});

test("seletor de hóspedes respeita o limite das românticas (2 adultos + 2 crianças)", async ({ page }) => {
  await ready(page, "/acomodacoes/agata");
  const botao = (n: string) => page.getByRole("button", { name: n });
  await botao("Mais uma criança").click({ force: true });
  await botao("Mais uma criança").click({ force: true });
  await expect(botao("Mais uma criança")).toBeDisabled();
  await expect(botao("Mais um adulto")).toBeDisabled(); // 2 adultos + 2 crianças = 4 (máximo)
});

test("abas Sobre / Comodidades funcionam por teclado", async ({ page }) => {
  await ready(page, "/acomodacoes/mirante");
  await page.getByRole("tab").first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Comodidades" })).toHaveAttribute("aria-selected", "true");
});

test("galeria abre o visualizador, navega e fecha com Esc", async ({ page }) => {
  await ready(page, "/acomodacoes/celeiro");
  await page.locator(".pd2-gal button").first().click();
  await expect(page.locator(".pd2-lb")).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".pd2-lb .lb-bar span")).toContainText("2 /");
  await page.keyboard.press("Escape");
  await expect(page.locator(".pd2-lb")).toHaveCount(0);
});

test("mapa só carrega depois do clique (nenhum iframe antes)", async ({ page }) => {
  await ready(page, "/");
  await expect(page.locator("iframe")).toHaveCount(0);
  await page.getByRole("button", { name: "Ver mapa" }).click();
  await expect(page.locator("iframe[title^='Mapa']")).toHaveCount(1);
});

test("rodapé leva às páginas principais", async ({ page }) => {
  await page.goto("/");
  const hrefs = await page.locator("footer a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  for (const h of ["/acomodacoes", "/experiencias", "/extras", "/politicas", "/faq", "/contato"]) expect(hrefs).toContain(h);
});

test("sem número cadastrado nenhum link wa.me é inventado", async ({ page }) => {
  await page.goto("/contato");
  await expect(page.locator("a[href*='wa.me']")).toHaveCount(0);
});

test("404 para acomodação e página inexistentes", async ({ page }) => {
  expect((await page.goto("/acomodacoes/nao-existe"))?.status()).toBe(404);
  expect((await page.goto("/pagina-que-nao-existe"))?.status()).toBe(404);
});

test("sitemap e robots", async ({ request }) => {
  const sm = await (await request.get("/sitemap.xml")).text();
  for (const s of STAYS) expect(sm).toContain(`/acomodacoes/${s}`);
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /api/");
});

test("prefers-reduced-motion: título do hero visível e sem zoom contínuo", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  const anim = await page.locator(".fx-zoom").first().evaluate((el) => getComputedStyle(el).animationName);
  expect(anim).toBe("none");
  await ctx.close();
});
