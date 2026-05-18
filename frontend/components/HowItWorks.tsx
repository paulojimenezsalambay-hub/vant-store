'use client';

import { motion } from 'framer-motion';

const pasos = [
  {
    n: '01',
    titulo: 'Responde el quiz',
    desc: 'Ocho preguntas sobre tu estilo, tus momentos y tu carácter. 45 segundos.'
  },
  {
    n: '02',
    titulo: 'La IA construye tu perfil',
    desc: 'Cruzamos tus respuestas con miles de combinaciones olfativas y arquetipos.'
  },
  {
    n: '03',
    titulo: 'Recibes tu recomendación',
    desc: 'Tu fragancia ideal, con justificación editorial, llega por WhatsApp.'
  }
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-32 bg-ink text-bone">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-20">
          <p className="text-xs uppercase tracking-widest text-gold mb-4">El método</p>
          <h2 className="display text-5xl md:text-6xl">Tres pasos. Una identidad.</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {pasos.map((p, i) => (
            <motion.div
              key={p.n}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, delay: i * 0.15 }}
              className="relative"
            >
              <span className="display text-7xl text-gold/40">{p.n}</span>
              <h3 className="display text-3xl mt-4 mb-4">{p.titulo}</h3>
              <p className="text-bone/70 leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
