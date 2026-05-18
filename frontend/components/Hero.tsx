'use client';

import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-ink text-bone">
      {/* VSL — Video Sales Letter en autoplay muted */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/hero-poster.webp"
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-ink/40 to-ink/70" />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-w-4xl mx-auto px-6 text-center"
      >
        <p className="text-xs uppercase tracking-widest text-gold mb-6">
          Perfumería de autor · Inteligencia artificial
        </p>
        <h1 className="display text-5xl md:text-7xl lg:text-8xl leading-[0.95] mb-8">
          Descubre tu<br />
          <span className="italic">identidad olfativa</span>
        </h1>
        <p className="max-w-xl mx-auto text-lg text-bone/80 mb-12 leading-relaxed">
          Un perfumista experto y un motor de inteligencia artificial te recomiendan la fragancia
          que encarna quién eres. En 45 segundos.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#quiz" className="btn-primary bg-bone text-ink hover:bg-gold">
            Iniciar el quiz
          </a>
          <a href="#como-funciona" className="btn-outline border-bone text-bone hover:bg-bone hover:text-ink">
            Cómo funciona
          </a>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs uppercase tracking-widest text-bone/60"
      >
        Desliza
      </motion.div>
    </section>
  );
}
