#!/usr/bin/env python3
"""
MENDIZ — Datos del asesor «Configura tu Mendiz» (only-for-you-configura.html)

Lee los montajes de los siete modelos Only For You y escribe
js/data/ofy-montajes.js (window.MENDIZ_OFY), que consume js/ofy-asesor.js.

  · F14 SL-SLP: js/data/f14-montajes.js (los mismos datos que el configurador).
  · El resto: la tabla «Elige tu montaje» de su ficha (<article class="build-card">).

Cada montaje lleva el código ERP de los diez niveles de decisión, los mismos
de js/data/niveles-decision.js (window.MENDIZ_NIVELES):
  1 tipo · 2 disciplina · 3 modalidad · 4 material · 5 eje · 6 gama ·
  7 versión · 8 horquilla · 9 transmisión · 10 ruedas
Los niveles 1–5 salen del modelo (MODELS); 6–10, del montaje. None = el nivel
no aplica a ese montaje (p. ej. horquilla en carretera) y no se pregunta.
Cada código se comprueba contra js/data/niveles-decision.js.

Los montajes cuya transmisión no tiene opción en el ERP (Campagnolo Super
Record) se dejan fuera del asesor y se avisan al ejecutar.

Uso:  python3 tools/ofy-asesor.py
Vuelve a ejecutarlo si cambian los montajes de una ficha, js/data/f14-montajes.js
o js/data/niveles-decision.js.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'js' / 'data' / 'ofy-montajes.js'
LEVELS_JS = ROOT / 'js' / 'data' / 'niveles-decision.js'

# Modelos -----------------------------------------------------------------------
# Textos e imágenes de las fichas de listado (los mismos que js/que-mendiz.js).
# color: color de serie con el que se abre el configurador (js/data/f14-colores.js).
# Niveles 1–5 en código ERP. El eje (Boost / Quick Release) solo distingue las
# rígidas de aluminio en el ERP: en estos modelos no aplica.
MODELS = {
    'f14-sl-slp': dict(
        name='F14 SL-SLP', tag='Carretera · Rendimiento', claim='Sube ligero. Mantén el ritmo.',
        text='Para entrenar y competir en recorridos variados, con subidas, llanos y bajadas.',
        href='f14-sl-slp.html', img='assets/img/f14-sl-slp/f14-sl-slp-card-1200.webp', alt='Mendiz F14 SL-SLP · Blanco',
        tipo='CONV', disciplina='ROAD', modalidad='PERFORMANCE', material='CARBON', eje=None,
        color='blanco'),
    'f12-sl': dict(
        name='F12 SL', tag='Carretera · Aero', claim='Encuentra tu ritmo en el llano.',
        text='Para rodar rápido en llano y en grupo, con un cuadro de perfiles aerodinámicos.',
        href='f12-sl.html', img='assets/img/f12-sl/f12-sl-card-1200.webp', alt='Mendiz F12 SL · Azul metalizado',
        tipo='CONV', disciplina='ROAD', modalidad='AERO', material='CARBON', eje=None),
    'f9-sl': dict(
        name='F9 SL', tag='Carretera · Gran fondo', claim='Gran fondo a tu ritmo.',
        text='Para largas jornadas y marchas cicloturistas, con una posición más cómoda.',
        href='f9-sl.html', img='assets/img/f9-sl/f9-sl-card-1200.webp', alt='Mendiz F9 SL · Naranja / Negro',
        tipo='CONV', disciplina='ROAD', modalidad='ENDURANCE', material='CARBON', eje=None),
    'tt10': dict(
        name='TT10', tag='Carretera · Triatlón', claim='Diseñada para rodar acoplado.',
        text='Para triatlón y contrarreloj, con una posición acoplada sobre el manillar.',
        href='tt10.html', img='assets/img/tt10/tt10-card-1200.webp', alt='Mendiz TT10 · Rosa / Negro',
        tipo='CONV', disciplina='ROAD', modalidad='TT', material='CARBON', eje=None),
    'g12-sl': dict(
        name='G12 SL', tag='Gravel · Racing · Carbono', claim='Ritmo en las pistas. Libertad en la ruta.',
        text='Para competir en gravel y combinar caminos con tramos de carretera.',
        href='g12-sl.html', img='assets/img/g12-sl/g12-sl-card-1200.webp', alt='Mendiz G12 SL · Marrón tierra',
        tipo='CONV', disciplina='GRAVEL', modalidad='GRVL_RCNG', material='CARBON', eje=None),
    'x40-sl-icr': dict(
        name='X40 SL-ICR', tag='Montaña · Doble suspensión', claim='Sube con ritmo. Baja con control.',
        text='Para cross country y rutas donde buscas suspensión delantera y trasera.',
        href='x40-sl-icr.html', img='assets/img/x40-sl-icr/x40-sl-icr-card-1200.webp', alt='Mendiz X40 SL-ICR · Gris',
        tipo='CONV', disciplina='MTB', modalidad='DO_SUSXC', material='CARBON', eje=None),
    'ex41': dict(
        name='EX41', tag='Eléctrica · Montaña', claim='Más montaña en cada salida.',
        text='Doble suspensión, cuadro de carbono y asistencia Polini con batería de 880 Wh.',
        href='ex41.html', img='assets/img/ex41/ex41-card-1200.webp', alt='Mendiz EX41 · Gris',
        tipo='E-BIKE', disciplina='MTB', modalidad='DO_SUSTRL', material='CARBON', eje=None),
}

# Ruedas: nombre limpio y categoría ERP (nivel 10).
# Fulcrum Lite GR: aluminio, como indica el código del montaje (el mismo
# montaje con ruedas de carbono lleva el sufijo .C).
WHEELS = {
    'DT SWISS A-1800': ('DT Swiss A-1800', 'W_ALLOY'),
    'VISION TC45 CARBON': ('Vision TC45 Carbon', 'W_CARBON'),
    'FULCRUM SONIQ 42/47': ('Fulcrum Soniq 42/47', 'W_CARBON'),
    'FULCRUM SONIQ': ('Fulcrum Soniq', 'W_CARBON'),
    'CAMPAGNOLO HYPERON': ('Campagnolo Hyperon', 'W_CARBON'),
    'CAMPAGNOLO BORA ULTRA TW': ('Campagnolo Bora Ultra TW', 'W_CARBON'),
    'SCOPE ARTECH 4': ('Scope Artech 4', 'W_CARBONSL'),
    'MAVIC COSMIC SL 65': ('Mavic Cosmic SL 65', 'W_CARBON'),
    'MAVIC ALLROAD ALUM': ('Mavic Allroad', 'W_ALLOY'),
    'MAVIC ALLROAD S CARBON': ('Mavic Allroad S Carbon', 'W_CARBON'),
    'FULCRUM LITE GR': ('Fulcrum Lite GR', 'W_ALLOY'),
    'CAMPAGNOLO ZONDA GT': ('Campagnolo Zonda GT', 'W_ALLOY'),
    'CAMPG. ZONA GT': ('Campagnolo Zonda GT', 'W_ALLOY'),
    'MAVIC CROSSRIDE': ('Mavic Crossride', 'W_ALLOY'),
    'DT SWISS X 1900': ('DT Swiss X 1900', 'W_ALLOY'),
    'MAVIC E-CROSSRIDE MULLET': ('Mavic E-Crossride (mullet)', 'W_ALLOY'),
    'FULCRUM E-METAL 500 DEL Y E-FIRE 500 TRAS MULLET': ('Fulcrum E-Metal 500 / E-Fire 500 (mullet)', 'W_ALLOY'),
}

# Horquilla: nombre limpio y código ERP (nivel 8). Sin horquilla en la tabla
# = rígida de carbono: el nivel no aplica.
FORKS = {
    'ROCK SHOX RECON RL 100MM': ('RockShox Recon RL 100 mm', 'RS_RECON'),
    'ROCK SHOX RECON RL 100 MM': ('RockShox Recon RL 100 mm', 'RS_RECON'),
    'FOX FLOAT RHYTHM 32 100MM': ('Fox Float Rhythm 32 100 mm', 'FX_RHYTHM'),
    'FOX FLOAT RHYTHM 32 100 MM': ('Fox Float Rhythm 32 100 mm', 'FX_RHYTHM'),
    'ROCK SHOX SID SL 100MM': ('RockShox SID SL 100 mm', 'RS_SID'),
    'ROCK SHOX SID SL 100 MM': ('RockShox SID SL 100 mm', 'RS_SID'),
    'ROCK SHOX 35G RL 150MM': ('RockShox 35 Gold RL 150 mm', 'RS_E35'),
    'ROCK SHOX 35G RL 150 MM': ('RockShox 35 Gold RL 150 mm', 'RS_E35'),
    'FOX PERFORMANCE 36 150MM': ('Fox 36 Performance 150 mm', 'FX_PERFORMANCE'),
    'FOX PERFORMANCE 36 150 MM': ('Fox 36 Performance 150 mm', 'FX_PERFORMANCE'),
}


def load_levels():
    src = LEVELS_JS.read_text(encoding='utf-8')
    body = src[src.index('window.MENDIZ_NIVELES'):]
    data = json.loads(body[body.index('['):body.rindex(']') + 1])
    return {lv['field']: {o['erp'] for o in lv['options']} for lv in data}


def slug(s):
    s = s.lower().replace('×', 'x')
    for a, b in (('á', 'a'), ('é', 'e'), ('í', 'i'), ('ó', 'o'), ('ú', 'u'), ('ñ', 'n')):
        s = s.replace(a, b)
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')


def transmission_of(code, cambio, cassette=''):
    """Código ERP de la transmisión (nivel 9). None = sin opción en el ERP.
    El primero que encaja gana: los más concretos van antes."""
    up, cas, code = cambio.upper(), cassette.upper(), code.upper()
    if 'RECORD' in up:
        return None
    if 'RIVAL XPLR' in up:
        return 'SRM_RVLXPLR'
    if 'RED XPLR' in up:
        return 'SRM_REDXPLR'
    if 'EKAR' in up:
        return 'CMPG_EKARGT'
    if 'GRX825' in up or ('GRX' in up and 'DI2' in up and '2X' in up):
        return 'SH_GRX800DI22X'
    if 'GRX 717' in up or 'GRX717' in up:
        return 'SH_GRX717DI2'
    if 'GRX400' in up or 'GRX 400' in up:
        return 'SH_GRX400F' if 'FLAT' in code else 'SH_GRX400'
    if 'GRX820' in up or 'GRX 820' in up:
        if '1X' in up:
            return 'SH_GRX8001X'
        # 2×12: con cassette de la serie 105 (R7100) es el escalón GRX600
        return 'SH_GRX600' if 'R7100' in cas else 'SH_GRX8002X'
    if '105' in up:
        return 'SH_105DI2' if 'DI2' in up else 'SH_105'
    if 'ULTEGRA' in up:
        return 'SH_ULT'
    if 'DURA' in up:
        return 'SH_DA'
    if 'RIVAL' in up:
        return 'SRM_RVL'
    if 'FORCE' in up:
        return 'SRM_FRC'
    if 'RED' in up:
        return 'SRM_RED'
    if 'SLX' in up or 'DEORE' in up:
        return 'SH_DSLX'
    if 'XT' in up:
        return 'SH_XTSLX' if 'SLX' in cas else 'SH_XT'
    if 'GX' in up:
        return 'SRM_GX'
    if 'NX' in up:
        return 'SRM_NX'
    raise SystemExit(f'Transmisión sin código ERP: {cambio!r} (añádela a transmission_of)')


def wheels_of(raw):
    key = ' '.join(raw.upper().split())
    if key not in WHEELS:
        raise SystemExit(f'Ruedas sin nombre: {raw!r} (añádelas a WHEELS)')
    return WHEELS[key]


def fork_of(raw):
    if not raw:
        return None, None
    key = ' '.join(raw.upper().split())
    if key not in FORKS:
        raise SystemExit(f'Horquilla sin nombre: {raw!r} (añádela a FORKS)')
    return FORKS[key]


def gama_of(model, code):
    """Gama de carbono (nivel 6) a partir del código del montaje:
    F14S.* = Sport (MPL) · *SLP.* = Super Light Performance · *SL* = Super Light.
    La TT10 es SL según su ficha. Las eléctricas no tienen el dato: None."""
    if MODELS[model]['tipo'] == 'E-BIKE':
        return None
    if re.match(r'^[A-Z0-9]+SLP\.', code):
        return 'CARBON SLP'
    if re.match(r'^[A-Z0-9]+S\.', code) and not re.match(r'^[A-Z0-9]+SL', code):
        return 'CARBON S'
    return 'CARBON SL'


def build(model, code, name, price, specs):
    m = MODELS[model]
    trans = transmission_of(code, specs.get('Cambio', ''), specs.get('Cassette', ''))
    if trans is None:
        return None
    wheel, wheel_cat = wheels_of(specs['Ruedas'])
    fork, fork_code = fork_of(specs.get('Horquilla'))
    return {
        'modelo': model, 'code': code, 'name': name, 'precio': price,
        'tipo': m['tipo'], 'disciplina': m['disciplina'], 'modalidad': m['modalidad'],
        'material': m['material'], 'eje': m['eje'], 'gama': gama_of(model, code),
        # Only For You no incluye las ediciones MPL (montaje cerrado)
        'version': 'STANDARD',
        'horquilla': fork_code, 'horquillaLabel': fork,
        'transmision': trans,
        'ruedas': wheel_cat, 'ruedasLabel': wheel, 'ruedasImg': f'assets/img/ofy-asesor/ruedas-{slug(wheel)}.webp',
        'specs': {k: specs[k] for k in ('Cambio', 'Bielas', 'Cassette', 'Frenos', 'Horquilla', 'Motor', 'Batería') if specs.get(k)},
    }


def from_f14():
    src = (ROOT / 'js' / 'data' / 'f14-montajes.js').read_text(encoding='utf-8')
    data = json.loads(src[src.index('{'):src.rindex('}') + 1])
    out = []
    for b in data['montajes']:
        specs = dict(b['componentes'])
        specs['Cambio'] = b['grupo']
        out.append((b['code'], build('f14-sl-slp', b['code'], b['name'], b['precio'], specs)))
    return out


def from_page(model):
    s = (ROOT / f'{model}.html').read_text(encoding='utf-8')
    out = []
    for a in re.findall(r'<article class="build-card">(.*?)</article>', s, re.S):
        code = html.unescape(re.search(r'build-card__model">(.*?)<', a).group(1)).strip()
        det = re.search(r'<dl class="specs">(.*?)</dl>', a, re.S).group(1)
        specs = {html.unescape(k): html.unescape(v).strip() for k, v in re.findall(r'<dt>(.*?)</dt><dd>(.*?)</dd>', det)}
        price = int(re.sub(r'\D', '', re.search(r'build-card__price"><strong>(.*?)<', a).group(1)))
        out.append((code, build(model, code, code, price, specs)))
    if not out:
        raise SystemExit(f'{model}.html: no hay montajes')
    return out


FIELDS = ('tipo', 'disciplina', 'modalidad', 'material', 'eje', 'gama', 'version', 'horquilla', 'transmision', 'ruedas')


def main():
    levels = load_levels()
    pairs = from_f14()
    for model in MODELS:
        if model != 'f14-sl-slp':
            pairs += from_page(model)
    builds = [b for _, b in pairs if b]
    skipped = [code for code, b in pairs if not b]

    # Todos los códigos tienen que existir en js/data/niveles-decision.js
    for b in builds:
        for f in FIELDS:
            if b[f] is not None and b[f] not in levels[f]:
                raise SystemExit(f'{b["code"]}: {f}={b[f]!r} no es una opción del ERP (js/data/niveles-decision.js)')

    # Dos montajes con los diez niveles iguales: el asesor solo llega al más económico
    seen = {}
    for b in sorted(builds, key=lambda x: x['precio']):
        key = (b['modelo'],) + tuple(b[f] for f in FIELDS)
        if key in seen:
            print(f'  ! {b["code"]} tiene la misma ruta que {seen[key]}: el asesor propone {seen[key]}')
        else:
            seen[key] = b['code']

    models = {k: {f: v[f] for f in ('name', 'tag', 'claim', 'text', 'href', 'img', 'alt') + (('color',) if 'color' in v else ())}
              for k, v in MODELS.items()}
    payload = json.dumps({'modelos': models, 'montajes': builds}, ensure_ascii=False, indent=1)
    OUT.write_text(
        '/* ==========================================================================\n'
        '   Only For You — Montajes para el asesor «Configura tu Mendiz»\n'
        '   GENERADO con tools/ofy-asesor.py a partir de js/data/f14-montajes.js y de\n'
        '   las tablas de montajes de las fichas. Valores de los niveles en código\n'
        '   ERP (js/data/niveles-decision.js). No editar a mano.\n'
        '   ========================================================================== */\n'
        f'window.MENDIZ_OFY = {payload};\n', encoding='utf-8')
    per = {}
    for b in builds:
        per[b['modelo']] = per.get(b['modelo'], 0) + 1
    print(f'✓ {OUT.relative_to(ROOT)}: {len(builds)} montajes · ' + ' · '.join(f'{k} {n}' for k, n in per.items()))
    if skipped:
        print(f'  · Fuera del asesor (transmisión sin opción en el ERP): {", ".join(skipped)}')


if __name__ == '__main__':
    main()
