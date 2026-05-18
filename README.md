# OLFATIVA AI — Ecosistema D2C de Perfumería de Lujo con IA

**Versión:** 1.0
**Autor:** Senior AI & Automation Engineering
**Stack principal:** Next.js 14 · n8n · OpenAI · Shopify · Airtable · WhatsApp Cloud API · Slack

---

## 1. Propuesta de Valor

**Olfativa AI** no vende perfumes; vende **identidad olfativa**. Cada cliente recibe una fragancia validada por un motor de IA que cruza tres capas de datos:

1. **Capa olfativa** — Familias (chipre, oriental, amaderada, cítrica, floral), notas (salida, corazón, fondo) y concentración (EDP, EDT, parfum).
2. **Capa psicográfica** — Arquetipos de marca (Jung) cruzados con momentos de uso (laboral, íntimo, social, ritual).
3. **Capa conductual** — Eventos del e-commerce (scroll depth, tiempo en PDP, abandono, recompra) ponderados por LTV.

### Diferenciador competitivo

| Eje | Competencia tradicional | Olfativa AI |
|---|---|---|
| Recomendación | Filtros estáticos por familia | Embeddings + perfil psicográfico |
| Retención | Email genérico | Predicción de fin de producto (30/60/90 días) |
| Operación | Manual / hojas de cálculo | n8n orquestando 100% del backoffice |
| Atención | Tickets reactivos | WhatsApp proactivo con contexto de compra |

### KPIs objetivo (12 meses)

- **CR landing → quiz:** ≥ 38 %
- **CR quiz → compra:** ≥ 12 %
- **AOV:** 95–140 €
- **Recompra a 90 días:** ≥ 28 %
- **CAC payback:** < 3 meses

---

## 2. Stack Tecnológico

```
┌──────────────────────────────────────────────────────────────┐
│                      CAPA DE PRESENTACIÓN                    │
│  Next.js 14 (App Router) · Tailwind · Framer Motion · GSAP  │
└──────────────────────────────────────────────────────────────┘
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                       CAPA DE NEGOCIO                        │
│       Shopify Headless (Storefront API + Admin API)          │
└──────────────────────────────────────────────────────────────┘
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                  CAPA DE ORQUESTACIÓN (n8n)                  │
│  Webhooks · OpenAI · Airtable · WhatsApp · Slack · SendGrid  │
└──────────────────────────────────────────────────────────────┘
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    CAPA DE INTELIGENCIA                      │
│   OpenAI GPT-4o (perfilado) · text-embedding-3 (matching)    │
└──────────────────────────────────────────────────────────────┘
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                       CAPA DE DATOS                          │
│  Airtable (CRM) · Shopify (catálogo) · PostgreSQL (eventos)  │
└──────────────────────────────────────────────────────────────┘
```

### Componentes y justificación

- **Next.js 14 + App Router** — SSR/ISR para SEO de fichas de perfume y server actions para el quiz.
- **Shopify Headless** — Pasarela de pago y logística probadas; nos centramos en la capa de inteligencia.
- **n8n self-hosted (Docker)** — Motor central de orquestación. Toda la lógica de negocio vive aquí.
- **OpenAI GPT-4o** — Análisis de perfil del quiz y generación de copy personalizado.
- **Airtable** — CRM ligero; vistas de segmentos y triggers por cambio de estado.
- **WhatsApp Cloud API (Meta) o Evolution API** — Canal principal de retención (open rate > 90 %).
- **Slack** — Centro de operaciones interno (alertas de stock, pedidos VIP, errores).

---

## 3. Modelo de Retención Basado en Datos

### 3.1 Ciclo de vida del producto

Cada SKU tiene metadata declarada en Airtable:

| Campo | Tipo | Ejemplo |
|---|---|---|
| `sku` | string | `OLF-001-EDP-100` |
| `duracion_dias_uso_medio` | int | 75 |
| `desviacion_dias` | int | 15 |
| `familia` | enum | oriental |
| `precio_recompra` | currency | 89 € |

### 3.2 Triggers de retención

1. **Día 0** — Confirmación de compra + tutorial de aplicación (WhatsApp).
2. **Día 7** — Encuesta corta de primera impresión (1 pregunta).
3. **Día 30** — Cross-sell complementario (vela / brume) si AOV < umbral.
4. **Día `duracion_dias_uso_medio - 10`** — Recordatorio "tu fragancia está por terminar" con link de recompra rápida (1 clic, dirección guardada).
5. **Día +180 sin compra** — Reactivación con nueva recomendación basada en su perfil + lanzamientos.

### 3.3 Segmentación dinámica

Airtable mantiene 5 segmentos automáticos actualizados por n8n cada 6 horas:

- `VIP` — LTV > 400 € o 3+ pedidos
- `Núcleo` — 1–2 pedidos, recompra activa
- `Riesgo` — última compra > duración estimada + 30 días
- `Dormido` — > 180 días sin actividad
- `Lead` — perfil completado, sin compra

---

## 4. Arquitectura de la Landing Page

Ver `/frontend` para boilerplate completo. Estructura semántica:

```
┌─────────────────────────────────────────────────────┐
│  HERO — VSL (Video Sales Letter) autoplay muted    │
│  Headline: "Descubre tu identidad olfativa"        │
│  CTA primario: Iniciar quiz (45 segundos)          │
├─────────────────────────────────────────────────────┤
│  SOCIAL PROOF — Logos de prensa + rating agregado  │
├─────────────────────────────────────────────────────┤
│  SELECTOR DINÁMICO DE FRAGANCIAS                   │
│  Carrusel 3D con scroll-linked animation           │
│  Filtro por familia + momento + intensidad         │
├─────────────────────────────────────────────────────┤
│  COMO FUNCIONA — 3 pasos con scroll-trigger        │
├─────────────────────────────────────────────────────┤
│  TESTIMONIOS — Grid de UGC verificado              │
├─────────────────────────────────────────────────────┤
│  QUIZ EMBEBIDO (Typeform o nativo)                 │
├─────────────────────────────────────────────────────┤
│  GARANTÍA + FAQ + FOOTER                           │
└─────────────────────────────────────────────────────┘
```

### Decisiones técnicas

- **VSL** — `<video>` HTML5 con `poster` optimizado en WebP; cargado en lazy.
- **Scroll-linked animations** — GSAP ScrollTrigger para el carrusel y Framer Motion para microinteracciones.
- **Quiz** — Server actions en Next.js para evitar exponer la API key de OpenAI.
- **Performance budget** — LCP < 1.8 s, CLS < 0.05, TBT < 200 ms.

---

## 5. Core de Automatización (n8n)

Los 4 workflows están en `/n8n_workflows`. Resumen:

### 5.1 `01_lead_magnet_quiz_to_whatsapp.json`

```
Webhook (Typeform/Quiz) → Normalizar respuestas → OpenAI Chat
  (system prompt: perfilador olfativo) → Match con catálogo
  (embeddings) → Upsert Airtable (Lead) → WhatsApp Cloud API
  → Set timer Day+2 (reminder si no compra)
```

### 5.2 `02_cart_recovery_intelligent.json`

```
Webhook Shopify (checkout/abandoned) → Wait inteligente (1h / 6h / 24h)
  → Lookup en Airtable (LTV, segmento, perfil) → OpenAI (genera oferta)
  → If precio_carrito > 120€ → WhatsApp con descuento
  → Else → Email con bundle alternativo
```

### 5.3 `03_post_sale_30day_replenish.json`

```
Webhook Shopify (orders/paid) → Calcular día_estimado_fin
  (duracion_dias_uso_medio - 10) → Crear registro en Airtable
  (campo `recompra_objetivo_date`) → Scheduler n8n (cron diario)
  → Para cada `recompra_objetivo_date == HOY` → WhatsApp + Email
  con magic link de recompra (Shopify draft order)
```

### 5.4 `04_inventory_sync_and_alerts.json`

```
Cron 4x/día → GET proveedores (REST) → Diff con Shopify Admin API
  → Update stock → If stock < umbral (config por SKU)
  → Slack alert (#ops-inventario) con SKU, días de cobertura, link recompra
```

---

## 6. Estructura del Repositorio

```
olfativa-ai/
├── README.md                    ← Este documento
├── IMPLEMENTATION_GUIDE.md      ← Setup paso a paso
├── frontend/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx             ← Landing
│   │   ├── quiz/page.tsx
│   │   └── api/quiz/route.ts    ← Server action → n8n webhook
│   ├── components/
│   │   ├── Hero.tsx
│   │   ├── FragranceSelector.tsx
│   │   ├── SocialProof.tsx
│   │   └── Quiz.tsx
│   └── lib/
│       └── n8n-client.ts
└── n8n_workflows/
    ├── 01_lead_magnet_quiz_to_whatsapp.json
    ├── 02_cart_recovery_intelligent.json
    ├── 03_post_sale_30day_replenish.json
    └── 04_inventory_sync_and_alerts.json
```

---

## 7. Roadmap de 90 Días

| Semana | Hito |
|---|---|
| 1–2 | Setup n8n self-hosted + Airtable base + Shopify dev store |
| 3–4 | Workflow 01 (Lead Magnet) + landing v1 |
| 5–6 | Workflow 02 (Cart Recovery) + tests A/B copy IA |
| 7–8 | Workflow 03 (Replenishment) + dashboards Airtable |
| 9–10 | Workflow 04 (Inventario) + Slack ops |
| 11–12 | Optimización · scroll-linked animations · launch |

---

## 8. Consideraciones de Escalabilidad

- **n8n en cluster** — Worker mode con Redis a partir de 50 k ejecuciones/mes.
- **Caché de embeddings** — Catálogo precomputado; refrescar solo en alta de SKU.
- **Rate limiting WhatsApp** — Cola n8n con throttle 50 mensajes/segundo.
- **Observabilidad** — Webhooks de error de n8n → Sentry + Slack `#alerts`.
- **GDPR** — Doble opt-in WhatsApp; campo `consent_timestamp` en Airtable.

---

## 9. Próximos pasos

1. Leer `IMPLEMENTATION_GUIDE.md`.
2. Importar los 4 JSON de `/n8n_workflows` en tu instancia n8n.
3. Configurar credenciales (Shopify, OpenAI, WhatsApp, Airtable, Slack).
4. Desplegar `/frontend` en Vercel.
5. Conectar el webhook del quiz a la landing.

> Toda decisión de negocio que no esté codificada en n8n es deuda técnica.
