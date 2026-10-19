---
name: editar-reel
description: Edita reels verticales de Juan Fierro (Capital para Negocios / Innovarium) de principio a fin con HyperFrames y faster-whisper. Transcribe con tiempos por palabra, quita silencios, muletillas y tomas repetidas (se queda con la última), monta a 1080x1920 30 fps con franja de titulares animados, gancho inicial, logos reales de las marcas que nombra y subtítulos de una línea, revisa fotogramas y renderiza el MP4. Úsala siempre que el usuario pida editar, montar, cortar, subtitular o "hacer" un reel, short, TikTok o vídeo vertical a partir de sus clips o de una carpeta (local o de Google Drive), aunque no mencione HyperFrames ni Whisper, y también para rehacer o ajustar un reel ya editado.
---

# Editar reel

Flujo completo para convertir clips en bruto en un reel listo para publicar. Se construyó editando el
reel de Fondos CORFO; en el repo `juandafierroh`, `reels/fondos-corfo/` es ese ejemplo real terminado
(cortes, palabras corregidas, titulares). Cuando dudes de cómo quedó algo, míralo ahí si está disponible.

`<skill>` en los comandos = la carpeta de esta skill (en el repo: `.claude/skills/editar-reel`).

## Lo que el usuario espera (sus preferencias por defecto)

Si el usuario no dice otra cosa, el reel sale así; no le vuelvas a preguntar por esto:

1. **Limpieza**: sin silencios, sin muletillas (eh, mmm, este, o sea…) y sin tomas repetidas. Si repite
   una frase, **se queda la última toma**.
2. **Formato**: 1080x1920, 30 fps, H.264 + AAC.
3. **Titulares**: en una franja **pegada al borde inferior** (preferencia actual; antes iba arriba), de 2 a 5
   palabras, cambian cada 2–3 s y resumen lo que dice, cada uno con un gráfico animado propio.
4. **Logos**: cuando nombra una herramienta o marca, su **logo real** en pantalla. Nunca un logo inventado
   ni redibujado: si no tienes el real, díselo y pídeselo.
5. **Subtítulos**: pequeños, una sola línea, justo encima de la franja, palabra activa resaltada.
6. **Gancho**: los 2 primeros segundos, dos líneas grandes en mayúsculas. Tienen que verse completas
   desde el fotograma 0, porque ese fotograma es la miniatura del reel.
7. **Revisión**: antes de exportar, un fotograma por bloque, mirarlos y arreglar texto cortado, texto
   encima de la cara o poco contraste.
8. **Render** con HyperFrames y decirle dónde está el archivo.
9. **Zoom de cámara con ritmo**: cada corte con un encuadre distinto (de plano normal a primer plano),
   empuje lento dentro del tramo y golpes de zoom en las cifras y palabras clave.

Estética de su marca (ya está en la plantilla): azul marino `#0b1636`/`#13245a`, naranja `#ff6b2c`,
celeste `#38bdf8`, tipografía Archivo (800–900) y JetBrains Mono para etiquetas. Habla español de Chile.

## Paso 0 — Entorno

```bash
bash <skill>/scripts/setup.sh   # HyperFrames, Chrome headless, faster-whisper, telemetría off
export HYPERFRAMES_NO_TELEMETRY=1
hyperframes doctor
```

`setup.sh` crea el entorno de Python en `~/.venvs/whisper`; usa `~/.venvs/whisper/bin/python` para los
scripts de esta skill. Si algo de red falla (descarga de modelos, Drive, logos), lee
`references/problemas.md`: casi todo lo que puede fallar ya pasó una vez y está documentado allí, con
los dominios exactos que el usuario debe permitir.

Trabaja en una carpeta del scratchpad (`reelN/`), no dentro del repo: los vídeos pesan cientos de MB.

## Paso 1 — Conseguir los clips

- Ruta de Windows (`D:\...`): no es accesible desde la nube. Pídele que los suba a Google Drive o los
  adjunte en el chat.
- Google Drive: busca la carpeta con el conector (`search_files` con `parentId = '<id>'`). El conector solo
  baja archivos de hasta 10 MB (imágenes sí; vídeos casi nunca). Para vídeos: `curl -L
  "https://drive.usercontent.google.com/download?id=<ID>&export=download&confirm=t"`, lo que requiere el
  archivo compartido como "cualquier persona con el enlace" y el dominio permitido (ver problemas.md).
  Al terminar, recuérdale que puede volver a dejarlo privado.
- Imágenes de la carpeta (carruseles, láminas): son material de apoyo; úsalas como b-roll cuando hable
  de ellas y como fuente de logos.
- Varios clips "en orden": ordénalos por nombre y concaténalos antes de transcribir.

Mira 4 fotogramas del bruto (`ffmpeg -ss T -frames:v 1`) para conocer encuadre, orientación y fps.

## Paso 2 — Transcribir

```bash
ffmpeg -i bruto.mp4 -vn -ac 1 -ar 16000 audio.wav
~/.venvs/whisper/bin/python <skill>/scripts/transcribe.py audio.wav -m large-v3 --keep-fillers -o words_raw.json
```

`--keep-fillers` pide a Whisper que escriba las muletillas (si no, las omite y no puedes cortarlas).
large-v3 acierta mucho más el texto (números, nombres); en CPU tarda ~3–4 min por minuto de audio.

Desconfía de Whisper en tres cosas: (1) **tiempos** en zonas con tomas repetidas, que a veces funde en
una sola palabra larga; (2) palabras **inventadas** en silencios, típico "¡Suscríbete!" al final;
(3) **números y marcas** ("billones" por "millones", "magisterio" por "magíster"). Contrasta con la
energía del audio (paso 3) y con las láminas del usuario.

## Paso 3 — Decidir los cortes (`cuts.json`)

1. Imprime la transcripción con los huecos > 0,35 s marcados y lee el guion completo.
2. Marca las **tomas repetidas**: frases que empiezan igual o reformulan lo mismo. Quédate con la
   última aunque la anterior tenga una palabra más; si la última pierde algo importante, quédate con
   ella igual y avísale en el resumen final.
3. Saca los silencios reales: `scripts/loudness.py audio.wav --silences`. Ajusta `--thr` al ruido de sala
   (mira la energía de los primeros segundos en silencio).
4. Palabras sospechosamente largas (> 0,8 s) suelen esconder un "eeh": re-transcribe esa ventana sola con
   large-v3 y el prompt de muletillas, y mira la energía fina con `loudness.py audio.wav --window a b`.
5. Escribe `cuts.json` como `[[inicio, fin], ...]` en segundos del bruto: corta en los silencios,
   deja ~0,05–0,1 s de margen, comprime pausas internas > 0,3 s y quita muletillas y tomas descartadas.
6. **Verifica antes de montar el vídeo**: arma solo el audio con esos cortes (atrim + concat), transcríbelo
   y léelo. Debe sonar como un guion limpio, cada idea una sola vez. Si no, corrige y repite.

## Paso 4 — Vídeo base y palabras finales

```bash
~/.venvs/whisper/bin/python <skill>/scripts/cut_aroll.py bruto.mp4 cuts.json proyecto/assets/aroll.mp4
```

Escribe también `aroll.segments.json` (inicio/fin real de cada tramo): el zoom por corte lo anima la
plantilla a partir de él (paso 6, `zoom`), así que no hornees zoom en el corte. Al redondear cada tramo a
fotogramas, la duración final se desplaza
unas centésimas, así que **transcribe de nuevo el audio de `aroll.mp4`** (large-v3, `--keep-fillers`) para
tener tiempos exactos de subtítulos. Luego corrige a mano en un `words_final.json`: palabras mal oídas,
marcas, URLs unidas (`capitalparanegocios.cl`), y palabras que Whisper se comió (recupéralas de la
transcripción anterior y ajusta sus tiempos con la energía). Ejemplo real: `reels/fondos-corfo/words_fix.py`.

## Paso 5 — Layout

Por defecto (lo que pidió explícitamente): vídeo a pantalla completa sin desplazar y franja de
gancho/titulares **al borde inferior**, aunque Instagram ponga encima su texto del post:

```json
"layout": {"bandTop": 1560, "band": 360, "captionsTop": 1466, "videoTop": 0}
```

Subtítulos justo encima de la franja; deben quedar bajo la barbilla en todos los encuadres (compruébalo en
los fotogramas con más zoom). La zona de arriba queda libre para el b-roll (tarjetas recortadas de sus
láminas, solo título y monto para que se lean). Variante antigua, franja arriba: omite `bandTop` y usa
`videoTop` = `band` (o 0 si hay mucho aire sobre la cabeza).

**Zoom** (`zoom` en reel.json, ver cabecera de `make.py`): patrón de encuadres por corte
(`[1.0, 1.14, 1.06, 1.26, 1.0, 1.18, 1.1, 1.3]`), `push` 0,05 alternando acercar/alejar, `calm` 1.0 durante
el b-roll y `punches` en las cifras clave (el segundo exacto de la palabra en `words_final.json`). Pon
`origin` a la **altura de la barbilla** (p. ej. `[540, 1000]`): así el zoom crece hacia arriba y la cara
nunca baja sobre los subtítulos.

## Paso 6 — Titulares, gráficos, logos y b-roll

Planifica una tabla `[inicio, fin, texto, gráfico, opciones]` sobre los tiempos de `words_final.json`:

- 2–5 palabras, en español, resumen de lo que dice en ese momento; marca la palabra clave con `*así*`
  (sale en naranja).
- Duración 2–3 s; el primero empieza cuando termina el gancho; el último llega hasta el final.
- Cada titular con un gráfico distinto y pertinente. Catálogo y opciones: `references/graficos.md`.
- **Logos**: cuando nombra una marca, el titular de ese momento usa el gráfico `logo` (o `counterLogo` /
  `logoWeb`) y la tarjeta aparece en el instante en que la nombra (`at`). Fuentes de logos reales, en
  orden: archivos que te dé el usuario → recorte de sus láminas (las suyas suelen traer el de CORFO) →
  paquete npm `simple-icons` para marcas globales (npm sí tiene red). Limpia el fondo con
  `scripts/clean_logo.py` (usa `--crop` y `--scale 6` para recortes pequeños). Si no hay logo real, no
  lo fabriques: usa un gráfico genérico y díselo en el resumen, pidiéndole el archivo.
- **B-roll**: si dice "acá te muestro…" y tiene láminas, ponlas en `broll` durante esa frase. No cubras su
  cara en el gancho salvo que él lo pida.

## Paso 7 — Generar y validar la composición

```bash
~/.venvs/whisper/bin/python <skill>/scripts/make.py reel.json proyecto
cd proyecto && hyperframes lint && hyperframes check
```

`reel.json` está descrito en la cabecera de `make.py`; `reels/fondos-corfo/make.py` tiene un reel completo
de ejemplo (sus `HEADLINES` y `BROLL` son el formato de `headlines` y `broll`). El aviso
`composition_file_too_large` es esperable; los demás errores o avisos hay que resolverlos.

## Paso 8 — Revisión de fotogramas (obligatoria)

```bash
hyperframes snapshot --at 0,<un instante por titular, al 75% de su duración>,<duración> --no-end -o ../snaps
```

Mira las hojas de contactos con Read. Revisa en cada fotograma: texto cortado o que se sale de su caja,
texto o gráfico encima de la cara, contraste, gráficos que se tapan entre sí. Además: el **fotograma 0**
debe mostrar el gancho completo (es la miniatura) y el **último fotograma** debe tener el subtítulo final
visible. Corrige, regenera y vuelve a sacar solo los fotogramas afectados hasta que esté limpio.

## Paso 9 — Render y entrega

```bash
hyperframes render --fps 30 --quality looks -o ../reel-<tema>.mp4   # ~5 min por minuto de vídeo
```

Lánzalo en segundo plano y espera con un bucle que no se detecte a sí mismo (`pgrep -f "hyperframes render"`
se encuentra a sí mismo; mira el log o el proceso de node). Verifica con `ffprobe` (1080x1920, 30 fps,
duración), `volumedetect` (media ~ -18 dB, picos < 0 dB) y 3–5 fotogramas del MP4 final. Envía el archivo
con SendUserFile, da la ruta absoluta y avisa de que el contenedor es temporal (que lo descargue).

Guarda en el repo, en `reels/<tema>/`, los archivos ligeros del montaje (`cuts.json`, `words_final.json`,
`reel.json`, correcciones) y haz commit en la rama de trabajo; nunca los vídeos.

## Resumen para el usuario

Breve, en español: dónde está el vídeo; qué tomas se quedaron; qué palabras corregiste; qué logos faltan;
y cualquier decisión discutible (p. ej. que la última toma perdió una palabra). Ofrece los textos para
redes: plantillas en `references/captions.md`.
