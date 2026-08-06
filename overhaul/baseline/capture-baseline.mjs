/**
 * T0-01 — pre-overhaul visual baseline capture.
 *
 * Drives Playwright directly rather than through the MCP server: MCP tools only load at
 * Claude Code session start, and the baseline is needed now. Same browser, same result.
 *
 *   npm run dev            # must be running on :3000
 *   node overhaul/baseline/capture-baseline.mjs
 *
 * STATUS: written and reviewed, NOT yet run to completion. It needs the `playwright`
 * package resolvable from this file. NODE_PATH does not work for ESM imports, so either:
 *   (a) prefer the Playwright MCP tools once the server loads in a fresh session, or
 *   (b) add playwright as a devDependency AFTER the T1-07/T1-08 package.json freeze
 *       lifts (overhaul/07 allows only one dependency task at a time), then run as above.
 * Option (a) is preferred - it needs no dependency change at all.
 *
 * Writes 7 routes x 2 breakpoints x 2 languages = 28 PNGs to this directory,
 * named <route-slug>__<breakpoint>__<lang>.png per the README's convention.
 *
 * Language is set by seeding localStorage["coursaty-lang"] before the page loads
 * (see app/components/i18n.tsx:1083) — the app has no cookie/SSR language yet, which
 * is finding A11Y-001 and the reason T3-09 exists. The AR captures therefore show
 * the post-hydration state, and any first-paint LTR flash is itself baseline evidence.
 */
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE_URL ?? "http://localhost:3000";

const CLASS_ID = process.env.CLASS_ID ?? "cmm6hgt740003v2qk98myu3z4";
const CENTER_ID = process.env.CENTER_ID ?? "cmm6hgsic0000v2qkdrdbab5o";

const ROUTES = [
  { slug: "index", path: "/", full: true },
  { slug: "tutors", path: "/tutors" },
  { slug: "classes", path: "/classes" },
  { slug: "classes-id", path: `/classes/${CLASS_ID}` },
  { slug: "classes-id-book", path: `/classes/${CLASS_ID}/book` },
  { slug: "centers", path: "/centers" },
  { slug: "dashboard", path: "/dashboard", auth: true },
];

const BREAKPOINTS = [
  { name: "1280", width: 1280, height: 900 },
  { name: "390", width: 390, height: 844 },
];
const LANGS = ["en", "ar"];

const CREDS = {
  email: "tutor-full@fixtures.coursaty.test",
  password: "FixturePass!234",
};

async function login(context) {
  const page = await context.newPage();
  try {
    await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.fill('input[type="email"], input[name="email"]', CREDS.email);
    await page.fill('input[type="password"], input[name="password"]', CREDS.password);
    await Promise.all([
      page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 30000 }).catch(() => {}),
      page.click('button[type="submit"]'),
    ]);
    await page.waitForTimeout(2500);
    const ok = !page.url().includes("/login");
    console.log(ok ? "  auth: signed in" : "  auth: FAILED (dashboard shots will show the login redirect)");
    return ok;
  } catch (e) {
    console.log("  auth: FAILED -", e.message.split("\n")[0]);
    return false;
  } finally {
    await page.close();
  }
}

const results = [];

for (const bp of BREAKPOINTS) {
  for (const lang of LANGS) {
    const browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: bp.width, height: bp.height },
      deviceScaleFactor: 1,
      locale: lang === "ar" ? "ar-EG" : "en-US",
    });
    // Seed language before any app JS runs.
    await context.addInitScript((l) => {
      try { window.localStorage.setItem("coursaty-lang", l); } catch {}
    }, lang);

    console.log(`\n[${bp.name}px / ${lang}]`);
    const authed = await login(context);

    for (const r of ROUTES) {
      if (r.auth && !authed) {
        results.push({ route: r.slug, bp: bp.name, lang, status: "skipped-no-auth" });
        console.log(`  ${r.slug.padEnd(18)} skipped (no auth)`);
        continue;
      }
      const page = await context.newPage();
      const errors = [];
      page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 160)); });
      page.on("pageerror", (e) => errors.push(`pageerror: ${String(e).slice(0, 160)}`));
      try {
        const resp = await page.goto(`${BASE}${r.path}`, { waitUntil: "domcontentloaded", timeout: 45000 });
        await page.waitForTimeout(3000); // let hydration + the language switch settle
        const file = join(OUT, `${r.slug}__${bp.name}__${lang}.png`);
        await page.screenshot({ path: file, fullPage: Boolean(r.full) });
        const landed = new URL(page.url()).pathname;
        const redirected = landed !== r.path;
        const dir = await page.evaluate(() => document.documentElement.dir || "(unset)");
        const htmlLang = await page.evaluate(() => document.documentElement.lang || "(unset)");
        results.push({
          route: r.slug, bp: bp.name, lang, status: resp?.status() ?? 0,
          landed: redirected ? landed : "-", dir, htmlLang, errors: errors.length,
        });
        console.log(
          `  ${r.slug.padEnd(18)} ${String(resp?.status() ?? "?").padEnd(4)}` +
          `${redirected ? `-> ${landed}`.padEnd(24) : "".padEnd(24)}` +
          `dir=${dir.padEnd(5)} lang=${htmlLang.padEnd(5)} errs=${errors.length}`
        );
      } catch (e) {
        results.push({ route: r.slug, bp: bp.name, lang, status: "ERROR", note: e.message.split("\n")[0] });
        console.log(`  ${r.slug.padEnd(18)} ERROR ${e.message.split("\n")[0].slice(0, 70)}`);
      } finally {
        await page.close();
      }
    }
    await browser.close();
  }
}

console.log("\n=== summary ===");
const captured = results.filter((r) => typeof r.status === "number").length;
console.log(`captured: ${captured}/${results.length}`);
const rtlWrong = results.filter((r) => r.lang === "ar" && r.dir && r.dir !== "rtl");
if (rtlWrong.length) console.log(`AR pages NOT in rtl: ${rtlWrong.length} (A11Y-001 evidence)`);
const withErrors = results.filter((r) => r.errors > 0);
if (withErrors.length) console.log(`pages with console errors: ${withErrors.map((r) => `${r.route}/${r.bp}/${r.lang}(${r.errors})`).join(", ")}`);
const redirects = results.filter((r) => r.landed && r.landed !== "-");
if (redirects.length) console.log(`redirected: ${[...new Set(redirects.map((r) => `${r.route} -> ${r.landed}`))].join(", ")}`);
