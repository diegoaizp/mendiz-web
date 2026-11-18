/* ==========================================================================
   MENDIZ — Configurador (Only For You) · configurador-f14.html
   Columna con todas las secciones abiertas y opciones en tarjetas
   (.configurator-card). El montaje se elige como Grupo + Ruedas, y el color
   como uno de los tres de serie o «Personalizado», que abre el personalizador
   en un panel lateral.

   Datos: window.MENDIZ_F14 (js/data/f14-montajes.js) y window.MENDIZ_F14_COLORES
   (js/data/f14-colores.js). Lee de la URL ?montaje=, ?talla= y el color:
     de serie       ?color=blanco
     personalizado  ?pintura=personalizada&acabado=…&diseno=…&color=…
                    &color2=…&pegatinas=…   (?trama=… de enlaces antiguos = corte F14)

   · Cuadro (SL | SLP) → filtra los grupos.
   · Grupo → filtra las ruedas. Grupo + ruedas = un montaje de serie, que
     carga sus componentes. Al cambiar de grupo se conservan las ruedas si
     ese grupo las tiene; si no, se cargan las más económicas.
   · Ruedas: se cambian con el lápiz en Componentes, entre las
     que admite el grupo. Elegir unas carga su montaje.
   · Color: tres de serie (incluidos) o personalizado (+100 €, corte +100 €,
     premium +190 €). El personalizador va por pasos (acabado, diseño, color
     principal, color secundario, pegatinas): uno abierto cada vez y, al
     contestar, se abre el siguiente.
   ========================================================================== */

(() => {
  const data = window.MENDIZ_F14;
  const PZ = window.MENDIZ_F14_COLORES;
  const root = document.querySelector('[data-configurator]');
  if (!data || !PZ || !root) return;

  const DEFAULT_BUILD = 'F14SL.05';

  // Colores ------------------------------------------------------------------
  const FINISHES = { mate: 'Mate', brillo: 'Brillo' };
  const COLORS = [...PZ.colores.std, ...PZ.colores.premium];
  const find = (list, id) => list.find((x) => x.id === id);
  const colorOf = (id) => find(COLORS, id);
  const disenoOf = (id) => find(PZ.disenos, id);
  const color2Of = (diseno, id) => find(disenoOf(diseno)?.colores2 || [], id);
  // Un corte se puede elegir cuando ya tiene sus capas de color secundario
  const isReady = (d) => d.id === 'liso' || d.colores2?.length > 0;
  const pegOf = (id) => find(PZ.pegatinas, id);
  const serieOf = (id) => find(PZ.serie, id);
  const tierOf = (id) => (find(PZ.colores.premium, id) ? 'premium' : 'std');
  const LAYER = (name) => `${PZ.capas}${name}.webp`;
  // Muestra multicolor de la tarjeta «Personalizado» mientras no se ha elegido
  const RAINBOW = 'conic-gradient(from 200deg, #ea0016, #ff6025, #fde533, #4ec64e, #2ea7f7, #16207b, #c80050, #ea0016)';

  const SIZES = [
    { id: 'XS', stack: 520, reach: 380 },
    { id: 'S', stack: 533, reach: 388 },
    { id: 'M', stack: 554, reach: 389 },
    { id: 'L', stack: 575, reach: 397 },
    { id: 'XL', stack: 594, reach: 411 },
  ];

  // Componentes que se ven (y se cambian) en la columna del configurador, en
  // una sola lista sin grupos. El resto solo sale en el resumen («Tu F14»).
  const PARTS_SHOWN = [['Cuadro', 'Cuadro'], ['Bielas', 'Bielas'], ['Platos', 'Platos'], ['Ruedas', 'Ruedas'], ['Manillar', 'Manillar y potencia'], ['Sillín', 'Sillín']];

  // Jerarquía de la ficha técnica (resumen): grupo > etiqueta corta > valor
  const GROUPS = [
    ['Conjunto cuadro', [['Cuadro', 'Cuadro']]],
    ['Transmisión', [['Mandos', 'Mandos'], ['Cambio', 'Cambio'], ['Desviador', 'Desviador'], ['Bielas', 'Bielas'], ['Platos', 'Platos'], ['Cassette', 'Cassette']]],
    ['Frenos', [['Frenos', 'Frenos'], ['Disco', 'Discos']]],
    ['Ruedas', [['Ruedas', 'Ruedas']]],
    ['Cockpit', [['Manillar', 'Manillar y potencia']]],
    ['Componentes', [['Tija', 'Tija'], ['Sillín', 'Sillín']]],
  ];

  const FRAME_WEIGHT = { SL: '820 g', SLP: '720 g' };

  // Utilidades -------------------------------------------------------------
  const $ = (sel) => root.querySelector(sel);
  const $$ = (sel) => [...root.querySelectorAll(sel)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const eur = (n) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} €`;
  const delta = (n) => (n == null ? 'Precio por confirmar' : n === 0 ? 'Incluido' : `${n > 0 ? '+' : '−'}${eur(Math.abs(n))}`);
  const byCode = (code) => data.montajes.find((m) => m.code === code);
  const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const setText = (sel, text) => $$(sel).forEach((el) => { el.textContent = text; });
  const setHidden = (sel, hidden) => $$(sel).forEach((el) => { el.hidden = hidden; });
  const lower = (s) => s.charAt(0).toLowerCase() + s.slice(1);
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Tarjeta de opción: radio oculto + [muestra] + nombre +
  // detalle en gris + precio a la derecha. title/sub/aside llegan escapados.
  const card = ({ name, value, checked, title, sub = '', aside = '', asideMuted = false, attrs = '', lead = '', trail = '' }) => `
      <label class="configurator-card">
        <input type="radio" name="${name}" value="${esc(value)}"${attrs}${checked ? ' checked' : ''}>${lead}
        <span class="configurator-card__text">
          <span class="configurator-card__name">${title}</span>${sub ? `
          <span class="configurator-card__sub">${sub}</span>` : ''}
        </span>${aside ? `
        <span class="configurator-card__aside${asideMuted ? ' configurator-card__aside--muted' : ''}">${aside}</span>` : ''}${trail}
      </label>`;
  const chip = (sw) => `<span class="configurator-paint__chip" style="--sw:${sw}" aria-hidden="true"></span>`;
  // Tras repintar una lista, el foco vuelve a la opción elegida
  const refocus = (container, name) => container.querySelector(`input[name="${name}"]:checked`)?.focus();

  // Estado -----------------------------------------------------------------
  const params = new URLSearchParams(location.search);

  // Pintura: «serie» (uno de los tres de serie) o «custom» (personalizador).
  // custom guarda lo elegido en el personalizador aunque se vuelva a serie.
  function paintFromUrl() {
    const c = params.get('color');
    const serie = serieOf(c) ? c : PZ.serie[0].id;
    const finish = FINISHES[params.get('acabado')] ? params.get('acabado') : serieOf(serie).acabado;
    const custom = lookOfSerie(serieOf(serie), finish);
    const isCustom = params.get('pintura') === 'personalizada' || (c && !serieOf(c) && colorOf(c));
    if (isCustom) {
      if (colorOf(c)) custom.c1 = c;
      // ?trama= viene de enlaces anteriores al paso «Diseño»: era el corte F14
      const oldTrama = params.get('trama') && params.get('trama') !== 'none' ? params.get('trama') : null;
      const d = disenoOf(params.get('diseno')) || (oldTrama ? disenoOf('corte-f14') : null);
      if (d && d.id !== 'liso' && isReady(d) && tierOf(custom.c1) === 'std') {
        custom.diseno = d.id;
        custom.c2 = color2Of(d.id, params.get('color2') || oldTrama)?.id || d.colores2[0].id;
      }
      if (pegOf(params.get('pegatinas'))) custom.peg = params.get('pegatinas');
    }
    return { mode: isCustom ? 'custom' : 'serie', serie, finish, custom };
  }
  function lookOfSerie(s, finish = s.acabado) {
    return { c1: s.color, finish, diseno: 'liso', c2: null, peg: s.pegatinas };
  }

  const state = {
    build: byCode(params.get('montaje')) || byCode(DEFAULT_BUILD),
    paint: paintFromUrl(),
    origin: params.get('origen') === '3d' ? '3d' : 'psd',
    size: SIZES.some((s) => s.id === params.get('talla')) ? params.get('talla') : null,
    picks: {},      // clave del componente → índice de la opción elegida (0 = de serie)
    open: null,     // componente con las opciones abiertas
  };

  // Lo que se ve en la bici, sea de serie o personalizado
  // El acabado (mate/brillo) es uno solo para serie y personalizado
  const look = (p = state.paint) => (p.mode === 'serie' ? lookOfSerie(serieOf(p.serie), p.finish) : { ...p.custom, finish: p.finish });

  // Incremento de precio por color personalizado
  function colorExtra(p = state.paint) {
    if (p.mode !== 'custom') return 0;
    const c = p.custom;
    if (tierOf(c.c1) === 'premium') return PZ.precios.premium;
    return PZ.precios.color + (c.diseno !== 'liso' ? PZ.precios.corte : 0);
  }

  // «Blanco · brillo» o «Rojo · mate · personalizado»
  function paintText() {
    const l = look();
    return `${colorOf(l.c1).label} · ${lower(FINISHES[l.finish])}${state.paint.mode === 'custom' ? ' · personalizado' : ''}`;
  }
  // Detalle del personalizado: «Rojo mate · corte F14 en negro · pegatinas en oro»
  function customText(c = state.paint.custom) {
    return [
      `${colorOf(c.c1).label} ${lower(FINISHES[state.paint.finish])}`,
      c.diseno !== 'liso' ? `${lower(disenoOf(c.diseno).label)} en ${lower(color2Of(c.diseno, c.c2).label)}` : '',
      `pegatinas en ${lower(pegOf(c.peg).label)}`,
    ].filter(Boolean).join(' · ');
  }
  const buildText = (b = state.build) => `${b.grupo} · ${b.componentes.Ruedas}`;

  // Valor de serie de cada componente
  // Bielas del dato separadas en modelo y platos (desarrollos):
  //   «Shimano 105 7100 34/50»         → 105 7100 · [34/50]
  //   «Campagnolo 34-50/32-48»         → Campagnolo · [34/50, 32/48]
  //   «Shimano Ultegra 34/50 o 36/52»  → Shimano Ultegra · [34/50, 36/52]
  function crankOf(b = state.build) {
    const v = b.componentes.Bielas;
    const norm = (x) => x.replace('-', '/');
    let m = v.match(/^(.*?)\s+(\d+-\d+(?:\/\d+-\d+)+)$/);
    if (m) return { model: m[1], platos: m[2].split('/').map(norm) };
    m = v.match(/^(.*?)\s+(\d+[/-]\d+(?:\s+o\s+\d+[/-]\d+)+)$/);
    if (m) return { model: m[1], platos: m[2].split(/\s+o\s+/).map(norm) };
    m = v.match(/^(.*?)\s+(\d+[/-]\d+)$/);
    if (m) return { model: m[1], platos: [norm(m[2])] };
    return { model: v, platos: [] };
  }

  function baseValue(key, b = state.build) {
    const c = b.componentes;
    if (key === 'Bielas') return crankOf(b).model;
    if (key === 'Platos') return crankOf(b).platos[0] || 'Según montaje';
    if (key === 'Cuadro') return `F14 ${b.cuadro} · carbono MonoShell EPS+`;
    if (key === 'Manillar') return `${c.Manillar}, potencia ${c.Potencia.toLowerCase()}`;
    return c[key];
  }

  // Opciones de cada componente. La primera es siempre la de serie.
  // Devuelve null si el componente no se puede cambiar.
  function optionsFor(key) {
    const b = state.build;
    const value = baseValue(key);

    // Ruedas: las de los montajes del mismo cuadro y grupo, de la más
    // económica (de serie) a la más cara. Cada opción es un montaje; si
    // cambia algo más que las ruedas, se dice debajo.
    if (key === 'Ruedas') {
      const list = wheelsOf(b.cuadro, b.grupo);
      if (list.length < 2) return null;
      const base = list[0];
      return list.map((m) => {
        const also = Object.keys(m.componentes).filter((k) => k !== 'Ruedas' && m.componentes[k] !== base.componentes[k]);
        return {
          label: m.componentes.Ruedas,
          value: m.componentes.Ruedas,
          delta: m.precio - base.precio,
          build: m,
          sub: also.length ? `Cambia también: ${also.map(lower).join(', ').replace(/, ([^,]*)$/, ' y $1')}` : '',
        };
      });
    }

    // Platos: los desarrollos que admite el montaje (solo si hay más de uno)
    if (key === 'Platos') {
      const { platos } = crankOf(b);
      if (platos.length < 2) return null;
      return platos.map((v) => ({ label: v, value: v, delta: 0 }));
    }

    // Bielas: solo la longitud, sin repetir el modelo. En la fila se ve la
    // opción («Según talla (recomendada)», «172,5 mm»…); en el resumen, el
    // modelo con la longitud. Los platos van en su propia fila.
    if (key === 'Bielas') {
      return ['Según talla (recomendada)', '170 mm', '172,5 mm', '175 mm'].map((l, i) => ({
        label: l, row: l, value: `${value} · ${i === 0 ? 'según talla' : l}`, delta: 0, example: true,
      }));
    }

    if (key === 'Cassette') {
      // Variantes en el dato: «Campagnolo 34-50/32-48»
      const token = value.split(' ').find((t) => /^\d+-\d+(?:\/\d+-\d+)+$/.test(t));
      if (token) {
        const prefix = value.replace(token, '').trim();
        return token.split('/').map((v) => ({ label: `${prefix} ${v}`, value: `${prefix} ${v}`, delta: 0 }));
      }
      // …o con «o»: «Shimano Ultegra 34/50 o 36/52» (platos a elegir, mismo precio)
      const alt = value.match(/^(.*?)\s*(\d+[/-]\d+(?:\s+o\s+\d+[/-]\d+)+)$/);
      if (alt) {
        return alt[2].split(/\s+o\s+/).map((v) => ({ label: `${alt[1]} ${v}`, value: `${alt[1]} ${v}`, delta: 0 }));
      }
      return null;
    }

    if (key === 'Sillín') {
      const others = [...new Set(data.montajes.filter((m) => m.cuadro === b.cuadro).map((m) => m.componentes.Sillín))].filter((v) => v !== value);
      if (!others.length) return null;
      return [value, ...others].map((v, i) => ({ label: v, value: v, delta: i === 0 ? 0 : null }));
    }

    if (key === 'Manillar') {
      return [
        { label: 'Medida según talla (recomendada)', value, delta: 0, example: true },
        { label: 'Otra medida, a elegir con tu distribuidor', value: `${value} · otra medida`, delta: 0, example: true },
      ];
    }

    return null;
  }

  // Opción elegida: las ruedas la deducen del montaje cargado; el resto,
  // de state.picks.
  function current(key) {
    const opts = optionsFor(key);
    const pick = !opts ? 0
      : key === 'Ruedas' ? Math.max(0, opts.findIndex((o) => o.build === state.build))
        : state.picks[key] || 0;
    const opt = opts ? opts[pick] : null;
    return { opts, opt, pick, value: opt ? opt.value : baseValue(key), changed: pick > 0 };
  }

  function total() {
    let sum = state.build.precio + colorExtra();
    let pending = false;
    GROUPS.flatMap(([, items]) => items).forEach(([key]) => {
      const { opt, changed } = current(key);
      // Las ruedas ya van en el precio del montaje
      if (!changed || key === 'Ruedas') return;
      if (opt.delta == null) pending = true;
      else sum += opt.delta;
    });
    return { sum, pending };
  }

  // 1 · Cuadro y grupo -------------------------------------------------------
  const framesBox = $('[data-configurator-frames]');
  const groupsBox = $('[data-configurator-groups]');
  const FRAMES = [...new Set(data.montajes.map((m) => m.cuadro))];
  const byPrice = (a, b) => a.precio - b.precio;
  const buildsOf = (f) => data.montajes.filter((m) => m.cuadro === f);
  const cheapest = (list) => list.reduce((a, m) => (m.precio < a.precio ? m : a));
  const groupsOf = (f) => [...new Set(buildsOf(f).toSorted(byPrice).map((m) => m.grupo))];
  const wheelsOf = (f, g) => buildsOf(f).filter((m) => m.grupo === g).toSorted(byPrice);
  const clearCards = (box) => box.querySelectorAll('.configurator-card').forEach((el) => el.remove());

  function renderFrames() {
    clearCards(framesBox);
    framesBox.insertAdjacentHTML('beforeend', FRAMES.map((f) => card({
      name: 'configurator-frame',
      value: f,
      checked: f === state.build.cuadro,
      title: `Cuadro ${esc(f)}`,
      sub: `${FRAME_WEIGHT[f] ? `${FRAME_WEIGHT[f]} en talla M · ` : ''}desde ${eur(cheapest(buildsOf(f)).precio)}`,
    })).join(''));
  }

  // Grupo: misma tarjeta que tenían los montajes (nombre, detalle, precio)
  function renderGroups() {
    const f = state.build.cuadro;
    clearCards(groupsBox);
    groupsBox.insertAdjacentHTML('beforeend', groupsOf(f).map((g) => {
      const list = wheelsOf(f, g);
      return card({
        name: 'configurator-group',
        value: g,
        checked: g === state.build.grupo,
        title: esc(g),
        sub: `Desarrollo ${esc(list[0].resumen['Transmisión'])}`,
        aside: `${list.length > 1 ? 'Desde ' : ''}${eur(list[0].precio)}`,
      });
    }).join(''));
  }

  // Carga un montaje. Los componentes cambiados se conservan si el nuevo
  // montaje ofrece la misma opción; open deja abierto ese componente.
  function loadBuild(b, open = null) {
    const kept = Object.keys(state.picks).map((k) => [k, current(k).opt?.row ?? current(k).value]);
    state.build = b;
    state.picks = {};
    state.open = open;
    applyPhoto();
    kept.forEach(([k, v]) => {
      const i = optionsFor(k)?.findIndex((o) => (o.row ?? o.value) === v) ?? -1;
      if (i > 0) state.picks[k] = i;
    });
    render();
  }

  framesBox.addEventListener('change', (e) => {
    if (e.target.name !== 'configurator-frame') return;
    loadBuild(cheapest(buildsOf(e.target.value)));
    refocus(framesBox, 'configurator-frame');
  });
  groupsBox.addEventListener('change', (e) => {
    if (e.target.name !== 'configurator-group') return;
    const list = wheelsOf(state.build.cuadro, e.target.value);
    loadBuild(list.find((m) => m.componentes.Ruedas === state.build.componentes.Ruedas) || list[0]);
    refocus(groupsBox, 'configurator-group');
  });

  // 2 · Foto por capas ---------------------------------------------------------
  // Se precargan todas las capas nuevas y se cambian a la vez, sin parpadeo.
  const bike = $('[data-configurator-bike]');
  const slots = Object.fromEntries([...bike.querySelectorAll('[data-layer]')].map((img) => [img.dataset.layer, img]));
  const preloaded = new Map();
  const preload = (src) => {
    if (!preloaded.has(src)) {
      const img = new Image();
      const ready = img.decode ? (img.src = src, img.decode()) : new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = src;
      });
      preloaded.set(src, ready.catch((error) => {
        preloaded.delete(src);
        throw error;
      }));
    }
    return preloaded.get(src);
  };
  let photoToken = 0;

  const colorLayer = (color) => state.origin === '3d' ? `octane/${color.capa}` : color.capa;

  const secondaryLayer = (color) => state.origin === '3d' && color.capa3d ? color.capa3d : color.capa;

  function applyPhoto() {
    const l = look();
    const want = {
      sombra: LAYER(PZ.fijas.sombra),
      color: LAYER(colorLayer(colorOf(l.c1))),
      color2: l.diseno !== 'liso' ? LAYER(secondaryLayer(color2Of(l.diseno, l.c2))) : null,
      pegatinas: LAYER(pegOf(l.peg).capa),
      brillos: l.finish === 'brillo' ? LAYER(PZ.fijas.brillos) : null,
      componentes: LAYER(PZ.fijas.componentes),
    };
    const token = ++photoToken;
    const slow = setTimeout(() => { if (token === photoToken) bike.classList.add('is-loading'); }, 150);
    bike.setAttribute('aria-busy', 'true');
    Promise.all(Object.values(want).filter(Boolean).map(preload)).then(() => {
      clearTimeout(slow);
      if (token !== photoToken) return;
      // En los cortes de pintura el barniz cubre los dos colores del cuadro.
      if (color2Of(l.diseno, l.c2)?.capa3d) slots.brillos.before(slots.color2);
      else slots.color2.before(slots.brillos);
      Object.entries(want).forEach(([k, name]) => {
        const img = slots[k];
        if (!img) return;
        if (!name) { img.hidden = true; return; }
        if (img.getAttribute('src') !== name) img.src = name;
        img.hidden = false;
      });
      bike.setAttribute('aria-label', `Mendiz F14 SL-SLP en ${lower(colorOf(l.c1).label)}, vista lateral`);
    }).catch(() => {}).finally(() => {
      clearTimeout(slow);
      if (token !== photoToken) return;
      bike.classList.remove('is-loading');
      bike.setAttribute('aria-busy', 'false');
    });
  }

  // 3 · Colores: tres de serie + «Personalizado» ------------------------------
  const colorsBox = $('[data-configurator-colors]');

  const originBox = $('[data-configurator-origin]');
  // Selector interno y temporal (para comparar imágenes): botones pequeños
  originBox.insertAdjacentHTML('beforeend', [['psd', 'PSD', 'Versión actual'], ['3d', '3D', 'Nueva versión']]
    .map(([value, title, sub]) => `
      <label class="configurator-origin__opt" title="${sub}">
        <input type="radio" name="configurator-origin" value="${value}"${state.origin === value ? ' checked' : ''}><span>${title}</span>
      </label>`)
    .join(''));
  originBox.addEventListener('change', (event) => {
    state.origin = event.target.value;
    applyPhoto();
    syncUrl();
  });

  // Acabado general (mate / brillo): afecta a los de serie y al personalizado
  const finishBox = $('[data-configurator-finish]');
  function renderFinish() {
    clearCards(finishBox);
    finishBox.insertAdjacentHTML('beforeend', Object.entries(FINISHES).map(([v, l]) => card({
      name: 'configurator-finish', value: v, checked: v === state.paint.finish, title: l,
    })).join(''));
  }
  finishBox.addEventListener('change', (e) => {
    if (e.target.name !== 'configurator-finish') return;
    state.paint.finish = state.paint.custom.finish = e.target.value;
    paintChanged();
    refocus(finishBox, 'configurator-finish');
  });

  function renderColors() {
    const p = state.paint;
    const isCustom = p.mode === 'custom';
    const series = PZ.serie.map((s) => {
      const c = colorOf(s.color);
      return card({
        name: 'configurator-color',
        value: s.id,
        checked: !isCustom && p.serie === s.id,
        lead: chip(c.sw),
        title: esc(c.label),
        sub: `${FINISHES[p.finish]} · pegatinas en ${esc(lower(pegOf(s.pegatinas).label))}`,
        aside: 'Incluido',
        asideMuted: true,
      });
    });
    const custom = card({
      name: 'configurator-color',
      value: 'custom',
      checked: isCustom,
      attrs: ' aria-haspopup="dialog" aria-controls="configurator-customizer"',
      lead: chip(isCustom ? colorOf(p.custom.c1).sw : RAINBOW),
      title: 'Personalizado',
      sub: isCustom ? esc(customText()) : 'Acabado, diseño, colores y pegatinas',
      aside: isCustom ? delta(colorExtra()) : `Desde +${eur(PZ.precios.color)}`,
      trail: '<span class="configurator-card__go material-symbols-outlined" aria-hidden="true">chevron_right</span>',
    });
    clearCards(colorsBox);
    colorsBox.insertAdjacentHTML('beforeend', [...series, custom].join(''));
  }

  colorsBox.addEventListener('change', (e) => {
    if (e.target.name !== 'configurator-color' || e.target.value === 'custom') return;
    state.paint.mode = 'serie';
    state.paint.serie = e.target.value;
    renderColors();
    refocus(colorsBox, 'configurator-color');
    applyPhoto();
    renderSummary();
  });
  // «Personalizado» abre el panel, también si ya estaba elegido
  colorsBox.addEventListener('click', (e) => {
    if (e.target.matches?.('input[name="configurator-color"][value="custom"]')) openPz();
  });
  colorsBox.addEventListener('pointerover', (e) => {
    const input = e.target.closest('.configurator-card')?.querySelector('input[name="configurator-color"]');
    const s = input && serieOf(input.value);
    if (s) [colorLayer(colorOf(s.color)), pegOf(s.pegatinas).capa].forEach((n) => preload(LAYER(n)).catch(() => {}));
  });

  // 4 · Personalizador (panel lateral) ---------------------------------------
  // <dialog> modal: entra desde la derecha y tapa la columna. Lo elegido se
  // ve en la foto al momento; «Aplicar color» lo confirma y cerrar (Cancelar, Esc)
  // vuelve a como estaba al abrirlo.
  //
  // Va por pasos, como un cuestionario: uno abierto cada vez; cada cabecera
  // dice lo elegido y su precio, y el número pasa a ✓ al contestarlo. Un paso
  // no se abre hasta contestar los anteriores. Acabado y diseño avanzan solos
  // al elegir; los de muestras de color, con «Continuar» (para probar varias).
  const pz = $('[data-customizer]');
  const pzBody = $('[data-customizer-body]');
  const pageScroll = window.MENDIZ?.lenis || null;
  let snapshot = null;
  let lastStd = null;                // último color estándar, por si un corte no admite el premium elegido
  const steps = { open: null, done: new Set() };

  const STEPS = [
    { id: 'finish', title: 'Acabado' },
    { id: 'diseno', title: 'Diseño' },
    { id: 'c1', title: 'Color principal' },
    { id: 'c2', title: 'Color secundario', skip: (c) => c.diseno === 'liso' },
    { id: 'peg', title: 'Pegatinas' },
  ];
  const visibleSteps = () => STEPS.filter((st) => !st.skip?.(state.paint.custom));
  const isLocked = (id) => {
    const list = visibleSteps();
    return list.slice(0, list.findIndex((st) => st.id === id)).some((st) => !steps.done.has(st.id));
  };
  const isComplete = () => visibleSteps().every((st) => steps.done.has(st.id));

  // Muestras: nombre del input → lista de opciones y valor elegido
  const PZ_LISTS = {
    'customizer-primary': () => COLORS,
    'customizer-secondary': () => disenoOf(state.paint.custom.diseno).colores2 || [],
    'customizer-decals': () => PZ.pegatinas,
  };
  const pzValue = (name) => {
    const c = state.paint.custom;
    if (name === 'customizer-primary') return colorOf(c.c1).label;
    if (name === 'customizer-secondary') return color2Of(c.diseno, c.c2)?.label || '';
    return pegOf(c.peg).label;
  };

  // Lo elegido y el precio de cada paso, para su cabecera
  function stepSummary(id) {
    const c = state.paint.custom;
    switch (id) {
      case 'finish': return { value: FINISHES[state.paint.finish], price: '' };
      case 'diseno': return { value: disenoOf(c.diseno).label, price: c.diseno !== 'liso' ? `+${eur(PZ.precios.corte)}` : '' };
      case 'c1': return {
        value: pzValue('customizer-primary'),
        price: `+${eur(tierOf(c.c1) === 'premium' ? PZ.precios.premium : PZ.precios.color)}`,
        name: 'customizer-primary',
      };
      case 'c2': return { value: pzValue('customizer-secondary'), price: '', name: 'customizer-secondary' };
      default: return { value: pzValue('customizer-decals'), price: '', name: 'customizer-decals' };
    }
  }

  function renderPz() {
    const c = state.paint.custom;
    const list = visibleSteps();
    const swatch = (name, item, checked, disabled = false) => `
              <label class="configurator-color configurator-color--lg" title="${esc(item.label)}">
                <input type="radio" name="${name}" value="${item.id}"${checked ? ' checked' : ''}${disabled ? ' disabled' : ''}>
                <span class="configurator-color__dot" style="--sw:${item.sw}" aria-hidden="true"></span>
                <span class="visually-hidden">${esc(item.label)}</span>
              </label>`;
    const swatches = (labelId, name, items, value, disabled = false) => `
            <div class="configurator-colors configurator-colors--lg" role="radiogroup" aria-labelledby="${labelId}">${items.map((i) => swatch(name, i, i.id === value, disabled)).join('')}
            </div>`;
    const next = (id) => {
      const last = list[list.length - 1].id === id;
      return `
            <button class="btn btn--sm configurator-step__next" type="button" data-step-next="${id}">${last ? 'Terminar' : 'Continuar'}</button>`;
    };

    // Contenido de cada paso
    const body = {
      finish: (labelId) => `
            <div class="configurator-cards configurator-cards--2 configurator-cards--sm" role="radiogroup" aria-labelledby="${labelId}">${Object.entries(FINISHES).map(([v, l]) => card({
              name: 'customizer-finish', value: v, checked: v === state.paint.finish, title: l,
            })).join('')}
            </div>
            <p class="configurator-customizer__note">El acabado no cambia el precio.</p>`,
      diseno: (labelId) => `
            <div class="configurator-cards configurator-cards--sm" role="radiogroup" aria-labelledby="${labelId}">${PZ.disenos.map((d) => card({
              name: 'customizer-design',
              value: d.id,
              checked: d.id === c.diseno,
              title: esc(d.label),
              sub: esc(d.sub),
              aside: !isReady(d) ? 'Próximamente' : d.id === 'liso' ? '' : `+${eur(PZ.precios.corte)}`,
              asideMuted: !isReady(d),
              attrs: isReady(d) ? '' : ' disabled',
            })).join('')}
            </div>`,
      c1: (labelId) => {
        const premiumOff = c.diseno !== 'liso';
        return `${swatches(labelId, 'customizer-primary', PZ.colores.std, c.c1)}
            <p class="configurator-customizer__label" id="customizer-premium-label"><span class="configurator-customizer__sublabel">Premium</span><span class="configurator-customizer__price">+${eur(PZ.precios.premium)}</span></p>${swatches('customizer-premium-label', 'customizer-primary', PZ.colores.premium, c.c1, premiumOff)}${premiumOff ? `
            <p class="configurator-customizer__note">Los colores premium van solo con el diseño de un color.</p>` : ''}${next('c1')}`;
      },
      c2: (labelId) => `${swatches(labelId, 'customizer-secondary', disenoOf(c.diseno).colores2 || [], c.c2)}${next('c2')}`,
      peg: (labelId) => `${swatches(labelId, 'customizer-decals', PZ.pegatinas, c.peg)}${next('peg')}`,
    };

    const items = list.map((st, i) => {
      const open = steps.open === st.id;
      const done = steps.done.has(st.id);
      const locked = isLocked(st.id);
      const sum = stepSummary(st.id);
      const showValue = open || done;
      const titleId = `customizer-step-${st.id}-title`;
      return `
        <li class="configurator-step${open ? ' is-open' : ''}${done ? ' is-done' : ''}${locked ? ' is-locked' : ''}">
          <h3 class="configurator-step__head">
            <button class="configurator-step__toggle" type="button" data-step-toggle="${st.id}" aria-expanded="${open}" aria-controls="customizer-step-${st.id}"${locked ? ' disabled' : ''}>
              <span class="configurator-step__num" aria-hidden="true">${done && !open ? '<span class="material-symbols-outlined">check</span>' : i + 1}</span>
              <span class="configurator-step__text">
                <span class="configurator-step__title" id="${titleId}">${st.title}</span>${showValue ? `
                <span class="configurator-step__value"${sum.name ? ` data-customizer-value="${sum.name}"` : ''}>${esc(sum.value)}</span>` : ''}
              </span>${showValue && sum.price ? `
              <span class="configurator-step__price">${sum.price}</span>` : ''}
              <span class="configurator-step__caret material-symbols-outlined" aria-hidden="true">chevron_right</span>
            </button>
          </h3>
          <div class="configurator-step__body" id="customizer-step-${st.id}" data-step-body="${st.id}"${open ? '' : ' hidden'}>${open ? body[st.id](titleId) : ''}
          </div>
        </li>`;
    }).join('');

    pzBody.innerHTML = `
        <ol class="configurator-steps">${items}
        </ol>
        <div class="configurator-steps__done"${isComplete() ? '' : ' hidden'}>
          <span class="configurator-steps__check material-symbols-outlined" aria-hidden="true">check</span>
          <div class="configurator-steps__done-text">
            <p class="configurator-steps__done-title">Tu color está listo</p>
            <p class="configurator-customizer__note">${esc(customText())}.</p>
            <div class="configurator-steps__actions">
              <button class="btn btn--sm" type="button" data-customizer-apply-done>Aplicar color</button>
              <button class="btn btn--sm btn--secondary" type="button" data-customizer-restart>Volver a empezar</button>
            </div>
          </div>
        </div>
        <p class="configurator-customizer__note">Un color distinto a los de serie suma ${eur(PZ.precios.color)} al PVP y un corte, ${eur(PZ.precios.corte)} más. Los colores premium suman ${eur(PZ.precios.premium)} y van con el diseño de un color. El acabado no cambia el precio.</p>`;
    $('[data-customizer-extra]').textContent = `Color personalizado: +${eur(colorExtra())}`;
  }

  // Da un paso por contestado y abre el siguiente sin contestar (o ninguno)
  function completeStep(id) {
    steps.done.add(id);
    const list = visibleSteps();
    const from = list.findIndex((st) => st.id === id);
    steps.open = list.slice(from + 1).find((st) => !steps.done.has(st.id))?.id || null;
    renderPz();
    const target = steps.open
      ? pzBody.querySelector(`[data-step-toggle="${steps.open}"]`)
      : pzBody.querySelector('.configurator-steps__done');
    (steps.open ? target : pzBody.querySelector('[data-customizer-apply-done]'))?.focus({ preventScroll: true });
    target?.closest('.configurator-step, .configurator-steps__done')?.scrollIntoView({ block: 'nearest', behavior: reduceMotion() ? 'auto' : 'smooth' });
  }

  function openPz() {
    snapshot = structuredClone(state.paint);
    if (state.paint.mode === 'serie') {
      // Se empieza desde el color de serie que se está viendo, con los pasos por contestar
      state.paint.custom = { ...lookOfSerie(serieOf(state.paint.serie), state.paint.finish) };
      state.paint.mode = 'custom';
      steps.done = new Set();
      steps.open = STEPS[0].id;
    } else {
      // Ya personalizado: todos los pasos contestados y cerrados
      steps.done = new Set(STEPS.map((st) => st.id));
      steps.open = null;
    }
    if (tierOf(state.paint.custom.c1) === 'std') lastStd = state.paint.custom.c1;
    renderPz();
    paintChanged();
    if (!pz.open) {
      pz.showModal();
      pageScroll?.stop();
      pzBody.scrollTop = 0;
    }
  }

  function closePz(apply) {
    if (!pz.open || pz.classList.contains('is-closing')) return;
    if (!apply && snapshot) {
      state.paint = snapshot;
      paintChanged();
    }
    snapshot = null;
    const done = () => { pz.classList.remove('is-closing'); if (pz.open) pz.close(); };
    if (reduceMotion()) { done(); return; }
    pz.classList.add('is-closing');
    const fallback = setTimeout(done, 500);     // por si no llega animationend
    pz.addEventListener('animationend', () => { clearTimeout(fallback); done(); }, { once: true });
  }

  pz.addEventListener('close', () => {
    pageScroll?.start();
    refocus(colorsBox, 'configurator-color');
  });
  pz.addEventListener('cancel', (e) => { e.preventDefault(); closePz(false); });   // Esc
  $('[data-customizer-cancel]').addEventListener('click', () => closePz(false));
  $('[data-customizer-apply]').addEventListener('click', () => closePz(true));

  // Acabado y diseño avanzan al elegir (evento change). Si se pulsa la opción
  // que ya estaba marcada no hay change: se da el paso por contestado igual.
  const ADVANCE_INPUTS = 'input[name="customizer-finish"], input[name="customizer-design"]';
  let pressedChecked = null;
  pzBody.addEventListener('pointerdown', (e) => {
    const input = e.target.closest('.configurator-card')?.querySelector(ADVANCE_INPUTS);
    pressedChecked = input?.checked ? input : null;
  });
  pzBody.addEventListener('keydown', (e) => {
    if ((e.key === ' ' || e.key === 'Enter') && e.target.matches?.(ADVANCE_INPUTS) && e.target.checked) {
      e.preventDefault();
      completeStep(e.target.closest('[data-step-body]').dataset.stepBody);
    }
  });

  // Cabeceras (abrir / cerrar un paso ya alcanzado) y «Continuar»
  pzBody.addEventListener('click', (e) => {
    if (pressedChecked && e.target === pressedChecked) {
      const stepId = pressedChecked.closest('[data-step-body]').dataset.stepBody;
      pressedChecked = null;
      completeStep(stepId);
      return;
    }
    const toggle = e.target.closest('[data-step-toggle]');
    if (toggle && !toggle.disabled) {
      const id = toggle.dataset.stepToggle;
      steps.open = steps.open === id ? null : id;
      renderPz();
      pzBody.querySelector(`[data-step-toggle="${id}"]`)?.focus({ preventScroll: true });
      return;
    }
    const nextBtn = e.target.closest('[data-step-next]');
    if (nextBtn) { completeStep(nextBtn.dataset.stepNext); return; }
    // «Aplicar color» del aviso final: lo mismo que el de arriba
    if (e.target.closest('[data-customizer-apply-done]')) { closePz(true); return; }
    // «Volver a empezar»: los pasos vuelven a estar por contestar, desde el
    // primero; lo elegido se queda marcado para revisarlo paso a paso
    if (e.target.closest('[data-customizer-restart]')) {
      steps.done = new Set();
      steps.open = STEPS[0].id;
      renderPz();
      pzBody.scrollTop = 0;
      pzBody.querySelector(`[data-step-toggle="${steps.open}"]`)?.focus({ preventScroll: true });
    }
  });

  pzBody.addEventListener('change', (e) => {
    const t = e.target;
    const c = state.paint.custom;
    let advance = false;
    switch (t.name) {
      case 'customizer-finish':
        state.paint.finish = c.finish = t.value;
        advance = true;
        break;
      case 'customizer-design': {
        const d = disenoOf(t.value);
        if (!d || !isReady(d)) return;
        c.diseno = d.id;
        if (d.id !== 'liso') {
          if (!color2Of(d.id, c.c2)) c.c2 = d.colores2[0].id;
          // Los premium no admiten corte: se vuelve al último estándar
          if (tierOf(c.c1) === 'premium') c.c1 = lastStd || PZ.colores.std[0].id;
        }
        advance = true;
        break;
      }
      case 'customizer-primary':
        c.c1 = t.value;
        if (tierOf(t.value) === 'std') lastStd = t.value;
        break;
      case 'customizer-secondary': c.c2 = t.value; break;
      case 'customizer-decals': c.peg = t.value; break;
      default: return;
    }
    const stepId = t.closest('[data-step-body]')?.dataset.stepBody;
    if (advance && stepId) {
      completeStep(stepId);
    } else {
      const scroll = pzBody.scrollTop;
      renderPz();
      pzBody.scrollTop = scroll;
      pzBody.querySelector(`input[name="${t.name}"][value="${CSS.escape(t.value)}"]`)?.focus({ preventScroll: true });
    }
    paintChanged();
  });

  // Al pasar por una muestra: su nombre en la cabecera del paso y su capa precargada
  pzBody.addEventListener('pointerover', (e) => {
    const input = e.target.closest('.configurator-color')?.querySelector('input');
    const item = input && find(PZ_LISTS[input.name]?.() || [], input.value);
    if (!item) return;
    preload(LAYER(input.name === 'customizer-primary' ? colorLayer(item) : secondaryLayer(item))).catch(() => {});
    const val = pzBody.querySelector(`[data-customizer-value="${input.name}"]`);
    if (val) val.textContent = item.label;
  });
  pzBody.addEventListener('pointerout', (e) => {
    if (!e.target.closest('.configurator-color')) return;
    pzBody.querySelectorAll('[data-customizer-value]').forEach((el) => { el.textContent = pzValue(el.dataset.customizerValue); });
  });

  // Tras cualquier cambio de pintura
  function paintChanged() {
    renderFinish();
    applyPhoto();
    renderColors();
    renderSummary();
  }

  // 5 · Talla --------------------------------------------------------------
  function renderSizes() {
    $('[data-configurator-sizes]').insertAdjacentHTML('beforeend', SIZES.map((s) => card({
      name: 'configurator-size',
      value: s.id,
      checked: s.id === state.size,
      title: s.id,
      sub: `Stack ${s.stack} · Reach ${s.reach} mm`,
    })).join(''));
  }

  function applySize() {
    document.querySelectorAll('.geometry-table [data-size]').forEach((cell) => cell.classList.toggle('is-size', cell.dataset.size === state.size));
    // Botones de talla del esquema de geometría (los gestiona js/main.js)
    document.querySelectorAll('[data-size-pick]').forEach((btn) => btn.setAttribute('aria-pressed', btn.dataset.sizePick === state.size));
    $$('[data-configurator-sizes] input').forEach((i) => { i.checked = i.value === state.size; });
  }

  $('[data-configurator-sizes]').addEventListener('change', (e) => {
    state.size = e.target.value;
    applySize();
    renderSummary();
  });
  // Elegir talla en la tabla de geometría también la elige en el configurador
  document.querySelectorAll('[data-size-pick]').forEach((btn) => btn.addEventListener('click', () => {
    state.size = btn.dataset.sizePick;
    applySize();
    renderSummary();
  }));

  // Geometría en modal -------------------------------------------------------
  // «¿Qué talla necesito? Ver geometría» abre el <dialog> con el esquema y la
  // tabla (data-configurator-modal-open). Mientras está abierto, la página de detrás no
  // se desplaza (Lenis parado).
  const modal = $('[data-configurator-modal]');

  function openModal() {
    modal.showModal();
    pageScroll?.stop();
    modal.querySelector('.configurator-modal__body').scrollTop = 0;
  }

  document.querySelectorAll('[data-configurator-modal-open]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });
  modal.addEventListener('close', () => pageScroll?.start());
  $('[data-configurator-modal-close]').addEventListener('click', () => modal.close());

  // 6 · Componentes --------------------------------------------------------
  function renderParts() {
    $('[data-configurator-parts]').innerHTML = `
      <ul class="configurator-group__list">${PARTS_SHOWN.map(([key, label]) => partRow(key, label)).join('')}</ul>`;
  }

  function partRow(key, label) {
    const { opts, opt, pick, value, changed } = current(key);
    const id = `opt-${slug(key)}`;
    const open = state.open === key;

    // Editable y no editable se ven igual; la única diferencia es el botón.
    // Debajo del valor solo aparece una nota cuando se ha cambiado algo.
    const note = changed ? `Cambiado · ${delta(opt.delta)}` : key === 'Cuadro' ? `${FRAME_WEIGHT[state.build.cuadro]} en talla M` : '';
    const text = `
          <div class="configurator-part__text">
            <span class="configurator-part__label">${esc(label)}</span>
            <span class="configurator-part__value">${esc(opt?.row || value)}</span>
            ${note ? `<span class="configurator-part__meta">${esc(note)}</span>` : ''}
          </div>`;

    if (!opts) {
      return `
        <li class="configurator-part">
          <div class="configurator-part__row">${text}</div>
        </li>`;
    }

    return `
      <li class="configurator-part${changed ? ' is-changed' : ''}">
        <div class="configurator-part__row">${text}
          <button class="configurator-part__edit" type="button" aria-expanded="${open}" aria-controls="${id}" data-configurator-edit="${esc(key)}">
            <span class="material-symbols-outlined" aria-hidden="true">${open ? 'check' : 'edit'}</span>
            <span class="visually-hidden">${open ? 'Cerrar opciones de' : 'Cambiar'} ${esc(label.toLowerCase())}</span>
          </button>
        </div>
        <fieldset class="configurator-part__options" id="${id}"${open ? '' : ' hidden'}>
          <legend class="visually-hidden">Opciones de ${esc(label.toLowerCase())}</legend>
          ${opts.map((o, i) => card({
            name: id,
            value: i,
            checked: i === pick,
            title: esc(o.label),
            sub: o.sub ? esc(o.sub) : '',
            aside: i === 0 ? 'De serie' : delta(o.delta),
            asideMuted: i === 0 || o.delta == null,
            attrs: ` data-configurator-pick="${esc(key)}"`,
          })).join('')}
          ${opts.some((o) => o.example) ? '<p class="configurator-part__note">Opciones de ejemplo, pendientes de confirmar con Mendiz.</p>' : ''}
        </fieldset>
      </li>`;
  }

  $('[data-configurator-parts]').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-configurator-edit]');
    if (!btn) return;
    const key = btn.dataset.configuratorEdit;
    state.open = state.open === key ? null : key;
    renderParts();
    $(`[data-configurator-edit="${CSS.escape(key)}"]`).focus();
  });

  $('[data-configurator-parts]').addEventListener('change', (e) => {
    const key = e.target.dataset.configuratorPick;
    if (!key) return;
    // Ruedas: cada opción es un montaje; se carga y el selector sigue abierto
    if (key === 'Ruedas') {
      loadBuild(optionsFor(key)[Number(e.target.value)].build, key);
      $(`[data-configurator-pick="Ruedas"][value="${e.target.value}"]`)?.focus();
      return;
    }
    state.picks[key] = Number(e.target.value);
    renderParts();
    $(`[data-configurator-pick="${CSS.escape(key)}"][value="${e.target.value}"]`)?.focus();
    renderSummary();
  });

  // Resumen, precio y enlaces ------------------------------------------------
  function renderSummary() {
    const { sum, pending } = total();
    const size = state.size ? `Talla ${state.size}` : 'Talla sin elegir';
    const summary = `${buildText()} · ${paintText()} · ${size}`;

    setText('[data-configurator-total]', eur(sum));
    setHidden('[data-configurator-price-note]', !pending);
    $('[data-configurator-summary]').textContent = summary;
    $('[data-configurator-bar-sum]').textContent = `${buildText()} · ${paintText()}${state.size ? ` · ${size}` : ''}`;
    $('[data-configurator-modal-sum]').textContent = summary;
    $('[data-configurator-info-sum]').textContent = summary;

    renderRecap();
    syncUrl();
  }

  function renderRecap() {
    const b = state.build;
    const p = state.paint;
    const l = look();
    const tag = '<span class="configurator-badge configurator-badge--changed">Cambiado</span>';
    const colorRows = p.mode === 'serie'
      ? [
        ['Color', `${esc(colorOf(l.c1).label)} · de serie`],
        ['Acabado', FINISHES[l.finish]],
        ['Pegatinas', pegOf(l.peg).label],
      ]
      : [
        ['Acabado', FINISHES[l.finish]],
        ['Diseño', disenoOf(l.diseno).label],
        ['Color principal', `${esc(colorOf(l.c1).label)}${tierOf(l.c1) === 'premium' ? ' <span class="configurator-badge">Premium</span>' : ''}`, true],
        ...(l.diseno !== 'liso' ? [['Color secundario', color2Of(l.diseno, l.c2).label]] : []),
        ['Pegatinas', pegOf(l.peg).label],
        ['Precio del color', `+${eur(colorExtra())}`],
      ];
    const groups = [
      ['Tu bici', [
        ['Cuadro', `F14 ${b.cuadro}`],
        ['Grupo', b.grupo],
        ['Ruedas', b.componentes.Ruedas],
        ['Montaje de referencia', b.name],
        ['Talla', state.size || 'Sin elegir'],
      ]],
      ['Color', colorRows],
      ...GROUPS.map(([title, items]) => [title, items.map(([key, label]) => {
        const { value, changed } = current(key);
        return [label, `${esc(value)}${changed ? ` ${tag}` : ''}`, true];
      })]),
    ];
    $('[data-configurator-recap]').innerHTML = groups.map(([title, rows]) => `
      <div class="configurator-recap__group">
        <h3>${title}</h3>
        <dl>${rows.map(([dt, dd, html]) => `<div><dt>${esc(dt)}</dt><dd>${html ? dd : esc(dd)}</dd></div>`).join('')}</dl>
      </div>`).join('');
  }

  function syncUrl() {
    const q = new URLSearchParams({ modelo: 'f14-sl-slp', montaje: state.build.code });
    const p = state.paint;
    if (p.mode === 'serie') {
      q.set('color', p.serie);
      q.set('acabado', p.finish);
    } else {
      const c = p.custom;
      q.set('pintura', 'personalizada');
      q.set('acabado', p.finish);
      q.set('diseno', c.diseno);
      q.set('color', c.c1);
      if (c.diseno !== 'liso') q.set('color2', c.c2);
      q.set('pegatinas', c.peg);
    }
    if (state.size) q.set('talla', state.size);
    $$('[data-configurator-cta]').forEach((a) => a.setAttribute('href', `distribuidores.html?${q}`));
    if (state.origin === '3d') q.set('origen', '3d');
    history.replaceState(null, '', `${location.pathname}?${q}`);
    document.title = `Configura tu F14 ${state.build.cuadro} · ${state.build.grupo} | Mendiz`;
    updateSaveState();
  }

  // Guardar (prototipo) --------------------------------------------------------
  // Guarda la configuración (su URL) en este navegador y copia el enlace para
  // volver a ella o compartirla. En producción iría a la cuenta del usuario.
  const SAVE_KEY = 'mendiz-configuraciones';
  const saveBtn = $('[data-configurator-save]');
  const toast = $('[data-configurator-toast]');
  const readSaved = () => {
    try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || []; } catch { return []; }
  };

  // «Guardada» mientras la configuración en pantalla sea una de las guardadas
  function updateSaveState() {
    const saved = readSaved().some((c) => c.query === location.search);
    saveBtn.setAttribute('aria-pressed', saved);
    $('[data-configurator-save-label]').textContent = saved ? 'Configuración guardada' : 'Guardar configuración';
  }

  let toastTimer;
  function showToast(text) {
    toast.textContent = text;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-on'), 2600);
  }

  saveBtn.addEventListener('click', async () => {
    const list = readSaved().filter((c) => c.query !== location.search);
    list.unshift({
      query: location.search,
      name: `F14 ${state.build.cuadro} · ${state.build.grupo}`,
      summary: $('[data-configurator-summary]').textContent,
      price: eur(total().sum),
      date: new Date().toISOString(),
    });
    let stored = true;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(list.slice(0, 20))); } catch { stored = false; }
    let copied = false;
    try { await navigator.clipboard.writeText(location.href); copied = true; } catch { /* sin permiso de portapapeles */ }
    updateSaveState();
    if (stored) showToast(copied ? 'Configuración guardada · enlace copiado' : 'Configuración guardada');
    else showToast(copied ? 'Enlace copiado' : 'No se ha podido guardar');
  });

  function render() {
    renderFrames();
    renderGroups();
    renderParts();
    renderSummary();
  }

  // Barra fija ---------------------------------------------------------------
  // Visible mientras ni la cabecera de la columna (nombre y precio) ni el
  // bloque final «Tu F14» están en pantalla.
  const bar = $('[data-configurator-bar]');
  const watched = new Map([[$('[data-configurator-head]'), true], [$('[data-configurator-end]'), false]]);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => watched.set(en.target, en.isIntersecting));
      const on = ![...watched.values()].some(Boolean);
      bar.classList.toggle('is-on', on);
      bar.inert = !on;
    }, { rootMargin: `-${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) || 56}px 0px 0px 0px` });
    watched.forEach((_, el) => io.observe(el));
  }

  // Fondo oscuro de la escena (se recuerda en este navegador)
  const stage = $('.configurator__stage');
  const backdropBtn = $('[data-configurator-backdrop]');
  function setDark(on) {
    stage.classList.toggle('is-dark', on);
    backdropBtn.setAttribute('aria-pressed', String(on));
    backdropBtn.querySelector('span').textContent = on ? 'Fondo claro' : 'Fondo oscuro';
    try { localStorage.setItem('mendiz-configurator-dark', on ? '1' : '0'); } catch (e) { /* sin almacenamiento */ }
  }
  backdropBtn.addEventListener('click', () => setDark(!stage.classList.contains('is-dark')));
  try { if (localStorage.getItem('mendiz-configurator-dark') === '1') setDark(true); } catch (e) { /* sin almacenamiento */ }

  renderSizes();
  renderFinish();
  renderColors();
  applyPhoto();
  applySize();
  render();
})();
