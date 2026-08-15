# NOMBRE DEL PRODUCTO — Plataforma omnicanal para restaurantes (Chile)

Sitio comercial + prototipo funcional para una plataforma omnicanal de ventas, atención y recurrencia dirigida al mercado gastronómico chileno. **HTML5 + CSS3 + JavaScript vanilla**, sin frameworks, sin build step, sin backend, sin claves ni pagos reales.

> "Atiende, cobra y hace volver a tus clientes."

## Cómo abrir el proyecto

No requiere instalación. Dos formas de verlo:

1. **Directo**: abre `index.html` con doble clic o `open index.html` / `start index.html`.
2. **Servidor estático simple** (recomendado para que `localStorage` y las rutas relativas se comporten igual que en producción):
   ```bash
   python3 -m http.server 8080
   # o
   npx serve .
   ```
   Luego visita `http://localhost:8080`.

Todas las páginas funcionan sin conexión a internet ni backend. Los "pagos", "llamadas" y "envíos de WhatsApp/Bsale" son simulaciones visuales.

## Estructura del proyecto

```
/
├── index.html              Home comercial (17 secciones, incluye la comparación funcional completa)
├── sin-pos.html             Modalidad "Conecta" (sin POS propio)
├── pos-lite.html            Modalidad "POS Lite"
├── agentes-ia.html          Voice AI + WhatsApp
├── fidelizacion.html        CRM, reactivación individual, feedback
├── integraciones.html       Centro de integraciones (marketing)
├── precios.html             3 planes, precios editables en una constante JS
├── faq.html                 Preguntas frecuentes con buscador
├── demo/
│   ├── menu.html             Carta digital funcional (carrito, modificadores, propina, checkout simulado)
│   ├── dashboard.html        Panel del dueño (filtros, gráficos, alertas, tabla de pedidos)
│   ├── kitchen.html          KDS tipo Kanban (Nuevos/Aceptados/Preparando/Listos)
│   ├── pos.html              POS Lite (turnos, venta, medios de pago, boleta/factura)
│   ├── customers.html        CRM de clientes con ciclo de visitas individual
│   ├── integrations.html     Estado de integraciones + Print Bridge (modalidad Conecta)
│   └── settings.html         Configuración (marca, agente, políticas, usuarios)
├── assets/
│   ├── css/
│   │   ├── tokens.css        Variables de marca: colores, radios, sombras, tipografía
│   │   ├── base.css          Reset, layout utilitario, accesibilidad base
│   │   ├── components.css    Header, footer, botones, tarjetas, badges, tabs, modal, tooltip, toast…
│   │   ├── pages.css         Estilos de páginas comerciales (hero, mockups, planes, diagramas)
│   │   └── demo.css          Estilos de las interfaces /demo
│   ├── js/
│   │   ├── components.js     Comportamiento de componentes + formato chileno (RTFormat) + toasts
│   │   ├── navigation.js     Año dinámico, enlace activo, scroll con offset de header
│   │   ├── demo-data.js       Datos ficticios de "Sabor Urbano" (RT_DATA)
│   │   ├── restaurant-api.js  Adaptador window.RestaurantAPI (ver sección WordPress más abajo)
│   │   ├── menu-demo.js, dashboard-demo.js, kitchen-demo.js, pos-demo.js,
│   │   │   customers-demo.js, integrations-demo.js, settings-demo.js
│   ├── icons/sprite.svg      Fuente canónica de los íconos (se inlinea en cada página por compatibilidad file://)
│   └── images/
├── README.md
└── PRODUCT_SPEC.md           Especificación funcional y decisiones de producto
```

## Cómo cambiar nombre, colores y precios

**Nombre y logo**: el nombre "NOMBRE DEL PRODUCTO" y el isotipo `ND` (CSS, en `.rt-logo__mark`) aparecen en el header y footer de cada página HTML — es texto plano, así que un buscar-y-reemplazar de "NOMBRE DEL PRODUCTO" en todos los `.html` lo actualiza. El isotipo tipográfico es intencionalmente provisional (no es un logo final).

**Colores, radios y sombras**: todo vive en `assets/css/tokens.css`. Cambia las variables `--color-primary`, `--color-accent`, `--color-success`, etc. y se propaga a todo el sitio (una sola fuente de verdad, sin overrides dispersos).

**Precios**: en `precios.html`, dentro de un `<script>` claramente comentado, hay una constante `PRICING_PLANS` (arreglo de objetos `{ id, name, tagline, priceFrom, highlight, features }`). Edítala ahí — el render de las tres tarjetas de planes se genera desde ese arreglo.

**Datos de demostración**: todo en `assets/js/demo-data.js` (`window.RT_DATA`): restaurante, categorías, productos (con modificadores), clientes, integraciones, pedidos semilla y casos de feedback. Cambiar esos datos actualiza automáticamente las 7 pantallas `/demo`.

## Funcionalidades — qué está disponible, qué es simulado, qué es roadmap

Ver `PRODUCT_SPEC.md` para el detalle completo. Resumen:

- **Disponible en el PMV** (funciona en la demo y se vendería como tal): carta QR, pedido para retiro y dine-in simple, modificadores/combos, checkout con estados de pago simulados, KDS Kanban, POS Lite (turnos, caja, mesas simples), boleta/factura (simulada), CRM con ciclo de visitas individual, reactivación individual, panel del dueño, centro de integraciones.
- **Simulado en este prototipo** (la interacción es real, el resultado es una simulación local, sin red): pagos (Mercado Pago), boleta/factura (Bsale), envíos de WhatsApp, llamadas del agente de voz, sincronización de integraciones, impresión (Print Bridge). Todo queda claramente indicado como demostración y se guarda solo en `localStorage` del navegador.
- **Próximamente / Roadmap** (mostrado con badges `rt-badge--soon` / `rt-badge--roadmap`, nunca como disponible): Mercado Pago Point físico, Print Bridge automático, división compleja de cuenta, cuentas por comensal, pagos parciales, inventario completo/por receta, multisucursal avanzada, nutrición/alérgenos automáticos.

## Interactividad implementada

- Navegación móvil con menú deslizable, tabs, acordeón (FAQ), modal accesible (foco atrapado, `Escape`, click fuera), tooltip, toasts.
- Selector Conecta/POS Lite persistente en `localStorage`.
- **Carta digital** (`demo/menu.html`): categorías, búsqueda, modal de producto con modificadores obligatorios/opcionales que recalculan el precio en vivo, stepper de cantidad, carrito con propina (sin selección por defecto) y elección mesa/retiro y pagar ahora/con garzón, checkout con pago simulado **aprobado / pendiente / rechazado / expirado**, reintento, y tracker de estado del pedido. El pedido creado queda en `localStorage` y aparece en el KDS.
- **KDS** (`demo/kitchen.html`): tablero Kanban con 4 columnas, pedidos bloqueados por pago pendiente, botones para avanzar/cancelar/reimprimir, alerta visual de demora, filtro por estación, botón para simular la llegada de un pedido nuevo (con sonido).
- **POS Lite** (`demo/pos.html`): apertura/cierre de turno con arqueo y diferencia, venta con modificadores, descuento, propina, medio de pago, boleta/factura con validación visual de RUT, resumen del turno.
- **Dashboard** (`demo/dashboard.html`): filtro de fecha/canal/modalidad, gráficos de barras en CSS puro, alertas dinámicas, clientes en riesgo, tabla de pedidos filtrable (incluye los pedidos creados en la carta/POS de demostración).
- **Clientes** (`demo/customers.html`): panel lateral con barra de ciclo de visitas individual (no un umbral único para todos).
- **Integraciones** (`demo/integrations.html`): estados conectado/sincronizando/con error/no disponible, reintento simulado, cola de Print Bridge.

## Formato chileno

`window.RTFormat` (`assets/js/components.js`) centraliza:
- `clp(valor)` — `Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })`.
- `phone(numero)` — formato `+56 9 XXXX XXXX`.
- `date(iso)` / `dateTime(iso)` — formato `es-CL`.
- `isValidRut(rut)` — validación visual de dígito verificador (módulo 11). **No consulta al SII**, es solo validación de formato en el prototipo.

## Accesibilidad

Salto al contenido en cada página, foco visible (`:focus-visible`), navegación por teclado en tabs/acordeón/modal, `aria-expanded`/`aria-selected`/`aria-pressed`/`aria-current` en los componentes correspondientes, `aria-live` para toasts y anuncios del KDS, tablas con variante `rt-table--stack` que se convierten en tarjetas en móvil, tamaños táctiles ≥44px en controles interactivos.

## Preparación para WordPress, WooCommerce, WPCafe y Restaurant Orchestrator Lite

El sitio se construyó con esa migración en mente:

1. **Prefijo de clases consistente** (`rt-`) en todo el CSS — no colisiona con clases de temas ni plugins de WordPress.
2. **Contenido, presentación y comportamiento separados**: el HTML no contiene lógica de negocio; toda la lógica vive en `assets/js/*-demo.js` y consume datos exclusivamente a través de `window.RestaurantAPI`, nunca tocando `RT_DATA` directamente desde las pantallas.
3. **Atributos de datos** (`data-product-id`, `data-channel`, `data-order-id`, `data-mode`, `data-table-token`, etc.) ya presentes donde corresponde, listos para hidratarse desde un backend real.
4. **Adaptador único** — `window.RestaurantAPI` (`assets/js/restaurant-api.js`) expone `getMenu()`, `validateCart()`, `createOrder()`, `getOrderStatus()`, `getCustomers()`, `getMetrics()`, `getIntegrations()`. Hoy leen de `RT_DATA`/`localStorage`; migrar significa reemplazar el cuerpo de cada función por una llamada real, sin tocar el HTML/CSS ni las pantallas `/demo`. El archivo incluye comentarios `TODO WordPress` señalando el punto de conexión futuro de cada método:
   - `getMenu()` → WooCommerce REST API (`wc/v3/products`) + WPCafe (menú, mesas).
   - `validateCart()` / `createOrder()` → Restaurant Orchestrator Lite (validación, orquestación de estados) + WooCommerce (`wc/v3/orders`).
   - Confirmación de pago → Mercado Pago (Checkout Pro / Payments API).
   - Emisión de documentos → Bsale.
   - `getCustomers()` → GoHighLevel (contactos, workflows, consentimiento).
   - `getMetrics()` → agregación del Restaurant Orchestrator Lite.
   - Selección de modificadores/combos → motor de variantes tipo Optiontics.
5. **Sin build step**: cada página es HTML plano con `<link>`/`<script>` directos, lo que facilita convertir cada plantilla en un `page-*.php` de un tema hijo de WordPress sin reescribir la estructura.

## Requisitos técnicos cumplidos

HTML5 semántico, CSS3 con variables, JavaScript vanilla (ES6+, sin dependencias), sin React/Vue/Angular, sin bundlers, sin backend, sin claves ni credenciales, sin bases de datos, sin CDN obligatoria (los íconos SVG están inlineados por página para funcionar también abriendo el archivo con `file://`).

## Componentes principales creados

Header/nav responsive, footer, sistema de botones, tarjetas, badges de estado (5 variantes), tabs, acordeón, modal accesible, tooltip, toast, tabla responsive con variante *stack*, formularios con validación visual, mockup de dispositivo, diagrama de flujo numerado (`rt-flow`), diagrama de puente/integración (`rt-bridge`), selector Conecta/POS Lite, filtro de tablas por etiqueta, tablero Kanban (KDS), carrito de compra con modificadores dinámicos, ticket de punto de venta, gráficos de barras en CSS puro, barra de ciclo de cliente (`rt-cycle-bar`).

## Datos ficticios

Restaurante: **Sabor Urbano**, sucursal Providencia, Santiago de Chile. Todos los productos, clientes, integraciones y pedidos son inventados para esta demostración — cualquier coincidencia con un negocio real es casual. No se incluyen testimonios de clientes reales; si el sitio muestra algún ejemplo similar a un testimonio, está rotulado como *"Caso ilustrativo"*.
