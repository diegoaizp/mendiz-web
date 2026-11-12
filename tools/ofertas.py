#!/usr/bin/env python3
"""
MENDIZ — Ofertas

Genera las páginas de Ofertas a partir de OFERTAS (abajo):

  · ofertas.html            listado de todos los modelos en oferta, con
                            tarjetas anchas como las de los listados de
                            categoría, una debajo de otra, y filtro por tipo
                            (?categoria=carretera|montana|gravel|electricas;
                            el mega menú enlaza cada imagen con su categoría);
  · ofertas-<slug>.html     una página por modelo, solo con la rejilla de
                            sus montajes en oferta (tarjetas compactas .build-card,
                            sin colores).

Para cambiar las ofertas, edita OFERTAS y ejecuta desde la carpeta del proyecto:

    python3 tools/ofertas.py
    python3 tools/header.py      # header y página actual en las páginas nuevas

<head>, header y pie se copian de carretera.html; header.py los rehace después.

PENDIENTE (cliente): modelos, montajes, precio anterior y de oferta y fotos.
Los cuatro modelos de abajo son los que la web oficial marcaba como
«¡PROMOCIÓN!» en temporada anterior (precio de modelo, sin
montajes). Solo la X21 SL tiene fotos en el proyecto; sus montajes son los de
la ficha actual (x21-sl.html) y se muestran como EJEMPLO de estructura.
"""
from html import escape
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
BASE = ROOT / 'carretera.html'
OUTLET = 'https://www.bicismendiz.com/bicicletas/temporada-anterior'

CATEGORIAS = [('carretera', 'Carretera'), ('montana', 'Montaña'), ('gravel', 'Gravel'), ('electricas', 'Eléctricas')]
CAT_LABEL = dict(CATEGORIAS)

# --------------------------------------------------------------------------
# Datos
# --------------------------------------------------------------------------
# colors: (nombre, color CSS) · img: None = foto pendiente
# builds_from: ficha local de la que copiar la rejilla de montajes (ejemplo)
OFERTAS = [
    {
        'slug': 'x21-sl', 'name': 'X21 SL', 'cat': 'montana', 'type': 'Carbono rígido',
        'for': 'La rígida de carbono de la gama, con geometría deportiva para entrenar y competir en circuitos de montaña.',
        'img': 'assets/img/x21-sl/x21-sl-card-1200.webp',
        'colors': [('Rojo burdeos', '#682532'), ('Antracita', '#4b4d4f')],
        'price': '1.550 €', 'was': '2.390 €',
        'ficha': 'x21-sl.html',
        'builds_from': 'x21-sl.html',
    },
    {
        'slug': 'x21', 'name': 'X21', 'cat': 'montana', 'type': 'Carbono rígido · 22-23',
        'for': 'Rígida de carbono de temporada anterior. Descripción pendiente de revisión.',
        'img': None, 'colors': [],
        'price': '1.290 €', 'was': '1.790 €',
        'ficha': None, 'builds_from': None,
    },
    {
        'slug': 'f8', 'name': 'F8', 'cat': 'carretera', 'type': 'Carretera',
        'for': 'Bici de carretera de temporada anterior. Descripción pendiente de revisión.',
        'img': None, 'colors': [],
        'price': '1.550 €', 'was': '2.720 €',
        'ficha': None, 'builds_from': None,
    },
    {
        'slug': 'f4', 'name': 'F4', 'cat': 'carretera', 'type': 'Carretera',
        'for': 'Bici de carretera de temporada anterior. Descripción pendiente de revisión.',
        'img': None, 'colors': [],
        'price': '1.290 €', 'was': '1.690 €',
        'ficha': None, 'builds_from': None,
    },
]


# --------------------------------------------------------------------------
# Plantilla
# --------------------------------------------------------------------------
def shell():
    """<head>…</head>, header y pie de carretera.html."""
    html = BASE.read_text(encoding='utf-8')
    head = html[:html.index('</head>')]
    head = re.sub(r'<link href="css/catalogo-producto\.css" rel="stylesheet"/>', '', head)
    header = re.search(r'<a class="skip-link".*?</header>', html, re.S).group(0)
    footer = html[html.index('<!-- ===================================================== FOOTER'):]
    return head, header, footer


def page(head, header, footer, title, desc, css, body_attr, main):
    head = re.sub(r'<title>.*?</title>', f'<title>{escape(title)}</title>', head)
    head = re.sub(r'<meta content="[^"]*" name="description"/>', f'<meta content="{escape(desc)}" name="description"/>', head)
    links = ''.join(f'\n<link href="css/{c}" rel="stylesheet"/>' for c in css)
    return f'''{head}{links}</head>
<body{body_attr}>
{header}
<main id="main">
<!-- Generado con tools/ofertas.py: cambia los datos allí y vuelve a ejecutarlo. -->
{main}
</main>
{footer}'''


def crumbs(*items):
    li = ''.join(f'<li><a href="{h}">{escape(t)}</a></li>' for t, h in items[:-1])
    li += f'<li><span aria-current="page">{escape(items[-1][0])}</span></li>'
    return f'<nav aria-label="Migas de pan" class="container breadcrumb">\n<ol>{li}</ol>\n</nav>'


def price_html(o):
    return (f'<p class="bike-card__from">Desde {o["price"]} '
            f'<s class="bike-card__was"><span class="visually-hidden">antes </span>{o["was"]}</s></p>')


def swatches(o):
    """Círculos de color bajo la bici (dentro de .bike-card__media)."""
    if not o['colors']:
        return '<!-- TODO: colores pendientes -->'
    lis = ''.join(f'<li><span class="bike-card__swatch" style="--sw:{c}"></span></li>' for _, c in o['colors'])
    names = [n for n, _ in o['colors']]
    names = names[0] if len(names) == 1 else ', '.join(names[:-1]) + ' y ' + names[-1]
    label = 'Color' if len(o['colors']) == 1 else 'Colores'
    return (f'<ul aria-hidden="true" class="bike-card__swatches">{lis}</ul>'
            f'<span class="visually-hidden">{label}: {escape(names)}.</span>')


def card(o, eager=False):
    name = escape(o['name'])
    if o['img']:
        load = ' fetchpriority="high"' if eager else ' loading="lazy"'
        media = (f'<div class="bike-card__media">\n<img alt="Mendiz {name}"{load} height="800" '
                 f'src="{o["img"]}" width="1200"/>\n{swatches(o)}\n</div>')
    else:
        media = (f'<div class="bike-card__media bike-card__media--pending"><!-- TODO: foto pendiente -->'
                 f'<span aria-hidden="true" class="display">{name}</span></div>')
    second = (f'<a class="btn btn--secondary" href="{o["ficha"]}">Ver ficha<span class="visually-hidden"> de la {name}</span></a>\n'
              if o['ficha'] else '')
    return f'''<li class="bike-card bike-card--wide" data-type="{o['cat']}">
{media}
<div class="bike-card__body">
<div class="bike-card__top"><span class="eyebrow">{CAT_LABEL[o['cat']]} · {escape(o['type'])}</span></div>
<h3 class="bike-card__name display">{name}</h3>
<p class="bike-card__for">{escape(o['for'])}</p>
{price_html(o)}
<div class="bike-card__foot">
<div class="btn-row">
{second}<a class="btn bike-card__cta" href="ofertas-{o['slug']}.html">Ver montajes en oferta<span class="visually-hidden"> de la {name}</span></a>
</div>
</div>
</div>
</li>'''


def listing(head, header, footer):
    buttons = '<button aria-pressed="true" data-filter="todas" type="button">Todas</button>\n'
    buttons += '\n'.join(f'<button aria-pressed="false" data-filter="{k}" type="button">{v}</button>' for k, v in CATEGORIAS)
    cards = '\n'.join(card(o, i == 0) for i, o in enumerate(OFERTAS))
    main = f'''<!-- ===================================================== CABECERA -->
{crumbs(('Inicio', 'index.html'), ('Bicis', 'bicis.html'), ('Ofertas', ''))}
<header class="container page-head">
<h1 class="heading-editorial">Ofertas</h1>
<p class="muted">Bicis Mendiz de temporada anterior a precio rebajado, hasta fin de existencias. Elige el tipo de bici y entra en cada modelo para ver sus montajes en oferta.</p>
</header>
<!-- ===================================================== MODELOS EN OFERTA
         Tarjetas anchas (.bike-card--wide, .bike-list--clean), una debajo de
         otra, como en los listados de categoría. Filtro por tipo guardado en
         ?categoria= (js/main.js). Modelo genérico: sin datos de montaje.
         TODO: modelos y precios pendientes de confirmar. -->
<section aria-labelledby="ofertas-title" class="container section--flush-top offers">
<h2 class="visually-hidden" id="ofertas-title">Modelos en oferta</h2>
<div aria-label="Filtrar ofertas por tipo de bici" class="category-filter" data-filter-group=".bike-card[data-type]" data-filter-param="categoria" role="group">
{buttons}
</div>
<p aria-live="polite" class="visually-hidden" data-count=""></p>
<p class="offers__empty muted" data-empty="" hidden="">Ahora mismo no hay ofertas en este tipo de bici. <a href="ofertas.html">Ver todas las ofertas</a></p>
<ul class="bike-list bike-list--clean">
{cards}
</ul>
</section>
<!-- ===================================================== DISTRIBUIDOR -->
<section aria-labelledby="dealer-title" class="section--dark on-dark">
<div class="container dealer">
<div>
<h2 class="heading-editorial" id="dealer-title">Confirma tu talla con tu distribuidor</h2>
</div>
<div class="dealer__actions">
<p class="muted">Las unidades en oferta son limitadas: consulta disponibilidad y talla antes de decidir.</p>
<a class="btn btn--inverse btn--lg" href="distribuidores.html">Encontrar distribuidor</a>
</div>
</div>
</section>'''
    return page(head, header, footer, 'Ofertas | Mendiz',
                'Bicis Mendiz en oferta: modelos de temporada anterior de carretera, montaña, gravel y eléctricas a precio rebajado.',
                ['ofertas.css'], '', main)


def builds_grid(o):
    if not o['builds_from']:
        return ('<!-- TODO: montajes en oferta pendientes -->\n'
                '<p class="muted offers__pending">Montajes en oferta pendientes de publicar. Consulta disponibilidad con tu distribuidor.</p>')
    html = (ROOT / o['builds_from']).read_text(encoding='utf-8')
    m = re.search(r'<div class="builds builds--models">.*?</article></div>', html, re.S)
    return ('<!-- TODO: EJEMPLO. Montajes copiados de la ficha actual; '
            'sustituir por los montajes y precios en oferta. -->\n' + m.group(0))


def model_page(o, head, header, footer):
    name = escape(o['name'])
    main = f'''{crumbs(('Inicio', 'index.html'), ('Ofertas', 'ofertas.html'), (o['name'], ''))}
<header class="container page-head">
<span class="eyebrow">{CAT_LABEL[o['cat']]} · Oferta</span>
<h1 class="heading-editorial">{name} en oferta</h1>
<p class="muted">Desde <strong>{o['price']}</strong> <s><span class="visually-hidden">antes </span>{o['was']}</s>. Montajes de temporada anterior, hasta fin de existencias.</p>
</header>
<!-- ===================================================== MONTAJES EN OFERTA
         Solo la rejilla de montajes (tarjetas compactas .build-card, como en
         #montajes de las fichas; sin colores). -->
<section aria-labelledby="montajes-title" class="section section--flush-top" id="montajes">
<div class="container">
<h2 class="visually-hidden" id="montajes-title">Montajes de la {name} en oferta</h2>
{builds_grid(o)}
<p class="muted catalog-price-note">Precios orientativos: confirma disponibilidad, talla y precio final con tu distribuidor.</p>
</div>
</section>'''
    return page(head, header, footer, f'{o["name"]} en oferta | Mendiz',
                f'Montajes en oferta de la Mendiz {o["name"]}: precio rebajado de temporada anterior, hasta fin de existencias.',
                ['product.css', 'catalogo-producto.css', 'ofertas.css'],
                f' class="catalog-product" data-catalog-model="{o["slug"]}"', main)


def main():
    head, header, footer = shell()
    (ROOT / 'ofertas.html').write_text(listing(head, header, footer), encoding='utf-8')
    print('✓ ofertas.html')
    for o in OFERTAS:
        (ROOT / f'ofertas-{o["slug"]}.html').write_text(model_page(o, head, header, footer), encoding='utf-8')
        print(f'✓ ofertas-{o["slug"]}.html')


if __name__ == '__main__':
    main()
