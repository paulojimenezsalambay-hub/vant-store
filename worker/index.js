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
 *   ✅ Límite de 60 peticiones/minuto por IP → 429 (binding LIMITADOR)
 *   ✅ Caché de 30 s del catálogo: memoria + Cache API del centro de datos
 *      (cabecera X-Cache: HIT / HIT-COLO / MISS). Errores nunca se guardan.
 *
 * Variables de entorno (Secrets):
 *   AIRTABLE_TOKEN  — Personal Access Token de Airtable
 * Bindings (wrangler.toml):
 *   LIMITADOR       — Rate Limiting de Workers (60 req / 60 s)
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
  async fetch(request, env, ctx) {
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

    /* ── LÍMITE: 60 peticiones/minuto por IP (binding LIMITADOR) ── */
    if (env.LIMITADOR) {
      const ip = request.headers.get('CF-Connecting-IP') || 'sin-ip';
      const { success } = await env.LIMITADOR.limit({ key: ip });      if (!success) {
        const r = corsResponse(
          JSON.stringify({ error: 'Demasiadas peticiones, inténtalo en un minuto' }),
          429, 'application/json', origin
        );
        r.headers.set('Retry-After', '60');
        return r;
      }
    }

    if (!env.AIRTABLE_TOKEN) {
      return corsResponse(
        JSON.stringify({ error: 'Worker no configurado: falta AIRTABLE_TOKEN' }),
        500, 'application/json', origin
      );
    }

    /* ── 1.er nivel, caché en memoria: si el catálogo tiene menos de CACHE_TTL_MS, no se
          vuelve a pedir a Airtable. Las peticiones simultáneas comparten la
          misma consulta en curso. Los errores no se guardan. ── */
    const ahora = Date.now();
    if (CACHE.body && ahora - CACHE.ts < CACHE_TTL_MS) {
      return conCache(corsResponse(CACHE.body, 200, 'application/json', origin), 'HIT');
    }

    /* 2.º nivel: caché compartida del centro de datos (Cache API) */
    const claveCache = new Request(new URL('/__catalogo_cache', request.url).toString());
    let cacheCompartida = null;
    try { cacheCompartida = caches.default; } catch (_) {}
    if (cacheCompartida) {
      try {
        const guardada = await cacheCompartida.match(claveCache);
        if (guardada) {
          const body = await guardada.text();
          /* Conservar la hora real de la consulta a Airtable: así el dato
             nunca tiene más de CACHE_TTL_MS en total, sume los niveles que sume */
          const ts = Number(guardada.headers.get('X-Guardado')) || ahora;
          CACHE = { body, ts };
          return conCache(corsResponse(body, 200, 'application/json', origin), 'HIT-COLO');
        }
      } catch (_) {}
    }

    try {
      if (!EN_CURSO) {
        EN_CURSO = cargarCatalogo(env).finally(() => { EN_CURSO = null; });
      }
      const body = await EN_CURSO;
      const ts = Date.now();
      CACHE = { body, ts };
      if (cacheCompartida) {
        const paraGuardar = new Response(body, {
          headers: {
            'Content-Type':  'application/json',
            'Cache-Control': `public, max-age=${CACHE_TTL_MS / 1000}`,
            'X-Guardado':    String(ts)
          }
        });
        ctx.waitUntil(cacheCompartida.put(claveCache, paraGuardar).catch(() => {}));
      }
      return conCache(corsResponse(body, 200, 'application/json', origin), 'MISS');

    } catch (e) {
      if (e && e.airtableStatus) {
        return corsResponse(
          JSON.stringify({ error: `Airtable ${e.airtableStatus}`, detail: e.detail }),
          502, 'application/json', origin
        );
      }
      return corsResponse(
        JSON.stringify({ error: 'Error interno', detail: String(e && e.message).slice(0, 200) }),
        500, 'application/json', origin
      );
    }
  }
};

/* Caché del catálogo (por instancia del Worker) */
const CACHE_TTL_MS = 30 * 1000;
let CACHE    = { body: null, ts: 0 };
let EN_CURSO = null;

function conCache(res, estado) {
  res.headers.set('X-Cache', estado);
  return res;
}

/* Lee TODOS los registros de Airtable (con paginación) y devuelve el JSON
   en el formato que espera la landing. Lanza un error si Airtable falla. */
async function cargarCatalogo(env) {
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
      const err = new Error('Airtable');
      err.airtableStatus = res.status;
      err.detail = errText.slice(0, 200);
      throw err;
    }

    const data = await res.json();
    allRecords = allRecords.concat(data.records || []);
    offset     = data.offset || null;

  } while (offset);

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

  return JSON.stringify(productos);
}

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
