# Convenciones de código · Web Mendiz

## Clases CSS

1. **BEM en inglés**: `bloque`, `bloque__elemento`, `bloque--variante`.
   Palabras completas en minúscula, separadas por guiones. Sin abreviaturas,
   salvo siglas o nombres asentados: `btn`, `faq`, `nav`, `b2b`, `mpl`, `ofy`
   (Only For You).
2. **Componentes compartidos sin prefijo**: `site-header`, `mega-menu`,
   `bike-card`, `build-card`, `rail`, `faq`, `topics`, `dealer-band`, `field`…
   Viven en `css/base.css`, `css/components.css` o, los de la ficha de modelo,
   en `css/product.css`.
3. **Bloques propios de una página, con el prefijo de esa página**:

   | Prefijo | Página |
   |---|---|
   | `home-` | Inicio (`index.html`) |
   | `bikes-` | Bicis (`bicis.html`) |
   | `product-`, `catalog-` | Fichas de modelo |
   | `configurator-` | Configurador (`configurador-f14.html`) |
   | `closed-build-` | Montaje cerrado MPL (`montaje-f14-mpl.html`) |
   | `ofy-` | Only For You |
   | `mpl-` | MPL Concept |
   | `finder-` | Asesores («¿Qué Mendiz es para ti?», «Configura tu Mendiz») |
   | `locator-` | Distribuidores |
   | `about-` | Sobre Mendiz |
   | `post-`, `article-`, `blog-` | Blog y artículos |
   | `service-` | Servicio y ayuda |
   | `offers` | Ofertas |
   | `b2b-` | Acceso B2B |

4. **Tipografía**: `display`, `heading-editorial`, `heading-section`,
   `heading-card`, `lead`, `eyebrow`, `muted`, `unit`.
5. **Estados** (los pone JS): siempre `is-*` (`is-open`, `is-active`,
   `is-header-hidden`…).
6. **Variables CSS de un bloque**: llevan su nombre (`--in-use-p`,
   `--configurator-gap`, `--mega-menu-h`). Las globales, en `css/tokens.css`.

## Ganchos de JavaScript

Atributos `data-*` con el nombre del bloque o la función, sin abreviar:
`data-mega-menu-toggle`, `data-configurator-edit`, `data-closed-build-colors`,
`data-geometry`, `data-in-use`…

## Ids

- **Secciones navegables** (anclas que se ven en la URL): en castellano y
  describiendo el contenido: `#montajes`, `#galeria`, `#cada-mendiz`, `#faq`…
- **Ids internos** (aria, JS): con el nombre del bloque en inglés:
  `configurator-customizer`, `size-advisor-title`, `mega-menu-bicis`…

## Comentarios

- En castellano. Explican qué hace el código y por qué, no su historia.
- Sin fechas de revisión ni referencias a webs o marcas de terceros.
- Secciones del HTML: `<!-- ===================================================== NOMBRE -->`,
  sin numerar.

## Código generado

No editar a mano: se regenera con los scripts de `tools/`.

| Qué | Script |
|---|---|
| Header, mega menú y pie de todas las páginas | `python3 tools/header.py` |
| Ofertas (`ofertas*.html`) | `python3 tools/ofertas.py` |
| Servicio y ayuda (`servicio.html`, `ayuda-*.html`) | `python3 tools/servicio.py` |
| Datos del asesor Only For You (`js/ofy-montajes.js`) | `python3 tools/ofy-asesor.py` |

Después de `ofertas.py` o `servicio.py`, ejecutar `header.py`.

## Copias fijas

`f14-sl-slp-2.html` (versión anterior de la ficha F14) usa `css/product-2.css`
y `js/main-2.js`, que son copias congeladas: no se mantienen. La plantilla viva
es `css/product.css` + `js/main.js`.

## Equivalencias con los nombres anteriores (12/11/2026)

| Antes | Ahora |
|---|---|
| `h-section`, `h-card`, `h-editorial` | `heading-section`, `heading-card`, `heading-editorial` |
| `h-hero` | `cover-hero` |
| `p-hero`, `p-stage` | `product-hero`, `product-stage` |
| `h-feat`, `h-finder`, `h-ofy` | `home-mpl`, `home-finder`, `home-ofy` |
| `showcase`, `cat`, `cats`, `post`, `posts-head`, `posts-rail` | `home-showcase`, `home-category`, `home-categories`, `home-post`, `home-posts-head`, `home-posts-rail` |
| `kinds`, `cat-filter` | `bikes-categories`, `category-filter` |
| `mm`, `nav-util` | `mega-menu`, `nav-utility` |
| `build`, `builds-fab` | `build-card`, `builds-button` |
| `color-pick`, `discover`, `slides` | `color-picker`, `highlights`, `gallery` |
| `geo`, `geo-table`, `m-*` (esquema) | `geometry`, `geometry-table`, `geometry__*` |
| `icard`, `icards`, `inuse`, `resolve` | `info-card`, `info-cards`, `in-use`, `scroll-story` |
| `made`, `made-modal` | `topics`, `topic-modal` |
| `o4y` | `ofy-banner` |
| `bk-*`, `bk-height` | `configurator-*`, `size-advisor` (`bk-pz` → `configurator-customizer`, `bk-sec` → `configurator-section`, `bk-end` → `configurator-checkout`) |
| `cb-*` | `closed-build-*` |
| `dgroup`, `dmap`, `dmap-pin`, `dmap-me`, `dealer-item` | `locator-group`, `locator-map`, `locator-pin`, `locator-me`, `locator-dealer` |
| `fopt`, `ofy-opt`, `ofy-ph`, `ofy-w`, `ofy-seq`, `ofy-resolve` | `finder-option`, `ofy-option`, `ofy-placeholder`, `ofy-word`, `ofy-sequence`, `ofy-scroll-story` |
| `svc-*`, `ofertas` | `service-*`, `offers` |
| `header-hidden`, `is-bg-e8` | `is-header-hidden`, `is-gray-bg` |
| `data-mm-*`, `data-bk-*`, `data-cb-*`, `data-pz-*`, `data-inuse`, `data-geo` | `data-mega-menu-*`, `data-configurator-*`, `data-closed-build-*`, `data-customizer-*`, `data-in-use`, `data-geometry` |
| `#vitoria` | `#cada-mendiz` |
