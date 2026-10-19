# Catálogo de gráficos de titular

Cada titular es `[inicio, fin, "texto con *acento*", "tipo", {opciones}]`. El gráfico ocupa un recuadro
de 220x220 a la izquierda del texto y se anima solo dentro de `[inicio, fin]`. Elige el que mejor
represente lo que dice en ese momento y no repitas el mismo dos veces seguidas.

| Tipo | Qué muestra | Úsalo para | Opciones |
|---|---|---|---|
| `logo` | Tarjeta blanca con el logo real, entra con rebote y brillo | Cuando nombra una marca o herramienta | `src` (obligatoria, p. ej. `assets/corfo-logo.png`), `alt`, `width` (px; 186 por defecto, hasta 212 para logos muy anchos), `badge` (texto en píldora naranja), `at` (segundo en que aparece; por defecto el inicio) |
| `counterLogo` | Trofeo con contador 0→N que se convierte en la tarjeta del logo con "×N" | Logros con marca ("13 fondos CORFO") | `to`, `at` (cuando nombra la marca), `logo: {src, alt, width}` |
| `logoWeb` | (Opcional) logo y luego ventana de navegador con cursor que hace clic | Cierre con llamada a la web | `web` (segundo del cambio a navegador), `at`, `logo: {...}` (si se omite, solo navegador) |
| `counter` | Número que cuenta dentro de un anillo, con etiqueta | Montos y cifras | `from`, `to`, `prefix` (por defecto `$`), `label` (por defecto `MILLONES`) |
| `bars` | Dos barras, la segunda mucho más alta | Rangos "de X a Y" | `a`, `b` (etiquetas, p. ej. `$15M`, `$149M`) |
| `gauge` | Medidor semicircular que sube | Probabilidades, rendimiento, "más" | — |
| `people` | Persona + edificio | "Personas y empresas" | — |
| `personCheck` | Persona con check | Requisito para personas | — |
| `buildingCheck` | Edificio con check | Requisito para empresas | — |
| `rocket` | Cohete despegando | Lanzar, crecer, startups | — |
| `chips` | Tres píldoras apiladas | Listas de 3 cosas | `labels` (3 textos cortos) |
| `bulb` | Ampolleta que se enciende | Innovación, ideas | — |
| `flag` | Bandera de Chile ondeando | Chile, nacional | — |
| `globe` | Globo terráqueo girando | Extranjeros, internacional | — |
| `star` | Estrella con destellos | Destacar algo (sin marca) | — |
| `calendarGrid` | Calendario con días que se iluminan | Fechas, convocatorias | — |
| `calendarCheck` | Calendario con check | Agendar, reservar | — |
| `chat` | Burbuja con puntos escribiendo | Dudas, contacto, WhatsApp | — |
| `download` | Flecha bajando a una bandeja | Descargar guía o recurso | — |
| `checklist` | Tres casillas que se marcan | Test, pasos, requisitos | — |
| `magnifier` | Lupa recorriendo un documento | Analizar, revisar | — |
| `badge` | Credencial con iniciales | Presentarse ("Soy Juan Fierro") | `initials` (por defecto `JF`) |
| `neural` | Red neuronal que se ilumina | Inteligencia artificial | — |
| `plus` | Dos círculos que se suman | "X + Y" | `left`, `right` (textos cortos) |
| `docStamp` | Documento con sello | Postular, aprobar, listo | `text` (por defecto `LISTO`) |

## Añadir un gráfico nuevo

Si ninguno encaja, añade una función al objeto `G` de `assets/template.html` con la firma
`nombre(svg, slot, t0, t1, o)`. Dibuja con los helpers `S()` (SVG) y `H()` (HTML), anima solo con `tl`
dentro de `[t0, t1]` y usa repeticiones finitas (`reps(t0, t1, periodo)`): el render es determinista y
los `repeat: -1` o relojes reales lo rompen. Colores en `C`. Después, `hyperframes lint` y un snapshot.

## Gancho, b-roll y layout

- `hook`: `{ "end": 2.0, "l1": "LÍNEA 1", "l2": "LÍNEA 2" }`. Cada línea se ajusta sola al ancho; la
  segunda sale en naranja. Escríbelas en mayúsculas, cortas y con la promesa concreta del reel (cifra,
  beneficio). Ejemplo real: `FONDOS CORFO` / `HASTA $220 MILLONES`.
- `broll`: `[{ "src", "start", "end", "alt", "top", "width", "height" }]`. Por defecto 960x1200 desde
  y=430 con zoom lento. Con `top/width/height` puedes poner una tarjeta recortada de una lámina sobre el
  torso (p. ej. `top: 1000, width: 760`) para que se vea la lámina y la cara a la vez.
  Con `start: 0` se ve desde el fotograma 0, pero tapa la cara durante el gancho: solo si lo pide.
- `layout` por defecto: `{ "bandTop": 1560, "band": 360, "captionsTop": 1466, "videoTop": 0 }` (franja
  pegada al borde inferior). Más arriba, fuera de la interfaz de Instagram: `bandTop` 1280, `captionsTop` 1186. Variante franja arriba: `{ "band": 380, "captionsTop": 1688, "videoTop": 0 }`. `band` es la altura de la franja;
  `videoTop` cuánto baja el vídeo (por defecto = `band`). Con mucho aire sobre la cabeza (planos medios),
  usa `videoTop: 0` y la franja queda encima del fondo sin recortar al usuario.
