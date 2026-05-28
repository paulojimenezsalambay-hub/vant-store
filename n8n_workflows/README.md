# Workflows n8n · VANT Store

Cuatro workflows JSON importables desde la UI de n8n (`Workflows → Import from File`).
Alineados exactamente con la landing page y la estructura de Airtable actual.

| # | Archivo | Endpoint | Disparador | Propósito |
|---|---------|----------|------------|-----------|
| 01 | `01_suscribir_vant.json`  | `POST /suscribir-vant`    | Formulario newsletter/ofertas de la landing | Valida email, evita duplicados en Airtable `Suscriptores`, envía email bienvenida por Outlook |
| 02 | `02_obtener_ofertas.json` | `GET /obtener-ofertas`    | Llamada GET desde browser (futuro) | Devuelve todos los productos con precios/fotos desde Airtable `Productos_Ofertas` + alerta CallMeBot si stock < 5 |
| 03 | `03_actualizar_stock.json`| `POST /actualizar-stock`  | Dueño llama tras confirmar venta WhatsApp | Actualiza `Stock_Disponible` en Airtable + alerta si stock crítico |
| 04 | `04_monitor_stock.json`   | Cron cada 6h              | Automático | Revisa todos los productos y envía alerta WhatsApp (CallMeBot) para agotados y bajo stock |

---

## Airtable — Tablas utilizadas

### `Suscriptores` (ya existe)
| Campo | Tipo | Notas |
|-------|------|-------|
| `Email` | Email | Clave única |
| `Fecha_Suscripcion` | Date | Formato `yyyy-MM-dd` |
| `Estado` | Single Select | Opciones: `Activo` / `Baja` — default `Activo` |

### `Productos_Ofertas` (ya existe — 98 registros)
| Campo | Tipo | Notas |
|-------|------|-------|
| `ID_Producto` | Single line | Formato `perfume-01`..`perfume-98` |
| `Nombre` | Single line | |
| `Precio_Original` | Number | En USD |
| `Precio_Oferta` | Number | En USD |
| `En_Oferta` | Checkbox | |
| `Etiqueta_Oferta` | Single line | Ej: "21% dto" |
| `Foto` | Attachment | Adjunto — se extrae `thumbnails.large.url` |
| `Stock_Disponible` | Number | Unidades disponibles |

---

## Credenciales que debes configurar en n8n

### 1. Airtable Token API
- En n8n: `Settings → Credentials → New → Airtable Token API`
- Token: el que tienes en `CREDENCIALES.txt`
- Base ID: `appkHx2y58OuG1UuF`

### 2. Microsoft Outlook OAuth2 (WF01)
- En n8n: `Settings → Credentials → New → Microsoft Outlook OAuth2`
- Configura con tu cuenta de Microsoft siguiendo el flujo OAuth

### 3. CallMeBot API Key (WF02, WF03, WF04)
- En los nodos `CallMeBot · *`, reemplaza `TU_CALLMEBOT_APIKEY` con tu API key real
- Para obtener la key: añade `+34 644 51 97 88` en WhatsApp y envía `I allow callmebot to send me messages`
- El número destino ya está configurado: `593999999999`

---

## Cómo usar WF03 — Actualizar Stock

Después de confirmar un pedido por WhatsApp, el dueño llama al webhook para actualizar el stock:

```bash
# Ejemplo: el perfume-15 vendió 2 unidades, quedan 3
curl -X POST https://tu-n8n.com/webhook/actualizar-stock \
  -H "Content-Type: application/json" \
  -d '{"id_producto": "perfume-15", "stock_disponible": 3}'
```

O desde cualquier cliente HTTP (Postman, Insomnia, etc.).

---

## Endpoints en producción vs desarrollo

| Entorno | URL base | Nota |
|---------|----------|------|
| Desarrollo | `http://localhost:5678/webhook-test/` | Requiere workflow en modo "Test" |
| Producción | `https://tu-n8n.com/webhook/` | Requiere workflow activo (`Active: ON`) |

La landing detecta el entorno automáticamente con `API_BASE_URL` en `index.html`.

---

## Diagrama de flujos

```
Landing page (vantstore.ec)
│
├── [Form Newsletter] POST /suscribir-vant ──▶ WF01
│   └── Airtable Suscriptores ──▶ Outlook bienvenida
│
├── [Form Ofertas]    POST /suscribir-vant ──▶ WF01 (origen='ofertas')
│   └── Airtable Suscriptores ──▶ Outlook ofertas
│
└── [Futuro: GET datos] GET /obtener-ofertas ──▶ WF02
    └── Airtable Productos_Ofertas ──▶ JSON al browser
        └── IF stock < 5 ──▶ CallMeBot ⚠️

Dueño (manual)
└── POST /actualizar-stock ──▶ WF03
    └── Airtable PATCH Stock_Disponible
        └── IF crítico ──▶ CallMeBot 🚨

Automático (cron 6h)
└── WF04
    └── Airtable todos los productos
        └── IF agotado/bajo ──▶ CallMeBot 🚨/⚠️
```
