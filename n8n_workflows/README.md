# Workflows n8n · Olfativa AI

Cuatro workflows JSON importables desde la UI de n8n (`Workflows → Import from File`).

| # | Archivo | Disparador | Propósito |
|---|---|---|---|
| 01 | `01_lead_magnet_quiz_to_whatsapp.json` | Webhook quiz | Perfila al lead con GPT-4o, lo guarda en Airtable y envía recomendación por WhatsApp |
| 02 | `02_cart_recovery_intelligent.json` | Webhook Shopify `checkouts/update` | Recupera carritos abandonados con oferta personalizada por IA (WhatsApp/Email) |
| 03 | `03_post_sale_30day_replenish.json` | Webhook Shopify `orders/paid` + Cron diario | Predice fin del producto y envía magic link de recompra |
| 04 | `04_inventory_sync_and_alerts.json` | Cron 6h | Sincroniza inventario con proveedor y alerta a Slack si stock bajo |

## Variables de entorno requeridas en n8n

```
WA_PHONE_NUMBER_ID          = ID del número WhatsApp Business en Meta
SHOPIFY_DOMAIN              = tu-tienda.myshopify.com
SHOPIFY_LOCATION_ID         = ID de la ubicación de inventario en Shopify
PROVEEDOR_API_URL           = URL base de la API del proveedor
```

## Placeholders a reemplazar tras importar

- `appXXXXXXXXXXXXXX` → Base ID de Airtable
- `tblLeadsXXXXXXX` → Table ID de la tabla Leads
- `tblProductosXXXX` → Table ID de la tabla Productos
- `tblPedidosXXXXXX` → Table ID de la tabla Pedidos
- `C0000OPSINV`, `C0000MGMTVIP` → IDs de canales Slack

## Plantillas WhatsApp pre-aprobadas necesarias

- `recomendacion_quiz` — Resultado del quiz
- `recomendacion_quiz_reminder` — Recordatorio D+2 sin compra
- `cart_recovery` — Carrito abandonado con oferta
- `cart_recovery_final` — Último intento de recuperación
- `replenishment_reminder` — Aviso de fin de producto con magic link

## Convenciones

- **Naming de webhooks** — kebab-case (`quiz-lead`, `cart-abandoned`, `order-paid`)
- **Idempotencia** — todos los nodos Airtable usan `upsert` con `email` o `sku` como clave
- **Error handling** — cada workflow debe enlazarse a un Error Workflow centralizado que avise a Slack `#alerts`
- **Versionado** — exporta el JSON a Git tras cada cambio significativo

## Diagrama lógico

```
┌─ Landing (Next.js) ────────────────┐
│  Quiz submit → /api/quiz           │
└──────────────┬─────────────────────┘
               │ HTTPS POST
               ▼
       ┌───────────────┐
       │  n8n WF 01    │ ◀─── OpenAI (perfilado)
       │ Lead Magnet   │ ◀─── Airtable (Leads)
       └───────┬───────┘ ───▶ WhatsApp Cloud API
               │
   ┌───────────┴───────────┐
   ▼                       ▼
Shopify (compra)      Lead sigue activo
   │                       │
   ▼                       ▼
┌─────────┐         ┌─────────────┐
│  WF 03  │         │  WF 02      │
│Replenish│         │Cart Recovery│
└────┬────┘         └──────┬──────┘
     │                     │
     └─────┬───────────────┘
           ▼
    Airtable CRM
    (segmentación dinámica)

┌─ WF 04 ──────────┐
│ Cron 6h          │ ◀─ Proveedor REST
│ Inventory Sync   │ ─▶ Shopify Admin API
│                  │ ─▶ Slack alertas
└──────────────────┘
```
