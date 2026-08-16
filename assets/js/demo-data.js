/**
 * GP_DATA — Datos ficticios de la plataforma
 * ------------------------------------------------------------------
 * Restaurante de demostración: Sabor Urbano, sucursal Providencia
 * (Santiago de Chile). Todas las cifras, clientes, conversaciones e
 * indicadores son inventados para este prototipo — cualquier
 * coincidencia con un negocio real es casual.
 *
 * Consumido exclusivamente a través de window.GrowthPlatformAPI
 * (assets/js/growth-platform-api.js). Ninguna pantalla /demo debería
 * leer GP_DATA directamente.
 */

(function () {
  "use strict";

  function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
  }
  function daysFromNow(n) {
    return daysAgo(-n);
  }

  const GP_DATA = {
    demoNotice:
      "Datos demostrativos — Sabor Urbano, sucursal Providencia. Cifras, clientes y conversaciones son ficticios.",

    restaurant: {
      name: "Sabor Urbano",
      branch: "Providencia",
      city: "Santiago, Chile",
      segment: "Restobar de cocina urbana",
    },

    /* ============ Revenue Intelligence — KPIs del mes ============ */
    kpis: {
      opportunities: 1248,
      conversations: 642,
      ordersOrReservations: 231,
      conversionRate: 36,
      atRiskCustomers: 87,
      reactivatedCustomers: 42,
      attributedRevenue: 1860000,
      avgRating: 4.6,
      recoveredCases: 18,
      newCustomers: 96,
      returningCustomers: 135,
      avgTicket: 14200,
      period: "Últimos 30 días",
    },

    /* ============ Oportunidades por canal (AI Attract) ============ */
    opportunityChannels: [
      { channel: "Búsquedas en Google", count: 312, trend: 8 },
      { channel: "Llamadas telefónicas", count: 248, trend: -4 },
      { channel: "WhatsApp", count: 296, trend: 15 },
      { channel: "Sitio web y QR", count: 201, trend: 6 },
      { channel: "Instagram", count: 118, trend: 22 },
      { channel: "Campañas activas", count: 73, trend: 31 },
    ],

    /* ============ Oportunidades individuales (agent-center / dashboard) ============ */
    opportunities: [
      { id: "OP-1042", channel: "Teléfono", customer: "Claudia Soto", time: daysAgo(0), status: "convertida", value: 18900, note: "Reserva mesa 2 personas confirmada por el agente de voz." },
      { id: "OP-1041", channel: "WhatsApp", customer: "Desconocido +56 9 8123 4455", time: daysAgo(0), status: "perdida", value: 0, note: "Preguntó por delivery fuera de zona de cobertura, sin seguimiento." },
      { id: "OP-1040", channel: "Web", customer: "María González", time: daysAgo(1), status: "convertida", value: 12500, note: "Pedido para retiro generado desde el agente web." },
      { id: "OP-1039", channel: "Teléfono", customer: "Desconocido +56 9 7788 1122", time: daysAgo(1), status: "no contestada", value: 0, note: "Llamada entrante fuera del horario configurado." },
      { id: "OP-1038", channel: "Instagram", customer: "Rodrigo Fuentes", time: daysAgo(2), status: "en curso", value: 0, note: "Consultó por catering para evento corporativo." },
      { id: "OP-1037", channel: "QR", customer: "Mesa 7", time: daysAgo(2), status: "convertida", value: 24300, note: "Pedido en mesa con upsell de postre aceptado." },
      { id: "OP-1036", channel: "Campaña", customer: "Juan Pérez", time: daysAgo(3), status: "convertida", value: 15800, note: "Respondió campaña de producto nuevo, pidió por WhatsApp." },
    ],

    /* ============ Casos no resueltos por el agente ============ */
    unresolvedCases: [
      { id: "UR-221", channel: "Teléfono", topic: "Pregunta alimentaria compleja (alergia a mariscos + intolerancia)", action: "Transferido a persona" },
      { id: "UR-220", channel: "WhatsApp", topic: "Reclamo por cobro duplicado", action: "Transferido a persona" },
      { id: "UR-219", channel: "Web", topic: "Solicitud de factura para evento grande", action: "Derivado a formulario de catering" },
    ],

    /* ============ Clientes (Customer Intelligence) ============ */
    customers: [
      {
        id: "C-001",
        name: "Claudia Soto",
        phone: "+56987654321",
        email: "claudia.soto@example.com",
        birthday: "03-14",
        segment: "Frecuente",
        channelPreferred: "Teléfono",
        favoriteProducts: ["Cheesecake de maracuyá", "Café cortado"],
        avgTicket: 16200,
        cycleMinDays: 9,
        cycleMaxDays: 12,
        lastVisitDaysAgo: 18,
        visits: 34,
        ltv: 412000,
        risk: "alto",
        nextExpectedVisit: "Atrasada respecto de su ciclo habitual",
        consent: true,
        recommendedAction: "Novedad + producto favorito (cheesecake) por WhatsApp",
        tags: ["frecuente", "riesgo", "cheesecake"],
        timeline: [
          { date: daysAgo(18), type: "visita", detail: "Almuerzo en salón, pidió cheesecake de postre." },
          { date: daysAgo(28), type: "visita", detail: "Pedido para retiro por teléfono." },
          { date: daysAgo(40), type: "campaña", detail: "Abrió campaña 'Nuevo menú de verano', no respondió." },
          { date: daysAgo(52), type: "feedback", detail: "Valoración 5/5, comentario: 'el café siempre perfecto'." },
        ],
      },
      {
        id: "C-002",
        name: "Juan Pérez",
        phone: "+56976543210",
        email: "juan.perez@example.com",
        birthday: "09-02",
        segment: "Ocasional",
        channelPreferred: "WhatsApp",
        favoriteProducts: ["Pizza familiar", "Cerveza artesanal"],
        avgTicket: 28500,
        cycleMinDays: 40,
        cycleMaxDays: 50,
        lastVisitDaysAgo: 26,
        visits: 9,
        ltv: 198000,
        risk: "bajo",
        nextExpectedVisit: "Dentro de su ciclo habitual — sin acción",
        consent: true,
        recommendedAction: "Sin envío de descuento — todavía dentro de su ciclo",
        tags: ["ocasional", "sin-riesgo", "pizza"],
        timeline: [
          { date: daysAgo(26), type: "visita", detail: "Pedido pizza familiar para 4 personas, delivery." },
          { date: daysAgo(70), type: "visita", detail: "Cena en salón con acompañante." },
          { date: daysAgo(120), type: "campaña", detail: "Respondió campaña de evento y asistió." },
        ],
      },
      {
        id: "C-003",
        name: "María González",
        phone: "+56965432109",
        email: "maria.gonzalez@example.com",
        birthday: "11-27",
        segment: "Nueva",
        channelPreferred: "Web",
        favoriteProducts: ["Bowl vegano"],
        avgTicket: 11200,
        cycleMinDays: null,
        cycleMaxDays: null,
        lastVisitDaysAgo: 5,
        visits: 1,
        ltv: 11200,
        risk: "nuevo",
        nextExpectedVisit: "Sin patrón todavía — primera visita",
        consent: true,
        recommendedAction: "Activar campaña de segunda visita con incentivo liviano",
        tags: ["nueva", "segunda-visita"],
        timeline: [{ date: daysAgo(5), type: "visita", detail: "Primer pedido para retiro desde la carta QR." }],
      },
      {
        id: "C-004",
        name: "Rodrigo Fuentes",
        phone: "+56954321098",
        email: "rodrigo.fuentes@example.com",
        birthday: "06-19",
        segment: "VIP",
        channelPreferred: "Instagram",
        favoriteProducts: ["Parrillada urbana", "Vino tinto reserva"],
        avgTicket: 41500,
        cycleMinDays: 14,
        cycleMaxDays: 20,
        lastVisitDaysAgo: 12,
        visits: 21,
        ltv: 620000,
        risk: "caso abierto",
        nextExpectedVisit: "Campañas suspendidas mientras el caso está abierto",
        consent: true,
        recommendedAction: "Suspender campañas · priorizar recuperación de la experiencia",
        tags: ["vip", "reputacion", "caso-abierto"],
        timeline: [
          { date: daysAgo(2), type: "feedback", detail: "Feedback negativo: espera excesiva en evento de catering." },
          { date: daysAgo(12), type: "visita", detail: "Cena de cumpleaños, parrillada para 6 personas." },
          { date: daysAgo(30), type: "campaña", detail: "Respondió invitación a evento de maridaje." },
        ],
      },
      {
        id: "C-005",
        name: "Fernanda Rivas",
        phone: "+56943210987",
        email: "fernanda.rivas@example.com",
        birthday: "01-08",
        segment: "En riesgo",
        channelPreferred: "WhatsApp",
        favoriteProducts: ["Ensalada césar", "Limonada de jengibre"],
        avgTicket: 9800,
        cycleMinDays: 15,
        cycleMaxDays: 22,
        lastVisitDaysAgo: 41,
        visits: 12,
        ltv: 118000,
        risk: "alto",
        nextExpectedVisit: "19 días atrasada respecto de su ciclo",
        consent: false,
        recommendedAction: "Sin consentimiento de marketing — solo puede recibir respuesta a consultas directas",
        tags: ["riesgo", "sin-consentimiento"],
        timeline: [{ date: daysAgo(41), type: "visita", detail: "Almuerzo ejecutivo entre semana." }],
      },
    ],

    /* ============ Campañas (AI Attract) ============ */
    campaigns: [
      { id: "CMP-08", name: "Reactivación clientes atrasados", objective: "Reactivación", audience: "Clientes en riesgo (87)", channel: "WhatsApp", status: "activa", sent: 87, opened: 61, converted: 24, controlGroup: 15, revenue: 342000, scheduledFor: daysAgo(3) },
      { id: "CMP-07", name: "Segunda visita — nuevos clientes", objective: "Segunda visita", audience: "Clientes con 1 visita (34)", channel: "Email + WhatsApp", status: "activa", sent: 34, opened: 22, converted: 9, controlGroup: 6, revenue: 96000, scheduledFor: daysAgo(6) },
      { id: "CMP-06", name: "Cumpleaños de agosto", objective: "Cumpleaños", audience: "Cumpleaños del mes (18)", channel: "WhatsApp", status: "programada", sent: 0, opened: 0, converted: 0, controlGroup: 3, revenue: 0, scheduledFor: daysFromNow(4) },
      { id: "CMP-05", name: "Menú de almuerzo — oficinas cercanas", objective: "Horario valle", audience: "Clientes de horario 12–14h (156)", channel: "Instagram + Web", status: "activa", sent: 156, opened: 98, converted: 31, controlGroup: 20, revenue: 210000, scheduledFor: daysAgo(9) },
      { id: "CMP-04", name: "Producto nuevo: bowl de temporada", objective: "Producto nuevo", audience: "Clientes afines a productos saludables (72)", channel: "WhatsApp", status: "finalizada", sent: 72, opened: 55, converted: 19, controlGroup: 10, revenue: 141000, scheduledFor: daysAgo(21) },
      { id: "CMP-03", name: "Carritos abandonados — carta QR", objective: "Carrito abandonado", audience: "Sesiones sin checkout (44)", channel: "WhatsApp", status: "activa", sent: 44, opened: 30, converted: 16, controlGroup: 8, revenue: 187000, scheduledFor: daysAgo(1) },
      { id: "CMP-02", name: "Programa de referidos", objective: "Referidos", audience: "Clientes VIP y frecuentes (58)", channel: "WhatsApp + Web", status: "activa", sent: 58, opened: 40, converted: 11, controlGroup: 7, revenue: 88000, scheduledFor: daysAgo(14) },
      { id: "CMP-01", name: "Evento maridaje de primavera", objective: "Evento", audience: "Clientes VIP (26)", channel: "Instagram + Email", status: "finalizada", sent: 26, opened: 21, converted: 14, controlGroup: 4, revenue: 259000, scheduledFor: daysAgo(35) },
    ],

    campaignObjectives: [
      { id: "nuevos", label: "Nuevos clientes" },
      { id: "segunda-visita", label: "Segunda visita" },
      { id: "reactivacion", label: "Reactivación" },
      { id: "cumpleanos", label: "Cumpleaños" },
      { id: "producto-nuevo", label: "Producto nuevo" },
      { id: "horario-valle", label: "Horario valle" },
      { id: "evento", label: "Evento" },
      { id: "carrito-abandonado", label: "Carrito abandonado" },
      { id: "recuperacion", label: "Recuperación de pago/reserva" },
    ],

    campaignAudiences: [
      { id: "riesgo", label: "Clientes en riesgo", size: 87 },
      { id: "nuevos", label: "Clientes con 1 visita", size: 34 },
      { id: "frecuentes", label: "Clientes frecuentes", size: 112 },
      { id: "vip", label: "Clientes VIP", size: 26 },
      { id: "cumpleanos", label: "Cumpleaños este mes", size: 18 },
      { id: "horario-valle", label: "Clientes de horario 15–18h", size: 63 },
      { id: "carrito", label: "Carritos abandonados últimos 7 días", size: 44 },
    ],

    campaignCopyBank: {
      reactivacion: [
        "{{nombre}}, notamos que no has vuelto en un tiempo. Tu {{producto_favorito}} te está esperando esta semana.",
        "Hace rato no te vemos por Sabor Urbano, {{nombre}}. ¿Te preparamos tu pedido habitual?",
      ],
      "segunda-visita": [
        "¡Qué bueno tenerte de vuelta pronto, {{nombre}}! Tu segunda visita tiene un café de cortesía.",
        "{{nombre}}, esperamos que hayas disfrutado tu primera visita. Vuelve esta semana y prueba algo nuevo.",
      ],
      cumpleanos: [
        "Feliz mes, {{nombre}} 🎉 Queremos celebrar contigo con un postre de cortesía en tu próxima visita.",
      ],
      "producto-nuevo": [
        "{{nombre}}, sumamos {{producto_nuevo}} a la carta — creemos que te va a encantar.",
      ],
      "horario-valle": [
        "{{nombre}}, entre las 15 y las 18h tenemos mesa lista y un beneficio especial para ti.",
      ],
      evento: [
        "{{nombre}}, tenemos un evento especial este mes y queremos que estés — ¿te reservamos un lugar?",
      ],
      "carrito-abandonado": [
        "{{nombre}}, dejaste un pedido a medio camino. Retómalo en un clic, sigue disponible.",
      ],
      recuperacion: [
        "{{nombre}}, tu reserva quedó sin confirmar. Escríbenos y te la dejamos lista al instante.",
      ],
      nuevos: [
        "Bienvenido a Sabor Urbano, {{nombre}}. Como agradecimiento por tu primera visita, tu próximo café va por cuenta nuestra.",
      ],
    },

    /* ============ Agentes / conversaciones ============ */
    agentStatus: [
      { channel: "Teléfono", status: "activo", activeNow: 2, todayCount: 68, conversionRate: 41 },
      { channel: "WhatsApp", status: "activo", activeNow: 5, todayCount: 134, conversionRate: 38 },
      { channel: "Web", status: "activo", activeNow: 3, todayCount: 57, conversionRate: 29 },
      { channel: "QR", status: "activo", activeNow: 1, todayCount: 22, conversionRate: 52 },
    ],

    conversations: [
      {
        id: "CV-501",
        channel: "Teléfono",
        customer: "Claudia Soto",
        time: daysAgo(0),
        status: "convertida",
        outcome: "Reserva confirmada · mesa 2 personas · 20:30",
        confidence: "alta",
        transcript: [
          { from: "cliente", text: "Hola, quería reservar una mesa para esta noche." },
          { from: "agente", text: "¡Claro que sí! ¿Para cuántas personas y a qué hora te acomoda?" },
          { from: "cliente", text: "Dos personas, como a las 20:30." },
          { from: "agente", text: "Perfecto, tengo mesa disponible a las 20:30 para 2 personas. ¿Confirmo a nombre de Claudia?" },
          { from: "cliente", text: "Sí, gracias." },
          { from: "agente", text: "Reserva confirmada. Te enviamos un recordatorio por WhatsApp más tarde. ¡Nos vemos!" },
        ],
        summary: "Cliente frecuente reservó mesa para 2 esta noche. Se detectó su preferencia habitual y se confirmó sin fricción.",
      },
      {
        id: "CV-500",
        channel: "WhatsApp",
        customer: "María González",
        time: daysAgo(1),
        status: "convertida",
        outcome: "Pedido para retiro · $12.500 · pagado",
        confidence: "alta",
        transcript: [
          { from: "cliente", text: "Hola! Vi el bowl vegano en Instagram, ¿está disponible?" },
          { from: "agente", text: "¡Sí, está disponible! ¿Te gustaría pedirlo para retiro o delivery?" },
          { from: "cliente", text: "Para retiro porfa" },
          { from: "agente", text: "Anotado: 1 bowl vegano para retiro. Te dejo el link de pago para confirmar tu pedido." },
          { from: "cliente", text: "Listo, ya pagué" },
          { from: "agente", text: "¡Pago confirmado! Tu pedido estará listo en 20 minutos en Providencia." },
        ],
        summary: "Primera compra de una clienta nueva que llegó desde Instagram. Buena oportunidad para campaña de segunda visita.",
      },
      {
        id: "CV-499",
        channel: "Web",
        customer: "Visitante anónimo",
        time: daysAgo(1),
        status: "no convertida",
        outcome: "Consultó menú, no completó pedido",
        confidence: "media",
        transcript: [
          { from: "cliente", text: "¿Tienen opciones sin gluten?" },
          { from: "agente", text: "Sí, tenemos 4 platos marcados sin gluten, incluyendo el bowl vegano y la ensalada césar." },
          { from: "cliente", text: "Ok gracias" },
        ],
        summary: "Consulta alimentaria respondida correctamente, pero la conversación no avanzó a pedido. Candidata a seguimiento.",
      },
      {
        id: "CV-498",
        channel: "Teléfono",
        customer: "Desconocido",
        time: daysAgo(2),
        status: "no resuelta",
        outcome: "Transferida a persona",
        confidence: "baja",
        transcript: [
          { from: "cliente", text: "Tengo alergia a mariscos pero también soy intolerante a la lactosa, ¿qué me recomiendan?" },
          { from: "agente", text: "Entiendo tu consulta, es una combinación específica — te transfiero con el equipo para asegurarnos de darte la mejor recomendación." },
        ],
        summary: "Pregunta alimentaria compleja fuera de la confianza configurada del agente. Transferencia correcta a una persona.",
      },
    ],

    /* ============ Reputación ============ */
    reputationCases: [
      {
        id: "RC-114",
        customer: "Rodrigo Fuentes",
        date: daysAgo(2),
        rating: 2,
        sentiment: "negativo",
        topic: "Tiempo de espera",
        channel: "Encuesta post-visita",
        status: "abierto",
        comment: "La atención del evento de catering demoró mucho más de lo prometido.",
        suggestedResponse: "Rodrigo, lamentamos la demora en el catering — no es la experiencia que buscamos entregar. Nos gustaría compensarte e invitarte a conversar directamente con el equipo.",
        compensation: "Cupón de $15.000 + llamada del encargado",
        resolutionTimeHours: null,
        recovered: false,
      },
      {
        id: "RC-113",
        customer: "Fernanda Rivas",
        date: daysAgo(9),
        rating: 3,
        sentiment: "neutral",
        topic: "Temperatura del plato",
        channel: "Encuesta post-visita",
        status: "resuelto",
        comment: "La ensalada llegó tibia, no fría como esperaba.",
        suggestedResponse: "Fernanda, gracias por avisarnos — ajustamos el proceso en cocina para que esto no vuelva a pasar.",
        compensation: "Bebida de cortesía en próxima visita",
        resolutionTimeHours: 6,
        recovered: true,
      },
      {
        id: "RC-112",
        customer: "Cliente anónimo",
        date: daysAgo(15),
        rating: 5,
        sentiment: "positivo",
        topic: "Atención del mesero",
        channel: "Reseña pública",
        status: "cerrado",
        comment: "Excelente atención, el mesero recomendó el maridaje perfecto.",
        suggestedResponse: "¡Gracias por tu comentario! Lo compartimos con todo el equipo.",
        compensation: null,
        resolutionTimeHours: 2,
        recovered: true,
      },
      {
        id: "RC-111",
        customer: "Cliente anónimo",
        date: daysAgo(20),
        rating: 2,
        sentiment: "negativo",
        topic: "Error en el pedido",
        channel: "WhatsApp",
        status: "resuelto",
        comment: "Llegó un plato distinto al que pedí por delivery.",
        suggestedResponse: "Lamentamos el error en tu pedido — te reenviamos el plato correcto sin costo adicional.",
        compensation: "Reposición del plato + postre de cortesía",
        resolutionTimeHours: 3,
        recovered: true,
      },
    ],

    reputationTrends: [
      { label: "Tiempo de espera", count: 12, area: "Eventos y catering" },
      { label: "Temperatura del plato", count: 8, area: "Cocina — horario peak" },
      { label: "Error en el pedido", count: 6, area: "Canal delivery" },
      { label: "Atención del mesero", count: 4, area: "Salón — turno noche" },
    ],

    /* ============ Funnel ============ */
    funnel: {
      stages: [
        { key: "oportunidades", label: "Oportunidades", value: 1248 },
        { key: "conversaciones", label: "Conversaciones", value: 642 },
        { key: "pedidos", label: "Reservas / pedidos", value: 231 },
        { key: "pagos", label: "Pagos", value: 214 },
        { key: "visitas", label: "Visitas", value: 208 },
        { key: "segunda-visita", label: "Segunda visita", value: 96 },
        { key: "frecuente", label: "Cliente frecuente", value: 41 },
      ],
      filters: {
        channels: ["Todos", "Teléfono", "WhatsApp", "Web", "QR", "Instagram", "Campaña"],
        campaigns: ["Todas", "Reactivación clientes atrasados", "Segunda visita — nuevos clientes", "Menú de almuerzo — oficinas cercanas"],
        branches: ["Todas", "Providencia"],
        segments: ["Todos", "Nuevos", "Frecuentes", "VIP", "En riesgo"],
      },
    },

    /* ============ Integraciones ============ */
    integrations: [
      { id: "wpcafe", name: "WPCafe", category: "Menú y mesas", mode: "nativa", status: "conectado", lastSync: daysAgo(0) },
      { id: "woocommerce", name: "WooCommerce", category: "Pedidos", mode: "nativa", status: "conectado", lastSync: daysAgo(0) },
      { id: "mercadopago", name: "Mercado Pago", category: "Pagos", mode: "nativa", status: "conectado", lastSync: daysAgo(0) },
      { id: "bsale", name: "Bsale", category: "Facturación", mode: "nativa", status: "conectado", lastSync: daysAgo(0) },
      { id: "ghl", name: "GoHighLevel", category: "CRM y campañas", mode: "nativa", status: "conectado", lastSync: daysAgo(0) },
      { id: "toteat", name: "Toteat", category: "POS", mode: "nativa", status: "sincronizando", lastSync: daysAgo(0) },
      { id: "fudo", name: "Fudo", category: "POS", mode: "parcial", status: "conectado", lastSync: daysAgo(1) },
      { id: "justo", name: "Justo", category: "POS", mode: "puente", status: "conectado", lastSync: daysAgo(1) },
      { id: "kds", name: "KDS propio", category: "Cocina", mode: "puente", status: "conectado", lastSync: daysAgo(0) },
      { id: "printbridge", name: "Print Bridge", category: "Impresión", mode: "puente", status: "error", lastSync: daysAgo(2) },
      { id: "apis", name: "APIs / Webhooks", category: "Desarrollo", mode: "nativa", status: "conectado", lastSync: daysAgo(0) },
    ],

    /* ============ Pedidos / reservas (operación) ============ */
    orders: [
      { id: "PED-3311", customer: "Claudia Soto", channel: "Teléfono", type: "Reserva", status: "confirmada", total: 0, time: daysAgo(0) },
      { id: "PED-3310", customer: "María González", channel: "Web", type: "Retiro", status: "pagado", total: 12500, time: daysAgo(1) },
      { id: "PED-3309", customer: "Mesa 7", channel: "QR", type: "Mesa", status: "en cocina", total: 24300, time: daysAgo(2) },
      { id: "PED-3308", customer: "Juan Pérez", channel: "WhatsApp", type: "Delivery", status: "entregado", total: 28500, time: daysAgo(3) },
      { id: "PED-3307", customer: "Rodrigo Fuentes", channel: "Instagram", type: "Catering", total: 410000, status: "en preparación", time: daysAgo(2) },
    ],

    /* ============ Recomendaciones de la IA (hoy) ============ */
    recommendations: [
      { id: "REC-01", icon: "icon-refresh", title: "Activar campaña para 87 clientes atrasados", detail: "Su ciclo habitual indica que deberían haber vuelto ya.", action: "Crear campaña", link: "campaigns.html" },
      { id: "REC-02", icon: "icon-phone", title: "Revisar 12 llamadas no convertidas esta semana", detail: "La IA detecta que casi todas incluyen preguntas sobre delivery.", action: "Ver llamadas", link: "agent-center.html" },
      { id: "REC-03", icon: "icon-target", title: "Promocionar menú de almuerzo a clientes de oficina", detail: "Alta afinidad entre 12:00 y 14:00 los días de semana.", action: "Ver audiencia", link: "campaigns.html" },
      { id: "REC-04", icon: "icon-refresh", title: "Recuperar 16 carritos pendientes", detail: "Sesiones en la carta QR sin checkout en las últimas 48 horas.", action: "Recuperar", link: "campaigns.html" },
      { id: "REC-05", icon: "icon-alert", title: "Contactar 5 clientes con feedback negativo", detail: "Casos abiertos hace más de 24 horas sin respuesta.", action: "Ver casos", link: "reputation.html" },
    ],

    /* ============ Panel "Oportunidades de crecimiento" ============ */
    growthInsights: [
      "12 llamadas no se convirtieron esta semana. La IA recomienda revisar las preguntas sobre delivery.",
      "87 clientes frecuentes están atrasados respecto de su ciclo habitual.",
      "Los clientes que compran pizza familiar responden mejor los jueves.",
      "La campaña de cumpleaños generó 24 visitas este mes.",
      "El tiempo de respuesta de WhatsApp aumentó un 18% esta semana.",
      "El cheesecake tiene alta afinidad con pedidos de café después de las 17:00.",
      "Los clientes que llegan por Instagram convierten un 22% más cuando reciben respuesta en menos de 5 minutos.",
    ],
  };

  window.GP_DATA = GP_DATA;
})();
