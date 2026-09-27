// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Production origin (no path). The project site is https://usdiff98-glitch.github.io/naedang/.
// Override with SITE_URL when deploying elsewhere; keep `base` in sync.
const site = process.env.SITE_URL ?? 'https://usdiff98-glitch.github.io';
const base = '/naedang';

// Root-absolute url() in imported CSS (fonts, textures) is not rewritten by Vite.
// Prefix those that do not already include `base`.
/**
 * @param {string} basePath
 * @returns {import('vite').Plugin}
 */
function prefixRootCssUrls(basePath) {
  const normalized = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
  return {
    name: 'prefix-root-css-urls',
    enforce: 'post',
    /**
     * @param {string} code
     * @param {string} id
     */
    transform(code, id) {
      if (!normalized || normalized === '/' || !id.split('?')[0].endsWith('.css')) return null;
      let changed = false;
      const next = code.replace(/url\(\s*(['"]?)(\/(?!\/)[^'")]+)\1\s*\)/g, (match, quote, url) => {
        if (url === normalized || url.startsWith(`${normalized}/`)) return match;
        changed = true;
        return `url(${quote}${normalized}${url}${quote})`;
      });
      return changed ? { code: next, map: null } : null;
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site,
  base,
  output: 'static',
  // One page with ~20 KB of CSS: inlining removes the only render-blocking request.
  build: { inlineStylesheets: 'always' },
  server: { host: true, port: 4327 },
  devToolbar: { enabled: false },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
  ],
  vite: {
    plugins: [tailwindcss(), prefixRootCssUrls(base)],
  },
});
