/**
 * VANT STORE · Build script para Cloudflare Pages
 *
 * Uso:   npm run build
 * Salida: ./dist/  (sube esta carpeta a Cloudflare Pages)
 *
 * Qué hace:
 *  1. Minifica index.html (CSS inline + JS inline + HTML)
 *  2. Copia assets/ → dist/assets/
 *  3. Copia _headers → dist/_headers  (seguridad Cloudflare)
 */

const { minify } = require('html-minifier-terser');
const fs   = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');

/* Copia recursiva de directorio */
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    entry.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

function kb(bytes) { return (bytes / 1024).toFixed(1) + ' KB'; }

(async () => {
  console.log('\n🏗  VANT STORE — Build de producción\n');

  /* 1 — Limpiar dist/ */
  if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST);

  /* 2 — Minificar index.html */
  console.log('📦 Minificando index.html…');
  const html     = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const minified = await minify(html, {
    collapseWhitespace:       true,
    removeComments:           true,
    removeRedundantAttributes:true,
    useShortDoctype:          true,
    collapseBooleanAttributes:true,
    minifyCSS:                true,
    minifyJS: {
      compress: { passes: 2 },
      mangle:   true,
    },
  });

  fs.writeFileSync(path.join(DIST, 'index.html'), minified, 'utf8');
  const pct = ((1 - minified.length / html.length) * 100).toFixed(0);
  console.log(`   ✅ ${kb(html.length)} → ${kb(minified.length)}  (−${pct}% tamaño)`);

  /* 3 — Copiar assets/ */
  const assetsSrc  = path.join(ROOT, 'assets');
  const assetsDest = path.join(DIST, 'assets');
  if (fs.existsSync(assetsSrc)) {
    console.log('📁 Copiando assets/…');
    copyDir(assetsSrc, assetsDest);
    console.log('   ✅ assets/ copiados.');
  }

  /* 4 — Copiar _headers (Cloudflare Pages security headers) */
  const headersFile = path.join(ROOT, '_headers');
  if (fs.existsSync(headersFile)) {
    fs.copyFileSync(headersFile, path.join(DIST, '_headers'));
    console.log('   ✅ _headers copiado.');
  }

  /* 5 — Copiar _redirects si existe */
  const redirectsFile = path.join(ROOT, '_redirects');
  if (fs.existsSync(redirectsFile)) {
    fs.copyFileSync(redirectsFile, path.join(DIST, '_redirects'));
    console.log('   ✅ _redirects copiado.');
  }

  console.log('\n🚀 Build listo en /dist');
  console.log('   → Cloudflare Pages: publish directory = dist\n');
})();
