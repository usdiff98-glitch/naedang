/** Paths under Astro `base`, for the GitHub Pages project site (`/naedang`). */

const basePrefix = () => import.meta.env.BASE_URL.replace(/\/$/, '');

/** Origin-absolute path, e.g. `/naedang/og.jpg` or `/naedang/#menu`. */
export function withBase(path = '/'): string {
  if (/^https?:\/\//.test(path)) return path;

  const hashAt = path.indexOf('#');
  const hash = hashAt >= 0 ? path.slice(hashAt) : '';
  const pathname = hashAt >= 0 ? path.slice(0, hashAt) : path;
  const normalized = !pathname || pathname === '/' ? '/' : pathname.startsWith('/') ? pathname : `/${pathname}`;
  const base = basePrefix();

  let prefixed = normalized;
  if (base && base !== '/') {
    if (normalized === base || normalized.startsWith(`${base}/`)) prefixed = normalized;
    else if (normalized === '/') prefixed = `${base}/`;
    else prefixed = `${base}${normalized}`;
  }

  return `${prefixed}${hash}`;
}

/** Absolute URL on `site`, with `base` applied to site-relative paths. */
export function absoluteUrl(path: string, site: URL | string): string {
  if (/^https?:\/\//.test(path)) return path;
  return new URL(withBase(path), site).href;
}
