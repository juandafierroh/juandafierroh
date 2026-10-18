#!/usr/bin/env python3
"""Corta el vídeo en bruto según cuts.json y lo une en un solo aroll.mp4 (CFR, 1080x1920).

Uso:
  python cut_aroll.py bruto.mp4 cuts.json aroll.mp4 [--fps 30] [--zoom 1.08] [--anchor-y 700]

cuts.json: [[inicio, fin], ...] en segundos del vídeo en bruto, en orden de montaje.
Cada tramo se codifica por separado y luego se concatena (hacer los 20+ cortes en un
único filtergraph de ffmpeg agota la memoria). Los tramos impares llevan un zoom suave
anclado a la altura de la cara (--anchor-y, en píxeles del original) para disimular
los saltos de corte; cada tramo lleva fundidos de audio de 15-20 ms para evitar clics.
"""
import argparse
import json
import pathlib
import subprocess
import tempfile


def main():
    p = argparse.ArgumentParser()
    p.add_argument("src")
    p.add_argument("cuts")
    p.add_argument("out")
    p.add_argument("--fps", type=int, default=30)
    p.add_argument("--zoom", type=float, default=1.08)
    p.add_argument("--anchor-y", type=int, default=700)
    a = p.parse_args()
    cuts = json.loads(pathlib.Path(a.cuts).read_text())

    with tempfile.TemporaryDirectory(dir=pathlib.Path(a.out).resolve().parent) as tmp:
        tmp = pathlib.Path(tmp)
        names = []
        for i, (s, e) in enumerate(cuts):
            d = e - s
            z = 1.0 if i % 2 == 0 else a.zoom
            vf = "" if z == 1.0 else (
                f"crop=w=trunc(1080/{z}/2)*2:h=trunc(1920/{z}/2)*2:x=(1080-ow)/2:y={a.anchor_y}-{a.anchor_y}/{z},"
                "scale=1080:1920:flags=lanczos,"
            )
            vf = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920," + vf + f"fps={a.fps},setsar=1"
            af = f"afade=t=in:d=0.015,afade=t=out:st={d - 0.02:.3f}:d=0.02"
            name = f"s{i:03d}.mp4"
            subprocess.run([
                "ffmpeg", "-v", "error", "-y", "-ss", f"{s}", "-i", a.src, "-t", f"{d}",
                "-vf", vf, "-af", af, "-c:v", "libx264", "-preset", "medium", "-crf", "16",
                "-pix_fmt", "yuv420p", "-r", str(a.fps), "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
                str(tmp / name),
            ], check=True)
            names.append(name)
        (tmp / "list.txt").write_text("\n".join(f"file '{n}'" for n in names))
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0",
                        "-i", str(tmp / "list.txt"), "-c", "copy", a.out], check=True)
    dur = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", a.out],
                         capture_output=True, text=True).stdout.strip()
    print(f"{a.out}: {len(cuts)} tramos, {float(dur):.2f} s")


if __name__ == "__main__":
    main()
