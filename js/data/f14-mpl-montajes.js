/* ==========================================================================
   F14 MPL — Montajes cerrados (MPL Concept, edición limitada)
   Seis montajes MPL de la ficha F14 (f14-sl-slp.html#montajes, filtro «MPL»).
   Los componentes marcados con «origen: 'f14-sl-slp'» toman la especificación
   del montaje F14 SL-SLP equivalente (js/data/f14-montajes.js).
   Usado por js/montaje-cerrado.js en montaje-f14-mpl.html (?montaje=<code>).
   ========================================================================== */

(() => {
  const SL = 'f14-sl-slp';
  const di2_105 = {
    Mandos: { v: 'Shimano 105 Di2 7170', origen: SL },
    Cambio: { v: 'Shimano 105 Di2 7150', origen: SL },
    Desviador: { v: 'Shimano 105 Di2 7150', origen: SL },
    Bielas: { v: 'Shimano 105 7100 34/50', origen: SL },
    Cassette: { v: 'Shimano 105 R7100 11/34', origen: SL },
    Frenos: { v: 'Shimano 105 7170', origen: SL },
    Disco: { v: 'Shimano RT70 140 mm', origen: SL },
  };
  const ultegra = {
    Mandos: { v: 'Shimano Ultegra Di2 R8170', origen: SL },
    Cambio: { v: 'Shimano Ultegra Di2 R8150', origen: SL },
    Desviador: { v: 'Shimano Ultegra Di2 R8150', origen: SL },
    Bielas: { v: 'Shimano Ultegra 34/50 o 36/52', origen: SL },
    Cassette: { v: 'Shimano R8100 11/34', origen: SL },
    Frenos: { v: 'Shimano Ultegra R8170', origen: SL },
    Disco: { v: 'Shimano CL800 160/140 mm', origen: SL },
  };
  const duraAce = {
    Mandos: { v: 'Shimano Dura-Ace Di2 R9270', origen: SL },
    Cambio: { v: 'Shimano Dura-Ace Di2 R9250', origen: SL },
    Desviador: { v: 'Shimano Dura-Ace Di2 R9250', origen: SL },
    Bielas: { v: 'Shimano Dura-Ace R9200 36/52', origen: SL },
    Cassette: { v: 'Shimano R9200 11/34', origen: SL },
    Frenos: { v: 'Shimano Dura-Ace R9270', origen: SL },
    Disco: { v: 'Shimano CL900 160/140 mm', origen: SL },
  };
  const metron = 'Vision Metron 5D SMR, integrado';

  const montaje = (code, grupo, desarrollo, ruedas, precio, extra = {}, peso = null) => ({
    code, grupo, desarrollo, ruedas, precio, peso,
    componentes: { Cuadro: 'F14 MPL, carbono monocasco', Grupo: grupo, Desarrollo: desarrollo, ...extra, Ruedas: ruedas },
  });

  window.MENDIZ_MONTAJE_CERRADO = {
    modelo: 'F14 MPL',
    slug: 'f14-mpl',
    coleccion: 'MPL Concept',
    porDefecto: 'F14S.06',
    colores: [
      { id: 'blanco', label: 'Blanco / Oro', sw: 'linear-gradient(90deg,#ffffff 50%,#fada83 50%)', img: 'assets/img/mpl/f14-mpl-montaje-blanco.webp' },
      { id: 'negro', label: 'Negro mate / Oro', sw: 'linear-gradient(90deg,#000000 50%,#fada83 50%)', img: 'assets/img/mpl/f14-mpl-montaje-negro.webp' },
      { id: 'verde', label: 'Verde inglés / Oro', sw: 'linear-gradient(90deg,#006000 50%,#fada83 50%)', img: 'assets/img/mpl/f14-mpl-montaje-verde.webp' },
    ],
    montajes: [
      montaje('F14S.06', 'Shimano 105', '34/50 · 11-34', 'DT Swiss A-1800', 2150),
      montaje('F14S.06C', 'Shimano 105', '34/50 · 11-34', 'Vision TC45 Carbon', 2650),
      montaje('F14S.05', 'Shimano 105 Di2', '34/50 · 11-34', 'DT Swiss A-1800', 2990, di2_105),
      montaje('F14S.05C', 'Shimano 105 Di2', '34/50 · 11-34', 'Vision TC45 Carbon', 3390, di2_105),
      montaje('F14S.02C', 'Shimano Ultegra Di2', '34/50 o 36/52 · 11-34', 'Vision TC45 Carbon', 3890, { ...ultegra, Manillar: metron }, '7,6 kg'),
      montaje('F14S.01C', 'Shimano Dura-Ace Di2', '36/52 · 11-34', 'Fulcrum Soniq 42/47', 5130, { ...duraAce, Manillar: metron }, '7,4 kg'),
    ],
  };
})();
