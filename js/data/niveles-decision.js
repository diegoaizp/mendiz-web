/* ==========================================================================
   MENDIZ — Niveles de decisión del configurador (ERP)
   Los diez niveles y sus 55 opciones, tal como están dados de alta en el ERP.
   Los usan los dos asesores:
     · «¿Qué Mendiz es para ti?» (js/que-mendiz.js): niveles 1–7, hasta el
       modelo y su versión.
     · «Configura tu Mendiz» (js/ofy-asesor.js): niveles 1–10, hasta el
       montaje. tools/ofy-asesor.py valida contra este archivo los códigos
       que asigna a cada montaje.

   Cada nivel: field (campo del montaje o del modelo), label, q (pregunta) y
   help. Cada opción:
     · erp: código ERP (es el valor que llevan los datos).
     · ps: «Valor de PrestaShop», copiado tal cual del ERP.
     · id: cómo aparece en la dirección (#/…).
     · title: texto en la web (el de PrestaShop con la grafía corregida;
       en disciplina, el nombre de la categoría de la web).
     · text: descripción corta (configurador Only For You).
     · plain y story: titular en lenguaje llano y explicación para quien no
       conoce el término (¿Qué Mendiz es para ti?).
     · icon (Material Symbols) e img/alt opcionales; cover: la foto llena el
       hueco aunque sea de material o gama (por defecto, completa sobre gris).
   El orden de las opciones es el orden en pantalla.
   Es JSON puro (sin comentarios dentro) para que lo lea tools/ofy-asesor.py.
   ========================================================================== */
window.MENDIZ_NIVELES = [
 {
  "field": "tipo", "label": "Tipo de bicicleta", "q": "¿Qué tipo de bici buscas?", "help": "Con o sin motor: es lo primero que define tu Mendiz.",
  "options": [
   {"erp": "CONV", "ps": "Convencional", "id": "convencional", "title": "Convencional", "text": "Pedalear con tus piernas, con una bici más ligera y sencilla.", "icon": "pedal_bike", "img": "assets/img/ofy-asesor/tipo-muscular-uso.webp", "alt": "Dos ciclistas rodando con bicicletas Mendiz por una carretera entre árboles", "plain": "Sin motor", "story": "La bici de siempre: todo el impulso sale de tus piernas. Pesa menos, es más sencilla de mantener y no depende de ninguna batería."},
   {"erp": "E-BIKE", "ps": "E-Bike", "id": "e-bike", "title": "E-Bike", "text": "Un motor Polini que acompaña tu pedaleo en las subidas y las rutas largas.", "icon": "bolt", "img": "assets/img/ofy-asesor/tipo-electrica-uso.webp", "alt": "Ciclista subiendo un camino de bosque con una Mendiz EG21 eléctrica", "plain": "Con ayuda eléctrica", "story": "Un motor Polini suma fuerza a tu pedalada cuando lo necesitas. Las cuestas se suavizan y llegas más lejos con el mismo esfuerzo; pedalear sigue siendo cosa tuya."}
  ]
 },
 {
  "field": "disciplina", "label": "Disciplina", "q": "¿Por dónde vas a rodar?", "help": "Elige el terreno en el que vas a pasar más tiempo.",
  "options": [
   {"erp": "ROAD", "ps": "Road", "id": "carretera", "title": "Carretera", "text": "Asfalto, puertos y carreteras secundarias.", "icon": "road", "img": "assets/img/compartido/terrenos/carretera.webp", "alt": "Ciclistas en carretera con bicicletas Mendiz", "plain": "Por asfalto", "story": "Carreteras secundarias, puertos y salidas en grupo. Ruedas finas y una bici ágil que corre sobre el asfalto."},
   {"erp": "GRAVEL", "ps": "Gravel", "id": "gravel", "title": "Gravel", "text": "Combinar carretera, pistas y grava.", "icon": "route", "img": "assets/img/compartido/terrenos/gravel.webp", "alt": "Cicloturismo gravel junto al lago con bicicletas Mendiz", "plain": "Asfalto y caminos", "story": "Sales por carretera y sigues por pistas de tierra y grava sin pensártelo. Manillar de carretera, ruedas más anchas y agarre para salir del asfalto."},
   {"erp": "MTB", "ps": "Mtb", "id": "montana", "title": "Montaña", "text": "Pistas, senderos y zonas de piedras y raíces.", "icon": "terrain", "img": "assets/img/compartido/terrenos/montana.webp", "alt": "Ciclista de montaña en sendero con Mendiz X40", "plain": "Pistas y senderos de montaña", "story": "Senderos, piedras, raíces y subidas empinadas. Ruedas de tacos y suspensión para tener control cuando el terreno se complica."}
  ]
 },
 {
  "field": "modalidad", "label": "Modalidad", "q": "¿Qué modalidad es la tuya?", "help": "Cada modalidad tiene su geometría: más baja y alargada para ir rápido, más erguida para ganar comodidad.",
  "options": [
   {"erp": "PERFORMANCE", "ps": "Performance", "id": "performance", "title": "Performance", "text": "Entrenar y competir en recorridos variados, con subidas, llanos y bajadas.", "icon": "landscape", "img": "assets/img/ofy-asesor/modalidad-rendimiento-uso.webp", "alt": "Ciclista Mendiz afrontando una curva en carretera", "plain": "Rápida en cualquier recorrido", "story": "Para quien entrena y compite. Ligera para subir puertos, firme para responder cuando aprietas y estable en las bajadas. Una posición deportiva que se aguanta toda la mañana."},
   {"erp": "AERO", "ps": "Aero", "id": "aero", "title": "Aero", "text": "Rodar rápido en llano y en grupo, con una posición más baja.", "icon": "speed", "img": "assets/img/ofy-asesor/modalidad-aero-uso.webp", "alt": "Ciclista con una Mendiz F14 MPL en posición aerodinámica", "plain": "La más rápida en llano", "story": "Tubos con forma de ala que cortan el aire. A partir de cierta velocidad el aire es lo que más te frena: aquí gastas menos energía para ir igual de rápido. Para llanos, grupetas y sprints."},
   {"erp": "ENDURANCE", "ps": "Endurance", "id": "endurance", "title": "Endurance", "text": "Largas jornadas y marchas, con una posición más cómoda.", "icon": "schedule", "img": "assets/img/ofy-asesor/modalidad-gran-fondo-uso.webp", "alt": "Dos ciclistas compartiendo una salida en carretera con bicicletas Mendiz", "plain": "Cómoda durante muchas horas", "story": "Para salidas largas y marchas cicloturistas. El manillar queda algo más alto y cerca, así espalda, cuello y manos sufren menos y llegas entero al último kilómetro."},
   {"erp": "TT", "ps": "Time Trial", "id": "time-trial", "title": "Time Trial", "text": "Triatlón y contrarreloj, acoplado sobre el manillar.", "icon": "timer", "img": "assets/img/ofy-asesor/modalidad-triatlon-uso.webp", "alt": "Ciclista con la Mendiz TT10 en posición aerodinámica sobre el manillar", "plain": "Para triatlón y contrarreloj", "story": "Ruedas solo y contra el reloj, con los antebrazos apoyados en un acople sobre el manillar. La postura más aerodinámica posible; no es una bici para salir en grupo."},
   {"erp": "GRVL_RCNG", "ps": "Gravel Racing", "id": "gravel-racing", "title": "Gravel Racing", "text": "Ritmo en pistas y pruebas de gravel.", "icon": "emoji_events", "img": "assets/img/compartido/terrenos/gravel-jump.webp", "alt": "Ciclista saltando con una bici de gravel Mendiz en una pista", "plain": "Rápida fuera del asfalto", "story": "Gravel con alma de carreras: ligera y viva para ir rápido por pistas, entrenar o competir en pruebas de gravel, sin renunciar a los tramos de carretera."},
   {"erp": "GRVL_XPLR", "ps": "Gravel Explore", "id": "gravel-explore", "title": "Gravel Explore", "text": "Rutas largas y viajes con equipaje por pistas, caminos y asfalto.", "icon": "explore", "img": "assets/img/que-mendiz/intro-sendero.webp", "alt": "Ciclista con una Mendiz G11 y bolsa de sillín subiendo por una pista entre pinos", "plain": "Aventura y rutas largas", "story": "Para perderte por caminos durante horas o días. Posición cómoda, sitio para ruedas anchas y anclajes para llevar bolsas y equipaje."},
   {"erp": "HARDTRAIL", "ps": "Hardtrail", "id": "hardtrail", "title": "Hardtrail", "text": "Rígida con suspensión delantera: ligera, sencilla y eficaz al pedalear.", "icon": "forest", "plain": "Suspensión solo delante", "story": "La horquilla tiene suspensión y la parte trasera es rígida. Es más ligera y sencilla, y cada pedalada se convierte en avance. Para pistas, rutas y circuitos de cross country.", "img": "assets/img/x21-sl/detalle-bdd47153b0.webp", "alt": "Ciclista con una Mendiz X21 SL rígida en un terreno de cárcavas"},
   {"erp": "DO_SUSXC", "ps": "Doble Suspensión XC", "id": "doble-suspension-xc", "title": "Doble suspensión XC", "text": "Cross country: subir con ritmo y bajar con control.", "icon": "terrain", "img": "assets/img/compartido/terrenos/montana-alt.webp", "alt": "Ciclista subiendo por el bosque con una Mendiz de doble suspensión", "plain": "Suspensión delante y detrás, para ir rápido", "story": "Doble suspensión de poco recorrido pensada para cross country: absorbe piedras y raíces para que no pierdas agarre ni ritmo, y apenas pesa más que una rígida."},
   {"erp": "DO_SUSDC", "ps": "Doble Suspension DC", "id": "doble-suspension-dc", "title": "Doble suspensión DC", "text": "Doble suspensión con algo más de recorrido que una XC.", "icon": "alt_route", "plain": "Doble suspensión polivalente", "story": "Un punto intermedio: algo más de suspensión que una de cross country para disfrutar más en las bajadas, sin perder agilidad en las subidas."},
   {"erp": "DO_SUSTRL", "ps": "Doble Suspensión Trail", "id": "doble-suspension-trail", "title": "Doble suspensión Trail", "text": "Más recorrido de suspensión para senderos técnicos y bajadas.", "icon": "landslide", "img": "assets/img/ex41/ex41_exterior_brudeos_en_accion.webp", "alt": "Ciclista bajando un sendero de bosque con una Mendiz EX41", "plain": "Más suspensión para bajadas técnicas", "story": "Mucho recorrido de suspensión delante y detrás para senderos rotos, escalones y bajadas exigentes. Subes con calma y bajas con confianza."}
  ]
 },
 {
  "field": "material", "label": "Material del cuadro", "q": "¿De qué material quieres el cuadro?", "help": "El material marca el peso y el tacto de la bici.",
  "options": [
   {"erp": "CARBON", "ps": "Carbono", "id": "carbono", "title": "Carbono", "text": "Más ligero y rígido.", "icon": "diamond", "img": "assets/img/ofy-asesor/material-carbono.webp", "alt": "", "plain": "Más ligera y con mejor tacto", "story": "El carbono permite cuadros muy ligeros y rígidos que además filtran las vibraciones del suelo. Lo notas al subir y cada vez que aceleras."},
   {"erp": "ALLOY", "ps": "Aluminio", "id": "aluminio", "title": "Aluminio", "text": "Resistente y más económico.", "icon": "construction", "plain": "Robusta y más económica", "story": "El aluminio es resistente, aguanta bien los golpes y cuesta menos. Pesa algo más, pero es una gran forma de empezar o de tener una bici para todo.", "img": "assets/img/x10/detalle-6273aa5473.webp", "alt": ""}
  ]
 },
 {
  "field": "eje", "label": "Sistema de eje", "q": "¿Qué sistema de eje prefieres?", "help": "Cómo se sujetan las ruedas al cuadro y a la horquilla.",
  "options": [
   {"erp": "BOOST", "ps": "Boost", "id": "boost", "title": "Boost", "text": "Ejes más anchos para una rueda de montaña más rígida.", "icon": "open_in_full", "img": "assets/img/x10-boost/detalle-53195d10e8.webp", "alt": "", "plain": "Rueda más firme", "story": "El buje de la rueda es algo más ancho, lo que abre el ángulo de los radios: la rueda flexa menos en curvas y zonas rotas. Es el estándar actual en montaña."},
   {"erp": "QR", "ps": "Quick Release", "id": "quick-release", "title": "Quick Release", "text": "Cierre rápido: sencillo y fácil de desmontar.", "icon": "sync_alt", "plain": "Quitar la rueda en segundos", "story": "Una palanca de cierre rápido permite quitar y poner la rueda sin herramientas. Sencillo, ligero y muy fácil de mantener.", "img": "assets/img/x10/detalle-99e3d6b7dc.webp", "alt": ""}
  ]
 },
 {
  "field": "gama", "label": "Gama de carbono", "q": "¿Qué gama de carbono prefieres?", "help": "Las gamas comparten geometría; cambia la construcción del carbono y, con ella, el peso.",
  "options": [
   {"erp": "CARBON S", "ps": "Mendiz Sport Carbon", "id": "sport", "title": "Mendiz Sport Carbon", "text": "La construcción Sport: la puerta de entrada al carbono Mendiz.", "icon": "sprint", "plain": "El carbono Mendiz más accesible", "story": "Mendiz Sport Carbon: un cuadro de carbono ligero y resistente al precio más ajustado, para disfrutar del carbono sin ir a lo más alto de la gama.", "img": "assets/img/f14-sl-slp/f14-carbono-raw-union.webp", "alt": "", "cover": true},
   {"erp": "CARBON SL", "ps": "Mendiz Super Ligth Carbon", "id": "sl", "title": "Mendiz Super Light Carbon", "text": "Super Light: el equilibrio entre peso y precio.", "icon": "balance", "img": "assets/img/ofy-asesor/gama-sl-tres-capas.webp", "alt": "Tres capas de carbono Mendiz SL", "plain": "El equilibrio entre peso y precio", "story": "Super Light: un cuadro muy ligero con una construcción optimizada, para quien quiere rendimiento de verdad sin disparar el presupuesto."},
   {"erp": "CARBON SLP", "ps": "Mendiz Super Ligth Performance Carbon", "id": "slp", "title": "Mendiz Super Light Performance Carbon", "text": "Super Light Performance: la construcción más ligera, con los grupos más altos.", "icon": "diamond", "img": "assets/img/ofy-asesor/gama-slp-tres-capas.webp", "alt": "Tres capas de carbono Mendiz SLP", "plain": "Lo más ligero de Mendiz", "story": "Super Light Performance: la misma geometría que la SL con la construcción de carbono más ligera, reservada a los montajes más altos. Para quien cuenta cada gramo."}
  ]
 },
 {
  "field": "version", "label": "Versión", "q": "¿Qué versión prefieres?", "help": "Standard es la bici de catálogo, con todos sus montajes y colores. MPL es una edición limitada con montaje y color definidos.",
  "options": [
   {"erp": "STANDARD", "ps": "Standard", "id": "standard", "title": "Standard", "text": "Todos los montajes y colores del modelo.", "icon": "tune", "plain": "Elige tu montaje y tu color", "story": "La versión de catálogo, con todos sus montajes y colores disponibles para que elijas la combinación que mejor te encaja.", "img": "assets/img/compartido/montada-una-a-una.webp", "alt": "Mecánico de Mendiz montando una bicicleta en el taller"},
   {"erp": "MPL", "ps": "MPL", "id": "mpl", "title": "MPL", "text": "Edición limitada: montaje y color definidos y disponibilidad casi inmediata.", "icon": "workspace_premium", "plain": "Edición limitada, lista cuanto antes", "story": "MPL Concept: una edición limitada con montaje y color ya definidos. Componentes de gama alta a un precio ajustado y disponibilidad casi inmediata.", "img": "assets/img/mpl/mpl-menu-1200.webp", "alt": "Mendiz MPL sobre una peana en un estudio"}
  ]
 },
 {
  "field": "horquilla", "label": "Horquilla", "q": "¿Qué horquilla quieres?", "help": "La suspensión delantera marca cómo absorbe la bici el terreno y cuánto pesa.",
  "options": [
   {"erp": "RS_RECON", "ps": "RockShox Recon", "id": "rockshox-recon", "title": "RockShox Recon", "text": "Suspensión de 100 mm.", "icon": "swap_vert", "img": "assets/img/ofy-asesor/horquilla-rockshox-recon-rl-100-mm.webp", "alt": ""},
   {"erp": "FX_RHYTHM", "ps": "Fox Rhythm", "id": "fox-rhythm", "title": "Fox Rhythm", "text": "Suspensión de 100 mm.", "icon": "swap_vert", "img": "assets/img/ofy-asesor/horquilla-fox-float-rhythm-32-100-mm.webp", "alt": ""},
   {"erp": "RS_SID", "ps": "RockShox Sid", "id": "rockshox-sid", "title": "RockShox SID", "text": "Suspensión de 100 mm, la más ligera.", "icon": "swap_vert", "img": "assets/img/ofy-asesor/horquilla-rockshox-sid-sl-100-mm.webp", "alt": ""},
   {"erp": "DT_F232", "ps": "DTSwiss F232", "id": "dt-swiss-f232", "title": "DT Swiss F232", "text": "Suspensión de 100 mm.", "icon": "swap_vert"},
   {"erp": "RS_E35", "ps": "RockShox E35", "id": "rockshox-e35", "title": "RockShox E35", "text": "Suspensión de 150 mm.", "icon": "swap_vert", "img": "assets/img/ofy-asesor/horquilla-rockshox-35-gold-rl-150-mm.webp", "alt": ""},
   {"erp": "FX_PERFORMANCE", "ps": "Fox Performance", "id": "fox-performance", "title": "Fox Performance", "text": "Suspensión de 150 mm.", "icon": "swap_vert", "img": "assets/img/ofy-asesor/horquilla-fox-36-performance-150-mm.webp", "alt": ""}
  ]
 },
 {
  "field": "transmision", "label": "Transmisión", "q": "¿Qué transmisión quieres?", "help": "La transmisión marca cómo cambias y cómo frenas, y buena parte del precio. Con cambio electrónico, cada cambio es un toque.",
  "options": [
   {"erp": "SH_105", "ps": "Shimano 105", "id": "shimano-105", "title": "Shimano 105", "text": "Cambio mecánico 2×12.", "icon": "settings", "img": "assets/img/ofy-asesor/transmision-shimano-105.webp", "alt": ""},
   {"erp": "SH_105DI2", "ps": "Shimano 105Di2", "id": "shimano-105-di2", "title": "Shimano 105 Di2", "text": "Cambio electrónico 2×12.", "icon": "settings", "img": "assets/img/ofy-asesor/transmision-shimano-105-di2.webp", "alt": ""},
   {"erp": "SH_ULT", "ps": "Shimano Ultegra", "id": "shimano-ultegra", "title": "Shimano Ultegra", "text": "Cambio electrónico 2×12.", "icon": "settings", "img": "assets/img/ofy-asesor/transmision-shimano-ultegra-di2.webp", "alt": ""},
   {"erp": "SH_DA", "ps": "Shimano Dura-Ace", "id": "shimano-dura-ace", "title": "Shimano Dura-Ace", "text": "Cambio electrónico 2×12.", "icon": "settings", "img": "assets/img/ofy-asesor/transmision-shimano-dura-ace-di2.webp", "alt": ""},
   {"erp": "SRM_RVL", "ps": "Sram Rival 2x12", "id": "sram-rival", "title": "SRAM Rival 2×12", "text": "Cambio electrónico inalámbrico 2×12.", "icon": "settings", "img": "assets/img/ofy-asesor/transmision-sram-rival-axs-e1.webp", "alt": ""},
   {"erp": "SRM_FRC", "ps": "Sram Force 2x12", "id": "sram-force", "title": "SRAM Force 2×12", "text": "Cambio electrónico inalámbrico 2×12.", "icon": "settings", "img": "assets/img/ofy-asesor/transmision-sram-force-axs-e1.webp", "alt": ""},
   {"erp": "SRM_RED", "ps": "Sram Red 2x12", "id": "sram-red", "title": "SRAM RED 2×12", "text": "Cambio electrónico inalámbrico 2×12.", "icon": "settings", "img": "assets/img/ofy-asesor/transmision-sram-red-axs-e1.webp", "alt": ""},
   {"erp": "SH_GRX400", "ps": "Shimano GRX400 2x10", "id": "shimano-grx400", "title": "Shimano GRX400 2×10", "text": "Cambio mecánico 2×10.", "icon": "settings", "img": "assets/img/ofy-asesor/transmision-shimano-grx-400.webp", "alt": ""},
   {"erp": "SH_GRX400F", "ps": "Shimano GRX400 Manillar Plano 2x10", "id": "shimano-grx400-manillar-plano", "title": "Shimano GRX400 manillar plano 2×10", "text": "Cambio mecánico 2×10, con manillar plano y postura más erguida.", "icon": "settings", "img": "assets/img/ofy-asesor/version-manillar-plano.webp", "alt": ""},
   {"erp": "SH_GRX600", "ps": "Shimano GRX600 2x12", "id": "shimano-grx600", "title": "Shimano GRX600 2×12", "text": "Cambio mecánico 2×12.", "icon": "settings"},
   {"erp": "SH_GRX8001X", "ps": "Shimano GRX800 1x12", "id": "shimano-grx800-1x12", "title": "Shimano GRX800 1×12", "text": "Cambio mecánico 1×12: un solo plato, más sencillo.", "icon": "settings", "img": "assets/img/ofy-asesor/transmision-shimano-grx-820-1x12.webp", "alt": ""},
   {"erp": "SH_GRX8002X", "ps": "Shimano GRX800 2x12", "id": "shimano-grx800-2x12", "title": "Shimano GRX800 2×12", "text": "Cambio mecánico 2×12: más desarrollos para rutas con desnivel.", "icon": "settings", "img": "assets/img/ofy-asesor/transmision-shimano-grx-820-2x12.webp", "alt": ""},
   {"erp": "SH_GRX717DI2", "ps": "Shimano GRX717 Di2 1x12", "id": "shimano-grx717-di2", "title": "Shimano GRX717 Di2 1×12", "text": "Cambio electrónico 1×12.", "icon": "settings", "img": "assets/img/ofy-asesor/transmision-shimano-grx-di2-1x12.webp", "alt": ""},
   {"erp": "SH_GRX800DI22X", "ps": "Shimano GRX800 Di2 2x12", "id": "shimano-grx800-di2", "title": "Shimano GRX800 Di2 2×12", "text": "Cambio electrónico 2×12.", "icon": "settings", "img": "assets/img/ofy-asesor/transmision-shimano-grx-825-di2-2x12.webp", "alt": ""},
   {"erp": "CMPG_EKARGT", "ps": "Campagnolo Ekar GT 1x13", "id": "campagnolo-ekar-gt", "title": "Campagnolo Ekar GT 1×13", "text": "Cambio mecánico 1×13.", "icon": "settings", "img": "assets/img/ofy-asesor/transmision-campagnolo-ekar-gt-1x13.webp", "alt": ""},
   {"erp": "SRM_RVLXPLR", "ps": "Sram Rival XPLR 1x13", "id": "sram-rival-xplr", "title": "SRAM Rival XPLR 1×13", "text": "Cambio electrónico inalámbrico 1×13.", "icon": "settings", "img": "assets/img/ofy-asesor/transmision-sram-rival-xplr-axs-e1-1x13.webp", "alt": ""},
   {"erp": "SRM_REDXPLR", "ps": "Sram Red XPLR 1x13", "id": "sram-red-xplr", "title": "SRAM RED XPLR 1×13", "text": "Cambio electrónico inalámbrico 1×13.", "icon": "settings", "img": "assets/img/ofy-asesor/transmision-sram-red-xplr-axs-e1-1x13.webp", "alt": ""},
   {"erp": "SRM_NX", "ps": "Sram NX", "id": "sram-nx", "title": "SRAM NX", "text": "Cambio mecánico 1×12.", "icon": "settings"},
   {"erp": "SH_DSLX", "ps": "Shimano SLX-Deore", "id": "shimano-slx-deore", "title": "Shimano SLX-Deore", "text": "Cambio mecánico 1×12.", "icon": "settings", "img": "assets/img/ofy-asesor/transmision-shimano-slx-1x12.webp", "alt": ""},
   {"erp": "SRM_GX", "ps": "Sram GX", "id": "sram-gx", "title": "SRAM GX", "text": "Cambio mecánico 1×12.", "icon": "settings", "img": "assets/img/ofy-asesor/transmision-sram-gx-eagle.webp", "alt": ""},
   {"erp": "SH_XTSLX", "ps": "Shimano XT-SLX", "id": "shimano-xt-slx", "title": "Shimano XT-SLX", "text": "Cambio mecánico 1×12, con cassette SLX.", "icon": "settings", "img": "assets/img/ofy-asesor/transmision-shimano-xt-cassette-slx.webp", "alt": ""},
   {"erp": "SH_XT", "ps": "Shimano XT", "id": "shimano-xt", "title": "Shimano XT", "text": "Cambio mecánico 1×12, completo en XT.", "icon": "settings", "img": "assets/img/ofy-asesor/transmision-shimano-xt-1x12.webp", "alt": ""}
  ]
 },
 {
  "field": "ruedas", "label": "Ruedas", "q": "¿Y qué ruedas?", "help": "Las de carbono pesan menos y tienen perfiles más altos; las de aluminio son más resistentes y económicas.",
  "options": [
   {"erp": "W_ALLOY", "ps": "Ruedas Alumino", "id": "aluminio", "title": "Ruedas de aluminio", "text": "Más resistentes y económicas.", "icon": "trip_origin"},
   {"erp": "W_CARBON", "ps": "Ruedas Carbono", "id": "carbono", "title": "Ruedas de carbono", "text": "Más ligeras, con perfiles más altos.", "icon": "trip_origin"},
   {"erp": "W_CARBONSL", "ps": "Ruedas Carbono SL", "id": "carbono-sl", "title": "Ruedas de carbono SL", "text": "Las más ligeras de la gama.", "icon": "trip_origin"}
  ]
 }
];
