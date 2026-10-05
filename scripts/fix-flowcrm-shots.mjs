import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(ROOT, 'upload/projeto25');

async function save(page, name) {
  const png = path.join(dir, `_${name}.png`);
  const webp = path.join(dir, name);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: png, type: 'png' });
  await sharp(png)
    .resize({ width: 1400, height: 900, fit: 'cover' })
    .webp({ quality: 82 })
    .toFile(webp);
  fs.unlinkSync(png);
  console.log('saved', name, Math.round(fs.statSync(webp).size / 1024) + 'KB');
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

await page.goto('https://flowcrm-saas.vercel.app/login', {
  waitUntil: 'domcontentloaded',
  timeout: 60000,
});
await page.waitForTimeout(1500);
await save(page, '2.webp');

await page.locator('input#email, input[type="email"]').first().fill('ana@acme.com');
const chip = page.getByText('ana@acme.com').first();
if (await chip.count()) await chip.click().catch(() => {});
await page
  .getByRole('button', { name: /Entrar|Acessar|Continuar|Login/i })
  .first()
  .click()
  .catch(() => {});
await page.waitForTimeout(2500);

for (const u of [
  'https://flowcrm-saas.vercel.app/app/pipeline',
  'https://flowcrm-saas.vercel.app/app/deals',
  'https://flowcrm-saas.vercel.app/app/contacts',
  'https://flowcrm-saas.vercel.app/app',
]) {
  await page.goto(u, { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForTimeout(1500);
  const bad =
    page.url().includes('login') ||
    (await page.locator('text=This page could not be found').count()) > 0;
  if (!bad) {
    await save(page, '3.webp');
    break;
  }
}

await browser.close();
console.log('flowcrm fixed');
