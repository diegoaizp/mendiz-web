/* ==========================================================================
   MENDIZ — Configurador (Only For You) · configurador-f14.html
   Columna con todas las secciones abiertas y opciones en tarjetas
   (.configurator-card). El montaje se elige como Grupo + Ruedas, y el color
   como uno de los tres de serie o «Personalizado», que abre el personalizador
   en un panel lateral.

   Datos: window.MENDIZ_F14 (js/data/f14-montajes.js) y window.MENDIZ_F14_COLORES
   (js/data/f14-colores.js). Lee de la URL ?montaje=, ?talla= y el color:
     de serie       ?color=blanco
     personalizado  ?pintura=personalizada&color=…&acabado=…&trama=…
                    &acabado-trama=…&pegatinas=…

   · Cuadro (SL | SLP) → filtra los grupos.
   · Grupo → filtra las ruedas. Grupo + ruedas = un montaje de serie, que
     carga sus componentes. Al cambiar de grupo se conservan las ruedas si
     ese grupo las tiene; si no, se cargan las más económicas.
   · Ruedas: se cambian con el lápiz en Componentes, entre las
     que admite el grupo. Elegir unas carga su montaje.
   · Color: tres de serie (incluidos) o personalizado (+100 €, trama +100 €,
     premium +190 €).
   ========================================================================== */

(() => {
  const data = window.MENDIZ_F14;
  const PZ = window.MENDIZ_F14_COLORES;
  const root = document.querySelector('[data-configurator]');
  if (!data || !PZ || !root) return;

  const DEFAULT_BUILD = 'F14SL.05';

  // Colores ------------------------------------------------------------------
  const FINISHES = { mate: 'Mate', brillo: 'Brillo' };
  const TIERS = { std: 'Estándar', premium: 'Premium' };
  const COLORS = [...PZ.colores.std, ...PZ.colores.premium];
  const find = (list, id) => list.find((x) => x.id === id);
  const colorOf = (id) => find(COLORS, id);
  const tramaOf = (id) => find(PZ.tramas, id);
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

  // Jerarquía de la ficha técnica: grupo > etiqueta corta > valor
  const GROUPS = [
    ['Conjunto cuadro', [['Cuadro', 'Cuadro']]],
    ['Transmisión', [['Mandos', 'Mandos'], ['Cambio', 'Cambio'], ['Desviador', 'Desviador'], ['Bielas', 'Bielas'], ['Cassette', 'Cassette']]],
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
    const custom = lookOfSerie(serieOf(serie));
    const isCustom = params.get('pintura') === 'personalizada' || (c && !serieOf(c) && colorOf(c));
    if (isCustom) {
      if (colorOf(c)) custom.c1 = c;
      if (FINISHES[params.get('acabado')]) custom.finish = params.get('acabado');
      if (tramaOf(params.get('trama')) && tierOf(custom.c1) === 'std') custom.trama = params.get('trama');
      if (FINISHES[params.get('acabado-trama')]) custom.tramaFinish = params.get('acabado-trama');
      if (pegOf(params.get('pegatinas'))) custom.peg = params.get('pegatinas');
    }
    return { mode: isCustom ? 'custom' : 'serie', serie, custom };
  }
  function lookOfSerie(s) {
    return { c1: s.color, finish: s.acabado, trama: 'none', tramaFinish: 'mate', peg: s.pegatinas };
  }

  const state = {
    build: byCode(params.get('montaje')) || byCode(DEFAULT_BUILD),
    paint: paintFromUrl(),
    size: SIZES.some((s) => s.id === params.get('talla')) ? params.get('talla') : null,
    picks: {},      // clave del componente → índice de la opción elegida (0 = de serie)
    open: null,     // componente con las opciones abiertas
  };

  // Lo que se ve en la bici, sea de serie o personalizado
  const look = (p = state.paint) => (p.mode === 'serie' ? lookOfSerie(serieOf(p.serie)) : p.custom);

  // Incremento de precio por color personalizado
  function colorExtra(p = state.paint) {
    if (p.mode !== 'custom') return 0;
    const c = p.custom;
    if (tierOf(c.c1) === 'premium') return PZ.precios.premium;
    return PZ.precios.color + (c.trama !== 'none' ? PZ.precios.trama : 0);
  }

  // «Blanco · brillo» o «Rojo · mate · personalizado»
  function paintText() {
    const l = look();
    return `${colorOf(l.c1).label} · ${lower(FINISHES[l.finish])}${state.paint.mode === 'custom' ? ' · personalizado' : ''}`;
  }
  // Detalle del personalizado: «Rojo mate · trama en negro · pegatinas en oro»
  function customText(c = state.paint.custom) {
    return [
      `${colorOf(c.c1).label} ${lower(FINISHES[c.finish])}`,
      c.trama !== 'none' ? `trama en ${lower(tramaOf(c.trama).label)}` : '',
      `pegatinas en ${lower(pegOf(c.peg).label)}`,
    ].filter(Boolean).join(' · ');
  }
  const buildText = (b = state.build) => `${b.grupo} · ${b.componentes.Ruedas}`;

  // Valor de serie de cada componente
  function baseValue(key, b = state.build) {
    const c = b.componentes;
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

    if (key === 'Bielas' || key === 'Cassette') {
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
      if (key === 'Bielas') {
        return ['Según talla (recomendada)', '170 mm', '172,5 mm', '175 mm'].map((l, i) => ({
          label: l, value: i === 0 ? value : `${value} · ${l}`, delta: 0, example: true,
        }));
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
    const kept = Object.keys(state.picks).map((k) => [k, current(k).value]);
    state.build = b;
    state.picks = {};
    state.open = open;
    applyPhoto();
    kept.forEach(([k, v]) => {
      const i = optionsFor(k)?.findIndex((o) => o.value === v) ?? -1;
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

  function applyPhoto() {
    const l = look();
    const want = {
      sombra: LAYER(PZ.fijas.sombra),
      color: LAYER(colorOf(l.c1).capa),
      trama: l.trama !== 'none' ? LAYER(tramaOf(l.trama).capa) : null,
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
        sub: `${FINISHES[s.acabado]} · pegatinas en ${esc(lower(pegOf(s.pegatinas).label))}`,
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
      sub: isCustom ? esc(customText()) : 'Color, trama, pegatinas y acabado',
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
    if (s) [colorOf(s.color).capa, pegOf(s.pegatinas).capa].forEach((n) => preload(LAYER(n)).catch(() => {}));
  });

  // 4 · Personalizador (panel lateral) ---------------------------------------
  // <dialog> modal: entra desde la derecha y tapa la columna. Lo elegido se
  // ve en la foto al momento; «Aplicar color» lo confirma y cerrar (Cancelar, Esc)
  // vuelve a como estaba al abrirlo.
  const pz = $('[data-customizer]');
  const pzBody = $('[data-customizer-body]');
  const pageScroll = window.MENDIZ?.lenis || null;
  let snapshot = null;
  const lastPick = { std: null, premium: null };  // para volver al último color de cada tipo

  const PZ_LISTS = { 'customizer-primary': COLORS, 'customizer-pattern': PZ.tramas, 'customizer-decals': PZ.pegatinas };
  const pzValue = (name) => {
    const c = state.paint.custom;
    if (name === 'customizer-primary') return colorOf(c.c1).label;
    if (name === 'customizer-pattern') return tramaOf(c.trama).label;
    return pegOf(c.peg).label;
  };

  function renderPz() {
    const c = state.paint.custom;
    const tier = tierOf(c.c1);
    const swatch = (name, item, checked) => `
            <label class="configurator-color configurator-color--lg" title="${esc(item.label)}">
              <input type="radio" name="${name}" value="${item.id}"${checked ? ' checked' : ''}>
              <span class="configurator-color__dot" style="--sw:${item.sw}" aria-hidden="true"></span>
              <span class="visually-hidden">${esc(item.label)}</span>
            </label>`;
    // Campo con título, valor elegido (cambia al pasar por las muestras) y muestras
    const field = (id, title, name, list, value, price = '') => `
          <div class="configurator-customizer__field">
            <p class="configurator-customizer__label" id="${id}"><span class="configurator-subtitle">${title}</span><span class="configurator-customizer__value" data-customizer-value="${name}">${esc(pzValue(name))}</span>${price}</p>
            <div class="configurator-colors configurator-colors--lg" role="radiogroup" aria-labelledby="${id}">${list.map((i) => swatch(name, i, i.id === value)).join('')}
            </div>
          </div>`;
    const finish = (id, title, name, value) => `
          <div class="configurator-customizer__field">
            <p class="configurator-customizer__sublabel" id="${id}">${title}</p>
            <div class="configurator-cards configurator-cards--2 configurator-cards--sm" role="radiogroup" aria-labelledby="${id}">${Object.entries(FINISHES).map(([v, l]) => card({ name, value: v, checked: v === value, title: l })).join('')}
            </div>
          </div>`;

    pzBody.innerHTML = `
        <section class="configurator-customizer__section">
          <div class="configurator-customizer__field">
            <p class="configurator-customizer__label" id="customizer-type-label"><span class="configurator-subtitle">Tipo de color</span></p>
            <div class="configurator-cards configurator-cards--2" role="radiogroup" aria-labelledby="customizer-type-label">${['std', 'premium'].map((t) => card({
              name: 'customizer-type', value: t, checked: t === tier, title: TIERS[t],
              sub: `+${eur(t === 'premium' ? PZ.precios.premium : PZ.precios.color)}`,
            })).join('')}
            </div>
          </div>
        </section>
        <section class="configurator-customizer__section">${field('customizer-primary-label', 'Color principal', 'customizer-primary', PZ.colores[tier], c.c1)}${finish('customizer-finish-label', 'Acabado', 'customizer-finish', c.finish)}
        </section>
        <section class="configurator-customizer__section">${tier === 'premium' ? `
          <div class="configurator-customizer__field">
            <p class="configurator-customizer__label"><span class="configurator-subtitle">Trama</span></p>
            <p class="configurator-customizer__note">Los colores premium van sin trama.</p>
          </div>` : `${field('customizer-pattern-label', 'Trama', 'customizer-pattern', PZ.tramas, c.trama, `<span class="configurator-customizer__price">+${eur(PZ.precios.trama)}</span>`)}${c.trama !== 'none' ? finish('customizer-pattern-finish-label', 'Acabado de la trama', 'customizer-pattern-finish', c.tramaFinish) : ''}`}
        </section>
        <section class="configurator-customizer__section">${field('customizer-decals-label', 'Pegatinas', 'customizer-decals', PZ.pegatinas, c.peg)}
        </section>
        <p class="configurator-customizer__note">Un color distinto a los de serie suma ${eur(PZ.precios.color)} al PVP y la trama, ${eur(PZ.precios.trama)} más. Los colores premium suman ${eur(PZ.precios.premium)}. El acabado no cambia el precio.</p>`;
    $('[data-customizer-extra]').textContent = `Color personalizado: +${eur(colorExtra())}`;
  }

  function openPz() {
    snapshot = structuredClone(state.paint);
    if (state.paint.mode === 'serie') {
      // Se empieza desde el color de serie que se está viendo
      state.paint.custom = { ...lookOfSerie(serieOf(state.paint.serie)) };
      state.paint.mode = 'custom';
    }
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

  pzBody.addEventListener('change', (e) => {
    const t = e.target;
    const c = state.paint.custom;
    switch (t.name) {
      case 'customizer-type': {
        const from = tierOf(c.c1);
        if (t.value === from) return;
        lastPick[from] = c.c1;
        c.c1 = lastPick[t.value] || PZ.colores[t.value][0].id;
        if (t.value === 'premium') c.trama = 'none';
        break;
      }
      case 'customizer-primary': c.c1 = t.value; break;
      case 'customizer-finish': c.finish = t.value; break;
      case 'customizer-pattern': c.trama = t.value; break;
      case 'customizer-pattern-finish': c.tramaFinish = t.value; break;
      case 'customizer-decals': c.peg = t.value; break;
      default: return;
    }
    const scroll = pzBody.scrollTop;
    renderPz();
    pzBody.scrollTop = scroll;
    pzBody.querySelector(`input[name="${t.name}"][value="${CSS.escape(t.value)}"]`)?.focus({ preventScroll: true });
    paintChanged();
  });

  // Al pasar por una muestra: su nombre en el título del campo y su capa precargada
  pzBody.addEventListener('pointerover', (e) => {
    const input = e.target.closest('.configurator-color')?.querySelector('input');
    const item = input && find(PZ_LISTS[input.name] || [], input.value);
    if (!item) return;
    preload(LAYER(item.capa));
    const val = pzBody.querySelector(`[data-customizer-value="${input.name}"]`);
    if (val) val.textContent = item.label;
  });
  pzBody.addEventListener('pointerout', (e) => {
    if (!e.target.closest('.configurator-color')) return;
    pzBody.querySelectorAll('[data-customizer-value]').forEach((el) => { el.textContent = pzValue(el.dataset.customizerValue); });
  });

  // Tras cualquier cambio de pintura
  function paintChanged() {
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
    $('[data-configurator-parts]').innerHTML = GROUPS.map(([title, items]) => `
      <div class="configurator-group">
        <h3 class="configurator-group__title">${title}</h3>
        <ul class="configurator-group__list">${items.map(([key, label]) => partRow(key, label)).join('')}</ul>
      </div>`).join('');
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
            <span class="configurator-part__value">${esc(value)}</span>
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
        ['Tipo', TIERS[tierOf(l.c1)]],
        ['Color principal', `${esc(colorOf(l.c1).label)}${tierOf(l.c1) === 'premium' ? ' <span class="configurator-badge">Premium</span>' : ''}`, true],
        ['Acabado', FINISHES[l.finish]],
        ['Trama', tramaOf(l.trama).label],
        ...(l.trama !== 'none' ? [['Acabado de la trama', FINISHES[l.tramaFinish]]] : []),
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
    } else {
      const c = p.custom;
      q.set('pintura', 'personalizada');
      q.set('color', c.c1);
      q.set('acabado', c.finish);
      if (c.trama !== 'none') {
        q.set('trama', c.trama);
        q.set('acabado-trama', c.tramaFinish);
      }
      q.set('pegatinas', c.peg);
    }
    if (state.size) q.set('talla', state.size);
    $$('[data-configurator-cta]').forEach((a) => a.setAttribute('href', `distribuidores.html?${q}`));
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

  renderSizes();
  renderColors();
  applyPhoto();
  applySize();
  render();
})();
