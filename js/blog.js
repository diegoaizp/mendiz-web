/* MENDIZ — Blog: filtro por categoría (mejora progresiva: sin JS se ven todos). */
(function () {
  var filter = document.querySelector('[data-blog-filter]');
  if (!filter) return;
  var cards = document.querySelectorAll('[data-cat]');
  filter.addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-filter]');
    if (!btn) return;
    var cat = btn.dataset.filter;
    filter.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
    cards.forEach(function (c) { c.hidden = !(cat === 'todo' || c.dataset.cat === cat); });
  });
})();

/* MENDIZ — Noticia: compartir. «Copiar enlace» copia la URL y lo confirma en
   el propio botón; «Compartir» solo aparece si el navegador tiene la hoja
   nativa (móvil). */
(function () {
  var box = document.querySelector('[data-share]');
  if (!box) return;
  var copy = box.querySelector('[data-share-copy]');
  var label = box.querySelector('[data-share-label]');
  var native = box.querySelector('[data-share-native]');
  if (copy && navigator.clipboard) {
    copy.addEventListener('click', function () {
      navigator.clipboard.writeText(location.href).then(function () {
        label.textContent = 'Enlace copiado';
        setTimeout(function () { label.textContent = 'Copiar enlace'; }, 2000);
      });
    });
  }
  if (native && navigator.share) {
    native.hidden = false;
    native.addEventListener('click', function () {
      navigator.share({ title: document.title, url: location.href }).catch(function () {});
    });
  }
})();
