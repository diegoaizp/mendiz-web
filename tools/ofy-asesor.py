#!/usr/bin/env python3
"""
MENDIZ — datos del asesor «Configura tu Mendiz» (only-for-you-configura.html)

Lee los montajes de los siete modelos Only For You y escribe
js/ofy-montajes.js (window.MENDIZ_OFY), que usa js/ofy-asesor.js.

  · F14 SL-SLP: js/f14-montajes.js (los mismos datos que el configurador).
  · El resto: la tabla «Elige tu montaje» de su ficha (<article class="build-card">).

Cada montaje lleva el valor de los diez niveles del árbol de decisión:
  1 tipo · 2 disciplina · 3 modalidad · 4 material · 5 eje · 6 gama ·
  7 versión · 8 horquilla · 9 transmisión · 10 ruedas
Los niveles 1–6 salen del modelo (MODELS); 7–10, del montaje.

Uso:  python3 tools/ofy-asesor.py
Vuelve a ejecutarlo si cambian los montajes de una ficha o js/f14-montajes.js.
Lo marcado «A VALIDAR» son datos que no están en las fichas (ejes, material de
algunas ruedas): confirmar con Mendiz.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'js' / 'ofy-montajes.js'

# Modelos -----------------------------------------------------------------------
# Textos e imágenes de las fichas de listado (los mismos que js/que-mendiz.js).
# eje: A VALIDAR con Mendiz (no figura en las fichas).
# color: color de serie con el que se abre el configurador (solo la F14 tiene
# colores en js/f14-colores.js).
MODELS = {
    'f14-sl-slp': dict(
        name='F14 SL-SLP', tag='Carretera · Rendimiento', claim='Una F14 para todo tu recorrido.',
        text='Para entrenar y competir en recorridos variados, con subidas, llanos y bajadas.',
        href='f14-sl-slp.html', img='assets/img/f14-sl-slp/f14-sl-slp-card-1200.webp', alt='Mendiz F14 SL-SLP · Blanco',
        tipo='muscular', disciplina='carretera', modalidad='rendimiento', material='carbono', eje='pasante',
        color='blanco'),
    'f12-sl': dict(
        name='F12 SL', tag='Carretera · Aero', claim='Una carretera con vocación aero.',
        text='Para rodar rápido en llano y en grupo, con un cuadro de perfiles aerodinámicos.',
        href='f12-sl.html', img='assets/img/f12-sl/f12-sl-card-1200.webp', alt='Mendiz F12 SL · Azul metalizado',
        tipo='muscular', disciplina='carretera', modalidad='aero', material='carbono', eje='pasante'),
    'f9-sl': dict(
        name='F9 SL', tag='Carretera · Gran fondo', claim='Gran fondo a tu ritmo.',
        text='Para largas jornadas y marchas cicloturistas, con una posición más cómoda.',
        href='f9-sl.html', img='assets/img/f9-sl/f9-sl-card-1200.webp', alt='Mendiz F9 SL · Naranja / Negro',
        tipo='muscular', disciplina='carretera', modalidad='gran-fondo', material='carbono', eje='pasante'),
    'tt10': dict(
        name='TT10', tag='Carretera · Triatlón', claim='Diseñada para rodar acoplado.',
        text='Para triatlón y contrarreloj, con una posición acoplada sobre el manillar.',
        href='tt10.html', img='assets/img/tt10/tt10-card-1200.webp', alt='Mendiz TT10 · Rosa / Negro',
        tipo='muscular', disciplina='carretera', modalidad='triatlon', material='carbono', eje='pasante'),
    'g12-sl': dict(
        name='G12 SL', tag='Gravel · Racing · Carbono', claim='Ritmo en las pistas. Libertad en la ruta.',
        text='Para competir en gravel y combinar caminos con tramos de carretera.',
        href='g12-sl.html', img='assets/img/g12-sl/g12-sl-card-1200.webp', alt='Mendiz G12 SL · Marrón Tierra',
        tipo='muscular', disciplina='gravel', modalidad='gravel-racing', material='carbono', eje='pasante'),
    'x40-sl-icr': dict(
        name='X40 SL-ICR', tag='Montaña · Doble suspensión', claim='Sube con ritmo. Baja con control.',
        text='Para cross country y rutas donde buscas suspensión delantera y trasera.',
        href='x40-sl-icr.html', img='assets/img/x40-sl-icr/x40-sl-icr-card-1200.webp', alt='Mendiz X40 SL-ICR · Gris',
        tipo='muscular', disciplina='montana', modalidad='xc', material='carbono', eje='boost'),
    'ex41': dict(
        name='EX41', tag='Eléctrica · Montaña', claim='Más montaña en cada salida.',
        text='Doble suspensión, cuadro de carbono y asistencia Polini con batería de 880 Wh.',
        href='ex41.html', img='assets/img/ex41/ex41-card-1200.webp', alt='Mendiz EX41 · Gris',
        tipo='electrica', disciplina='montana', modalidad='e-mtb', material='carbono', eje='boost'),
}

# Transmisión: nombre limpio a partir del cambio (en mayúsculas). El primero
# que encaja gana, así que los más concretos van antes.
GROUPS = [
    ('RIVAL XPLR', 'SRAM Rival XPLR AXS E1 1×13'),
    ('RED XPLR', 'SRAM RED XPLR AXS E1 1×13'),
    ('EKAR', 'Campagnolo Ekar GT 1×13'),
    ('GRX825', 'Shimano GRX 825 Di2 2×12'),
    ('GRX 717', 'Shimano GRX Di2 1×12'),
    ('GRX820 1X', 'Shimano GRX 820 1×12'),
    ('GRX820 2X', 'Shimano GRX 820 2×12'),
    ('GRX400', 'Shimano GRX 400'),
    ('105 DI2', 'Shimano 105 Di2'),
    ('105', 'Shimano 105'),
    ('ULTEGRA', 'Shimano Ultegra Di2'),
    ('DURA', 'Shimano Dura-Ace Di2'),
    ('RIVAL', 'SRAM Rival AXS E1'),
    ('FORCE', 'SRAM Force AXS E1'),
    ('RED', 'SRAM RED AXS E1'),
    ('RECORD', 'Campagnolo Super Record'),
    ('SLX', 'Shimano SLX 1×12'),
    ('GX EAGLE', 'SRAM GX Eagle'),
    ('XT', 'Shimano XT 1×12'),
]

# Ruedas: nombre limpio y material (None = sin dato; A VALIDAR).
WHEELS = {
    'DT SWISS A-1800': ('DT Swiss A-1800', 'aluminio'),
    'VISION TC45 CARBON': ('Vision TC45 Carbon', 'carbono'),
    'FULCRUM SONIQ 42/47': ('Fulcrum Soniq 42/47', 'carbono'),
    'FULCRUM SONIQ': ('Fulcrum Soniq', 'carbono'),
    'CAMPAGNOLO HYPERON': ('Campagnolo Hyperon', 'carbono'),
    'CAMPAGNOLO BORA ULTRA TW': ('Campagnolo Bora Ultra TW', 'carbono'),
    'SCOPE ARTECH 4': ('Scope Artech 4', 'carbono'),
    'MAVIC COSMIC SL 65': ('Mavic Cosmic SL 65', 'carbono'),
    'MAVIC ALLROAD ALUM': ('Mavic Allroad', 'aluminio'),
    'MAVIC ALLROAD S CARBON': ('Mavic Allroad S Carbon', 'carbono'),
    'FULCRUM LITE GR': ('Fulcrum Lite GR', None),
    'CAMPG. ZONA GT': ('Campagnolo Zonda GT', 'aluminio'),
    'MAVIC CROSSRIDE': ('Mavic Crossride', 'aluminio'),
    'DT SWISS X 1900': ('DT Swiss X 1900', 'aluminio'),
    'MAVIC E-CROSSRIDE MULLET': ('Mavic E-Crossride (mullet)', 'aluminio'),
    'FULCRUM E-METAL 500 DEL Y E-FIRE 500 TRAS MULLET': ('Fulcrum E-Metal 500 / E-Fire 500 (mullet)', 'aluminio'),
}

FORKS = {
    'ROCK SHOX RECON RL 100MM': 'RockShox Recon RL 100 mm',
    'FOX FLOAT RHYTHM 32 100MM': 'Fox Float Rhythm 32 100 mm',
    'ROCK SHOX SID SL 100MM': 'RockShox SID SL 100 mm',
    'ROCK SHOX 35G RL 150MM': 'RockShox 35 Gold RL 150 mm',
    'FOX PERFORMANCE 36 150MM': 'Fox 36 Performance 150 mm',
}


def slug(s):
    s = s.lower().replace('×', 'x')
    for a, b in (('á', 'a'), ('é', 'e'), ('í', 'i'), ('ó', 'o'), ('ú', 'u'), ('ñ', 'n')):
        s = s.replace(a, b)
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')


def group_of(cambio, cassette=''):
    up = cambio.upper()
    for key, label in GROUPS:
        if key in up:
            # X40: el XT con cassette SLX es otro montaje que el XT completo
            if label.startswith('Shimano XT') and 'SLX' in cassette.upper():
                return 'Shimano XT · cassette SLX'
            return label
    raise SystemExit(f'Transmisión sin nombre: {cambio!r} (añádela a GROUPS)')


def wheels_of(raw):
    key = ' '.join(raw.upper().split())
    if key not in WHEELS:
        raise SystemExit(f'Ruedas sin nombre: {raw!r} (añádelas a WHEELS)')
    return WHEELS[key]


def fork_of(raw):
    if not raw:
        return 'Carbono'
    key = ' '.join(raw.upper().split())
    if key not in FORKS:
        raise SystemExit(f'Horquilla sin nombre: {raw!r} (añádela a FORKS)')
    return FORKS[key]


def gama_of(model, code):
    if MODELS[model]['tipo'] == 'electrica':
        return None                          # la EX41 no tiene gama SL/SLP
    return 'slp' if re.match(r'^[A-Z0-9]+SLP\.', code) else 'sl'


def version_of(model, code):
    if model == 'f14-sl-slp':
        return 'light' if 'Ligth' in code or 'Light' in code else 'estandar'
    if model == 'g12-sl':
        if 'FLAT' in code:
            return 'manillar-plano'
        if '.R' in code:
            return 'carretera'
        if 'X2' in code:
            return '2x'
        return '1x'                          # X1 y la Ekar 1×13 (G12SL.00)
    return None


def build(model, code, name, price, specs):
    m = MODELS[model]
    grupo = group_of(specs.get('Cambio', ''), specs.get('Cassette', ''))
    wheel, wheel_mat = wheels_of(specs['Ruedas'])
    fork = fork_of(specs.get('Horquilla'))
    return {
        'modelo': model, 'code': code, 'name': name, 'precio': price,
        'tipo': m['tipo'], 'disciplina': m['disciplina'], 'modalidad': m['modalidad'],
        'material': m['material'], 'eje': m['eje'], 'gama': gama_of(model, code),
        'version': version_of(model, code),
        'horquilla': slug(fork), 'horquillaLabel': fork,
        'transmision': slug(grupo), 'transmisionLabel': grupo,
        'ruedas': slug(wheel), 'ruedasLabel': wheel, 'ruedasMaterial': wheel_mat,
        'specs': {k: specs[k] for k in ('Cambio', 'Bielas', 'Cassette', 'Frenos', 'Horquilla', 'Motor', 'Batería') if specs.get(k)},
    }


def from_f14():
    src = (ROOT / 'js' / 'f14-montajes.js').read_text(encoding='utf-8')
    data = json.loads(src[src.index('{'):src.rindex('}') + 1])
    out = []
    for b in data['montajes']:
        specs = dict(b['componentes'])
        specs['Cambio'] = b['grupo']
        out.append(build('f14-sl-slp', b['code'], b['name'], b['precio'], specs))
    return out


def from_page(model):
    s = (ROOT / f'{model}.html').read_text(encoding='utf-8')
    out = []
    for a in re.findall(r'<article class="build-card">(.*?)</article>', s, re.S):
        code = html.unescape(re.search(r'build-card__model">(.*?)<', a).group(1)).strip()
        det = re.search(r'<dl class="specs">(.*?)</dl>', a, re.S).group(1)
        specs = {html.unescape(k): html.unescape(v).strip() for k, v in re.findall(r'<dt>(.*?)</dt><dd>(.*?)</dd>', det)}
        price = int(re.sub(r'\D', '', re.search(r'build-card__price"><strong>(.*?)<', a).group(1)))
        out.append(build(model, code, code, price, specs))
    if not out:
        raise SystemExit(f'{model}.html: no hay montajes')
    return out


def main():
    builds = from_f14()
    for model in MODELS:
        if model != 'f14-sl-slp':
            builds += from_page(model)
    models = {k: {f: v[f] for f in ('name', 'tag', 'claim', 'text', 'href', 'img', 'alt') + (('color',) if 'color' in v else ())}
              for k, v in MODELS.items()}
    payload = json.dumps({'modelos': models, 'montajes': builds}, ensure_ascii=False, indent=1)
    OUT.write_text(
        '/* ==========================================================================\n'
        '   Only For You — montajes para el asesor «Configura tu Mendiz»\n'
        '   GENERADO con tools/ofy-asesor.py a partir de js/f14-montajes.js y de\n'
        '   las tablas de montajes de las fichas. No editar a mano.\n'
        '   ========================================================================== */\n'
        f'window.MENDIZ_OFY = {payload};\n', encoding='utf-8')
    per = {}
    for b in builds:
        per[b['modelo']] = per.get(b['modelo'], 0) + 1
    print(f'✓ {OUT.relative_to(ROOT)}: {len(builds)} montajes · ' + ' · '.join(f'{k} {n}' for k, n in per.items()))


if __name__ == '__main__':
    main()
