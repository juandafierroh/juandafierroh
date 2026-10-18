#!/usr/bin/env python3
"""Energía del audio para cortar con precisión (Whisper da tiempos de palabra con ±0,2-0,5 s de error).

Uso:
  python loudness.py audio.wav --silences [--thr -38] [--min 0.2]
      Lista los silencios (dB por debajo de --thr durante al menos --min segundos).
  python loudness.py audio.wav --window 48.3 49.0 [--window ...]
      Imprime la energía cada 50 ms en esas ventanas, para afinar un corte o ver
      si una palabra "larga" esconde un "eeh".

El audio debe ser WAV mono 16 kHz (ffmpeg -i video.mp4 -vn -ac 1 -ar 16000 audio.wav).
Ruido de sala típico: -35 a -45 dB; voz: -25 a -5 dB.
"""
import argparse
import wave

import numpy as np


def load_db(path, hop=160):
    w = wave.open(path)
    a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    n = len(a) // hop
    rms = np.sqrt((a[: n * hop].reshape(n, hop) ** 2).mean(1))
    return 20 * np.log10(rms + 1e-9)  # un valor cada 10 ms


def main():
    p = argparse.ArgumentParser()
    p.add_argument("wav")
    p.add_argument("--silences", action="store_true")
    p.add_argument("--thr", type=float, default=-38)
    p.add_argument("--min", type=float, default=0.2)
    p.add_argument("--window", nargs=2, type=float, action="append", default=[])
    a = p.parse_args()
    db = load_db(a.wav)

    if a.silences:
        s = np.convolve(db, np.ones(3) / 3, "same") < a.thr
        out, i = [], 0
        while i < len(s):
            if s[i]:
                j = i
                while j < len(s) and s[j]:
                    j += 1
                if (j - i) / 100 >= a.min:
                    out.append(f"{i / 100:.2f}-{j / 100:.2f}")
                i = j
            else:
                i += 1
        print(" ".join(out))
    for lo, hi in a.window:
        vals = [db[int(t): int(t) + 5].mean() for t in np.arange(lo * 100, hi * 100, 5)]
        print(f"{lo:.2f}:", " ".join(f"{v:.0f}" for v in vals))


if __name__ == "__main__":
    main()
