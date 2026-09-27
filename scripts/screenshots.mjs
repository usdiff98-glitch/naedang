// Captures each section at desktop and mobile sizes, plus the open mobile navigation.
//
// Usage: node scripts/screenshots.mjs [url] [outDir] [sectionIds...]
//   url      default http://localhost:4327/
//   outDir   default ./screenshots
//   sections default: every section in the page plus the footer
//
// Env:
//   CHROME_PATH      use an installed Chrome instead of Playwright's bundled browser
//   SCREENSHOT_TIME  pin the page clock (e.g. 2026-09-26T12:30:00+09:00) for repeatable captures
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const [url = 'http://localhost:4327/', outDir = 'screenshots', ...only] = process.argv.slice(2);
const executablePath = process.env.CHROME_PATH || undefined;
const fixedTime = process.env.SCREENSHOT_TIME ? new Date(process.env.SCREENSHOT_TIME) : null;

const devices = [
  { name: 'desktop', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, isMobile: false },
  { name: 'mobile', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
];

const defaultSections = ['top', 'menu', 'signature', 'visit', 'site-footer'];
const sections = only.length ? only : defaultSections;

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath });

for (const device of devices) {
  const context = await browser.newContext({ ...device, locale: 'ko-KR', timezoneId: 'Asia/Seoul' });
  if (fixedTime) await context.clock.setFixedTime(fixedTime);
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(2600);

  // Walk the page once so lazy images load and reveal animations settle.
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += Math.round(device.viewport.height * 0.6)) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
    await page.waitForTimeout(160);
  }
  await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-in')));
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2400);

  for (const id of sections) {
    const el = page.locator(`#${id}`);
    if (!(await el.count())) {
      console.warn(`skip #${id} (not found)`);
      continue;
    }
    await el.scrollIntoViewIfNeeded();
    await page.evaluate((sectionId) => {
      const header = document.getElementById('site-header');
      const bar = document.getElementById('action-bar');
      const skip = document.querySelector('a[href="#main"]');
      const isHero = sectionId === 'top';
      // display:none rather than visibility — Chrome still paints filtered SVGs inside hidden fixed elements
      // into stitched full-element captures.
      if (header) header.style.display = isHero ? '' : 'none';
      if (bar) bar.style.display = 'none';
      if (skip) skip.style.display = 'none';
      if (isHero) window.scrollTo({ top: 0, behavior: 'instant' });
    }, id);
    await page.waitForTimeout(700);
    const file = path.join(outDir, `${device.name}_${id}.png`);
    await el.screenshot({ path: file, animations: 'disabled' });
    console.log(file);
  }

  if (device.isMobile && !only.length) {
    await page.evaluate(() => {
      const header = document.getElementById('site-header');
      if (header) header.style.display = '';
      document.getElementById('menu')?.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(400);
    // The header hides on scroll-down; a small scroll up brings it back so it can be tapped.
    await page.evaluate(() => window.scrollBy({ top: -40, behavior: 'instant' }));
    await page.waitForTimeout(700);
    await page.tap('[data-menu-open]');
    await page.waitForTimeout(800);
    const file = path.join(outDir, `${device.name}_nav-open.png`);
    await page.screenshot({ path: file, animations: 'disabled' });
    console.log(file);
  }
  await context.close();
}

await browser.close();
