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
  "layout": {"band": 380, "captionsTop": 1688},   # opcional
  "hook": {"end": 2.0, "l1": "LÍNEA 1", "l2": "LÍNEA 2"},
  "headlines": [[t0, t1, "Texto con *acento*", "tipo", {opciones}], ...],
  "broll": [{"src": "assets/lamina.jpg", "start": 29.7, "end": 31.75, "alt": "..."}]
}
Rutas relativas de "words" se resuelven respecto a reel.json.
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
