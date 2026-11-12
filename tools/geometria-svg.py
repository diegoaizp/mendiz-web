"""Genera el esquema de geometría de la F14 SL-SLP (talla M) a escala 1 unidad = 1 mm y lo
escribe en la ficha. Datos: configurador oficial bicismendiz.com.

Estilo de plano técnico (referencia del cliente): cuadro en línea negra, cotas en
verde con flecha en cada extremo, líneas auxiliares en gris y letras pequeñas sin círculo.

Cuadro: contorno vectorizado de la capa de color del cuadro del configurador (Only For You),
https://www.bicismendiz.com/sites/default/files/f14sl-c01-negro.png, guardada en
tools/fuentes/. Es solo cuadro + horquilla, con fondo transparente; su alfa es la silueta.
Calibración de esa capa (2500 x 1667 px), con tres puntos del propio dibujo del configurador:
- eje trasero = centro del agujero de la puntera (689,9, 1036,8 px);
- pedalier = centro del plato y de la araña de la capa f14sl-componentes.png (1169, 1110,5 px);
- eje delantero = centro del disco de freno de esa misma capa (1847,5, 1023,5 px); la puntera de
  la horquilla no tiene agujero en el dibujo.
Ajuste de semejanza por mínimos cuadrados de esos tres puntos a la geometría de la talla M
(1,171 px/mm); el dibujo se aparta como mucho ~3 mm de las cotas teóricas. Los círculos de
ejes y pedalier se dibujan en los centros del dibujo, para que caigan bien dentro del cuadro
(el delantero, en el eje de la pata de la horquilla).

Uso: python3 tools/geometria-svg.py f14-sl-slp.html [tools/fuentes/f14sl-c01-negro.png]
Requiere numpy y opencv-python."""
import math, sys
from math import sin, cos, radians as rad
import numpy as np, cv2

# Talla M
B, L, T, P, C, F = 510, 548, 140, 410, 989, 589
X, Z, S, R = 73, 74, 554, 389
DROP = 68                      # caída de pedalier deducida de P, F y C

# Lienzo: cuadro centrado (su contorno va de -420 a 611 en x y de -23 a 544 en y, desde el pedalier)
W, H = 1350, 1040
OX, OY = 580, 780              # pedalier en el lienzo
def q(x, y): return (x + OX, OY - y)
def p(x, y): return f"{x + OX:.1f} {OY - y:.1f}"

rear = (-math.sqrt(P*P - DROP*DROP), DROP)
front = (math.sqrt(F*F - DROP*DROP), DROP)
st_dir = (-cos(rad(Z)), sin(rad(Z)))
st_top = (B*st_dir[0], B*st_dir[1])
ht_top = (R, S)
ax_dir = (cos(rad(X)), -sin(rad(X)))          # eje de dirección hacia abajo
ht_bot = (R + T*ax_dir[0], S + T*ax_dir[1])
steer_ground = (R + (S-DROP)/math.tan(rad(X)), DROP)
ett_x = -S/math.tan(rad(Z))

# ---------------------------------------------------------------- cuadro (contorno vectorial)
SRC = sys.argv[2] if len(sys.argv) > 2 else 'tools/fuentes/f14sl-c01-negro.png'
# puntos del dibujo (px) y su posición teórica en el lienzo
pts_px = np.array([[689.9, 1036.8], [1169.0, 1110.5], [1847.5, 1023.5]])     # eje tras., pedalier, eje del.
pts_u = np.array([q(*rear), q(0, 0), q(*front)])
# semejanza (escala + giro + traslación) por mínimos cuadrados (Umeyama)
mp, mu = pts_px.mean(0), pts_u.mean(0)
A, Bm = pts_px - mp, pts_u - mu
U, Sg, Vt = np.linalg.svd(Bm.T @ A)
Rot = U @ Vt
sc = Sg.sum() / (A**2).sum()
Rm = sc * Rot
tv = mu - Rm @ mp
centers = (Rm @ pts_px.T).T + tv                     # ejes y pedalier del dibujo, en el lienzo
resid = np.hypot(*(centers - pts_u).T)
# El círculo del eje delantero va centrado en la pata de la horquilla a la altura del disco
# (bordes de la pata en esa fila: 1834 y 1871 px). El centro del disco queda a ~10 mm del
# borde trasero de la pata, de 29 mm, y un círculo ahí se saldría del dibujo.
centers[2] = Rm @ np.array([(1834 + 1871) / 2, 1023.5]) + tv

alpha = cv2.imread(SRC, cv2.IMREAD_UNCHANGED)[..., 3]
mask = (cv2.GaussianBlur(alpha, (0, 0), 1.2) > 127).astype(np.uint8)
contours, _ = cv2.findContours(mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
frame_d = []
for c in contours:
    if cv2.contourArea(c) < 2000:         # motas y agujero de la puntera (se dibuja como círculo)
        continue
    pts = c[:, 0, :].astype(np.float32)
    # suavizado a lo largo del contorno (quita el escalonado de píxel) y simplificación
    k = 5
    pad = np.vstack([pts[-k:], pts, pts[:k]])
    ker = np.ones(2*k+1, np.float32) / (2*k+1)
    sm = np.stack([np.convolve(pad[:, 0], ker, 'valid'), np.convolve(pad[:, 1], ker, 'valid')], 1)
    sm = cv2.approxPolyDP(sm.reshape(-1, 1, 2), 0.7, True)[:, 0, :]
    uv = (Rm @ sm.T).T + tv
    frame_d.append('M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in uv) + 'Z')
frame_path = f'<path class="geometry__frame" d="{" ".join(frame_d)}"/>'

# ---------------------------------------------------------------- cotas
AL, AW = 22, 7                 # flecha: largo y medio ancho (mm del lienzo)
GAP = 10                       # separación entre el cuadro y el arranque de las auxiliares
OV = 14                        # cuánto pasan las auxiliares más allá de la cota

def add(a, b, k=1.0): return (a[0] + k*b[0], a[1] + k*b[1])
def unit(a, b):
    d = math.hypot(b[0]-a[0], b[1]-a[1]); return ((b[0]-a[0])/d, (b[1]-a[1])/d)
def line(a, b): return f"M{p(*a)} L{p(*b)}"
def arrow(tip, d):
    """Punta en tip, apuntando en la dirección d (unitaria, coordenadas locales)."""
    n = (-d[1], d[0])
    base = add(tip, d, -AL)
    return f"M{p(*tip)} L{p(*add(base, n, AW))} L{p(*add(base, n, -AW))}Z"

def dim(a, b, key, lab_k=0.5, ext=()):
    """Cota lineal de a a b, con flechas en ambos extremos y letra en la fracción lab_k."""
    u = unit(a, b)
    d_line = line(a, b)
    heads = arrow(a, (-u[0], -u[1])) + ' ' + arrow(b, u)
    lab = add(a, (b[0]-a[0], b[1]-a[1]), lab_k)
    return group(key, d_line, heads, lab, ext)

def arc_pts(c, r, a0, a1):
    return (c[0] + r*cos(rad(a0)), c[1] + r*sin(rad(a0))), (c[0] + r*cos(rad(a1)), c[1] + r*sin(rad(a1)))

def dim_arc(c, r, a0, a1, key, ext=()):
    """Cota angular: arco de a0 a a1 (grados, a0 < a1, antihorario en coordenadas locales)."""
    s, e = arc_pts(c, r, a0, a1)
    d_arc = f"M{p(*s)} A{r} {r} 0 0 0 {p(*e)}"   # antihorario en local = sweep 0 con y invertida
    t0 = (-sin(rad(a0)), cos(rad(a0)))           # tangente en a0, sentido creciente
    t1 = (-sin(rad(a1)), cos(rad(a1)))
    heads = arrow(s, (-t0[0], -t0[1])) + ' ' + arrow(e, t1)
    am = (a0 + a1) / 2
    lab = (c[0] + r*cos(rad(am)), c[1] + r*sin(rad(am)))
    return group(key, d_arc, heads, lab, ext)

def group(key, d_line, heads, lab, ext):
    x, y = q(*lab)
    ext_d = ' '.join(ext)
    return (f'<g data-geometry="{key}">'
            + (f'<path class="geometry__extension" d="{ext_d}"/>' if ext_d else '')
            + f'<path class="geometry__hit" d="{d_line}"/>'
            + f'<path class="geometry__dimension" d="{d_line}"/>'
            + f'<path class="geometry__arrowhead" d="{heads}"/>'
            + f'<text class="geometry__key" x="{x:.1f}" y="{y:.1f}">{key}</text></g>')

def offset(a, b, dist, side):
    """Segmento paralelo a a-b desplazado dist hacia side (+1 izquierda del sentido a→b, -1 derecha)."""
    u = unit(a, b); n = (-u[1]*side, u[0]*side)
    return add(a, n, dist), add(b, n, dist), n

m = []
# B: tubo de sillín, paralela por detrás
b0, b1, n = offset((0, 0), st_top, 80, 1)
m.append(dim(b0, b1, 'B', 0.62, ext=[line(add((0, 0), n, 40), add(b0, n, OV)), line(add(st_top, n, GAP), add(b1, n, OV))]))
# L: tubo horizontal efectivo, sobre el cuadro
ly = S + 70
m.append(dim((ett_x, ly), (R, ly), 'L', 0.5, ext=[line(st_top, (ett_x, S)), line((ett_x, S), (ett_x, ly + OV)), line((R, S + GAP), (R, ly + OV))]))
# R: reach, encima de la L
ry = S + 150
m.append(dim((0, ry), (R, ry), 'R', 0.5, ext=[line((0, 30), (0, ry + OV)), line((R, ly + OV + 8), (R, ry + OV))]))
# T: tubo de dirección, paralela por delante
t0, t1, n = offset(ht_top, ht_bot, 75, 1)
m.append(dim(t0, t1, 'T', 0.5, ext=[line(add(ht_top, n, 35), add(t0, n, OV)), line(add(ht_bot, n, 35), add(t1, n, OV))]))
# S: stack, vertical a la derecha de la horquilla
sx = 700
m.append(dim((sx, 0), (sx, S), 'S', 0.5, ext=[line((R + 35, S), (sx + OV, S))]))
# P: vaina, paralela por debajo
p0, p1, n = offset(rear, (0, 0), 70, -1)
m.append(dim(p0, p1, 'P', 0.5, ext=[line(add(rear, n, 25), add(p0, n, OV)), line(add((0, 0), n, 35), add(p1, n, OV))]))
# F: centro delantero, paralela por debajo
f0, f1, n = offset((0, 0), front, 70, -1)
m.append(dim(f0, f1, 'F', 0.5, ext=[line(add((0, 0), n, 35), add(f0, n, OV)), line(add(front, n, 25), add(f1, n, OV))]))
# C: distancia entre ejes, abajo del todo
cy = -150
m.append(dim((rear[0], cy), (front[0], cy), 'C', 0.5, ext=[line((rear[0], DROP - 25), (rear[0], cy - OV)), line((front[0], DROP - 25), (front[0], cy - OV))]))
# X: ángulo de dirección, entre el eje de dirección y la línea de ejes
m.append(dim_arc(steer_ground, 150, 180 - X, 180, 'X', ext=[line(ht_bot, add(steer_ground, ax_dir, 40))]))
# Z: ángulo del tubo de sillín, en el pedalier
m.append(dim_arc((0, 0), 175, 180 - Z, 180, 'Z', ext=[line((0, 0), add((0, 0), st_dir, 200))]))

# líneas de referencia (raya-punto): altura del pedalier y de los ejes
def circle(c, r): return f"M{c[0]-r:.1f} {c[1]:.1f} a{r} {r} 0 1 0 {2*r} 0 a{r} {r} 0 1 0 {-2*r} 0"
circles = ' '.join([circle(centers[0], 10), circle(centers[1], 22), circle(centers[2], 10)])   # ejes pasantes y caja de pedalier
refs = (f'<path class="geometry__axis" d="{line((-450, 0), (sx + OV, 0))} {line((rear[0] - 40, DROP), (front[0] + 60, DROP))}"/>'
        f'<path class="geometry__axle" d="{circles}"/>')
out = [f'<svg class="geometry__svg" viewBox="0 0 {W} {H}" role="img" aria-labelledby="geo-svg-title">',
       '            <title id="geo-svg-title">Cuadro F14 SL-SLP en talla M, de perfil, con las medidas de la tabla señaladas</title>',
       '            ' + refs,
       '            ' + frame_path]
out += ['            ' + g for g in m]
out.append('          </svg>')
svg = '\n'.join(out)

html_path = sys.argv[1]
s = open(html_path, encoding='utf-8').read()
a = s.index('<svg class="geometry__svg"'); b = s.index('</svg>', a) + len('</svg>')
s = s[:a] + svg + s[b:]
open(html_path, 'w', encoding='utf-8').write(s)
print('ok', len(svg), 'bytes;', len(frame_d), 'contornos;', f'{1/sc:.4f} px/mm;', 'desvío (mm) eje tras./pedalier/eje del.:', resid.round(1))
