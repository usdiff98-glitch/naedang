// Generates the tileable paper textures in public/tex/.
// Usage: node scripts/generate-textures.mjs
import { mkdir, writeFile } from 'node:fs/promises';

const SIZE = 400;

function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (n) => Math.round(n * 10) / 10;

// Random curved strands; each is repeated across tile edges so the tile is seamless.
function fibers({ seed, count, colors, minLen, maxLen, width, opacity }) {
  const rand = mulberry32(seed);
  const paths = [];
  for (let i = 0; i < count; i++) {
    const x = rand() * SIZE;
    const y = rand() * SIZE;
    const angle = rand() * Math.PI * 2;
    const len = minLen + rand() * (maxLen - minLen);
    const bend = (rand() - 0.5) * len * 0.7;
    const ex = x + Math.cos(angle) * len;
    const ey = y + Math.sin(angle) * len;
    const cx = (x + ex) / 2 + Math.cos(angle + Math.PI / 2) * bend;
    const cy = (y + ey) / 2 + Math.sin(angle + Math.PI / 2) * bend;
    const color = colors[Math.floor(rand() * colors.length)];
    const w = r1(width[0] + rand() * (width[1] - width[0]));
    const o = r1(opacity[0] + rand() * (opacity[1] - opacity[0]));
    for (const dx of [-SIZE, 0, SIZE]) {
      for (const dy of [-SIZE, 0, SIZE]) {
        const minX = Math.min(x, ex, cx) + dx;
        const maxX = Math.max(x, ex, cx) + dx;
        const minY = Math.min(y, ey, cy) + dy;
        const maxY = Math.max(y, ey, cy) + dy;
        if (maxX < 0 || minX > SIZE || maxY < 0 || minY > SIZE) continue;
        paths.push(
          `<path d="M${r1(x + dx)} ${r1(y + dy)}Q${r1(cx + dx)} ${r1(cy + dy)} ${r1(ex + dx)} ${r1(ey + dy)}" stroke="${color}" stroke-width="${w}" opacity="${o}"/>`,
        );
      }
    }
  }
  return `<g fill="none" stroke-linecap="round">${paths.join('')}</g>`;
}

// Filter regions must equal the tile, otherwise stitchTiles stitches at the wrong size and seams appear.
const noise = (id, freq, octaves, seed, matrix) =>
  `<filter id="${id}" x="0" y="0" width="100%" height="100%" filterUnits="userSpaceOnUse"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="${octaves}" seed="${seed}" stitchTiles="stitch"/><feColorMatrix values="${matrix}"/></filter>`;

const soft = '<filter id="s" x="0" y="0" width="100%" height="100%" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation=".45"/></filter>';

const hanji = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
<defs>
${noise('g', 0.9, 2, 2, '0 0 0 0 .33 0 0 0 0 .26 0 0 0 0 .17 1.7 0 0 0 -.8')}
${noise('m', 0.0075, 3, 11, '0 0 0 0 .55 0 0 0 0 .45 0 0 0 0 .3 1.5 0 0 0 -.62')}
${soft}
</defs>
<rect width="${SIZE}" height="${SIZE}" filter="url(#m)" opacity=".2"/>
<rect width="${SIZE}" height="${SIZE}" filter="url(#g)" opacity=".18"/>
<g filter="url(#s)">
${fibers({ seed: 7, count: 36, colors: ['#b39c74', '#c4ae88'], minLen: 14, maxLen: 50, width: [0.35, 0.7], opacity: [0.06, 0.14] })}
${fibers({ seed: 19, count: 70, colors: ['#fffbf3', '#fdf6e8'], minLen: 20, maxLen: 90, width: [0.7, 1.6], opacity: [0.35, 0.68] })}
</g>
</svg>`;

const ink = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
<defs>
${noise('g', 0.85, 2, 5, '0 0 0 0 .95 0 0 0 0 .91 0 0 0 0 .84 1.6 0 0 0 -.76')}
${noise('m', 0.007, 3, 13, '0 0 0 0 .8 0 0 0 0 .72 0 0 0 0 .6 1.6 0 0 0 -.7')}
${soft}
</defs>
<rect width="${SIZE}" height="${SIZE}" filter="url(#m)" opacity=".05"/>
<rect width="${SIZE}" height="${SIZE}" filter="url(#g)" opacity=".055"/>
<g filter="url(#s)">
${fibers({ seed: 31, count: 36, colors: ['#e8dcc4', '#c6a56d'], minLen: 20, maxLen: 80, width: [0.4, 1], opacity: [0.03, 0.07] })}
</g>
</svg>`;

await mkdir('public/tex', { recursive: true });
const minify = (s) => s.replace(/\n/g, '');
await writeFile('public/tex/hanji.svg', minify(hanji));
await writeFile('public/tex/ink.svg', minify(ink));
console.log('hanji.svg', minify(hanji).length, 'bytes; ink.svg', minify(ink).length, 'bytes');
