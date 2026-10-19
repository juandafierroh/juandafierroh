# Problemas conocidos y cómo resolverlos

Todo esto pasó editando el primer reel. Si algo falla, busca aquí antes de investigar.

## Red del entorno en la nube (proxy con lista de dominios permitidos)

El usuario cambia los dominios en *Edit → Network access → Allowed domains* del entorno. Pídele
exactamente los que falten (usa `read_documentation` con el tema `environment.network` para que vea el
botón). npm, PyPI y GitHub suelen estar permitidos de serie.

| Para qué | Dominios |
|---|---|
| Modelos de Whisper (Hugging Face) | `huggingface.co`, `*.hf.co`, `*.huggingface.co` (los archivos salen de `cas-server.xethub.hf.co`, `cas-bridge.xethub.hf.co`, `us.aws.cdn.hf.co`) |
| Bajar vídeos de Drive > 10 MB | `drive.google.com`, `drive.usercontent.google.com` + archivo compartido "cualquier persona con el enlace" |
| Fuentes | `fonts.googleapis.com`, `fonts.gstatic.com` (ya vienen en `assets/vendor`, no hacen falta) |

- **jsDelivr y otros CDN están bloqueados**: por eso GSAP y las fuentes van dentro del proyecto
  (`assets/vendor`). Nunca enlaces scripts por CDN en la composición: el render falla con
  `sub_timeline_script_failure`.
- Logos de webs (Wikipedia, webs de marcas, clearbit, favicons) suelen estar bloqueados. Usa los archivos
  del usuario, sus láminas o `npm pack simple-icons` (iconos SVG de marcas globales).
- No esquives el bloqueo descargando lo mismo desde otro sitio: pide el dominio.

## Python / Whisper

- **PyAV 19 rompe faster-whisper 1.2.1** (`open() got an unexpected keyword argument 'metadata_errors'`):
  instala `av<19` (setup.sh ya lo hace).
- Primera ejecución de cada modelo: descarga (small ~0,5 GB, medium ~1,5 GB, large-v3 ~3 GB).
- `--keep-fillers` desactiva el VAD; si aparecen frases inventadas en silencios largos, compáralas con la
  energía (si es silencio, son inventadas).
- Tiempos de palabra con ±0,2–0,5 s de error, peor en tomas repetidas: corta por energía, no solo por
  Whisper.
- El prompt de muletillas también **inventa** muletillas ("o sea" donde no lo hay) y frases repetidas al
  verificar un montaje. Antes de dar por mala una zona, transcríbela aislada **sin** prompt y mira la
  energía. Lo mismo con cierres típicos inventados: "¡Suscríbete!", "Gracias por ver el video" (palabras
  con duración cero o sobre silencio).
- Palabras clave dudosas (p. ej. "sin"/"de inicio de actividades"): contrasta con medium y small en la
  ventana aislada; si la mayoría coincide y encaja con las láminas, usa esa.

## Grabaciones en exterior

- El ruido de fondo ronda -32 dB: usa `loudness.py --silences --thr -27` (en interior, -38).
- Plano medio con mucho cielo/fondo arriba: `layout.videoTop: 0` (la franja va sobre el fondo).

## ffmpeg

- Hacer 20+ `trim` del mismo archivo en un solo `filter_complex` agota la memoria (SIGKILL). Usa
  `cut_aroll.py`, que codifica tramo a tramo y concatena.
- Los clips de OBS suelen venir a 60 fps; el reel va a 30 (`fps=30` en cada tramo).

## HyperFrames

- Telemetría: `hyperframes telemetry disable` + `HYPERFRAMES_NO_TELEMETRY=1` (en `~/.bashrc`).
- Chrome para renderizar: `hyperframes browser ensure`.
- `gsap_css_transform_conflict`: no pongas `transform` en CSS a algo que GSAP anima; define el estado
  inicial dentro de `fromTo`.
- No animes `autoAlpha`/`visibility` en elementos `.clip` (solo el `<video>` lo es en la plantilla).
- Render de 62 s ≈ 5 min en 4 CPU (captura por software).
- **Espera del render**: `until ! pgrep -f "hyperframes render"` se detecta a sí mismo y no termina nunca.
  Lanza el render con `run_in_background` y espera la notificación, o comprueba el log
  (`grep "MB ·" render.log`).

## Contenido

- El primer fotograma es la miniatura: el gancho no puede entrar con fundido ni escalado que lo corte.
- El encuadre de Juan suele dejar la cabeza pegada arriba: por eso el vídeo baja ~380 px y la franja de
  titulares queda encima. Comprueba con fotogramas que la franja no corte el pelo.
- Subtítulos a ~1688 px: debajo de la barbilla incluso con el zoom de 1,08.
