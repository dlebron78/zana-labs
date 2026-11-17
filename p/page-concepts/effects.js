/* effects.js: the effects library.
   Each effect is one small function: it gets the page, switches itself on, and returns a function that switches it off.
   None of them hides content while waiting: a page with every effect off, or with reduced motion,
   shows the same words, photos and buttons, just still.
   No libraries. Scroll effects use the browser's own IntersectionObserver. */

const SLIDE_MS = 5200;    // how long each hero photo stays
const WORD_MS = 2300;     // how long each changing word stays
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const escText = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

/* Show slide i of a hero. Used by the tabs (a visitor picks one) and by the moving hero (the clock picks one). */
export function setSlide(sec, i, byVisitor = false) {
  if (!sec) return;
  sec.querySelectorAll('[data-fx-hero="slides"]').forEach(box => [...box.children].forEach((el, k) => el.classList.toggle('is-on', k === i)));
  sec.querySelectorAll('.zp-tab').forEach((el, k) => { el.classList.toggle('is-on', k === i); el.setAttribute('aria-pressed', k === i); });
  sec.dataset.slide = i;
  if (byVisitor) sec.dispatchEvent(new CustomEvent('zp:slide'));
}

/* 1. Fade and rise. Only parts still below the screen get the waiting state, so nothing you can see ever blinks. */
function rise(root) {
  const els = [...root.querySelectorAll('[data-rise]')], vh = window.innerHeight;
  const done = el => { el.classList.add('zp-go'); el.classList.remove('zp-pre'); io.unobserve(el); setTimeout(() => el.classList.remove('zp-go'), 1600); };
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && done(e.target)), { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
  els.forEach(el => { if (el.getBoundingClientRect().top > vh * 0.96) { el.classList.add('zp-pre'); io.observe(el); } });
  return () => { io.disconnect(); els.forEach(el => el.classList.remove('zp-pre', 'zp-go')); };
}

/* 2. The Book button that follows you. It waits until the hero's own buttons have scrolled away,
      and steps aside where it would only get in the way: over the schedule (every row has a Book button) and over the footer. */
function book(root, env) {
  const el = root.querySelector('[data-fx-book]'); if (!el) return null;
  const start = root.querySelector('[data-follow-start]'), sched = root.querySelector('.zp-sched'), foot = root.querySelector('.zp-foot');
  let past = !start; const hide = new Set();
  const show = () => el.classList.toggle('is-off', !(past && hide.size === 0));
  const ios = [];
  const watch = (target, margin, fn) => { if (!target) return; const io = new IntersectionObserver(([e]) => { fn(e); show(); }, { rootMargin: margin }); io.observe(target); ios.push(io); };
  const top = Math.round(env.stick() + 56);
  watch(start, `-${top}px 0px 0px 0px`, e => { past = !e.isIntersecting && e.boundingClientRect.top < top + 1; });
  watch(sched, '-42% 0px -42% 0px', e => { e.isIntersecting ? hide.add('sched') : hide.delete('sched'); });
  watch(foot, '0px 0px -96px 0px', e => { e.isIntersecting ? hide.add('foot') : hide.delete('foot'); });
  show();
  return () => { ios.forEach(io => io.disconnect()); el.classList.add('is-off'); };
}

/* 3. Menu bar change. A marker sits where the bar starts; once it has scrolled away the bar turns solid and slimmer. */
function bar(root, env) {
  const b = root.querySelector('.zp-bar'); if (!b) return null;
  const mark = document.createElement('i'); mark.className = 'zp-mark'; mark.setAttribute('aria-hidden', 'true'); b.before(mark);
  const io = new IntersectionObserver(([e]) => b.classList.toggle('is-stuck', !e.isIntersecting && e.boundingClientRect.top < 200), { rootMargin: `-${Math.round(env.stick())}px 0px 0px 0px` });
  io.observe(mark);
  return () => { io.disconnect(); mark.remove(); b.classList.remove('is-stuck'); };
}

/* 4. Headline lights up word by word. Words start dim (still readable) and turn to full ink as the paragraph crosses the screen. */
function lightup(root) {
  const el = root.querySelector('[data-fx-lightup]'); if (!el) return null;
  const text = el.textContent;
  el.innerHTML = text.split(/\s+/).filter(Boolean).map(w => `<span class="zp-word">${escText(w)}</span>`).join(' ');
  el.classList.add('is-lightup');
  const words = [...el.children]; let lit = -1, frame = 0, near = true;
  const paint = () => {
    frame = 0;
    const r = el.getBoundingClientRect(), vh = window.innerHeight;
    const n = Math.round(clamp((vh * 0.9 - r.top) / (vh * 0.4 + r.height), 0, 1) * words.length);
    if (n !== lit) { words.forEach((w, i) => w.classList.toggle('is-lit', i < n)); lit = n; }
  };
  const onScroll = () => { if (near && !frame) frame = requestAnimationFrame(paint); };
  const io = new IntersectionObserver(([e]) => { near = e.isIntersecting; onScroll(); }, { rootMargin: '25% 0px 25% 0px' });
  io.observe(el); window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll);
  paint();
  return () => { io.disconnect(); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(frame); el.textContent = text; el.classList.remove('is-lightup'); };
}

/* 5. Moving hero. A video (film hero), a slow slideshow (slideshow and framed heroes) or tiles that trade photos (tiles hero).
      The still photo is always shown first. The video file is only asked for here, never on a slow or data-saving connection. */
function hero(root, env) {
  const offs = [];
  const whileSeen = (target, fn) => { const io = new IntersectionObserver(([e]) => fn(e.isIntersecting), { threshold: 0.12 }); io.observe(target); offs.push(() => io.disconnect()); };

  root.querySelectorAll('[data-fx-hero="video"]').forEach(box => {
    const v = box.querySelector('video'); if (!v) return;
    const net = navigator.connection; if (net && (net.saveData || /(^|-)2g$/.test(net.effectiveType || ''))) return;
    const sec = box.closest('[data-block]'), btn = sec.querySelector('[data-act="pause"]');
    let stopped = false, seen = true;
    const play = () => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
    const sync = () => {
      if (seen && !stopped) play(); else v.pause();
      if (btn) { btn.classList.toggle('is-paused', stopped); btn.setAttribute('aria-label', stopped ? env.S.play : env.S.pause); }
    };
    const onPlaying = () => box.classList.add('is-playing');
    const onBtn = () => { stopped = !stopped; sync(); };
    v.muted = true; v.addEventListener('playing', onPlaying);
    v.src = window.matchMedia('(max-width: 699px)').matches ? v.dataset.tall : v.dataset.wide;
    if (btn) { btn.hidden = false; btn.addEventListener('click', onBtn); }
    whileSeen(box, on => { seen = on; sync(); });
    offs.push(() => { v.removeEventListener('playing', onPlaying); v.pause(); v.removeAttribute('src'); v.load(); box.classList.remove('is-playing'); if (btn) { btn.removeEventListener('click', onBtn); btn.hidden = true; } });
  });

  root.querySelectorAll('[data-fx-hero="slides"]').forEach(box => {
    const n = box.children.length; if (n < 2) return;
    const sec = box.closest('[data-block]'); let t = 0, seen = true;
    const arm = () => {
      clearInterval(t);
      sec.classList.remove('is-auto'); void sec.offsetWidth;            // restarts the thin progress line on the active tab
      if (!seen) return;
      sec.classList.add('is-auto');
      t = setInterval(() => setSlide(sec, ((+sec.dataset.slide || 0) + 1) % n), SLIDE_MS);
    };
    sec.style.setProperty('--slide-ms', SLIDE_MS + 'ms');
    sec.addEventListener('zp:slide', arm);
    whileSeen(box, on => { seen = on; arm(); });
    offs.push(() => { clearInterval(t); sec.removeEventListener('zp:slide', arm); sec.classList.remove('is-auto'); });
  });

  root.querySelectorAll('[data-fx-hero="tiles"]').forEach(grid => {
    const tiles = [...grid.querySelectorAll('.zp-tile')].filter(t => t.querySelector('.zp-tile__alt')); if (!tiles.length) return;
    tiles.forEach(t => { const img = t.querySelector('.zp-tile__alt'); if (!img.getAttribute('src')) img.src = img.dataset.src; });
    let i = 0, t = 0;
    whileSeen(grid, on => { clearInterval(t); if (on) t = setInterval(() => { tiles[i % tiles.length].classList.toggle('is-alt'); i++; }, 2600); });
    offs.push(() => { clearInterval(t); tiles.forEach(el => el.classList.remove('is-alt')); });
  });

  return () => offs.forEach(f => f());
}

/* 6. Moving text strip. Slow on purpose (a set number of pixels per second, whatever the screen width) and paused when off screen. */
function strip(root) {
  const offs = [];
  root.querySelectorAll('[data-fx-strip]').forEach(el => {
    const group = el.querySelector('.zp-strip__grp'); if (!group) return;
    const speed = el.classList.contains('zp-strip--loud') ? 70 : 38;
    el.classList.add('is-moving');
    const size = () => el.style.setProperty('--dur', Math.max(14, group.offsetWidth / speed).toFixed(1) + 's');
    size();
    const io = new IntersectionObserver(([e]) => el.classList.toggle('is-paused', !e.isIntersecting)); io.observe(el);
    window.addEventListener('resize', size);
    offs.push(() => { io.disconnect(); window.removeEventListener('resize', size); el.classList.remove('is-moving', 'is-paused'); el.style.removeProperty('--dur'); });
  });
  return () => offs.forEach(f => f());
}

/* 7. Sliding card row. The grid becomes a row that snaps card by card. Arrows appear only when there is more to see.
      The first time the row comes on screen it nudges once, so people notice it moves. */
function slide(root) {
  const offs = [];
  root.querySelectorAll('[data-fx-slide]').forEach(row => {
    const sec = row.closest('[data-block]'), arrows = [...sec.querySelectorAll('.zp-arrow')];
    row.classList.add('is-slider');
    const step = () => { const c = row.firstElementChild; return c ? c.getBoundingClientRect().width + (parseFloat(getComputedStyle(row).columnGap) || 0) : 320; };
    const sync = () => {
      const more = row.scrollWidth - row.clientWidth;
      sec.classList.toggle('has-arrows', more > 8);
      arrows.forEach(a => { a.disabled = +a.dataset.dir < 0 ? row.scrollLeft < 8 : row.scrollLeft > more - 8; });
    };
    const onArrow = e => row.scrollBy({ left: +e.currentTarget.dataset.dir * step(), behavior: 'smooth' });
    arrows.forEach(a => a.addEventListener('click', onArrow));
    row.addEventListener('scroll', sync, { passive: true }); window.addEventListener('resize', sync);
    let t1 = 0, t2 = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect();
      if (row.scrollWidth - row.clientWidth > 8 && row.scrollLeft < 4) { t1 = setTimeout(() => row.scrollTo({ left: 84, behavior: 'smooth' }), 350); t2 = setTimeout(() => row.scrollTo({ left: 0, behavior: 'smooth' }), 1050); }
    }, { threshold: 0.6 });
    io.observe(row); sync();
    offs.push(() => { io.disconnect(); clearTimeout(t1); clearTimeout(t2); arrows.forEach(a => { a.removeEventListener('click', onArrow); a.disabled = false; }); row.removeEventListener('scroll', sync); window.removeEventListener('resize', sync); row.classList.remove('is-slider'); sec.classList.remove('has-arrows'); row.scrollLeft = 0; });
  });
  return () => offs.forEach(f => f());
}

/* 8. Changing word. The words sit on top of each other on their own line, so nothing around them moves. */
function word(root) {
  const offs = [];
  root.querySelectorAll('[data-fx-word]').forEach(el => {
    const ws = [...el.children]; if (ws.length < 2) return;
    let i = 0, t = 0, out = 0;
    el.classList.add('is-live');
    const next = () => {
      const from = ws[i]; i = (i + 1) % ws.length; const to = ws[i];
      from.classList.remove('is-on'); from.classList.add('is-out'); to.classList.remove('is-out'); to.classList.add('is-on');
      clearTimeout(out); out = setTimeout(() => from.classList.remove('is-out'), 600);
    };
    const io = new IntersectionObserver(([e]) => { clearInterval(t); if (e.isIntersecting) t = setInterval(next, WORD_MS); }); io.observe(el);
    offs.push(() => { io.disconnect(); clearInterval(t); clearTimeout(out); el.classList.remove('is-live'); ws.forEach((w, k) => { w.classList.toggle('is-on', k === 0); w.classList.remove('is-out'); }); });
  });
  return () => offs.forEach(f => f());
}

/* 9. Pinned section. The holding still is plain CSS (position: sticky). This part only swaps the photo
      to match whichever class is crossing the middle of the screen. */
function pin(root) {
  const offs = [];
  root.querySelectorAll('[data-fx-pin]').forEach(box => {
    const items = [...box.querySelectorAll('.zp-pin__item')], pics = [...box.querySelectorAll('.zp-pin__frame > .zp-ph')];
    const show = i => { items.forEach((el, k) => el.classList.toggle('is-on', k === i)); pics.forEach((el, k) => el.classList.toggle('is-on', k === i)); };
    const wide = window.matchMedia('(min-width: 1000px)'); let io;
    const build = () => {
      if (io) io.disconnect();
      io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && show(+e.target.dataset.i)), { rootMargin: wide.matches ? '-50% 0px -50% 0px' : '-56% 0px -44% 0px' });
      items.forEach(el => io.observe(el));
    };
    build(); wide.addEventListener('change', build);
    offs.push(() => { io.disconnect(); wide.removeEventListener('change', build); show(0); });
  });
  return () => offs.forEach(f => f());
}

/* Layout changers first (slide, pin, strip, word), so that "fade and rise" measures the finished page. */
const ALL = { bar, slide, pin, strip, word, hero, lightup, book, rise };

/* Switch on every effect in `on`. Returns one function that switches them all off again.
   env: { stick(): how many pixels at the top are covered by something sticky above the page, S: the page's words } */
export function mountEffects(root, on, env) {
  const offs = [];
  for (const [id, fn] of Object.entries(ALL)) {
    if (!on[id]) continue;
    try { const off = fn(root, env); if (off) offs.push(off); } catch (err) { console.warn('effect failed, page stays still:', id, err); }
  }
  return () => offs.forEach(f => { try { f(); } catch (err) { /* nothing to undo */ } });
}
