import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const html = path.join(root, 'projetos', 'sales-pulse', 'index.html');
const outDir = path.join(root, 'upload', 'projeto31');
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(pathToFileURL(html).href, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(2200);
await page.screenshot({ path: path.join(outDir, '1.png') });
const ind = page.locator('[data-view="indicadores"]').first();
if (await ind.count()) {
  await ind.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, '2.png') });
}
await browser.close();
console.log('captured', outDir);
