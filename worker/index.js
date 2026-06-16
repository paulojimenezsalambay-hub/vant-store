/**
 * Vant Store · Cloudflare Worker
 * Reemplaza el webhook de n8n — llama a Airtable directamente
 * y devuelve los productos al browser con manejo de paginación.
 *
 * Variables de entorno (Secrets):
 *   AIRTABLE_TOKEN  — Personal Access Token de Airtable
 */

const AIRTABLE_BASE  = 'appkHx2y58OuG1UuF';
const AIRTABLE_TABLE = 'Productos_Ofertas';
const ALLOWED_ORIGIN = 'https://vant-store.com';

export default {
  async fetch(request, env) {

    /* ── CORS preflight ── */
    if (request.method === 'OPTIONS') {
      return corsResponse(null, 204);
    }

    /* ── Solo GET ── */
    if (request.method !== 'GET') {
      return corsResponse('Method not allowed', 405);
    }

    /* ── Verificar origen (solo vant-store.com o localhost para pruebas) ── */
    const origin = request.headers.get('Origin') || '';
    if (origin && origin !== ALLOWED_ORIGIN && !origin.includes('localhost') && !origin.includes('vant-store.pages.dev')) {
      return corsResponse('Forbidden', 403);
    }

    if (!env.AIRTABLE_TOKEN) {
      return corsResponse('Worker no configurado: falta AIRTABLE_TOKEN', 500);
    }

    try {
      /* ── Obtener TODOS los registros de Airtable (con paginación) ── */
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
          return corsResponse(`Error Airtable ${res.status}: ${errText}`, 502);
        }

        const data = await res.json();
        allRecords  = allRecords.concat(data.records || []);
        offset      = data.offset || null;

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
          Precio_Original:  f.Precio_Original  || 0,
          Precio_Oferta:    f.Precio_Oferta    || 0,
          En_Oferta:        Boolean(f.En_Oferta),
          Etiqueta_Oferta:  f.Etiqueta_Oferta  || '',
          Foto:             Array.isArray(f.Foto) ? f.Foto : [],
          Stock_Disponible: Number(f.Stock_Disponible) || 0,
        };
      }

      return corsResponse(JSON.stringify(productos), 200, 'application/json');

    } catch (e) {
      return corsResponse(`Error interno: ${e.message}`, 500);
    }
  }
};

function corsResponse(body, status = 200, contentType = 'text/plain') {
  return new Response(body, {
    status,
    headers: {
      'Content-Type':                contentType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods':'GET, OPTIONS',
      'Cache-Control':               'no-cache, no-store',
    }
  });
}
