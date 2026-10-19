#!/usr/bin/env python3
"""Genera la composición HyperFrames de un reel a partir de reel.json.

Uso:
  python make.py reel.json <carpeta-proyecto>

Crea (o actualiza) <carpeta-proyecto>/index.html y copia a <carpeta-proyecto>/assets/
GSAP y las fuentes que trae la skill. El vídeo cortado (assets/aroll.mp4), logos y
láminas los pones tú en assets/ antes de renderizar.

reel.json:
{
  "duration": 62.33,                      # duración de aroll.mp4 (ffprobe)
  "words": "words_final.json",            # [{text,start,end}] sobre el vídeo YA cortado
  "layout": {"band": 380, "captionsTop": 1688, "videoTop": 0},   # opcional; videoTop por defecto = band
  "hook": {"end": 2.0, "l1": "LÍNEA 1", "l2": "LÍNEA 2"},
  "headlines": [[t0, t1, "Texto con *acento*", "tipo", {opciones}], ...],
  "broll": [{"src": "assets/lamina.jpg", "start": 29.7, "end": 31.75, "alt": "..."}],
  "zoom": {                                 # opcional: zoom de cámara por corte
    "segments": "proyecto/assets/aroll.segments.json",   # lo escribe cut_aroll.py
    "origin": [540, 720],                   # punto (px) hacia el que se hace zoom: la cara
    "pattern": [1.0, 1.14, 1.06, 1.26, 1.0, 1.18, 1.1, 1.3],  # encuadre base de cada corte
    "push": 0.05,                           # acercamiento/alejamiento lento dentro de cada tramo
    "calm": 1.0,                            # zoom máximo mientras hay b-roll (para que no lo tape)
    "punches": [10.6, 41.0]                 # golpes de zoom en palabras clave (segundos)
  }
}
Rutas relativas ("words", "zoom.segments") se resuelven respecto a reel.json.
Franja abajo: "layout": {"bandTop": 1280, "band": 360, "captionsTop": 1190, "videoTop": 0}.
"""
import json
import pathlib
import shutil
import sys

SKILL = pathlib.Path(__file__).resolve().parent.parent


def caption_groups(words, duration, max_chars=30, gap=0.3):
    """Agrupa palabras en líneas cortas: corta en puntuación, pausas o al llenar la línea."""
    groups, cur = [], []
    for i, w in enumerate(words):
        cur.append(w)
        text = " ".join(x["text"] for x in cur)
        nxt = words[i + 1] if i + 1 < len(words) else None
        if (
            nxt is None
            or w["text"][-1] in ".,?!"
            or nxt["start"] - w["end"] > gap
            or len(text + " " + nxt["text"]) > max_chars
        ):
            groups.append(cur)
            cur = []
    out = []
    for gi, g in enumerate(groups):
        nxt_start = groups[gi + 1][0]["start"] if gi + 1 < len(groups) else duration
        out.append({
            "start": round(g[0]["start"], 3),
            "end": round(min(nxt_start, g[-1]["end"] + 0.6), 3),
            "words": [{"t": w["text"], "s": round(w["start"], 3)} for w in g],
        })
    return out


def zoom_plan(z, segments, broll):
    """Un encuadre por tramo: alterna acercarse/alejarse lento; tramos muy cortos siguen el anterior."""
    pattern, push, calm = z.get("pattern", [1.0, 1.14, 1.06, 1.26]), z.get("push", 0.05), z.get("calm", 1.0)
    plan, prev = [], 1.0
    for i, (s, e) in enumerate(segments):
        if e - s < 0.6 and plan:
            z0 = z1 = prev
        else:
            base = pattern[i % len(pattern)]
            z0, z1 = (base, base + push) if i % 2 == 0 else (base + push, base)
        if any(b["start"] - 0.3 < e and b["end"] + 0.3 > s for b in broll):
            z0, z1 = min(z0, calm), min(z1, calm)
        plan.append({"s": s, "e": e, "z0": round(z0, 3), "z1": round(z1, 3)})
        prev = z1
    return plan


def main():
    cfg_path = pathlib.Path(sys.argv[1]).resolve()
    out = pathlib.Path(sys.argv[2]).resolve()
    cfg = json.loads(cfg_path.read_text())
    words = json.loads((cfg_path.parent / cfg["words"]).read_text())
    duration = cfg["duration"]

    for i, (t0, t1, text, kind, *_rest) in enumerate(cfg["headlines"]):
        if t1 <= t0:
            sys.exit(f"Titular {i} ({text!r}): fin <= inicio")

    data = {
        "duration": duration,
        "layout": cfg.get("layout", {}),
        "hook": cfg["hook"],
        "headlines": cfg["headlines"],
        "broll": cfg.get("broll", []),
        "captions": caption_groups(words, duration),
    }
    if "zoom" in cfg:
        z = cfg["zoom"]
        segments = json.loads((cfg_path.parent / z["segments"]).read_text())
        data["zoom"] = {"origin": z.get("origin", [540, 720]), "punches": z.get("punches", []),
                        "plan": zoom_plan(z, segments, cfg.get("broll", []))}

    (out / "assets").mkdir(parents=True, exist_ok=True)
    for f in (SKILL / "assets" / "vendor").iterdir():
        shutil.copy2(f, out / "assets" / f.name)
    if not (out / "hyperframes.json").exists():
        (out / "hyperframes.json").write_text(json.dumps({
            "$schema": "https://hyperframes.heygen.com/schema/hyperframes.json",
            "paths": {"blocks": "compositions", "components": "compositions/components", "assets": "assets"},
            "media": {"autoProxy": True},
        }, indent=2))

    html = (SKILL / "assets" / "template.html").read_text()
    html = html.replace("/*__DATA__*/", "const DATA = " + json.dumps(data, ensure_ascii=False) + ";")
    html = html.replace("__DURATION__", str(duration))
    (out / "index.html").write_text(html)
    print(f"{out / 'index.html'}: {len(cfg['headlines'])} titulares, {len(data['captions'])} líneas de subtítulos")


if __name__ == "__main__":
    main()
