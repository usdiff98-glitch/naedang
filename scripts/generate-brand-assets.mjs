// Generates the favicon set, app icons, web manifest and Open Graph image in public/.
//
// Usage: CHROME_PATH=/path/to/chrome node scripts/generate-brand-assets.mjs
//   CHROME_PATH is optional when Playwright's bundled Chromium is installed.
//
// The seal is built from the glyph outlines in src/data/glyphs.ts, so no font is
// needed for the icons. The OG image is rendered in Chromium so the Korean web
// fonts match the site exactly.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';

const root = path.resolve('.');
const pub = (f) => path.join(root, 'public', f);

// Chromium blocks file:// fonts (CORS) and file:// subresources from setContent pages,
// so project files are served from a fake same-origin host via request interception.
const ORIGIN = 'https://brand-assets.local';
const fileUrl = (p) => `${ORIGIN}/${p}`;

const C = {
  ink950: '#0d0c0b',
  ink900: '#141311',
  hanji50: '#fbf8f2',
  hanji100: '#f4efe5',
  hanji300: '#dcd0bb',
  hanji400: '#b9ad98',
  gold400: '#c6a56d',
  seal: '#ad3a2b',
};

const glyphSrc = await readFile(path.join(root, 'src/data/glyphs.ts'), 'utf8');
const glyph = (name) => glyphSrc.match(new RegExp(`${name} = '([^']+)'`))[1];
const NAE = glyph('GLYPH_NAE');
const DANG = glyph('GLYPH_DANG');

// Square 內 seal for small sizes: no roughening filter so edges stay crisp at 16px.
// 內 spans x 105–935, y 31–973 in its 1000-unit em box.
const squareSeal = ({ bg } = {}) => {
  const s = 0.78;
  const tx = 500 - 520 * s;
  const ty = 500 - 502 * s;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">${
    bg ? `<rect width="1000" height="1000" fill="${bg}"/>` : ''
  }<mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000"><rect width="1000" height="1000" fill="#fff"/><path fill="#000" transform="translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${s})" d="${NAE}"/></mask><rect x="20" y="20" width="960" height="960" rx="120" fill="${C.seal}" mask="url(#m)"/></svg>`;
};

// Tall 內堂 seal, same geometry as src/components/Seal.astro.
const tallSeal = (id = 's') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1240 2180">
<defs>
<filter id="${id}-r" x="-4%" y="-4%" width="108%" height="108%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="22" xChannelSelector="R" yChannelSelector="G"/></filter>
<mask id="${id}-m" maskUnits="userSpaceOnUse" x="0" y="0" width="1240" height="2180"><rect width="1240" height="2180" fill="#fff"/><g fill="#000"><path transform="translate(128 96) scale(0.985)" d="${NAE}"/><path transform="translate(120 1120) scale(0.985)" d="${DANG}"/></g></mask>
</defs>
<g filter="url(#${id}-r)"><rect x="18" y="18" width="1204" height="2144" rx="46" fill="${C.seal}" mask="url(#${id}-m)"/></g>
</svg>`;

// --- favicon.svg + favicon.ico (16/32/48, PNG-in-ICO) ---
const faviconSvg = squareSeal();
await writeFile(pub('favicon.svg'), faviconSvg);

const icoSizes = [16, 32, 48];
const pngs = await Promise.all(
  icoSizes.map((s) => sharp(Buffer.from(faviconSvg)).resize(s, s).png().toBuffer()),
);
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(pngs.length, 4);
let offset = 6 + 16 * pngs.length;
const entries = pngs.map((png, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(icoSizes[i] % 256, 0);
  e.writeUInt8(icoSizes[i] % 256, 1);
  e.writeUInt8(0, 2);
  e.writeUInt8(0, 3);
  e.writeUInt16LE(1, 4);
  e.writeUInt16LE(32, 6);
  e.writeUInt32LE(png.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += png.length;
  return e;
});
await writeFile(pub('favicon.ico'), Buffer.concat([header, ...entries, ...pngs]));

// --- App icons and OG image, rendered in Chromium ---
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
const page = await browser.newPage({ deviceScaleFactor: 1 });

let html = '';
await page.route(`${ORIGIN}/**`, (route) => {
  const { pathname } = new URL(route.request().url());
  if (pathname === '/__render.html') {
    return route.fulfill({ body: html, contentType: 'text/html; charset=utf-8' });
  }
  const file = path.join(root, decodeURIComponent(pathname));
  if (!file.startsWith(root)) return route.abort();
  return route.fulfill({ path: file });
});
const render = async (markup, { width, height }) => {
  html = markup;
  await page.setViewportSize({ width, height });
  await page.goto(`${ORIGIN}/__render.html`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);
  return page.screenshot({ type: 'png' });
};

// Red seal on hanji; the seal stays inside the central 60% so maskable crops keep it whole.
const iconHtml = (size) => `<!doctype html><html><body style="margin:0">
<div style="width:${size}px;height:${size}px;display:grid;place-items:center;background:${C.hanji100} url('${fileUrl('public/tex/hanji.svg')}');background-size:${Math.round(size * 1.1)}px">
<div style="height:${Math.round(size * 0.6)}px;aspect-ratio:1240/2180">${tallSeal()}</div>
</div></body></html>`;

for (const [file, size] of [
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
]) {
  const shot = await render(iconHtml(size), { width: size, height: size });
  await sharp(shot).png({ palette: true, quality: 90, compressionLevel: 9 }).toFile(pub(file));
}

const photo = fileUrl('src/assets/photos/salchisal-table.jpg');
const ogHtml = `<!doctype html><html lang="ko"><head>
<link rel="stylesheet" href="${fileUrl('node_modules/@fontsource-variable/noto-serif-kr/index.css')}">
<link rel="stylesheet" href="${fileUrl('node_modules/pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css')}">
<style>
  * { box-sizing: border-box; margin: 0; }
  body { width: 1200px; height: 630px; overflow: hidden; background: ${C.ink900} url('${fileUrl('public/tex/ink.svg')}'); background-size: 400px; color: ${C.hanji100}; font-family: 'Pretendard Variable', sans-serif; word-break: keep-all; }
  .wash { position: absolute; inset: 0; background: radial-gradient(55% 70% at 30% 45%, rgba(174,140,85,.10), transparent 70%); }
  .photo { position: absolute; top: 0; right: 0; width: 540px; height: 630px; background: url('${photo}') 50% 55% / cover; }
  .copy { position: absolute; left: 84px; top: 78px; width: 520px; }
  .eyebrow { display: flex; align-items: center; gap: 16px; color: ${C.gold400}; font-size: 19px; font-weight: 500; letter-spacing: .26em; }
  .eyebrow::before { content: ''; width: 40px; height: 1px; background: currentColor; opacity: .6; }
  .hanja { margin-top: 26px; font-family: 'Noto Serif KR Variable', serif; font-weight: 600; font-size: 184px; line-height: .95; letter-spacing: .02em; color: ${C.hanji50}; }
  .name { margin-top: 26px; display: flex; align-items: center; gap: 20px; font-family: 'Noto Serif KR Variable', serif; font-size: 38px; font-weight: 500; letter-spacing: .3em; }
  .name i { width: 44px; height: 1px; background: rgba(244,239,229,.35); }
  .name span { font-family: 'Pretendard Variable', sans-serif; font-size: 21px; font-weight: 400; letter-spacing: .18em; color: ${C.hanji300}; }
  .meta { position: absolute; left: 84px; bottom: 64px; display: flex; gap: 14px; font-size: 21px; letter-spacing: .04em; color: ${C.hanji300}; font-variant-numeric: tabular-nums; }
  .meta b { font-weight: 500; color: ${C.hanji50}; }
  .meta em { font-style: normal; color: ${C.hanji400}; }
  .seal { position: absolute; left: 612px; bottom: 44px; height: 132px; aspect-ratio: 1240/2180; filter: drop-shadow(0 6px 18px rgba(0,0,0,.35)); }
</style></head><body>
<div class="wash"></div>
<div class="photo"></div>
<div class="copy">
  <p class="eyebrow">충남 홍성 · 홍주읍성 맞은편</p>
  <p class="hanja">內堂</p>
  <p class="name">내당한우<i></i><span>한우생고기 전문점</span></p>
</div>
<p class="meta"><span>예약</span><b>041-632-0156</b><em>·</em><span>매일 11:00–22:00</span></p>
<div class="seal">${tallSeal('og')}</div>
</body></html>`;

const og = await render(ogHtml, { width: 1200, height: 630 });
await sharp(og).jpeg({ quality: 86, mozjpeg: true }).toFile(pub('og.jpg'));

await browser.close();

// --- Web app manifest ---
const base = '/naedang';
const manifest = {
  name: '내당한우 內堂',
  short_name: '내당한우',
  description: '충남 홍성 홍주읍성 맞은편 한우생고기 전문점',
  lang: 'ko',
  start_url: `${base}/`,
  display: 'browser',
  background_color: C.hanji100,
  theme_color: C.ink900,
  icons: [
    { src: `${base}/icon-192.png`, sizes: '192x192', type: 'image/png' },
    { src: `${base}/icon-512.png`, sizes: '512x512', type: 'image/png' },
    { src: `${base}/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
};
await writeFile(pub('site.webmanifest'), `${JSON.stringify(manifest, null, 2)}\n`);

console.log('Wrote favicon.svg, favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png, og.jpg, site.webmanifest');
