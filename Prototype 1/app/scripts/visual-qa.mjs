// Captures the main screens at desktop and phone widths and checks for horizontal overflow.
// Usage: start the app (npm run dev -- --port 3100), then: node scripts/visual-qa.mjs
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const base = process.env.BASE_URL ?? "http://localhost:3100";
const out = "docs/screenshots";
await mkdir(out, { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });
const errors = [];

async function signedIn(width, height) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${base}/welcome`);
  await page.getByRole("button", { name: "Continue with university account" }).click();
  await page.waitForURL("**/onboarding");
  for (let i = 0; i < 2; i++) await page.getByRole("button", { name: /Continue/ }).click();
  await page.getByRole("button", { name: /Start studying/ }).click();
  await page.waitForURL(`${base}/`);
  return page;
}

for (const [label, width, height] of [["desktop", 1440, 900], ["phone", 390, 844]]) {
  const page = await signedIn(width, height);
  const stops = [
    ["today", "/"],
    ["library", "/library"],
    ["sheet", "/library/dm3"],
    ["task", "/task/t1"],
    ["history", "/history"],
    ["settings", "/settings"],
    ["add-sheet", "/library/new"],
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
  for (let i = 0; i < 2; i++) await page.getByRole("button", { name: /Continue/ }).first().click();
  await page.getByRole("button", { name: /See my agreement/ }).click();
  await page.getByRole("button", { name: /Start working/ }).click();
  await page.waitForURL("**/work");
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${out}/${label}-work.png` });
  await page.getByRole("button", { name: /Handwritten work/ }).click();
  await page.getByRole("menuitem", { name: /sample photo/ }).click();
  await page.waitForTimeout(1800);
  await page.getByRole("button", { name: /Use this as my attempt/ }).click();
  await page.getByRole("button", { name: /Review my attempt/ }).click();
  await page.waitForURL("**/review");
  await page.waitForTimeout(5200);
  await page.screenshot({ path: `${out}/${label}-review.png` });
  await page.getByRole("button", { name: /Finish with this gap open/ }).click();
  await page.getByRole("button", { name: /Continue to reflection/ }).click();
  await page.waitForURL("**/reflect");
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${out}/${label}-reflect.png` });
  await page.context().close();
}

await browser.close();
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Screenshots written to", out);
