/**
 * VANT STORE · Servidor de pruebas local
 * =========================================================
 * Simula los 3 endpoints de n8n SIN necesitar configurar n8n.
 * Usa Airtable REAL. Email y WhatsApp son PROVISIONALES
 * (se loguean en consola y se guardan en test-emails.json
 * y test-whatsapps.json para poder revisarlos).
 *
 * Uso:  npm run test-server
 * Puerto: 5680 (no interfiere con n8n en 5678)
 *
 * Endpoints:
 *   POST /webhook-test/suscribir-vant
 *   GET  /webhook-test/obtener-ofertas
 *   POST /webhook-test/actualizar-stock
 */

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const PORT         = 5680;
const AIRTABLE_BASE = 'appkHx2y58OuG1UuF';
const EMAIL_LOG    = path.join(__dirname, 'test-emails.json');
const WA_LOG       = path.join(__dirname, 'test-whatsapps.json');

/* ── Leer token de Airtable desde CREDENCIALES.txt ─────────────────────── */
let AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN || '';
if (!AIRTABLE_TOKEN) {
  try {
    const creds = fs.readFileSync(path.join(__dirname, 'CREDENCIALES.txt'), 'utf8');
    const m = creds.match(/pat[A-Za-z0-9]{14,}\.[a-f0-9]{64}/);
    if (m) AIRTABLE_TOKEN = m[0];
  } catch { /* archivo no existe */ }
}
if (!AIRTABLE_TOKEN) {
  console.error('\x1b[31m❌ Token de Airtable no encontrado.\x1b[0m');
  console.error('   Crea CREDENCIALES.txt con el token o define env AIRTABLE_TOKEN.');
  process.exit(1);
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function appendLog(file, entry) {
  let list = [];
  try { list = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { /* vacío */ }
  list.push({ ...entry, ts: new Date().toISOString() });
  fs.writeFileSync(file, JSON.stringify(list, null, 2), 'utf8');
}

function mockEmail(to, subject, origen) {
  console.log('\n  \x1b[36m📧 EMAIL PROVISIONAL\x1b[0m');
  console.log(`     Para:   ${to}`);
  console.log(`     Asunto: ${subject}`);
  appendLog(EMAIL_LOG, { to, subject, origen });
  console.log('     → guardado en test-emails.json');
}

function mockWhatsApp(text) {
  console.log('  \x1b[33m📱 WHATSAPP PROVISIONAL (593999999999)\x1b[0m');
  console.log(`     ${text}`);
  appendLog(WA_LOG, { phone: '593999999999', text });
  console.log('     → guardado en test-whatsapps.json');
}

function airtableRequest(method, resource, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'api.airtable.com',
      path: `/v0/${AIRTABLE_BASE}/${resource}`,
      method,
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    };
    const req = https.request(opts, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function readBody(req) {
  return new Promise(resolve => {
    let raw = '';
    req.on('data', c => raw += c);
    req.on('end', () => {
      try { resolve(JSON.parse(raw)); } catch { resolve({}); }
    });
  });
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function respond(res, code, data) {
  cors(res);
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

/* ── Handlers ────────────────────────────────────────────────────────────── */

async function handleSuscribir(req, res) {
  const body   = await readBody(req);
  const email  = String(body.email  || '').toLowerCase().trim();
  const origen = String(body.origen || 'newsletter');

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return respond(res, 400, { ok: false, error: 'Email inválido' });
  }

  /* Buscar duplicado */
  const formula = encodeURIComponent(`LOWER({Email})='${email}'`);
  const search  = await airtableRequest('GET', `Suscriptores?filterByFormula=${formula}&maxRecords=1`);

  if ((search.body.records || []).length > 0) {
    return respond(res, 200, { ok: false, msg: 'Ya eres parte del Club VANT' });
  }

  /* Crear suscriptor */
  const today = new Date().toISOString().split('T')[0];
  const create = await airtableRequest('POST', 'Suscriptores', {
    fields: { Email: email, Fecha_Suscripcion: today, Estado: 'Activo' }
  });

  if (create.status !== 200) {
    return respond(res, 500, { ok: false, error: 'Error creando suscriptor en Airtable', detail: create.body });
  }

  const subject = origen === 'ofertas'
    ? 'VANT Store — Tus ofertas exclusivas te esperan'
    : 'Bienvenido al Club VANT — Tu acceso exclusivo está activo';

  mockEmail(email, subject, origen);
  respond(res, 200, { ok: true, msg: '¡Bienvenido al Club VANT!' });
}

async function handleObtenerOfertas(req, res) {
  const r = await airtableRequest('GET', 'Productos_Ofertas?pageSize=100');

  if (r.status !== 200) {
    return respond(res, 500, { ok: false, error: 'Error leyendo Airtable', detail: r.body });
  }

  const records   = r.body.records || [];
  const productos = {};
  const stockBajo = [];

  for (const record of records) {
    const f   = record.fields || {};
    const id  = String(f.ID_Producto || '').trim();
    if (!id) continue;
    const stock = Number(f.Stock_Disponible) || 0;

    productos[id] = {
      ID_Producto:      id,
      Nombre:           f.Nombre            || '',
      Precio_Original:  f.Precio_Original   || 0,
      Precio_Oferta:    f.Precio_Oferta     || 0,
      En_Oferta:        Boolean(f.En_Oferta),
      Etiqueta_Oferta:  f.Etiqueta_Oferta   || '',
      Foto:             Array.isArray(f.Foto) ? f.Foto : [],
      Stock_Disponible: stock,
      Ventas_Totales:   Number(f.Ventas_Totales) || 0,
      Es_Top:           Boolean(f.Es_Top)
    };

    if (stock > 0 && stock < 5) stockBajo.push({ id, nombre: f.Nombre || id, stock });
  }

  /* Responder al browser primero */
  cors(res);
  res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
  res.end(JSON.stringify(productos));

  const n = Object.keys(productos).length;
  console.log(`     → ${n} productos devueltos`);

  /* Alertas de stock bajo (provisional) */
  for (const p of stockBajo) {
    mockWhatsApp(`⚠️ VANT Store · Stock bajo: ${p.nombre} (${p.id}) — solo ${p.stock} uds.`);
  }
}

async function handleActualizarStock(req, res) {
  const body  = await readBody(req);
  const id    = String(body.id_producto    || '').trim();
  const stock = Number(body.stock_disponible);

  if (!id)                    return respond(res, 400, { ok: false, error: 'id_producto es requerido' });
  if (isNaN(stock) || stock < 0) return respond(res, 400, { ok: false, error: 'stock_disponible debe ser >= 0' });

  /* Buscar el registro */
  const formula = encodeURIComponent(`{ID_Producto}='${id}'`);
  const search  = await airtableRequest('GET', `Productos_Ofertas?filterByFormula=${formula}&maxRecords=1`);

  if (!(search.body.records || []).length) {
    return respond(res, 404, { ok: false, error: 'Producto no encontrado' });
  }

  const record         = search.body.records[0];
  const recordId       = record.id;
  const stockAnterior  = Number(record.fields.Stock_Disponible) || 0;
  const nombre         = record.fields.Nombre || id;

  /* Actualizar stock */
  const update = await airtableRequest('PATCH', `Productos_Ofertas/${recordId}`, {
    fields: { Stock_Disponible: stock }
  });

  if (update.status !== 200) {
    return respond(res, 500, { ok: false, error: 'Error actualizando Airtable', detail: update.body });
  }

  /* Alerta provisional si stock crítico */
  if (stock < 5) {
    const msg = stock === 0
      ? `🚨 AGOTADO · VANT Store: ${nombre} — SIN STOCK, considera ocultarlo`
      : `⚠️ Stock bajo · VANT Store: ${nombre} — ${stock} uds. restantes`;
    mockWhatsApp(msg);
  }

  respond(res, 200, { ok: true, id_producto: id, nombre, stock_anterior: stockAnterior, stock_nuevo: stock });
}

/* ── Servidor HTTP ───────────────────────────────────────────────────────── */

const server = http.createServer(async (req, res) => {
  const url = req.url.split('?')[0];

  if (req.method === 'OPTIONS') {
    cors(res); res.writeHead(204); return res.end();
  }

  const t = new Date().toLocaleTimeString('es-EC');
  console.log(`\n\x1b[90m${t}\x1b[0m \x1b[1m${req.method}\x1b[0m ${url}`);

  try {
    const isPost = req.method === 'POST';
    const isGet  = req.method === 'GET';

    if (isPost && url.endsWith('/suscribir-vant'))   return await handleSuscribir(req, res);
    if (isGet  && url.endsWith('/obtener-ofertas'))  return await handleObtenerOfertas(req, res);
    if (isPost && url.endsWith('/actualizar-stock')) return await handleActualizarStock(req, res);

    respond(res, 404, {
      error: 'Ruta no encontrada',
      endpoints: [
        'POST /webhook-test/suscribir-vant',
        'GET  /webhook-test/obtener-ofertas',
        'POST /webhook-test/actualizar-stock'
      ]
    });
  } catch (err) {
    console.error('\x1b[31m  ❌ Error interno:\x1b[0m', err.message);
    respond(res, 500, { ok: false, error: err.message });
  }
});

server.listen(PORT, () => {
  console.clear();
  console.log('\x1b[1m\x1b[33m');
  console.log('  ╔═══════════════════════════════════════════╗');
  console.log('  ║   VANT STORE · Servidor de Pruebas       ║');
  console.log('  ╠═══════════════════════════════════════════╣');
  console.log(`  ║   http://localhost:${PORT}                  ║`);
  console.log('  ╚═══════════════════════════════════════════╝');
  console.log('\x1b[0m');
  console.log('  Endpoints activos:');
  console.log('  \x1b[32m✓\x1b[0m POST /webhook-test/suscribir-vant');
  console.log('  \x1b[32m✓\x1b[0m GET  /webhook-test/obtener-ofertas');
  console.log('  \x1b[32m✓\x1b[0m POST /webhook-test/actualizar-stock');
  console.log('');
  console.log('  \x1b[36m📧 Emails provisionales   → test-emails.json\x1b[0m');
  console.log('  \x1b[33m📱 WhatsApps provisionales → test-whatsapps.json\x1b[0m');
  console.log('  \x1b[32m🗄  Airtable               → REAL (appkHx2y58OuG1UuF)\x1b[0m');
  console.log('\n  \x1b[90mEsperando peticiones...\x1b[0m');
});
