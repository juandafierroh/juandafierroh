"""cuts.json = [0.65, 133.68] menos eliminaciones manuales menos silencios > 0,25 s (deja 0,06 s a cada lado)."""
import json, subprocess
START, END = 0.65, 133.68
REMOVE = [  # (inicio, fin, motivo)
    (7.95, 9.22, "pausa"),
    (21.12, 21.88, "pausa"),
    (55.05, 55.82, "pausa"),
    (60.36, 60.70, "muletilla 'o sea'"),
    (63.32, 63.96, "murmullo en 'vas a ejecutar'"),
    (83.52, 84.13, "arranque en falso 'uno exige,'"),
    (84.30, 84.93, "pausa"),
    (96.55, 98.12, "arranque en falso 'El fondo, y'"),
    (100.62, 103.62, "toma repetida 'El Fondo Crea y Valida,' (se queda la segunda)"),
]
sil = subprocess.run(["/opt/whisper-env/bin/python", "/home/user/juandafierroh/.claude/skills/editar-reel/scripts/loudness.py",
                      "audio.wav", "--silences", "--thr", "-27", "--min", "0.25"], capture_output=True, text=True).stdout.split()
for s in sil:
    a, b = map(float, s.split("-"))
    if b - a > 0.25:
        REMOVE.append((a + 0.06, b - 0.06, "silencio"))
REMOVE.sort()
keep, t = [], START
for a, b, _ in REMOVE:
    a, b = max(a, START), min(b, END)
    if b <= t:
        continue
    if a > t + 0.05:
        keep.append([round(t, 2), round(a, 2)])
    t = max(t, b)
if END > t + 0.05:
    keep.append([round(t, 2), END])
json.dump(keep, open("cuts.json", "w"))
print(len(keep), "tramos,", round(sum(b - a for a, b in keep), 2), "s")
