# Recurra — Restaurant Growth AI Platform

Sitio comercial + prototipo funcional de una **plataforma de crecimiento con inteligencia artificial para restaurantes** (restobares, pizzerías, sushi, hamburgueserías, panaderías, dark kitchens y cadenas gastronómicas). **HTML5 + CSS3 + JavaScript vanilla**, sin frameworks, sin build step, sin backend, sin claves ni pagos reales.

> "Convierte más consultas en visitas, pedidos y clientes frecuentes."

Este **no** es un sitio de POS. El POS/operación aparece como integración o módulo opcional (Operations Lite); el centro del producto son los agentes de IA, las campañas, la inteligencia de clientes, la recurrencia individual, la reputación y la analítica de crecimiento.

## Cómo abrir el proyecto

No requiere instalación.

1. **Directo**: abre `index.html` con doble clic.
2. **Servidor estático simple** (recomendado, para que `localStorage` y las rutas relativas se comporten igual que en producción):
   ```bash
   python3 -m http.server 8080
   # o
   npx serve .
   ```
   Luego visita `http://localhost:8080`.

Todas las páginas funcionan sin conexión a internet ni backend. Los "pagos", "envíos de WhatsApp", "llamadas" y "sincronizaciones" son simulaciones visuales con datos ficticios.

## Estructura del proyecto

```
/
├── index.html              Home comercial (20 secciones: hero, flywheel, pilares, agentes...)
├── crecimiento-ia.html      Atracción Inteligente (campañas, audiencias, atribución)
├── agentes-ia.html          Agentes de IA (teléfono/WhatsApp/web) + Conversión Inteligente
├── clientes.html            Customer Intelligence (perfil 360, segmentos, consentimientos)
├── recurrencia.html         Recurrencia Inteligente (ciclo individual, reactivación)
├── reputacion.html          Reputación y Recuperación (sin review gating)
├── inteligencia.html        Revenue Intelligence (dashboard, funnel, oportunidades)
├── integraciones.html       Conectores + modalidad Connect (nativa / parcial / puente)
├── operaciones.html         Página secundaria: POS, KDS, Operations Lite
├── precios.html             4 planes, precios editables en una constante JS
├── demo/
│   ├── growth-dashboard.html  Revenue Intelligence: KPIs, recomendaciones de IA, canales
│   ├── campaigns.html         Creador de campañas (objetivo, audiencia, copy con IA, envío)
│   ├── agent-center.html      Estado de agentes, conversaciones, transcripciones
│   ├── customer-360.html      Perfil de cliente completo + timeline
│   ├── reactivation.html      Reactivación individual + grupo de control
│   ├── reputation.html        Casos de reputación, sentimiento, respuestas sugeridas
│   ├── funnel.html            Funnel de oportunidad → cliente frecuente, con filtros
│   ├── integrations.html      Estado de integraciones + cola de Print Bridge
│   └── operations.html        Tablero de pedidos/cocina (no es un POS completo)
├── assets/
│   ├── css/
│   │   ├── tokens.css        Variables de marca: colores, radios, sombras, tipografía
│   │   ├── base.css          Reset, layout utilitario, accesibilidad base
│   │   ├── components.css    Header, footer, botones, badges, tabs, modal, flywheel, pilares...
│   │   ├── pages.css         Estilos de páginas comerciales (hero, chat, planes, bridge...)
│   │   └── demo.css          Estilos de las interfaces /demo
│   ├── js/
│   │   ├── components.js         Tabs/acordeón/modal/tooltip/toast + RTFormat (CLP, teléfono, fecha)
│   │   ├── navigation.js         Año dinámico, enlace activo, scroll con offset de header
│   │   ├── demo-data.js          window.GP_DATA — datos ficticios de "Sabor Urbano"
│   │   ├── growth-platform-api.js window.GrowthPlatformAPI — adaptador único (ver más abajo)
│   │   └── *-demo.js             Comportamiento de cada pantalla /demo
│   ├── icons/sprite.svg      Fuente canónica de los íconos (se inlinea por página para file://)
│   └── images/
├── README.md
└── PRODUCT_SPEC.md           Especificación funcional y decisiones de posicionamiento
```

## Cómo cambiar nombre, colores y precios

**Nombre y logo**: "Recurra" y el isotipo `R` (`.rt-logo__mark`) aparecen en el header y footer de cada página — un buscar-y-reemplazar de "Recurra" en todos los `.html` lo actualiza. El isotipo es intencionalmente provisional.

**Colores, radios y sombras**: todo vive en `assets/css/tokens.css` (incluye `--color-ai` para todo lo relacionado con inteligencia artificial/recomendaciones, y `--color-teal`/`--color-rose` como acentos decorativos de los pilares). Cambiar esas variables se propaga a todo el sitio.

**Precios**: en `precios.html`, dentro de un `<script>` claramente comentado, hay una constante `PRICING_PLANS` (array de objetos `{ id, name, tagline, priceFrom, highlight, features }`). Edítala ahí — las cuatro tarjetas de planes se generan desde ese arreglo. No hay precios reales definidos, solo placeholders del tipo "Desde $XX.XXX + IVA por local".

**Datos de demostración**: todo en `assets/js/demo-data.js` (`window.GP_DATA`): restaurante, KPIs, oportunidades, campañas, conversaciones, clientes (con su ciclo de visitas), casos de reputación, funnel e integraciones. Cambiar esos datos actualiza automáticamente las 9 pantallas `/demo` y las páginas comerciales que los consumen.

## Funcionalidades — qué está disponible, qué es beta, qué es roadmap

Ver `PRODUCT_SPEC.md` para el detalle completo. En todo el sitio se usan 3 badges de forma consistente:

- **Disponible** (`rt-badge--available`) — funciona hoy en el PMV: agentes de teléfono/WhatsApp/web básicos, campañas y copy con IA, segmentación, ciclo individual de recurrencia, casos de reputación con respuesta sugerida, dashboard de crecimiento, integraciones nativas principales (WPCafe, WooCommerce, Mercado Pago, Bsale, GoHighLevel).
- **En beta** (`rt-badge--beta`) — funciona con alcance limitado: recomendación de mejor momento de envío, upselling automático, audiencias dinámicas, grupo de control, atribución de ventas.
- **Próximamente** (`rt-badge--soon`) — no disponible aún: pruebas A/B completas, unificación de identidad multicanal, cohortes y benchmarking, programas de puntos, comparación multisucursal avanzada.

Nunca se presenta una funcionalidad "Próximamente" o "Roadmap" como si estuviera disponible hoy — es una regla dura seguida en todo el copy.

## Interactividad implementada

- Navegación móvil, tabs, acordeón, modal accesible (foco atrapado, `Escape`, click fuera), tooltip, toasts, filtros por etiqueta — todo vía atributos `data-rt-*` (`assets/js/components.js`).
- **Creador de campañas** (`demo/campaigns.html`): elegir objetivo y audiencia (con alcance estimado y grupo de control calculado), generar mensaje con IA (`GrowthPlatformAPI.generateCampaignCopy`), programar o enviar, y simular resultados (apertura/conversión/ingresos) sobre la tabla de campañas.
- **Centro de agentes** (`demo/agent-center.html`): estado en vivo por canal, conversaciones filtrables con transcripción y resumen de IA, casos no resueltos.
- **Cliente 360** (`demo/customer-360.html`): lista de clientes + panel de perfil completo con timeline, ciclo de visitas y próxima mejor acción.
- **Reactivación** (`demo/reactivation.html`): días de atraso respecto del ciclo personal, acción sugerida, botón de activación que simula el envío y su resultado (incluyendo asignación al grupo de control).
- **Reputación** (`demo/reputation.html`): filtro por estado, respuesta sugerida por IA, botón para marcar un caso como resuelto.
- **Funnel** (`demo/funnel.html`): filtros por canal/campaña/sucursal/segmento con recálculo simulado de las barras.
- **Integraciones** (`demo/integrations.html`): estados conectado/sincronizando/error con reintento simulado y cola de Print Bridge.
- **Operación** (`demo/operations.html`): tablero de pedidos con documento simulado (sin validez tributaria).

## Formato chileno

`window.RTFormat` (`assets/js/components.js`): `clp(valor)`, `phone(numero)`, `date(iso)`/`dateTime(iso)` en formato `es-CL`.

## Accesibilidad

Salto al contenido, foco visible (`:focus-visible`), navegación por teclado en tabs/acordeón/modal, `aria-expanded`/`aria-selected`/`aria-current`, `aria-live` para toasts, tablas con variante `rt-table--stack` en móvil, controles táctiles ≥44px.

## Preparación para WordPress, WooCommerce/WPCafe y GoHighLevel

1. **Prefijo de clases consistente** (`rt-`) — no colisiona con temas ni plugins de WordPress.
2. **Contenido, presentación y comportamiento separados**: el HTML no contiene lógica de negocio; toda vive en `assets/js/*-demo.js` y consume datos exclusivamente a través de `window.GrowthPlatformAPI`, nunca tocando `GP_DATA` directamente.
3. **Adaptador único** — `window.GrowthPlatformAPI` (`assets/js/growth-platform-api.js`) expone `getDashboard()`, `getOpportunities()`, `getCampaigns()`, `createCampaign()`, `generateCampaignCopy()`, `getConversations()`, `getCustomers()`, `getCustomerProfile()`, `getAtRiskCustomers()`, `getRecommendations()`, `getReputationCases()`, `getFunnel()`, `getIntegrations()`, `getOrders()`. Cada método tiene un comentario `// TODO integración` señalando su conexión futura:
   - `getCampaigns()` / `createCampaign()` / `generateCampaignCopy()` → GoHighLevel (workflows, envío real, modelo de lenguaje conectado a la marca).
   - `getCustomers()` / `getCustomerProfile()` / `getAtRiskCustomers()` → GoHighLevel / CRM como fuente única del perfil.
   - `getOrders()` → WooCommerce (`wc/v3/orders`) + WPCafe.
   - `getIntegrations()` → estado real de cada conector (OAuth, webhooks, colas).
   - `getDashboard()` / `getFunnel()` → agregación de un Restaurant Orchestrator.
   - `getConversations()` → proveedor de Voice AI / WhatsApp Business API.
   - `getReputationCases()` → encuestas post-visita + reseñas públicas.
5. **Sin build step**: cada página es HTML plano con `<link>`/`<script>` directos, listo para convertirse en `page-*.php` de un tema hijo de WordPress sin reescribir la estructura.

## Requisitos técnicos cumplidos

HTML5 semántico, CSS3 con variables, JavaScript vanilla (ES6+, sin dependencias), sin React/Vue/Angular, sin bundlers, sin backend, sin claves ni credenciales, sin bases de datos, íconos SVG inlineados por página para funcionar también con `file://`.

## Datos ficticios

Restaurante: **Sabor Urbano**, sucursal Providencia, Santiago de Chile. Todos los productos, clientes, campañas, conversaciones e integraciones son inventados para esta demostración — cualquier coincidencia con un negocio real es casual. Todas las cifras están marcadas como demostrativas en la interfaz.
