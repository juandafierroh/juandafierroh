#!/usr/bin/env bash
# Instala el entorno para editar reels: HyperFrames (Node 22+, FFmpeg, Chrome headless)
# y faster-whisper en local. Desactiva la telemetría de HyperFrames.
set -euo pipefail

WHISPER_ENV="${WHISPER_ENV:-$HOME/.venvs/whisper}"

node_major=$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)
if [ "$node_major" -lt 22 ]; then
  echo "Necesitas Node 22 o superior (tienes: $(node -v 2>/dev/null || echo ninguno))." >&2
  exit 1
fi
command -v ffmpeg >/dev/null || { echo "Falta FFmpeg (apt install ffmpeg / brew install ffmpeg)." >&2; exit 1; }

export HYPERFRAMES_NO_TELEMETRY=1
npm install -g hyperframes
hyperframes telemetry disable
hyperframes browser ensure

python3 -m venv "$WHISPER_ENV"
"$WHISPER_ENV/bin/pip" install -q --upgrade pip faster-whisper

rc="$HOME/.bashrc"; [ -n "${ZSH_VERSION:-}" ] || [ "$(basename "${SHELL:-}")" = zsh ] && rc="$HOME/.zshrc"
grep -q HYPERFRAMES_NO_TELEMETRY "$rc" 2>/dev/null || echo 'export HYPERFRAMES_NO_TELEMETRY=1' >> "$rc"

hyperframes doctor || true
echo
echo "Listo. Transcribir: $WHISPER_ENV/bin/python reels/transcribe.py mi-reel.mp4"
