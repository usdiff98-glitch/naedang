import type { APIRoute } from 'astro';
import { absoluteUrl, withBase } from '../lib/urls';

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL('https://usdiff98-glitch.github.io');
  const sitemap = absoluteUrl('/sitemap-index.xml', origin);
  return new Response(`User-agent: *\nAllow: ${withBase('/')}\n\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
