/* ==========================================================================
   MENDIZ — ¿Qué Mendiz es para ti? (que-mendiz-es-para-ti.html)
   Asesor por pasos: una pregunta por pantalla hasta llegar a un modelo.

   · Sigue el árbol de decisión del ERP (js/data/niveles-decision.js), del
     nivel 1 al 7: tipo de bicicleta → disciplina → modalidad → material del
     cuadro → sistema de eje → gama de carbono → versión. Los niveles 8–10
     (horquilla, transmisión y ruedas) son del montaje: se eligen en la ficha
     o en el configurador («Configura tu Mendiz»).
   · Cada modelo (MODELS) lleva el código ERP de cada nivel y sus variantes:
     la versión Standard (una por gama de carbono) y, si la tiene, la edición
     MPL (MPL). Cada respuesta filtra las variantes; un nivel solo se
     pregunta si las que quedan tienen más de un valor. Con una sola, el
     resultado.
   · Cada paso es una «página» con su propia dirección en el hash:
       (sin hash)                                 introducción y «Empezar»
       #/                                         primera pregunta (tipo)
       #/convencional/carretera/performance/sl    … el resultado
     Una dirección que empieza por una disciplina (#/carretera, #/gravel,
     #/montana: los enlaces del mega-menú) arranca con esa disciplina ya
     elegida. Funcionan atrás y adelante del navegador y el resultado se
     puede compartir.
   · El marcado se genera con las clases de siempre (.bike-card, .btn,
     .eyebrow, .heading-editorial…). Estilos propios en css/que-mendiz.css.
   ========================================================================== */
(() => {
  const root = document.querySelector('[data-finder]');
  const NIVELES = window.MENDIZ_NIVELES;
  if (!root || !NIVELES) return;
  const dealer = document.querySelector('[data-finder-dealer]');

  // Modelos ------------------------------------------------------------------
  // Textos, precios, fotos y enlaces tomados de los listados de categoría.
  // erp: niveles 1–5 en código ERP (eje solo en las rígidas de aluminio).
  // gamas: gamas de carbono de la versión Standard (null = sin dato).
  // mpl: su edición MPL (MPL), si la tiene.
  const MODELS = {
    'f14-sl-slp': {
      name: 'F14 SL-SLP', tag: 'Carretera · Rendimiento', claim: 'Sube ligero. Mantén el ritmo.',
      text: 'Para entrenar y competir en recorridos variados, con subidas, llanos y bajadas.',
      price: 'Desde 3.490 €', href: 'f14-sl-slp.html', custom: 'configurador-f14.html?modelo=f14-sl-slp',
      img: 'assets/img/f14-sl-slp/f14-sl-slp-card-1200.webp', w: 1200, h: 800, alt: 'Mendiz F14 SL-SLP · Blanco',
      erp: { tipo: 'CONV', disciplina: 'ROAD', modalidad: 'PERFORMANCE', material: 'CARBON' },
      gamas: ['CARBON SL', 'CARBON SLP'], mpl: 'f14-mpl',
    },
    'f12-sl': {
      name: 'F12 SL', tag: 'Carretera · Aero', claim: 'Encuentra tu ritmo en el llano.',
      text: 'Para rodar rápido en asfalto. La F12 SL combina perfiles aerodinámicos y una posición más baja y alargada, con un cuadro de carbono SL.',
      price: 'Desde 3.390 €', href: 'f12-sl.html', custom: 'https://www.bicismendiz.com/bicicletas/carretera/mendiz-f12sl-configurador',
      img: 'assets/img/f12-sl/f12-sl-card-1200.webp', w: 1200, h: 800, alt: 'Mendiz F12 SL · Azul metalizado',
      erp: { tipo: 'CONV', disciplina: 'ROAD', modalidad: 'AERO', material: 'CARBON' },
      gamas: ['CARBON SL', 'CARBON SLP'],
    },
    'f9-sl': {
      name: 'F9 SL', tag: 'Carretera · Gran fondo', claim: 'Gran fondo a tu ritmo.',
      text: 'La F9 SL está pensada para pasar horas en carretera. Su geometría de gran fondo acerca el manillar y eleva la posición sobre un cuadro de carbono SL.',
      price: 'Desde 2.640 €', href: 'f9-sl.html', custom: 'https://www.bicismendiz.com/bicicletas/carretera/mendiz-f9sl-configurador',
      img: 'assets/img/f9-sl/f9-sl-card-1200.webp', w: 1200, h: 800, alt: 'Mendiz F9 SL · Naranja / Negro',
      erp: { tipo: 'CONV', disciplina: 'ROAD', modalidad: 'ENDURANCE', material: 'CARBON' },
      gamas: ['CARBON SL'], mpl: 'f9-mpl',
    },
    'tt10': {
      name: 'TT10', tag: 'Carretera · Triatlón', claim: 'Diseñada para rodar acoplado.',
      text: 'Para triatlón y contrarreloj. La TT10 trabaja la aerodinámica del conjunto y la posición del ciclista con un cuadro de carbono SL y manillar integrado.',
      price: 'Desde 7.100 €', href: 'tt10.html', custom: 'https://www.bicismendiz.com/bicicletas/carretera/mendiz-tt10-only-configurador',
      img: 'assets/img/tt10/tt10-card-1200.webp', w: 1200, h: 800, alt: 'Mendiz TT10 · Rosa / Negro',
      erp: { tipo: 'CONV', disciplina: 'ROAD', modalidad: 'TT', material: 'CARBON' },
      gamas: ['CARBON SL'],
    },
    'g12-sl': {
      name: 'G12 SL', tag: 'Gravel racing · Carbono', claim: 'Ritmo en las pistas. Libertad en la ruta.',
      text: 'La G12 SL combina carbono SuperLight y geometría gravel racing para enlazar pistas y asfalto. Una propuesta para entrenar, competir y variar el recorrido.',
      price: 'Desde 2.150 €', href: 'g12-sl.html', custom: 'https://www.bicismendiz.com/bicicletas/carretera/mendiz-g12sl-configurador',
      img: 'assets/img/g12-sl/g12-sl-card-1200.webp', w: 1200, h: 800, alt: 'Mendiz G12 SL · Marrón tierra',
      erp: { tipo: 'CONV', disciplina: 'GRAVEL', modalidad: 'GRVL_RCNG', material: 'CARBON' },
      gamas: ['CARBON SL'], mpl: 'g12-mpl',
    },
    'g11am': {
      name: 'G11AM', tag: 'Aventura · Carbono', claim: 'Haz sitio para una ruta más larga.',
      text: 'Para bikepacking y rutas all-road. La G11AM combina carbono SL, geometría racing confort y una pequeña flexión trasera para acompañarte por pistas y carretera.',
      price: 'Desde 2.250 €', href: 'g11am.html',
      img: 'assets/img/g11am/g11am-card-1200.webp', w: 1200, h: 800, alt: 'Mendiz G11AM · Verde',
      erp: { tipo: 'CONV', disciplina: 'GRAVEL', modalidad: 'GRVL_XPLR', material: 'CARBON' },
      gamas: [null], mpl: 'g11am-mpl',
    },
    'g4-icr': {
      name: 'G4.ICR', tag: 'Aventura · Aluminio', claim: 'Empieza por un camino. Sigue explorando.',
      text: 'La G4.ICR combina cuadro de aluminio y horquilla de carbono. Una geometría cómoda y fijaciones para equipaje te permiten preparar rutas por pistas, asfalto y caminos.',
      price: 'Desde 1.390 €', href: 'g4-icr.html',
      img: 'assets/img/g4-icr/g4-icr-card-1200.webp', w: 1200, h: 800, alt: 'Mendiz G4.ICR · Arena',
      erp: { tipo: 'CONV', disciplina: 'GRAVEL', modalidad: 'GRVL_XPLR', material: 'ALLOY' },
    },
    'x40-sl-icr': {
      name: 'X40 SL-ICR', tag: 'Carbono · Doble suspensión', claim: 'Sube con ritmo. Baja con control.',
      text: 'La X40 SL-ICR reúne cuadro de carbono SL, suspensión vertical y geometría de XC. Para entrenar y competir buscando respuesta en subida y control al bajar.',
      price: 'Desde 1.840 €', href: 'x40-sl-icr.html', custom: 'https://www.bicismendiz.com/bicicletas/mtb/mendiz-x40-sl-icr-configurador',
      img: 'assets/img/x40-sl-icr/x40-sl-icr-card-1200.webp', w: 1200, h: 800, alt: 'Mendiz X40 SL-ICR · Gris',
      erp: { tipo: 'CONV', disciplina: 'MTB', modalidad: 'DO_SUSXC', material: 'CARBON' },
      gamas: ['CARBON SL'],
    },
    'x21-sl': {
      name: 'X21 SL', tag: 'Carbono · Rígida', claim: 'Una rígida con ganas de circuito.',
      text: 'La X21 SL es la rígida de carbono de la gama. Su geometría deportiva y su construcción SL están pensadas para entrenar y competir en circuitos de montaña.',
      price: 'Desde 1.490 €', href: 'x21-sl.html',
      img: 'assets/img/x21-sl/x21-sl-card-1200.webp', w: 1200, h: 800, alt: 'Mendiz X21 SL · Rojo burdeos',
      erp: { tipo: 'CONV', disciplina: 'MTB', modalidad: 'HARDTRAIL', material: 'CARBON' },
      gamas: ['CARBON SL'],
    },
    'x10-boost': {
      name: 'X10 BOOST', tag: 'Aluminio · Rígida', claim: 'Más caminos en tus salidas.',
      text: 'La X10 BOOST parte de un cuadro rígido de aluminio y ruedas de 29 pulgadas. Sus ejes más anchos refuerzan el conjunto para afrontar tus rutas de montaña.',
      price: 'Desde 990 €', href: 'x10-boost.html',
      img: 'assets/img/x10-boost/x10-boost-card-1200.webp', w: 1200, h: 800, alt: 'Mendiz X10 BOOST · Negro',
      erp: { tipo: 'CONV', disciplina: 'MTB', modalidad: 'HARDTRAIL', material: 'ALLOY', eje: 'BOOST' },
    },
    'x10': {
      name: 'X10', tag: 'Aluminio · Rígida', claim: 'Tu próxima ruta empieza aquí.',
      text: 'La X10 combina cuadro de aluminio, ruedas de 29 pulgadas y geometría deportiva. Para empezar en la montaña y seguir descubriendo pistas y senderos.',
      price: 'Desde 850 €', href: 'x10.html',
      img: 'assets/img/x10/x10-card-1200.webp', w: 1200, h: 800, alt: 'Mendiz X10 · Plata',
      erp: { tipo: 'CONV', disciplina: 'MTB', modalidad: 'HARDTRAIL', material: 'ALLOY', eje: 'QR' },
    },
    'ex41': {
      name: 'EX41', tag: 'Eléctrica · Montaña', claim: 'Más montaña en cada salida.',
      text: 'La EX41 combina doble suspensión, cuadro de carbono y asistencia Polini. Una e-MTB para afrontar desniveles y explorar la montaña con una batería de 880 Wh.',
      price: 'Desde 3.650 €', href: 'ex41.html', custom: 'https://www.bicismendiz.com/node/5306',
      img: 'assets/img/ex41/ex41-card-1200.webp', w: 1200, h: 800, alt: 'Mendiz EX41 · Gris',
      erp: { tipo: 'E-BIKE', disciplina: 'MTB', modalidad: 'DO_SUSTRL', material: 'CARBON' },
      gamas: [null],
    },
    'ef21': {
      name: 'EF21', tag: 'Eléctrica · Carretera · Carbono', claim: 'Sigue la ruta, también cuando sube.',
      text: 'La EF21 combina un cuadro de carbono y motor central Polini. Para seguir disfrutando de las salidas de carretera con una asistencia que acompaña tu esfuerzo.',
      price: 'Desde 5.290 €', href: 'ef21.html',
      img: 'assets/img/ef21/ef21-card-1200.webp', w: 1200, h: 800, alt: 'Mendiz EF21 · Azul',
      erp: { tipo: 'E-BIKE', disciplina: 'ROAD', modalidad: 'ENDURANCE', material: 'CARBON' },
      gamas: [null], mpl: 'ef21-mpl',
    },
    'ef4': {
      name: 'EF4', tag: 'Eléctrica · Carretera · Aluminio', claim: 'Carretera para seguir sumando kilómetros.',
      text: 'La EF4 une cuadro de aluminio, horquilla de carbono y motor Polini. Su geometría de gran fondo está pensada para acompañarte durante largas jornadas de carretera.',
      price: 'Desde 4.290 €', href: 'ef4.html',
      img: 'assets/img/ef4/ef4-card-1200.webp', w: 1200, h: 800, alt: 'Mendiz EF4 · Negro / Rojo',
      erp: { tipo: 'E-BIKE', disciplina: 'ROAD', modalidad: 'ENDURANCE', material: 'ALLOY' },
      mpl: 'ef4-mpl',
    },
    'eg21': {
      name: 'EG21', tag: 'Eléctrica · Gravel · Carbono', claim: 'La ruta sigue más allá del asfalto.',
      text: 'Para enlazar carretera, pistas y caminos. La EG21 combina cuadro de carbono, paso para cubiertas de 700 × 50 y asistencia de un motor central Polini.',
      price: 'Desde 5.390 €', href: 'eg21.html',
      img: 'assets/img/eg21/eg21-card-1200.webp', w: 1200, h: 800, alt: 'Mendiz EG21 · Arena',
      erp: { tipo: 'E-BIKE', disciplina: 'GRAVEL', modalidad: 'GRVL_XPLR', material: 'CARBON' },
      gamas: [null], mpl: 'eg21-mpl',
    },
    'eg4': {
      name: 'EG4', tag: 'Eléctrica · Gravel · Aluminio', claim: 'Pon rumbo a los caminos.',
      text: 'La EG4 combina aluminio, horquilla de carbono y motor Polini. Está pensada para rutas por pistas, grava y asfalto, con una postura cómoda y asistencia al pedaleo.',
      price: 'Desde 4.290 €', href: 'eg4.html',
      img: 'assets/img/eg4/eg4-card-1200.webp', w: 1200, h: 800, alt: 'Mendiz EG4 · Negro / Arena',
      erp: { tipo: 'E-BIKE', disciplina: 'GRAVEL', modalidad: 'GRVL_XPLR', material: 'ALLOY' },
      mpl: 'eg4-mpl',
    },
  };

  // Ediciones MPL (versión MPL del ERP). Textos, precios y enlaces de mpl.html.
  // gama: solo la F14 MPL tiene el dato (Mendiz Sport Carbon, montajes F14S).
  const MPL = {
    'f14-mpl': {
      name: 'F14 MPL', tag: 'Carretera · Rendimiento', claim: 'Ligera, rápida y al alcance de más ciclistas.',
      text: 'Para entrenar y competir en carretera con el cuadro de carbono de la F14.',
      price: 'Desde 2.150 €', href: 'f14-sl-slp.html?cuadro=mpl#montajes', custom: 'montaje-f14-mpl.html', customLabel: 'Ver montaje MPL',
      img: 'assets/img/mpl/f14-mpl-1200.webp', w: 1200, h: 800, alt: 'Mendiz F14 MPL en verde inglés con detalles en oro, vista lateral',
      gama: 'CARBON S',
    },
    'f9-mpl': {
      name: 'F9 MPL', tag: 'Carretera · Gran fondo', claim: 'Calidad Mendiz para todos los ruteros.',
      text: 'Para salidas largas de carretera con una posición cómoda.',
      price: 'Desde 2.050 €', href: 'https://www.bicismendiz.com/bicicletas/carretera/mendiz-f9-mpl',
      img: 'assets/img/mpl/f9-mpl-1200.webp', w: 1200, h: 800, alt: 'Mendiz F9 MPL en crema con detalles en oro, vista lateral',
    },
    'g12-mpl': {
      name: 'G12 MPL', tag: 'Gravel · Racing', claim: 'Calidad Mendiz para todos los gravel riders.',
      text: 'Para rodar rápido por pistas y caminos.',
      price: 'Desde 2.190 €', href: 'https://www.bicismendiz.com/bicicletas/carretera/mendiz-g12-mpl',
      img: 'assets/img/mpl/g12-mpl-1200.webp', w: 1200, h: 800, alt: 'Mendiz G12 MPL en verde degradado, vista lateral',
    },
    'g11am-mpl': {
      name: 'G11AM MPL', tag: 'Gravel · Aventura', claim: 'Comodidad para las largas distancias.',
      text: 'Para viajes y rutas largas por caminos, con una posición cómoda.',
      price: 'Desde 2.280 €', href: 'https://www.bicismendiz.com/bicicletas/electricas/mendiz-g11am-mpl',
      img: 'assets/img/mpl/g11am-mpl-1200.webp', w: 1200, h: 800, alt: 'Mendiz G11AM MPL en verde, vista lateral',
    },
    'ef21-mpl': {
      name: 'EF21 MPL', tag: 'Eléctrica · Carretera · Carbono', claim: 'Mucha autonomía, geometría de carretera.',
      text: 'Para salidas de carretera con asistencia al pedaleo y cuadro de carbono.',
      price: 'Desde 4.580 €', href: 'https://www.bicismendiz.com/bicicletas/electricas/mendiz-ef21-mpl',
      img: 'assets/img/mpl/ef21-mpl-1200.webp', w: 1200, h: 800, alt: 'Mendiz EF21 MPL en azul, vista lateral',
    },
    'ef4-mpl': {
      name: 'EF4 MPL', tag: 'Eléctrica · Carretera · Aluminio', claim: 'eRoad de gran fondo.',
      text: 'Para largas jornadas de carretera con confort y gran autonomía.',
      price: 'Desde 3.990 €', href: 'https://www.bicismendiz.com/bicicletas/electricas/mendiz-ef4-mpl',
      img: 'assets/img/mpl/ef4-mpl-1200.webp', w: 1200, h: 800, alt: 'Mendiz EF4 MPL en rojo y negro, vista lateral',
    },
    'eg21-mpl': {
      name: 'EG21 MPL', tag: 'Eléctrica · Gravel · Carbono', claim: 'Que las subidas no limiten tus rutas.',
      text: 'Para combinar pistas y carretera con asistencia al pedaleo y cuadro de carbono.',
      price: 'Desde 4.760 €', href: 'https://www.bicismendiz.com/bicicletas/electricas/mendiz-eg21-mpl',
      img: 'assets/img/mpl/eg21-mpl-1200.webp', w: 1200, h: 800, alt: 'Mendiz EG21 MPL en crema, vista lateral',
    },
    'eg4-mpl': {
      name: 'EG4 MPL', tag: 'Eléctrica · Gravel · Aluminio', claim: 'Autonomía y potencia para los caminos.',
      text: 'Para viajar por pistas y caminos con asistencia al pedaleo y cuadro de aluminio.',
      price: 'Desde 4.190 €', href: 'https://www.bicismendiz.com/bicicletas/electricas/mendiz-eg4mpl',
      img: 'assets/img/mpl/eg4-mpl-1200.webp', w: 1200, h: 800, alt: 'Mendiz EG4 MPL en negro y crema, vista lateral',
    },
  };

  // Variantes: lo que se filtra. Una por gama de la versión Standard y, si
  // existe, la MPL. card: la ficha que se muestra en el resultado.
  const VARIANTS = Object.entries(MODELS).flatMap(([id, m]) => {
    const base = { model: id, eje: null, ...m.erp };
    const list = (m.gamas || [null]).map((gama) => ({ ...base, gama, version: 'STANDARD', card: m }));
    if (m.mpl) list.push({ ...base, gama: MPL[m.mpl].gama || null, version: 'MPL', card: MPL[m.mpl] });
    return list;
  });

  // Niveles ------------------------------------------------------------------
  // Los siete primeros del ERP. any: admite «Sin preferencia» (gama y versión).
  const ANY = 'sin-preferencia';
  const LEVELS = NIVELES.slice(0, 7).map((lv) => ({
    ...lv,
    any: ['gama', 'version'].includes(lv.field),
    byErp: new Map(lv.options.map((o) => [o.erp, o])),
  }));
  const DISCIPLINE = LEVELS.find((lv) => lv.field === 'disciplina');

  // Opciones de un nivel con las variantes que quedan, en el orden del ERP
  function optionsFor(level, cands) {
    const values = new Set(cands.map((v) => v[level.field]).filter((x) => x != null));
    return level.options.filter((o) => values.has(o.erp));
  }

  // Rutas ---------------------------------------------------------------------
  const PREFIX = '#/';
  const INTRO = '#inicio';   // cualquier hash que no empiece por #/ es la introducción

  // Recorre los niveles con los segmentos de la dirección. Se salta los que
  // no tienen nada que elegir y se para en la primera pregunta sin respuesta
  // (o con una respuesta que no existe). Si el primer segmento es una
  // disciplina, se toma como punto de partida (preset).
  function resolve(segs) {
    const preset = DISCIPLINE.options.find((o) => o.id === segs[0]);
    const rest = preset ? segs.slice(1) : segs;
    let cands = preset ? VARIANTS.filter((v) => v.disciplina === preset.erp) : VARIANTS;
    const answers = [];
    for (let i = 0; i < LEVELS.length; i += 1) {
      if (cands.length === 1) break;
      const level = LEVELS[i];
      const opts = optionsFor(level, cands);
      if (opts.length < 2) continue;
      const seg = rest[answers.length];
      const opt = seg === ANY && level.any
        ? { id: ANY, title: 'Sin preferencia' }
        : opts.find((o) => o.id === seg);
      if (!opt) return { preset, question: { level, index: i, opts, cands }, answers };
      answers.push({ level, opt });
      if (opt.id !== ANY) cands = cands.filter((v) => v[level.field] === opt.erp);
    }
    return { preset, result: { cands }, answers };
  }

  // La última ruta completa que se ha recorrido: al volver atrás se marca la
  // respuesta que se había elegido.
  const LAST = 'mendiz-finder-last';
  const store = {
    get: () => { try { return sessionStorage.getItem(LAST) || ''; } catch { return ''; } },
    set: (v) => { try { sessionStorage.setItem(LAST, v); } catch { /* sin almacenamiento */ } },
  };

  // Marcado -------------------------------------------------------------------
  const icon = (name, cls = '') => `<span class="material-symbols-outlined${cls ? ` ${cls}` : ''}" aria-hidden="true">${name}</span>`;

  function bar(answers, ratio, isResult, preset) {
    const done = answers.length;
    const base = preset ? [preset.id] : [];
    const href = (segs) => PREFIX + [...base, ...segs].join('/');
    // Desde la primera pregunta, «Atrás» vuelve a la introducción
    const back = done ? href(answers.slice(0, -1).map((a) => a.opt.id)) : INTRO;
    const status = isResult ? 'Tu resultado' : `Paso ${done + 1}`;
    const answersTrail = answers.map((a, i) => {
      const to = href(answers.slice(0, i).map((x) => x.opt.id));
      const text = a.opt.id === ANY ? `${a.level.label}: sin preferencia` : a.opt.title;
      return `<li><a href="${to}" aria-label="Cambiar ${a.level.label.toLowerCase()}: ${text}">${text}</a></li>`;
    }).join('');
    // La disciplina de partida (#/carretera…): al cambiarla se empieza de cero
    const trail = (preset ? `<li><a href="${PREFIX}" aria-label="Cambiar disciplina: ${preset.title}">${preset.title}</a></li>` : '') + answersTrail;
    return `
      <div class="finder__bar">
        <a class="finder__back" href="${back}">${icon('arrow_back')}<span>Atrás</span></a>
        <p class="finder__status" aria-live="polite">${status}</p>
        ${done || preset ? `<a class="finder__restart" href="${PREFIX}">${icon('restart_alt')}<span>Empezar de nuevo</span></a>` : '<span class="finder__restart" aria-hidden="true"></span>'}
      </div>
      <div class="finder__meter" role="progressbar" aria-label="Progreso" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(ratio * 100)}">
        <span style="--p:${lastRatio}" data-p="${ratio}"></span>
      </div>
      ${trail ? `<nav class="finder__trail" aria-label="Tus respuestas"><span>Tus respuestas</span><ol>${trail}</ol></nav>` : ''}`;
  }

  // Tarjetas con foto, como las del configurador («Configura tu Mendiz»): el
  // término del ERP en pequeño (title), un titular en lenguaje llano (plain) y
  // una explicación para quien no conoce el término (story).
  function question({ level, opts }, answers, base) {
    const segs = [...base, ...answers.map((a) => a.opt.id)];
    const href = (id) => PREFIX + [...segs, id].join('/');
    // Respuesta elegida antes (si se vuelve atrás por la misma ruta)
    const last = store.get().replace(PREFIX, '').split('/').filter(Boolean);
    const prev = segs.every((s, i) => last[i] === s) ? last[segs.length] : null;
    const all = level.any
      ? [...opts, { id: ANY, plain: 'Todavía no lo sé', story: 'No pasa nada: seguimos sin filtrar y te enseñamos la opción más accesible. Podrás compararlas en la ficha.', icon: 'help' }]
      : opts;

    const options = all.map((o) => {
      const chosen = o.id === prev ? ' is-chosen' : '';
      const mark = chosen ? '<span class="finder-option__chosen">Tu elección</span>' : '';
      return `
        <li>
          <a class="finder-option finder-option--photo${o.id === ANY ? ' ofy-option--any' : ''}${chosen}" href="${href(o.id)}">
            ${media(level, o)}
            <span class="finder-option__body">
              ${o.title ? `<span class="finder-option__term">${o.title}</span>` : ''}
              <span class="finder-option__head"><span class="heading-card finder-option__title">${o.plain || o.title}</span>${icon('arrow_forward', 'finder-option__arrow')}</span>
              <span class="finder-option__text">${o.story || o.text}</span>
              ${mark}
            </span>
          </a>
        </li>`;
    }).join('');

    return `
      <div class="finder__step">
        <header class="finder__head">
          <span class="eyebrow">${level.label}</span>
          <h1 class="heading-editorial finder__question" id="finder-title" tabindex="-1">${level.q}</h1>
          <p class="finder__help">${level.help}</p>
        </header>
        <ul class="finder__options finder__options--photo finder__options--n${all.length}">${options}</ul>
      </div>`;
  }

  // Imagen de cada opción (mismas clases que js/ofy-asesor.js, en
  // css/ofy-asesor.css). Fotos en uso a sangre; cuadros, ejes y carbono
  // completos sobre gris. Sin foto (o si falla), el marcador con el icono.
  const placeholder = (name) => `<span class="ofy-placeholder" aria-hidden="true">${icon(name || 'image')}</span>`;
  function media(level, o) {
    if (o.id === ANY || !o.img) {
      return `<figure class="media finder-option__media ofy-media">${placeholder(o.icon)}</figure>`;
    }
    const isComponent = ['material', 'eje', 'gama'].includes(level.field) && !o.cover;
    return `<figure class="media finder-option__media ofy-media ofy-media--photo ${isComponent ? 'ofy-media--component' : 'ofy-media--lifestyle'}">
      <img src="${o.img}" alt="${o.alt || ''}" width="1200" height="800" decoding="async">
    </figure>`;
  }
  root.addEventListener('error', (e) => {
    if (!(e.target instanceof HTMLImageElement) || !e.target.closest('.ofy-media')) return;
    const figure = e.target.closest('.ofy-media');
    e.target.remove();
    figure.insertAdjacentHTML('afterbegin', placeholder());
  }, true);

  // Introducción: qué es, cómo funciona y botón para empezar
  function intro() {
    return `
      <div class="finder__step finder__start">
        <div class="finder__start-text">
          <span class="eyebrow">Te ayudamos a elegir</span>
          <h1 class="heading-editorial finder__title" id="finder-title" tabindex="-1">¿Qué Mendiz es para ti?</h1>
          <p class="lead muted finder__lead">Responde unas preguntas sobre el tipo de bici, el terreno y tu forma de rodar y te llevamos a la Mendiz que mejor encaja contigo.</p>
          <div class="finder__start-cta">
            <a class="btn btn--lg" href="${PREFIX}">Empezar${icon('arrow_forward')}</a>
            <p class="finder__note">Menos de un minuto</p>
          </div>
        </div>
        <figure class="media finder__start-media">
          <img src="assets/img/que-mendiz/intro-sendero.webp" alt="Ciclista con una Mendiz G11 y bolsa de sillín subiendo por una pista entre pinos" width="1200" height="900" fetchpriority="high" decoding="async">
        </figure>
      </div>`;
  }

  function card(m, { wide = false, why = [], lazy = false, level = 'h2' } = {}) {
    const reasons = why.length
      ? `<div class="finder__why"><p class="finder__why-title">Encaja contigo porque</p><ul>${why.map((w) => `<li>${icon('check')}<span>${w}</span></li>`).join('')}</ul></div>`
      : '';
    return `
      <article class="bike-card${wide ? ' bike-card--wide finder__match' : ''}">
        <div class="bike-card__media">
          <img src="${m.img}" alt="${m.alt}" width="${m.w}" height="${m.h}"${lazy ? ' loading="lazy"' : ''} decoding="async">
        </div>
        <div class="bike-card__body">
          <div class="bike-card__top"><span class="eyebrow">${m.tag}</span></div>
          <${level} class="bike-card__name display">${m.name}</${level}>
          <p class="bike-card__claim">${m.claim}</p>
          ${wide ? `<p class="bike-card__for">${m.text}</p>` : ''}
          ${reasons}
          <p class="bike-card__from">${m.price}</p>
          <div class="bike-card__foot">
            <div class="btn-row">
              ${wide && m.custom ? `<a class="btn btn--secondary" href="${m.custom}">${m.customLabel || 'Personalizar'}<span class="visually-hidden"> la ${m.name}</span></a>` : ''}
              <a class="btn bike-card__cta" href="${m.href}"><span aria-hidden="true">Conócela</span><span class="visually-hidden">Conoce la ${m.name}</span></a>
            </div>
          </div>
        </div>
      </article>`;
  }

  // Alternativas: otras bicis de la misma disciplina, primero las del mismo
  // tipo y modalidad, luego las del mismo tipo y después el resto.
  function alternatives(main) {
    const near = (v) => (v.tipo === main.tipo ? 0 : 2) + (v.modalidad === main.modalidad ? 0 : 1);
    const seen = new Set([main.card]);
    return VARIANTS
      .filter((v) => v.disciplina === main.disciplina)
      .toSorted((a, b) => near(a) - near(b))
      .filter((v) => (seen.has(v.card) ? false : seen.add(v.card)))
      .slice(0, 2)
      .map((v) => v.card);
  }

  function result({ cands }, answers) {
    // Si al final quedan varias (sin preferencia), la primera: la Standard de la gama más accesible
    const main = cands[0];
    const m = main.card;
    // Motivos: cada respuesta, con el término y su explicación en llano
    const why = answers
      .filter((a) => a.opt.id !== ANY)
      .map((a) => `<strong>${a.opt.title}.</strong> ${a.opt.plain || a.opt.text}.`);
    const also = alternatives(main);
    return `
      <div class="finder__step finder__result">
        <header class="finder__head">
          <span class="eyebrow">Tu Mendiz</span>
          <h1 class="heading-editorial finder__question" id="finder-title" tabindex="-1">La ${m.name} es para ti</h1>
        </header>
        <div class="bike-list bike-list--clean">${card(m, { wide: true, why })}</div>
        ${also.length ? `
        <section class="finder__also" aria-labelledby="finder-also-title">
          <h2 class="heading-section finder__also-title" id="finder-also-title">También te puede encajar</h2>
          <div class="bike-grid finder__also-grid">${also.map((a) => card(a, { lazy: true, level: 'h3' })).join('')}</div>
        </section>` : ''}
        <p class="finder__more">
          <a class="link-arrow" href="${PREFIX}">${icon('restart_alt')}<span>Volver a empezar</span></a>
          <a class="link-arrow" href="bicis.html"><span>Ver todas las bicis</span>${icon('arrow_forward')}</a>
        </p>
      </div>`;
  }

  // Pintado -------------------------------------------------------------------
  let firstRender = true;
  let lastRatio = 0;   // progreso del paso anterior: la barra crece (o baja) desde ahí

  function render() {
    const raw = decodeURIComponent(location.hash);

    // Introducción
    if (!raw.startsWith(PREFIX)) {
      root.innerHTML = intro();
      root.dataset.state = 'intro';
      if (dealer) dealer.hidden = true;
      document.title = '¿Qué Mendiz es para ti? | Mendiz';
      afterRender();
      return;
    }

    const segs = raw.slice(PREFIX.length).split('/').filter(Boolean);
    const state = resolve(segs);
    const { answers } = state;
    const base = state.preset ? [state.preset.id] : [];

    // Dirección no válida: se corrige sin dejar rastro en el historial
    const canonical = PREFIX + [...base, ...answers.map((a) => a.opt.id)].join('/');
    if (raw !== canonical) history.replaceState(null, '', canonical);

    const isResult = !!state.result;
    if (isResult) store.set(canonical);
    // El progreso avanza por niveles: los que se saltan también cuentan
    const ratio = isResult ? 1 : (state.question.index + 1) / (LEVELS.length + 1);

    root.innerHTML = bar(answers, ratio, isResult, state.preset) + (isResult ? result(state.result, answers) : question(state.question, answers, base));
    root.dataset.state = isResult ? 'result' : 'question';
    if (dealer) dealer.hidden = !isResult;

    const title = isResult ? `La ${state.result.cands[0].card.name} es para ti` : state.question.level.q;
    document.title = `${title} | Mendiz`;
    afterRender();
  }

  function afterRender() {
    const fill = root.querySelector('.finder__meter span');
    if (fill) {
      lastRatio = Number(fill.dataset.p);
      fill.getBoundingClientRect();   // fija el valor de partida para que la transición se vea
      fill.style.setProperty('--p', lastRatio);
    } else {
      lastRatio = 0;
    }
    // Al cambiar de paso: arriba del asesor y el foco en el titular
    if (!firstRender) {
      const top = root.getBoundingClientRect().top + window.scrollY - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0) - 16;
      if (window.scrollY > top) {
        if (window.MENDIZ?.lenis) window.MENDIZ.lenis.scrollTo(top, { immediate: true, force: true });
        else window.scrollTo(0, top);
      }
      root.querySelector('#finder-title')?.focus({ preventScroll: true });
    }
    firstRender = false;
  }

  window.addEventListener('hashchange', render);
  render();
})();
