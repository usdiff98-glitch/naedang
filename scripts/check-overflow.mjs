// Fails if the page is wider than the viewport at common phone/tablet/desktop widths.
// On phones, horizontal overflow makes the browser zoom the whole page out.
//
// Usage: node scripts/check-overflow.mjs [url]   (default http://localhost:4327/)
import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://localhost:4327/';
const widths = [320, 360, 375, 390, 412, 430, 768, 1024, 1280, 1440, 1920];

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
let failed = false;
for (const width of widths) {
  const mobile = width < 1024;
  const context = await browser.newContext({ viewport: { width, height: 800 }, isMobile: mobile, hasTouch: mobile });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  const { innerWidth, scrollWidth } = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  const ok = innerWidth === width && scrollWidth === width;
  failed ||= !ok;
  console.log(`${String(width).padStart(4)}px  ${ok ? 'ok' : `OVERFLOW (layout ${Math.max(innerWidth, scrollWidth)}px)`}`);
  await context.close();
}
await browser.close();
process.exit(failed ? 1 : 0);
