/* =====================================================================
   VANT STORE · MANIFIESTO DE IMÁGENES
   =====================================================================
   Mapea cada slug de producto al/los nombre(s) de archivo que tiene
   dentro de assets/products/<slug>/.

   Si añades nuevas fotos con nombres "raros" (ej: descargadas con nombre
   automático), añádelas aquí y la web las cargará. La web también prueba
   nombres estándar automáticamente:
     <slug>.jpg / .png / .webp / .jpeg / .avif
     main.<ext>, 1.<ext>, foto.<ext>, producto.<ext>

   Para añadir más fotos, simplemente añade el nombre del archivo al
   array correspondiente:
     'sauvage': ['mi-foto.png', 'otra.jpg'],

   Estos archivos se cargan en el orden listado; el primero que funcione
   se queda. Si nada carga, se ve el SVG vectorial de fallback.
   ===================================================================== */

window.PRODUCT_IMAGES = {
  /* ── Originales con imágenes Gemini ─────────────────────────────── */
  'sauvage':              ['Gemini_Generated_Image_5yenrd5yenrd5yen.png'],
  'acqua-di-gio':         ['Gemini_Generated_Image_gggcf6gggcf6gggc.png'],
  'good-girl-blush':      ['Gemini_Generated_Image_uzy84huzy84huzy8.png'],
  'club-de-nuit-intense': ['Gemini_Generated_Image_b1ufbhb1ufbhb1uf.png'],
  'black-opium':          ['Gemini_Generated_Image_vep23ivep23ivep2.png'],
  'la-vie-est-belle':     ['Gemini_Generated_Image_ybzna3ybzna3ybzn.png'],
  'jadore':               ['Gemini_Generated_Image_udy5kqudy5kqudy5.png'],
  'coco-mademoiselle':    ['Gemini_Generated_Image_ks4i6mks4i6mks4i.png'],
  'lady-million':         ['Gemini_Generated_Image_6o3ib26o3ib26o3i.png'],
  'olympea':              ['Gemini_Generated_Image_vq1dbxvq1dbxvq1d.png'],
  'si':                   ['Gemini_Generated_Image_602s4w602s4w602s.png'],
  'y-edp':                ['Gemini_Generated_Image_9eol4d9eol4d9eol.png'],

  /* ── Fotos reales (nombres estándar — auto-detectables) ──────────── */
  'sauvage-edt':          ['sauvage-edt.png'],
  'bottled':              ['bottled.png'],
  'eros':                 ['eros.png'],
  'invictus':             ['invictus.png'],
  'phantom':              ['phantom.png'],
  'libre':                ['libre.png'],
  'idole':                ['Idole.png'],
  '212-vip-men':          ['212-vip-men.png'],
  '1-million':            ['product.png'],

  /* ── Adidas (nombres con espacios — requieren declaración explícita) */
  'adidas-ice-dive':      ['adidas ice dive.png'],
  'adidas-pure-game':     ['adidas pure game.png'],
  'adidas-victory-league':['adidas victory league.png'],

  /* ── Antonio Banderas (nombres con espacios) ─────────────────────── */
  'ab-power-seduction':   ['ab power seduction.png'],
  'ab-golden-secret':     ['ab golden secret.png'],
  'ab-secret-absolu':     ['ab secret absolute.png'],
  'ab-icon-supreme-h':    ['ab icon supreme h.png'],
  'ab-icon-supreme-m':    ['ab icon supreme m.png'],

  /* ── Sin foto todavía (auto-detector intentará nombres estándar) ─── */
  'ciel':                 []
};
