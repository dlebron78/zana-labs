/* launch.js: what ships at launch.
   One map, read by the samples viewer (its "Launch version" switch) and by the owner customizer (its Launch and Later tags),
   so the two cannot disagree. The spec repeats it in words.

   1  launch: the renderer, two styles, the launch sections and three effects, plus the owner customizer,
      the links list, up to 3 content pages, Privacy and Terms in the footer, price labels and "what you get", contact details.
   2  later: three more styles, the sections and photos they need, the slideshow and video heroes, the extra effects. */
export const SHIP = {
  style: { timetable: 1, solo: 1, film: 2, calm: 2, mono: 2 },
  hero: { today: 1, photo: 1, slideshow: 2, video: 2 },                                           // the owner's four kinds of hero
  fx: { rise: 1, book: 1, bar: 1, lightup: 2, strip: 2, slide: 2, word: 2, pin: 2 },               // a moving hero follows the kind of hero
  sec: { statement: 1, classes: 1, schedule: 1, prices: 1, offer: 2, bookbar: 2, coaches: 2, first: 2, reviews: 2 },
};
/* the business each launch style is shown with. Timetable launches on Barrio 13 CrossFit, the first business switching over. */
export const LAUNCH_GYM = { timetable: 'barrio' };
export const LAUNCH_STYLES = Object.keys(SHIP.style).filter(id => SHIP.style[id] === 1);

/* which section each block belongs to. A block that is not listed (menu bar, hero, footer) is on every page. */
const SEC_OF = {
  statement: 'statement', classCards: 'classes', scheduleCards: 'schedule', scheduleList: 'schedule', priceCards: 'prices',
  offerStrip: 'offer', bookingBar: 'bookbar', coaches: 'coaches', firstVisit: 'first', reviews: 'reviews',
};

/* What a launch page draws from: what Zana holds about a business, plus the details the owner fills in from the customizer at launch.
     the business  name, one language, address, contact email, hours, logo, brand color, cover photo
                   new at launch: one line, a note under the address, WhatsApp, Instagram, TikTok, phone
     a class       name, length, room size
     a price       name, amount, how often it bills, how many visits it buys, whether tax is included
                   new at launch: the owner's label ("Most popular", "New"), the "what you get" lines, featured on the page or not
     a person      name
     the schedule  day, time, class, coach
     also new      the links list, up to 3 content pages, the Privacy Policy and Terms from the business's legal documents
   Not at launch: a tagline, class descriptions and levels, coach photos and specialties, member quotes, the offer,
   whether the first visit is free, more photos and a video. */
export function held(gym, lang) {
  const pick = (o, keys) => Object.fromEntries(keys.filter(k => o[k] != null).map(k => [k, o[k]]));
  const place = gym.place || {};
  return {
    ...pick(gym, ['id', 'name', 'slug', 'line', 'owner', 'unit', 'lead', 'brand', 'brand2', 'brandNames', 'logo', 'tax', 'made', 'links', 'pages', 'legal']),
    langs: gym.langs || (gym.slug ? undefined : [lang]),          // a business writes its own words once. A launch sample with real words keeps Zana's switch; the others show one language
    photos: (gym.photos || []).slice(0, 1),                       // the cover photo
    classes: (gym.classes || []).map(c => pick(c, ['id', 'name', 'mins', 'open'])),
    coaches: (gym.coaches || []).map(c => pick(c, ['id', 'name'])),
    schedule: gym.schedule || [],
    prices: (gym.prices || []).map(p => pick(p, ['id', 'name', 'price', 'monthly', 'credits', 'label', 'ticks', 'onPage', 'featured'])),
    place: pick(place, ['addr', 'email', 'hours', 'note', 'whatsapp', 'instagram', 'tiktok', 'phone']),
  };
}

/* A recipe and a business, cut down to the launch: the launch sections only, a still hero, and what held() keeps. */
export function launchCut(recipe, gym, lang) {
  const blocks = recipe.blocks
    .map(b => (typeof b === 'string' ? [b, {}] : [b[0], { ...(b[1] || {}) }]))
    .filter(([name]) => !SEC_OF[name] || SHIP.sec[SEC_OF[name]] === 1)
    .map(([name, opt]) => (name === 'heroSlideshow' ? ['heroFilm', {}] : [name, opt]));          // a slideshow needs photos an owner uploads: one cover photo instead
  /* the cover photo ships at launch, so every launch page shows it. A hero that holds no photo (Timetable's board) gets the photo as a wide band right under it. */
  const h = blocks.findIndex(([name]) => name.startsWith('hero'));
  if (h >= 0 && blocks[h][0] === 'heroSplit' && blocks[h][1].side === 'board') blocks.splice(h + 1, 0, ['coverBand', {}]);
  return { recipe: { ...recipe, blocks }, gym: held(gym, lang) };
}
export const launchFx = fx => Object.fromEntries(Object.keys(fx).map(id => [id, !!fx[id] && SHIP.fx[id] === 1]));
