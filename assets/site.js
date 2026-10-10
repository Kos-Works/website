(() => {
  const root = document.documentElement;
  const KEY = 'prefers-theme';
  const safe = (fn) => { try { return fn(); } catch (e) {} };

  // Theme toggle (dark is the default; the head script sets the initial value)
  const btn = document.getElementById('themeToggle');
  if (btn) {
    btn.setAttribute('aria-pressed', String(root.dataset.theme !== 'light'));
    btn.addEventListener('click', () => {
      const next = root.dataset.theme === 'light' ? 'dark' : 'light';
      root.dataset.theme = next;
      safe(() => localStorage.setItem(KEY, next));
      btn.setAttribute('aria-pressed', String(next === 'dark'));
    });
  }

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Header hides on scroll down, returns on scroll up
  const header = document.querySelector('.site-header');
  if (header) {
    let last = window.scrollY, ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        header.classList.toggle('is-hidden', y > last && y > 240);
        last = y; ticking = false;
      });
    }, { passive: true });
  }

  // Scroll reveals (once)
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  } else items.forEach((el) => el.classList.add('in'));

  // Cursor-following image preview on the project index
  const rows = document.querySelectorAll('.row[data-preview]');
  if (rows.length && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    const box = document.createElement('div');
    box.className = 'preview'; box.setAttribute('aria-hidden', 'true');
    const img = document.createElement('img'); img.alt = ''; box.appendChild(img);
    document.body.appendChild(box);
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
    const loop = () => {
      x += (tx - x) * 0.16; y += (ty - y) * 0.16;
      box.style.transform = `translate3d(${x + 24}px, ${y - 100}px, 0) scale(${box.classList.contains('on') ? 1 : .92})`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(loop) : 0;
    };
    rows.forEach((row) => {
      row.addEventListener('mouseenter', (e) => {
        img.src = row.dataset.preview; tx = x = e.clientX; ty = y = e.clientY;
        box.classList.add('on'); if (!raf) raf = requestAnimationFrame(loop);
      });
      row.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; if (!raf) raf = requestAnimationFrame(loop); });
      row.addEventListener('mouseleave', () => box.classList.remove('on'));
    });
  }

  // Featured cards cycle through all of a project's images
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('[data-cycle]').forEach((box, n) => {
      const imgs = box.querySelectorAll('img');
      if (imgs.length < 2) return;
      let i = 0, paused = false;
      const card = box.closest('a') || box;
      card.addEventListener('mouseenter', () => { paused = true; });
      card.addEventListener('mouseleave', () => { paused = false; });
      card.addEventListener('focusin', () => { paused = true; });
      card.addEventListener('focusout', () => { paused = false; });
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
