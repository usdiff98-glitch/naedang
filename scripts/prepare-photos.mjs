// Copies the owner-uploaded Naver Place photos into src/assets/photos with
// ASCII file names, auto-orientation and all metadata (EXIF/GPS) stripped.
// Responsive WebP variants are generated later by astro:assets at build time.
//
// Usage: node scripts/prepare-photos.mjs <path-to-extracted-images-dir>
//
// visitor_blog_* photos are copyrighted by their bloggers and must never be
// copied. naver_biz_01 (2019 liquor board) is excluded because its prices are
// outdated.
import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const MAP = {
  '02': 'mul-naengmyeon',
  '03': 'saeusal-grill',
  '04': 'signature-closeup',
  '05': 'saeusal-table',
  '06': 'salchisal-closeup',
  '07': 'saeusal-courtyard',
  '08': 'salchisal-plate',
  '09': 'bibim-naengmyeon',
  '10': 'signature-table',
  '11': 'saeusal-plate',
  '12': 'signature-platter',
  '13': 'menu-board',
  '14': 'salchisal-courtyard',
  '15': 'saeusal-portrait',
  '17': 'exterior-gate',
  '18': 'signature-detail',
  '19': 'salchisal-marbling',
  '20': 'signature-grilled',
  '21': 'salchisal-table',
  '22': 'bibim-naengmyeon-table',
};

const srcDir = process.argv[2];
if (!srcDir) {
  console.error('Usage: node scripts/prepare-photos.mjs <images-dir>');
  process.exit(1);
}
const outDir = path.resolve('src/assets/photos');
await mkdir(outDir, { recursive: true });

const files = await readdir(srcDir);
let count = 0;
for (const file of files) {
  if (file.startsWith('visitor_blog_')) continue;
  const match = file.match(/^naver_biz_(\d{2})_/);
  if (!match) continue;
  const slug = MAP[match[1]];
  if (!slug) continue;

  const out = path.join(outDir, `${slug}.jpg`);
  const info = await sharp(path.join(srcDir, file))
    .rotate()
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(out);
  console.log(`${file} -> ${path.relative(process.cwd(), out)} (${info.width}x${info.height}, ${Math.round(info.size / 1024)} KB)`);
  count++;
}
console.log(`Prepared ${count} photos.`);
