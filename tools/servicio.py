#!/usr/bin/env python3
"""
MENDIZ — Servicio y artículos de ayuda

Genera a partir de ARTICULOS (abajo):

  · servicio.html          página de ayuda, asistencia y soporte: tarjetas del
                           estilo «Cada Mendiz es única» de la ficha F14
                           (.topics: foto 3:2 + título + flecha), una por artículo;
  · ayuda-<slug>.html      un artículo por tarjeta, con la plantilla de noticia
                           del blog (css/blog.css, js/blog.js) y JSON-LD Article.

ESTRUCTURA INICIAL: los textos de los artículos son un guion de apartados
pendiente de redactar y revisar con Mendiz. Para cambiar títulos, fotos o
apartados, edita ARTICULOS y ejecuta desde la carpeta del proyecto:

    python3 tools/servicio.py
    python3 tools/header.py      # header y página actual en las páginas nuevas

Texto: no decir que las bicis se fabrican en Vitoria ni que Mendiz diseña toda
la gama (ver bloque «Cada Mendiz es única»).
"""
from html import escape
from pathlib import Path
import json
import re

try:
    from PIL import Image
except ImportError:
    Image = None

ROOT = Path(__file__).resolve().parent.parent
BASE = ROOT / 'carretera.html'                              # página de listado
ARTICLE_BASE = ROOT / 'noticia-laboral-kutxa-el-salvador.html'  # plantilla de artículo
UPDATED = ('2026-11-07', '7 nov 2026', '7 de noviembre de 2026')
PENDING = 'Contenido pendiente de redactar y revisar.'

# --------------------------------------------------------------------------
# Datos
# --------------------------------------------------------------------------
ARTICULOS = [
    {
        'slug': 'como-elegir-tu-bici', 'title': 'Cómo elegir tu bici', 'topic': 'Elegir',
        'lead': 'Terreno, tipo de salida, material y asistencia: las preguntas que te llevan a tu Mendiz.',
        'img': 'assets/img/compartido/terrenos/gravel.webp',
        'alt': 'Dos ciclistas de gravel con bicicletas Mendiz junto a un lago',
        'sections': [
            ('¿Por dónde vas a rodar?', ['Carretera', 'Asfalto y caminos', 'Montaña']),
            ('¿Qué salidas haces?', []),
            ('Carbono o aluminio', []),
            ('Con o sin asistencia eléctrica', []),
            ('Pide consejo a tu distribuidor', []),
        ],
        'cta': ('Responde cinco preguntas y te recomendamos una Mendiz', '¿Qué Mendiz es para ti?', 'que-mendiz-es-para-ti.html'),
    },
    {
        'slug': 'como-elegir-tu-talla', 'title': 'Cómo elegir tu talla', 'topic': 'Elegir',
        'lead': 'Altura, entrepierna y geometría: cómo acertar con la talla y el ajuste de tu bici.',
        'img': 'assets/img/compartido/ajuste-bici.webp',
        'alt': 'Un técnico mide con una cinta métrica la altura del sillín de una Mendiz F14 en el taller',
        'sections': [
            ('Tu altura y tu entrepierna', []),
            ('Qué dice la geometría', ['Stack y reach', 'Entre dos tallas']),
            ('El ajuste con tu distribuidor', []),
        ],
        'cta': ('Prueba tu talla y ajusta tu posición cerca de ti', 'Buscar distribuidor', 'distribuidores.html'),
    },
    {
        'slug': 'montada-una-a-una', 'title': 'Montada una a una', 'topic': 'Tu Mendiz',
        'lead': 'Cómo se monta y se revisa cada Mendiz antes de llegar a tu distribuidor.',
        'img': 'assets/img/compartido/montada-una-a-una.webp',
        'alt': 'Manos de un mecánico apretando con una llave Allen la potencia de una bici de carretera en el taller de montaje',
        'sections': [
            ('Cómo se monta tu bici', []),
            ('Qué se revisa antes de enviarla', []),
            ('Cómo te llega', []),
        ],
        'cta': None,
    },
    {
        'slug': 'testeada-a-fondo', 'title': 'Testeada a fondo', 'topic': 'Tu Mendiz',
        'lead': 'Las pruebas por las que pasa una Mendiz y lo que significan para ti.',
        'img': 'assets/img/compartido/testeada-a-fondo.webp',
        'alt': 'Ciclista a toda velocidad con una Mendiz negra en una carretera entre árboles',
        'sections': [
            ('Qué se prueba', []),
            ('En el laboratorio y en la carretera', []),
            ('Qué significa para ti', []),
        ],
        'cta': None,
    },
    {
        'slug': 'garantia', 'title': 'Garantía', 'topic': 'Soporte',
        'lead': 'Qué cubre la garantía de tu Mendiz y cómo tramitarla con tu distribuidor.',
        'img': 'assets/img/compartido/terrenos/montana-alt.webp',
        'alt': 'Ciclista de montaña con una Mendiz por un sendero',
        'sections': [
            ('Qué cubre', []),
            ('Cómo tramitarla', []),
            ('Qué necesitas', []),
        ],
        'cta': ('Tu distribuidor tramita la garantía', 'Buscar distribuidor', 'distribuidores.html'),
    },
    {
        'slug': 'mantenimiento', 'title': 'Mantenimiento básico', 'topic': 'Soporte',
        'lead': 'Lo que conviene revisar antes de cada salida, cada mes y una vez al año.',
        'img': 'assets/img/compartido/terrenos/carretera-alt.webp',
        'alt': 'Ciclistas en carretera con bicicletas Mendiz',
        'sections': [
            ('Antes de cada salida', []),
            ('Cada mes', []),
            ('La revisión anual', []),
            ('Manual de usuario', []),
        ],
        'cta': ('La revisión anual, con tu distribuidor', 'Buscar distribuidor', 'distribuidores.html'),
    },
]

ARROW = ('<svg aria-hidden="true" class="icon-arrow" fill="none" stroke="currentColor" stroke-width="1.4" '
         'viewbox="0 0 12 12"><path d="M1 6h10M7 2l4 4-4 4"></path></svg>')
ARROW_BACK = ('<svg aria-hidden="true" class="icon-arrow icon-arrow--back" fill="none" stroke="currentColor" '
              'stroke-width="1.4" viewbox="0 0 12 12"><path d="M11 6H1M5 2 1 6l4 4"></path></svg>')


def size(src):
    if Image is None:
        return ''
    with Image.open(ROOT / src) as im:
        return f' height="{im.height}" width="{im.width}"'


def parts(path):
    html = path.read_text(encoding='utf-8')
    head = html[:html.index('</head>')]
    head = re.sub(r'<script type="application/ld\+json">.*?</script>\n?', '', head, flags=re.S)
    header = re.search(r'<a class="skip-link".*?</header>', html, re.S).group(0)
    footer = html[html.index('<!-- ===================================================== FOOTER'):]
    return head, header, footer


def page(base, title, desc, css, main, ld=None):
    head, header, footer = parts(base)
    head = re.sub(r'<link href="css/catalogo-producto\.css" rel="stylesheet"/>', '', head)
    head = re.sub(r'<title>.*?</title>', f'<title>{escape(title)}</title>', head)
    head = re.sub(r'<meta content="[^"]*" name="description"/>', f'<meta content="{escape(desc)}" name="description"/>', head)
    links = ''.join(f'\n<link href="css/{c}" rel="stylesheet"/>' for c in css)
    script = (f'\n<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False, separators=(",", ":"))}</script>'
              if ld else '')
    return f'''{head}{links}{script}
</head>
<body>
{header}
<main id="main">
<!-- Generado con tools/servicio.py: cambia los datos allí y vuelve a ejecutarlo. -->
{main}
</main>
{footer}'''


def card(a, heading='h3'):
    return f'''<li class="topics__item">
<a class="topics__link" href="ayuda-{a['slug']}.html">
<figure class="media topics__media"><img alt="{escape(a['alt'])}" loading="lazy" src="{a['img']}"{size(a['img'])}/></figure>
<span class="topics__head"><span class="heading-card topics__title">{escape(a['title'])}</span><span aria-hidden="true" class="topics__arrow material-symbols-outlined">arrow_forward</span></span>
<span class="topics__note">{escape(a['lead'])}</span>
</a>
</li>'''


def servicio():
    cards = '\n'.join(card(a) for a in ARTICULOS)
    main = f'''<nav aria-label="Migas de pan" class="container breadcrumb">
<ol><li><a href="index.html">Inicio</a></li><li><span aria-current="page">Servicio</span></li></ol>
</nav>
<header class="container page-head">
<h1 class="heading-editorial">Servicio y ayuda</h1>
<p class="muted">Guías para elegir, ajustar y cuidar tu Mendiz, y todo lo que necesitas después de la compra. Tu distribuidor te acompaña en cada paso.</p>
</header>
<!-- ===================================================== GUÍAS DE AYUDA
         Tarjetas del estilo «Cada Mendiz es única» de la ficha F14 (.topics):
         foto 3:2, título y flecha al pasar el ratón; cada una enlaza a su
         artículo (ayuda-*.html, formato blog). Estructura inicial: contenidos pendientes de revisión. -->
<section aria-labelledby="guias-title" class="section section--flush-top topics" id="guias">
<div class="container">
<h2 class="heading-section topics__heading" id="guias-title">Guías de ayuda</h2>
<ul class="topics__grid">
{cards}
</ul>
</div>
</section>
<!-- ===================================================== TU MENDIZ / CONTACTO -->
<section aria-labelledby="tu-mendiz-title" class="section section--flush-top" id="tu-mendiz">
<div class="container service-after">
<h2 class="heading-section" id="tu-mendiz-title">Después de la compra</h2>
<ul class="service-links">
<li><a class="service-links__item" href="ayuda-garantia.html"><span><strong>Garantía</strong><small>Qué cubre y cómo tramitarla</small></span>{ARROW}</a></li>
<li><a class="service-links__item" href="ayuda-mantenimiento.html"><span><strong>Mantenimiento y manual</strong><small>Ajustes, uso y cuidado de tu bici</small></span>{ARROW}</a></li>
<li id="preguntas"><a class="service-links__item" href="que-mendiz-es-para-ti.html"><span><strong>¿Qué Mendiz es para ti?</strong><small>Te orientamos según cómo y por dónde ruedas</small></span>{ARROW}</a></li>
<li><a class="service-links__item" href="distribuidores.html"><span><strong>Distribuidores</strong><small>Prueba tu talla y tramita tu pedido cerca de ti</small></span>{ARROW}</a></li>
<!-- TODO: Contacto y Preguntas frecuentes, pendientes de página -->
</ul>
</div>
</section>
<!-- ===================================================== DISTRIBUIDOR -->
<section aria-labelledby="dealer-title" class="dealer-band" id="distribuidor">
<img alt="Dos ciclistas rodando juntos por una carretera de montaña con bicicletas Mendiz" class="dealer-band__img" height="1600" loading="lazy" src="assets/img/f14-sl-slp/f14_y_f12_paseo_de_amigos2_1.webp" width="2400"/>
<div class="container dealer-band__body">
<h2 class="heading-section dealer-band__title" id="dealer-title">Encuentra tu distribuidor</h2>
<a class="btn btn--inverse btn--lg" href="distribuidores.html">Buscar distribuidor</a>
</div>
</section>'''
    return page(BASE, 'Servicio y ayuda | Mendiz',
                'Ayuda, asistencia y soporte Mendiz: cómo elegir tu bici y tu talla, garantía, mantenimiento y distribuidores.',
                ['servicio.css'], main)


def article(a):
    body = []
    for h2, h3s in a['sections']:
        body.append(f'<h2>{escape(h2)}</h2>')
        body.append(f'<p class="service-pending">{PENDING}</p>')
        for h3 in h3s:
            body.append(f'<h3>{escape(h3)}</h3>')
            body.append(f'<p class="service-pending">{PENDING}</p>')
    if a['cta']:
        text, label, href = a['cta']
        body.append(f'<p class="article-note">{escape(text)}: <a href="{href}">{escape(label)}</a>.</p>')
    others = [o for o in ARTICULOS if o is not a][:3]
    related = '\n'.join(f'''<article class="post-card">
<div class="post-card__media"><img alt="" loading="lazy" src="{o['img']}"{size(o['img'])}/></div>
<p class="post-meta"><span class="post-meta__category">{escape(o['topic'])}</span><span>Ayuda</span></p>
<h3 class="post-card__title"><a href="ayuda-{o['slug']}.html">{escape(o['title'])}</a></h3>
<p class="post-card__excerpt">{escape(o['lead'])}</p>
</article>''' for o in others)
    d_iso, d_short, d_long = UPDATED
    main = f'''<!-- ===================================================== ARTÍCULO DE AYUDA
         Plantilla de noticia del blog (css/blog.css; compartir en js/blog.js).
         Guion de apartados: TODO redactar y revisar con Mendiz (SEO). -->
<article class="article" aria-labelledby="article-title">
<nav aria-label="Migas de pan" class="container breadcrumb">
<ol><li><a href="index.html">Inicio</a></li><li><a href="servicio.html">Servicio</a></li><li><span aria-current="page">{escape(a['title'])}</span></li></ol>
</nav>
<header class="container article-head">
<p class="post-meta"><span class="post-meta__category">{escape(a['topic'])}</span><time datetime="{d_iso}">{d_short}</time></p>
<h1 class="heading-editorial article-head__title" id="article-title">{escape(a['title'])}</h1>
<p class="article-head__lead">{escape(a['lead'])}</p>
</header>
<figure class="container article-hero">
<div class="article-hero__media"><img alt="{escape(a['alt'])}" fetchpriority="high" src="{a['img']}"{size(a['img'])}/></div>
</figure>
<div class="container article-layout">
<aside aria-label="Sobre este artículo" class="article-aside">
<dl class="article-facts">
<div><dt>Actualizado</dt><dd><time datetime="{d_iso}">{d_long}</time></dd></div>
<div><dt>Tema</dt><dd>{escape(a['topic'])}</dd></div>
</dl>
<div class="article-share" data-share="">
<button class="article-share__btn" data-share-copy="" type="button"><span aria-hidden="true" class="material-symbols-outlined">link</span><span data-share-label="">Copiar enlace</span></button>
<button class="article-share__btn" data-share-native="" hidden="" type="button"><span aria-hidden="true" class="material-symbols-outlined">ios_share</span><span>Compartir</span></button>
</div>
</aside>
<div class="article-body">
{chr(10).join(body)}
<div class="article-end">
<a class="link-arrow" href="servicio.html">{ARROW_BACK} Volver a Servicio</a>
</div>
</div>
</div>
</article>
<!-- ===================================================== OTROS ARTÍCULOS -->
<section aria-labelledby="related-title" class="container article-related">
<div class="section-head">
<div class="section-head__text"><h2 class="heading-section" id="related-title">Otros artículos de ayuda</h2></div>
<a class="link-arrow" href="servicio.html">Ver todas las guías {ARROW}</a>
</div>
<div class="post-grid">
{related}
</div>
</section>'''
    ld = {'@context': 'https://schema.org', '@type': 'Article', 'headline': a['title'],
          'description': a['lead'], 'dateModified': d_iso, 'image': [a['img']],
          'author': {'@type': 'Organization', 'name': 'Mendiz'},
          'publisher': {'@type': 'Organization', 'name': 'Mendiz'}}
    return page(ARTICLE_BASE, f'{a["title"]} | Servicio | Mendiz', a['lead'], ['servicio.css'], main, ld)


def main():
    (ROOT / 'servicio.html').write_text(servicio(), encoding='utf-8')
    print('✓ servicio.html')
    for a in ARTICULOS:
        (ROOT / f'ayuda-{a["slug"]}.html').write_text(article(a), encoding='utf-8')
        print(f'✓ ayuda-{a["slug"]}.html')


if __name__ == '__main__':
    main()
