/* ==========================================================================
   MENDIZ — Localizador de distribuidores
   Filtra el listado (texto, provincia, cerca de mí), lo agrupa por provincia
   y lo sincroniza con el mapa (Leaflet). Datos en js/distribuidores-data.js.
   ========================================================================== */
(() => {
  const root = document.querySelector('[data-locator]');
  const DATA = window.MENDIZ_DISTRIBUIDORES;
  if (!root || !DATA) return;

  const $ = (sel) => root.querySelector(sel);
  const form = $('[data-locator-form]');
  const qInput = $('[data-query]');
  const provSelect = $('[data-province]');
  const countrySelect = $('[data-country]');
  const nearBtn = $('[data-near]');
  const listEl = $('[data-list]');
  const countEl = $('[data-count]');
  const emptyEl = $('[data-empty]');
  const resetBtns = root.querySelectorAll('[data-reset]');
  const COUNTRY_NAMES = Object.fromEntries([...countrySelect.options].map((o) => [o.value, o.text]));

  // Prefijo de código postal → provincia (los dos primeros dígitos del CP)
  const CP = {
    '01': 'Araba/Álava', '02': 'Albacete', '03': 'Alicante', '04': 'Almería', '05': 'Ávila', '06': 'Badajoz',
    '07': 'Illes Balears', '08': 'Barcelona', '09': 'Burgos', '10': 'Cáceres', '11': 'Cádiz', '12': 'Castellón',
    '13': 'Ciudad Real', '14': 'Córdoba', '15': 'A Coruña', '17': 'Girona', '18': 'Granada', '19': 'Guadalajara',
    '20': 'Gipuzkoa', '21': 'Huelva', '22': 'Huesca', '23': 'Jaén', '24': 'León', '25': 'Lleida', '26': 'La Rioja',
    '27': 'Lugo', '28': 'Madrid', '29': 'Málaga', '30': 'Murcia', '31': 'Navarra', '32': 'Ourense', '33': 'Asturias',
    '34': 'Palencia', '36': 'Pontevedra', '37': 'Salamanca', '38': 'Santa Cruz de Tenerife', '39': 'Cantabria',
    '40': 'Segovia', '41': 'Sevilla', '42': 'Soria', '43': 'Tarragona', '44': 'Teruel', '45': 'Toledo',
    '46': 'Valencia', '47': 'Valladolid', '48': 'Bizkaia', '49': 'Zamora', '50': 'Zaragoza',
  };

  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const dealers = DATA.distribuidores.map((d, i) => ({
    ...d,
    id: i,
    cp: (`${d.l} ${d.s}`.match(/\b\d{5}\b/) || [''])[0],
    haystack: norm(`${d.n} ${d.s} ${d.l} ${d.p}`),
  }));
  const provinces = Object.keys(DATA.provincias);
  const byProv = (p) => dealers.filter((d) => d.p === p);

  provinces.forEach((p) => provSelect.add(new Option(`${p} (${byProv(p).length})`, p)));

  const state = { q: '', prov: '', country: 'ES', origin: null };
  let note = '';

  // Filtro ---------------------------------------------------------------
  function filter() {
    note = '';
    if (state.country !== 'ES') return [];
    let list = state.prov ? byProv(state.prov) : dealers;
    const q = norm(state.q);
    if (!q) return list;

    // Código postal: primero coincidencia exacta de prefijo; si no, toda la provincia
    if (/^\d{2,5}$/.test(q)) {
      const exact = list.filter((d) => d.cp.startsWith(q));
      if (exact.length) return exact;
      const p = CP[q.slice(0, 2)];
      if (p && (!state.prov || state.prov === p)) {
        note = `No hay tiendas en el ${q}. Te mostramos las de ${p}.`;
        return byProv(p);
      }
      return [];
    }
    const words = q.split(/\s+/);
    return list.filter((d) => words.every((w) => d.haystack.includes(w)));
  }

  // [lat, lng] numérico; una provincia sin coordenadas válidas no lleva pin
  const validLatLng = (c) => Array.isArray(c) && c.length === 2 && c.every(Number.isFinite);

  // Distancia (km) entre dos [lat, lng]
  function km([a, b], [c, d]) {
    const r = Math.PI / 180;
    const x = Math.sin(((c - a) * r) / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(((d - b) * r) / 2) ** 2;
    return 12742 * Math.asin(Math.sqrt(x));
  }

  // Pintado ----------------------------------------------------------------
  // Solo se enlaza un teléfono español válido (9 cifras); si no, se muestra
  // como texto para no generar un tel: roto.
  const tel = (t) => { const d = t.replace(/\D/g, ''); return d.length === 9 ? `+34${d}` : ''; };
  const mapsUrl = (d) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${d.n}, ${d.s}, ${d.l}, ${d.p}`)}`;
  const arrow = '<svg class="icon-arrow" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M1 6h10M7 2l4 4-4 4"/></svg>';

  function itemHTML(d) {
    const t = d.t[0] || '';
    const phone = tel(t)
      ? `<a class="btn btn--secondary btn--sm" href="tel:${tel(t)}"><span class="material-symbols-outlined" aria-hidden="true">call</span>${esc(t)}<span class="visually-hidden">, llamar a ${esc(d.n)}</span></a>`
      : `<span class="locator-dealer__no-phone">${t ? esc(t) : 'Sin teléfono'}</span>`;
    return `<li class="locator-dealer">
      <div>
        <h4 class="locator-dealer__name">${esc(d.n)}</h4>
        <p class="locator-dealer__address">${esc(d.s)}<br>${esc(d.l)}</p>
      </div>
      <div class="locator-dealer__actions">
        ${phone}
        <a class="link-arrow" href="${mapsUrl(d)}" target="_blank" rel="noopener">Cómo llegar<span class="visually-hidden"> a ${esc(d.n)} (abre Google Maps)</span> ${arrow}</a>
      </div>
    </li>`;
  }

  function render() {
    const list = filter();
    const groups = new Map();
    list.forEach((d) => { if (!groups.has(d.p)) groups.set(d.p, []); groups.get(d.p).push(d); });

    let order = [...groups.keys()];
    if (state.origin) {
      const dist = (p) => (validLatLng(DATA.provincias[p]) ? km(state.origin, DATA.provincias[p]) : Infinity);
      order.sort((a, b) => dist(a) - dist(b));
    }

    // Sin búsqueda ni filtro: provincias plegadas (solo cabecera con el nº de
    // tiendas) y todas visibles en el mapa. Al elegir una (pin, desplegable o
    // cabecera) se despliega sola y las demás desaparecen del listado.
    const collapsed = state.country === 'ES' && !state.q && !state.prov && !state.origin;
    listEl.innerHTML = order.map((p) => {
      const items = groups.get(p);
      const count = `${items.length} ${items.length === 1 ? 'tienda' : 'tiendas'}`;
      const open = !collapsed;
      return `<section class="locator-group${open ? ' is-open' : ''}" data-group="${esc(p)}" aria-label="${esc(p)}">
        <h3 class="locator-group__title"><button type="button" class="locator-group__toggle" data-toggle="${esc(p)}" aria-expanded="${open}">
          <span>${esc(p)}</span> <small>${count}</small>
          <span class="material-symbols-outlined locator-group__chevron" aria-hidden="true">expand_more</span>
        </button></h3>
        ${open ? `<ul>${items.map(itemHTML).join('')}</ul>` : ''}
      </section>`;
    }).join('');

    // Recuento y estado vacío
    const n = list.length;
    const where = state.country !== 'ES' ? COUNTRY_NAMES[state.country] : (state.prov || (groups.size === 1 ? order[0] : `${groups.size} provincias`));
    countEl.innerHTML = note
      ? esc(note)
      : `<strong>${n} ${n === 1 ? 'distribuidor' : 'distribuidores'}</strong> en ${esc(where)}${state.origin ? ' · los más cercanos primero' : ''}`;

    emptyEl.hidden = n > 0;
    if (!n) {
      const title = emptyEl.querySelector('[data-empty-title]');
      const text = emptyEl.querySelector('[data-empty-text]');
      if (state.country !== 'ES') {
        title.textContent = `Distribuidores en ${COUNTRY_NAMES[state.country]}`;
        text.textContent = 'Escríbenos y te ponemos en contacto con la tienda Mendiz más cercana.';
      } else {
        title.textContent = 'No hay distribuidores con esa búsqueda';
        text.textContent = 'Prueba con el nombre de tu ciudad o de tu provincia, o usa «Cerca de mí».';
      }
    }

    const filtered = state.q || state.prov || state.origin || state.country !== 'ES';
    root.querySelector('.locator__meta [data-reset]').hidden = !filtered;

    syncURL();
    updateMap(groups);
  }

  function syncURL() {
    const url = new URL(location.href);
    const set = (k, v) => (v ? url.searchParams.set(k, v) : url.searchParams.delete(k));
    set('q', state.q); set('provincia', state.prov); set('pais', state.country === 'ES' ? '' : state.country);
    history.replaceState(null, '', url);
  }

  // Mapa (Leaflet) ------------------------------------------------------------
  let map = null;
  const pins = new Map();
  let meMarker = null;
  let lastGroups = new Map();
  const PENINSULA = [[35.9, -9.4], [43.9, 4.4]];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // En móvil el mapa empieza oculto (pestaña «Lista», display: none) y mide
  // 0 × 0: cualquier fitBounds/flyTo calcula un zoom infinito y Leaflet lanza
  // «Invalid LatLng object: (NaN, NaN)». Solo se encuadra con el mapa visible.
  const mapVisible = () => !!map && map.getContainer().offsetWidth > 0 && map.getContainer().offsetHeight > 0;

  function initMap() {
    if (!window.L) return;
    // Vista inicial con zoom fijo (válida aunque el mapa esté oculto); el
    // encuadre real lo hace updateMap() cuando el mapa tiene tamaño.
    map = L.map('locator-map', { minZoom: 3, maxZoom: 12, preferCanvas: false, scrollWheelZoom: false, zoomSnap: 0.25, attributionControl: true }).setView([39.9, -3.5], 5);
    if (mapVisible()) map.fitBounds(PENINSULA);
    // Teselas de OpenStreetMap, pasadas a grises en css/distribuidores.css.
    // En producción: proveedor con clave (Mapbox, MapTiler, Stadia…) y estilo propio.
    // Sin teselas ni claves: contornos de provincias propios (js/espana-provincias.js),
    // navegables con zoom y arrastre. El color de fondo lo da .locator__map.
    if (window.MENDIZ_ESPANA_GEO) {
      L.geoJSON(window.MENDIZ_ESPANA_GEO, {
        interactive: false,
        style: { color: '#c9c9c9', weight: 1, fillColor: '#fff', fillOpacity: 1 },
      }).addTo(map);
    }

    provinces.filter((p) => validLatLng(DATA.provincias[p])).forEach((p) => {
      const n = byProv(p).length;
      const size = n >= 15 ? 44 : n >= 6 ? 36 : 30;
      const marker = L.marker(DATA.provincias[p], {
        icon: L.divIcon({ className: '', html: `<span class="locator-pin">${n}</span>`, iconSize: [size, size] }),
        title: `${p}: ${n} ${n === 1 ? 'tienda' : 'tiendas'}`,
        keyboard: true,
        riseOnHover: true,
      }).addTo(map);
      // Leaflet solo aplica la opción «alt» a iconos <img>; en un divIcon el nombre
      // accesible saldría del número. Se le da el texto completo.
      // Leaflet les pone role="button" y tabindex, pero con Intro solo abre
      // popups: Intro y Espacio hacen aquí lo mismo que el clic.
      const pinEl = marker.getElement();
      pinEl?.setAttribute('aria-label', `${p}: ${n} ${n === 1 ? 'tienda' : 'tiendas'}`);
      pinEl?.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        marker.fire('click');
      });
      marker.on('click', () => {
        state.prov = state.prov === p ? '' : p;
        provSelect.value = state.prov;
        render();
        if (window.matchMedia('(max-width: 1023px)').matches && state.prov) {
          // El mapa se oculta: el foco (que estaba en el pin) pasa a «Lista»
          const hadFocus = map.getContainer().contains(document.activeElement);
          setView('list');
          if (hadFocus) root.querySelector('[data-view-btn="list"]')?.focus();
        }
      });
      pins.set(p, marker);
    });

    // Cuando el mapa pasa de oculto a visible (pestaña «Mapa» o cambio de
    // ancho a escritorio) se recalcula su tamaño y se encuadra sin animar.
    let wasVisible = mapVisible();
    new ResizeObserver(() => {
      const visible = mapVisible();
      if (visible) map.invalidateSize();
      if (visible && !wasVisible) frame(false);
      wasVisible = visible;
    }).observe(map.getContainer());
  }

  function updateMap(groups) {
    lastGroups = groups;
    if (!map) return;
    pins.forEach((marker, p) => {
      marker.getElement()?.setAttribute('aria-pressed', String(state.prov === p));
      const el = marker.getElement()?.querySelector('.locator-pin');
      if (!el) return;
      el.classList.toggle('is-active', state.prov === p);
      el.classList.toggle('is-dim', !groups.has(p));
    });
    frame(!reduceMotion.matches);
  }

  // Encuadre: las provincias con resultados (Canarias solo si es la única)
  function frame(animate) {
    if (!mapVisible()) return;
    const groups = lastGroups;
    const pts = [...groups.keys()].map((p) => DATA.provincias[p]).filter(validLatLng);
    const peninsular = pts.filter(([lat]) => lat > 34);
    const target = peninsular.length ? peninsular : pts;
    if (state.origin) target.push(state.origin);
    const opts = { animate, duration: 0.6 };
    if (!target.length || groups.size === provinces.length && !state.origin) map.flyToBounds(PENINSULA, opts);
    else if (target.length === 1) map.flyTo(target[0], 9, opts);
    else map.flyToBounds(target, { ...opts, padding: [48, 48], maxZoom: 9 });
  }

  // Pasar el ratón por un grupo resalta su pin
  // Cabecera de provincia: elegirla la despliega sola; pulsarla de nuevo vuelve al listado plegado
  listEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-toggle]');
    if (!btn) return;
    const p = btn.dataset.toggle;
    state.prov = state.prov === p ? '' : p;
    provSelect.value = state.prov;
    render();
    listEl.querySelector(`[data-toggle="${CSS.escape(p)}"]`)?.focus();
  });

  listEl.addEventListener('pointerover', (e) => {
    const g = e.target.closest('[data-group]');
    pins.forEach((m, p) => m.getElement()?.querySelector('.locator-pin')?.classList.toggle('is-hot', g?.dataset.group === p));
  });
  listEl.addEventListener('pointerleave', () => pins.forEach((m) => m.getElement()?.querySelector('.locator-pin')?.classList.remove('is-hot')));

  // Vista móvil: Lista / Mapa ---------------------------------------------------
  const viewBtns = root.querySelectorAll('[data-view-btn]');
  function setView(v) {
    root.dataset.view = v;
    viewBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.viewBtn === v)));
    // El ResizeObserver de initMap() reajusta y encuadra el mapa al mostrarse.
  }
  viewBtns.forEach((b) => b.addEventListener('click', () => setView(b.dataset.viewBtn)));

  // Controles -----------------------------------------------------------------
  let t;
  qInput.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(() => { state.q = qInput.value.trim(); render(); }, 150);
  });
  form.addEventListener('submit', (e) => { e.preventDefault(); state.q = qInput.value.trim(); render(); });
  provSelect.addEventListener('change', () => { state.prov = provSelect.value; render(); });
  countrySelect.addEventListener('change', () => {
    state.country = countrySelect.value;
    const es = state.country === 'ES';
    [qInput, provSelect, nearBtn].forEach((el) => { el.disabled = !es; });
    render();
  });

  nearBtn.addEventListener('click', () => {
    if (state.origin) {
      state.origin = null;
      nearBtn.setAttribute('aria-pressed', 'false');
      meMarker?.remove(); meMarker = null;
      render();
      return;
    }
    if (!navigator.geolocation) {
      countEl.textContent = 'Tu navegador no permite obtener tu ubicación. Busca por ciudad o código postal.';
      return;
    }
    countEl.textContent = 'Buscando tu ubicación…';
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        state.origin = [coords.latitude, coords.longitude];
        state.prov = ''; provSelect.value = '';
        nearBtn.setAttribute('aria-pressed', 'true');
        if (map) {
          meMarker?.remove();
          meMarker = L.marker(state.origin, { icon: L.divIcon({ className: '', html: '<span class="locator-me"></span>', iconSize: [18, 18] }), title: 'Tu ubicación', keyboard: false }).addTo(map);
        }
        render();
      },
      () => { countEl.textContent = 'No hemos podido obtener tu ubicación. Busca por ciudad o código postal.'; },
      { timeout: 10000, maximumAge: 600000 },
    );
  });

  resetBtns.forEach((b) => b.addEventListener('click', () => {
    Object.assign(state, { q: '', prov: '', country: 'ES', origin: null });
    qInput.value = ''; provSelect.value = ''; countrySelect.value = 'ES';
    [qInput, provSelect, nearBtn].forEach((el) => { el.disabled = false; });
    nearBtn.setAttribute('aria-pressed', 'false');
    meMarker?.remove(); meMarker = null;
    render();
    // El botón pulsado queda oculto tras borrar: el foco vuelve al buscador
    qInput.focus();
  }));

  // Estado inicial desde la URL ----------------------------------------------------
  const params = new URLSearchParams(location.search);
  state.q = params.get('q') || '';
  state.prov = provinces.includes(params.get('provincia')) ? params.get('provincia') : '';
  state.country = COUNTRY_NAMES[params.get('pais')] ? params.get('pais') : 'ES';
  qInput.value = state.q; provSelect.value = state.prov; countrySelect.value = state.country;
  if (state.country !== 'ES') [qInput, provSelect, nearBtn].forEach((el) => { el.disabled = true; });

  initMap();
  render();
})();
