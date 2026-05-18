'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Familia = 'oriental' | 'chipre' | 'amaderada' | 'cítrica' | 'floral';

const fragancias: { sku: string; nombre: string; familia: Familia; notas: string[]; precio: number }[] = [
  { sku: 'OLF-001-EDP-100', nombre: 'Ámbar Nocturno', familia: 'oriental', notas: ['Vainilla', 'Ámbar', 'Oud'], precio: 145 },
  { sku: 'OLF-002-EDP-100', nombre: 'Iris Bohemio', familia: 'chipre', notas: ['Bergamota', 'Jazmín', 'Musgo'], precio: 135 },
  { sku: 'OLF-003-EDP-100', nombre: 'Cedro Brutal', familia: 'amaderada', notas: ['Cedro', 'Iris', 'Papiro'], precio: 125 },
  { sku: 'OLF-004-EDP-100', nombre: 'Neroli Solaris', familia: 'cítrica', notas: ['Neroli', 'Petitgrain', 'Almizcle'], precio: 115 },
  { sku: 'OLF-005-EDP-100', nombre: 'Tuberosa Salvaje', familia: 'floral', notas: ['Tuberosa', 'Rosa', 'Sándalo'], precio: 140 }
];

const familias: Familia[] = ['oriental', 'chipre', 'amaderada', 'cítrica', 'floral'];

export default function FragranceSelector() {
  const [filtro, setFiltro] = useState<Familia | 'todas'>('todas');
  const visibles = filtro === 'todas' ? fragancias : fragancias.filter((f) => f.familia === filtro);

  return (
    <section className="py-32 bg-bone">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-widest text-ink/60 mb-4">La colección</p>
          <h2 className="display text-5xl md:text-6xl mb-6">Cinco maneras de ser inolvidable</h2>
          <p className="max-w-2xl mx-auto text-ink/70">
            Cada fragancia es una declaración. Selecciona una familia o deja que el quiz lo haga por ti.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <button
            onClick={() => setFiltro('todas')}
            className={`px-5 py-2 text-xs uppercase tracking-widest border transition-all ${
              filtro === 'todas' ? 'bg-ink text-bone border-ink' : 'border-ink/30 text-ink/70 hover:border-ink'
            }`}
          >
            Todas
          </button>
          {familias.map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-5 py-2 text-xs uppercase tracking-widest border transition-all ${
                filtro === f ? 'bg-ink text-bone border-ink' : 'border-ink/30 text-ink/70 hover:border-ink'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {visibles.map((f) => (
              <motion.article
                key={f.sku}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.4 }}
                className="group border border-ink/10 bg-bone p-8 hover:border-ink transition-colors"
              >
                <div className="aspect-[3/4] bg-ink/5 mb-6 flex items-center justify-center">
                  <span className="text-xs uppercase tracking-widest text-ink/40">[ imagen producto ]</span>
                </div>
                <p className="text-xs uppercase tracking-widest text-gold mb-2">{f.familia}</p>
                <h3 className="display text-2xl mb-3">{f.nombre}</h3>
                <p className="text-sm text-ink/70 mb-6">{f.notas.join(' · ')}</p>
                <div className="flex justify-between items-center pt-6 border-t border-ink/10">
                  <span className="display text-xl">{f.precio} €</span>
                  <button className="text-xs uppercase tracking-widest hover:text-gold">
                    Descubrir →
                  </button>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
