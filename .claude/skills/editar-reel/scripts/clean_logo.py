#!/usr/bin/env python3
"""Convierte un logo sobre fondo claro (archivo del usuario o recorte de una lámina) en PNG transparente.

Uso:
  python clean_logo.py entrada.png salida.png [--crop x,y,w,h] [--scale 6]

--crop  recorta una zona de la imagen (p. ej. el logo dentro de una lámina del carrusel).
--scale amplía con lanczos antes de quitar el fondo; úsalo cuando el recorte es pequeño
        (un logo de 150 px recortado de una lámina necesita ~6x para verse nítido a 186 px x2).
El color de fondo se toma de las esquinas; el resto se recorta al contenido.
"""
import argparse

import numpy as np
from PIL import Image


def main():
    p = argparse.ArgumentParser()
    p.add_argument("src")
    p.add_argument("out")
    p.add_argument("--crop")
    p.add_argument("--scale", type=float, default=1)
    a = p.parse_args()

    im = Image.open(a.src).convert("RGB")
    if a.crop:
        x, y, w, h = map(int, a.crop.split(","))
        im = im.crop((x, y, x + w, y + h))
    if a.scale != 1:
        im = im.resize((round(im.width * a.scale), round(im.height * a.scale)), Image.LANCZOS)
    px = np.array(im).astype(float)
    corners = np.array([px[0, 0], px[0, -1], px[-1, 0], px[-1, -1]])
    bg = np.median(corners, axis=0)

    # alfa = cuánto se aleja cada píxel del fondo; luego se "despremultiplica" el color
    dist = np.abs(px - bg).max(2) / np.maximum(bg.max(), 1)
    alpha = np.clip((dist - 0.04) / 0.6, 0, 1)
    col = np.where(alpha[..., None] > 0.02, (px - (1 - alpha[..., None]) * bg) / np.maximum(alpha[..., None], 1e-3), 0)
    out = np.dstack([np.clip(col, 0, 255), alpha * 255]).astype(np.uint8)

    ys, xs = np.where(alpha > 0.1)
    if len(xs):
        out = out[max(ys.min() - 4, 0): ys.max() + 5, max(xs.min() - 4, 0): xs.max() + 5]
    Image.fromarray(out, "RGBA").save(a.out)
    print(f"{a.out}: {out.shape[1]}x{out.shape[0]}")


if __name__ == "__main__":
    main()
