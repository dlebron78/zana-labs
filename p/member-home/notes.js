/* Member home: the notes beside the phone. For the person reviewing the design, so English only. */

export const PATTERNS = {
  book: { name: 'Home + Book', tag: 'The pick', line: 'One home, in time order. One Book button pinned at the bottom. Everything else is under the gym\'s name at the top.' },
  tabs: { name: 'Bottom tabs', tag: 'Runner-up', line: 'The proposal: a bar at the bottom with Home, Schedule, Workouts and Account. A tab hides when the member has nothing for it.' },
  menu: { name: 'Menu only', tag: 'Third', line: 'Like the staff app: a home, and a menu under the name. Booking is one of the menu lines, plus a row on the home.' },
};

/* Daniel's own list, and where each item sits in each layout. */
export const CORE = {
  book: [
    ['Her plan, buy more', 'One card on the home. It carries a single offer when she pays per class or her pack is at 2 or fewer.'],
    ['Book', 'Pinned at the bottom of the home. One tap, and it never scrolls away.'],
    ['Workouts', 'Inside today\'s class on the home. Other tracks are one line each.'],
    ['News', 'One line under the bar. Tap to read.'],
    ['Warnings', 'Top of the home. Red when something goes wrong if she ignores it, blue when it can wait.'],
    ['Upselling', 'One offer, at her plan, and under the button when she pays for a class. It moves to the top only when her pack runs out, in blue, with Not now. Booking is pinned, so an offer cannot push it down.'],
  ],
  tabs: [
    ['Her plan, buy more', 'On Home, and again inside the Account tab. Two places to keep in step.'],
    ['Book', 'The Schedule tab. One tap, the same as the pick.'],
    ['Workouts', 'On Home, and again in the Workouts tab.'],
    ['News', 'On Home only. She sees it when she passes through Home.'],
    ['Warnings', 'On Home only. On another tab she needs a red dot on the Home tab to know.'],
    ['Upselling', 'A card on Home. When a gym wants more, the pull is to add a Shop tab.'],
  ],
  menu: [
    ['Her plan, buy more', 'The same card on the home as the pick.'],
    ['Book', 'Under the name: two taps, the first one hidden. The row on the home scrolls away.'],
    ['Workouts', 'The same as the pick.'],
    ['News', 'The same as the pick.'],
    ['Warnings', 'The same as the pick.'],
    ['Upselling', 'The same place, but every card added to the home pushes the Book row further down.'],
  ],
};

export const OWNER = {
  tablado: 'Nothing for this screen. The logo comes from Settings and the bar stays Zana black because Tablado picked no color. Posting a news line is optional. Offers come from the gym\'s own price list.',
  repecho: 'Nothing for this screen. Nico picked a logo and a color in Settings. The offer comes from his own price list.',
};

export const NOTES = {
  ines: {
    title: 'Inés, yoga drop-in',
    who: 'Inés comes to yoga at Tablado twice a week, Tuesday and Thursday at 6:30 PM. She has no plan. She pays $25 each time.',
    book: {
      steps: [
        'Tonight\'s class is on top, already booked.',
        'Under it is her usual Thursday class. Tap Book. It costs her $25, so a sheet shows the price before anything is charged.',
        'Look under the black button in that sheet, and at Your plan on the home. One offer: 5 classes for $99, the gym\'s intro price for a first pack.',
        'Buy the pack. Now her usual class books in one tap and the offer is gone.',
        'Book a class at the bottom opens on yoga, because that is what she takes. Show all classes is one more tap.',
      ],
      weak: 'Nothing big for her. She has no workouts, so nothing about workouts shows, not even an empty place. "Your usual" needs two weeks of bookings, so a brand-new member does not get it yet.',
    },
    tabs: {
      steps: [
        'The same home, the same offer.',
        'Booking Thursday without the shortcut is four taps, the same as the pick: Schedule tab, Thursday, the class, Book and pay.',
        'The Account tab holds her payments, the waiver and the language.',
      ],
      weak: 'It works. But the bar is three tabs and one of them she opens once a month. Marta has four tabs at the same gym, so two friends see two different apps.',
    },
    menu: {
      steps: [
        'The home is the same, but Book a class is now a row on the page.',
        'From any other page, booking is: the name, Schedule, the day, the class, Book. The first tap is hidden.',
      ],
      weak: 'On her short home the Book row is easy to see. On every other page, the thing she does twice a week sits behind the name.',
    },
  },
  marta: {
    title: 'Marta, on 4 tracks',
    who: 'Marta has the Unlimited plan at Tablado. It covers four tracks: Cross-training, Weightlifting, Gymnastics and Endurance. She books the 6:00 PM class and logs her score after.',
    book: {
      steps: [
        'A blue notice on top: Thursday has a different coach. Got it clears it.',
        'Tonight\'s 6:00 PM class comes next with its workout open. The other three tracks are one line each. Tap one to open it.',
        'Tap Log score. Type 190 for the squat and 12:41 for the time, then Save. 190 beats her best, and the card says so.',
        'Book a class stays at the bottom however long the workouts get. Try Wednesday at 6:00 PM: it is full, so the button becomes Join the waitlist.',
        'She is on the top plan, so she sees no offer.',
      ],
      weak: 'Her history and personal bests are two taps away: Tablado, then Workouts. On a day when all four tracks post, the home is long, though each extra track costs one line.',
    },
    tabs: {
      steps: [
        'The same home, the same workout card.',
        'The Workouts tab shows the same four workouts again, with her history under them.',
        'Schedule is one tap, the same as the Book button.',
      ],
      weak: 'Today\'s workout lives in two places, so "where do I log it?" has two answers. Four tabs is also the ceiling: events, a shop or a check-in code would each ask for a fifth.',
    },
    menu: {
      steps: [
        'The notice, the workout and three track lines fill the first screen.',
        'The Book row is under all of that. She has to scroll to it, or open the menu.',
      ],
      weak: 'This is the problem Daniel named: four tracks push booking out of view.',
    },
  },
  rafa: {
    title: 'Rafa, 1:1 client',
    who: 'Rafa trains one-on-one with Nico, a solo trainer whose business is Repecho. He bought 8 sessions and follows a written program on the days between.',
    book: {
      steps: [
        'The bar is Repecho\'s green. That color and the logo are all Nico set up.',
        'On top, a note from Nico about Monday\'s workout.',
        'Today\'s program day has four lines. Tap a circle to tick one off.',
        'Then the next session, Thursday at 7:00 AM. "Can\'t make it?" opens one sheet to cancel.',
        'Your plan says 2 sessions left, with one offer: 8 more for $320.',
        'There is no Book button, because Nico books the sessions. Nothing empty stands in its place.',
      ],
      weak: 'Nothing is missing for him. When clients can book a 1:1 themselves (card PHO-475, "Later: a client books a 1:1 from the coach\'s open times"), the same bottom button appears as Book a session.',
    },
    tabs: {
      steps: [
        'The bar has three tabs: Home, Workouts, Account. Schedule is hidden.',
        'Home and Workouts show the same program day.',
      ],
      weak: 'For a trainer with 3 clients this is a tab bar with one useful tab. It makes a small business look like a half-empty big one.',
    },
    menu: {
      steps: ['With nothing to book, this is the same screen as the pick.'],
      weak: 'Nothing. For Rafa the pick and menu-only are identical.',
    },
  },
  carmen: {
    title: 'Carmen, parent of Mateo',
    who: 'Carmen takes Mateo, 12, to Teens on Saturday at 9:00 AM and does yoga next door at the same hour. She pays for both: her own 5-class pack and his monthly plan.',
    book: {
      steps: [
        'Red card on top: Mateo\'s payment did not go through. Pay $65 opens one sheet with one button.',
        'Saturday shows twice. Mateo\'s Teens class is the next thing, tagged with his name. Under This week is her usual yoga, with a Book button.',
        'Her pack has 1 class left, so Your plan carries one offer: the next pack up.',
        'Tap Book on her usual yoga. It uses her last class, and a blue notice now offers the next pack. Not now sends the offer back down to her plan.',
        'Tap Book a class. The first question is who it is for: Me or Mateo. Pick Mateo and only Teens classes show.',
        'Family, under Tablado, shows Mateo\'s plan and his signed waiver.',
      ],
      weak: 'Zana has no screen today for a parent acting for a child, and no card for it. Adding a child still happens at the desk.',
    },
    tabs: {
      steps: [
        'Home mixes her things and Mateo\'s, the same as the pick.',
        'Schedule needs the Me or Mateo switch. Account needs it again for the two plans.',
      ],
      weak: 'Tabs sort by feature. Her question is "for whom". The answer has to be repeated inside each tab.',
    },
    menu: {
      steps: [
        'Pay and the Saturday lines work the same.',
        'Booking for Mateo from another page: the name, Schedule, Mateo, the class, Book.',
      ],
      weak: 'Five taps, and the first one is hidden. The red card and the offer also push the Book row down the page.',
    },
  },
};
