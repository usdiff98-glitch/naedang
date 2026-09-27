declare global {
  interface Window {
    __naedangReady?: boolean;
  }
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initHeader() {
  const header = document.getElementById('site-header');
  const menu = document.getElementById('mobile-menu') as HTMLDialogElement | null;
  if (!header) return;

  let lastY = window.scrollY;
  let ticking = false;

  const update = () => {
    const y = window.scrollY;
    header.dataset.state = y > 24 ? 'solid' : 'top';
    const goingDown = y > lastY + 4;
    const goingUp = y < lastY - 4;
    if (goingDown && y > 520 && !menu?.open) header.dataset.hidden = 'true';
    else if (goingUp || y < 520) header.dataset.hidden = 'false';
    lastY = y;
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  update();

  // Keep the header visible while keyboard users tab through it.
  header.addEventListener('focusin', () => (header.dataset.hidden = 'false'));
}

function initMobileMenu() {
  const menu = document.getElementById('mobile-menu') as HTMLDialogElement | null;
  const openBtn = document.querySelector<HTMLButtonElement>('[data-menu-open]');
  if (!menu || !openBtn) return;

  const setExpanded = (v: boolean) => openBtn.setAttribute('aria-expanded', String(v));

  openBtn.addEventListener('click', () => {
    menu.showModal();
    setExpanded(true);
  });
  menu.querySelector('[data-menu-close]')?.addEventListener('click', () => menu.close());
  menu.addEventListener('close', () => setExpanded(false));
  menu.querySelectorAll<HTMLAnchorElement>('[data-menu-link]').forEach((link) =>
    link.addEventListener('click', () => menu.close()),
  );
  window.matchMedia('(min-width: 64rem)').addEventListener('change', (e) => {
    if (e.matches && menu.open) menu.close();
  });
}

function initActiveSection() {
  const links = document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]');
  const sections = [...new Set([...links].map((l) => l.dataset.navLink))]
    .map((id) => (id ? document.getElementById(id) : null))
    .filter((el): el is HTMLElement => !!el);
  if (!sections.length) return;

  const setActive = (id: string | null) =>
    links.forEach((l) => {
      if (l.dataset.navLink === id) l.setAttribute('aria-current', 'true');
      else l.removeAttribute('aria-current');
    });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  sections.forEach((s) => io.observe(s));

  const hero = document.getElementById('top');
  if (hero) {
    new IntersectionObserver(([e]) => e.isIntersecting && setActive(null), {
      rootMargin: '-45% 0px -50% 0px',
    }).observe(hero);
  }
}

function initReveal() {
  const items = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    },
    // Edge-based rather than ratio-based: a ratio threshold never fires in time for
    // blocks much taller than the viewport (the menu card on phones), leaving a blank band.
    { threshold: 0, rootMargin: '0px 0px -8% 0px' },
  );
  items.forEach((el) => io.observe(el));
}

function initActionBar() {
  const bar = document.getElementById('action-bar');
  const hero = document.getElementById('top');
  const footer = document.getElementById('site-footer');
  if (!bar || !hero) return;

  let pastHero = false;
  let atFooter = false;
  const sync = () => (bar.dataset.visible = String(pastHero && !atFooter));

  new IntersectionObserver(([e]) => {
    pastHero = !e.isIntersecting;
    sync();
  }, { rootMargin: '-35% 0px 0px 0px' }).observe(hero);

  if (footer) {
    new IntersectionObserver(([e]) => {
      atFooter = e.isIntersecting;
      sync();
    }).observe(footer);
  }
}

function initCopy() {
  document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
    const label = btn.querySelector('[data-copy-label]');
    const original = label?.textContent ?? '';
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy ?? '');
        if (label) label.textContent = '복사했어요';
        btn.dataset.copied = 'true';
      } catch {
        if (label) label.textContent = '복사하지 못했어요';
      }
      setTimeout(() => {
        if (label) label.textContent = original;
        delete btn.dataset.copied;
      }, 2200);
    });
  });
}

initHeader();
initMobileMenu();
initActiveSection();
initReveal();
initActionBar();
initCopy();
window.__naedangReady = true;

export {};
