#!/usr/bin/env python3
"""
MENDIZ — Header y mega menú

El header es igual en todas las páginas: este script lo escribe en cada una.
Para cambiar un enlace, un modelo o una imagen del menú, edita MENU (abajo)
y vuelve a ejecutar desde la carpeta del proyecto:

    python3 tools/header.py

Qué hace en cada página:
  · sustituye el bloque <header class="site-header…">…</header>
    (conserva la variante superpuesta --overlay de la home);
  · sustituye el cuerpo del pie (.site-footer__body, ver FOOTER_COLS);
    lo que la página tenga antes dentro del <footer> se conserva;
  · marca la página actual (aria-current) y abre por defecto su grupo;
  · ajusta las rutas si alguna página vive en una subcarpeta;
  · añade al enlace de Material Symbols los iconos que usa el menú.

Estructura:
  1. Sección (a la izquierda de la única fila del header; logo al centro, enlaces y B2B a la derecha): Bicis, Only For You, MPL Concept…
     Cada sección es un enlace (href): en escritorio con ratón, pasar por
     encima abre el panel y el clic lleva a la página; en táctil y móvil,
     el primer toque abre el panel.
  2. Grupo (columna izquierda del panel): Carretera, Gravel…
  3. Contenido del grupo + imagen destacada (derecha). En Bicis el contenido
     es otra lista, la de tipos (Aero, Gran fondo…), y cada tipo despliega
     sus modelos en una cuarta columna.
     Al pasar por un modelo, la imagen cambia a la foto de esa bici.
"""
from functools import cache
from html import escape
from pathlib import Path
import re

try:
    from PIL import Image  # solo para leer el tamaño de las fotos (width/height)
except ImportError:
    Image = None

ROOT = Path(__file__).resolve().parent.parent
PAGES = sorted(ROOT.glob('*.html'))

# Si una página no está en el menú, se marca como actual la que la representa
ALIAS = {
    'configurador-f14.html': 'only-for-you.html',
    'only-for-you-2.html': 'only-for-you.html',
    'only-for-you-configura.html': 'only-for-you.html',
    'montaje-f14-mpl.html': 'mpl.html',
}

ICONS = ['arrow_back', 'arrow_forward', 'chevron_right', 'close', 'east', 'menu', 'person', 'west']

OUTLET = 'https://www.bicismendiz.com/bicicletas/temporada-anterior'
WEB = 'https://www.bicismendiz.com/bicicletas'

# --------------------------------------------------------------------------
# Contenido
# --------------------------------------------------------------------------
# Grupo: kind 'models' (lista de modelos con vista previa) o 'facts'
# (puntos de texto + enlace). teaser = imagen destacada del grupo.

def model(name, note, href, img, type=None):
    return {'name': name, 'note': note, 'href': href, 'img': img, 'type': type}

TOP_LINKS = [  # enlaces secundarios, a la derecha del logo
    ('Sobre Mendiz', 'sobre-mendiz.html'),
    ('Blog', 'blog.html'),
    ('Distribuidores', 'distribuidores.html'),
]

MENU = [
    {
        'id': 'bicis', 'label': 'Bicis', 'href': 'bicis.html',
        # Al abrir solo se ven las categorías; cada nivel se despliega al pasar
        # por él. Mientras no hay ninguno desplegado se ve esta imagen.
        'collapsed': True,
        'teaser': {'href': 'f14-sl-slp.html', 'img': 'assets/img/compartido/bicis-menu.webp',
                   'eyebrow': 'F14 SL-SLP', 'title': 'Diseñadas en casa. Montadas una a una.', 'cta': 'Conócela'},
        # kind 'types': categoría → tipo → modelos. Los tipos son los filtros del
        # listado de cada categoría (?tipo=…), así el enlace abre el listado filtrado.
        'groups': [
            {
                'help': 'que-mendiz-es-para-ti.html#/carretera',
                'id': 'carretera', 'label': 'Carretera', 'href': 'carretera.html', 'kind': 'types',
                'all': 'Ver todas las bicis de carretera',
                'types': [('rendimiento', 'Rendimiento'), ('aero', 'Aero'), ('gran-fondo', 'Gran fondo'), ('triatlon', 'Triatlón')],
                'items': [
                    model('F14 SL-SLP', 'Desde 3.490 €', 'f14-sl-slp.html', 'assets/img/f14-sl-slp/f14-sl-slp-hero-1200.webp', 'rendimiento'),
                    model('F12 SL', 'Desde 3.390 €', '#', 'assets/img/f12-sl/f12-sl-hero-1200.webp', 'aero'),
                    model('F9 SL', 'Desde 2.640 €', '#', 'assets/img/f9-sl/f9-sl-hero-1200.webp', 'gran-fondo'),
                    model('TT10', 'Desde 7.100 €', '#', 'assets/img/tt10/tt10-hero-1200.webp', 'triatlon'),
                ],
                'teaser': {'img': 'assets/img/compartido/terrenos/carretera.webp', 'eyebrow': 'Bicicletas de carretera',
                           'title': 'Cuatro modelos para entrenar, viajar y competir', 'cta': 'Ver carretera'},
            },
            {
                'help': 'que-mendiz-es-para-ti.html#/gravel',
                'id': 'gravel', 'label': 'Gravel', 'href': 'gravel.html', 'kind': 'types',
                'all': 'Ver todas las bicis de gravel',
                'types': [('carbono', 'Carbono'), ('aluminio', 'Aluminio')],
                'items': [
                    model('G12 SL', 'Desde 2.150 €', 'g12-sl.html', 'assets/img/g12-sl/g12-sl-hero-1200.webp', 'carbono'),
                    model('G11AM', 'Desde 2.250 €', f'{WEB}/carretera/mendiz-g11am', 'assets/img/g11am/g11am-hero-1200.webp', 'carbono'),
                    model('G4.ICR', 'Desde 1.390 €', f'{WEB}/carretera/mendiz-g4icr', 'assets/img/g4-icr/g4-icr-hero-1200.webp', 'aluminio'),
                ],
                'teaser': {'img': 'assets/img/compartido/terrenos/gravel.webp', 'eyebrow': 'Bicicletas de gravel',
                           'title': 'Para competir, enlazar pistas y asfalto o viajar con equipaje', 'cta': 'Ver gravel'},
            },
            {
                'help': 'que-mendiz-es-para-ti.html#/montana',
                'id': 'montana', 'label': 'Montaña', 'href': 'montana.html', 'kind': 'types',
                'all': 'Ver todas las bicis de montaña',
                'types': [('carbono-doble', 'Carbono doble'), ('carbono-rigido', 'Carbono rígido'), ('aluminio-rigido', 'Aluminio rígido')],
                'items': [
                    model('X40 SL-ICR', 'Desde 1.840 €', 'x40-sl-icr.html', 'assets/img/x40-sl-icr/x40-sl-icr-hero-1200.webp', 'carbono-doble'),
                    model('X21 SL', 'Desde 1.490 €', f'{WEB}/mtb/mendiz-x21-sl-0', 'assets/img/x21-sl/x21-sl-hero-1200.webp', 'carbono-rigido'),
                    model('X10 BOOST', 'Desde 990 €', f'{WEB}/mtb/mendiz-x10-boost', 'assets/img/x10-boost/x10-boost-hero-1200.webp', 'aluminio-rigido'),
                    model('X10', 'Desde 850 €', f'{WEB}/mtb/mendiz-x10-0', 'assets/img/x10/x10-hero-1200.webp', 'aluminio-rigido'),
                ],
                'teaser': {'img': 'assets/img/compartido/terrenos/montana.webp', 'eyebrow': 'Bicicletas de montaña',
                           'title': 'Doble suspensión o rígida, carbono o aluminio', 'cta': 'Ver montaña'},
            },
            {
                'id': 'electricas', 'label': 'Eléctricas', 'href': 'electricas.html', 'kind': 'types',
                'help': 'que-mendiz-es-para-ti.html',  # no es un terreno: empieza por la primera pregunta
                'all': 'Ver todas las bicis eléctricas',
                'types': [('carretera', 'Carretera'), ('montana', 'Montaña'), ('gravel', 'Gravel')],
                'items': [
                    model('EX41', 'Desde 3.650 €', 'ex41.html', 'assets/img/ex41/ex41-hero-1200.webp', 'montana'),
                    model('EF21', 'Desde 5.290 €', f'{WEB}/electricas/mendiz-ef21', 'assets/img/ef21/ef21-hero-1200.webp', 'carretera'),
                    model('EF4', 'Desde 4.290 €', f'{WEB}/electricas/mendiz-ef4', 'assets/img/ef4/ef4-hero-1200.webp', 'carretera'),
                    model('EG21', 'Desde 5.390 €', f'{WEB}/electricas/mendiz-eg21', 'assets/img/eg21/eg21-hero-1200.webp', 'gravel'),
                    model('EG4', 'Desde 4.290 €', f'{WEB}/electricas/mendiz-eg4', 'assets/img/eg4/eg4-hero-1200.webp', 'gravel'),
                ],
                'teaser': {'img': 'assets/img/compartido/terrenos/electricas.webp', 'eyebrow': 'Bicicletas eléctricas',
                           'title': 'Asistencia al pedaleo para carretera, gravel y montaña', 'cta': 'Ver eléctricas'},
            },
        ],
        'extra': [  # bajo los grupos, separados por un filete
            ('¿Qué Mendiz es para ti?', 'que-mendiz-es-para-ti.html'),
            ('Ofertas', 'ofertas.html'),
        ],
        # «Ver todas» bajo los accesos de arriba, con la flecha del «Ver todas»
        # de cada categoría
        'extra_all': ('Ver todas', 'bicis.html', 'Ver todas las bicis'),
    },
    {
        'id': 'ofy', 'label': 'Only For You', 'href': 'only-for-you.html',
        'mobile_link': True,  # en móvil, enlace directo sin submenú
        'groups': [
            {
                'id': 'como-funciona', 'label': 'Cómo funciona', 'href': 'only-for-you.html', 'kind': 'facts',
                'numbered': False,  # sin numeración
                'facts': [
                    ('Elige el modelo', 'Partes de un montaje de serie de la bici que quieres.'),
                    ('Tus colores', 'Tu combinación de colores estándar o premium, trama y pegatinas.'),
                    ('Tus componentes y tu talla', 'Cambia los componentes que se pueden personalizar.'),
                    ('La hacemos real', 'Tu distribuidor tramita el pedido y la recibes montada y revisada.'),
                ],
                'link': ('Descubre Only For You', 'only-for-you.html'),
                'teaser': {'img': 'assets/only-for-you/03.webp', 'eyebrow': 'Only For You',
                           'title': 'Tú decides cómo es. Nosotros la montamos.', 'cta': 'Descubrir'},
            },
            {
                'id': 'configura', 'label': 'Configura tu bici', 'href': 'only-for-you-modelos.html', 'kind': 'models',
                'all': 'Ver todas las bicis Only For You',
                'items': [
                    model('F14 SL-SLP', 'Carretera', 'configurador-f14.html?modelo=f14-sl-slp', 'assets/img/f14-sl-slp/f14-sl-slp-hero-1200.webp'),
                    model('F12 SL', 'Carretera', 'configurador-f14.html?modelo=f12-sl', 'assets/img/f12-sl/f12-sl-hero-1200.webp'),
                    model('F9 SL', 'Carretera', 'configurador-f14.html?modelo=f9-sl', 'assets/img/f9-sl/f9-sl-hero-1200.webp'),
                    model('TT10', 'Triatlón', 'configurador-f14.html?modelo=tt10', 'assets/img/tt10/tt10-hero-1200.webp'),
                    model('G12 SL', 'Gravel', 'configurador-f14.html?modelo=g12-sl', 'assets/img/g12-sl/g12-sl-hero-1200.webp'),
                    model('X40 SL-ICR', 'Montaña', 'configurador-f14.html?modelo=x40-sl-icr', 'assets/img/x40-sl-icr/x40-sl-icr-hero-1200.webp'),
                    model('EX41', 'Eléctrica', 'configurador-f14.html?modelo=ex41', 'assets/img/ex41/ex41-hero-1200.webp'),
                ],
                'teaser': {'img': 'assets/only-for-you/01.webp', 'eyebrow': 'Configurador',
                           'title': 'Siete modelos para hacer tuyos', 'cta': 'Empezar a configurar'},
            },
            {
                'id': 'distribuidor', 'label': 'Con tu distribuidor', 'href': 'distribuidores.html', 'kind': 'facts',
                'numbered': False,  # sin numeración
                'facts': [
                    ('Prueba tu talla', 'Tu distribuidor te ayuda a elegir talla y ajustar la posición.'),
                    ('Tramita el pedido', 'Le llevas tu configuración y él se encarga del resto.'),
                ],
                'link': ('Buscar distribuidor', 'distribuidores.html'),
                'teaser': {'img': 'assets/only-for-you/05.webp', 'eyebrow': 'Distribuidores',
                           'title': 'Configúrala con tu distribuidor', 'cta': 'Buscar distribuidor'},
            },
        ],
    },
    {
        'id': 'mpl', 'label': 'MPL Concept', 'href': 'mpl.html',
        'mobile_link': True,  # en móvil, enlace directo sin submenú
        'groups': [
            {
                'id': 'que-es', 'label': 'Qué es MPL', 'href': 'mpl.html', 'kind': 'facts',
                'numbered': False,  # destacados sin numeración
                'facts': [
                    ('Edición limitada', 'Una selección de modelos Mendiz disponible solo durante un tiempo.'),
                    ('Montaje y color definidos', 'Mendiz elige cuadro, componentes y acabado. Tú eliges la bici y la talla.'),
                    ('Disponibilidad casi inmediata', 'Configuraciones cerradas: no esperas a que se monte a la carta.'),
                ],
                'link': ('Conoce MPL Concept', 'mpl.html'),
                'teaser': {'img': 'assets/img/mpl/mpl-menu-1200.webp', 'eyebrow': 'MPL Concept',
                           'title': 'Lo mejor de Mendiz, en edición limitada', 'cta': 'Ver la gama MPL'},
            },
            {
                'id': 'carretera', 'label': 'Carretera MPL', 'href': 'mpl.html#modelos', 'kind': 'models',
                'all': 'Ver todas las bicis MPL',
                'items': [
                    model('F14 MPL', 'Desde 2.150 €', f'{WEB}/carretera/mendiz-f14-mpl', 'assets/img/mpl/f14-mpl-1200.webp'),
                    model('F9 MPL', 'Desde 2.050 €', f'{WEB}/carretera/mendiz-f9-mpl', 'assets/img/mpl/f9-mpl-1200.webp'),
                ],
                'teaser': {'img': 'assets/img/compartido/categorias/carretera-mpl.webp', 'eyebrow': 'Carretera MPL',
                           'title': 'Ligeras, rápidas y listas para salir', 'cta': 'Ver MPL'},
            },
            {
                'id': 'gravel', 'label': 'Gravel MPL', 'href': 'mpl.html#modelos', 'kind': 'models',
                'all': 'Ver todas las bicis MPL',
                'items': [
                    model('G12 MPL', 'Desde 2.190 €', f'{WEB}/carretera/mendiz-g12-mpl', 'assets/img/mpl/g12-mpl-1200.webp'),
                    model('G11AM MPL', 'Desde 2.280 €', f'{WEB}/electricas/mendiz-g11am-mpl', 'assets/img/mpl/g11am-mpl-1200.webp'),
                ],
                'teaser': {'img': 'assets/img/compartido/categorias/gravel-mpl.webp', 'eyebrow': 'Gravel MPL',
                           'title': 'Para rodar rápido por pistas o viajar lejos', 'cta': 'Ver MPL'},
            },
            {
                'id': 'electricas', 'label': 'Eléctricas MPL', 'href': 'mpl.html#modelos', 'kind': 'models',
                'all': 'Ver todas las bicis MPL',
                'items': [
                    model('EF21 MPL', 'Desde 4.580 €', f'{WEB}/electricas/mendiz-ef21-mpl', 'assets/img/mpl/ef21-mpl-1200.webp'),
                    model('EF4 MPL', 'Desde 3.990 €', f'{WEB}/electricas/mendiz-ef4-mpl', 'assets/img/mpl/ef4-mpl-1200.webp'),
                    model('EG21 MPL', 'Desde 4.760 €', f'{WEB}/electricas/mendiz-eg21-mpl', 'assets/img/mpl/eg21-mpl-1200.webp'),
                    model('EG4 MPL', 'Desde 4.190 €', f'{WEB}/electricas/mendiz-eg4mpl', 'assets/img/mpl/eg4-mpl-1200.webp'),
                ],
                'teaser': {'img': 'assets/img/compartido/categorias/electricas-mpl.webp', 'eyebrow': 'Eléctricas MPL',
                           'title': 'Autonomía para carretera y caminos', 'cta': 'Ver MPL'},
            },
        ],
    },
    {
        'id': 'servicio', 'label': 'Servicio', 'href': 'servicio.html',
        'mobile_link': True,  # en móvil, enlace directo sin submenú
        'groups': [
            {
                'id': 'ayuda', 'label': 'Ayuda y soporte', 'href': 'servicio.html', 'kind': 'links',
                'items': [
                    ('Centro de ayuda', 'Guías y artículos para elegir, ajustar y cuidar tu bici', 'servicio.html'),
                    ('Cómo elegir tu bici', 'Terreno, uso y presupuesto: por dónde empezar', 'ayuda-como-elegir-tu-bici.html'),
                ],
                'teaser': {'img': 'assets/img/compartido/terrenos/gravel.webp', 'eyebrow': 'Servicio',
                           'title': 'Te ayudamos antes y después de la compra', 'cta': 'Ir al centro de ayuda'},
            },
            {
                'id': 'distribuidores', 'label': 'Distribuidores', 'href': 'distribuidores.html', 'kind': 'links',
                'items': [
                    ('Buscar distribuidor', 'Prueba tu talla y tramita tu pedido cerca de ti', 'distribuidores.html'),
                    ('Acceso B2B', 'Área privada para tiendas Mendiz', 'acceso-b2b.html'),
                ],
                'teaser': {'img': 'assets/img/compartido/terrenos/carretera-alt.webp', 'eyebrow': 'Distribuidores',
                           'title': 'Encuentra tu distribuidor', 'cta': 'Buscar distribuidor'},
            },
            {
                'id': 'elegir', 'label': 'Ayuda para elegir', 'href': 'que-mendiz-es-para-ti.html', 'kind': 'links',
                'items': [
                    ('¿Qué Mendiz es para ti?', 'Te orientamos según cómo y por dónde ruedas', 'que-mendiz-es-para-ti.html'),
                    ('Preguntas frecuentes', 'Tallas, plazos, pedidos y entregas', 'servicio.html#preguntas'),
                ],
                'teaser': {'img': 'assets/img/compartido/terrenos/gravel-jump.webp', 'eyebrow': 'Ayuda para elegir',
                           'title': '¿Qué Mendiz es para ti?', 'cta': 'Empezar'},
            },
            {
                'id': 'tu-mendiz', 'label': 'Tu Mendiz', 'href': 'servicio.html#tu-mendiz', 'kind': 'links',
                'items': [
                    ('Garantía', 'Qué cubre y cómo tramitarla', 'ayuda-garantia.html'),
                    ('Manual de usuario', 'Ajustes, uso y mantenimiento', 'ayuda-mantenimiento.html'),
                    ('Contacto', 'Escríbenos o llámanos', '#'),
                ],
                'teaser': {'img': 'assets/img/compartido/terrenos/montana-alt.webp', 'eyebrow': 'Tu Mendiz',
                           'title': 'Te acompañamos después de la compra', 'cta': 'Ver garantía'},
            },
        ],
    },
    {
        'id': 'ofertas', 'label': 'Ofertas', 'href': 'ofertas.html',
        # Sin grupos: cuatro imágenes. Cada una
        # abre el listado de ofertas filtrado por su categoría (?categoria=…).
        'tiles': [
            ('Carretera', 'assets/img/compartido/terrenos/carretera-alt.webp', 'ofertas.html?categoria=carretera'),
            ('Gravel', 'assets/img/compartido/terrenos/gravel-jump.webp', 'ofertas.html?categoria=gravel'),
            ('Montaña', 'assets/img/compartido/terrenos/montana-alt.webp', 'ofertas.html?categoria=montana'),
            ('Eléctricas', 'assets/img/compartido/terrenos/electricas-camino.webp', 'ofertas.html?categoria=electricas'),
        ],
        'tiles_all': ('Ver todas', 'ofertas.html', 'Ver todas las ofertas'),
        'tiles_note': 'Temporada anterior',
    },
]


# --------------------------------------------------------------------------
# Plantilla
# --------------------------------------------------------------------------
@cache
def size(src):
    """width/height de una foto del menú (evita saltos al cargar). Sin Pillow, nada."""
    if Image is None or src.startswith('http'):
        return ''
    try:
        with Image.open(ROOT / src) as im:
            return f' width="{im.width}" height="{im.height}"'
    except OSError:
        print(f'  ! no se puede leer {src}')
        return ''


# La vista previa no tiene foto hasta que se señala un modelo (js/main.js pone
# el src): GIF transparente de 1 px para que el <img> sea válido. Las fotos de
# modelo son 3:2.
PREVIEW_SRC = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'


def icon(name, cls=''):
    c = f'material-symbols-outlined {cls}'.strip()
    return f'<span class="{c}" aria-hidden="true">{name}</span>'


class Page:
    def __init__(self, rel):
        self.rel = rel                       # p. ej. 'configurador-f14.html'
        self.prefix = '../' * rel.count('/')
        # Las noticias (noticia-*.html) cuelgan del blog; los montajes en oferta
        # de un modelo (ofertas-*.html), de Ofertas; los artículos de ayuda
        # (ayuda-*.html), de Servicio.
        alias = ALIAS.get(rel) or next((home for pre, home in (
            ('noticia-', 'blog.html'), ('ofertas-', 'ofertas.html'), ('ayuda-', 'servicio.html'))
            if rel.startswith(pre)), None)
        self.current = alias or rel
        self.alias = alias is not None

    def url(self, href):
        if href.startswith(('http', '#', 'mailto:', 'tel:')):
            return href
        return self.prefix + href

    def is_current(self, href):
        return href.split('#')[0].split('?')[0] == self.current and '?' not in href

    def cur(self, href):
        """aria-current para un enlace a la página actual."""
        if not self.is_current(href):
            return ''
        return ' aria-current="true"' if self.alias else ' aria-current="page"'

    def a(self, href, cls, inner, extra=''):
        c = f' class="{cls}"' if cls else ''
        return f'<a{c} href="{escape(self.url(href))}"{self.cur(href)}{extra}>{inner}</a>'


def group_has_current(p, g):
    hrefs = [g.get('href', '')]
    hrefs += [i['href'] for i in g.get('items', []) if isinstance(i, dict)]
    hrefs += [i[2] for i in g.get('items', []) if isinstance(i, tuple)]
    if g.get('link'):
        hrefs.append(g['link'][1])
    return any(p.is_current(h) for h in hrefs)


def arrow_link(p, href, text, label=None, current=True):
    """Enlace con flecha. Solo se subraya el texto, no la flecha."""
    aria = f' aria-label="{escape(label)}"' if label else ''
    cur = p.cur(href) if current else ''
    return (f'<a class="mega-menu__all" href="{escape(p.url(href))}"{cur}{aria}>'
            f'<span>{escape(text)}</span>{icon("arrow_forward")}</a>')


def see_all(p, href, label, current=True):
    """«Ver todas», al final de cada lista."""
    return arrow_link(p, href, 'Ver todas', label, current)


def teaser(p, g, cls=''):
    t = g['teaser']
    return f'''
                      <div class="mega-menu__teaser{cls}" data-mega-menu-teaser>
                        <a class="mega-menu__teaser-card on-dark" href="{escape(p.url(g['href']))}" tabindex="-1">
                          <img src="{p.url(t['img'])}"{size(t['img'])} alt="" loading="lazy" decoding="async">
                          <span class="mega-menu__teaser-text">
                            <span class="eyebrow">{escape(t['eyebrow'])}</span>
                            <span class="mega-menu__teaser-title">{escape(t['title'])}</span>
                            <span class="btn btn--inverse btn--sm">{escape(t['cta'])}</span>
                          </span>
                        </a>
                        <div class="mega-menu__preview" aria-hidden="true">
                          <img src="{PREVIEW_SRC}" width="1200" height="800" alt="" decoding="async">
                          <span class="mega-menu__preview-name display"></span>
                          <span class="mega-menu__preview-note"></span>
                        </div>
                      </div>'''


def model_list(p, items):
    out = ['<ul class="mega-menu__models">']
    for m in items:
        data = f' data-preview="{p.url(m["img"])}" data-preview-name="{escape(m["name"])}" data-preview-note="{escape(m["note"])}"'
        inner = f'<strong>{escape(m["name"])}</strong><small>{escape(m["note"])}</small>'
        out.append(f'  <li>{p.a(m["href"], "mega-menu__model", inner, data)}</li>')
    out.append('</ul>')
    return out


def types_group(p, g, gid, on, back, collapsed=False):
    """Categoría con tipos: lista de tipos (columna 1) y sus modelos (columna 2)."""
    current = next((m['type'] for m in g['items'] if p.is_current(m['href'])), None)
    active = None if collapsed else (current or g['types'][0][0])
    links, subs = [], []
    for tid, label in g['types']:
        sid = f'{gid}-{tid}'
        t_on = tid == active
        href = f'{g["href"]}?tipo={tid}'
        links.append(
            f'<li><a class="mega-menu__sublevel mega-menu__type{" is-active" if t_on else ""}" href="{escape(p.url(href))}"'
            f' aria-controls="{sid}" data-mega-menu-group><span>{escape(label)}</span>{icon("chevron_right")}</a></li>')
        models = [m for m in g['items'] if m['type'] == tid]
        pad = '\n                          '
        label_all = f'{g["all"]}: {label.lower()}'
        subs.append(f'''
                      <div class="mega-menu__sub{" is-active" if t_on else ""}" id="{sid}" data-mega-menu-panel>
                        <div class="mega-menu__list">
                          {back.format(escape(label))}{pad}{pad.join(model_list(p, models))}
                          {see_all(p, href, label_all, current=False)}
                        </div>
                      </div>''')
    sep = '\n                          '
    help_link = ''
    if g.get('help'):
        help_link = '\n                        ' + arrow_link(p, g['help'], 'Ayúdame a elegir la bici', current=False)
    return f'''
                    <div class="mega-menu__group mega-menu__group--types{" is-active" if on else ""}" id="{gid}" data-mega-menu-panel>
                      <div class="mega-menu__list">
                        {back.format(escape(g['label']))}
                        <ul class="mega-menu__types">{sep}{sep.join(links)}
                        </ul>
                        {see_all(p, g['href'], g['all'])}{help_link}
                      </div>{''.join(subs)}{teaser(p, g)}
                    </div>'''


def group_body(p, g):
    out = []
    if g['kind'] == 'models':
        out += model_list(p, g['items'])
        out.append(see_all(p, g['href'], g['all']))
    elif g['kind'] == 'links':
        out.append('<ul class="mega-menu__models">')
        for name, note, href in g['items']:
            inner = f'<strong>{escape(name)}</strong><small>{escape(note)}</small>'
            out.append(f'  <li>{p.a(href, "mega-menu__model", inner)}</li>')
        out.append('</ul>')
    else:  # facts
        numbered = g.get('numbered', True)
        tag = 'ol' if numbered else 'ul'
        out.append(f'<{tag} class="mega-menu__facts{"" if numbered else " mega-menu__facts--plain"}">')
        for title, note in g['facts']:
            out.append(f'  <li><strong>{escape(title)}</strong><span>{escape(note)}</span></li>')
        out.append(f'</{tag}>')
        label, href = g['link']
        out.append(arrow_link(p, href, label))
    pad = '\n                        '
    return pad + pad.join(out)


def section(p, s):
    pid = f'mega-menu-{s["id"]}'
    label = escape(s['label'])
    back = f'<button class="mega-menu__back" type="button" data-mega-menu-back>{icon("arrow_back")}<span>{{}}</span></button>'

    if 'tiles' in s:
        current = p.is_current(s['href'])
        tiles = []
        for name, img, href in s['tiles']:
            tiles.append(f'''
                    <li><a class="mega-menu__tile on-dark" href="{escape(p.url(href))}">
                      <img src="{p.url(img)}"{size(img)} alt="" loading="lazy" decoding="async">
                      <span class="mega-menu__tile-text"><span class="eyebrow">{escape(s['tiles_note'])}</span><strong>{escape(name)}</strong></span>
                    </a></li>''')
        body = f'''
                  {back.format(label)}
                  <ul class="mega-menu__tiles">{''.join(tiles)}
                  </ul>
                  {arrow_link(p, s['tiles_all'][1], s['tiles_all'][0], s['tiles_all'][2])}'''
        mod = ' mega-menu__inner--tiles'
    else:
        groups = s['groups']
        active = next((g for g in groups if group_has_current(p, g)), None)
        current = active is not None
        collapsed = s.get('collapsed', False)
        active = None if collapsed else (active or groups[0])
        l2, panels = [], []
        for g in groups:
            gid = f'{pid}-{g["id"]}'
            on = g is active
            l2.append(
                f'<li><a class="mega-menu__sublevel{" is-active" if on else ""}" href="{escape(p.url(g["href"]))}"'
                f' aria-controls="{gid}" data-mega-menu-group{p.cur(g["href"]) if on else ""}>'
                f'<span>{escape(g["label"])}</span>{icon("chevron_right")}</a></li>')
            if g['kind'] == 'types':
                panels.append(types_group(p, g, gid, on, back, collapsed))
                continue
            panels.append(f'''
                    <div class="mega-menu__group{" is-active" if on else ""}" id="{gid}" data-mega-menu-panel>
                      <div class="mega-menu__list">
                        {back.format(escape(g['label']))}{group_body(p, g)}
                      </div>{teaser(p, g)}
                    </div>''')
        extra = ''
        if s.get('extra'):
            items = ''.join(f'<li>{p.a(h, "", escape(t))}</li>' for t, h in s['extra'])
            extra = f'\n                    <ul class="mega-menu__extra">{items}</ul>'
        if s.get('extra_all'):
            extra += '\n                    ' + arrow_link(p, s['extra_all'][1], s['extra_all'][0], s['extra_all'][2])
        sep = '\n                      '
        t = s.get('teaser')
        intro = teaser(p, {'href': t['href'], 'teaser': t}, ' mega-menu__teaser--section') if t else ''
        body = f'''
                  {back.format(label)}
                  <div class="mega-menu__nav">
                    <ul class="mega-menu__sublevels">{sep}{sep.join(l2)}
                    </ul>{extra}
                  </div>{''.join(panels)}{intro}'''
        mod = ' mega-menu__inner--collapsed' if collapsed else ''

    cur_attr = ' aria-current="true"' if current else ''
    # En móvil, estas secciones son un enlace directo a su página (sin submenú)
    direct = ' data-mega-menu-direct' if s.get('mobile_link') else ''
    return f'''
          <li class="nav-main__item">
            <a class="nav-main__link" href="{escape(p.url(s['href']))}" aria-expanded="false" aria-controls="{pid}"{cur_attr}{direct} data-mega-menu-toggle><span>{label}</span>{icon('chevron_right', 'nav-main__chevron')}</a>
            <div class="mega-menu" id="{pid}" data-mega-menu>
              <div class="mega-menu__scroll">
                <div class="container mega-menu__inner{mod}">{body}
                </div>
              </div>
            </div>
          </li>'''


def header(p, overlay):
    top = ''.join(f'<li>{p.a(h, "", escape(t))}</li>' for t, h in TOP_LINKS)
    sections = ''.join(section(p, s) for s in MENU)
    cls = 'site-header site-header--overlay' if overlay else 'site-header'
    # Botón de inicio de sesión del área privada para tiendas
    login = p.a('acceso-b2b.html', 'btn btn--secondary btn--sm nav-utility__login', f'{icon("person")}<span>Acceso B2B</span>')
    return f'''<!-- ===================================================== HEADER
       Generado con tools/header.py: cambia el contenido allí y vuelve a
       ejecutarlo (python3 tools/header.py). Comportamiento en js/main.js. -->
  <header class="{cls}" data-header>
    <div class="site-header__backdrop" data-mega-menu-backdrop aria-hidden="true"></div>
    <div class="container site-header__bar">
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Abrir menú" data-nav-toggle>{icon('menu')}</button>
      <nav class="site-nav" id="site-nav" aria-label="Principal" data-lenis-prevent>
        <div class="site-nav__root">
          <ul class="nav-main">{sections}
          </ul>
          <ul class="site-nav__extra">{top}<li>{login}</li></ul>
        </div>
      </nav>
      <a class="site-header__logo" href="{p.url('index.html')}" aria-label="Mendiz, ir a inicio">
        <img src="{p.url('assets/img/compartido/logo.webp')}" alt="Mendiz" width="157" height="19">
      </a>
      <div class="site-header__end">
        <ul class="nav-top">{top}</ul>
        <ul class="nav-utility">
          <li>{login}</li>
        </ul>
      </div>
    </div>
  </header>'''


# --------------------------------------------------------------------------
# Pie
# --------------------------------------------------------------------------
# Igual en todas las páginas. Se sustituye solo el cuerpo del pie
# (.site-footer__body): lo que una página ponga antes dentro del <footer>
# (la franja de distribuidor de las fichas) se conserva. '#' = página pendiente.
FOOTER_DESC = 'Bicicletas de carretera, gravel, montaña y eléctricas. Encuentra tu modelo y tu distribuidor.'

FOOTER_COLS = [
    ('Bicicletas', [
        ('Carretera', 'carretera.html'),
        ('Gravel', 'gravel.html'),
        ('Montaña', 'montana.html'),
        ('Eléctricas', 'electricas.html'),
        ('Only For You', 'only-for-you.html'),
        ('MPL Concept', 'mpl.html'),
    ]),
    ('Mendiz', TOP_LINKS),
    ('Te ayudamos', [
        ('¿Qué Mendiz es para ti?', 'que-mendiz-es-para-ti.html'),
        ('Preguntas frecuentes', 'servicio.html#preguntas'),
        ('Garantía', 'ayuda-garantia.html'),
        ('Manual de usuario', 'ayuda-mantenimiento.html'),
        ('Contacto', '#'),
        ('Acceso B2B', 'acceso-b2b.html'),
    ]),
]

FOOTER_LEGAL = [('Aviso legal', '#'), ('Privacidad', '#'), ('Cookies', '#')]

SOCIAL = [  # (nombre, enlace, contenido del SVG 24 × 24)
    ('Instagram', '#', '<rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle>'
                       '<circle cx="17.5" cy="6.5" r="0.8" fill="currentColor"></circle>'),
    ('YouTube', '#', '<rect x="2" y="5" width="20" height="14" rx="4"></rect><path d="m10 9 5 3-5 3z" fill="currentColor"></path>'),
    ('Facebook', '#', '<path d="M14 21v-7.5h2.6l.4-3H14V8.7c0-.9.3-1.5 1.5-1.5H17V4.5a20 20 0 0 0-2.3-.1c-2.3 0-3.7 1.4-3.7 3.9v2.2H8.5v3H11V21"></path>'),
]


def footer(p):
    links = lambda items: ''.join(f'\n            <li><a href="{escape(p.url(h))}">{escape(t)}</a></li>' for t, h in items)
    social = ''.join(
        f'\n            <li><a href="{escape(p.url(h))}" aria-label="{n}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"'
        f' stroke-width="1.5" aria-hidden="true">{svg}</svg></a></li>' for n, h, svg in SOCIAL)
    cols = ''.join(f'''
        <div>
          <h2 class="site-footer__heading">{escape(title)}</h2>
          <ul class="site-footer__links">{links(items)}
          </ul>
        </div>''' for title, items in FOOTER_COLS)
    return f'''<!-- Pie: generado con tools/header.py. La newsletter es solo un botón
         discreto en la columna de marca. Ocupa hasta un 65 % del alto de la ventana. -->
    <div class="container site-footer__body">
      <div class="site-footer__top">
        <div class="site-footer__brand">
          <img src="{p.url('assets/img/compartido/logo.webp')}" alt="Mendiz" width="157" height="19" loading="lazy">
          <p class="site-footer__desc">{escape(FOOTER_DESC)}</p>
          <ul class="site-footer__social">{social}
          </ul>
          <a class="btn btn--secondary btn--sm site-footer__newsletter" href="#">Suscríbete a la newsletter</a>
        </div>{cols}
      </div>
      <div class="site-footer__bottom">
        <p>© 2026 Mendiz</p>
        <ul class="site-footer__legal">{links(FOOTER_LEGAL)}
        </ul>
        <p>España · Español</p>
      </div>
    </div>
  '''


HEADER_RE = re.compile(
    r'<!-- =+ HEADER.*?-->\s*<header class="site-header[^"]*"[^>]*>.*?</header>', re.S)
# Cuerpo del pie (con su comentario, si lo tiene) hasta el cierre del <footer>
FOOTER_RE = re.compile(
    r'(?:<!-- Pie:.*?-->\s*)?<div class="container site-footer__body">.*?(?=</footer>)', re.S)
ICONS_RE = re.compile(r'(family=Material\+Symbols\+Outlined[^"]*?icon_names=)([^&"]+)')
ICONS_LINK = ('  <link rel="stylesheet"\n'
              '    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names={}&display=block">\n')


def main():
    for path in PAGES:
        rel = path.relative_to(ROOT).as_posix()
        html = path.read_text(encoding='utf-8')
        m = HEADER_RE.search(html)
        if not m:
            print(f'· {rel}: sin header, se omite')
            continue
        overlay = 'site-header--overlay' in m.group(0)
        html = html[:m.start()] + header(Page(rel), overlay) + html[m.end():]

        fm = FOOTER_RE.search(html)
        if fm:
            html = html[:fm.start()] + footer(Page(rel)) + html[fm.end():]
        else:
            print(f'  · {rel}: sin pie')

        # Iconos: une los del menú con los que ya usa la página (orden alfabético)
        im = ICONS_RE.search(html)
        if im:
            names = sorted(set(im.group(2).split(',')) | set(ICONS))
            html = html[:im.start(2)] + ','.join(names) + html[im.end(2):]
        else:
            geist = re.search(r'.*family=Geist.*\n', html)
            if geist:
                html = html[:geist.end()] + ICONS_LINK.format(','.join(ICONS)) + html[geist.end():]
            else:
                print(f'  ! {rel}: sin enlace a Geist ni a Material Symbols; añade los iconos a mano')

        path.write_text(html, encoding='utf-8')
        print(f'✓ {rel}{"  (superpuesto)" if overlay else ""}')


if __name__ == '__main__':
    main()
