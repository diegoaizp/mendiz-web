/* ==========================================================================
   F14 SL-SLP — Colores del personalizador Only For You
   El personalizador va por pasos, en este orden:
     1 Acabado (mate | brillo) · 2 Diseño (un color o un corte de pintura) ·
     3 Color principal (estándar o premium) · 4 Color secundario (solo con
     corte) · 5 Pegatinas
   Todas las capas en assets/img/f14-sl-slp/capas comparten lienzo (2500 × 1667)
   y se apilan en este orden:
     sombra · color · brillos (solo acabado brillo) · color2 (corte) · pegatinas · componentes
   Incrementos de tarifa: color distinto al de serie +100 €, corte +100 € más;
   colores premium +190 € (solo con diseño de un color).
   Los tres colores de serie coinciden con los de la ficha (f14-sl-slp.html).
   ========================================================================== */

const F14_ESTANDAR = [
  { id: 'negro', label: 'Negro', sw: '#151515', capa: 'f14sl-c01-negro' },
  { id: 'gris-plomo', label: 'Gris plomo', sw: '#8c8989', capa: 'f14sl-c02-gris_plomo' },
  { id: 'blanco', label: 'Blanco', sw: '#f3f3f3', capa: 'f14sl-c03-blanco' },
  { id: 'arena', label: 'Arena', sw: 'linear-gradient(135deg, #ecece1, #bdbba1)', capa: 'f14sl-c05-arena' },
  { id: 'oro', label: 'Oro', sw: '#e9bd00', capa: 'f14sl-c06-oro' },
  { id: 'cobre', label: 'Cobre', sw: '#9e5c38', capa: 'f14sl-c07-cobre' },
  { id: 'naranja', label: 'Naranja', sw: '#ff6025', capa: 'f14sl-c08-naranja' },
  { id: 'rojo', label: 'Rojo', sw: '#ea0016', capa: 'f14sl-c10-rojo' },
  { id: 'burdeos', label: 'Burdeos', sw: 'linear-gradient(135deg, #900220, #3e0109)', capa: 'f14sl-c11-burdeos' },
  { id: 'fucsia', label: 'Fucsia', sw: '#c80050', capa: 'f14sl-c12-fucsia' },
  { id: 'azul-claro', label: 'Azul claro', sw: '#2ea7f7', capa: 'f14sl-c14-azul_claro' },
  { id: 'turquesa', label: 'Turquesa', sw: '#74f2e8', capa: 'f14sl-c15-turquesa' },
  { id: 'verde-lima', label: 'Verde lima', sw: '#91f300', capa: 'f14sl-c16-verde_lima' },
  { id: 'verde-ingles', label: 'Verde inglés', sw: '#2f6a44', capa: 'f14sl-c17-verde_ingles' },
  { id: 'grafito', label: 'Grafito', sw: '#444444', capa: 'f14sl-c18-grafito' },
  { id: 'plata', label: 'Plata', sw: '#a6a6ab', capa: 'f14sl-c19-plata' },
  { id: 'marron-tierra', label: 'Marrón tierra', sw: '#be6436', capa: 'f14sl-c20-marron_tierra' },
  { id: 'verde-pino', label: 'Verde pino', sw: '#678457', capa: 'f14sl-c21-verde_pino' },
  { id: 'rosa-metalizado', label: 'Rosa metalizado', sw: '#d8b2c6', capa: 'f14sl-n01-rosa_metal' },
  { id: 'azul-metalizado', label: 'Azul metalizado', sw: '#007ea9', capa: 'f14sl-n02-azul' },
  { id: 'rojo-metalizado', label: 'Rojo metalizado', sw: '#a81d3e', capa: 'f14sl-n03-rojo_nuevo' },
  { id: 'naranja-sunset', label: 'Naranja sunset', sw: '#ea9c4e', capa: 'f14sl-n04-naranja_nuevo' },
  { id: 'amarillo', label: 'Amarillo', sw: '#fde533', capa: 'f14sl-n06-amarillo' },
  { id: 'verde-manzana', label: 'Verde manzana', sw: '#4ec64e', capa: 'f14sl-n07-verde_nuevo' },
];

function coloresDelCorteF14(modelo) {
  return F14_ESTANDAR.map(({ id, label, sw, capa }) => ({
    id, label, sw, capa: `cortes/${modelo}/${capa}`, capa3d: `octane/cortes/${modelo}/${capa}`,
  }));
}

window.MENDIZ_F14_COLORES = {
  capas: 'assets/img/f14-sl-slp/capas/',
  fijas: { sombra: 'f14sl-sombra', brillos: 'f14sl-brillos', componentes: 'f14sl-componentes' },
  precios: { color: 100, corte: 100, premium: 190 },

  // Colores de serie: incluidos en el precio
  serie: [
    { id: 'blanco', color: 'blanco', acabado: 'brillo', pegatinas: 'negro' },
    { id: 'naranja-sunset', color: 'naranja-sunset', acabado: 'brillo', pegatinas: 'negro' },
    { id: 'verde-pino', color: 'verde-pino', acabado: 'brillo', pegatinas: 'blanco' },
  ],

  // Color principal
  colores: {
    std: F14_ESTANDAR,
    premium: [
      { id: 'camaleon-cian-purpura', label: 'Camaleón cian a púrpura', sw: 'linear-gradient(135deg, #447aa7, #2c6398 35%, #1d1158 65%, #08072b)', capa: 'f14sl-p01-cian-purpura' },
      { id: 'camaleon-cobre-verde', label: 'Camaleón cobre a verde', sw: 'linear-gradient(135deg, #ad7d64, #986649 35%, #424c23 65%, #263914)', capa: 'f14sl-p02-cobre-verde' },
      { id: 'camaleon-plata-rosa', label: 'Camaleón plata a rosa', sw: 'linear-gradient(135deg, #d7c8df, #cebcd9 35%, #686e8a 65%, #4f5e72)', capa: 'f14sl-p03-plata-rosa' },
      { id: 'camaleon-violeta-verde', label: 'Camaleón violeta a verde', sw: 'linear-gradient(135deg, #c9a1c4, #bd8db9 35%, #49616a 65%, #214b3f)', capa: 'f14sl-p04-violeta-verde' },
      { id: 'camaleon-azul-amarillo', label: 'Camaleón azul a amarillo', sw: 'linear-gradient(135deg, #b8dbc1, #a5cfb3 35%, #1f676d 65%, #124b4b)', capa: 'f14sl-p05-azul-amarillo' },
      { id: 'holografico-arcoiris', label: 'Holográfico arcoíris', sw: 'linear-gradient(135deg, #e7a3b8, #a9d6e6 35%, #cfe2a3 65%, #5d5763)', capa: 'f14sl-p06-holografito-arcoirirs' },
    ],
  },

  // Diseño: un color o un corte de pintura (zona en color secundario).
  // Cada corte trae sus capas de color secundario (capa = una por color).
  // Los cortes sin colores2 aún no tienen capas: salen como «Próximamente».
  disenos: [
    { id: 'liso', label: 'Un color', sub: 'Todo el cuadro en el color principal' },
    {
      id: 'corte-f14', label: 'Corte F14', sub: 'Trama gráfica de la F14 en el color secundario',
      colores2: [
        { id: 'plata', label: 'Plata', sw: '#a6a6ab', capa: 'f14sl-color02_trama-c19-plata' },
        { id: 'blanco', label: 'Blanco', sw: '#f3f3f3', capa: 'f14sl-color02_trama-c03-blanco' },
        { id: 'negro', label: 'Negro', sw: '#151515', capa: 'f14sl-color02_trama-c18-grafito' },
      ],
    },
    { id: 'corte-f12', label: 'Corte F12', sub: 'El corte de la F12 SL', colores2: coloresDelCorteF14('f12') },
    { id: 'corte-g12', label: 'Corte G12', sub: 'El corte de la G12 SL', colores2: coloresDelCorteF14('g12') },
    { id: 'corte-x21', label: 'Corte X21', sub: 'El corte de la X21 SL', colores2: coloresDelCorteF14('x21') },
  ],

  // Pegatinas (logotipos del cuadro): las mismas con estándar y premium
  pegatinas: [
    { id: 'negro', label: 'Negro', sw: '#151515', capa: 'f14sl-pegatinas-c01-negro' },
    { id: 'blanco', label: 'Blanco', sw: '#f3f3f3', capa: 'f14sl-pegatinas-c03-blanco' },
    { id: 'oro', label: 'Oro', sw: '#e9bd00', capa: 'f14sl-pegatinas-c06-oro' },
    { id: 'rojo', label: 'Rojo', sw: '#ea0016', capa: 'f14sl-pegatinas-c10-rojo' },
    { id: 'grafito', label: 'Grafito', sw: '#444444', capa: 'f14sl-pegatinas-c18-grafito' },
    { id: 'holografico-arcoiris', label: 'Holográfico arcoíris', sw: 'linear-gradient(135deg, #e7a3b8, #a9d6e6 35%, #cfe2a3 65%, #5d5763)', capa: 'f14sl-pegatinas-p06-holografito-arcoirirs' },
    { id: 'plata', label: 'Plata', sw: '#a6a6ab', capa: 'f14-pegatina-plata' },
    { id: 'berenjena', label: 'Berenjena', sw: 'linear-gradient(135deg, #c9a1c4, #bd8db9 35%, #49616a 65%, #214b3f)', capa: 'f14-pegatina-berenjena' },
  ],
};
