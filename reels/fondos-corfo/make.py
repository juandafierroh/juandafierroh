"""Genera el index.html de la composición HyperFrames del reel a partir de words_final.json.

Uso: python make.py <carpeta-del-proyecto-hyperframes>
"""
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
OUT = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else HERE / "project"
WORDS = json.load(open(HERE / "words_final.json"))
DURATION = 62.33

HOOK = {"end": 2.0, "l1": "FONDOS CORFO", "l2": "HASTA $220 MILLONES"}

# [inicio, fin, titular (*palabra* = acento), gráfico, opciones]
HEADLINES = [
    [2.0, 4.3, "Abren en *octubre* y noviembre", "logo", {}],
    [4.3, 6.8, "Para *personas* y empresas", "people", {}],
    [6.8, 8.6, "Desarrolla y *lanza*", "rocket", {}],
    [8.6, 11.3, "Productos, servicios o *procesos*", "chips", {}],
    [11.3, 13.3, "*Innovación* en tu industria", "bulb", {}],
    [13.3, 15.9, "Personas *naturales*", "personCheck", {}],
    [15.9, 17.7, "Empresas ya *constituidas*", "buildingCheck", {}],
    [17.7, 19.5, "Desde *$15 millones*", "counter", {"from": 0, "to": 15}],
    [19.5, 21.4, "Hasta *$220 millones*", "counter", {"from": 15, "to": 220}],
    [21.4, 24.6, "Postulan personas de *Chile*", "flag", {}],
    [24.6, 26.0, "Fondos *Corfo*", "logo", {}],
    [26.0, 27.9, "También *extranjeros*", "globe", {}],
    [27.9, 29.7, "Fondos *Start-Up Chile*", "logoStartup", {}],
    [29.7, 31.7, "Calendario *oficial 2026*", "calendarGrid", {}],
    [31.7, 33.8, "¿Dudas? *Contáctanos*", "chat", {}],
    [33.8, 35.8, "Descarga la *guía*", "download", {}],
    [35.8, 37.6, "Haz el *test*", "checklist", {}],
    [37.6, 39.6, "Agenda una *asesoría*", "calendarCheck", {}],
    [39.6, 42.6, "Analizamos *tu caso*", "magnifier", {}],
    [42.6, 45.0, "Juan Fierro, *especialista Corfo*", "badge", {}],
    [45.0, 47.0, "*13 fondos* adjudicados", "counterLogo", {"to": 13, "at": 46.34}],
    [47.0, 49.4, "De $15 a *$149 millones*", "bars", {}],
    [49.4, 52.4, "Magíster en *IA*", "neural", {}],
    [52.4, 55.0, "Experiencia *+ IA*", "plus", {}],
    [55.0, 57.2, "Te ayudamos a *postular*", "docStamp", {}],
    [57.2, 59.1, "Más *probabilidades* de éxito", "gauge", {}],
    [59.1, DURATION, "Te esperamos en *capitalparanegocios.cl*", "logoWeb", {"at": 59.25, "web": 60.9}],
]

BROLL = [  # láminas del carrusel: portada al inicio y calendario cuando lo menciona
    {"src": "assets/carrusel-01.jpg", "start": 0, "end": 2.6},
    {"src": "assets/carrusel-02.jpg", "start": 29.7, "end": 31.75},
    {"src": "assets/carrusel-03.jpg", "start": 31.75, "end": 33.8},
]


def caption_groups(words, max_chars=30, gap=0.3):
    groups, cur = [], []
    for i, w in enumerate(words):
        cur.append(w)
        text = " ".join(x["text"] for x in cur)
        nxt = words[i + 1] if i + 1 < len(words) else None
        brk = (
            nxt is None
            or w["text"][-1] in ".,?!"
            or nxt["start"] - w["end"] > gap
            or len(text + " " + nxt["text"]) > max_chars
        )
        if brk:
            groups.append(cur)
            cur = []
    out = []
    for gi, g in enumerate(groups):
        start = g[0]["start"]
        nxt_start = groups[gi + 1][0]["start"] if gi + 1 < len(groups) else DURATION
        end = min(nxt_start, g[-1]["end"] + 0.6)
        out.append({"start": round(start, 3), "end": round(end, 3),
                    "words": [{"t": w["text"], "s": round(w["start"], 3)} for w in g]})
    return out


data = {
    "duration": DURATION,
    "hook": HOOK,
    "headlines": HEADLINES,
    "broll": BROLL,
    "captions": caption_groups(WORDS),
}

template = (HERE / "template.html").read_text()
html = template.replace("/*__DATA__*/", "const DATA = " + json.dumps(data, ensure_ascii=False) + ";")
html = html.replace("__DURATION__", str(DURATION))
(OUT / "index.html").write_text(html)
print("headlines", len(HEADLINES), "caption groups", len(data["captions"]))
