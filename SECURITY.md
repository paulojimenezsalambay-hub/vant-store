# Auditoría de Seguridad · VANT STORE

**Fecha:** 16 mayo 2026
**Alcance:** `index.html` y archivos JS auxiliares (`assets/products/manifest.js`)
**Contexto:** Single Page Application estática, sin backend, con persistencia en `localStorage`.

---

## Hallazgos y mitigaciones aplicadas

### 1 · XSS Persistente (riesgo alto · CORREGIDO)

**Vector:** El editor de imágenes flotante (botón ⚙) renderizaba URLs introducidas por el usuario directamente con `innerHTML`:

```js
// VULNERABLE — antes
thumb.innerHTML = `<img src="${v}" onerror="...">`;
```

Si la URL contenía comillas o `>`, podía romper el atributo y ejecutar JS arbitrario (`https://x.com/" onerror=alert(1)//`).

**Mitigación aplicada:**
- Toda construcción de `<img>` con URLs del usuario ahora usa `document.createElement('img')` + `img.src = …`. El setter de la propiedad `src` no parsea HTML, así que es inmune a la inyección de atributos.
- Para el resto de interpolaciones HTML se añade el helper `escapeHTML()` que codifica `& < > " '`.
- Se introduce `safeURL()` que rechaza esquemas peligrosos (`javascript:`, `file:`, `data:text/html`, etc.) y solo permite:
  - `http://` y `https://`
  - `data:image/...` (para los recortes del cropper)
  - `mailto:...`
  - Paths relativos sin `..`

### 2 · Inyección por localStorage (riesgo medio · CORREGIDO)

**Vector:** Al cargar de `localStorage` se hacía `JSON.parse` sin validar:

```js
// VULNERABLE — antes
const overrides = JSON.parse(localStorage.getItem(IMG_KEY) || '{}');
let cart = JSON.parse(localStorage.getItem(CART_KEY) || '{}');
```

Un atacante con acceso a DevTools (o que controle el dispositivo por unos segundos) podía:
- Inyectar `<script>` en campos del carrito
- Inyectar URLs `javascript:` en overrides

**Mitigación aplicada:**
- `loadCartSafe()`: valida que cada slug sea solo `[a-z0-9_-]`, longitud ≤ 64, y que `qty` sea entero entre 0 y 99.
- `loadURLMapSafe()`: aplica `safeURL()` a cada URL antes de guardarla en memoria.
- `renderCart()`: además, al renderizar cada item se vuelve a coercer `qty` a entero positivo y `precio * qty` se calcula como número.

### 3 · Sin Content Security Policy (riesgo bajo · CORREGIDO)

**Vector:** Sin CSP, una eventual XSS no estaba contenida. JS inline podía ejecutarse libremente.

**Mitigación aplicada:**
Meta tag con CSP que define:
- `default-src 'self'`: solo recursos del propio origen por defecto
- `script-src 'self' 'unsafe-inline'`: scripts del propio origen + inline (necesario porque todo el JS de la página vive en `<script>`)
- `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`: estilos propios + inline + Google Fonts
- `img-src 'self' data: https:`: imágenes locales, data URLs y cualquier HTTPS (permite Druni, Wikipedia, etc.)
- `frame-ancestors 'none'`: bloquea clickjacking
- `base-uri 'self'`: previene base hijacking
- `connect-src 'self' https://wa.me`: solo XHR/fetch al propio origen o wa.me

Además se añaden:
- `X-Content-Type-Options: nosniff`: el navegador no infiere tipo MIME
- `Referrer-Policy: strict-origin-when-cross-origin`: minimiza fuga de URL completa a sitios externos

### 4 · `target="_blank"` sin `noopener` (riesgo bajo · YA SEGURO)

Todos los enlaces externos (WhatsApp, Instagram, manifest) ya usaban `rel="noopener"`. El checkout del carrito usa `window.open(url, '_blank', 'noopener,noreferrer')` que es equivalente y más explícito.

### 5 · URL de WhatsApp con número inyectado (riesgo nulo · YA SEGURO)

El número de WhatsApp es una constante fija (`WHATSAPP_NUMBER = '34600123456'`), no dato de usuario. El mensaje del carrito se construye con `encodeURIComponent()` antes de meterlo en la URL.

### 6 · Validación de inputs numéricos (riesgo nulo · YA SEGURO)

Los inputs de filtro de precio usan `+e.target.value` (coerción a número) y comparaciones aritméticas. Cualquier input no numérico se convierte en `NaN` y la comparación devuelve `false`, descartando ese filtro silenciosamente.

### 7 · Sin uso de funciones peligrosas (riesgo nulo · YA SEGURO)

Verificado por grep:
- ❌ Sin `eval()`
- ❌ Sin `new Function()`
- ❌ Sin `setTimeout(string, …)` ni `setInterval(string, …)`
- ❌ Sin `document.write()`
- ❌ Sin lectura indiscriminada de `window.location.hash` como HTML

### 8 · File upload local (riesgo nulo · YA SEGURO)

El cropper usa `FileReader.readAsDataURL()` que solo lee el archivo del usuario en memoria. No hay upload a servidor, no hay ejecución del contenido. Aunque alguien suba un archivo `.exe` renombrado a `.jpg`, solo se intentará renderizar como imagen (y fallará silenciosamente).

---

## Recomendaciones adicionales (al pasar a producción)

1. **Hosting HTTPS obligatorio**: garantiza que todo el tráfico está cifrado. Hosting recomendado: Vercel, Netlify, Cloudflare Pages — todos con HTTPS automático.

2. **Headers HTTP de seguridad** (configurar en el servidor, complementan los `<meta>`):
   ```
   Content-Security-Policy: …      (más estricto que el meta)
   X-Frame-Options: DENY
   X-Content-Type-Options: nosniff
   Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
   Referrer-Policy: strict-origin-when-cross-origin
   Permissions-Policy: geolocation=(), microphone=(), camera=()
   ```

3. **Subresource Integrity (SRI)** para Google Fonts:
   Actualmente cargamos Google Fonts sin SRI. Si Google Fonts se viera comprometido, podrían servir CSS malicioso. Riesgo bajo (Google es objetivo improbable) pero añadir el atributo `integrity="sha384-…"` lo cierra del todo.

4. **WhatsApp Cloud API en lugar de wa.me**:
   `wa.me` es público y cualquiera podría enumerar tu número. Para volumen alto, mejor usar WhatsApp Business Cloud API con webhooks autenticados.

5. **No incluir el número de WhatsApp en JS público**:
   Cuando lances, considera servir el número desde un endpoint protegido por captcha simple (Cloudflare Turnstile, por ejemplo) para evitar scraping y spam.

6. **Logs del cliente**:
   No envíes datos del usuario a servicios externos sin consentimiento explícito. Implementa cookie banner si añades GA/Meta Pixel.

7. **Backup de configuración**:
   Los datos del usuario (carrito, overrides) viven en `localStorage`. Si el usuario limpia caché, los pierde. Considera persistir el carrito en cookies firmadas o en backend al añadir checkout real.

8. **Validación del lado servidor**:
   Cuando integres pago, NO confíes en los precios que llegan del cliente. Re-calcula precios en backend.

9. **Rate-limiting en WhatsApp**:
   Para evitar abuso del botón checkout (ej. bot enviando 1000 clicks), implementa un pequeño debounce (300ms ya está en search, también en checkout).

10. **PII / GDPR**:
    Cuando guardes datos personales (email, dirección, etc.), publica política de privacidad, implementa derecho al olvido y consentimiento explícito.

---

## Resumen ejecutivo

| Categoría | Estado |
|---|---|
| XSS persistente vía editor | ✅ Corregido |
| XSS vía localStorage | ✅ Corregido |
| Open redirect | ✅ Mitigado (safeURL) |
| Esquemas peligrosos (javascript:, file:) | ✅ Bloqueado |
| Clickjacking | ✅ Bloqueado (frame-ancestors 'none') |
| CSP | ✅ Activado |
| MIME sniffing | ✅ Bloqueado (X-Content-Type-Options) |
| Information leak via Referer | ✅ Mitigado (strict-origin) |
| HTTPS / HSTS | ⚠️ Pendiente (al desplegar) |
| Pago seguro | ⚠️ Pendiente (cuando se añada) |

La página, en su estado actual (estática, sin backend, ejecutándose en local o tras un CDN con HTTPS), está protegida contra los vectores comunes de ataque web a un nivel adecuado para un MVP.
