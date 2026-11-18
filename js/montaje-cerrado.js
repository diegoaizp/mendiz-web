/* ==========================================================================
   MENDIZ — Montaje cerrado (montaje-f14-mpl.html)
   Misma maqueta que el configurador (css/configurador-bici.css). El montaje
   es cerrado (grupo, ruedas y componentes los define Mendiz) y solo se eligen
   el color (uno de los tres MPL) y la talla, con las mismas tarjetas que el
   configurador. Datos: window.MENDIZ_MONTAJE_CERRADO (js/data/f14-mpl-montajes.js).
   La URL lleva el montaje y lo elegido (?montaje=F14S.01C&color=negro&talla=M)
   y se actualiza al cambiar; sin parámetros: montaje por defecto, verde y sin
   talla. También: barra fija con precio y CTA, y la geometría en <dialog>
   (sus botones de talla eligen también la talla aquí).
   ========================================================================== */
(() => {
  const data = window.MENDIZ_MONTAJE_CERRADO;
  const root = document.querySelector('[data-closed-build]');
  if (!data || !root) return;

  const $ = (sel) => root.querySelector(sel);
  const $$ = (sel) => [...root.querySelectorAll(sel)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const eur = (n) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} €`;
  const setText = (sel, text) => $$(sel).forEach((el) => { el.textContent = text; });

  // Jerarquía de la ficha técnica, como el configurador: grupo > etiqueta > valor
  const GROUPS = [
    ['Conjunto cuadro', [['Cuadro', 'Cuadro']]],
    ['Transmisión', [['Grupo', 'Grupo'], ['Desarrollo', 'Desarrollo'], ['Mandos', 'Mandos'], ['Cambio', 'Cambio'], ['Desviador', 'Desviador'], ['Bielas', 'Bielas'], ['Cassette', 'Cassette']]],
    ['Frenos', [['Frenos', 'Frenos'], ['Disco', 'Discos']]],
    ['Ruedas', [['Ruedas', 'Ruedas']]],
    ['Cockpit', [['Manillar', 'Manillar y potencia']]],
  ];
  const SIZES = [
    { id: 'XS', stack: 520, reach: 380 },
    { id: 'S', stack: 533, reach: 388 },
    { id: 'M', stack: 554, reach: 389 },
    { id: 'L', stack: 575, reach: 397 },
    { id: 'XL', stack: 594, reach: 411 },
  ];

  // Estado: montaje fijo; color y talla elegibles -------------------------------
  const params = new URLSearchParams(location.search);
  const build = data.montajes.find((m) => m.code === params.get('montaje'))
    || data.montajes.find((m) => m.code === data.porDefecto);
  const colorOf = (id) => data.colores.find((c) => c.id === id);
  const state = {
    color: (colorOf(params.get('color')) || colorOf('verde')).id,
    size: SIZES.some((s) => s.id === params.get('talla')) ? params.get('talla') : null,
  };
  const value = (key) => {
    const v = build.componentes[key];
    return v && typeof v === 'object' ? v.v : v;
  };

  // Lo que no cambia ----------------------------------------------------------------
  setText('[data-closed-build-total]', eur(build.precio));
  setText('[data-closed-build-code]', build.code);
  // Peso: solo lo publica la web para algunos montajes; si no, se oculta
  setText('[data-closed-build-weight]', build.peso || '');
  $$('[data-closed-build-weight-row]').forEach((el) => { el.hidden = !build.peso; });
  document.title = `${data.modelo} ${build.code} · Montaje MPL | Mendiz`;

  // Componentes: filas sin botón de editar (como las no editables del
  // configurador). Grupos sin ningún dato (p. ej. Frenos en 105 mecánico) no se pintan
  const filled = GROUPS.filter(([, items]) => items.some(([key]) => value(key)));
  $('[data-closed-build-parts]').innerHTML = filled.map(([title, items]) => `
      <div class="configurator-group">
        <h3 class="configurator-group__title">${title}</h3>
        <ul class="configurator-group__list">${items.filter(([key]) => value(key)).map(([key, label]) => `
          <li class="configurator-part">
            <div class="configurator-part__row">
              <div class="configurator-part__text">
                <span class="configurator-part__label">${esc(label)}</span>
                <span class="configurator-part__value">${esc(value(key))}</span>
              </div>
            </div>
          </li>`).join('')}
        </ul>
      </div>`).join('');

  // Tarjetas de color y talla (patrón del configurador: radio oculto +
  // [muestra] + nombre + detalle en gris + nota a la derecha) ---------------------
  const card = ({ name, value: v, title, sub = '', aside = '', lead = '' }) => `
      <label class="configurator-card">
        <input type="radio" name="${name}" value="${esc(v)}">${lead}
        <span class="configurator-card__text">
          <span class="configurator-card__name">${title}</span>${sub ? `
          <span class="configurator-card__sub">${sub}</span>` : ''}
        </span>${aside ? `
        <span class="configurator-card__aside configurator-card__aside--muted">${aside}</span>` : ''}
      </label>`;
  const colorsBox = $('[data-closed-build-colors]');
  const sizesBox = $('[data-closed-build-sizes]');
  colorsBox.insertAdjacentHTML('beforeend', data.colores.map((c) => card({
    name: 'closed-build-color',
    value: c.id,
    lead: `<span class="configurator-paint__chip" style="--sw:${c.sw}" aria-hidden="true"></span>`,
    title: esc(c.label),
    sub: 'Logos en oro',
    aside: 'Incluido',
  })).join(''));
  sizesBox.insertAdjacentHTML('beforeend', SIZES.map((s) => card({
    name: 'closed-build-size',
    value: s.id,
    title: s.id,
    sub: `Stack ${s.stack} · Reach ${s.reach} mm`,
  })).join(''));

  // Bici: un solo recorte por color; los otros se precargan para que el cambio
  // sea inmediato
  const bike = $('[data-closed-build-bike]');
  window.addEventListener('load', () => data.colores.forEach((c) => { new Image().src = c.img; }), { once: true });

  // Pintar lo que depende de color y talla -------------------------------------------
  function render() {
    const color = colorOf(state.color);
    const size = state.size ? `Talla ${state.size}` : 'Talla sin elegir';
    const summary = `${build.grupo} · ${build.ruedas} · ${color.label}`;

    if (bike.getAttribute('src') !== color.img) bike.src = color.img;
    $('[data-closed-build-stage]').setAttribute('aria-label', `Mendiz ${data.modelo} en ${color.label.toLowerCase()}, vista lateral`);
    setText('[data-closed-build-summary]', `${summary} · ${size}`);
    setText('[data-closed-build-bar-sum]', `${build.code} · ${color.label}${state.size ? ` · ${size}` : ''}`);

    $$('[data-closed-build-colors] input').forEach((i) => { i.checked = i.value === state.color; });
    $$('[data-closed-build-sizes] input').forEach((i) => { i.checked = i.value === state.size; });
    document.querySelectorAll('.geometry-table [data-size]').forEach((cell) => cell.classList.toggle('is-size', cell.dataset.size === state.size));
    document.querySelectorAll('[data-size-pick]').forEach((btn) => btn.setAttribute('aria-pressed', btn.dataset.sizePick === state.size));

    const q = new URLSearchParams({ modelo: data.slug, montaje: build.code, color: state.color });
    if (state.size) q.set('talla', state.size);
    $$('[data-closed-build-cta]').forEach((a) => { a.href = `distribuidores.html?${q}`; });
    const page = new URLSearchParams({ montaje: build.code, color: state.color });
    if (state.size) page.set('talla', state.size);
    history.replaceState(null, '', `${location.pathname}?${page}${location.hash}`);

    // Resumen a todo el ancho
    const groups = [
      ['Tu bici', [
        ['Modelo', data.modelo],
        ['Montaje', `${build.code} · ${data.coleccion}`],
        ['Grupo', build.grupo],
        ['Ruedas', build.ruedas],
        ...(build.peso ? [['Peso', build.peso]] : []),
        ['Color', color.label],
        ['Talla', state.size || 'Sin elegir'],
      ]],
      ...filled.map(([title, items]) => [title, items.filter(([key]) => value(key)).map(([key, label]) => [label, value(key)])]),
    ];
    $('[data-closed-build-recap]').innerHTML = groups.map(([title, rows]) => `
      <div class="configurator-recap__group">
        <h3>${title}</h3>
        <dl>${rows.map(([dt, dd]) => `<div><dt>${esc(dt)}</dt><dd>${esc(dd)}</dd></div>`).join('')}</dl>
      </div>`).join('');
  }

  colorsBox.addEventListener('change', (e) => {
    if (e.target.name !== 'closed-build-color') return;
    state.color = e.target.value;
    render();
  });
  sizesBox.addEventListener('change', (e) => {
    if (e.target.name !== 'closed-build-size') return;
    state.size = e.target.value;
    render();
  });
  // Los botones de talla de la tabla de geometría también eligen la talla
  document.querySelectorAll('[data-size-pick]').forEach((btn) => btn.addEventListener('click', () => {
    state.size = btn.dataset.sizePick;
    render();
  }));

  render();

  // Barra fija: visible mientras ni la cabecera de la columna ni el bloque
  // final están en pantalla -------------------------------------------------------
  const bar = $('[data-closed-build-bar]');
  const watched = new Map([[$('[data-closed-build-head]'), true], [$('[data-closed-build-end]'), false]]);
  if (bar && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => watched.set(en.target, en.isIntersecting));
      const on = ![...watched.values()].some(Boolean);
      bar.classList.toggle('is-on', on);
      bar.inert = !on;
    }, { rootMargin: `-${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) || 56}px 0px 0px 0px` });
    watched.forEach((_, el) => io.observe(el));
  }

  // Geometría en modal ----------------------------------------------------------------
  const modal = $('[data-configurator-modal]');
  if (modal) {
    document.querySelectorAll('[data-configurator-modal-open]').forEach((el) => el.addEventListener('click', (e) => {
      e.preventDefault();
      modal.showModal();
      window.MENDIZ?.lenis?.stop();
      modal.querySelector('.configurator-modal__body').scrollTop = 0;
    }));
    modal.querySelector('[data-configurator-modal-close]')?.addEventListener('click', () => modal.close());
    modal.addEventListener('close', () => { window.MENDIZ?.lenis?.start(); });
  }
})();
