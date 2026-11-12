// MENDIZ — Only For You (only-for-you.html) y su listado
// (only-for-you-modelos.html)
// 1. Vídeos: el botón de pausa / reproducción ([data-ofy-film]) está en
//    js/main.js, porque la home lo usa también.
// 2. Filtro del listado (only-for-you-modelos.html): categoría + modelo, guardados en ?categoria= y
//    ?modelo= para poder enlazarlos (p. ej. desde las páginas de categoría).
// La versión anterior (secuencia de scroll) está en js/only-for-you-2.js.

// 2. Filtro categoría + modelo ---------------------------------------------------
(() => {
  const list = document.querySelector('[data-ofy-grid]');
  const select = document.querySelector('[data-ofy-model]');
  if (!list || !select) return;

  const cards = [...list.querySelectorAll('.bike-card')];
  const catButtons = [...document.querySelectorAll('[data-ofy-cat]')];
  const count = document.querySelector('[data-ofy-results]');
  const models = cards.map((card) => ({ id: card.dataset.model, name: card.dataset.name, cat: card.dataset.cat }));
  const cats = new Set(catButtons.map((b) => b.dataset.ofyCat));

  const state = { cat: 'todas', model: '' };

  function renderOptions() {
    const options = models
      .filter((m) => state.cat === 'todas' || m.cat === state.cat)
      .map((m) => new Option(m.name, m.id));
    select.replaceChildren(new Option('Todos los modelos', ''), ...options);
    select.value = state.model;
  }

  function apply() {
    catButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.ofyCat === state.cat)));

    let visible = 0;
    cards.forEach((card) => {
      const show = (state.cat === 'todas' || card.dataset.cat === state.cat)
        && (!state.model || card.dataset.model === state.model);
      card.hidden = !show;
      if (show) visible++;
    });
    if (count) count.textContent = `${visible} ${visible === 1 ? 'modelo' : 'modelos'}`;

    const url = new URL(location.href);
    if (state.cat === 'todas') url.searchParams.delete('categoria');
    else url.searchParams.set('categoria', state.cat);
    if (state.model) url.searchParams.set('modelo', state.model);
    else url.searchParams.delete('modelo');
    history.replaceState(null, '', url);
  }

  catButtons.forEach((btn) => btn.addEventListener('click', () => {
    state.cat = btn.dataset.ofyCat;
    // Si el modelo elegido no es de esta categoría, se quita.
    if (state.model && !models.some((m) => m.id === state.model && (state.cat === 'todas' || m.cat === state.cat))) {
      state.model = '';
    }
    renderOptions();
    apply();
  }));

  // Elegir un modelo marca también su categoría.
  select.addEventListener('change', () => {
    state.model = select.value;
    const model = models.find((m) => m.id === state.model);
    if (model) state.cat = model.cat;
    renderOptions();
    apply();
  });

  // Estado inicial desde la URL
  const params = new URLSearchParams(location.search);
  const initialModel = models.find((m) => m.id === params.get('modelo'));
  const initialCat = params.get('categoria');
  if (initialModel) { state.model = initialModel.id; state.cat = initialModel.cat; }
  else if (initialCat && cats.has(initialCat)) state.cat = initialCat;

  renderOptions();
  apply();
})();
