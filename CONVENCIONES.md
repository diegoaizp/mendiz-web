# Convenciones de código · Web Mendiz

Documento de referencia sobre nomenclatura, estructura de estilos, ganchos de JavaScript y generación de código del proyecto.

---

## 1. Clases CSS

1. **BEM en inglés**: `bloque`, `bloque__elemento`, `bloque--variante`.
   Palabras completas en minúscula, separadas por guiones. Sin abreviaturas, salvo siglas asentadas del proyecto o del estándar web: `btn`, `faq`, `nav`, `b2b`, `mpl`, `ofy` (Only For You).
2. **Componentes compartidos sin prefijo de página**:
   `site-header`, `site-nav`, `nav-main`, `nav-utility`, `mega-menu`, `site-footer`, `breadcrumb`, `page-head`, `cover-hero`, `section-head`, `bike-card`, `build-card`, `builds-button`, `color-picker`, `highlights`, `gallery`, `geometry`, `geometry-table`, `size-advisor`, `info-card`, `info-cards`, `in-use`, `scroll-story`, `rail`, `faq`, `topics`, `topic-modal`, `ofy-banner`, `choice`, `dealer`, `dealer-band`, `field`…
   Viven en `css/base.css`, `css/components.css` o, los propios del sistema de fichas de bicicleta, en `css/product.css`.
3. **Bloques propios de una página o flujo, con prefijo específico**:

   | Prefijo BEM | Ámbito / Páginas | Hoja CSS principal | Módulo JS asociado |
   |---|---|---|---|
   | *(tokens globales)* | Variables de diseño (`:root`) | `css/tokens.css` | — |
   | *(base / layout)* | Reset, rejilla, botones, formularios, modales `<dialog>` | `css/base.css` | `js/main.js` |
   | *(componentes)* | Header, mega-menú, pie, tarjetas de listado, filtros, rails | `css/components.css` | `js/main.js` |
   | `home-` | Inicio (`index.html`) | `css/home.css` | `js/main.js` |
   | `bikes-` | Índice de bicicletas (`bicis.html`) | `css/bicis.css` | `js/main.js` |
   | `product-`, `intro` | Ficha maestra de modelo (`f14-sl-slp.html` y futuras fichas definitivas) | `css/product.css` | `js/main.js`, `js/talla-recomendada.js` |
   | `catalog-` | Adaptaciones provisionales de fichas en desarrollo (`body.catalog-product`) | `css/catalogo-producto.css` | `js/catalogo-producto.js` |
   | `configurator-`, `customizer-` | Configurador Only For You (`configurador-f14.html`) | `css/configurador-bici.css` | `js/configurador-bici.js`, `js/talla-recomendada.js` |
   | `closed-build-` | Montaje cerrado MPL Concept (`montaje-f14-mpl.html`) | `css/configurador-bici.css` | `js/montaje-cerrado.js`, `js/talla-recomendada.js` |
   | `ofy-` | Presentación y listado Only For You (`only-for-you.html`, `only-for-you-modelos.html`) | `css/only-for-you.css` | `js/only-for-you.js` |
   | `finder-`, `ofy-media` | Asesor «¿Qué Mendiz es para ti?» (`que-mendiz-es-para-ti.html`) | `css/que-mendiz.css`, `css/ofy-asesor.css` | `js/data/niveles-decision.js`, `js/que-mendiz.js` |
   | `ofy-media`, `finder-` | Asesor «Configura tu Mendiz» (`only-for-you-configura.html`) | `css/que-mendiz.css`, `css/ofy-asesor.css` | `js/data/niveles-decision.js`, `js/ofy-asesor.js` |
   | `mpl-` | Colección MPL Concept (`mpl.html`) | `css/mpl.css` | `js/main.js` |
   | `locator-` | Localizador de distribuidores (`distribuidores.html`) | `css/distribuidores.css` | `js/distribuidores.js` |
   | `about-` | Marca e historia (`sobre-mendiz.html`) | `css/sobre-mendiz.css` | `js/main.js` |
   | `post-`, `article-`, `blog-` | Blog, noticias y plantilla de artículos (`blog.html`, `noticia-*.html`, `ayuda-*.html`) | `css/blog.css` | `js/blog.js` |
   | `service-` | Servicio y centro de ayuda (`servicio.html`, `ayuda-*.html`) | `css/servicio.css` | `js/main.js` |
   | `offers` | Listado y subpáginas de ofertas (`ofertas*.html`) | `css/ofertas.css` | `js/main.js` |
   | `b2b-` | Área privada para tiendas (`acceso-b2b.html`) | `css/acceso-b2b.css` | `js/acceso-b2b.js` |

4. **Clases tipográficas**: `display`, `heading-editorial`, `heading-section`, `heading-card`, `lead`, `eyebrow`, `muted`, `unit`.
5. **Estados controlados por JavaScript**: siempre con prefijo `is-*` (`is-open`, `is-active`, `is-header-hidden`, `is-dark`, `is-gray-bg`, `is-highlighted`, `is-size`, `is-on`, `is-ok`…).
6. **Variables CSS**:
   - Los tokens globales de color (`--c-*`), tipografía (`--f-*`, `--fs-*`, `--lh-*`, `--ls-*`, `--fw-*`), espaciado (`--s-*`), radios (`--r-*`), layout (`--margin`, `--gutter`, `--header-h`) y transiciones (`--dur-*`, `--ease-*`) viven exclusivamente en `css/tokens.css`.
   - Las variables locales de un componente llevan el nombre de su bloque (`--in-use-p`, `--configurator-gap`, `--mega-menu-h`).
   - Nunca estilizar por selector `#id` en CSS; usar siempre clases BEM (p. ej. `.intro__title--display`).

---

## 2. Arquitectura JavaScript, datos y ganchos `data-*`

1. **Encapsulación**:
   - `js/main.js` se ejecuta dentro de un IIFE y expone únicamente la API compartida `window.MENDIZ` (`{ lenis, smoothScrollTo }`).
   - Cada script específico de página en `js/*.js` va encapsulado en su propio IIFE y comprueba en las primeras líneas la presencia de su nodo raíz antes de inicializar eventos.
2. **Separación entre lógica y datos (`js/data/`)**:
   - Los motores interactivos viven en `js/`.
   - Las librerías de terceros autohospedadas viven en `js/vendor/` (`lenis.min.js`).
   - Los catálogos y payloads de datos estáticos viven en `js/data/` (`f14-montajes.js`, `f14-colores.js`, `f14-mpl-montajes.js`, `niveles-decision.js`, `ofy-montajes.js`, `distribuidores-data.js`, `espana-provincias.js`) bajo el espacio de nombres global `window.MENDIZ_*`.
3. **Atributos `data-*`**:
   - Nombres descriptivos en inglés con el nombre del bloque o la acción, sin abreviaturas:
     - Navegación: `data-header`, `data-nav-toggle`, `data-mega-menu`, `data-mega-menu-toggle`, `data-mega-menu-group`, `data-mega-menu-panel`, `data-mega-menu-back`, `data-mega-menu-teaser`, `data-mega-menu-backdrop`, `data-subnav`.
     - Ficha de producto: `data-builds-button`, `data-stage-bike`, `data-stage-colors`, `data-scroll-story`, `data-in-use`, `data-gallery`, `data-gallery-current`, `data-gallery-total`, `data-gallery-prev`, `data-gallery-next`, `data-geometry`, `data-size`, `data-size-pick`, `data-height-form`, `data-height-input`, `data-height-out`, `data-height-pick`, `data-compare`.
     - Configurador y montaje cerrado: `data-configurator`, `data-configurator-edit`, `data-configurator-cta`, `data-configurator-save`, `data-customizer`, `data-closed-build`, `data-closed-build-colors`, `data-closed-build-sizes`, `data-closed-build-cta`.
     - Asesores, filtros y modales: `data-finder`, `data-ofy-advisor`, `data-ofy-category`, `data-category`, `data-filter-group`, `data-filter-param`, `data-dialog-open`, `data-dialog-close`, `data-video-open`.

---

## 3. Identificadores (`id`)

- **Secciones navegables** (anclas visibles en la URL y en `subnav`): en **castellano**, describiendo el contenido sin acentos ni eñes (`#colores`, `#vistazo`, `#diseno`, `#caracteristicas`, `#en-uso`, `#detalles`, `#galeria`, `#info-tecnica`, `#geometria`, `#cada-mendiz`, `#montajes`, `#faq`, `#distribuidor`…).
- **IDs internos** (`aria-labelledby`, `aria-controls`, `<dialog>`, `<svg>`, controles de formulario): en **inglés** y con el prefijo del bloque al que pertenecen (`mega-menu-bicis`, `configurator-customizer`, `size-advisor-title`, `geometry-svg-title`, `topic-design`, `topic-assembly`, `topic-testing`, `bikes-categories-title`, `home-categories-title`, `offers-title`…).

---

## 4. HTML, accesibilidad y comentarios

1. **HTML semántico y limpio**:
   - Atributos booleanos escritos sin valor vacío (`defer`, `hidden`, `open`, `muted`, `loop`, `autoplay`, `playsinline`, `novalidate`, `inert`, `required`, `checked`, `crossorigin`, `itemscope`).
   - Zonas de búsqueda y filtrado envueltas en `<search>`; secciones `<section>` sin `aria-labelledby`/`aria-label` redundantes salvo cuando se requiera explícitamente un landmark `region`.
   - Modales implementados con `<dialog>` nativo, atributo declarativo `closedby` (`closedby="any"` en modales informativos, `closedby="closerequest"` en paneles de edición), encabezados unificados en `<h2>` y control de scroll por CSS (`overscroll-behavior: contain` en `css/base.css`, sin mutar `overflow` en `<body>`/`<html>`).
   - Todo control de formulario lleva `<label for="…">` explícito; los enlaces o botones con texto repetido («Conócela», «Personaliza tu bici») completan su contexto accesible sin duplicar pronombres al leerse en lectores de pantalla.
2. **Comentarios**:
   - Siempre en **castellano**.
   - Explican **qué hace el código y por qué**, nunca su historia evolutiva.
   - Prohibido incluir fechas de revisión, notas internas de redacción, rutas locales de disco o referencias a marcas o repositorios de terceros.
   - Encabezados de sección en HTML sin numerar:
     `<!-- ===================================================== NOMBRE DE SECCIÓN -->`

---

## 5. Código generado (`tools/`)

Las zonas generadas no deben editarse a mano en los HTML ni en `js/data/ofy-montajes.js`: cualquier cambio de datos o estructura debe hacerse en su script de `tools/` y regenerarse desde la raíz del proyecto.

| Qué genera o actualiza | Script | Comando |
|---|---|---|
| Payload de montajes del asesor Only For You (`js/data/ofy-montajes.js`) | `tools/ofy-asesor.py` | `python3 tools/ofy-asesor.py` |
| Listado y subpáginas de ofertas (`ofertas.html`, `ofertas-*.html`) | `tools/ofertas.py` | `python3 tools/ofertas.py` |
| Índice de servicio y guías de ayuda (`servicio.html`, `ayuda-*.html`) | `tools/servicio.py` | `python3 tools/servicio.py` |
| Header, mega-menú, subconjunto de iconos Material Symbols y pie en todos los HTML | `tools/header.py` | `python3 tools/header.py` |
| Esquema vectorial `<svg class="geometry__svg">` a escala 1 mm en una ficha | `tools/geometria-svg.py` | `python3 tools/geometria-svg.py f14-sl-slp.html` |

> **Orden obligatorio de ejecución**: siempre que se ejecuten `tools/ofertas.py` o `tools/servicio.py`, debe ejecutarse a continuación `python3 tools/header.py` para inyectar la navegación actualizada, marcar `aria-current` y consolidar la lista `icon_names` de Google Material Symbols.
