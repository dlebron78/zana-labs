/* data.js: what an owner supplies. Four invented gyms.
   Name, logo, one brand color (plus a second to try), photos, maybe a video, classes, the week's schedule,
   coaches, prices, a few member quotes and the address. No layout, no fonts, no effects in here.
   Every gym, person and quote below is made up for this demo. */

const P = '../gym-page/img/';   // free stock photos (Unsplash License), shared with the older gym page prototype
const C = 'img/';               // portraits cropped from those photos
const M = 'media/';             // the demo video loop

const b = (en, es) => ({ en, es });

/* one schedule row per line: weekdays (1 = Monday ... 7 = Sunday), time, class, coach, room size */
const week = rows => rows.flatMap(([days, time, cls, coach, cap]) => [...days].map(d => ({ dow: +d % 7, time, cls, coach, cap })));

/* the same six faces appear at more than one gym: the photo library is small */
const FACE = {
  diego:   { name: 'Diego R.',   photo: C + 'coach-diego.jpg' },
  paola:   { name: 'Paola T.',   photo: C + 'coach-paola.jpg' },
  sofia:   { name: 'Sofía L.',   photo: C + 'coach-sofia.jpg' },
  camila:  { name: 'Camila S.',  photo: C + 'coach-camila.jpg' },
  andres:  { name: 'Andrés P.',  photo: C + 'coach-andres.jpg' },
  valeria: { name: 'Valeria M.', photo: C + 'coach-valeria.jpg' },
  luis:    { name: 'Luis O.' },      // no photo on purpose: blocks fall back to initials
  elena:   { name: 'Elena V.' },
};
const coach = (id, role) => ({ id, ...FACE[id], role });

const ALL = b('All levels', 'Todos los niveles');
const BEG = b('Beginners welcome', 'Para principiantes');

export const GYMS = {

  /* ------------------------------------------------------------------ 1 */
  litoral: {
    id: 'litoral', name: 'Litoral',
    kind: b('Training club', 'Club de entrenamiento'),
    hood: 'Condado', area: 'Condado, San Juan',
    brand: '#E3A72F', brand2: '#FF5A3C', brandNames: [b('Gold', 'Dorado'), b('Coral', 'Coral')],
    logo: { word: 'Litoral', mark: '<circle cx="16" cy="16" r="12.5" fill="none" stroke="currentColor" stroke-width="3"/><path d="M4.5 19.5h23" stroke="currentColor" stroke-width="3"/>' },
    video: { wide: M + 'film-wide.mp4', tall: M + 'film-tall.mp4', posterWide: M + 'film-wide.jpg', posterTall: M + 'film-tall.jpg' },
    photos: [
      { src: P + 'gym-floor.jpg', shape: 'wide' }, { src: P + 'trainer-client.jpg', shape: 'wide' },
      { src: P + 'gym-spin.jpg', shape: 'wide' }, { src: P + 'yoga-class.jpg', shape: 'wide' },
    ],
    offer: b('First class free', 'Primera clase gratis'),
    classes: [
      { id: 'strength', name: b('Strength', 'Fuerza'), mins: 60, level: ALL, photo: P + 'trainer-client.jpg', pos: '40% 50%',
        blurb: b('Barbells, kettlebells and a coach who checks every lift. You leave knowing what to do next time.', 'Barras, pesas rusas y un coach que revisa cada levantamiento. Sales sabiendo qué hacer la próxima vez.') },
      { id: 'ride', name: b('Cycling', 'Cycling'), mins: 45, level: ALL, photo: P + 'gym-spin.jpg', pos: '62% 50%',
        blurb: b('Forty-five minutes on the bike, lights low and music up. You set your own resistance.', 'Cuarenta y cinco minutos en la bici, luces bajas y música alta. Tú decides tu resistencia.') },
      { id: 'yoga', name: b('Yoga', 'Yoga'), mins: 60, level: BEG, photo: P + 'yoga-class.jpg', pos: '50% 40%',
        blurb: b('A steady flow to open up what the week closed. Mats and blocks are in the room.', 'Un flow pausado para soltar lo que la semana apretó. Hay mats y bloques en el salón.') },
      { id: 'open', name: b('Open gym', 'Gimnasio abierto'), mins: 90, level: b('Members', 'Miembros'), photo: P + 'gym-floor.jpg', pos: '60% 50%',
        blurb: b('The floor is yours: racks, machines and free weights, with a coach on hand for questions.', 'El piso es tuyo: racks, máquinas y peso libre, con un coach cerca para tus preguntas.') },
    ],
    coaches: [
      coach('diego', b('Strength', 'Fuerza')), coach('valeria', b('Cycling', 'Cycling')),
      coach('andres', b('Yoga', 'Yoga')), coach('camila', b('Strength', 'Fuerza')),
    ],
    schedule: week([
      ['12345', '05:45', 'strength', 'diego', 14], ['12345', '07:00', 'ride', 'valeria', 22],
      ['135', '09:00', 'yoga', 'andres', 18], ['24', '09:00', 'strength', 'camila', 14],
      ['12345', '12:15', 'ride', 'valeria', 22], ['12345', '13:30', 'open', null, 24],
      ['12345', '17:30', 'strength', 'camila', 14], ['1234', '18:45', 'ride', 'valeria', 22],
      ['24', '18:45', 'yoga', 'andres', 18],
      ['6', '08:00', 'strength', 'diego', 14], ['6', '09:30', 'ride', 'valeria', 22],
      ['67', '10:45', 'yoga', 'andres', 18], ['67', '12:00', 'open', null, 24],
    ]),
    prices: [
      { name: b('Single class', 'Clase suelta'), price: 25, line: b('Try any class, no commitment.', 'Prueba cualquier clase, sin compromiso.'),
        ticks: [b('Any class on the schedule', 'Cualquier clase del horario'), b('Use it within 30 days', 'Úsala en 30 días'), b('Towel included', 'Incluye toalla')] },
      { name: b('10-class pack', 'Paquete de 10'), price: 210, featured: true, line: b('Come twice a week and it lasts five.', 'Ven dos veces por semana y te dura cinco.'),
        ticks: [b('Any class on the schedule', 'Cualquier clase del horario'), b('Use them within 4 months', 'Úsalas en 4 meses'), b('Share one with a friend', 'Comparte una con un amigo')] },
      { name: b('Unlimited', 'Ilimitado'), price: 159, monthly: true, line: b('Train as often as you like.', 'Entrena cuantas veces quieras.'),
        ticks: [b('Unlimited classes and open gym', 'Clases y gimnasio abierto ilimitados'), b('Book up to 7 days ahead', 'Reserva hasta 7 días antes'), b('Pause once a year', 'Pausa una vez al año')] },
    ],
    reviews: [
      { who: 'Carla M.', q: b('I came for one free class in March. I have missed four days since.', 'Vine a una clase gratis en marzo. Desde entonces he faltado cuatro días.') },
      { who: 'Javier R.', q: b('Diego fixed my deadlift in ten minutes. Two years of back pain, gone.', 'Diego me arregló el peso muerto en diez minutos. Dos años de dolor de espalda, fuera.') },
      { who: 'Natalia V.', q: b('The 5:45 crew is the reason I get out of bed.', 'El grupo de las 5:45 es la razón por la que me levanto.') },
    ],
    place: {
      addr: ['Avenida Ashford', 'Condado, San Juan, PR 00907'], phone: '787-555-0114', email: 'hola@litoral.example',
      hours: [b('Mon to Fri, 5:30 AM to 9 PM', 'Lun a vie, 5:30 a. m. a 9 p. m.'), b('Sat and Sun, 7 AM to 1 PM', 'Sáb y dom, 7 a. m. a 1 p. m.')],
    },
  },

  /* ------------------------------------------------------------------ 2 */
  salanorte: {
    id: 'salanorte', name: 'Sala Norte',
    kind: b('Class studio', 'Estudio de clases'),
    hood: 'Hato Rey', area: 'Hato Rey, San Juan',
    brand: '#2447F9', brand2: '#FF5A1F', brandNames: [b('Cobalt', 'Cobalto'), b('Orange', 'Naranja')],
    logo: { word: 'Sala Norte', mark: '<path d="M16 3.5 28 27H4z" fill="currentColor"/>' },
    photos: [
      { src: P + 'gym-spin.jpg', shape: 'wide' }, { src: P + 'coach-woman.jpg', shape: 'tall', pos: '50% 30%' }, { src: P + 'box-ropes.jpg', shape: 'wide' },
    ],
    offer: b('First class free', 'Primera clase gratis'),
    classes: [
      { id: 'cycling', name: b('Cycling', 'Cycling'), mins: 45, level: ALL,
        blurb: b('Hills, sprints and a playlist worth the sweat. Shoes are at the front desk.', 'Cuestas, sprints y una playlist que vale el sudor. Las zapatillas están en recepción.') },
      { id: 'boxing', name: b('Boxing', 'Boxeo'), mins: 50, level: BEG,
        blurb: b('Bag rounds and footwork, no sparring. Gloves and wraps are here if you need them.', 'Rondas de saco y juego de pies, sin sparring. Aquí hay guantes y vendas si te hacen falta.') },
      { id: 'hiit', name: b('HIIT', 'HIIT'), mins: 45, level: ALL,
        blurb: b('Short rounds at full effort with real rest in between. Every move has an easier option.', 'Rondas cortas a todo esfuerzo con descanso de verdad. Cada ejercicio tiene una opción más fácil.') },
      { id: 'strength', name: b('Strength', 'Fuerza'), mins: 60, level: ALL,
        blurb: b('Squat, press and pull with a coach watching your form. Twelve people at most.', 'Sentadilla, press y jalón con un coach mirando tu técnica. Doce personas como máximo.') },
      { id: 'yoga', name: b('Yoga', 'Yoga'), mins: 60, level: BEG,
        blurb: b('An hour to slow down and stretch out. The best class to end a long week.', 'Una hora para bajar el ritmo y estirar. La mejor clase para cerrar una semana larga.') },
    ],
    coaches: [
      coach('paola', b('Boxing and HIIT', 'Boxeo y HIIT')), coach('valeria', b('Cycling', 'Cycling')),
      coach('diego', b('Strength', 'Fuerza')), coach('andres', b('Yoga', 'Yoga')), coach('luis', b('Cycling and HIIT', 'Cycling y HIIT')),
    ],
    schedule: week([
      ['12345', '06:00', 'cycling', 'valeria', 20], ['135', '07:15', 'hiit', 'paola', 16], ['24', '07:15', 'strength', 'diego', 12],
      ['12345', '12:10', 'boxing', 'paola', 14], ['1234', '17:30', 'cycling', 'luis', 20], ['12345', '18:30', 'hiit', 'luis', 16],
      ['135', '19:30', 'boxing', 'paola', 14], ['24', '19:30', 'yoga', 'andres', 18],
      ['6', '09:00', 'cycling', 'valeria', 20], ['6', '10:15', 'boxing', 'paola', 14],
      ['7', '09:30', 'yoga', 'andres', 18], ['7', '10:45', 'strength', 'diego', 12],
    ]),
    prices: [
      { name: b('Single class', 'Clase suelta'), price: 20, line: b('Drop in to any class.', 'Entra a cualquier clase.'),
        ticks: [b('Any class, any coach', 'Cualquier clase y coach'), b('Use it within 30 days', 'Úsala en 30 días'), b('Gear to borrow', 'Equipo prestado')] },
      { name: b('8-class pack', 'Paquete de 8'), price: 136, line: b('Two classes a week for a month.', 'Dos clases por semana durante un mes.'),
        ticks: [b('Any class, any coach', 'Cualquier clase y coach'), b('Use them within 2 months', 'Úsalas en 2 meses'), b('Bring a friend once', 'Trae a un amigo una vez')] },
      { name: b('Unlimited', 'Ilimitado'), price: 129, monthly: true, featured: true, line: b('Every class, every day.', 'Todas las clases, todos los días.'),
        ticks: [b('Unlimited classes', 'Clases ilimitadas'), b('Book up to 7 days ahead', 'Reserva hasta 7 días antes'), b('Cancel anytime', 'Cancela cuando quieras')] },
    ],
    reviews: [
      { who: 'Mariana C.', q: b('I book on the way and I am on the bike twenty minutes later.', 'Reservo de camino y veinte minutos después estoy en la bici.') },
      { who: 'Omar D.', q: b('Paola remembers what I did last week better than I do.', 'Paola se acuerda de lo que hice la semana pasada mejor que yo.') },
      { who: 'Isabel F.', q: b('Five kinds of classes means I never get bored. Sunday yoga is my reset.', 'Con cinco tipos de clases nunca me aburro. El yoga del domingo es mi reinicio.') },
    ],
    place: {
      addr: ['Avenida Ponce de León', 'Hato Rey, San Juan, PR 00918'], phone: '787-555-0127', email: 'hola@salanorte.example',
      hours: [b('Mon to Fri, 5:30 AM to 9 PM', 'Lun a vie, 5:30 a. m. a 9 p. m.'), b('Sat and Sun, 8 AM to 1 PM', 'Sáb y dom, 8 a. m. a 1 p. m.')],
    },
  },

  /* ------------------------------------------------------------------ 3 */
  vaiven: {
    id: 'vaiven', name: 'Vaivén',
    kind: b('Yoga and pilates', 'Yoga y pilates'),
    hood: 'Ocean Park', area: 'Ocean Park, San Juan',
    brand: '#BF5536', brand2: '#2F6B4F', brandNames: [b('Terracotta', 'Terracota'), b('Forest', 'Bosque')],
    logo: { word: 'Vaivén', mark: '<path d="M4 20c4-11 20-11 24 0" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M9 26.5c3-6.5 11-6.5 14 0" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>' },
    photos: [
      { src: P + 'yoga-garden.jpg', shape: 'tall', pos: '50% 62%' }, { src: P + 'pilates-arches.jpg', shape: 'tall', pos: '50% 50%' },
      { src: P + 'yoga-room.jpg', shape: 'wide', pos: '62% 50%' }, { src: P + 'pilates-studio.jpg', shape: 'wide' },
      { src: P + 'yoga-stretch.jpg', shape: 'tall' }, { src: P + 'yoga-flow.jpg', shape: 'wide' },
    ],
    offer: b('First class free', 'Primera clase gratis'),
    classes: [
      { id: 'flow', name: b('Yoga flow', 'Yoga flow'), short: b('Yoga', 'Yoga'), mins: 60, level: ALL, photo: P + 'yoga-flow.jpg', pos: '58% 40%',
        blurb: b('A steady, breath-led flow that builds strength and calm. Mats and props provided.', 'Un flow pausado, guiado por la respiración, que da fuerza y calma. Mats y accesorios incluidos.') },
      { id: 'reformer', name: b('Reformer', 'Reformer'), short: b('pilates', 'pilates'), mins: 50, level: ALL, photo: P + 'pilates-studio.jpg', pos: '50% 60%',
        blurb: b('Low impact, deep work on the reformer. Eight machines, so you are never lost in a crowd.', 'Bajo impacto y trabajo profundo en el reformer. Ocho máquinas, así nunca te pierdes en el grupo.') },
      { id: 'mat', name: b('Mat pilates', 'Pilates mat'), mins: 50, level: BEG, photo: P + 'yoga-stretch.jpg', pos: '50% 50%',
        blurb: b('Core, posture and control with nothing but a mat. The best place to start.', 'Centro, postura y control con solo un mat. El mejor lugar para empezar.') },
      { id: 'restore', name: b('Restorative', 'Restaurativo'), mins: 75, level: ALL, photo: P + 'yoga-room.jpg', pos: '55% 50%',
        blurb: b('Long, supported poses and a quiet room. You will sleep well tonight.', 'Posturas largas con apoyo y un salón en silencio. Esta noche vas a dormir bien.') },
    ],
    coaches: [
      coach('andres', b('Yoga', 'Yoga')), coach('sofia', b('Reformer', 'Reformer')), coach('elena', b('Mat and restorative', 'Mat y restaurativo')),
    ],
    schedule: week([
      ['135', '06:30', 'flow', 'andres', 16], ['24', '07:00', 'reformer', 'sofia', 8],
      ['12345', '09:00', 'reformer', 'sofia', 8], ['12345', '10:15', 'mat', 'elena', 14],
      ['135', '12:00', 'flow', 'andres', 16], ['1234', '17:30', 'reformer', 'sofia', 8],
      ['12345', '18:45', 'flow', 'andres', 16], ['24', '20:00', 'restore', 'elena', 14],
      ['67', '08:30', 'flow', 'andres', 16], ['67', '10:00', 'reformer', 'sofia', 8], ['7', '17:00', 'restore', 'elena', 14],
    ]),
    prices: [
      { name: b('Single class', 'Clase suelta'), price: 24, line: b('Come when it suits you.', 'Ven cuando te convenga.'),
        ticks: [b('Any mat class', 'Cualquier clase de mat'), b('Reformer for $8 more', 'Reformer por $8 más'), b('Mat and props included', 'Mat y accesorios incluidos')] },
      { name: b('5-class pack', 'Paquete de 5'), price: 105, featured: true, line: b('A class a week, with room to skip one.', 'Una clase por semana, con espacio para faltar una.'),
        ticks: [b('Any class, reformer too', 'Cualquier clase, también reformer'), b('Use them within 2 months', 'Úsalas en 2 meses'), b('Share one with a friend', 'Comparte una con una amiga')] },
      { name: b('Unlimited', 'Ilimitado'), price: 149, monthly: true, line: b('Make it a daily practice.', 'Hazlo tu práctica diaria.'),
        ticks: [b('Unlimited classes', 'Clases ilimitadas'), b('Book up to 10 days ahead', 'Reserva hasta 10 días antes'), b('Pause for travel', 'Pausa si viajas')] },
    ],
    reviews: [
      { who: 'Lucía B.', q: b('The only hour of my day when nobody needs anything from me.', 'La única hora del día en que nadie necesita nada de mí.') },
      { who: 'Rafael S.', q: b('I could not touch my toes in January. Sofía was patient about it.', 'En enero no me tocaba los pies. Sofía tuvo paciencia conmigo.') },
      { who: 'Adriana G.', q: b('Eight reformers means she actually sees what I am doing.', 'Con ocho reformers, de verdad ve lo que estoy haciendo.') },
    ],
    place: {
      addr: ['Calle McLeary', 'Ocean Park, San Juan, PR 00911'], phone: '787-555-0139', email: 'hola@vaiven.example',
      hours: [b('Mon to Fri, 6 AM to 9 PM', 'Lun a vie, 6 a. m. a 9 p. m.'), b('Sat and Sun, 8 AM to 6 PM', 'Sáb y dom, 8 a. m. a 6 p. m.')],
    },
  },

  /* ------------------------------------------------------------------ 4 */
  tramo: {
    id: 'tramo', name: 'Tramo',
    kind: b('Boxing and strength', 'Boxeo y fuerza'),
    hood: 'Santurce', area: 'Santurce, San Juan',
    brand: '#E5262A', brand2: '#C8F23C', brandNames: [b('Red', 'Rojo'), b('Lime', 'Lima')],
    logo: { word: 'Tramo', mark: '<path d="M5 27 13 5h6L11 27zM17 27l8-22h4l-8 22z" fill="currentColor"/>' },
    photos: [
      { src: P + 'box-ropes.jpg', shape: 'wide', pos: '60% 45%' }, { src: P + 'box-floor.jpg', shape: 'wide' },
      { src: P + 'box-rig.jpg', shape: 'tall', pos: '50% 55%' }, { src: P + 'coach-plan.jpg', shape: 'wide', pos: '45% 40%' }, { src: P + 'coach-man.jpg', shape: 'wide' },
    ],
    offer: b('First class free', 'Primera clase gratis'),
    classes: [
      { id: 'boxing', name: b('Boxing', 'Boxeo'), mins: 60, level: BEG, photo: P + 'box-ropes.jpg', pos: '62% 45%',
        blurb: b('Twelve rounds of bag work, footwork and core. No sparring, no ego.', 'Doce rondas de saco, juego de pies y abdomen. Sin sparring y sin ego.') },
      { id: 'strength', name: b('Strength', 'Fuerza'), mins: 60, level: ALL, photo: P + 'box-floor.jpg', pos: '50% 60%',
        blurb: b('Heavy basics done well: squat, press, pull. Your numbers go on the board.', 'Lo básico, pesado y bien hecho: sentadilla, press y jalón. Tus números van a la pizarra.') },
      { id: 'hiit', name: b('HIIT', 'HIIT'), mins: 45, level: ALL, photo: P + 'box-rig.jpg', pos: '50% 58%',
        blurb: b('Sleds, ropes and rowers against the clock. Forty-five minutes and you are done.', 'Trineos, sogas y remos contra el reloj. Cuarenta y cinco minutos y terminaste.') },
    ],
    coaches: [
      coach('paola', b('Boxing', 'Boxeo')), coach('diego', b('Strength', 'Fuerza')), coach('camila', b('HIIT', 'HIIT')),
    ],
    schedule: week([
      ['12345', '05:30', 'strength', 'diego', 12], ['12345', '06:45', 'boxing', 'paola', 16],
      ['135', '12:00', 'hiit', 'camila', 16], ['24', '12:00', 'boxing', 'paola', 16],
      ['12345', '17:00', 'boxing', 'paola', 16], ['12345', '18:15', 'strength', 'diego', 12], ['1234', '19:30', 'hiit', 'camila', 16],
      ['6', '08:00', 'boxing', 'paola', 16], ['6', '09:15', 'strength', 'diego', 12], ['6', '10:30', 'hiit', 'camila', 16],
    ]),
    prices: [
      { name: b('Day pass', 'Pase de un día'), price: 18, line: b('One class, today.', 'Una clase, hoy.'),
        ticks: [b('Any class on the schedule', 'Cualquier clase del horario'), b('Gloves to borrow', 'Guantes prestados'), b('Good for today only', 'Válido solo hoy')] },
      { name: b('10 classes', '10 clases'), price: 160, featured: true, line: b('The one most people start with.', 'Con el que casi todos empiezan.'),
        ticks: [b('Any class on the schedule', 'Cualquier clase del horario'), b('Use them within 3 months', 'Úsalas en 3 meses'), b('One free pair of wraps', 'Un par de vendas gratis')] },
      { name: b('Unlimited', 'Ilimitado'), price: 119, monthly: true, line: b('Train every day we are open.', 'Entrena todos los días que abrimos.'),
        ticks: [b('Unlimited classes', 'Clases ilimitadas'), b('Book up to 7 days ahead', 'Reserva hasta 7 días antes'), b('Cancel anytime', 'Cancela cuando quieras')] },
    ],
    reviews: [
      { who: 'Kevin A.', q: b('Never boxed before. Paola had me throwing a clean jab in one class.', 'Nunca había boxeado. Paola me tuvo tirando un jab limpio en una clase.') },
      { who: 'Daniela P.', q: b('No mirrors, no phones, no small talk. Exactly what I wanted.', 'Sin espejos, sin teléfonos y sin charla. Justo lo que quería.') },
      { who: 'Héctor L.', q: b('My numbers are on the board and they go up every month.', 'Mis números están en la pizarra y suben todos los meses.') },
    ],
    place: {
      addr: ['Calle Cerra', 'Santurce, San Juan, PR 00907'], phone: '787-555-0156', email: 'hola@tramo.example',
      hours: [b('Mon to Fri, 5 AM to 9 PM', 'Lun a vie, 5 a. m. a 9 p. m.'), b('Saturday, 7:30 AM to 12 PM', 'Sábado, 7:30 a. m. a 12 p. m.')],
    },
  },
};
