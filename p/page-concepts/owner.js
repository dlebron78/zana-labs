/* owner.js: the rules behind the owner's settings screen.
   The idea is "bounded overrides": a style (a recipe) sets every default, and the owner may change
   a short list of settings, each one within limits. Anything out of bounds is ignored, never applied.

     styleDefaults(style)      what the style sets by itself
     resolve(style, own)       style defaults + the owner's changes -> the settings in force
     compose(settings, extra)  the settings in force -> the recipe, the gym and the options page.js needs

   Light or dark, corners, the heading typeface and the photo look are not here on purpose: they stay with the style.
   The settings screen (settings.js) and its preview (preview.js) both read these rules, so they cannot disagree. */

import { GYMS } from './data.js?v=17';
import { RECIPES, ORDER, FX_DEFAULTS } from './recipes.js?v=17';
import { HEROES } from './blocks.js?v=17';
import { buildTokens } from './tokens.js?v=17';

const P = '../gym-page/img/';

/* The owner in this mock: one invented gym with six photos in its library. It stays the same gym in every style. */
export const OWNER_GYM = {
  ...GYMS.litoral,
  photos: [...GYMS.litoral.photos, { src: P + 'coach-plan.jpg', shape: 'wide', pos: '45% 40%' }, { src: P + 'box-ropes.jpg', shape: 'wide', pos: '60% 45%' }],
};

export const STYLES = ORDER.filter(id => id !== 'solo');           // film, timetable, calm, mono. The solo trainer page has its own short list, not built in this mock
export const SPACES = ['compact', 'comfortable', 'airy'];
export const SIZES = ['s', 'm', 'l'];                              // headline size, three steps inside the safe range
export const OWNER_FX = ['rise', 'book', 'bar', 'lightup', 'strip', 'slide', 'word', 'pin'];   // "moving hero" is decided by the hero type instead
export const SECTIONS = ['statement', 'classes', 'schedule', 'coaches', 'first', 'prices', 'reviews'];   // the seven an owner can order
export const TOP = ['offer', 'bookbar'];                           // these keep their place near the top; the owner can only show or hide them
export const LOCKED = ['schedule', 'prices'];                      // always shown: the Book button and the price link lead here
const BLOCK_OF = {
  statement: ['statement'], classes: ['classCards'], schedule: ['scheduleCards', 'scheduleList'], coaches: ['coaches'],
  first: ['firstVisit'], prices: ['priceCards'], reviews: ['reviews'], offer: ['offerStrip'], bookbar: ['bookingBar'],
};
export const blocksOf = key => BLOCK_OF[key] || [];

/* What each style adds to its recipe for this screen:
   hero    the hero type it starts with
   heroes  the hero types it allows
   add     a section the recipe leaves out: where it goes and how it is drawn if the owner switches it on */
export const STYLE = {
  film:      { hero: 'video',     heroes: ['photo', 'slideshow', 'video'], add: { first: { after: 'coaches', block: ['firstVisit', { variant: 'band', photo: 5 }] } } },
  timetable: { hero: 'today',     heroes: ['today', 'photo', 'slideshow', 'video'] },
  calm:      { hero: 'photo',     heroes: ['photo', 'slideshow', 'video'] },
  mono:      { hero: 'slideshow', heroes: ['photo', 'slideshow', 'video'] },
};

/* The owner picks a kind of hero (photo, slideshow, video). The style decides how that kind is drawn.
   Each entry: the block, its options, whether it moves, and how the cover photo is used ("none" when it is not). */
const HERO = {
  film:      { photo: ['heroFilm', {}, false, 'fill'], slideshow: ['heroFilm', { slides: true }, true, 'first'], video: ['heroFilm', {}, true, 'poster'] },
  timetable: { today: ['heroSplit', { side: 'board' }, false, 'none'], photo: ['heroSplit', { side: 'photo' }, false, 'beside'], slideshow: ['heroFramed', {}, true, 'first'], video: ['heroFilm', {}, true, 'poster'] },
  calm:      { photo: ['heroTiles', {}, false, 'tile'], slideshow: ['heroTiles', {}, true, 'tile'], video: ['heroFilm', {}, true, 'poster'] },
  mono:      { photo: ['heroFilm', {}, false, 'fill'], slideshow: ['heroSlideshow', {}, true, 'none'], video: ['heroFilm', {}, true, 'poster'] },
};
export const coverUse = (style, hero) => HERO[style][hero][3];

/* Headline size. Small, medium and large are 2.5, 2.75 and 3 times the body text (3.1 for the tall capitals, which run narrow). */
const tallCaps = style => RECIPES[style].tokens.type === 'condensed';
export const scaleOf = (style, size) => (size === 's' ? 2.5 : size === 'm' ? 2.75 : tallCaps(style) ? 3.1 : 3);
const sizeOf = scale => (scale <= 2.5 ? 's' : scale < 3 ? 'm' : 'l');
export const photoCards = style => RECIPES[style].blocks.some(b => Array.isArray(b) && b[0] === 'classCards' && b[1].variant === 'photo');

const listOf = style => RECIPES[style].blocks.map(b => (typeof b === 'string' ? [b, {}] : [b[0], { ...b[1] }]));
const keyOf = name => Object.keys(BLOCK_OF).find(k => BLOCK_OF[k].includes(name));

/* What the style sets by itself. Read from the recipe, so a change to a recipe shows up here with no second list to keep. */
export function styleDefaults(style) {
  const r = RECIPES[style], st = STYLE[style];
  const have = listOf(style).map(b => keyOf(b[0])).filter(Boolean);
  const order = have.filter(k => SECTIONS.includes(k));
  for (const k of SECTIONS) {
    if (order.includes(k)) continue;
    const a = st.add && st.add[k];
    order.splice(a ? order.indexOf(a.after) + 1 : order.length, 0, k);
  }
  const show = {};
  for (const k of [...TOP.filter(t => have.includes(t)), ...SECTIONS]) show[k] = have.includes(k);
  const on = { ...FX_DEFAULTS, ...r.fx };
  return { space: r.tokens.space, size: sizeOf(r.tokens.scale), hero: st.hero, fx: Object.fromEntries(OWNER_FX.map(f => [f, !!on[f]])), order, show };
}

const sameSet = (a, b) => a.length === b.length && [...a].sort().join() === [...b].sort().join();

/* Style defaults + the owner's changes -> the settings in force.
   own holds only what the owner changed: { space, size, hero, fx: { id: true|false }, order: [...], show: { key: true|false } }
   The answer also says what differs from the style (changed), which effects have something to act on (can), and the defaults. */
export function resolve(style, own = {}) {
  if (!RECIPES[style]) style = STYLES[0];
  const d = styleDefaults(style), st = STYLE[style];
  const s = {
    style,
    space: SPACES.includes(own.space) ? own.space : d.space,
    size: SIZES.includes(own.size) ? own.size : d.size,
    hero: st.heroes.includes(own.hero) ? own.hero : d.hero,
    order: Array.isArray(own.order) && sameSet(own.order, SECTIONS) ? [...own.order] : [...d.order],
    show: {}, want: {}, fx: {},
  };
  for (const k of Object.keys(d.show)) s.show[k] = LOCKED.includes(k) ? true : typeof (own.show || {})[k] === 'boolean' ? own.show[k] : d.show[k];
  for (const f of OWNER_FX) s.want[f] = typeof (own.fx || {})[f] === 'boolean' ? own.fx[f] : d.fx[f];
  /* an effect with nothing to act on stays off, whatever its switch says.
     pinned: the class cards are held by "pinned section", so they cannot also be a sliding row */
  s.pinned = s.want.pin && s.show.classes && photoCards(style);
  s.can = { rise: true, book: true, bar: true, word: true, pin: true, lightup: s.show.statement, strip: !!s.show.offer, slide: s.show.coaches || (s.show.classes && !s.pinned) };
  for (const f of OWNER_FX) s.fx[f] = s.want[f] && !!s.can[f];
  s.changed = {
    space: s.space !== d.space, size: s.size !== d.size, hero: s.hero !== d.hero, order: s.order.join() !== d.order.join(),
    fx: Object.fromEntries(OWNER_FX.map(f => [f, s.want[f] !== d.fx[f]])),
    show: Object.fromEntries(Object.keys(d.show).map(k => [k, s.show[k] !== d.show[k]])),
  };
  s.count = [s.changed.space, s.changed.size, s.changed.hero, s.changed.order, ...Object.values(s.changed.fx), ...Object.values(s.changed.show)].filter(Boolean).length;
  s.defaults = d;
  return s;
}

/* The paint for these settings: the style's own tokens with the owner's spacing and headline size. */
export const tokensOf = (s, brand) => buildTokens({ ...RECIPES[s.style].tokens, space: s.space, scale: scaleOf(s.style, s.size) }, brand || OWNER_GYM.brand);

/* The settings in force -> what page.js needs to build the page.
   o: { lang, brand, logo: { src, mono, ratio }, cover: { src, pos }, still: true when motion is reduced, gym } */
export function compose(s, o = {}) {
  const r = RECIPES[s.style], st = STYLE[s.style], base = o.gym || OWNER_GYM;
  const list = listOf(s.style), iHero = list.findIndex(b => HEROES.includes(b[0]));
  const [heroName, heroOpt, moving] = HERO[s.style][s.hero];

  /* the gym, with the owner's logo and cover photo. The cover photo goes first in the library, so every hero starts with it. */
  let photos = base.photos;
  if (o.cover && o.cover.src) {
    const mine = photos.find(p => p.src === o.cover.src) || { src: o.cover.src, pos: o.cover.pos };
    photos = [{ ...mine, shape: 'wide' }, ...photos.filter(p => p.src !== o.cover.src)];
  }
  let video;
  if (s.hero === 'video' && base.video) video = o.cover && o.cover.src ? { ...base.video, posterWide: o.cover.src, posterTall: o.cover.src } : base.video;
  const gym = { ...base, photos, video, logo: o.logo && o.logo.src ? { ...base.logo, ...o.logo } : base.logo };

  /* the blocks: what the style puts above the hero, the hero, what it puts right under it, the owner's sections in the owner's order, the footer */
  const keep = b => b[0] === 'menuBar' || s.show[keyOf(b[0])];
  const above = list.slice(0, iHero).filter(keep);
  const under = [];
  for (let i = iHero + 1; i < list.length && TOP.includes(keyOf(list[i][0])); i++) if (keep(list[i])) under.push(list[i]);
  const content = s.order.filter(k => s.show[k]).map(k => {
    const b = list.find(x => BLOCK_OF[k].includes(x[0])) || st.add[k].block;
    const opt = { ...b[1] };
    if (b[0] === 'classCards' && opt.variant === 'plain') opt.pin = false;          // a style with plain class cards keeps them plain
    if (b[0] === 'firstVisit') {                                                    // never the photo the hero is already showing
      let n = Math.min(opt.photo || 0, photos.length - 1);
      if (n === 0 && coverUse(s.style, s.hero) !== 'none' && photos.length > 1) n = 1;
      opt.photo = n;
    }
    return [b[0], opt];
  });
  let tinted = false;                                                               // two tinted sections never sit back to back
  for (const b of content) { if (b[1].band && tinted) b[1].band = false; tinted = !!b[1].band; }
  const recipe = { ...r, blocks: [...above, [heroName, { ...heroOpt }], ...under, ...content, 'footer'] };

  const want = { ...FX_DEFAULTS, ...r.fx, ...s.fx, hero: moving };
  const fx = o.still ? { book: want.book, bar: want.bar } : want;                  // reduced motion: only the two that do not move content
  return { recipe, gym, fx, opts: { lang: o.lang, fx, brand: o.brand || base.brand, tokens: { space: s.space, scale: scaleOf(s.style, s.size) } } };
}
