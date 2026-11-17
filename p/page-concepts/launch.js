/* launch.js: what ships first.
   One map of phases, read by the samples viewer (its "Launch version" switch) and by the owner settings mock (its phase tags),
   so the two cannot disagree. The spec repeats it in words.

   Phase 1  the renderer, two styles, and only what Zana already holds. Zana staff set the color, the logo and the cover photo.
   Phase 2  the owner settings screen: the words and photos an owner has to add, and the three styles that need them.
   Phase 3  video from a bought service, and the extra effects. */
export const SHIP = {
  style: { timetable: 1, solo: 1, film: 2, calm: 2, mono: 2 },
  hero: { today: 1, photo: 1, slideshow: 2, video: 3 },                                           // the owner's four kinds of hero
  fx: { rise: 1, book: 1, bar: 1, lightup: 3, strip: 3, slide: 3, word: 3, pin: 3 },               // a moving hero follows the kind of hero
  sec: { statement: 1, classes: 1, schedule: 1, prices: 1, offer: 2, bookbar: 2, coaches: 2, first: 2, reviews: 2 },
};
export const LAUNCH_STYLES = Object.keys(SHIP.style).filter(id => SHIP.style[id] === 1);

/* which section each block belongs to. A block that is not listed (menu bar, hero, footer) is on every page. */
const SEC_OF = {
  statement: 'statement', classCards: 'classes', scheduleCards: 'schedule', scheduleList: 'schedule', priceCards: 'prices',
  offerStrip: 'offer', bookingBar: 'bookbar', coaches: 'coaches', firstVisit: 'first', reviews: 'reviews',
};

/* What Zana holds about a business today, checked against the backend models. Everything else on a sample page is typed by someone.
     the business  name, one language, address, contact email, hours, logo, brand color
     a class       name, length, room size
     a price       name, amount, how often it bills, how many visits it buys, whether tax is included
     a person      name
     the schedule  day, time, class, coach
   Not held: a tagline, a neighborhood (the address is one line of text), a phone number, photos, a video, class descriptions and levels, coach photos and specialties,
   price descriptions and bullet points, a "most popular" flag, member quotes, the offer, and whether the first visit is free. */
export function held(gym, lang) {
  const pick = (o, keys) => Object.fromEntries(keys.filter(k => o[k] != null).map(k => [k, o[k]]));
  const place = gym.place || {};
  return {
    ...pick(gym, ['id', 'name', 'owner', 'unit', 'lead', 'brand', 'brand2', 'brandNames', 'logo', 'tax']),
    langs: gym.langs || [lang],                                   // one language per business: the page shows that one and offers no switch
    photos: (gym.photos || []).slice(0, 1),                       // the cover photo, set by Zana staff
    classes: (gym.classes || []).map(c => pick(c, ['id', 'name', 'mins'])),
    coaches: (gym.coaches || []).map(c => pick(c, ['id', 'name'])),
    schedule: gym.schedule || [],
    prices: (gym.prices || []).map(p => pick(p, ['name', 'price', 'monthly', 'credits'])),
    place: pick(place, ['addr', 'email', 'hours']),
  };
}

/* A recipe and a business, cut down to phase 1: the launch sections only, a still hero, and the data Zana holds. */
export function launchCut(recipe, gym, lang) {
  const blocks = recipe.blocks
    .map(b => (typeof b === 'string' ? [b, {}] : [b[0], { ...(b[1] || {}) }]))
    .filter(([name]) => !SEC_OF[name] || SHIP.sec[SEC_OF[name]] === 1)
    .map(([name, opt]) => (name === 'heroSlideshow' ? ['heroFilm', {}] : [name, opt]));          // a slideshow needs photos an owner uploads: one cover photo instead
  return { recipe: { ...recipe, blocks }, gym: held(gym, lang) };
}
export const launchFx = fx => Object.fromEntries(Object.keys(fx).map(id => [id, !!fx[id] && SHIP.fx[id] === 1]));
