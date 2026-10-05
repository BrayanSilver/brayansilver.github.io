/**
 * Capture live Vercel demos + local Pixel Hop → PNG then WebP for portfolio carousels.
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const VIEW = { width: 1440, height: 900 };
const SCALE = 2;

const JOBS = [
  {
    id: 27,
    folder: 'upload/projeto27',
    files: ['1.webp', '2.webp', '3.webp'],
    url: 'https://techdash-bi.vercel.app',
    steps: [
      async (page) => {},
      async (page) => {
        await page.goto('https://techdash-bi.vercel.app/vendas', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
        await page.waitForTimeout(1200);
      },
      async (page) => {
        await page.goto('https://techdash-bi.vercel.app/analytics', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
        await page.waitForTimeout(1200);
      },
    ],
  },
  {
    id: 24,
    folder: 'upload/projeto24',
    files: ['1.webp', '2.webp', '3.webp', '4.webp'],
    url: 'https://intellihub-ai.vercel.app',
    steps: [
      async (page) => {},
      async (page) => {
        await page.goto('https://intellihub-ai.vercel.app/app/chatbot', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
        await page.waitForTimeout(1000);
      },
      async (page) => {
        await page.goto('https://intellihub-ai.vercel.app/app/search', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
        await page.waitForTimeout(1000);
      },
      async (page) => {
        await page.goto('https://intellihub-ai.vercel.app/app/rag', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
        await page.waitForTimeout(1000);
      },
    ],
  },
  {
    id: 25,
    folder: 'upload/projeto25',
    files: ['1.webp', '2.webp', '3.webp'],
    url: 'https://flowcrm-saas.vercel.app',
    steps: [
      async (page) => {},
      async (page) => {
        const link = page.getByRole('link', { name: /Contact|Contato/i }).first();
        if (await link.count()) await link.click().catch(() => {});
        else await page.goto('https://flowcrm-saas.vercel.app/contacts', { waitUntil: 'networkidle' }).catch(() => {});
        await page.waitForTimeout(1200);
      },
      async (page) => {
        const link = page.getByRole('link', { name: /Deal|Neg|Pipeline|Kanban/i }).first();
        if (await link.count()) await link.click().catch(() => {});
        else await page.goto('https://flowcrm-saas.vercel.app/deals', { waitUntil: 'networkidle' }).catch(() => {});
        await page.waitForTimeout(1200);
      },
    ],
  },
  {
    id: 26,
    folder: 'upload/projeto26',
    files: ['1.webp', '2.webp', '3.webp'],
    url: 'https://techshop-store-blond.vercel.app',
    steps: [
      async (page) => {},
      async (page) => {
        await page.evaluate(() => window.scrollBy(0, 500));
        await page.waitForTimeout(800);
        const card = page.locator('a, button, .product, [href*="product"]').nth(1);
        if (await card.count()) await card.click().catch(() => {});
        await page.waitForTimeout(1200);
      },
      async (page) => {
        const cart = page.getByRole('link', { name: /Cart|Carrinho/i }).first();
        if (await cart.count()) await cart.click().catch(() => {});
        else {
          const btn = page.locator('a,button').filter({ hasText: /Cart|Carrinho/i }).first();
          if (await btn.count()) await btn.click().catch(() => {});
        }
        await page.waitForTimeout(1200);
      },
    ],
  },
  {
    id: 28,
    folder: 'upload/projeto28',
    files: ['1.webp', '2.webp', '3.webp'],
    url: 'https://trello-kanban-three.vercel.app',
    steps: [
      async (page) => {},
      async (page) => {
        const board = page.locator('a, button, .board, [href*="board"]').filter({ hasText: /.+/ }).nth(0);
        if (await board.count()) await board.click().catch(() => {});
        await page.waitForTimeout(1500);
      },
      async (page) => {
        const card = page.locator('[draggable="true"], .card, button').filter({ hasText: /.+/ }).nth(2);
        if (await card.count()) await card.click().catch(() => {});
        await page.waitForTimeout(1000);
      },
    ],
  },
  {
    id: 29,
    folder: 'upload/projeto29',
    files: ['1.webp', '2.webp', '3.webp'],
    url: 'https://realtime-hub-nine.vercel.app',
    steps: [
      async (page) => {},
      async (page) => {
        const chat = page.getByRole('link', { name: /Chat|Sala|Room/i }).first();
        if (await chat.count()) await chat.click().catch(() => {});
        else await page.goto('https://realtime-hub-nine.vercel.app/chat', { waitUntil: 'networkidle' }).catch(() => {});
        await page.waitForTimeout(1500);
      },
      async (page) => {
        const collab = page.getByRole('link', { name: /Collab|Editor|Colabor/i }).first();
        if (await collab.count()) await collab.click().catch(() => {});
        else await page.goto('https://realtime-hub-nine.vercel.app/collaboration', { waitUntil: 'networkidle' }).catch(() => {});
        await page.waitForTimeout(1500);
      },
    ],
  },
  {
    id: 30,
    folder: 'upload/projeto30',
    files: ['1.webp', '2.webp', '3.webp', '4.webp', '5.webp'],
    url: 'https://netflix-streaming.vercel.app',
    steps: [
      async (page) => {
        await page.waitForTimeout(2000);
      },
      async (page) => {
        await page.evaluate(() => window.scrollBy(0, 520));
        await page.waitForTimeout(1000);
      },
      async (page) => {
        await page.evaluate(() => window.scrollBy(0, 700));
        await page.waitForTimeout(1000);
      },
      async (page) => {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(600);
        const series = page.getByText(/Series|Séries/i).first();
        if (await series.count()) await series.click().catch(() => {});
        await page.waitForTimeout(1200);
      },
      async (page) => {
        await page.evaluate(() => window.scrollBy(0, 900));
        await page.waitForTimeout(1000);
      },
    ],
  },
];

async function toWebp(pngPath, webpPath) {
  await sharp(pngPath)
    .rotate()
    .resize({ width: 1280, height: 960, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 78, effort: 6 })
    .toFile(webpPath);
}

async function captureJob(page, job) {
  const dir = path.join(ROOT, job.folder);
  fs.mkdirSync(dir, { recursive: true });
  console.log(`\n=== ${job.folder} (${job.url}) ===`);

  await page.goto(job.url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(2000);

  for (let i = 0; i < job.steps.length; i++) {
    await job.steps[i](page);
    await page.waitForTimeout(700);
    const png = path.join(dir, `_shot${i + 1}.png`);
    const webp = path.join(dir, job.files[i]);
    await page.screenshot({ path: png, type: 'png', fullPage: false });
    await toWebp(png, webp);
    fs.unlinkSync(png);
    console.log(`  ✓ ${job.files[i]} (${Math.round(fs.statSync(webp).size / 1024)}KB)`);
  }
}

async function capturePixelHop(browser, localBase) {
  const dir = path.join(ROOT, 'upload/projeto17');
  fs.mkdirSync(dir, { recursive: true });
  const page = await browser.newPage({
    viewport: VIEW,
    deviceScaleFactor: SCALE,
  });
  console.log('\n=== upload/projeto17 (Pixel Hop) ===');
  await page.goto(`${localBase}/projetos/mario-platformer.html`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  const png = path.join(dir, '_shot1.png');
  const webp = path.join(dir, '1.webp');
  await page.screenshot({ path: png, type: 'png' });
  await toWebp(png, webp);
  fs.unlinkSync(png);
  console.log(`  ✓ 1.webp (${Math.round(fs.statSync(webp).size / 1024)}KB)`);
  await page.close();
}

function startStaticServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
      if (urlPath === '/') urlPath = '/index.html';
      const filePath = path.join(ROOT, urlPath.replace(/^\//, ''));
      if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404);
        res.end('not found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      const types = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.svg': 'image/svg+xml',
        '.webp': 'image/webp',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
      };
      res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    });
    server.listen(8765, '127.0.0.1', () => resolve(server));
  });
}

async function updateDescriptions() {
  const updates = {
    27: {
      en: 'Executive business intelligence panel: sales, analytics, finance, API monitoring, and live public data. Interactive Recharts charts, KPIs, and offline fallback when APIs fail. Original full-stack portfolio demo (Next.js + NestJS).',
      pt: 'Painel executivo de business intelligence: vendas, analytics, finanças, monitoramento de APIs e dados públicos. Gráficos Recharts, KPIs e fallback offline. Demo full stack original de portfólio (Next.js + NestJS).',
    },
    24: {
      en: 'Full-stack AI portfolio hub with modules for chatbot, summarization, semantic search, OCR, support, content generation, and RAG with PDFs. React 19, Next.js 15, NestJS with mock AI engine ready for real providers.',
      pt: 'Hub full stack de IA com módulos de chatbot, sumarização, busca semântica, OCR, suporte, geração de conteúdo e RAG com PDFs. React 19, Next.js 15, NestJS com engine mock pronta para provedores reais.',
    },
    25: {
      en: 'Multi-tenant B2B CRM demo: KPI dashboard, contacts CRUD, deals Kanban pipeline, and tasks board. Each organization sees only its own mock data. Next.js + NestJS full-stack.',
      pt: 'Demo de CRM B2B multi-tenant: dashboard com KPIs, CRUD de contatos, pipeline Kanban de negócios e quadro de tarefas. Cada organização vê apenas seus dados mock. Next.js + NestJS.',
    },
    26: {
      en: 'End-to-end online store demo: catalog with search/filters, JWT auth, cart, simulated checkout (PIX, card, boleto), stock control, and admin panel. Next.js + NestJS.',
      pt: 'Demo de loja online ponta a ponta: catálogo com busca/filtros, auth JWT, carrinho, checkout simulado (PIX, cartão, boleto), estoque e painel admin. Next.js + NestJS.',
    },
    28: {
      en: 'BoardFlow — Kanban task boards with lists, drag-and-drop cards, labels, checklists, dates, and members. REST CRUD and productivity UX. Next.js + NestJS. Original portfolio demo.',
      pt: 'BoardFlow — quadros Kanban com listas, cards drag-and-drop, labels, checklists, datas e membros. CRUD REST e UX de produtividade. Next.js + NestJS. Demo original de portfólio.',
    },
    29: {
      en: 'Realtime Hub — Socket.IO demos: multi-room chat with presence/typing, collaborative editor with live cursors, and notification feed. NestJS gateways + Next.js client.',
      pt: 'Realtime Hub — demos Socket.IO: chat multi-salas com presença/digitando, editor colaborativo com cursores ao vivo e feed de notificações. Gateways NestJS + cliente Next.js.',
    },
    30: {
      en: 'NovaStream — original streaming UI demo with React 19 and Vite: hero banner, category carousels, Top 10, hover previews, detail modal, search, and fictional titles with SVG posters.',
      pt: 'NovaStream — demo original de UI de streaming com React 19 e Vite: banner hero, carrosséis por categoria, Top 10, previews no hover, modal, busca e títulos fictícios com posters SVG.',
    },
    17: {
      en: 'Pixel Hop — original 2D platformer in React. Jump platforms, collect coins, defeat enemies, and chase high scores. Lives, physics, and smooth animations.',
      pt: 'Pixel Hop — platformer 2D original em React. Pule plataformas, colete moedas, derrote inimigos e busque high scores. Vidas, física e animações suaves.',
    },
  };

  for (const [file, lang] of [
    ['upload/projetos.json', 'en'],
    ['upload/projetos.pt.json', 'pt'],
  ]) {
    const full = path.join(ROOT, file);
    const j = JSON.parse(fs.readFileSync(full, 'utf8'));
    for (const p of j.projetos) {
      if (!updates[p.id]) continue;
      p.descricao = updates[p.id][lang];
      if (p.id === 17) {
        p.imagens = ['1.webp'];
        p.loadedImages = ['upload/projeto17/1.webp'];
      } else if (updates[p.id]) {
        // keep imagem list; ensure webp names match capture
        const job = JOBS.find((x) => x.id === p.id);
        if (job) {
          p.imagens = [...job.files];
          p.loadedImages = job.files.map((f) => `${job.folder}/${f}`);
        }
      }
    }
    fs.writeFileSync(full, JSON.stringify(j, null, 2) + '\n');
    console.log('updated descriptions', file);
  }
}

async function main() {
  const server = await startStaticServer();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEW,
    deviceScaleFactor: SCALE,
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  for (const job of JOBS) {
    try {
      await captureJob(page, job);
    } catch (e) {
      console.error('FAILED', job.folder, e.message);
    }
  }

  try {
    await capturePixelHop(browser, 'http://127.0.0.1:8765');
  } catch (e) {
    console.error('FAILED pixel hop', e.message);
  }

  await browser.close();
  server.close();
  await updateDescriptions();
  console.log('\nAll capture jobs finished.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
