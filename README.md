# 내당한우 內堂 — website

A one-page, Korean-language website for **내당한우**, a hanwoo grill restaurant with its own butcher shop
(정육점) across the road from 홍주읍성 in 홍성, 충남. It is built with Astro and Tailwind CSS v4 and
exported as a plain static site: HTML, CSS, a small script, WebP photos and self-hosted fonts.

- Content comes only from the verified research in [`docs/research.md`](docs/research.md). Every fact
  on the page is defined once in [`src/data/restaurant.ts`](src/data/restaurant.ts).
- Photos are the restaurant's own Naver Place uploads (`naver_biz_*`). Visitor-blog photos are never used.

## Run it locally

Requires Node.js 22.12 or newer.

```bash
npm install
npm run dev          # dev server on http://localhost:4327
npm run build        # static site in dist/
npm run preview      # serve dist/ on http://localhost:4327
npm run preview -- --port 4328   # same, if the dev server is already using 4327
```

`npm run dev` and `npm run build` first run `npm run fonts`, which re-subsets the web fonts to the
characters currently used in `src/`, so edited copy never falls back to a system font.

## Deploy

The live site is GitHub Pages: <https://usdiff98-glitch.github.io/naedang/>.
Astro is configured with `base: '/naedang'` so pages and assets resolve under that subpath.
Pushes to `main` build and deploy through [`.github/workflows/pages.yml`](.github/workflows/pages.yml).

`dist/` can also go on any other static host (Netlify, Vercel, Cloudflare Pages, S3, or a plain
web server). Use `npm run build` as the build command and `dist` as the output directory. `404.html`
is included, and most hosts pick it up automatically.

Set `SITE_URL` to the production origin (scheme and host, no path) at build time. Together with
`base`, it is used for the canonical URL, Open Graph URLs, JSON-LD, `sitemap-index.xml` and `robots.txt`:

```bash
SITE_URL=https://usdiff98-glitch.github.io npm run build
```

The default origin is `https://usdiff98-glitch.github.io`. Naver lists `https://내당한우.com`
(`xn--220b26bv35ai0n.com`) as the restaurant's homepage, but on 2026-09-27 it only showed a hosting
parking page.

## What's on the page

The page is deliberately text-light (the owner's request, 2026-09-27): no intro prose, descriptive
paragraphs, long captions or quotes. Photos carry the mood.

| # | Anchor | Section | Content |
|---|---|---|---|
| — | `#top` | Hero | 內堂 wordmark and name, call and menu buttons, hours/break/holiday strip |
| 01 | `#menu` | 차림표 | Menu names with weights and prices (Naver, 2026-04-16), seasonal tags and the price date; the menu-board photo and three dish photos |
| 02 | `#signature` | 오늘뭐먹지 | Photos of the signature platter; 부채·치마·갈비, 150g 45,000원 and the 등심 substitution note |
| 03 | `#visit` | 오시는 길 | Address with a copy button, tap-to-call number, one-line reservation note, hours table, Naver and Kakao map links; entrance and courtyard photos |

On phones, a bottom action bar ("전화 예약" / "길찾기") appears after the hero, and the header menu
opens as a full-screen dialog.

## Project structure

```text
docs/research.md            verified facts with sources — the only content source
src/data/restaurant.ts      every fact on the site, plus verified facts kept for removed sections
src/data/nav.ts             section ids, labels and numbering
src/data/glyphs.ts          vector outlines for 內 and 堂 (wordmark, seal, icons)
src/components/             one component per section, plus Photo, Seal and HanjaMark
src/components/StructuredData.astro   Restaurant JSON-LD built from restaurant.ts
src/layouts/BaseLayout.astro          <head>: SEO, Open Graph, icons, manifest
src/pages/index.astro       the page; 404.astro; robots.txt.ts
src/scripts/site.ts         header, mobile menu, scroll reveal, action bar, copy address
src/styles/                 Tailwind theme (먹 / 한지 / gold / seal palette) and generated fonts.css
src/assets/photos/          EXIF-stripped Naver Place photos (WebP variants are made at build)
public/                     fonts, favicons, OG image, manifest, 한지 and ink textures
scripts/                    asset generators and QA tools (see below)
```

## Scripts

| Command | What it does |
|---|---|
| `npm run fonts` | Subsets Noto Serif KR (variable 300–500) and Pretendard to the characters used in `src/`, writing `public/fonts/` and `src/styles/fonts.css`. Runs automatically before `dev` and `build` |
| `npm run check` | `astro check` (TypeScript and template diagnostics) |
| `npm run check:overflow -- <url>` | Fails if the page scrolls sideways at 11 widths from 320 to 1920 px |
| `npm run screenshots -- <url> <outDir> [ids…]` | Screenshots each section at desktop (1440 px) and mobile (390 px) sizes, plus the open mobile menu |
| `npm run brand-assets` | Regenerates favicons, app icons, the manifest and `og.jpg` |
| `node scripts/generate-textures.mjs` | Regenerates the tileable 한지 and ink textures in `public/tex/` |
| `node scripts/prepare-photos.mjs <images-dir>` | Copies the `naver_biz_*` photos from the asset tarball into `src/assets/photos` with EXIF/GPS removed. It skips `visitor_blog_*` |

The Playwright-based scripts use Playwright's Chromium. Set `CHROME_PATH` to use an installed
Chrome instead.

## Photos

- Of the 21 `naver_biz_*` uploads, 20 were prepared; 11 are on the page. The 2019 liquor-price board
  (`naver_biz_01`) was left out because its prices are out of date. Unused prepared photos stay in
  `src/assets/photos` for later but are not shipped, because Astro only emits imported images.
- Orientation is fixed and all metadata, including GPS, is removed. At build time Astro creates WebP
  versions at 240–1000 px. The hero photo loads eagerly with `fetchpriority="high"`, and the others
  are lazy-loaded with correct `sizes`.
- The three `visitor_blog_*` photos belong to their bloggers. They are not in the repo (`uploads/` is
  git-ignored) and are referenced nowhere.
- The research notes that the owner's permission should be confirmed before publishing the Naver
  Place photos.

## Content rules

- Keep on-page text to the essentials: name, section titles, menu names with weights and prices,
  hours/break/holidays, address, phone, a one-line reservation note and map links.
- Add or change facts only in `src/data/restaurant.ts`, and only when they are backed by
  `docs/research.md` or confirmed by the restaurant.
- Do not claim a 1++ grade, 암소, 홍성한우 brand certification, a founding year or awards. None of these
  is confirmed.
- Quotes are the owner's own words from the Naver Place introduction and the old homepage. They are
  captioned as "사장님 인사말" or "사장님 소개글" with the source (네이버 플레이스 or 예전 홈페이지).

## Facts left out or flagged

Removed to keep the page text-light (owner's request): the intro, the 상차림 sides, rooms, the butcher
shop and packaging, TV appearances, owner quotes, parking, nearby sights, the drinks note and the live
open/closed badge. Their verified facts are still in `src/data/restaurant.ts` (`quotes`, `broadcasts`,
`tableExtras`, `packaging`, `hongjuFortress`, `info.parking`), so they can be restored.

These are not on the site because the sources are unconfirmed or conflict:

- **Grade and sourcing:** "1++", "1등급만" and "서산 목장" appear in one blog only; "암소만" is on 식신
  only; nothing supports 홍성한우 brand certification. The menu labels the meat "모두 한우", matching
  the menu board ("한우만 취급").
- **Free parking ticket:** most reviews say the restaurant's ticket makes the public lot free, but one
  says the lot is paid. If parking returns to the page, name the lot (홍주성 역사공원 옆 공영주차장) and
  ask visitors to confirm the fee or ticket by phone.
- **Liquor and drink prices:** these come only from a 2019 board, so drinks are not listed.
- **Founding year:** the 1994-08-12 permit date may belong to the butcher shop, so the site makes no
  "since" claim.
- **Owner name:** 서용희 comes from the old homepage and may be out of date, so no name is shown.
- **Other omissions:** Naver ratings and review counts (they change); the celebrity "사인 터널" and 신동엽's
  return visit (blog anecdotes); extras mentioned only by reviewers (천엽, 콘치즈, 산양삼, 수정과…);
  room count and seat numbers, butcher prices and last-order time (unknown); Instagram (none found).
- **Separate 별관 listing:** the Naver listing at 문화로 146 is not given as a second address.

These are on the site but worth confirming with the restaurant:

- **Closing time:** 22:00 follows Naver, the tourism data and most blogs. One 2025 blog says 21:30.
- **Seasonal tag:** "겨울 한정" for 소면 is from Naver only.
- **Kakao map link:** no Kakao place ID was found, so the link searches "홍성 내당한우". A search for
  "내당한우" alone also returns unrelated shops in 대구 and 서울.
