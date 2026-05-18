const testimonios = [
  {
    nombre: 'Lucía M.',
    ciudad: 'Madrid',
    texto: 'Llevaba años buscando "mi" perfume. El quiz acertó a la primera. Es como si me leyeran.',
    arquetipo: 'Amante'
  },
  {
    nombre: 'Javier R.',
    ciudad: 'Barcelona',
    texto: 'No esperaba nada de un test de IA. Salió un amaderado discreto que ahora me regalan los demás.',
    arquetipo: 'Sabio'
  },
  {
    nombre: 'Pau D.',
    ciudad: 'Valencia',
    texto: 'El recordatorio por WhatsApp para reponer fue una sorpresa. Me ahorraron tener que volver a elegir.',
    arquetipo: 'Creador'
  }
];

export default function Testimonials() {
  return (
    <section className="py-32 bg-bone">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-widest text-ink/60 mb-4">Quien ya lo vive</p>
          <h2 className="display text-5xl md:text-6xl">Testimonios verificados</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonios.map((t) => (
            <blockquote key={t.nombre} className="border border-ink/10 p-8 bg-white/40">
              <p className="display text-xl leading-snug mb-6">"{t.texto}"</p>
              <footer className="text-sm">
                <p className="font-medium">{t.nombre}</p>
                <p className="text-ink/60">{t.ciudad} · Arquetipo {t.arquetipo}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
