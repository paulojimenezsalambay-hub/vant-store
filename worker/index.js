/**
 * Vant Store · Cloudflare Worker  (v2 — hardened)
 * =============================================================
 * Reemplaza el webhook de n8n: llama a Airtable directamente y
 * devuelve los productos al navegador.
 *
 * Cambios v2:
 *   ✅ Bloquea requests SIN header Origin (antes pasaban libres)
 *   ✅ Devuelve el Origin validado en Access-Control-Allow-Origin
 *      en lugar del comodín '*' (antes contradecía la validación)
 *   ✅ Añade Vary: Origin para que caches sirvan la respuesta correcta
 *   ✅ Añade X-Content-Type-Options y Access-Control-Max-Age
 *   ✅ Lista blanca extendida: www, subdominio preview de Pages, localhost
 *
 * Variables de entorno (Secrets):
 *   AIRTABLE_TOKEN  — Personal Access Token de Airtable
 */

const AIRTABLE_BASE  = 'appkHx2y58OuG1UuF';
const AIRTABLE_TABLE = 'Productos_Ofertas';

/* Orígenes autorizados exactos */
const ALLOWED_ORIGINS = [
  'https://vant-store.com',
  'https://www.vant-store.com',
  'https://vant-store.pages.dev',
];

/* Patrones permitidos: deploy previews de Pages + dev local */
const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/[a-z0-9-]+\.vant-store\.pages\.dev$/i,
  /^http:\/\/localhost(:\d+)?$/i,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/i,
];

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  return ALLOWED_ORIGIN_PATTERNS.some(re => re.test(origin));
}

export default {
  async fetch(request, env) {
    const origin  = request.headers.get('Origin') || '';
    const allowed = isAllowedOrigin(origin);

    /* ── CORS preflight ── */
    if (request.method === 'OPTIONS') {
      if (!allowed) {
        return new Response(null, { status: 403 });
      }
      return corsResponse(null, 204, 'text/plain', origin);
    }

    /* ── Solo GET ── */
    if (request.method !== 'GET') {
      return corsResponse('Method not allowed', 405, 'text/plain', origin);
    }

    /* ── BLOQUEO: toda petición sin Origin válido ── */
    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: {
          'Content-Type':           'application/json',
          'X-Content-Type-Options': 'nosniff',
        }
      });
    }

    if (!env.AIRTABLE_TOKEN) {
      return corsResponse(
        JSON.stringify({ error: 'Worker no configurado: falta AIRTABLE_TOKEN' }),
        500, 'application/json', origin
      );
    }

    try {
      /* ── Obtener TODOS los registros de Airtable (paginación) ── */
      let allRecords = [];
      let offset     = null;

      do {
        const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(AIRTABLE_TABLE)}`);
        url.searchParams.set('pageSize', '100');
        if (offset) url.searchParams.set('offset', offset);

        const res = await fetch(url.toString(), {
          headers: { 'Authorization': `Bearer ${env.AIRTABLE_TOKEN}` }
        });

        if (!res.ok) {
          const errText = await res.text();
          return corsResponse(
            JSON.stringify({ error: `Airtable ${res.status}`, detail: errText.slice(0, 200) }),
            502, 'application/json', origin
          );
        }

        const data = await res.json();
        allRecords = allRecords.concat(data.records || []);
        offset     = data.offset || null;

      } while (offset);

      /* ── Transformar al formato que espera la landing ── */
      const productos = {};

      for (const record of allRecords) {
        const f  = record.fields || {};
        const id = String(f.ID_Producto || '').trim();
        if (!id) continue;

        productos[id] = {
          ID_Producto:      id,
          Nombre:           f.Nombre           || '',
          Precio_Original:  Number(f.Precio_Original) || 0,
          Precio_Oferta:    Number(f.Precio_Oferta)   || 0,
          En_Oferta:        Boolean(f.En_Oferta),
          Etiqueta_Oferta:  f.Etiqueta_Oferta  || '',
          Foto:             Array.isArray(f.Foto) ? f.Foto : [],
          Stock_Disponible: Number(f.Stock_Disponible) || 0,
        };
      }

      return corsResponse(JSON.stringify(productos), 200, 'application/json', origin);

    } catch (e) {
      return corsResponse(
        JSON.stringify({ error: 'Error interno', detail: String(e.message).slice(0, 200) }),
        500, 'application/json', origin
      );
    }
  }
};

/**
 * Construye una respuesta con cabeceras CORS SEGURAS.
 * Devuelve el origen validado — NUNCA el comodín '*'.
 * Añade Vary: Origin para evitar cache poisoning.
 */
function corsResponse(body, status = 200, contentType = 'text/plain', origin = '') {
  const allowOrigin = isAllowedOrigin(origin) ? origin : ALLOWED_ORIGINS[0];
  return new Response(body, {
    status,
    headers: {
      'Content-Type':                 contentType,
      'Access-Control-Allow-Origin':  allowOrigin,
      'Vary':                         'Origin',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Max-Age':       '86400',
      'Cache-Control':                'no-cache, no-store',
      'X-Content-Type-Options':       'nosniff',
    }
  });
}
