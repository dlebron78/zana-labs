/* tokens.js: the token system.
   One brand color and a handful of choices go in. Every color, size, gap and corner the blocks read comes out.
   Nothing here knows about a gym or a block. */

/* ---------- color math (same as the six-styles prototype) ---------- */
export const hx = h => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(x => x + x).join(''); const n = parseInt(h, 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
export const toHex = a => '#' + a.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('').toUpperCase();
export const mix = (a, b, t) => { const A = hx(a), B = hx(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)); };
export const lum = c => { const v = hx(c).map(x => { x /= 255; return x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4); }); return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]; };
export const contrast = (a, b) => { const A = lum(a), B = lum(b); return (Math.max(A, B) + .05) / (Math.min(A, B) + .05); };
export const textOn = c => contrast(c, '#FFFFFF') >= contrast(c, '#111111') ? '#FFFFFF' : '#111111';
/* nudge a color toward black or white (whichever helps) until it reaches the ratio against bg */
export function readable(c, bg, ratio) {
  if (contrast(c, bg) >= ratio) return c;
  const to = lum(bg) > .3 ? '#000000' : '#FFFFFF';
  for (let t = .05; t <= 1; t += .05) { const m = mix(c, to, t); if (contrast(m, bg) >= ratio) return m; }
  return to;
}
const sat = c => { const [r, g, b] = hx(c).map(v => v / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b); return mx === 0 ? 0 : (mx - mn) / mx; };
const rgba = (c, a) => { const [r, g, b] = hx(c); return `rgba(${r},${g},${b},${a})`; };
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* ---------- the choices a recipe (or the owner) can make ---------- */
export const CHOICES = {
  mode: ['light', 'dark'],
  ground: ['neutral', 'tinted', 'pure'],          // the page color: plain, a hint of the brand color, or pure black / white
  type: ['wide', 'plain', 'serif', 'condensed'],  // the voice of the headings
  scale: [2.5, 2.75, 3],                           // heading size as a multiple of body size. Guarded: never under 2.5, never over 3 (3.1 for condensed)
  space: ['compact', 'comfortable', 'airy'],
  corners: ['square', 'soft', 'round'],
  photo: ['original', 'bw', 'tint'],
};
export const DEFAULTS = { mode: 'light', ground: 'neutral', type: 'plain', scale: 2.75, space: 'comfortable', corners: 'soft', photo: 'original' };

/* Three font families in total. Geist is the body everywhere (it is already Zana's own face). */
const BODY = '"Geist",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';
const VOICES = {
  wide:      { hf: `"Archivo",${BODY}`, hw: 600, stretch: '116%', hcase: 'none', track: '-0.014em', lh: 1.08, em: 'normal', h3k: 1, logoTrack: '0.02em' },
  plain:     { hf: BODY, hw: 700, stretch: '100%', hcase: 'none', track: '-0.03em', lh: 1.06, em: 'normal', h3k: 1, logoTrack: '-0.02em' },
  serif:     { hf: '"Fraunces",Georgia,"Times New Roman",serif', hw: 500, stretch: '100%', hcase: 'none', track: '-0.018em', lh: 1.1, em: 'italic', h3k: 1.06, logoTrack: '-0.01em' },
  condensed: { hf: `"Archivo",${BODY}`, hw: 800, stretch: '66%', hcase: 'uppercase', track: '0.006em', lh: .95, em: 'normal', h3k: 1.22, logoTrack: '0.03em', maxScale: 3.1 },
};
const SPACE = {
  compact:     { sec: [44, 76],  gap: [14, 18], pad: [18, 22], head: [22, 34] },
  comfortable: { sec: [60, 108], gap: [16, 26], pad: [22, 30], head: [28, 48] },
  airy:        { sec: [76, 152], gap: [20, 36], pad: [26, 38], head: [34, 64] },
};
const CORNERS = {
  square: { card: 0,  btn: 0,   img: 0,  chip: 0,   av: '0',   pill: 0 },
  soft:   { card: 14, btn: 10,  img: 12, chip: 8,   av: '14px', pill: 14 },
  round:  { card: 28, btn: 999, img: 28, chip: 999, av: '50%', pill: 999 },
};

/* a size that grows smoothly from a phone (420px wide) to a laptop (1200px wide) */
const fluid = (min, max, lo = 420, hi = 1200) => {
  if (min === max) return `${min}px`;
  const m = (max - min) / (hi - lo), b = min - m * lo;
  return `clamp(${min}px, ${b.toFixed(2)}px + ${(m * 100).toFixed(3)}vw, ${max}px)`;
};

/* ---------- colors: one brand color in, a readable set out ---------- */
export function palette(brand, mode, ground) {
  const dark = mode === 'dark';
  let bg, ink, surface, band;
  if (ground === 'pure') {
    bg = dark ? '#000000' : '#FFFFFF'; ink = dark ? '#FFFFFF' : '#0A0A0A';
    surface = dark ? '#0F0F0F' : '#FFFFFF'; band = dark ? '#0B0B0B' : '#F3F3F1';
  } else if (ground === 'tinted') {
    bg = dark ? mix('#0E0D0C', brand, .07) : mix('#F8F4EC', brand, .06);
    ink = dark ? '#F6F3EC' : readable(mix(brand, '#000000', .84), bg, 12);
    surface = dark ? mix(bg, '#FFFFFF', .06) : mix(bg, '#FFFFFF', .72);
    band = dark ? mix(bg, brand, .07) : mix(bg, brand, .08);
  } else {
    bg = dark ? '#0C0C0D' : '#F6F5F2'; ink = dark ? '#F5F3EE' : '#141413';
    surface = dark ? '#161617' : '#FFFFFF'; band = dark ? '#121213' : '#ECEAE5';
  }
  const ink2 = readable(mix(ink, bg, .24), bg, 7);     // supporting lines: still strong, never thin grey
  const inkDim = mix(ink, bg, .76);                     // words waiting to light up
  const line = mix(bg, ink, .14), lineStrong = mix(bg, ink, .34);

  /* the brand color as a fill (buttons, tabs). Keep the owner's color whenever it can be seen at all. */
  let acc = brand, accEdge = 'transparent';
  if (contrast(acc, bg) < 1.35) acc = sat(brand) < .2 ? ink : readable(brand, bg, 1.7);   // black on black, white on white: flip or nudge
  if (acc !== ink && contrast(acc, bg) < 2.3) accEdge = mix(acc, ink, .55);                // faint against the page: draw its edge
  const accInk = textOn(acc);
  /* the brand color as text or a tick on the page and on a card: always readable */
  const accText = readable(brand, bg, 4.5), accTextS = readable(brand, surface, 4.5);
  /* the follow-you pill is drawn in ink, so its button must show on ink */
  const pillBtn = contrast(acc, ink) >= 1.8 ? acc : bg, pillBtnInk = pillBtn === acc ? accInk : ink;
  /* on top of a photo the page color is unknown, so a dark button gets a light edge */
  const accMediaEdge = lum(acc) < .1 ? 'rgba(255,255,255,.65)' : 'transparent';

  return {
    '--bg': bg, '--ink': ink, '--ink2': ink2, '--ink-dim': inkDim, '--surface': surface, '--band': band,
    '--line': line, '--line-strong': lineStrong, '--barBg': rgba(bg, .86),
    '--acc': acc, '--accInk': accInk, '--accEdge': accEdge, '--accText': accText, '--accTextS': accTextS,
    '--accMediaEdge': accMediaEdge, '--planEdge': mix(surface, accTextS, .42),
    '--pillBtn': pillBtn, '--pillBtnInk': pillBtnInk,
    '--shadow': dark ? '0 14px 36px rgba(0,0,0,.6)' : '0 14px 36px rgba(20,20,19,.16)',
  };
}

/* ---------- brand-tinted photos: grey levels mapped onto the brand color ----------
   Black stays near black, white stays near white, and the brand color sits at its own lightness,
   so any color (navy, neon, pastel) keeps the photo's light and shade. */
export function duotone(brand, n = 9) {
  const p = clamp(Math.pow(lum(brand), 1 / 2.2), .28, .78);
  const lo = mix(brand, '#000000', .9), hi = mix(brand, '#FFFFFF', .88);
  const out = [[], [], []];
  for (let i = 0; i < n; i++) {
    const g = i / (n - 1);
    const c = g <= p ? mix(lo, brand, g / p) : mix(brand, hi, (g - p) / (1 - p));
    hx(c).forEach((v, k) => out[k].push((v / 255).toFixed(3)));
  }
  return { r: out[0].join(' '), g: out[1].join(' '), b: out[2].join(' ') };
}

/* ---------- everything together ---------- */
export function buildTokens(choice, brand) {
  const c = { ...DEFAULTS, ...choice };
  const V = VOICES[c.type] || VOICES.plain, S = SPACE[c.space] || SPACE.comfortable, R = CORNERS[c.corners] || CORNERS.soft;
  const scale = clamp(+c.scale || 2.75, 2.5, V.maxScale || 3);

  /* type: body 17px on a phone and 18px on a laptop. The headline is body x scale on a laptop (45 to 56px) and 34 to 40px on a phone. */
  const h1Max = Math.round(18 * scale), h1Min = clamp(Math.round(17 * (scale - .7)), 34, 40);
  const h2Max = Math.round(h1Max * .72), h2Min = Math.max(26, Math.round(h1Min * .78));
  const h3Max = Math.round(22 * V.h3k), h3Min = Math.round(20 * V.h3k);

  const px = v => (typeof v === 'number' ? v + 'px' : v);
  const vars = {
    ...palette(brand, c.mode, c.ground),
    '--bf': BODY, '--hf': V.hf, '--hw': V.hw, '--hstretch': V.stretch, '--hcase': V.hcase, '--htrack': V.track, '--hlh': V.lh, '--em': V.em,
    '--logo-track': V.logoTrack,
    '--body': fluid(17, 18), '--small': fluid(15, 16), '--tag': fluid(12.5, 13),
    '--h1': fluid(h1Min, h1Max), '--h2': fluid(h2Min, h2Max), '--h3': fluid(h3Min, h3Max),
    '--stmt': fluid(Math.round(h2Min * .96), Math.round(h2Max * 1.04)),
    '--sec': fluid(S.sec[0], S.sec[1]), '--gap': fluid(S.gap[0], S.gap[1]), '--pad': fluid(S.pad[0], S.pad[1]), '--head': fluid(S.head[0], S.head[1]),
    '--gut': fluid(20, 64),
    '--r-card': px(R.card), '--r-btn': px(R.btn), '--r-img': px(R.img), '--r-chip': px(R.chip), '--r-av': R.av, '--r-pill': px(R.pill),
  };
  return {
    vars,
    attrs: { mode: c.mode, photo: c.photo, corners: c.corners, space: c.space, type: c.type },
    duo: duotone(brand),
    facts: { h1Laptop: h1Max, h1Phone: h1Min, body: 18, ratio: +(h1Max / 18).toFixed(2) },
    choice: { ...c, scale },
  };
}
