/**
 * Preprocess portfolio images → WebP (card + gallery sizes).
 * Replaces heavy PNG/JPG under upload/ and rewrites projetos*.json.
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const UPLOAD = path.join(ROOT, 'upload');

const CARD_W = 800; // carousel / card thumb
const GALLERY_W = 1280; // modal gallery
const QUALITY = 72;

const IMAGE_EXT = /\.(png|jpe?g|webp)$/i;

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (IMAGE_EXT.test(ent.name)) out.push(p);
  }
  return out;
}

function rel(p) {
  return path.relative(ROOT, p).split(path.sep).join('/');
}

async function toWebp(srcPath, destPath, width) {
  await sharp(srcPath)
    .rotate()
    .resize({ width, height: Math.round(width * 0.75), fit: 'inside', withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 6 })
    .toFile(destPath);
}

async function main() {
  const files = walk(UPLOAD).filter((f) => !f.includes(`${path.sep}opt${path.sep}`));
  let before = 0;
  let after = 0;
  const renameMap = new Map(); // old basename -> new basename within same folder

  console.log(`Found ${files.length} images`);

  for (const file of files) {
    before += fs.statSync(file).size;
    const dir = path.dirname(file);
    const base = path.basename(file, path.extname(file));
    const ext = path.extname(file).toLowerCase();

    // Skip already-small webp under ~40KB unless from screenshot batch we want re-encode
    const webpOut = path.join(dir, `${base}.webp`);

    try {
      // Prefer gallery-sized webp as canonical asset
      await toWebp(file, webpOut, GALLERY_W);
      const size = fs.statSync(webpOut).size;
      after += size;

      const oldName = path.basename(file);
      const newName = `${base}.webp`;
      renameMap.set(`${path.basename(dir)}::${oldName}`, newName);

      // Remove original if different from webp
      if (ext !== '.webp' || path.resolve(file) !== path.resolve(webpOut)) {
        if (ext !== '.webp') {
          fs.unlinkSync(file);
          console.log(`✓ ${rel(file)} → ${newName} (${Math.round(size / 1024)}KB)`);
        } else if (file !== webpOut) {
          // overwritten in place via temp — sharp can't write same file sometimes
          console.log(`✓ recompressed ${rel(webpOut)} (${Math.round(size / 1024)}KB)`);
        } else {
          console.log(`✓ ${rel(webpOut)} (${Math.round(size / 1024)}KB)`);
        }
      } else {
        console.log(`✓ ${rel(webpOut)} (${Math.round(size / 1024)}KB)`);
      }
    } catch (err) {
      console.error('FAIL', rel(file), err.message);
      after += fs.existsSync(file) ? fs.statSync(file).size : 0;
    }
  }

  // Patch JSON image lists to .webp
  for (const jsonName of ['projetos.json', 'projetos.pt.json']) {
    const jsonPath = path.join(UPLOAD, jsonName);
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    for (const p of data.projetos) {
      if (!Array.isArray(p.imagens)) continue;
      p.imagens = p.imagens.map((img) => {
        if (/^https?:\/\//i.test(img)) return img;
        const webp = img.replace(/\.(png|jpe?g)$/i, '.webp');
        const full = path.join(UPLOAD, p.pasta, webp);
        if (fs.existsSync(full)) return webp;
        // if already webp or missing, keep
        return img.endsWith('.webp') ? img : webp;
      });
      // drop loadedImages cache or rebuild
      if (p.loadedImages) {
        p.loadedImages = p.imagens.map((img) =>
          /^https?:\/\//i.test(img) ? img : `upload/${p.pasta}/${img}`
        );
      }
    }
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log('patched', jsonName);
  }

  // Profile photo
  const photoDir = path.join(UPLOAD, 'foto-pessoal');
  if (fs.existsSync(photoDir)) {
    for (const f of fs.readdirSync(photoDir)) {
      if (!IMAGE_EXT.test(f)) continue;
      const src = path.join(photoDir, f);
      const base = path.basename(f, path.extname(f));
      const dest = path.join(photoDir, `${base}.webp`);
      await sharp(src)
        .rotate()
        .resize({ width: 800, withoutEnlargement: true })
        .webp({ quality: 78, effort: 6 })
        .toFile(dest + '.tmp');
      // if source was jpg, remove after
      fs.renameSync(dest + '.tmp', dest);
      if (!f.endsWith('.webp')) {
        try { fs.unlinkSync(src); } catch { /* keep */ }
      }
      console.log('photo', `${base}.webp`, Math.round(fs.statSync(dest).size / 1024) + 'KB');
    }
  }

  console.log(`\nBefore ~${Math.round(before / 1024)}KB → After ~${Math.round(after / 1024)}KB`);
  console.log(`Saved ~${Math.round((before - after) / 1024)}KB (${Math.round((1 - after / before) * 100)}%)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
