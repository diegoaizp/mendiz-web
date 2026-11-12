#!/usr/bin/env python3
"""
MENDIZ — Fotos de las respuestas de «¿Qué Mendiz es para ti?» (propuesta con
fotos, que-mendiz-es-para-ti-fotos.html).
Selección de output/revision-que-bici/respuestas-imagenes.json, con las
variantes por terreno que sugieren sus notas. Recorta a 3:2 (con punto de
interés fx, fy), reduce a 1200 px de ancho como máximo y guarda en WebP en
assets/img/que-mendiz/respuestas/. El nombre de salida es el que usa
js/que-mendiz.js (PHOTOS).
"""
import unicodedata
from pathlib import Path
from PIL import Image, ImageOps

LIB = Path('/Users/user15/• CLIENTES/MENDIZ/MENDIZ WEB 27/IMAGENES MENDIZ/SESIONES Y BEAUTIES')
WEB = Path('/Users/user15/• CLIENTES/MENDIZ/MENDIZ WEB 27/01 Desarrollo/versión 02')
A = WEB / 'assets/img'
OUT = A / 'que-mendiz/respuestas'
OUT.mkdir(parents=True, exist_ok=True)

AMIGOS = LIB / 'F14/F14 SL exterior fotos y video/F14 y F12 paseo de amigos.jpg'
AMIGOS2 = LIB / 'F14/F14 SL exterior fotos y video/F14 y F12 paseo de amigos2.jpg'
CARRETERA = LIB / 'F14/F14 SL-SLP/F14 Blanca/HIGH/ZBK260423_00436_HighRes.jpg'
F12 = LIB / 'F12 SL/F12 SL exterior fotos y video/F12 Negra y fucsia/f12SL.png'
G12 = LIB / 'G12SL exterior fotos y video/©FLOÉ-FFV26-OFF-9.jpg'
LAGO = LIB / 'G11/G11MPL Exterior/G11MPL Verde en lago.jpg'
EX41_ACCION = LIB / 'EX41/EX41 exterior brudeos en acción.jpg'

# nombre de salida: (origen, fx, fy)  — fx/fy: centro del recorte (0-1)
JOBS = {
    # 1 · Terreno. Montaña: X40 sin motor (la del estudio es una EX41)
    'terreno-carretera': (AMIGOS2, .5, .5),
    'terreno-gravel':    (G12, .5, .5),
    'terreno-montana':   (A / 'compartido/terrenos/montana.webp', .5, .5),
    # 2 · Salida ideal
    'salida-carretera-desconectar': (AMIGOS, .5, .5),
    'salida-carretera-ruta':        (AMIGOS2, .5, .5),
    'salida-carretera-jornada':     (CARRETERA, .5, .5),
    'salida-carretera-competir':    (F12, .5, .5),
    'salida-gravel-explorar': (LIB / 'G11/G11MPL Exterior/G11MPL marrón con chica.jpg', .5, .5),
    'salida-gravel-variada':  (LAGO, .5, .5),
    'salida-gravel-viajar':   (LIB / 'G11/G11MPL verde plata con accesorios.jpg', .5, .5),
    'salida-gravel-competir': (G12, .5, .5),
    'salida-montana-pistas':  (LIB / 'EX41/EX41 Exterior antracita hierva.jpg', .5, .5),
    'salida-montana-mixta':   (LIB / 'EX41/ex41 exterior antracita .jpg', .5, .5),
    'salida-montana-tecnica': (EX41_ACCION, .5, .5),
    'salida-montana-xc':      (A / 'que-mendiz/montana-competir.webp', .5, .5),   # X21 en carrera; el estudio la daba por pendiente
    # 3 · Qué disfrutar, por terreno
    'disfrutar-carretera-velocidad': (F12, .5, .5),
    'disfrutar-carretera-distancia': (CARRETERA, .5, .5),
    'disfrutar-carretera-paisaje':   (AMIGOS, .5, .5),
    'disfrutar-carretera-reto':      (LIB / 'F14/F14 MPL/F14MPL Exterior/F14MPL exterior subiendo .png', .5, .5),
    'disfrutar-gravel-velocidad': (LIB / 'G12SL exterior fotos y video/©FLOÉ-FFV26-OFF-12.jpg', .5, .5),
    'disfrutar-gravel-distancia': (LAGO, .5, .5),
    'disfrutar-gravel-paisaje':   (LIB / 'G11/G11MPL Exterior/G11MPL y chica.jpg', .5, .5),
    'disfrutar-gravel-reto':      (LIB / 'G12SL exterior fotos y video/G12 bajando plano largo sin interés.jpg', .5, .5),
    'disfrutar-montana-velocidad': (A / 'compartido/terrenos/montana-alt.webp', .5, .5),
    'disfrutar-montana-distancia': (LIB / 'EX41/ex41 exterior antracita .jpg', .5, .5),
    'disfrutar-montana-paisaje':   (LIB / 'EX41/EX 41 exterior antracita relaxing.jpg', .5, .5),
    'disfrutar-montana-reto':      (EX41_ACCION, .5, .5),
    # 4 · Asistencia, por terreno («No lo tengo claro» va sin foto)
    'asistencia-carretera-sin': (AMIGOS2, .5, .5),
    'asistencia-carretera-con': (LIB / 'EF21 MPL/EF21 MPL Motor1.jpg', .5, .5),
    'asistencia-gravel-sin':    (A / 'que-mendiz/gravel-sin.webp', .5, .5),
    'asistencia-gravel-con':    (LIB / 'EG21 MPL/EG21  MPL motor.jpg', .5, .5),
    'asistencia-montana-sin':   (A / 'que-mendiz/montana-sin.webp', .5, .5),
    'asistencia-montana-con':   (LIB / 'EX41/EX41 display.jpg', .5, .5),
    # 5 · Postura («Necesito orientación» va sin foto)
    'postura-deportiva':  (F12, .5, .5),
    'postura-relajada':   (LIB / 'EG21 MPL/EG21 MPL comodo.jpg', .5, .5),
    'postura-intermedia': (AMIGOS2, .5, .5),
}


def find(p):
    """Abre la ruta aunque el disco guarde los acentos descompuestos (NFD)."""
    if p.exists():
        return p
    want = unicodedata.normalize('NFC', p.name)
    for f in p.parent.iterdir():
        if unicodedata.normalize('NFC', f.name) == want:
            return f
    raise FileNotFoundError(p)


def crop(im, ratio, fx, fy):
    w, h = im.size
    if w / h > ratio:
        nw, nh = round(h * ratio), h
    else:
        nw, nh = w, round(w / ratio)
    x = min(max(round(fx * w - nw / 2), 0), w - nw)
    y = min(max(round(fy * h - nh / 2), 0), h - nh)
    return im.crop((x, y, x + nw, y + nh))


for name, (src, fx, fy) in JOBS.items():
    im = ImageOps.exif_transpose(Image.open(find(src))).convert('RGB')
    im = crop(im, 3 / 2, fx, fy)
    if im.width > 1200:
        im = im.resize((1200, 800), Image.LANCZOS)
    im.save(OUT / f'{name}.webp', 'WEBP', quality=80, method=6)
    print(f'{name:32} {im.width}x{im.height}  ← {src.name}')
