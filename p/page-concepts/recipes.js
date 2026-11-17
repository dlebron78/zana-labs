/* recipes.js: a page is a recipe.
   A recipe is three short lists and nothing else:
     blocks  which blocks, in what order
     tokens  how it is painted: light or dark, heading voice, size, spacing, corners, photo look
     fx      which effects are switched on, on top of the safe defaults
   A recipe holds no gym. Give it any gym from data.js and the page fills itself. */

/* The effects library, in the order the control panel lists them.
   on: true means safe to leave on for everyone. The rest are switches an owner turns on.
   still is what a visitor gets instead when their phone asks for reduced motion. */
export const FX = [
  { id: 'rise',    on: true,  name: 'Fade and rise',           what: 'Sections ease in as you reach them.',                                    still: 'Everything is simply there.' },
  { id: 'book',    on: true,  name: 'Book button follows you', what: 'A Book button stays on screen, with a price.',                           still: 'Still follows you. It appears without sliding.' },
  { id: 'bar',     on: true,  name: 'Menu bar change',         what: 'Clear over the hero, then solid and slimmer as you scroll.',             still: 'Still sticks. It changes without a fade.' },
  { id: 'lightup', on: false, name: 'Headline lights up',      what: 'The pitch brightens word by word as you scroll.',                        still: 'Fully lit from the start.' },
  { id: 'hero',    on: false, name: 'Moving hero',             what: 'A silent video loop, or photos that change slowly.',                     still: 'One still photo. The video never loads.' },
  { id: 'strip',   on: false, name: 'Moving text strip',       what: 'The offer line rolls slowly across the page.',                           still: 'One still line.' },
  { id: 'slide',   on: false, name: 'Sliding card row',        what: 'Class and coach cards become a row you swipe.',                          still: 'A plain grid with every card showing.' },
  { id: 'word',    on: false, name: 'Changing word',           what: 'One word in the headline swaps every two seconds.',                      still: 'A fixed headline.' },
  { id: 'pin',     on: false, name: 'Pinned section',          what: 'A photo holds still while the classes scroll past. The day picker stays on screen in the schedule.', still: 'Plain cards.' },
];
export const FX_DEFAULTS = Object.fromEntries(FX.map(f => [f.id, f.on]));

export const ORDER = ['film', 'timetable', 'calm', 'mono'];

export const RECIPES = {

  /* 1. One video carries the page. */
  film: {
    id: 'film', gym: 'litoral', name: 'Film',
    line: 'One video carries the page. Dark, wide type, the price always on screen.',
    suits: 'A gym or club with one good short video.',
    needs: 'Logo, one color, one short silent video (or four photos), classes, schedule, prices.',
    try: 'Scroll down slowly. The pitch lights up word by word, then one photo holds still while the classes scroll past it.',
    voice: 'roof', follow: 'pill',
    tokens: { mode: 'dark', ground: 'neutral', type: 'wide', scale: 2.75, space: 'airy', corners: 'square', photo: 'original' },
    fx: { lightup: true, hero: true, pin: true },
    blocks: [
      'menuBar', 'heroFilm', ['offerStrip', { variant: 'thin', tone: 'line' }], 'statement',
      ['classCards', { variant: 'photo' }], ['scheduleList', { band: true }], 'coaches',
      ['priceCards', { band: true }], 'reviews', 'footer',
    ],
  },

  /* 2. The schedule is the design. */
  timetable: {
    id: 'timetable', gym: 'salanorte', name: 'Timetable',
    line: 'The schedule is the page. You can book from the first screen.',
    suits: 'A class studio that lives on its timetable. Works with no photos at all.',
    needs: 'Logo, one color, classes, schedule, prices. Coach photos help. No other photos needed.',
    try: 'Watch the headline: one word keeps changing. In the schedule the day picker stays on screen. The class and coach cards are rows you swipe.',
    voice: 'next', follow: 'duo',
    tokens: { mode: 'light', ground: 'neutral', type: 'plain', scale: 2.75, space: 'comfortable', corners: 'soft', photo: 'original' },
    fx: { word: true, slide: true, pin: true },
    blocks: [
      ['offerStrip', { variant: 'thin', tone: 'accent' }], 'menuBar', ['heroSplit', { side: 'today' }],
      ['scheduleCards', { band: true }], 'statement', ['classCards', { variant: 'plain' }], 'coaches',
      ['firstVisit', { variant: 'split', photo: 0, band: true }], 'priceCards', ['reviews', { band: true }], 'footer',
    ],
  },

  /* 3. Quiet, light and easy to read. */
  calm: {
    id: 'calm', gym: 'vaiven', name: 'Calm',
    line: 'Quiet, light and easy to read. Three photos and a serif headline.',
    suits: 'Yoga, pilates, barre and wellness studios.',
    needs: 'Logo, one color, three to six photos, classes, schedule, prices.',
    try: 'Only the three safe effects are on here. Open Motion and switch the others on one at a time to see each one alone.',
    voice: 'pace', follow: 'duo',
    tokens: { mode: 'light', ground: 'tinted', type: 'serif', scale: 2.75, space: 'airy', corners: 'round', photo: 'original' },
    fx: {},
    blocks: [
      ['offerStrip', { variant: 'thin', tone: 'band' }], 'menuBar', 'heroTiles', 'bookingBar', 'statement',
      ['classCards', { variant: 'photo' }], ['scheduleList', { band: true }], ['firstVisit', { variant: 'split', photo: 3 }],
      ['priceCards', { band: true }], 'coaches', 'reviews', 'footer',
    ],
  },

  /* 4. Black, black and white photos, tall capitals. */
  mono: {
    id: 'mono', gym: 'tramo', name: 'Mono',
    line: 'Black page, black and white photos, tall capitals. One color, only on buttons.',
    suits: 'Boxing, strength and conditioning gyms.',
    needs: 'Logo, one color, three or four photos (any quality: they turn black and white), classes, schedule, prices.',
    try: 'The hero steps through three photos, one per class. Under it the class names roll past in outlined capitals.',
    voice: 'lines', follow: 'bar',
    tokens: { mode: 'dark', ground: 'pure', type: 'condensed', scale: 3.1, space: 'compact', corners: 'square', photo: 'bw' },
    fx: { hero: true, strip: true },
    blocks: [
      'menuBar', 'heroSlideshow', ['offerStrip', { variant: 'loud' }], 'statement',
      ['classCards', { variant: 'plain' }], ['scheduleList', { band: true }], ['firstVisit', { variant: 'band', photo: 3 }],
      'coaches', ['priceCards', { band: true }], 'reviews', 'footer',
    ],
  },
};
