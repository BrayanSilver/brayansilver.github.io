import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const BASE = process.env.PORTFOLIO_BASE || 'http://127.0.0.1:8765';

/** @type {{ folder: string, url: string, shots: { file: string, prep?: (page: import('playwright').Page) => Promise<void> }[] }[]} */
const JOBS = [
  {
    folder: 'upload/projeto27',
    url: '/projetos/techdash/',
    shots: [
      { file: '1.png' },
      {
        file: '2.png',
        prep: async (page) => {
          await page.evaluate(() => window.scrollTo(0, 420));
        },
      },
      {
        file: '3.png',
        prep: async (page) => {
          await page.evaluate(() => window.scrollTo(0, 900));
        },
      },
    ],
  },
  {
    folder: 'upload/projeto24',
    url: '/projetos/intellihub/',
    shots: [
      { file: '1.png' },
      {
        file: '2.png',
        prep: async (page) => {
          const btn = page.locator('button, [role="tab"], .nav-item, .mod, a').filter({ hasText: /Summar|Sumari|Search|Busca|Content|Conte/i }).first();
          if (await btn.count()) await btn.click().catch(() => {});
          await page.waitForTimeout(400);
        },
      },
      {
        file: '3.png',
        prep: async (page) => {
          const btn = page.locator('button, [role="tab"], .nav-item, .mod, a').filter({ hasText: /Chat|OCR|Support|Suporte/i }).first();
          if (await btn.count()) await btn.click().catch(() => {});
          await page.waitForTimeout(400);
        },
      },
      {
        file: '4.png',
        prep: async (page) => {
          await page.evaluate(() => window.scrollTo(0, 300));
        },
      },
    ],
  },
  {
    folder: 'upload/projeto25',
    url: '/projetos/flowcrm/',
    shots: [
      { file: '1.png' },
      {
        file: '2.png',
        prep: async (page) => {
          const btn = page.locator('button, [role="tab"], .tab, a').filter({ hasText: /Contact|Contato/i }).first();
          if (await btn.count()) await btn.click().catch(() => {});
          await page.waitForTimeout(400);
        },
      },
      {
        file: '3.png',
        prep: async (page) => {
          const btn = page.locator('button, [role="tab"], .tab, a').filter({ hasText: /Deal|Neg|Pipeline|Kanban/i }).first();
          if (await btn.count()) await btn.click().catch(() => {});
          await page.waitForTimeout(400);
        },
      },
    ],
  },
  {
    folder: 'upload/projeto26',
    url: '/projetos/techshop/',
    shots: [
      { file: '1.png' },
      {
        file: '2.png',
        prep: async (page) => {
          const add = page.locator('button').filter({ hasText: /Add|Adicionar|Carrinho|\+/i }).first();
          if (await add.count()) await add.click().catch(() => {});
          await page.waitForTimeout(300);
          const cart = page.locator('button, a, .cart').filter({ hasText: /Cart|Carrinho/i }).first();
          if (await cart.count()) await cart.click().catch(() => {});
          await page.waitForTimeout(400);
        },
      },
      {
        file: '3.png',
        prep: async (page) => {
          await page.evaluate(() => window.scrollTo(0, 500));
        },
      },
    ],
  },
  {
    folder: 'upload/projeto28',
    url: '/projetos/trello-kanban/',
    shots: [
      { file: '1.png' },
      {
        file: '2.png',
        prep: async (page) => {
          const card = page.locator('.card, [draggable="true"], .kanban-card').first();
          if (await card.count()) await card.click().catch(() => {});
          await page.waitForTimeout(500);
        },
      },
      {
        file: '3.png',
        prep: async (page) => {
          await page.keyboard.press('Escape').catch(() => {});
          await page.evaluate(() => window.scrollTo(400, 0));
        },
      },
    ],
  },
  {
    folder: 'upload/projeto29',
    url: '/projetos/realtime-hub/',
    shots: [
      { file: '1.png' },
      {
        file: '2.png',
        prep: async (page) => {
          const room = page.locator('button, .room, li').filter({ hasText: /Support|Suporte|Dev/i }).first();
          if (await room.count()) await room.click().catch(() => {});
          await page.waitForTimeout(800);
        },
      },
      {
        file: '3.png',
        prep: async (page) => {
          const input = page.locator('input[type="text"], textarea').first();
          if (await input.count()) {
            await input.fill('Olá time! Demo em tempo real 🚀');
            await page.waitForTimeout(600);
          }
        },
      },
    ],
  },
  {
    folder: 'upload/projeto30',
    url: '/projetos/netflix-streaming/',
    shots: [
      { file: '1.png' },
      {
        file: '2.png',
        prep: async (page) => {
          await page.waitForTimeout(1500);
          await page.evaluate(() => window.scrollTo(0, 500));
          await page.waitForTimeout(500);
        },
      },
      {
        file: '3.png',
        prep: async (page) => {
          await page.evaluate(() => window.scrollTo(0, 1100));
          await page.waitForTimeout(500);
        },
      },
      {
        file: '4.png',
        prep: async (page) => {
          await page.evaluate(() => window.scrollTo(0, 0));
          const poster = page.locator('img, .card, .poster, .movie').nth(2);
          if (await poster.count()) await poster.hover().catch(() => {});
          await page.waitForTimeout(600);
        },
      },
      {
        file: '5.png',
        prep: async (page) => {
          await page.evaluate(() => window.scrollTo(0, 1600));
          await page.waitForTimeout(500);
        },
      },
    ],
  },
  {
    folder: 'upload/projeto31',
    url: '/projetos/neon-drift-3d.html',
    shots: [
      { file: 'neon-drift-cover.jpg' },
      {
        file: '2.png',
        prep: async (page) => {
          const start = page.locator('button').filter({ hasText: /Jogar|Play/i }).first();
          if (await start.count()) await start.click().catch(() => {});
          await page.waitForTimeout(2000);
        },
      },
      {
        file: '3.png',
        prep: async (page) => {
          await page.keyboard.press('ArrowRight').catch(() => {});
          await page.waitForTimeout(1200);
          await page.keyboard.press('Space').catch(() => {});
          await page.waitForTimeout(800);
        },
      },
    ],
  },
  {
    folder: 'upload/projeto32',
    url: '/projetos/crystal-orbit-3d.html',
    shots: [
      { file: 'crystal-orbit-cover.jpg' },
      {
        file: '2.png',
        prep: async (page) => {
          const start = page.locator('button').filter({ hasText: /Jogar|Play/i }).first();
          if (await start.count()) await start.click().catch(() => {});
          await page.waitForTimeout(2000);
        },
      },
      {
        file: '3.png',
        prep: async (page) => {
          await page.mouse.move(900, 400);
          await page.mouse.down();
          await page.mouse.move(700, 350);
          await page.mouse.up();
          await page.waitForTimeout(400);
          await page.mouse.click(640, 400);
          await page.waitForTimeout(1000);
        },
      },
    ],
  },
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  for (const job of JOBS) {
    const dir = path.join(ROOT, job.folder);
    fs.mkdirSync(dir, { recursive: true });
    console.log(`\n== ${job.folder} (${job.url}) ==`);

    for (const shot of job.shots) {
      try {
        await page.goto(BASE + job.url, { waitUntil: 'networkidle', timeout: 45000 });
        await page.waitForTimeout(800);
        if (shot.prep) await shot.prep(page);
        await page.waitForTimeout(400);
        const out = path.join(dir, shot.file);
        await page.screenshot({ path: out, type: shot.file.endsWith('.jpg') ? 'jpeg' : 'png', quality: shot.file.endsWith('.jpg') ? 90 : undefined, fullPage: false });
        console.log('  saved', shot.file, Math.round(fs.statSync(out).size / 1024) + 'KB');
      } catch (err) {
        console.error('  FAIL', shot.file, err.message);
      }
    }
  }

  await browser.close();
  console.log('\nDone.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
