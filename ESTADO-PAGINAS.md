# Estado de Páginas, Catálogo y Flujos Pendientes · Web Mendiz

Inventario completo del alcance entregado en `MENDIZ dev` (46 archivos HTML) clasificado para planificación técnica, redacción de contenidos e integración de backend.

---

## Resumen ejecutivo

| Categoría | N.º de archivos HTML | Estado para desarrollo |
|---|---:|---|
| **A. Páginas terminadas y ecosistema maestro F14** | **20** | Maquetas definitivas listas para integrar (F14 como *Gold Master* de referencia) |
| **B. Fichas de bicicleta en proceso de desarrollo** | **15** | Maquetas provisionales (`catalog-product`) pendientes de llevar al patrón maestro F14 |
| **C.1 Páginas en cascarón / con contenido placeholder** | **11** | Estructura y diseño listos (`6 ayuda-*` + `5 ofertas*`), textos/datos finales pendientes |
| **Total entregados en raíz** | **46** | — |
| **C.2–C.4 Páginas nuevas y flujos backend pendientes** | *(por crear)* | 6 configuradores OFY, 7 montajes MPL, Contacto, Legales, 404 y conectores de negocio |

---

## A. Páginas terminadas y ecosistema maestro F14 (20 páginas)

Estas páginas cuentan con su arquitectura de componentes, estilos definitivos, enlaces locales sincronizados (incluyendo las 16 fichas locales y `montaje-f14-mpl.html` en el mega-menú de `tools/header.py`) e interactividad cerrada.

| Archivo | Sección / Rol | Hojas CSS propias *(además de las 4 base)* | Scripts propios / Datos | Notas para integración |
|---|---|---|---|---|
| `index.html` | Inicio | `home.css` | `main.js` | Maqueta cerrada («Ver todas las noticias» ya enlaza a `blog.html` y vídeo hero principal local en `assets/f14sl-home.mp4`). Al integrar el CMS, conectar las tarjetas del rail de noticias y retirar el `<source>` remoto secundario de respaldo. |
| `bicis.html` | Índice general de bicicletas | `bicis.css` | `main.js` | Navegación visual hacia las 4 disciplinas, OFY, MPL y ofertas. |
| `carretera.html` | Listado categoría Carretera | — *(solo capas base)* | `main.js` | Filtro activo por `?tipo=rendimiento\|aero\|gran-fondo\|triatlon`, claims y 3 colores de serie de F14 alineados. F14 enlaza a `configurador-f14.html?modelo=f14-sl-slp`; actualizar «Personalizar» de F12/F9/TT10 cuando estén sus datos locales. |
| `gravel.html` | Listado categoría Gravel | — *(solo capas base)* | `main.js` | Filtro activo por `?tipo=carbono\|aluminio` y enlace a `mpl.html`. Solo G12 SL (modelo OFY) muestra «Personalizar» (apuntando provisionalmente a `bicismendiz.com` hasta tener sus capas locales). |
| `montana.html` | Listado categoría Montaña | — *(solo capas base)* | `main.js` | Filtro activo por `?tipo=carbono-doble\|carbono-rigido\|aluminio-rigido` y enlace a `mpl.html`. Solo X40 SL-ICR (modelo OFY) muestra «Personalizar». |
| `electricas.html` | Listado categoría Eléctricas | — *(solo capas base)* | `main.js` | Filtro activo por `?tipo=carretera\|montana\|gravel` y enlace a `mpl.html`. Solo EX41 (modelo OFY) muestra «Personalizar». |
| **`f14-sl-slp.html`** | **Ficha maestra F14 SL-SLP (*Gold Master*)** | `product.css` | `main.js`, `talla-recomendada.js` | **Plantilla de referencia 100 % operativa** (3 colores de serie en `#colores`, filtro `.build-card[data-type]` para SL/SLP/MPL, enlaces locales a configurador, montaje MPL, garantía y manual). Solo queda conectar «Contacto con el servicio técnico» (`href="#"`) y el modal comparador `[data-compare]`. |
| **`configurador-f14.html`** | **Configurador Only For You (F14)** | `product.css`, `configurador-bici.css` | `data/f14-montajes.js`, `data/f14-colores.js`, `configurador-bici.js`, `talla-recomendada.js` | **Referencia funcional completa** (enlaces de soporte ya conectados). Validar con Mendiz antes de producción: (1) opciones definitivas de medida de bielas/manillar, (2) acabado brillo/mate de los 3 colores de serie y (3) tabla oficial de estaturas en `talla-recomendada.js`. |
| **`montaje-f14-mpl.html`** | **Montaje cerrado F14 MPL (*Gold Master MPL*)** | `product.css`, `configurador-bici.css` | `data/f14-mpl-montajes.js`, `montaje-cerrado.js`, `talla-recomendada.js` | **Plantilla de referencia para los otros 7 modelos MPL** (títulos/geometría F14 MPL y enlaces de soporte listos). Validar con Mendiz el desglose detallado de componentes Di2 y 105 mecánico en `js/data/f14-mpl-montajes.js`. |
| `only-for-you.html` | Landing de campaña Only For You | `product.css`, `only-for-you.css` | `only-for-you.js` | Maqueta editorial y vídeo local cerrados. |
| `only-for-you-modelos.html` | Catálogo de los 7 modelos Only For You | `product.css`, `only-for-you.css` | `only-for-you.js` | Filtros por `?categoria=` y `?modelo=`. Los 7 botones «Conócela» enlazan a sus fichas `.html` locales y F14 enlaza a `configurador-f14.html?modelo=f14-sl-slp`; actualizar «Personalizar» de los otros 6 modelos cuando tengan sus capas/datos locales. |
| `only-for-you-configura.html` | Asesor de 10 niveles ERP «Configura tu Mendiz» | `que-mendiz.css`, `ofy-asesor.css` | `data/niveles-decision.js`, `data/ofy-montajes.js`, `ofy-asesor.js` | Sigue los 10 niveles y opciones del ERP (`js/data/niveles-decision.js`) hasta el montaje de los 7 modelos OFY. Validar con Mendiz: gama de carbono de TT10/EX41 y de los montajes F14 SLP Light, y los 4 montajes Campagnolo Super Record (F14SLP.00HY/BR, F9SL.00HY/BR) que quedan fuera por no tener transmisión en el ERP. Parametrizar el configurador destino por `?modelo=`. |
| `mpl.html` | Landing y catálogo MPL Concept | `home.css`, `product.css`, `mpl.css` | `main.js` | Maqueta cerrada. F14 MPL enlaza a `f14-sl-slp.html?cuadro=mpl#montajes` (y en el mega-menú a `montaje-f14-mpl.html`); las tarjetas de las otras 7 bicis MPL enlazan a la ficha local de su modelo base (`f9-sl.html`, `g12-sl.html`, `g11am.html`, `ef21.html`, `ef4.html`, `eg21.html`, `eg4.html`) hasta crear sus fichas de montaje cerrado; el mega-menú y `que-mendiz.js` siguen apuntando provisionalmente a `bicismendiz.com`. |
| `que-mendiz-es-para-ti.html` | Recomendador por niveles ERP 1–7 | `que-mendiz.css` | `data/niveles-decision.js`, `que-mendiz.js` | Tipo → disciplina → modalidad → material → eje → gama → versión (Standard / MPL), con rutas compartibles por hash (`#/convencional/carretera/performance/sl`; `#/carretera` arranca con la disciplina elegida). Llega a los 16 modelos y a las 8 ediciones MPL. Validar con Mendiz la gama de carbono (Sport / SL) de G11AM, eléctricas de carbono y ediciones MPL distintas de la F14. |
| `distribuidores.html` | Localizador de tiendas | `distribuidores.css` | `data/distribuidores-data.js`, `data/espana-provincias.js`, `distribuidores.js` | Funcional con 221 tiendas en España, mapa vectorial sin API keys, SRI en Leaflet y enlace a `ayuda-garantia.html`. Ver integraciones pendientes en §C.4. |
| `sobre-mendiz.html` | Historia, sede y equipo Mendiz | `sobre-mendiz.css` | `main.js` | Maqueta y copy editorial cerrados. Conectar el botón de candidaturas (`bicismendiz.com/contacto`) a la futura página/formulario de Contacto o RR. HH. |
| `blog.html` | Portada y listado del blog | `blog.css` | `blog.js` | Maqueta cerrada (1 noticia local real + tarjetas de ejemplo/archivo pendientes de alimentar desde CMS). |
| `noticia-laboral-kutxa-el-salvador.html` | Plantilla maestra de artículo de blog | `blog.css` | `blog.js` | Plantilla completa con JSON-LD `Article` y acciones de compartir. |
| `servicio.html` | Índice del centro de ayuda y soporte | `servicio.css` | `main.js` | Maqueta cerrada (generada con `tools/servicio.py`). |
| `acceso-b2b.html` | Acceso privado para tiendas | `acceso-b2b.css` | `acceso-b2b.js` | Interfaz lista; pendiente de conectar con autenticación real del portal B2B (§C.4). |

---

## B. Fichas de bicicletas en proceso de desarrollo (15 páginas `catalog-product`)

Las siguientes **15 fichas existen como archivos HTML navegables**, enlazadas desde listados, asesores y mega-menú, pero emplean actualmente una **plantilla provisional (`body.catalog-product` + `css/catalogo-producto.css`)** mientras se trabajan sus contenidos, sesiones fotográficas, capas y planos a imagen de `f14-sl-slp.html`.

**Textos revisados aplicados** en 14 de ellas (todas salvo `ex41.html`, que no tiene página de contenido): title y meta description, claim y entradilla, introducción con párrafo-definición, `#vistazo` en cifras (`.glance__value`), tarjetas de `#diseno` enlazadas a cada característica, `#caracteristicas` en zigzag `.features` (sustituye a `#tecnologia`), `#detalles` (sustituye a `#integracion`; retirado en `x40-sl-icr` y `x21-sl` por falta de detalles con dato), especificaciones, comparativa con la familia (`#comparativa`, nueva entre montajes y FAQ) y FAQ con marcado `FAQPage` y anclas `#faq-diseno`, `#faq-montaje` y `#faq-test`. Las fotos siguen siendo las provisionales `detalle-<hash>.webp` (punto 5 del checklist).

**Plantilla F14 aplicada** en esas mismas 14 fichas: ya no usan `body.catalog-product`, `css/catalogo-producto.css` ni `js/catalogo-producto.js` (solo los sigue usando `ex41.html`). Tienen la misma estructura y orden de secciones que `f14-sl-slp.html`: subnavegación, acceso fijo `[data-builds-button]`, escenario `#colores`, `#en-uso` (vídeo del hero o marcador de imagen pendiente), soporte en `#info-tecnica`, módulo `.choice` «Dos formas de conseguir tu…» en `f9-sl` y `g12-sl`, y tarjetas de montaje F14 con puntos de color y «Comparar». Diferencias provisionales con la F14: la geometría sigue en imagen (`.geometry__image`), cada tarjeta de montaje conserva el despiece desplegable (`.build-card__details`) hasta que haya configurador local, no hay filtro de montajes y los marcadores `img.catalog-placeholder` mantienen ese nombre de clase (estilos ya en `css/product.css`).

### Inventario por modelo

| Archivo | Modelo | Categoría | ¿Es Only For You? | ¿Tiene edición MPL? | Estado actual de Hero | Colores en `#colores` | Estado de Geometría |
|---|---|---|---|---|---|---:|---|
| `f12-sl.html` | F12 SL | Carretera · Aero | **Sí** | No | Vídeo remoto (`bicismendiz.com`) | 1 | Imagen `.webp` plana |
| `f9-sl.html` | F9 SL | Carretera · Gran fondo | **Sí** | **Sí** (`F9 MPL`) | Vídeo remoto (`bicismendiz.com`) | 2 | Imagen `.webp` plana |
| `tt10.html` | TT10 | Carretera · Triatlón | **Sí** | No | Solo imagen fija | **0** *(sin selector)* | Imagen `.webp` plana |
| `g12-sl.html` | G12 SL | Gravel · Carbono | **Sí** | **Sí** (`G12 MPL`) | Vídeo remoto (`bicismendiz.com`) | 1 | Imagen `.webp` plana |
| `g11am.html` | G11AM | Gravel · Carbono | No | **Sí** (`G11AM MPL`) | Vídeo remoto (`bicismendiz.com`) | 2 | Imagen `.webp` plana |
| `g4-icr.html` | G4.ICR | Gravel · Aluminio | No | No | Vídeo remoto (`bicismendiz.com`) | 2 *(1 en `configuraciones/`)* | Imagen `.webp` plana |
| `x40-sl-icr.html` | X40 SL-ICR | Montaña · Doble carbono | **Sí** | No | Vídeo remoto (`bicismendiz.com`) | 3 *(2 en `configuraciones/`)* | Imagen `.webp` plana |
| `x21-sl.html` | X21 SL | Montaña · Rígida carbono | No | No | Solo imagen fija | 2 | Imagen `.webp` plana |
| `x10-boost.html` | X10 BOOST | Montaña · Rígida aluminio | No | No | Solo imagen fija | 1 | Imagen `.webp` plana |
| `x10.html` | X10 | Montaña · Rígida aluminio | No | No | Solo imagen fija | 2 | Imagen `.webp` plana |
| `ex41.html` | EX41 | Eléctricas · Montaña | **Sí** | No | Vídeo remoto (`bicismendiz.com`) | 1 | Imagen `.webp` plana |
| `ef21.html` | EF21 | Eléctricas · Carretera | No | **Sí** (`EF21 MPL`) | Vídeo remoto (`bicismendiz.com`) | 2 | Imagen `.webp` plana |
| `ef4.html` | EF4 | Eléctricas · Carretera | No | **Sí** (`EF4 MPL`) | Solo imagen fija | 2 *(1 en `configuraciones/`)* | **Sin imagen** *(enlace externo)* |
| `eg21.html` | EG21 | Eléctricas · Gravel | No | **Sí** (`EG21 MPL`) | Vídeo remoto (`bicismendiz.com`) | 1 | Imagen `.webp` plana |
| `eg4.html` | EG4 | Eléctricas · Gravel | No | **Sí** (`EG4 MPL`) | Solo imagen fija | 1 | **Sin imagen** *(enlace externo)* |

### Checklist exacto para equiparar cada una de las 15 fichas al modelo `f14-sl-slp.html`
- [ ] **1. Sustituir plantilla provisional por arquitectura editorial F14**: retirar `body.catalog-product`, `css/catalogo-producto.css` y `js/catalogo-producto.js`; cambiar `#tecnologia` (`.scroll-story--split`) + `#integracion` por `#caracteristicas` (`.features` en zigzag editorial) + `#en-uso` (`.in-use` con apertura por scroll) + `#detalles` (`.info-cards`).
- [ ] **2. Vídeo de Hero local y botón flotante**: codificar e incorporar en `assets/` los vídeos MP4 de hero (sustituyendo los 9 MP4 remotos en `bicismendiz.com` y añadiendo vídeo o fotografía definitiva en los 6 restantes) e incluir el acceso fijo `[data-builds-button]`.
- [ ] **3. Narrativa de Introducción y KPIs numéricos**: redactar un bloque `#introduccion` propio (hoy duplica la entradilla del hero) y convertir `#vistazo` de frases `.catalog-fact` a 4 indicadores tipográficos `.glance__value.display` (peso cuadro, paso de rueda, autonomía/motor o versiones, montajes).
- [ ] **4. Escenario completo de colores de serie (`#colores`)**: completar todos los recortes transparentes `2500 × 1667` de los colores de serie de cada modelo (especialmente `tt10` que aún no tiene opciones, los 7 modelos con 1 solo color y los 3 con rutas antiguas `configuraciones/`).
- [ ] **5. Reportaje fotográfico diferenciado y textos definitivos**: sustituir las imágenes reutilizadas `detalle-<hash>.webp` entre Diseño, Tecnologías, Detalles y Galería por fotografías específicas de estudio y acción con descripciones `alt` editoriales.
- [ ] **6. Especificaciones completas del cuadro y Geometría interactiva**:
  - Completar la ficha técnica del conjunto cuadro (peso real verificado, eje de pedalier, dirección, tija, manillar, tallas disponibles).
  - Generar con `tools/geometria-svg.py` el plano vectorial `<svg class="geometry__svg">`, maquetar la tabla HTML `.geometry-table` con todas las tallas y conectar la calculadora de estatura `js/talla-recomendada.js` (prioritario en `ef4` y `eg4`, que carecen incluso de imagen de geometría).
- [ ] **7. Bloque comercial según modalidad del modelo**:
  - Las **9 fichas que NO son Only For You** ya tienen retirado el banner `#only-for-you`; si cuentan con edición MPL (`g11am`, `ef21`, `ef4`, `eg21`, `eg4`), añadir su bloque destacado MPL Concept cuando esté su ficha de montaje cerrado.
  - En los modelos que son **OFY + MPL** (`f9-sl`, `g12-sl`): sustituir el `.ofy-banner` actual por el módulo dual `.choice` («Dos formas de conseguir tu `<MODELO>`») como en la F14.
  - En los modelos **solo OFY** (`f12-sl`, `tt10`, `x40-sl-icr`, `ex41`): actualizar el CTA de `.ofy-banner` hacia su configurador local cuando esté parametrizado.
- [ ] **8. Tarjetas de montaje (`#montajes`)**: generar recortes individuales `1600 × 1067` por montaje/ruedas (en vez de repetir la foto de referencia), normalizar el resumen de componentes, añadir puntos de color y filtro `[data-filter-group=".build-card[data-type]"]` (incluyendo montajes MPL cuando aplique), pasar los datos a `js/data/<slug>-montajes.js` y actualizar el CTA de cada tarjeta (hacia el configurador local `?modelo=<slug>&montaje=<code>` en los 6 modelos OFY, o hacia distribuidor/ficha de montaje en los 9 modelos de serie que hoy apuntan provisionalmente a `bicismendiz.com`).
- [ ] **9. Preguntas frecuentes y SEO estructurado**: ampliar el bloque `#faq` específico del modelo incluyendo las anclas `#faq-diseno`, `#faq-montaje` y `#faq-test` (fallback sin JS de `#cada-mendiz`) y añadir el marcado JSON-LD `Product` + `FAQPage`.

---

## C. Páginas en borrador, páginas nuevas por crear y flujos pendientes

### C.1 Páginas entregadas como cascarón (estructura lista, contenido placeholder)
1. **6 guías del Centro de Ayuda (`tools/servicio.py`)**:
   - `ayuda-como-elegir-tu-bici.html`
   - `ayuda-como-elegir-tu-talla.html`
   - `ayuda-montada-una-a-una.html`
   - `ayuda-testeada-a-fondo.html`
   - `ayuda-garantia.html`
   - `ayuda-mantenimiento.html`
   - *Estado*: maquetación de artículo (`css/blog.css` + `css/servicio.css`), migas de pan, imagen principal, JSON-LD `Article` y artículos relacionados terminados; el cuerpo muestra el esquema de apartados `<h2>`/`<h3>` con el marcador *«Contenido pendiente de redactar y revisar.»*.
2. **5 páginas de Ofertas (`tools/ofertas.py`)**:
   - `ofertas.html`, `ofertas-x21-sl.html`, `ofertas-x21.html`, `ofertas-f8.html`, `ofertas-f4.html`.
   - *Estado*: interfaz de listado filtrable por `?categoria=`, subpáginas de montajes y precio rebajado de `X21 SL` (`Desde 1.290 €`, antes `1.490 €`) listos, pero el catálogo definitivo de liquidación está pendiente de cierre con Mendiz (`x21`, `f8` y `f4` no tienen foto, colores ni montajes cargados; `ofertas-x21-sl.html` usa montajes de ejemplo; las categorías Gravel y Eléctricas están vacías para mostrar el estado vacío `[data-empty]`).
3. **Artículos adicionales del Blog (`blog.html` e `index.html`)**:
   - Solo `noticia-laboral-kutxa-el-salvador.html` está maquetada localmente como plantilla maestra; en `blog.html` e `index.html` el resto de tarjetas son ejemplos de maqueta (`href="#"` o enlaces al blog actual en `bicismendiz.com`) a sustituir por las entradas dinámicas del CMS.

### C.2 Configuradores Only For You y fichas de montaje cerrado MPL pendientes
1. **6 configuradores Only For You restantes**:
   - Modelos: **`F12 SL`**, **`F9 SL`**, **`TT10`**, **`G12 SL`**, **`X40 SL-ICR`** y **`EX41`**.
   - *Qué falta*: exportar y optimizar sus capas transparentes `2500 × 1667` (`assets/img/<slug>/capas/`), crear sus archivos `js/data/<slug>-montajes.js` y `js/data/<slug>-colores.js`, y parametrizar el cargador de `configurador-f14.html` + `js/configurador-bici.js` por `?modelo=<slug>` (hoy el mega-menú y `only-for-you-configura.html` ya pasan `?modelo=<slug>`, pero la página carga siempre los datos de F14).
2. **7 fichas de montaje cerrado MPL Concept restantes**:
   - Modelos: **`F9 MPL`**, **`G12 MPL`**, **`G11AM MPL`**, **`EF21 MPL`**, **`EF4 MPL`**, **`EG21 MPL`** y **`EG4 MPL`**.
   - *Qué falta*: crear sus payloads `js/data/<slug>-montajes.js` y recortes por color en `assets/img/mpl/`, reutilizando la plantilla `montaje-f14-mpl.html` + `js/montaje-cerrado.js` (sustituyendo los enlaces externos actuales a `bicismendiz.com` en `mpl.html` y en `tools/header.py`).

### C.3 Páginas corporativas, legales y de sistema inexistentes (por crear)
Actualmente referenciadas con `href="#"` (o saliendo al dominio antiguo en el caso de RR. HH.) a la espera de textos legales y definición funcional:
1. **Contacto** (`/contacto`): enlazada desde el mega-menú (*Servicio → Tu Mendiz*), el pie de página global, `f14-sl-slp.html` (*Contacto con el servicio técnico*), `distribuidores.html` (*Escríbenos*) y `sobre-mendiz.html` (*Envíanos tu currículum*).
2. **Quiero ser distribuidor / Solicitud de alta B2B** (`/distribuidores/alta`): enlazada desde el bloque inferior de `distribuidores.html`.
3. **Preguntas frecuentes generales** *(opcional si se independiza de `servicio.html#preguntas`)*: actualmente `servicio.html#preguntas` ancla a la sección postventa de Servicio.
4. **Páginas legales obligatorias y gestión de consentimiento**:
   - **Aviso legal** (`/aviso-legal`)
   - **Política de privacidad** (`/privacidad`)
   - **Política de cookies** (`/cookies`) + integración de banner CMP de consentimiento de cookies.
5. **Página de error `404.html`**: diseño editorial coherente con el sistema con accesos rápidos a Inicio, Bicicletas y Distribuidores.
6. **Enlaces oficiales a YouTube y Facebook en el pie (`tools/header.py`)**: Instagram ya apunta a `https://www.instagram.com/bicismendiz_es/`; confirmar con Mendiz las URLs oficiales definitivas de YouTube y Facebook (hoy en `#`).

### C.4 Flujos funcionales e integraciones de Frontend / Backend pendientes
1. **Recepción de configuración y envío de lead a tienda en `distribuidores.html` (`js/distribuidores.js`) — *PRIORITARIO***:
   - `configurador-bici.js` y `montaje-cerrado.js` ya construyen el CTA principal hacia `distribuidores.html?modelo=…&montaje=…&color=…&talla=…` (más `pintura=personalizada&acabado=…&trama=…&pegatinas=…`).
   - Sin embargo, `js/distribuidores.js` solo lee actualmente `q`, `provincia` y `pais`, ignorando los parámetros de la bicicleta.
   - *A desarrollar*: (a) mostrar en la cabecera de `distribuidores.html` una tarjeta resumen de la configuración traída por URL, (b) permitir elegir un distribuidor del listado/mapa y abrir un formulario (nombre, email, teléfono, comentarios, casilla RGPD) que envíe la configuración completa al backend/CRM y a la tienda, y (c) opción de descargar resguardo PDF o código único de configuración.
2. **Comparador de montajes (`[data-compare]`) en fichas de modelo**:
   - En `f14-sl-slp.html#montajes` cada tarjeta `.build-card` incluye el check estilizado `<input type="checkbox" data-compare="<code>">`, pero no existe aún lógica JS.
   - *A desarrollar*: módulo JS reutilizable que al seleccionar entre 2 y 3 montajes muestre una barra flotante inferior y abra un `<dialog>` comparando fila a fila cuadro, grupo, desarrollo, frenos, ruedas, cockpit, sillín, peso y PVP.
3. **Autenticación real del Área B2B (`acceso-b2b.html`)**:
   - Actualmente el formulario opera en modo demostración (`[data-demo]`, `action="#"`) y «¿Has olvidado tu contraseña?» apunta a `#`. Conectar con el endpoint de sesión del ERP/portal B2B de Mendiz y flujo de recuperación de credenciales.
4. **Suscripción a Newsletter y cumplimiento RGPD**:
   - En el pie global (`tools/header.py`) «Suscríbete a la newsletter» es un enlace `href="#"` (abrir modal o llevar a bloque de suscripción), y en `blog.html` el formulario tiene `onsubmit="return false"`. Conectar con la plataforma de email marketing (Mailchimp, Brevo, Klaviyo, etc.), añadir estados de éxito/error y **casilla obligatoria de aceptación de la Política de privacidad**.
5. **Geocodificación exacta de tiendas y red internacional (`js/data/distribuidores-data.js`)**:
   - Las 221 tiendas de España usan actualmente las coordenadas de su capital de provincia como posición provisional en el mapa; geocodificar cada dirección postal exacta (`lat`, `lng` por tienda) para que el cálculo de distancia «Usar mi ubicación» y los pines del mapa tengan precisión de calle.
   - Cargar en `distribuidores-data.js` (o vía API) los distribuidores de los otros 7 mercados del selector (`Francia`, `Portugal`, `Italia`, `Bélgica`, `Países Bajos`, `Colombia`, `Chile`), que hoy muestran estado vacío.
