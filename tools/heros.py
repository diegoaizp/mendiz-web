#!/usr/bin/env python3
"""
MENDIZ — Imágenes de bici recortadas (heros)

Fuente única de las bicis recortadas de la web:

    IMAGENES MENDIZ/MODELOS/<MODELO>/Heros/*.png          (3000 × 2000, con sombra)
    IMAGENES MENDIZ/MODELOS/F14/Heros/MONTAJES/*.png      (un color por montaje F14)

Genera, desde la carpeta del proyecto:

    python3 tools/heros.py

  · assets/img/<m>/<m>-hero.webp        2500 × 1667  ficha (escenario de colores,
                                                     tarjetas de montaje) y home
  · assets/img/<m>/<m>-hero-1200.webp   1200 × 800   imagen del mega menú
  · assets/img/<m>/<m>-card-1200.webp   1200 × 800   cards de listados, OFY, ofertas
  · assets/img/<m>/heros/<png>.webp     2500 × 1667  colores extra del escenario
  · assets/img/f14-sl-slp/montajes/<png>.webp  1600 × 1067  tarjetas de montaje F14

y reescribe en los HTML las rutas que antes apuntaban a configuraciones/.
Los -hero y -hero-1200 llevan la bici con el mismo encuadre de antes (escala
0,782, suelo a 1428 px); las cards y los montajes F14 usan el lienzo entero.
Las imágenes MPL (assets/img/mpl) no salen de aquí.
"""
import re
import shutil
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT.parent.parent / 'IMAGENES MENDIZ' / 'MODELOS'
IMG = ROOT / 'assets' / 'img'
ARCHIVO = ROOT / '_archivo' / '2026-11-09' / 'heros-anteriores'

# slug web → (carpeta en MODELOS, hero principal, {valor color escenario: png extra})
MODELOS = {
    'ef21':       ('EF21', 'EF21-hero-azul.png', {'blanco-dorado': 'EF21-hero-blanco-serie-lateral.png'}),
    'ef4':        ('EF4', 'EF4-hero-rojo-negro.png', {}),
    'eg21':       ('EG21', 'EG21-hero-arena.png', {}),
    'eg4':        ('EG4', 'EG4-hero-arena-negro.png', {}),
    'ex41':       ('EX41', 'EX41-hero-gris.png', {}),
    'f12-sl':     ('F12', 'F12-hero-azul.png', {}),
    'f14-sl-slp': ('F14', 'F14-hero-blanco.png', {'negro': 'MONTAJES/F14SL.05-hero-negro.png'}),
    'f9-sl':      ('F9', 'F9-hero-naranja-negro.png', {'arena': 'F9-hero-crema-serie-lateral.png'}),
    'g11am':      ('G11', 'G11-hero-verde.png', {'verde-ingles': 'G11-hero-verde-ingles-oro-montaje2-lateral.png'}),
    'g12-sl':     ('G12', 'G12-hero-marron.png', {}),
    'g4-icr':     ('G4', 'G4-hero-arena.png', {}),
    'tt10':       ('TT10', 'TT10-hero-rosa-negro.png', {}),
    'x10':        ('X10', 'X10-hero-blanco.png', {}),
    'x10-boost':  ('X10-BOOST', 'X10-BOOST-hero-negro.png', {}),
    'x21-sl':     ('X21', 'X21-hero-rojo.png', {'antracita': 'X21-hero-gris-lateral.png'}),
    'x40-sl-icr': ('X40', 'X40-hero-gris.png', {}),
}
# Colores del escenario sin equivalente en Heros (se quedan con su imagen de
# configuraciones/ hasta que haya PNG): ef4 negro-blanco, g4-icr verde,
# x40-sl-icr cobre-y-plata y rojo-y-plata.

# Montajes F14: alt de la tarjeta en f14-sl-slp.html → color de la ruta antigua → PNG
F14_MONTAJES = {
    'negro': 'F14SL.05-hero-negro.png',
    'blanco': 'F14SL.04-hero-blanco.png',
    'arena': 'F14SL.05C-hero-arena.png',
    'rojo': 'F14SL.04C-hero-rojo.png',
    'fucsia': 'F14SL.02C-hero-fucsia.png',
    'turquesa': 'F14SL.03C-hero-turquesa.png',
    'verde-pino': 'F14SLP.01C-hero-verde-pino.png',
    'azul-metalizado': 'F14SLP.00C-hero-azul-metalizado.png',
    'rosa-metalizado': 'F14SLP.01SC.Ligth-hero-rosa-metalizado.png',
    'naranja-sunset': 'F14SLP.00SC.Ligth-hero-naranja-sunset.png',
    'amarillo': 'F14SLP.00HY-hero-amarillo.png',
    'camaleon-cian-purpura': 'F14SLP.00BR-hero-camaleon-cian-purpura.png',
}

FICHAS = ['ef21', 'ef4', 'eg21', 'eg4', 'ex41', 'f12-sl', 'f14-sl-slp', 'f9-sl', 'g11am',
          'g12-sl', 'g4-icr', 'tt10', 'x10', 'x10-boost', 'x21-sl', 'x40-sl-icr']

ESCALA, SUELO_SRC, SUELO = 0.782, 1709, 1428  # encuadre de las -hero.webp


def nombre_web(png):
    """F14SLP.01SC.Ligth-hero-rosa-metalizado.png → f14slp-01sc-ligth-hero-rosa-metalizado.webp"""
    return re.sub(r'[^a-z0-9]+', '-', Path(png).stem.lower()).strip('-') + '.webp'


def guardar(im, dest):
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and not (ARCHIVO / dest.relative_to(IMG)).exists():
        (ARCHIVO / dest.relative_to(IMG)).parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(dest, ARCHIVO / dest.relative_to(IMG))
    im.save(dest, 'WEBP', quality=86, method=6)


def encuadre_hero(src, w=2500, h=1667):
    s = ESCALA * w / 2500
    bici = src.resize((round(src.width * s), round(src.height * s)), Image.LANCZOS)
    lienzo = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    x = round(w / 2 - src.width / 2 * s)
    y = round(SUELO * w / 2500 - SUELO_SRC * s)
    lienzo.alpha_composite(bici, (x, y))
    return lienzo


def lienzo_entero(src, w, h):
    return src.resize((w, h), Image.LANCZOS)


def abrir(carpeta, png):
    im = Image.open(SRC / carpeta / 'Heros' / png).convert('RGBA')
    assert im.size == (3000, 2000), (png, im.size)
    return im


def imagenes():
    for slug, (carpeta, principal, extras) in MODELOS.items():
        src = abrir(carpeta, principal)
        hero = encuadre_hero(src)
        guardar(hero, IMG / slug / f'{slug}-hero.webp')
        guardar(hero.resize((1200, 800), Image.LANCZOS), IMG / slug / f'{slug}-hero-1200.webp')
        guardar(lienzo_entero(src, 1200, 800), IMG / slug / f'{slug}-card-1200.webp')
        for png in extras.values():
            guardar(encuadre_hero(abrir(carpeta, png)), IMG / slug / 'heros' / nombre_web(png))
        print(f'{slug}: {principal}' + (f' + {len(extras)} color(es)' if extras else ''))
    for png in F14_MONTAJES.values():
        src = abrir('F14', f'MONTAJES/{png}')
        guardar(lienzo_entero(src, 1600, 1067), IMG / 'f14-sl-slp' / 'montajes' / nombre_web(png))
    print(f'f14-sl-slp: {len(F14_MONTAJES)} montajes')


def rutas():
    for slug in FICHAS:
        paginas = [ROOT / f'{slug}.html'] + ([ROOT / 'ofertas-x21-sl.html'] if slug == 'x21-sl' else [])
        carpeta, _, extras = MODELOS[slug]
        for pagina in paginas:
            html = original = pagina.read_text(encoding='utf-8')
            # Escenario de colores: color extra → PNG de Heros
            for valor, png in extras.items():
                html = re.sub(
                    r'(data-src=")[^"]*("[^>]*value="' + re.escape(valor) + r'")',
                    rf'\g<1>assets/img/{slug}/heros/{nombre_web(png)}\2', html)
            # Tarjetas de montaje con la imagen de referencia del modelo → hero principal
            html = re.sub(
                r'(<img alt="[^"]*imagen de referencia del modelo"[^>]*src=")[^"]*(")',
                rf'\g<1>assets/img/{slug}/{slug}-hero.webp\2', html)
            if slug == 'f14-sl-slp':
                for color, png in F14_MONTAJES.items():
                    html = re.sub(
                        r'(<img alt="Mendiz F14S[^"]*"[^>]*src=")assets/img/f14-sl-slp/configuraciones/'
                        r'mendiz-f14sl-slp-' + re.escape(color) + r'-transparente-2500\.webp(")',
                        rf'\g<1>assets/img/f14-sl-slp/montajes/{nombre_web(png)}\2', html)
            if html != original:
                pagina.write_text(html, encoding='utf-8')
                print('rutas:', pagina.name)


if __name__ == '__main__':
    imagenes()
    rutas()
