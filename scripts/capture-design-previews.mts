// Captura os previews de design (Fase 2) em 1440 e 390 px.
// Uso: node scripts/capture-design-previews.mts [saida] [a,b,c,d] [fonts] [extra] [--video]
//  - *-hero.png:    primeira dobra, com movimento ligado
//  - *-full.png:    página inteira em modo reduced-motion (layout estático, sem pinagem)
//  - *-frame-N.png: quadros-chave de efeitos com movimento ligado (rolagem real)
//  - *.webm:        rolagem contínua gravada (só com --video)
import { chromium, type Page } from "@playwright/test";
import { mkdirSync, renameSync, readdirSync } from "node:fs";

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const withVideo = process.argv.includes("--video");
const out = args[0] ?? "docs/design-previews";
const which = (args[1] ?? "a,b,c").split(",");
const fonts = args[2] ?? "1";
const extra = args[3] ? `&${args[3]}` : ""; // ex.: stays=b
const base = process.env.PREVIEW_BASE ?? "http://localhost:3000";
const sizes = [
  { tag: "desktop", width: 1440, height: 900 },
  { tag: "mobile", width: 390, height: 844 },
];

// quadros-chave: [seletor, fração do percurso]; "stack:k" = k-ésimo cartão da pilha
const frames: Record<string, [string, number][]> = {
  a: [[".pa-manifest", 0.38]],
  b: [[".fx-hscroll", 0.12], [".fx-hscroll", 0.5], [".fx-hscroll", 0.92]],
  d: [],
  c: [[".fx-circle", 0.2], [".fx-circle", 0.5], [".fx-circle", 0.85], [".fx-stack", 0.1], [".fx-stack", 0.34], [".fx-stack", 0.62]],
};

async function prep(page: Page) {
  await page.evaluate(async () => {
    document.querySelectorAll("img").forEach((i) => (i.loading = "eager"));
    await Promise.all(Array.from(document.images).map((i) => i.decode().catch(() => undefined)));
    await document.fonts.ready;
  });
  await page.waitForTimeout(600);
}

mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
for (const v of which) {
  for (const s of sizes) {
    const mobile = s.tag === "mobile";
    const opts = { viewport: { width: s.width, height: s.height }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile };
    const url = `${base}/design-previews/${v}?clean=1&fonts=${fonts}${extra}`;

    // hero + quadros-chave (movimento ligado)
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: "networkidle" });
    await prep(page);
    await page.screenshot({ path: `${out}/${v}-${s.tag}-hero.png` });
    let n = 1;
    for (const [sel, f] of frames[v] ?? []) {
      const y = await page.evaluate(
        ([q, p]) => {
          const el = document.querySelector(q as string) as HTMLElement | null;
          if (!el) return null;
          const top = el.getBoundingClientRect().top + window.scrollY;
          return top + (p as number) * Math.max(0, el.offsetHeight - window.innerHeight);
        },
        [sel, f] as [string, number],
      );
      if (y == null) continue;
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(700);
      await page.screenshot({ path: `${out}/${v}-${s.tag}-frame-${n++}.png` });
    }
    if (v.startsWith("d") && !mobile) {
      // estado aberto dos painéis: rola até as acomodações e passa o mouse no 3º painel
      await page.locator("#pd-stays-t").scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollBy(0, 40));
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${out}/${v}-${s.tag}-stays-1.png` });
      const pn = page.locator("[data-panel]");
      if (await pn.count()) {
        await pn.nth(2).hover();
        await page.waitForTimeout(1600);
        await page.screenshot({ path: `${out}/${v}-${s.tag}-stays-2.png` });
      }
    } else if (v.startsWith("d")) {
      await page.locator("#pd-stays-t").scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${out}/${v}-${s.tag}-stays-1.png` });
    }
    await ctx.close();

    // página inteira estática (reduced-motion)
    const ctx2 = await browser.newContext({ ...opts, reducedMotion: "reduce" });
    const p2 = await ctx2.newPage();
    await p2.goto(url, { waitUntil: "networkidle" });
    await prep(p2);
    const h2 = await p2.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h2; y += s.height) {
      await p2.evaluate((yy) => window.scrollTo(0, yy), y);
      await p2.waitForTimeout(120);
    }
    await p2.evaluate(() => window.scrollTo(0, 0));
    await p2.waitForTimeout(600);
    await p2.screenshot({ path: `${out}/${v}-${s.tag}-full.png`, fullPage: true });
    await ctx2.close();

    if (withVideo) {
      const vdir = `${out}/.video-${v}-${s.tag}`;
      const ctx3 = await browser.newContext({ ...opts, recordVideo: { dir: vdir, size: { width: s.width, height: s.height } } });
      const p3 = await ctx3.newPage();
      await p3.goto(url, { waitUntil: "networkidle" });
      await prep(p3);
      await p3.waitForTimeout(1500);
      const total = await p3.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < total; y += 14) {
        await p3.evaluate((yy) => window.scrollTo(0, yy), y);
        await p3.waitForTimeout(16);
      }
      await p3.waitForTimeout(1200);
      await ctx3.close();
      const f = readdirSync(vdir).find((x) => x.endsWith(".webm"));
      if (f) renameSync(`${vdir}/${f}`, `${out}/${v}-${s.tag}.webm`);
    }
    console.log(v, s.tag, "ok");
  }
}
await browser.close();
