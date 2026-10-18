"""Corrige la transcripción final (palabras perdidas y errores de Whisper) -> words_final.json"""
import json, sys
src, out = sys.argv[1], sys.argv[2]
w = json.load(open(src))
fixed = []
for x in w:
    t = x["text"]
    if t == "billones":
        t = "millones"
    if t == "magisterio":
        t = "magíster"
    if t == "postulación.":
        # Whisper fusionó "postulación a un fondo Corfo." (tiempos por energía del audio)
        fixed += [
            {"text": "postulación", "start": x["start"] - 0.5, "end": 58.72},
            {"text": "a", "start": 58.74, "end": 58.84},
            {"text": "un", "start": 58.86, "end": 58.95},
            {"text": "fondo", "start": 59.0, "end": 59.24},
            {"text": "Corfo.", "start": 59.25, "end": 59.55},
        ]
        continue
    if t == "Acá" and x["start"] > 59:
        x = dict(x, start=59.62)
    if t == "CapitalParaNegocios":
        t = "capitalparanegocios.cl"
    if t == ".cl":
        fixed[-1]["end"] = x["end"]
        continue
    fixed.append(dict(x, text=t))
json.dump(fixed, open(out, "w"), ensure_ascii=False, indent=1)
print(" ".join(f["text"] for f in fixed))
