export default function SocialProof() {
  const medios = ['VOGUE', 'GQ', 'HARPER\'S BAZAAR', 'TELVA', 'ELLE', 'WALLPAPER'];

  return (
    <section className="py-16 border-y border-ink/10 bg-bone">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-center text-xs uppercase tracking-widest text-ink/60 mb-8">
          Como se ha visto en
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
          {medios.map((m) => (
            <span key={m} className="display text-xl text-ink/70">
              {m}
            </span>
          ))}
        </div>
        <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <span className="display text-3xl">4,9</span>
            <span className="text-gold">★★★★★</span>
            <span className="text-ink/60">/ 2.847 valoraciones</span>
          </div>
          <div className="hairline h-6 hidden sm:block" />
          <div className="text-ink/70">Envío en 24 h · Devolución gratuita</div>
        </div>
      </div>
    </section>
  );
}
