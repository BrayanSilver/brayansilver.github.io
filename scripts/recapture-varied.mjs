/**
 * Recapture varied screenshots where first pass produced duplicates.
 */
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const BASE = 'http://127.0.0.1:8765';

async function shot(page, filePath) {
  await page.waitForTimeout(500);
  const type = filePath.endsWith('.jpg') ? 'jpeg' : 'png';
  await page.screenshot({
    path: filePath,
    type,
    quality: type === 'jpeg' ? 90 : undefined,
  });
  console.log('saved', path.relative(ROOT, filePath), Math.round(fs.statSync(filePath).size / 1024) + 'KB');
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // --- Netflix: navigate sections ---
  {
    const dir = path.join(ROOT, 'upload/projeto30');
    await page.goto(`${BASE}/projetos/netflix-streaming/`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2000);
    await shot(page, path.join(dir, '1.png'));

    const series = page.getByRole('link', { name: /Series|Séries/i }).first();
    if (await series.count()) {
      await series.click();
      await page.waitForTimeout(1200);
    } else {
      await page.evaluate(() => {
        const el = [...document.querySelectorAll('a,button,span')].find((e) => /Series|Séries/i.test(e.textContent || ''));
        el?.click();
      });
      await page.waitForTimeout(1200);
    }
    await shot(page, path.join(dir, '2.png'));

    await page.evaluate(() => window.scrollBy(0, 650));
    await page.waitForTimeout(800);
    await shot(page, path.join(dir, '3.png'));

    const films = page.getByText(/Films|Filmes/i).first();
    if (await films.count()) {
      await films.click();
      await page.waitForTimeout(1200);
    }
    await shot(page, path.join(dir, '4.png'));

    await page.evaluate(() => window.scrollBy(0, 900));
    await page.waitForTimeout(800);
    await shot(page, path.join(dir, '5.png'));
  }

  // --- IntelliHub: each module ---
  {
    const dir = path.join(ROOT, 'upload/projeto24');
    await page.goto(`${BASE}/projetos/intellihub/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await shot(page, path.join(dir, '1.png'));

    for (const [file, label] of [
      ['2.png', /Summar/i],
      ['3.png', /Semantic|Search|Busca/i],
      ['4.png', /Content|Conte/i],
    ]) {
      await page.evaluate((reSource) => {
        const re = new RegExp(reSource, 'i');
        const el = [...document.querySelectorAll('button, a, .mod, [data-mod], li, div')].find((e) =>
          re.test((e.textContent || '').trim()) && (e.textContent || '').trim().length < 40
        );
        el?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }, label.source);
      await page.waitForTimeout(500);
      // also try getByText
      const t = page.getByText(label).first();
      if (await t.count()) await t.click().catch(() => {});
      await page.waitForTimeout(400);
      await shot(page, path.join(dir, file));
    }
  }

  // --- TechDash: edit KPI + scroll table ---
  {
    const dir = path.join(ROOT, 'upload/projeto27');
    await page.goto(`${BASE}/projetos/techdash/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await shot(page, path.join(dir, '1.png'));

    const inputs = page.locator('input');
    if (await inputs.count()) {
      await inputs.nth(0).fill('2048');
      await inputs.nth(1).fill('1250000');
      await page.waitForTimeout(400);
    }
    await shot(page, path.join(dir, '2.png'));

    await page.locator('table, .table, h2, h3').last().scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(400);
    await shot(page, path.join(dir, '3.png'));
  }

  // --- FlowCRM tabs ---
  {
    const dir = path.join(ROOT, 'upload/projeto25');
    await page.goto(`${BASE}/projetos/flowcrm/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await shot(page, path.join(dir, '1.png'));

    for (const [file, label] of [
      ['2.png', /Contact|Contato/i],
      ['3.png', /Deal|Neg|Pipeline/i],
    ]) {
      const t = page.getByText(label).first();
      if (await t.count()) await t.click();
      await page.waitForTimeout(500);
      await shot(page, path.join(dir, file));
    }
  }

  // --- TechShop cart flow ---
  {
    const dir = path.join(ROOT, 'upload/projeto26');
    await page.goto(`${BASE}/projetos/techshop/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await shot(page, path.join(dir, '1.png'));

    const adds = page.getByRole('button', { name: /Adicionar|Add/i });
    const n = Math.min(3, await adds.count());
    for (let i = 0; i < n; i++) await adds.nth(i).click();
    await page.waitForTimeout(400);
    await shot(page, path.join(dir, '2.png'));

    const cart = page.getByText(/Carrinho|Cart/i).first();
    if (await cart.count()) await cart.click();
    await page.waitForTimeout(500);
    await shot(page, path.join(dir, '3.png'));
  }

  // --- Trello open modal ---
  {
    const dir = path.join(ROOT, 'upload/projeto28');
    await page.goto(`${BASE}/projetos/trello-kanban/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await shot(page, path.join(dir, '1.png'));

    const card = page.locator('[draggable="true"], .card').first();
    if (await card.count()) await card.click();
    await page.waitForTimeout(500);
    await shot(page, path.join(dir, '2.png'));

    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const add = page.getByText(/Add card|\+ Add/i).first();
    if (await add.count()) await add.click();
    await page.waitForTimeout(400);
    await shot(page, path.join(dir, '3.png'));
  }

  // --- Realtime rooms ---
  {
    const dir = path.join(ROOT, 'upload/projeto29');
    await page.goto(`${BASE}/projetos/realtime-hub/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await shot(page, path.join(dir, '1.png'));

    const support = page.getByText(/Support|Suporte/i).first();
    if (await support.count()) await support.click();
    await page.waitForTimeout(1500);
    await shot(page, path.join(dir, '2.png'));

    const input = page.locator('input, textarea').last();
    if (await input.count()) {
      await input.fill('Mensagem da demo do portfolio');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(800);
    }
    await shot(page, path.join(dir, '3.png'));
  }

  await browser.close();
  console.log('Recapture done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
