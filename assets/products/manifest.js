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
  'sauvage':              ['Gemini_Generated_Image_5yenrd5yenrd5yen.png'],
  'acqua-di-gio':         ['Gemini_Generated_Image_gggcf6gggcf6gggc.png'],
  'good-girl-blush':      ['Gemini_Generated_Image_uzy84huzy84huzy8.png'],
  'club-de-nuit-intense': ['Gemini_Generated_Image_b1ufbhb1ufbhb1uf.png'],
  'ciel':                 [],
  'black-opium':          ['Gemini_Generated_Image_vep23ivep23ivep2.png'],
  'la-vie-est-belle':     ['Gemini_Generated_Image_ybzna3ybzna3ybzn.png'],
  'jadore':               ['Gemini_Generated_Image_udy5kqudy5kqudy5.png'],
  'coco-mademoiselle':    ['Gemini_Generated_Image_ks4i6mks4i6mks4i.png'],
  'lady-million':         ['Gemini_Generated_Image_6o3ib26o3ib26o3i.png'],
  'olympea':              ['Gemini_Generated_Image_vq1dbxvq1dbxvq1d.png'],
  'libre':                [],
  'si':                   ['Gemini_Generated_Image_602s4w602s4w602s.png'],
  'idole':                [],
  '1-million':            [],
  'phantom':              [],
  'invictus':             [],
  'y-edp':                ['Gemini_Generated_Image_9eol4d9eol4d9eol.png'],
  '212-vip-men':          [],
  'eros':                 [],
  'bottled':              [],
  'sauvage-edt':          []
};
