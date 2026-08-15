# PRODUCT_SPEC.md — NOMBRE DEL PRODUCTO

Especificación funcional del prototipo. Este documento resume las decisiones de producto tomadas al construir el sitio y sirve como referencia para evolucionar el proyecto hacia una implementación real (WordPress + WooCommerce + WPCafe + Restaurant Orchestrator Lite).

## 1. Propuesta de valor

**"Atiende, cobra y hace volver a tus clientes."**

Una plataforma omnicanal de ventas, atención y recurrencia para restaurantes chilenos. Convierte llamadas, WhatsApp y QR en pedidos pagados, los envía al sistema que el restaurante ya usa (o a un POS Lite propio), y detecta cuándo cada cliente debería volver.

No es: otro chatbot, otra carta QR aislada, otro POS genérico, un sitio web de restaurante, un programa de puntos genérico, o una central telefónica.

## 2. Las dos modalidades

| | Conecta (sin POS propio) | POS Lite |
|---|---|---|
| Para quién | Restaurantes con POS/gestión existente (Toteat, Fudo, Justo, sistemas propios) | Restaurantes sin POS o con operación simple (cafeterías, food trucks, dark kitchens, panaderías, etc.) |
| Qué hace | Capa de atención, pedidos, pagos y fidelización sobre el sistema existente | Todo lo de Conecta + caja, turnos, KDS, mesas simples y documentos tributarios |
| Integración | Nativa (API) cuando existe, o **modo puente** (KDS/impresora + conciliación manual) cuando no | No requiere integración con un POS externo |

La comparación funcional completa (32 filas) vive en `index.html#comparacion` y es la fuente única de verdad — no se duplica en otras páginas, solo se enlaza.

### Modo puente vs. integración nativa

- **Integración nativa**: pedido, pago y estado se sincronizan automáticamente con el POS (caja, stock, mesas).
- **Modo puente**: el pedido pagado llega a cocina vía KDS propio o Print Bridge; la venta se concilia **manualmente** después. No sincroniza caja, stock ni mesas en tiempo real. El sitio es explícito sobre esta diferencia (ver `sin-pos.html` e `integraciones.html`).

## 3. Clasificación de funcionalidades

Se usan 5 etiquetas visuales (`rt-badge`) de forma consistente en todo el sitio:

- **Disponible / Incluido** (`rt-badge--available`, verde) — funciona hoy en el PMV.
- **Mediante integración** (`rt-badge--integration`, azul) — depende de conectar un sistema externo o del modo puente.
- **Próximamente** (`rt-badge--soon`, ámbar) — siguiente etapa, no disponible aún.
- **Roadmap** (`rt-badge--roadmap`, morado) — visión de largo plazo, explícitamente no comprometida.
- **Error / no disponible** (`rt-badge--error` / `rt-badge--neutral`) — estados operativos (integraciones caídas, etc.), no una promesa de producto.

**Regla dura seguida en todo el copy:** nunca se presenta una funcionalidad de "Próximamente" o "Roadmap" como si estuviera disponible hoy.

### PMV disponible hoy
Carta QR, pedido para retiro, dine-in simple, WPCafe, WooCommerce, modificadores, Mercado Pago, pago previo, KDS, Bsale, GoHighLevel, Voice AI, WhatsApp, panel de pedidos, clientes/CRM, feedback, reactivación estadística inicial, POS Lite básico (caja, turnos, mesas simples).

### Próxima etapa
Mercado Pago Point integrado, Print Bridge automático, más integraciones POS, cuenta compartida/varias rondas, división simple de cuenta, multisucursal, programas de puntos, reportes de margen.

### Roadmap avanzado
División por comensal, pagos parciales, inventario por receta, compras/proveedores/mermas, nutrición y alérgenos automáticos desde recetas, contaminación cruzada, predicción de preparación, benchmarking, operación offline avanzada.

## 4. Modelo de datos (estados de orquestación)

Cuatro máquinas de estado independientes por pedido (ver `assets/js/demo-data.js` y `assets/js/restaurant-api.js`):

- **Comercial**: Pendiente → Procesando → Completado | Cancelado | Fallido | Reembolsado.
- **Pago**: No iniciado → Pendiente → Aprobado | Rechazado | Cancelado | Reembolsado | Contracargo.
- **Cocina**: Bloqueado → Nuevo → Aceptado → Preparando → Listo → Entregado | Cancelado. "Bloqueado" representa un pedido remoto cuyo pago aún no se confirma — nunca llega a cocina antes de pagarse.
- **Tributario**: No requerido → No solicitado → En cola → Emitido → Aceptado por SII | Rechazado | Nota de crédito pendiente/emitida | Error.

La demo de cocina (`demo/kitchen.html`) visualiza el estado "Bloqueado" como una tarjeta inmovilizada hasta simular la confirmación de pago, ilustrando la regla **"el pago se confirma antes de liberar a cocina"**.

## 5. Datos de demostración

Restaurante ficticio **"Sabor Urbano"**, sucursal Providencia (Santiago), moneda CLP. Ver `assets/js/demo-data.js` para el detalle completo de productos, clientes, integraciones, pedidos y casos de feedback. Todas las cifras son ilustrativas.

Clientes de ejemplo usados para demostrar la reactivación individual:
- **Claudia Soto** — ciclo de 9 a 12 días, 18 días sin visitar → atrasada respecto de su propio ciclo.
- **Juan Pérez** — ciclo de 40 a 55 días, 26 días sin visitar → todavía dentro de su ciclo, sin acción.
- **María González** — cliente nueva, una visita → estimular segunda compra.
- Rodrigo Fuentes (VIP) y Fernanda Rivas (en riesgo, sin consentimiento de marketing) se agregaron para enriquecer la demo de clientes.

## 6. Arquitectura de información

| Página | Propósito |
|---|---|
| `index.html` | Home comercial completo: hero, problema, cómo funciona, selector Conecta/POS Lite, funcionalidades, flujo de pedido, agentes IA, reactivación, dashboard, integraciones, casos de uso, **comparación funcional completa**, FAQ, CTA. |
| `sin-pos.html` | Explica la modalidad Conecta en detalle: integraciones, modo puente, Print Bridge, qué conserva/agrega. |
| `pos-lite.html` | Explica POS Lite: caja, turnos, KDS, mesas, Bsale, reportes, roles, límites del PMV. |
| `agentes-ia.html` | Voice AI y WhatsApp: capacidades, ejemplos de conversación, métricas, handoff. |
| `fidelizacion.html` | CRM, reactivación individual, feedback, grupo de control. |
| `integraciones.html` | Centro de integraciones (marketing): conectores, mapeo de productos, Print Bridge. |
| `precios.html` | 3 planes (Conecta / Omnicanal / POS Lite) con precios editables en una constante JS. |
| `faq.html` | Preguntas frecuentes con buscador. |
| `demo/*.html` | Interfaces funcionales (ver README para el detalle de cada una). |

## 7. Componentes reutilizables

Definidos una sola vez y compartidos por todo el sitio (`assets/css/components.css`, `assets/js/components.js`): header/nav responsive, footer, botones, tarjetas, badges de estado, tabs, acordeón, modal, tooltip, toast, tabla responsive (con variante `stack` para móvil), formularios, mockup de dispositivo, diagrama de flujo numerado, selector Conecta/POS Lite, filtro de tablas por etiqueta.

`assets/js/restaurant-api.js` expone `window.RestaurantAPI` como única puerta de entrada a los datos (ver README §Migración a WordPress) — todas las pantallas `/demo` lo usan en vez de tocar `RT_DATA` directamente.
