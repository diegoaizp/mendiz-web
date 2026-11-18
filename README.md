# Mendiz · Entrega de Frontend a Desarrollo (`MENDIZ dev`)

Repositorio base de maquetación, sistema de diseño, interactividad y activos multimedia optimizados para la nueva web de **Bicicletas Mendiz**.

> **Documentos clave del entregable**
> - **[`README.md`](README.md)** *(este archivo)*: arquitectura técnica, sistema CSS/JS, contratos de datos, generadores y guía paso a paso para escalar el catálogo o integrarlo en un CMS/framework.
> - **[`ESTADO-PAGINAS.md`](ESTADO-PAGINAS.md)**: inventario detallado del estado real de las 46 páginas HTML entregadas, qué les falta a las 15 fichas de bicicleta en desarrollo respecto al modelo maestro **F14** y listado de páginas/flujos de backend pendientes.
> - **[`CONVENCIONES.md`](CONVENCIONES.md)**: reglas de nomenclatura BEM, identificadores, ganchos `data-*`, accesibilidad y regeneración de código.

---

## 1. Visión general y puesta en marcha rápida

El proyecto está construido en **HTML5 semántico, CSS moderno nativo (Custom Properties, Grid, Container Queries, `:has()`) y JavaScript vanilla (ES2023+)** sin necesidad de bundler para su previsualización estática.

### Estado de referencia del catálogo («Gold Master» F14)
De los 16 modelos del catálogo actual, **únicamente el ecosistema de la Mendiz F14 está desarrollado a fondo como referencia maestra (Gold Master)**:
1. **`f14-sl-slp.html`** — Ficha completa de producto (vídeo local, escenario de colores de serie, KPIs tipográficos, narrativa de diseño, zigzag editorial de tecnologías, vídeo en uso con apertura por scroll, galería por revelado, acordeones técnicos con plano SVG vectorial interactivo + tabla de geometría + calculadora de talla, bloque dual OFY/MPL, 18 tarjetas de montaje filtrables SL/SLP/MPL y FAQ con JSON-LD).
2. **`configurador-f14.html`** — Configurador interactivo **Only For You** con personalizador multicapa en tiempo real (`2500 × 1667` WebP), cálculo dinámico de PVP, edición de componentes, recomendación de talla y estado persistido en URL + `localStorage`.
3. **`montaje-f14-mpl.html`** — Vista de montaje cerrado **MPL Concept** (edición limitada con selección de acabado MPL y talla sobre la misma arquitectura visual del configurador).

Las **otras 15 fichas de bicicleta** (`f12-sl.html`, `f9-sl.html`, `tt10.html`, `g12-sl.html`, `g11am.html`, `g4-icr.html`, `x40-sl-icr.html`, `x21-sl.html`, `x10-boost.html`, `x10.html`, `ex41.html`, `ef21.html`, `ef4.html`, `eg21.html`, `eg4.html`) utilizan actualmente una plantilla provisional de catálogo (`body.catalog-product` + `css/catalogo-producto.css`) en proceso de desarrollo. Consulta [`ESTADO-PAGINAS.md`](ESTADO-PAGINAS.md) para el desglose completo.

### Servidor local
Para probar todas las páginas, vídeos, fuentes e interacciones sin restricciones de `file://`:

```bash
python3 -m http.server 8000
# Abrir http://localhost:8000/index.html
```

---

## 2. Estructura de carpetas

```text
MENDIZ dev/
├── *.html                        # 46 páginas HTML estáticas en raíz (enlaces relativos directos)
├── favicon.ico                   # Favicon multi-tamaño de raíz
├── README.md                     # Guía técnica de arquitectura y handoff a desarrollo
├── ESTADO-PAGINAS.md             # Inventario de páginas terminadas, en desarrollo y pendientes
├── CONVENCIONES.md               # Convenciones BEM, data-*, IDs y código generado
├── css/                          # 19 hojas de estilo modulares (sin preprocesador)
│   ├── fonts.css                 # @font-face de Round 8 Four (local WOFF2/WOFF)
│   ├── tokens.css                # Design tokens globales (:root)
│   ├── base.css                  # Reset, tipografía, rejilla, botones, campos, <dialog>
│   ├── components.css            # Header, mega-menú, pie, tarjetas, filtros, rails, modales
│   ├── product.css               # Sistema completo de ficha de bicicleta (patrón F14)
│   ├── catalogo-producto.css     # Ajustes provisionales para las 15 fichas en desarrollo
│   ├── configurador-bici.css     # Configurador Only For You y montaje cerrado MPL
│   └── ...                       # Hojas específicas por sección (home, bicis, mpl, blog, etc.)
├── js/
│   ├── vendor/
│   │   └── lenis.min.js          # Scroll suave Lenis (autohospedado)
│   ├── data/                     # 6 payloads de datos puros (window.MENDIZ_*)
│   │   ├── f14-montajes.js       # Montajes, componentes y precios F14 SL-SLP
│   │   ├── f14-colores.js        # Colores de serie, estándar, premium, tramas y pegatinas F14
│   │   ├── f14-mpl-montajes.js   # 6 montajes cerrados y 3 acabados de F14 MPL
│   │   ├── niveles-decision.js   # Los 10 niveles y 55 opciones del ERP (los dos asesores)
│   │   ├── ofy-montajes.js       # Árbol consolidado de los 7 modelos OFY (generado)
│   │   ├── distribuidores-data.js# 221 distribuidores en España y capitales provinciales
│   │   └── espana-provincias.js  # GeoJSON simplificado de provincias para el mapa sin teselas
│   ├── main.js                   # Núcleo compartido en IIFE (window.MENDIZ)
│   ├── configurador-bici.js      # Motor del configurador Only For You
│   ├── montaje-cerrado.js        # Motor de ficha de montaje cerrado MPL
│   ├── talla-recomendada.js      # Calculadora orientativa de talla por estatura
│   ├── ofy-asesor.js             # Árbol de decisión ERP, niveles 1–10 («Configura tu Mendiz»)
│   ├── que-mendiz.js             # Árbol de decisión ERP, niveles 1–7 («¿Qué Mendiz es para ti?»)
│   ├── only-for-you.js           # Filtros de listado Only For You (?categoria= y ?modelo=)
│   ├── distribuidores.js         # Buscador postal/provincial/geolocalizado + mapa Leaflet
│   ├── catalogo-producto.js      # Sincronización de color en fichas provisionales
│   ├── blog.js                   # Acciones de compartir artículo y copia de enlace
│   └── acceso-b2b.js             # Validación de interfaz en acceso para tiendas
├── assets/                       # Recursos multimedia optimizados (WebP, MP4 faststart, WOFF2, PNG)
│   ├── fonts/                    # Tipografía display Round 8 Four
│   ├── favicon/                  # Iconos PNG / Apple Touch Icon
│   ├── only-for-you/             # Vídeos e imágenes de campaña Only For You
│   └── img/                      # Imágenes por modelo (<slug>/, compartido/, mpl/, ofy-asesor/…)
└── tools/                        # Generadores estáticos y utilidades técnicas en Python 3
    ├── header.py                 # Inyecta header, mega-menú, iconos y pie en los HTML
    ├── ofertas.py                # Genera ofertas.html y ofertas-<slug>.html
    ├── servicio.py               # Genera servicio.html y ayuda-<slug>.html
    ├── ofy-asesor.py             # Genera js/data/ofy-montajes.js desde datos/fichas
    ├── geometria-svg.py          # Vectoriza y calibra el plano SVG de geometría a escala 1 mm
    └── fuentes/
        └── f14sl-c01-negro.png   # Silueta maestra 2500×1667 de referencia para geometria-svg.py
```

> **¿Por qué los 46 HTML viven planos en la raíz?**
> En estático permite navegar toda la maqueta sin servidor de rutas ni reescrituras `../` cruzadas entre menús, asesores JS y activos multimedia. Al integrar en un CMS o framework moderno (Next.js, Nuxt, Astro, Drupal, Laravel…), cada plantilla debe servirse bajo las **URLs limpias recomendadas en la sección 7**.

---

## 3. Arquitectura CSS

Todas las páginas cargan las **4 capas base en este orden exacto**, seguidas únicamente de la hoja (o dos hojas) propias de su plantilla:

```html
<link rel="stylesheet" href="css/fonts.css">
<link rel="stylesheet" href="css/tokens.css">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/components.css">
<!-- + hoja(s) de plantilla, p. ej. css/product.css -->
```

### Puntos clave del sistema de estilos
- **Design Tokens (`css/tokens.css`)**: centraliza paleta neutra de alto contraste (`--c-ink`, `--c-paper`, `--c-subtle`, `--c-product`, `--c-changed`, `--c-error`), escalas tipográficas (`--f-sans` Geist pesos 400/500 y `--f-display` Round 8 Four), escala espacial `--s-1` a `--s-10` y altura dinámica `--header-h`.
- **Breakpoints**: diseño *mobile-first* con cortes principales en **`768px`** (tablet), **`1024px`** (escritorio / rejillas partidas) y **`1280px`** (barra superior en una sola fila con mega-menú desplegable).
- **Cambio de tema por scroll**: las secciones con `data-theme="dark"` activan `body.is-dark` cuando cruzan el centro de la ventana (`js/main.js`), invirtiendo suavemente fondo y tinta de la página. Las bandas oscuras aisladas usan `.on-dark`.
- **Modales nativos sin saltos de layout**: los `<dialog>` bloquean el encadenamiento de scroll mediante `overscroll-behavior: contain` en `css/base.css`, evitando mutar `overflow: hidden` en `<body>` y eliminando desplazamientos por desaparición de la barra de scroll.

---

## 4. Arquitectura JavaScript y Contratos de Datos

### 4.1 Núcleo compartido (`js/main.js`)
Se carga con `defer` tras `js/vendor/lenis.min.js`, encapsulado en un IIFE que expone únicamente:

```js
window.MENDIZ = {
  lenis,                        // Instancia activa de Lenis (o null si prefers-reduced-motion)
  smoothScrollTo(target, opts)  // Desplazamiento suave respetando --header-h y accesibilidad
};
```

Gestiona de forma declarativa mediante atributos `data-*`:
- Header superpuesto (`[data-header]`), ocultación inteligente en fichas con `.subnav` y mega-menú multinivel con vista previa de modelos (`[data-mega-menu*]`).
- Navegación interna de ficha (`.subnav__links`, `[data-subnav]`) con mejora progresiva CSS (`scroll-target-group: auto` + `:is(:target-current, [aria-current="true"])`) y respaldo `IntersectionObserver` para navegadores sin soporte nativo.
- Filtros por parámetro URL (`[data-filter-group]` + `[data-filter-param]`, p. ej. `?tipo=` en categorías, `?categoria=` en ofertas y `?cuadro=` en montajes F14).
- Carruseles horizontales (`[data-rail-controls]`, `[data-rail-focus]`), galería a sangre por revelado (`[data-gallery]`), narrativa fija al hacer scroll (`[data-scroll-story]`) y apertura progresiva de vídeo en uso (`[data-in-use]`).
- Escenario de colores de serie (`[data-stage-colors]`, sincronizando `?color=` y enlaces con `[data-keep]`).
- Interacción bidireccional entre tabla de geometría y cotas del SVG (`[data-geometry]`, `[data-size]`).
- Apertura/cierre accesible de `<dialog>` (`[data-dialog-open]`, `[data-video-open]`) con soporte nativo `closedby` y fallback de puntero.

### 4.2 Contratos de datos en `js/data/`

Al migrar a un CMS, API REST/GraphQL o base de datos, estos 7 archivos representan los **esquemas exactos de dominio** que consumen los motores JS:

| Archivo en `js/data/` | Variable global | Consumidor(es) | Contenido del esquema |
|---|---|---|---|
| `f14-montajes.js` | `window.MENDIZ_F14` | `configurador-bici.js`, `tools/ofy-asesor.py` | `{ modelo, montajes: [{ code, name, cuadro, grupo, precio, componentes: {...}, resumen: {...} }] }` |
| `f14-colores.js` | `window.MENDIZ_F14_COLORES` | `configurador-bici.js` | `{ capas, fijas: { sombra, brillos, componentes }, precios: { color, trama, premium }, serie: [...], colores: { std: [...], premium: [...] }, tramas: [...], pegatinas: [...] }` |
| `f14-mpl-montajes.js` | `window.MENDIZ_MONTAJE_CERRADO` | `montaje-cerrado.js` | `{ modelo, slug, coleccion, porDefecto, colores: [{ id, label, sw, img }], montajes: [{ code, grupo, desarrollo, ruedas, precio, peso, componentes }] }` |
| `niveles-decision.js` | `window.MENDIZ_NIVELES` | `que-mendiz.js`, `ofy-asesor.js`, `tools/ofy-asesor.py` | `[{ field, label, q, help, options: [{ erp, ps, id, title, text, icon, img?, alt? }] }]` (10 niveles del ERP; los montajes y modelos guardan el código `erp`) |
| `ofy-montajes.js` | `window.MENDIZ_OFY` | `ofy-asesor.js` | `{ modelos: { [slug]: { name, tag, claim, text, href, img, alt, color? } }, montajes: [{ modelo, code, precio, tipo, disciplina, modalidad, material, eje, gama, version, horquilla, transmision, ruedas (códigos ERP), horquillaLabel, ruedasLabel, ruedasImg, specs }] }` |
| `distribuidores-data.js` | `window.MENDIZ_DISTRIBUIDORES` | `distribuidores.js` | `{ provincias: { [nombre]: [lat, lng] }, distribuidores: [{ n, p, l, s, t, w? }] }` (`n` nombre, `p` provincia, `l` localidad/CP, `s` calle, `t` teléfono, `w` web) |
| `espana-provincias.js` | `window.MENDIZ_ESPANA_GEO` | `distribuidores.js` | `FeatureCollection` GeoJSON de provincias españolas para renderizar el mapa vectorial en Leaflet sin depender de servidores de teselas ni API keys |

### 4.3 Cómo escalar `configurador-f14.html` a los 7 modelos Only For You

Actualmente tanto el mega-menú (`tools/header.py`) como el árbol de decisión (`js/ofy-asesor.js`) enlazan los 7 modelos personalizables mediante el parámetro `?modelo=<slug>`:
- `f14-sl-slp`, `f12-sl`, `f9-sl`, `tt10`, `g12-sl`, `x40-sl-icr`, `ex41`.

En este prototipo solo están cargados los datos y capas de la **F14** (`window.MENDIZ_F14` + `window.MENDIZ_F14_COLORES`). Para convertir `configurador-f14.html` en una plantilla única multi-modelo (p. ej. ruta `/only-for-you/configurador` o `/configurador/<slug>`):
1. Crear `js/data/<slug>-montajes.js` y `js/data/<slug>-colores.js` (o servirlos desde el CMS/API como JSON).
2. Mover al payload de cada modelo las constantes específicas de cuadro que hoy viven en la cabecera de `js/configurador-bici.js`:
   - `tallas` (`SIZES`: `[{ id, stack, reach }]` + rangos de altura para `talla-recomendada.js`).
   - `pesosCuadro` (`FRAME_WEIGHT`, p. ej. `{ SL: '820 g', SLP: '720 g' }` o peso único del modelo).
   - `montajePorDefecto` (`DEFAULT_BUILD`).
   - `gruposFicha` (`GROUPS`: añadiendo `Motor` / `Batería` / `Horquilla` / `Amortiguador` cuando `modelo === 'ex41'` o `'x40-sl-icr'`).
3. Leer `const slug = new URLSearchParams(location.search).get('modelo') || 'f14-sl-slp'` y cargar dinámicamente (con `fetch()` o inyección desde servidor) los datos, el título, la miga de pan y el modal de geometría de ese `slug`, manteniendo intacta toda la lógica de estado y sincronización de URL:
   - Serie: `?modelo=<slug>&montaje=<code>&color=<id>&talla=<talla>`
   - Personalizado: `?modelo=<slug>&montaje=<code>&pintura=personalizada&color=<id>&acabado=mate|brillo&trama=<id>&acabado-trama=mate|brillo&pegatinas=<id>&talla=<talla>`

El mismo patrón aplica exactamente a **`montaje-f14-mpl.html` + `js/montaje-cerrado.js`** para las otras 7 bicicletas de la colección **MPL Concept** (`f9-mpl`, `g12-mpl`, `g11am-mpl`, `ef21-mpl`, `ef4-mpl`, `eg21-mpl`, `eg4-mpl`).

---

## 5. Guía paso a paso: replicar el patrón maestro F14 en el resto de fichas

Cuando el equipo de desarrollo y contenidos complete cada una de las 15 fichas actualmente en plantilla provisional (`catalog-product`), estos son los 5 pasos para llevarla al estándar de `f14-sl-slp.html`:

### Paso 1 · Estructura HTML de la ficha definitiva
Partir de `f14-sl-slp.html` (retirando `class="catalog-product"` del `<body>` y eliminando `<link href="css/catalogo-producto.css">` y `<script src="js/catalogo-producto.js">`). Respetar el orden de secciones y anclas:
1. **Hero (`.product-hero`)**: vídeo MP4 local en bucle (`muted playsinline preload="metadata"` con `width`/`height` y `poster` WebP), migas de pan, `<h1>` en Round 8 Four, claim, entradilla, botón «Ver vídeo» (`[data-video-open]`), precio «Desde» y CTAs principales.
2. **Subnavegación sticky (`.subnav`)** + **Botón flotante a montajes (`[data-builds-button]`)**.
3. **Introducción (`#introduccion`)**: titular editorial `.intro__title--display` + narrativa propia (sin repetir la entradilla del hero).
4. **La bici en grande / Colores de serie (`#colores`, `.product-stage`)**: palabra fantasma `.product-stage__ghost` detrás del recorte transparente `2500 × 1667`, selector `.color-picker` (`[data-stage-colors]`) con los colores de serie reales y CTA con `[data-keep]` hacia el configurador local.
5. **Vistazo rápido (`#vistazo`, `.glance`)**: 4 KPIs numéricos/clave con `.glance__value.display` (peso cuadro, paso de rueda, versiones/motor, montajes).
6. **Diseño y rendimiento (`#diseno`, `.highlights`)**: carrusel `[data-rail-focus]` de beneficios en ruta enlazados a las tecnologías.
7. **Características principales (`#caracteristicas`, `.features`)**: bloques editoriales alternados con fotografía técnica propia de cada tecnología del cuadro.
8. **La bici en uso (`#en-uso`, `.in-use`)**: contenedor `[data-in-use]` cuyo marco se expande a pantalla completa al hacer scroll, con vídeo/escena de acción.
9. **Detalles y equipamiento (`#detalles`, `.info-cards`)**: rail de soluciones de integración (cockpit, paso de rueda, cierre de sillín, patilla UDH, motor/batería en eléctricas).
10. **Galería a sangre (`#galeria`, `[data-gallery]`)**: reportaje fotográfico real en alta resolución con contador `01 / N`.
11. **Información técnica (`#info-tecnica`, `.faq--plus`)**: tres acordeones `<details>`:
    - *Especificaciones* del conjunto cuadro.
    - *Geometría y tallas* (`#geometria`): calculadora `[data-height-form]` (`js/talla-recomendada.js`), `<svg class="geometry__svg">` interactivo y tabla `.geometry-table` con resaltado cruzado `[data-geometry]` / `[data-size]`.
    - *Soporte y documentación* (enlaces a manual, garantía y contacto técnico).
12. **Modalidad de compra**:
    - Si el modelo pertenece a los **7 modelos Only For You** y además tiene versión **MPL**, usar el bloque dual `.choice` («Dos formas de conseguir tu `<MODELO>`»).
    - Si solo es **Only For You** (sin versión MPL), usar el bloque `.ofy-banner` apuntando a su configurador local.
    - Si **NO pertenece a Only For You** (`g11am`, `g4-icr`, `x21-sl`, `x10-boost`, `x10`, `ef21`, `ef4`, `eg21`, `eg4`), **no incluir banner Only For You**; orientar la llamada a acción a selección de montaje/MPL o consulta en distribuidor.
13. **Cada Mendiz es única (`#cada-mendiz`, `.topics`)**: las 3 tarjetas transversales con sus `<dialog id="topic-design|topic-assembly|topic-testing" closedby="any">`.
14. **Configuraciones / Montajes (`#montajes`)**: barra de filtro `[data-filter-group=".build-card[data-type]"]` (`data-filter-param="cuadro"`) si existen varias gamas de cuadro o edición MPL, y rejilla de tarjetas `<article class="build-card" data-type="…">` con recorte propio de cada montaje (`1600 × 1067`), resumen homogéneo y enlace directo con `?montaje=<code>`.
15. **Preguntas frecuentes (`#faq`)**: acordeón específico del modelo (incluyendo las anclas `#faq-diseno`, `#faq-montaje`, `#faq-test` como fallback sin JS) + bloque `<script type="application/ld+json">` de tipo `Product` y `FAQPage`.

### Paso 2 · Activos gráficos estándar por modelo (`assets/img/<slug>/`)
- `<slug>-hero.webp` (`2500 × 1667`, RGBA transparente, encuadre de escenario con escala `0.782` y línea de apoyo de ruedas a `1428 px`).
- `<slug>-hero-1200.webp` (`1200 × 800`, RGBA, miniatura para la vista previa del mega-menú).
- `<slug>-card-1200.webp` (`1200 × 800`, RGBA ocupando lienzo completo, para listados de categoría, asesores y ofertas).
- `montajes/*.webp` (`1600 × 1067`, RGBA, vistas laterales alineadas por montaje/color — utilizadas en las tarjetas de `#montajes` y también reutilizables en el selector de colores de serie `#colores`, como hace `f14-sl-slp.html`) o `heros/*.webp` (`2500 × 1667`, RGBA) cuando el color de serie no corresponda a una tarjeta de montaje concreta.

### Paso 3 · Capas del personalizador Only For You (`assets/img/<slug>/capas/`)
Para los 7 modelos Only For You, todas las capas PNG de fábrica convertidas a `.webp` deben compartir exactamente el mismo lienzo **`2500 × 1667` px** con canal alfa, apilándose en el DOM en este orden de abajo arriba:
1. `sombra` (base proyectada en el suelo)
2. `color` (color principal del cuadro)
3. `trama` (color secundario / decoración, o transparente si elige «Sin trama»)
4. `pegatinas` (logotipos Mendiz en el color elegido)
5. `brillos` (reflejos especulares; se muestra solo cuando el acabado es `brillo`)
6. `componentes` (ruedas, transmisión, manillar, sillín y horquilla negra/componentes fijos)

### Paso 4 · Generación del plano vectorial de geometría (`tools/geometria-svg.py`)
Para generar el `<svg class="geometry__svg">` interactivo de un nuevo modelo:
1. Partir del PNG transparente `2500 × 1667` de la capa de cuadro del modelo y localizar en píxeles los centros de: eje trasero, caja de pedalier y eje delantero (`pts_px` en `tools/geometria-svg.py`).
2. Introducir las cotas en milímetros/grados de la talla de referencia (`B, L, T, P, C, F, X, Z, S, R` y `DROP`).
3. Ejecutar `python3 tools/geometria-svg.py <slug>.html ruta/a/silueta-cuadro.png`. El script vectoriza la silueta con OpenCV, calcula la transformación de semejanza por mínimos cuadrados (Umeyama) a escala `1 unidad SVG = 1 mm` e inyecta las cotas `<g data-geometry="B|L|R|T|S|P|F|C|X|Z">` sincronizadas con `.geometry-table`.

### Paso 5 · Actualización de asesores y menú global
1. Si el modelo es uno de los 7 Only For You, actualizar `tools/ofy-asesor.py` para que lea su nuevo `js/data/<slug>-montajes.js` en lugar de hacer scraping de la tabla HTML provisional.
2. Ejecutar la cadena de regeneración de `tools/` descrita a continuación.

---

## 6. Generadores en Python (`tools/`)

### Requisitos
- **Python 3.10+**
- **`Pillow`** (`pip install Pillow`): usado por `header.py` y `servicio.py` para leer automáticamente `width` y `height` reales de las imágenes en `assets/` y evitar CLS.
- **`numpy` + `opencv-python`** (`pip install numpy opencv-python`): requeridos únicamente al ejecutar `tools/geometria-svg.py`.

### Orden de ejecución
Ejecutar siempre desde la raíz del proyecto (`MENDIZ dev/`):

```bash
# 1. Regenera js/data/ofy-montajes.js cuando cambian montajes o precios de los 7 modelos OFY
python3 tools/ofy-asesor.py

# 2. Regenera ofertas.html y ofertas-<slug>.html cuando cambia la tabla OFERTAS
python3 tools/ofertas.py

# 3. Regenera servicio.html y ayuda-<slug>.html cuando cambian las guías ARTICULOS
python3 tools/servicio.py

# 4. SIEMPRE AL FINAL: sincroniza <header>, mega-menú, iconos Material Symbols y pie en los 46 HTML
python3 tools/header.py
```

> **Nota para integración en CMS / SSR / SSG**: En producción con plantillas de servidor o componentes (Twig, Blade, Astro, React/Next, Vue/Nuxt), `tools/header.py` se sustituye por el componente parcial único `<SiteHeader />` + `<SiteFooter />`, y `ofertas.py` / `servicio.py` pasan a ser vistas dinámicas alimentadas por el CMS.

---

## 7. Checklist técnico para paso a Producción / CMS

### 7.1 Mapa de URLs limpias recomendado
| Archivo estático actual | Ruta limpia recomendada en producción |
|---|---|
| `index.html` | `/` |
| `bicis.html` | `/bicicletas` |
| `carretera.html`, `gravel.html`, `montana.html`, `electricas.html` | `/bicicletas/{carretera\|gravel\|montana\|electricas}` |
| `f14-sl-slp.html` *(y resto de 15 modelos)* | `/bicicletas/<categoria>/<slug>` *(p. ej. `/bicicletas/carretera/f14-sl-slp`)* |
| `only-for-you.html` | `/only-for-you` |
| `only-for-you-modelos.html` | `/only-for-you/modelos` |
| `only-for-you-configura.html` | `/only-for-you/asesor` |
| `configurador-f14.html?modelo=<slug>` | `/only-for-you/configurador/<slug>` |
| `mpl.html` | `/mpl-concept` |
| `montaje-f14-mpl.html` *(y resto de modelos MPL)* | `/mpl-concept/<slug>` *(p. ej. `/mpl-concept/f14-mpl`)* |
| `que-mendiz-es-para-ti.html` | `/que-mendiz-es-para-ti` |
| `ofertas.html` y `ofertas-<slug>.html` | `/ofertas` y `/ofertas/<slug>` |
| `distribuidores.html` | `/distribuidores` |
| `servicio.html` y `ayuda-<slug>.html` | `/servicio` y `/servicio/<slug>` |
| `sobre-mendiz.html` | `/sobre-mendiz` |
| `blog.html` y `noticia-<slug>.html` | `/blog` y `/blog/<slug>` |
| `acceso-b2b.html` | `/b2b` |

### 7.2 Dependencias externas a internalizar o conectar
1. **Vídeos MP4 remotos en servidor antiguo (`bicismendiz.com/sites/default/files/*.mp4`)**:
   - `f14-sl-slp.html`, `only-for-you.html` y `sobre-mendiz.html` ya sirven sus vídeos optimizados desde `assets/`.
   - Sin embargo, 9 fichas en desarrollo (`f12-sl`, `f9-sl`, `g12-sl`, `g11am`, `g4-icr`, `x40-sl-icr`, `ex41`, `ef21`, `eg21`) y un `<source>` secundario en `index.html` apuntan aún a MP4 del sitio actual de Mendiz. Al cerrar cada ficha definitiva deben codificarse localmente en H.264 con `-movflags +faststart` en `assets/`.
2. **Librería de mapas Leaflet (`distribuidores.html`)**:
   - Actualmente carga `leaflet@1.9.4` desde `cdnjs.cloudflare.com` con validación criptográfica SRI (`integrity` + `crossorigin="anonymous"` + `referrerpolicy="no-referrer"`). Para autonomía total sin CDN de terceros (igual que `js/vendor/lenis.min.js`), puede autohospedarse en `js/vendor/leaflet.min.js` y `css/vendor/leaflet.css`.
3. **Tipografías (`Geist` y `Material Symbols Outlined`)**:
   - `Round 8 Four` ya se sirve localmente desde `assets/fonts/`.
   - `Geist` (pesos `400` y `500`) y el subconjunto estricto de iconos `Material Symbols Outlined` se cargan desde `fonts.googleapis.com`. Para máximo rendimiento y cumplimiento estricto de privacidad sin peticiones a Google Fonts, se recomienda autohospedar ambos `.woff2` en `assets/fonts/`.
4. **SEO de producción**:
   - Los JSON-LD de `Organization`/`WebSite`, `Product`, `FAQPage` y `Article` ya están estructurados en las plantillas de referencia; al pasar a producción con dominio definitivo deben inyectarse `<link rel="canonical">`, metadatos Open Graph (`og:title`, `og:description`, `og:image`, `og:url`), `sitemap.xml` y `robots.txt`.
