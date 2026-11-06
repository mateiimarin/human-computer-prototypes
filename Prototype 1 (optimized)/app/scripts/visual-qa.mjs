// Captures the main screens at desktop and phone widths and checks for horizontal overflow.
// Usage: start the app (npm run dev -- --port 3100), then: node scripts/visual-qa.mjs
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const base = process.env.BASE_URL ?? "http://localhost:3100";
const out = "docs/screenshots";
await mkdir(out, { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });
const errors = [];

async function openApp(width, height) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  await page.addLocatorHandler(page.getByRole("dialog", { name: "About this prototype" }), (d) => d.getByRole("button", { name: "Start" }).click());
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${base}/`);
  return page;
}

for (const [label, width, height] of [["desktop", 1440, 900], ["phone", 390, 844]]) {
  const page = await openApp(width, height);
  const stops = [
    ["exercises", "/"],
    ["task", "/task/t1"],
  ];
  for (const [name, path] of stops) {
    await page.goto(base + path);
    await page.waitForTimeout(1200);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (overflow > 0) errors.push(`Horizontal overflow of ${overflow}px on ${path} at ${width}px`);
    await page.screenshot({ path: `${out}/${label}-${name}.png` });
  }
  // Session journey
  await page.goto(`${base}/task/t1/setup`);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${out}/${label}-setup.png` });
  await page.getByRole("button", { name: /Start working/ }).click();
  await page.waitForURL("**/work");
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${out}/${label}-work.png` });
  for (const [i, name] of ["Base case", "Induction hypothesis", "Induction step"].entries()) {
    await page.locator(`#attempt-${i}`).click();
    await page.getByRole("button", { name: `Fill sample text: ${name}` }).click();
  }
  await page.locator("#attempt-1").click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${out}/${label}-work-filled.png` });
  await page.getByRole("button", { name: /Review my attempt/ }).click();
  await page.waitForURL("**/review");
  await page.waitForTimeout(5200);
  await page.screenshot({ path: `${out}/${label}-review.png` });
  await page.getByRole("button", { name: /finish with this issue open/i }).click();
  await page.getByRole("button", { name: /Continue to reflection/ }).click();
  await page.waitForURL("**/reflect");
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${out}/${label}-reflect.png` });
  await page.context().close();
}

// The About dialog, as a first-time visitor sees it
for (const [label, width, height] of [["desktop", 1440, 900], ["phone", 390, 844]]) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  await page.goto(`${base}/`);
  await page.getByRole("dialog").waitFor();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${out}/${label}-about.png` });
  await ctx.close();
}

await browser.close();
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Screenshots written to", out);
