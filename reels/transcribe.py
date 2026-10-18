#!/usr/bin/env python3
"""Transcribe un audio/vídeo en local con faster-whisper, con el tiempo de cada palabra.

Salida: JSON [{"text", "start", "end"}, ...] (segundos), el formato que importa
`hyperframes transcribe <archivo>.json` para generar subtítulos.

Uso:
  python reels/transcribe.py mi-reel.mp4                  # -> mi-reel.words.json
  python reels/transcribe.py mi-reel.mp4 -m large-v3 -o transcript.json
"""
import argparse
import json
from pathlib import Path

from faster_whisper import WhisperModel


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("input", help="Archivo de audio o vídeo (mp4, mov, mp3, wav...)")
    p.add_argument("-o", "--output", help="JSON de salida (por defecto <input>.words.json)")
    p.add_argument("-m", "--model", default="small", help="tiny, base, small, medium, large-v3 (default: small)")
    p.add_argument("-l", "--language", default="es", help="Código de idioma (default: es)")
    p.add_argument("--device", default="auto", help="cpu, cuda o auto")
    p.add_argument("--compute-type", default="int8", help="int8 (CPU), float16 (GPU)...")
    args = p.parse_args()

    model = WhisperModel(args.model, device=args.device, compute_type=args.compute_type)
    segments, info = model.transcribe(
        args.input,
        language=args.language,
        word_timestamps=True,
        vad_filter=True,
    )

    words = []
    for seg in segments:
        for w in seg.words or []:
            text = w.word.strip()
            if text:
                words.append({"text": text, "start": round(w.start, 3), "end": round(w.end, 3)})

    out = Path(args.output) if args.output else Path(args.input).with_suffix(".words.json")
    out.write_text(json.dumps(words, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{len(words)} palabras ({info.duration:.1f}s de audio, idioma {info.language}) -> {out}")


if __name__ == "__main__":
    main()
