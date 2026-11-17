/* Member home: the notes beside the phone. For the person reviewing the design, so English only. */

export const PATTERNS = {
  tabs: { name: 'Bottom tabs', tag: 'The pick', line: 'A bar at the bottom: Home, Schedule, Workouts and Me (her initials). A tab shows only when she has something for it. Schedule takes the place of the pinned Book button.' },
  book: { name: 'Home + Book', tag: 'Earlier pick', line: 'One home, in time order. One Book button pinned at the bottom. Everything else is under the gym\'s name at the top.' },
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
    ['Her plan, buy more', 'The plan card on Home, with its one offer. Me holds the rest: every option, receipts, card.'],
    ['Book', 'The Schedule tab, one tap from anywhere. Home also ends with "+ Book another class".'],
    ['Workouts', 'Today\'s booked class carries its workout on Home. The Workouts tab has every track, history and bests.'],
    ['News', 'The gym\'s notice, in the gym\'s color, at the top of Home.'],
    ['Warnings', 'Top of Home. While she is on another tab, a red dot on Home says something needs her.'],
    ['Upselling', 'One offer, on the plan card. It moves to the top only when a pack runs out.'],
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
        'Three tabs: Home, Schedule, Me. No Workouts tab, because yoga posts no workouts.',
        'Fix 5: her plan card says she comes about twice a week, about $217 a month one by one, and offers Unlimited at $159. Switch to Unlimited opens a pretend checkout.',
        'Fix 3: on tonight\'s yoga, tap Cancel booking. It is more than 2 hours away, so the warning says the $25 stays as a credit. Cancel, then book Thursday: it uses the credit.',
        'Schedule is one tap from any screen. It opens on yoga, her usual.',
        'Me (her initials) holds her bookings, payments, receipts and the language.',
      ],
      weak: 'Three tabs while Marta at the same gym has four, so two friends see slightly different bars. That is the point of the rule, but it is worth knowing.',
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
        'Book a class stays at the bottom however long the workouts get, and This week ends with Book another class, which opens the same schedule. Try Wednesday at 6:00 PM: it is full, so the button becomes Join the waitlist.',
        'She is on the top plan, so she sees no offer.',
      ],
      weak: 'Her history and personal bests are two taps away: Tablado, then Workouts. On a day when all four tracks post, the home is long, though each extra track costs one line.',
    },
    tabs: {
      steps: [
        'Four tabs: Home, Schedule, Workouts, Me.',
        'Tonight\'s 6:00 PM class is on Home with its workout open. Log score works here.',
        'Fix 3: tap Cancel booking on it. It starts in under 2 hours, but she is on Unlimited, so the warning only says her spot goes to the next person.',
        'Workouts has all four tracks, her recent results and personal bests.',
        'Schedule, Wednesday 6:00 PM is full: Join the waitlist.',
      ],
      weak: 'Today\'s workout shows on Home and in Workouts, so there are two places to log. Four tabs is also the ceiling: events, a shop or a check-in code would each ask for a fifth.',
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
        'Three tabs: Home, Workouts, Me. No Schedule, because Nico books the sessions.',
        'The bar is Repecho\'s green. That color and the logo are all Nico set up.',
        'Home: Nico\'s note, today\'s program day with tick-offs, Thursday\'s session, and 2 sessions left with an offer.',
        'When clients can book a 1:1 themselves (PHO-365), a Schedule tab appears as Book a session.',
      ],
      weak: 'Home and Workouts show the same program day. For a trainer with few clients the bar is thin, but it is the same app as a big gym\'s.',
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
        'Red card on top: Mateo\'s $65 did not go through. Pay $65 clears it.',
        'Fix 4: This week ends with two rows, "Book a class for you" and "Book a class for Mateo".',
        'Tap the Mateo row. Schedule opens with a big Booking for switch, Mateo picked, and only Teens classes. Book: the message names Mateo.',
        'Fix 3: book her usual Saturday yoga (her last pack class), then cancel it. It is days away, so the warning says the class goes back to her pack.',
        'Me holds Family: Mateo\'s plan and his waiver.',
      ],
      weak: 'Tabs sort by feature, and her question is "for whom". The switch on Schedule answers it, but Me still mixes her plan and Mateo\'s.',
    },
    menu: {
      steps: [
        'Pay and the Saturday lines work the same.',
        'Booking for Mateo from another page: the name, Schedule, Mateo, the class, Book.',
      ],
      weak: 'Five taps, and the first one is hidden. The red card and the offer also push the Book row down the page.',
    },
  },
  luis: {
    title: 'Luis, overdue',
    who: 'Luis is on Unlimited at Tablado. His $159 for this month did not go through on Nov 15. Use the In grace and Grace over switch at the top to see both states.',
    tabs: {
      steps: [
        'In grace: a red card on top says the $159 is overdue and he can keep booking until Friday, Nov 20. His Thursday class stays booked and Book still works.',
        'Switch to Grace over. The card says booking is paused. In Schedule every class reads Pay first.',
        'Tap a class: the one button is Pay $159. Pay, and the sheet comes back with Book.',
        'On another tab, a red dot on Home says something needs him.',
      ],
      weak: 'Grace days are a placeholder (5 days). The real number is each gym\'s setting, which has no screen yet (PHO-181).',
    },
    book: {
      steps: ['The same red card and Pay first, with the Book button pinned at the bottom instead of tabs.'],
      weak: 'Same as with tabs.',
    },
    menu: {
      steps: ['The same red card and Pay first. Schedule sits under the gym\'s name.'],
      weak: 'Same as with tabs, plus the hidden first tap.',
    },
  },
};
