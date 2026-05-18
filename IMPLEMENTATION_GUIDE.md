# Guía de Implementación — Olfativa AI

Esta guía cubre la puesta en marcha del ecosistema en un entorno productivo. Tiempo estimado: **8–12 horas** para un equipo técnico familiarizado con APIs.

---

## 0. Pre-requisitos

| Servicio | Plan mínimo | Coste estimado/mes |
|---|---|---|
| n8n (self-hosted Docker o n8n Cloud) | Starter | 0 € / 20 € |
| Shopify | Basic | 36 € |
| OpenAI API | Pay-as-you-go | ~30 € (1k leads/mes) |
| WhatsApp Cloud API (Meta) | Conversaciones por sesión | ~0,05 € / msg |
| Airtable | Team | 22 €/usuario |
| Slack | Free | 0 € |
| Vercel (frontend) | Hobby | 0 € |
| **Total aprox.** | | **~110–150 €/mes** |

---

## 1. Despliegue de n8n (self-hosted)

```bash
# docker-compose.yml mínimo
version: '3.8'
services:
  n8n:
    image: n8nio/n8n:latest
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASS}
      - N8N_HOST=n8n.tudominio.com
      - WEBHOOK_URL=https://n8n.tudominio.com/
      - GENERIC_TIMEZONE=Europe/Madrid
      - N8N_ENCRYPTION_KEY=${N8N_ENC_KEY}
    volumes:
      - n8n_data:/home/node/.n8n
volumes:
  n8n_data:
```

```bash
docker compose up -d
```

Configura un reverse proxy (Caddy o Nginx) con HTTPS automático.

---

## 2. Credenciales en n8n

En `Settings → Credentials`, crea:

### 2.1 OpenAI
- Tipo: `OpenAI API`
- API Key: desde https://platform.openai.com/api-keys

### 2.2 Shopify
- Tipo: `Shopify Access Token`
- Crea una app privada en Shopify Admin → Apps → Develop apps.
- Scopes necesarios: `read_products`, `write_products`, `read_orders`, `write_draft_orders`, `read_customers`, `write_customers`.

### 2.3 WhatsApp Cloud API
- Tipo: `HTTP Header Auth`
- Header: `Authorization`
- Value: `Bearer <META_ACCESS_TOKEN>`
- Da de alta tu número en https://business.facebook.com/
- Anota el `PHONE_NUMBER_ID`.

### 2.4 Airtable
- Tipo: `Airtable Personal Access Token`
- Token desde https://airtable.com/create/tokens con scopes `data.records:read/write` y `schema.bases:read`.

### 2.5 Slack
- Tipo: `Slack OAuth2`
- Crea app en https://api.slack.com/apps con scopes `chat:write`, `channels:read`.

---

## 3. Estructura de Airtable

Crea una base `Olfativa CRM` con las siguientes tablas:

### Tabla `Leads`
| Campo | Tipo |
|---|---|
| `id` | Autonumber (PK) |
| `email` | Email |
| `phone_e164` | Phone |
| `nombre` | Single line |
| `quiz_respuestas` | Long text (JSON) |
| `perfil_arquetipo` | Single select (Sabio, Amante, Creador, Héroe, Mago, Inocente) |
| `recomendacion_sku` | Linked to `Productos` |
| `consent_whatsapp` | Checkbox |
| `consent_timestamp` | Date |
| `segmento` | Single select (Lead, Núcleo, VIP, Riesgo, Dormido) |
| `created_at` | Created time |

### Tabla `Productos`
| Campo | Tipo |
|---|---|
| `sku` | Single line (PK) |
| `nombre` | Single line |
| `familia` | Single select |
| `notas_salida` | Multi select |
| `notas_corazon` | Multi select |
| `notas_fondo` | Multi select |
| `duracion_dias_uso_medio` | Number |
| `desviacion_dias` | Number |
| `precio_recompra` | Currency |
| `stock_actual` | Number (sync n8n) |
| `umbral_alerta` | Number |

### Tabla `Pedidos`
| Campo | Tipo |
|---|---|
| `shopify_order_id` | Single line (PK) |
| `customer` | Linked to `Leads` |
| `productos` | Linked to `Productos` (multiple) |
| `total` | Currency |
| `recompra_objetivo_date` | Date (calculado por n8n) |
| `recompra_msg_enviado` | Checkbox |

---

## 4. Importar los workflows

1. En n8n: `Workflows → Import from File`.
2. Importa los 4 JSON de `/n8n_workflows/`.
3. Para cada uno:
   - Reasigna credenciales (las del JSON son placeholders).
   - Ajusta los IDs de Airtable (Base ID y Table ID) en los nodos `Airtable`.
   - Reemplaza `PHONE_NUMBER_ID` en los nodos HTTP de WhatsApp.

---

## 5. Conectar el quiz de la landing

### 5.1 Opción A — Typeform

1. Crea un Typeform con 6–8 preguntas (familia preferida, ocasión, estación, intensidad, etc.).
2. Conecta `Connect → Webhooks → Add new` apuntando a la URL del nodo `Webhook` del workflow `01_lead_magnet_quiz_to_whatsapp`.

### 5.2 Opción B — Quiz nativo en Next.js

El boilerplate en `/frontend/app/api/quiz/route.ts` envía el payload al webhook de n8n vía `fetch`. Configura `N8N_WEBHOOK_URL` en `.env.local`:

```
N8N_WEBHOOK_URL=https://n8n.tudominio.com/webhook/quiz-lead
```

---

## 6. Configurar Shopify Webhooks

Desde Shopify Admin → Settings → Notifications → Webhooks:

| Evento | URL n8n |
|---|---|
| `checkouts/create` | `…/webhook/cart-created` |
| `checkouts/update` | `…/webhook/cart-updated` |
| `orders/paid` | `…/webhook/order-paid` |
| `orders/fulfilled` | `…/webhook/order-fulfilled` |

Formato: `JSON`. Versión de API: `2024-10` o superior.

---

## 7. Plantillas de WhatsApp

Meta exige plantillas pre-aprobadas para mensajes salientes fuera de la ventana de 24 h. Da de alta estas 4 plantillas en Business Manager:

1. **`recomendacion_quiz`** — Resultado del quiz con SKU.
2. **`cart_recovery`** — Recordatorio de carrito con oferta.
3. **`replenishment_reminder`** — "Tu fragancia está por terminar".
4. **`reactivation_180d`** — Reactivación de clientes dormidos.

Los IDs aprobados se referencian en los nodos HTTP de los workflows.

---

## 8. Desplegar el frontend

```bash
cd frontend
pnpm install
pnpm build
```

Sube a Vercel:

```bash
vercel --prod
```

Variables de entorno en Vercel:

```
N8N_WEBHOOK_URL=https://n8n.tudominio.com/webhook/quiz-lead
NEXT_PUBLIC_SHOPIFY_DOMAIN=tu-tienda.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=<token>
```

---

## 9. Test E2E del Lead Magnet

1. Abre la landing en incógnito.
2. Completa el quiz con un email real.
3. Verifica:
   - Registro creado en Airtable `Leads`.
   - Mensaje recibido en WhatsApp con la recomendación.
   - Webhook ejecutado correctamente en n8n (revisar logs).

---

## 10. Observabilidad

- **n8n** — Activa `Error Workflow` apuntando a Slack `#alerts`.
- **Frontend** — Vercel Analytics + Sentry para errores cliente.
- **Shopify** — Suscríbete a las alertas de fallo de webhook.
- **WhatsApp** — Monitoriza `message_status` (sent/delivered/read).

---

## 11. Checklist pre-launch

- [ ] HTTPS activo en n8n y frontend
- [ ] 4 workflows importados y activos
- [ ] Plantillas WhatsApp aprobadas
- [ ] Airtable poblado con catálogo completo
- [ ] Webhooks de Shopify verificados
- [ ] Test E2E del lead magnet superado
- [ ] Test E2E del cart recovery superado
- [ ] Política de privacidad / consentimiento WhatsApp publicada
- [ ] Backup automático del volumen Docker de n8n
- [ ] Plan de rollback documentado

---

## 12. Soporte y mantenimiento

- **Logs de n8n** — retención 30 días en disco.
- **Backups Airtable** — snapshot semanal a Google Drive vía workflow auxiliar.
- **Versionado workflows** — exporta JSON a Git tras cada cambio significativo.

> Recordatorio: cada nueva campaña, plantilla o flujo se documenta en este repositorio antes de pasar a producción.
