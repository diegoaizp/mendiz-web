/* Complemento al selector de main.js: actualiza las fotos de referencia
   de los montajes al cambiar el acabado. */
(() => {
  const stage = document.querySelector('.catalog-stage');
  if (!stage) return;
  const inputs = [...stage.querySelectorAll('input[name="color"]')];
  const update = (input) => {
    if (!input) return;
    document.querySelectorAll('.catalog-build-image').forEach((img) => {
      img.src = input.dataset.src;
      img.alt = `${document.querySelector('h1').textContent} en ${input.dataset.label.toLowerCase()} · imagen de referencia del modelo`;
    });
  };
  inputs.forEach((input) => input.addEventListener('change', () => update(input)));
  update(inputs.find((input) => input.checked));
})();
