"""Corrige la transcripción de aroll.mp4 -> words_final.json (errores de Whisper verificados a mano)."""
import json
w = json.load(open("aroll_words.json"))
out = []
for x in w:
    t = x["text"]
    t = t.replace("cortos.", "Corfo.").replace("futral.", "futuro.")
    if t.startswith("Creivalía"):
        t = "Crea y Valida" + t[len("Creivalía"):]
    if t == "Crea y Valida." and 88 < x["start"] < 88.5:  # "El Fondo Crea y Valida, aparte, abre…"
        t = "Crea y Valida,"
    if t == "Aparte,":
        t = "aparte,"
    if t == "CapitalParaNegocios":
        t = "capitalparanegocios.cl"
    if t == ".cl":
        out[-1]["end"] = x["end"]
        continue
    out.append(dict(x, text=t))
json.dump(out, open("words_final.json", "w"), ensure_ascii=False, indent=1)
print(" ".join(o["text"] for o in out))
