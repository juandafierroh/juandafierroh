# PRODUCT_SPEC.md — Recurra (Restaurant Growth AI Platform)

Especificación funcional del prototipo. Resume las decisiones de producto tomadas al construir el sitio y sirve como referencia para evolucionar el proyecto hacia una implementación real (WordPress + WooCommerce/WPCafe + GoHighLevel + un Restaurant Orchestrator).

## 1. Reposicionamiento estratégico

**Categoría principal:** Plataforma de crecimiento con IA para restaurantes (Restaurant Growth AI Platform). No se presenta como POS, carta QR, bot de pedidos, sistema de comandas ni programa de puntos — esas son partes del producto, nunca su propuesta central.

**Promesa central:** "Convierte más consultas en visitas, pedidos y clientes frecuentes." — desde la primera búsqueda hasta la próxima visita.

**Nombre del producto (provisional):** *Recurra*. Como en la versión anterior de este prototipo, el nombre es intencionalmente reemplazable — ver README §"Cómo cambiar nombre, colores y precios". El nombre evoca "recurrencia", el hilo conductor de toda la propuesta.

## 2. El ciclo de crecimiento (flywheel)

Siete etapas que se retroalimentan entre sí, representadas como un diagrama circular en `index.html#ciclo`:

1. **Atraer** — campañas, promociones, contenido, referidos, recuperación de inactivos.
2. **Conversar** — agentes de IA en teléfono, WhatsApp, web y QR.
3. **Convertir** — pedido, reserva, visita, pago, evento, recompra.
4. **Atender** — conexión con cocina, POS existente o Recurra Operaciones.
5. **Conocer** — el perfil del cliente se actualiza con cada interacción.
6. **Hacer volver** — detección de atraso respecto del ciclo personal + acción.
7. **Recomendar** — una buena experiencia genera reseñas, referidos y nueva atracción.

## 3. Los siete pilares

| Pilar | Nombre en español | Página de profundidad | Objetivo |
|---|---|---|---|
| AI Attract | Atracción Inteligente | `crecimiento-ia.html` | Generar oportunidades y activar la base de clientes. |
| AI Agent | Agentes Inteligentes | `agentes-ia.html` | Atender cada oportunidad por teléfono, WhatsApp, web y QR. |
| AI Convert | Conversión Inteligente | `agentes-ia.html#conversion` | Guiar la conversación hasta la acción comercial. |
| Customer Intelligence | Inteligencia de Clientes | `clientes.html` | Perfil 360 unificado por cliente. |
| AI Retention | Recurrencia Inteligente | `recurrencia.html` | Ciclo personal de visita y reactivación individual. |
| AI Reputation | Reputación y Recuperación | `reputacion.html` | Recuperar la experiencia antes de perder la relación. |
| Revenue Intelligence | Inteligencia de Crecimiento | `inteligencia.html` | Medir qué genera visitas, pedidos y recurrencia. |

## 4. Clasificación de funcionalidades

Tres etiquetas visuales (`rt-badge`) usadas de forma consistente en todo el sitio:

- **Disponible** (`rt-badge--available`, verde) — funciona hoy en el PMV.
- **En beta** (`rt-badge--beta`, violeta) — funciona con alcance limitado o en validación.
- **Próximamente** (`rt-badge--soon`, ámbar) — siguiente etapa, no disponible aún.

Se usan además `rt-badge--integration` (depende de un conector externo), `rt-badge--roadmap` (visión de largo plazo, sin compromiso de fecha), `rt-badge--error`/`rt-badge--neutral` (estados operativos, no promesas de producto) y `rt-badge--ai` (recomendaciones/generado por IA).

**Regla dura seguida en todo el copy:** nunca se presenta una funcionalidad "Próximamente" o "Roadmap" como si estuviera disponible hoy.

## 5. Recurrencia individual (no un umbral único)

El motor de recurrencia calcula un **ciclo personal** por cliente a partir de su historial — nunca aplica una regla como "enviar promoción a todos después de 30 días". Ejemplo usado en todo el sitio:

```text
Claudia Soto — visita cada 9 a 12 días. Han pasado 18 días → atrasada, riesgo alto.
Juan Pérez   — visita cada 40 a 50 días. Han pasado 26 días → dentro de su ciclo, sin acción.
María González — una visita → estimular segunda visita, sin ciclo definido todavía.
Rodrigo Fuentes — feedback negativo hace 2 días → caso abierto, campañas suspendidas.
```

Variables consideradas: recencia, frecuencia, intervalos históricos, variabilidad, ticket promedio, tendencia de gasto, día/horario habitual, productos favoritos, canal, respuesta a promociones, uso de descuentos, reclamos, valor de vida, probabilidad de regreso.

Toda campaña de reactivación reserva un **grupo de control** (clientes elegibles que deliberadamente no reciben el mensaje) para medir el margen incremental real, no solo la correlación.

## 6. Reputación ética (sin review gating)

Flujo usado en `reputacion.html` e `index.html`:

```text
Feedback para todos
→ recuperación cuando existe un problema
→ invitación neutral a compartir la experiencia
```

Explícitamente **no** se implementa el patrón "positivo → Google, negativo → ocultar". Todos los clientes reciben la misma invitación a compartir su experiencia; la recuperación siempre ocurre antes de pedir una reseña.

## 7. La capa operacional (no es el centro del producto)

Distribución de contenido del sitio: ~60% crecimiento/clientes/IA/recurrencia, ~25% agentes/conversión/experiencia, ~15% integraciones/operación — reflejado en la arquitectura de información y en que `operaciones.html` es una página secundaria, nunca enlazada desde el hero.

Dos modalidades:

- **Modalidad Connect** — para restaurantes que ya tienen POS (Toteat, Fudo, Justo, sistemas propios). El sistema existente sigue administrando caja, inventario, mesas y cierre; Recurra agrega IA, agentes, CRM, campañas, conversión, reactivación, reputación y analítica.
- **Operations Lite** — módulo operacional **opcional**, solo para quienes no tienen ningún sistema: pedidos, caja básica, KDS, turnos, medios de pago, Bsale, mesas simples, reportes.

Tres modos de integración explicados en `integraciones.html`: **nativa** (sincronización automática), **parcial**, y **puente** (KDS/impresora + conciliación manual, sin sincronizar caja/stock/mesas en tiempo real — el sitio es explícito sobre esta limitación).

## 8. Modelo de datos (window.GP_DATA / window.GrowthPlatformAPI)

Todos los datos viven en `assets/js/demo-data.js` (`window.GP_DATA`) y se leen exclusivamente a través de `assets/js/growth-platform-api.js` (`window.GrowthPlatformAPI`), que expone: `getDashboard()`, `getOpportunities()`, `getCampaigns()`, `createCampaign()`, `generateCampaignCopy()`, `getConversations()`, `getCustomers()`, `getCustomerProfile()`, `getAtRiskCustomers()`, `getRecommendations()`, `getReputationCases()`, `getFunnel()`, `getIntegrations()`, `getOrders()`. Cada método incluye un comentario `// TODO integración` señalando el punto de conexión futuro (GoHighLevel, WooCommerce/WPCafe, Mercado Pago, Bsale, un Restaurant Orchestrator).

Restaurante ficticio: **Sabor Urbano**, sucursal Providencia (Santiago de Chile). Indicadores de ejemplo (todos demostrativos): 1.248 oportunidades/mes, 642 conversaciones, 231 pedidos o reservas, 36% de conversión, 87 clientes en riesgo, 42 reactivados, $1.860.000 en ventas atribuidas, 4,6 de valoración promedio, 18 casos recuperados.

Clientes de ejemplo: Claudia Soto, Juan Pérez, María González, Rodrigo Fuentes y Fernanda Rivas (detalle completo en §5 y en `assets/js/demo-data.js`).

## 9. Arquitectura de información

| Página | Propósito |
|---|---|
| `index.html` | Home comercial completo: hero, flywheel, problema, 7 pilares, agentes, campañas, conversión, customer intelligence, recurrencia, reputación, revenue intelligence, integraciones, modalidad Connect, Operations Lite (módulo opcional), casos de uso, planes, FAQ, CTA. |
| `crecimiento-ia.html` | Atracción Inteligente en profundidad: campañas, audiencias, leads, atribución, recomendaciones de IA, grupos de control. |
| `agentes-ia.html` | Agentes por canal (teléfono/WhatsApp/web-QR), ejemplos de conversación, handoff, y Conversión Inteligente (`#conversion`). |
| `clientes.html` | Perfil 360, segmentos, timeline, consentimientos. |
| `recurrencia.html` | Ciclo individual, variables, acciones posibles, métricas de reactivación. |
| `reputacion.html` | Feedback, sentimiento, casos, tendencias, flujo ético sin review gating. |
| `inteligencia.html` | Dashboard, funnel, cohortes/LTV, panel de oportunidades de crecimiento. |
| `integraciones.html` | Conectores, modos de integración, modalidad Connect. |
| `operaciones.html` | Página secundaria: POS, KDS, Operations Lite. |
| `precios.html` | 4 planes (Growth / Growth AI / Growth 360 / Add-on Operations Lite), precios en una constante JS editable. |
| `demo/*.html` | 9 interfaces funcionales (ver README para el detalle de cada una). |

## 10. Componentes reutilizables

Definidos una sola vez en `assets/css/{tokens,base,components,pages,demo}.css` y `assets/js/{components,navigation}.js`: header/nav responsive, footer, botones, tarjetas, badges de estado (7 variantes), tabs, acordeón, modal, tooltip, toast, tabla responsive (variante `stack`), formularios, mockup de dispositivo, diagrama de flujo numerado, **flywheel circular de 7 etapas**, **tarjetas de pilar**, **timeline de cliente**, **tarjeta de recomendación de IA**, **panel de oportunidades de crecimiento**, **funnel horizontal**, **estado de ciclo/riesgo**, **tarjeta de caso de reputación**, grilla de estado de agentes, selector Connect/Operations Lite, filtro por etiqueta, tablero Kanban, gráficos de barras en CSS puro.

`assets/js/growth-platform-api.js` es la única puerta de entrada a los datos — ninguna pantalla `/demo` debería leer `GP_DATA` directamente (ver README §Migración).
