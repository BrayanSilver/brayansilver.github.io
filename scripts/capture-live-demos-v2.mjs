/**
 * Capture correct live demos with login/navigation where needed.
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

async function toWebp(pngPath, webpPath) {
  await sharp(pngPath)
    .rotate()
    .resize({ width: 1400, height: 900, fit: 'cover' })
    .webp({ quality: 82, effort: 6 })
    .toFile(webpPath);
}

async function shot(page, dir, file) {
  fs.mkdirSync(dir, { recursive: true });
  const png = path.join(dir, `_${file}.png`);
  const webp = path.join(dir, file);
  await page.waitForTimeout(900);
  await page.screenshot({ path: png, type: 'png' });
  await toWebp(png, webp);
  fs.unlinkSync(png);
  console.log(`  ✓ ${path.basename(dir)}/${file} (${Math.round(fs.statSync(webp).size / 1024)}KB)`);
}

async function goto(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(1800);
}

function startStaticServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
      if (urlPath === '/') urlPath = '/index.html';
      const filePath = path.join(ROOT, urlPath.replace(/^\//, ''));
      if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404);
        res.end('nf');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg' };
      res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    });
    server.listen(8765, '127.0.0.1', () => resolve(server));
  });
}

async function captureAll(page) {
  // TechDash
  {
    const dir = path.join(ROOT, 'upload/projeto27');
    console.log('\n=== TechDash ===');
    await goto(page, 'https://techdash-bi.vercel.app/');
    await shot(page, dir, '1.webp');
    await goto(page, 'https://techdash-bi.vercel.app/vendas');
    await shot(page, dir, '2.webp');
    await goto(page, 'https://techdash-bi.vercel.app/financeiro');
    await shot(page, dir, '3.webp');
  }

  // IntelliHub (correct domain: -self)
  {
    const dir = path.join(ROOT, 'upload/projeto24');
    console.log('\n=== IntelliHub ===');
    await goto(page, 'https://intellihub-ai-self.vercel.app/');
    await shot(page, dir, '1.webp');
    await goto(page, 'https://intellihub-ai-self.vercel.app/app/chatbot');
    await shot(page, dir, '2.webp');
    await goto(page, 'https://intellihub-ai-self.vercel.app/app/search');
    await shot(page, dir, '3.webp');
    await goto(page, 'https://intellihub-ai-self.vercel.app/app/rag');
    await shot(page, dir, '4.webp');
  }

  // FlowCRM — login then app pages
  {
    const dir = path.join(ROOT, 'upload/projeto25');
    console.log('\n=== FlowCRM ===');
    await goto(page, 'https://flowcrm-saas.vercel.app/');
    await shot(page, dir, '1.webp');
    await goto(page, 'https://flowcrm-saas.vercel.app/login');
    const email = page.locator('input#email, input[type="email"]').first();
    if (await email.count()) {
      await email.fill('ana@acme.com');
      const submit = page.getByRole('button', { name: /Entrar|Login|Continuar|Começar/i }).first();
      if (await submit.count()) await submit.click();
      else await page.keyboard.press('Enter');
      await page.waitForTimeout(2500);
    }
    // quick account chip
    const chip = page.getByText('ana@acme.com').first();
    if (await chip.count()) {
      await chip.click().catch(() => {});
      await page.waitForTimeout(800);
      const submit2 = page.getByRole('button', { name: /Entrar|Login|Continuar|Começar/i }).first();
      if (await submit2.count()) await submit2.click().catch(() => {});
      await page.waitForTimeout(2000);
    }
    await goto(page, 'https://flowcrm-saas.vercel.app/app');
    await page.waitForTimeout(1500);
    // if still login, try again
    if (page.url().includes('login')) {
      await page.locator('input#email, input[type="email"]').first().fill('ana@acme.com');
      await page.getByRole('button', { name: /Entrar|Login|Acessar|Continuar/i }).first().click().catch(() => {});
      await page.waitForTimeout(2500);
      await page.goto('https://flowcrm-saas.vercel.app/app', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);
    }
    await shot(page, dir, '2.webp');
    await page.goto('https://flowcrm-saas.vercel.app/app/contacts', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.waitForTimeout(1500);
    if (page.url().includes('login') || (await page.locator('text=404').count())) {
      await page.goto('https://flowcrm-saas.vercel.app/app/deals', { waitUntil: 'domcontentloaded' }).catch(() => {});
      await page.waitForTimeout(1500);
    }
    await shot(page, dir, '3.webp');
  }

  // TechShop
  {
    const dir = path.join(ROOT, 'upload/projeto26');
    console.log('\n=== TechShop ===');
    await goto(page, 'https://techshop-store-blond.vercel.app/');
    await shot(page, dir, '1.webp');
    await page.evaluate(() => window.scrollBy(0, 420));
    await page.waitForTimeout(800);
    await shot(page, dir, '2.webp');
    await goto(page, 'https://techshop-store-blond.vercel.app/cart');
    await shot(page, dir, '3.webp');
  }

  // BoardFlow
  {
    const dir = path.join(ROOT, 'upload/projeto28');
    console.log('\n=== BoardFlow ===');
    await goto(page, 'https://trello-kanban-three.vercel.app/');
    await shot(page, dir, '1.webp');
    const board = page.getByText(/Projeto TechFlow|Pessoal|Marketing/i).first();
    if (await board.count()) {
      await board.click();
      await page.waitForTimeout(2000);
    }
    await shot(page, dir, '2.webp');
    const card = page.locator('[draggable="true"], button, div').filter({ hasText: /.{8,40}/ }).nth(5);
    if (await card.count()) await card.click().catch(() => {});
    await page.waitForTimeout(1200);
    await shot(page, dir, '3.webp');
  }

  // Realtime Hub
  {
    const dir = path.join(ROOT, 'upload/projeto29');
    console.log('\n=== Realtime Hub ===');
    await goto(page, 'https://realtime-hub-nine.vercel.app/');
    await shot(page, dir, '1.webp');
    await goto(page, 'https://realtime-hub-nine.vercel.app/chat');
    await shot(page, dir, '2.webp');
    await goto(page, 'https://realtime-hub-nine.vercel.app/collaboration');
    await shot(page, dir, '3.webp');
  }

  // NovaStream
  {
    const dir = path.join(ROOT, 'upload/projeto30');
    console.log('\n=== NovaStream ===');
    await goto(page, 'https://netflix-streaming.vercel.app/');
    await page.waitForTimeout(2500);
    await shot(page, dir, '1.webp');
    await page.evaluate(() => window.scrollBy(0, 560));
    await page.waitForTimeout(1000);
    await shot(page, dir, '2.webp');
    await page.evaluate(() => window.scrollBy(0, 700));
    await page.waitForTimeout(1000);
    await shot(page, dir, '3.webp');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);
    const series = page.getByText(/^Series$/i).first();
    if (await series.count()) await series.click().catch(() => {});
    await page.waitForTimeout(1200);
    await shot(page, dir, '4.webp');
    await page.evaluate(() => window.scrollBy(0, 900));
    await page.waitForTimeout(1000);
    await shot(page, dir, '5.webp');
  }
}

async function capturePixelHop(browser) {
  const dir = path.join(ROOT, 'upload/projeto17');
  const page = await browser.newPage({ viewport: VIEW, deviceScaleFactor: 2 });
  console.log('\n=== Pixel Hop ===');
  await goto(page, 'http://127.0.0.1:8765/projetos/mario-platformer.html');
  await shot(page, dir, '1.webp');
  // try start game for second angle
  const play = page.getByText(/Jogar|Play|Start|Iniciar/i).first();
  if (await play.count()) {
    await play.click().catch(() => {});
    await page.waitForTimeout(2000);
  }
  await page.close();
}

function patchPortfolioJson() {
  const map = {
    27: {
      link: 'https://techdash-bi.vercel.app',
      en: 'Executive BI dashboard with sales, analytics, finance, API monitoring and public data. Interactive Recharts charts and KPI cards. Next.js + NestJS full-stack demo.',
      pt: 'Dashboard executivo de BI com vendas, analytics, finanças, monitoramento de APIs e dados públicos. Gráficos Recharts e cards de KPI. Demo full stack Next.js + NestJS.',
      imgs: ['1.webp', '2.webp', '3.webp'],
      folder: 'projeto27',
    },
    24: {
      link: 'https://intellihub-ai-self.vercel.app',
      en: 'AI portfolio hub with chatbot, summarization, semantic search, OCR, support, content generation and RAG over PDFs. React 19, Next.js 15 and NestJS mock engine.',
      pt: 'Hub de IA com chatbot, sumarização, busca semântica, OCR, suporte, geração de conteúdo e RAG com PDFs. React 19, Next.js 15 e engine mock NestJS.',
      imgs: ['1.webp', '2.webp', '3.webp', '4.webp'],
      folder: 'projeto24',
    },
    25: {
      link: 'https://flowcrm-saas.vercel.app',
      en: 'Multi-tenant mini CRM SaaS: landing, email login, KPI dashboard, contacts and Kanban deals pipeline. Next.js + NestJS with mock org data.',
      pt: 'Mini CRM SaaS multi-tenant: landing, login por e-mail, dashboard de KPIs, contatos e pipeline Kanban. Next.js + NestJS com dados mock por organização.',
      imgs: ['1.webp', '2.webp', '3.webp'],
      folder: 'projeto25',
    },
    26: {
      link: 'https://techshop-store-blond.vercel.app',
      en: 'TechShop e-commerce demo: dark storefront, category filters, cart and simulated checkout. Catalog with mock products. Next.js + NestJS.',
      pt: 'Demo e-commerce TechShop: vitrine dark, filtros por categoria, carrinho e checkout simulado. Catálogo com produtos mock. Next.js + NestJS.',
      imgs: ['1.webp', '2.webp', '3.webp'],
      folder: 'projeto26',
    },
    28: {
      link: 'https://trello-kanban-three.vercel.app',
      en: 'BoardFlow Kanban boards: favorites, board workspace, lists and cards with detail modal. REST CRUD productivity demo. Next.js + NestJS.',
      pt: 'BoardFlow — quadros Kanban: favoritos, workspace, listas e cards com modal de detalhes. Demo de produtividade com CRUD REST. Next.js + NestJS.',
      imgs: ['1.webp', '2.webp', '3.webp'],
      folder: 'projeto28',
    },
    29: {
      link: 'https://realtime-hub-nine.vercel.app',
      en: 'Realtime Hub with Socket.IO: multi-room chat, collaborative editor with live cursors, and push notification feed. NestJS + Next.js.',
      pt: 'Realtime Hub com Socket.IO: chat multi-salas, editor colaborativo com cursores ao vivo e feed de notificações. NestJS + Next.js.',
      imgs: ['1.webp', '2.webp', '3.webp'],
      folder: 'projeto29',
    },
    30: {
      link: 'https://netflix-streaming.vercel.app',
      en: 'NovaStream — original streaming UI demo (React + Vite): hero, Top 10, category rows, search and fictional titles with SVG posters.',
      pt: 'NovaStream — demo original de UI de streaming (React + Vite): hero, Top 10, carrosséis, busca e títulos fictícios com posters SVG.',
      imgs: ['1.webp', '2.webp', '3.webp', '4.webp', '5.webp'],
      folder: 'projeto30',
    },
    17: {
      link: 'projetos/mario-platformer.html',
      en: 'Pixel Hop — original React 2D platformer: jump, collect coins, defeat enemies and chase high scores.',
      pt: 'Pixel Hop — platformer 2D original em React: pule, colete moedas, derrote inimigos e busque high scores.',
      imgs: ['1.webp'],
      folder: 'projeto17',
    },
  };

  for (const [file, lang] of [
    ['upload/projetos.json', 'en'],
    ['upload/projetos.pt.json', 'pt'],
  ]) {
    const full = path.join(ROOT, file);
    const j = JSON.parse(fs.readFileSync(full, 'utf8'));
    for (const p of j.projetos) {
      const u = map[p.id];
      if (!u) continue;
      p.link = u.link;
      p.descricao = u[lang];
      p.imagens = [...u.imgs];
      p.loadedImages = u.imgs.map((f) => `upload/${u.folder}/${f}`);
    }
    fs.writeFileSync(full, JSON.stringify(j, null, 2) + '\n');
    console.log('patched', file);
  }
}

async function main() {
  const server = await startStaticServer();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEW,
    deviceScaleFactor: 2,
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();
  await captureAll(page);
  await capturePixelHop(browser);
  await browser.close();
  server.close();
  patchPortfolioJson();
  console.log('\nDONE_CAPTURE_V2');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
