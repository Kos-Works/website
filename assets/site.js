(() => {
  const root = document.documentElement;
  const KEY = 'prefers-theme';
  const safe = (fn) => { try { return fn(); } catch (e) {} };

  // Theme toggle (dark is the default; the inline head script sets the initial value).
  // The label names the action, so state is never conveyed by colour or icon alone.
  const btn = document.getElementById('themeToggle');
  if (btn) {
    const label = () => { btn.textContent = root.dataset.theme === 'light' ? 'Dark theme' : 'Light theme'; };
    label();
    btn.addEventListener('click', () => {
      const next = root.dataset.theme === 'light' ? 'dark' : 'light';
      root.dataset.theme = next;
      safe(() => localStorage.setItem(KEY, next));
      label();
    });
  }


  // Mobile navigation: a disclosure button that is only shown (and the menu only collapsed) when JS runs
  const menuBtn = document.getElementById('menuToggle');
  const siteNav = document.getElementById('siteNav');
  const header = document.querySelector('.site-header');
  if (menuBtn && siteNav && header) {
    const mq = matchMedia('(max-width: 640px)');
    const setOpen = (open, returnFocus) => {
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menuBtn.textContent = open ? 'Close' : 'Menu';
      header.classList.toggle('nav-open', open);
      if (!open && returnFocus) menuBtn.focus();
    };
    const sync = () => {
      menuBtn.hidden = !mq.matches;
      header.classList.toggle('js-nav', mq.matches);
      setOpen(false);
    };
    sync();
    mq.addEventListener('change', sync);
    menuBtn.addEventListener('click', () => setOpen(menuBtn.getAttribute('aria-expanded') !== 'true'));
    siteNav.addEventListener('click', (e) => { if (e.target.closest('a') && mq.matches) setOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && header.classList.contains('nav-open')) setOpen(false, true);
    });
  }

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Featured projects cycle through their images (off for reduced motion; paused on hover and focus)
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('[data-cycle]').forEach((box, n) => {
      const imgs = box.querySelectorAll('img');
      if (imgs.length < 2) return;
      let i = 0, paused = false;
      const card = box.closest('a') || box;
      ['mouseenter', 'focusin'].forEach((t) => card.addEventListener(t, () => { paused = true; }));
      ['mouseleave', 'focusout'].forEach((t) => card.addEventListener(t, () => { paused = false; }));
      setTimeout(() => setInterval(() => {
        if (paused || document.hidden) return;
        imgs[i].classList.remove('is-active');
        i = (i + 1) % imgs.length;
        imgs[i].classList.add('is-active');
      }, 4000), n * 1800);
    });
  }

  // Swipe support for carousels (reuses the existing prev/next buttons)
  document.querySelectorAll('.carousel').forEach((c) => {
    const prev = c.querySelector('[id$="Prev"]'), next = c.querySelector('[id$="Next"]');
    let sx = null;
    c.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
    c.addEventListener('touchend', (e) => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 50) (dx < 0 ? next : prev)?.click();
    }, { passive: true });
  });
})();
