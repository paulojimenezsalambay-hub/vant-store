'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Respuesta = string;

const preguntas = [
  { id: 'momento', label: '¿Cuándo te imaginas usándolo?', opciones: ['Laboral', 'Cita íntima', 'Social', 'Ritual personal'] },
  { id: 'estacion', label: '¿En qué estación te define más?', opciones: ['Primavera', 'Verano', 'Otoño', 'Invierno'] },
  { id: 'intensidad', label: '¿Cómo prefieres tu estela?', opciones: ['Discreta', 'Equilibrada', 'Envolvente'] },
  { id: 'familia', label: '¿Qué olor te detiene en la calle?', opciones: ['Pan recién hecho', 'Bosque tras la lluvia', 'Cuero gastado', 'Cítricos frescos', 'Flores blancas'] },
  { id: 'arquetipo', label: 'Si fueras un libro, serías…', opciones: ['Un ensayo filosófico', 'Una novela romántica', 'Un manifiesto creativo', 'Una épica de aventuras'] },
  { id: 'reaccion', label: '¿Qué quieres provocar?', opciones: ['Curiosidad', 'Deseo', 'Confianza', 'Memoria'] }
];

export default function Quiz() {
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, Respuesta>>({});
  const [datos, setDatos] = useState({ nombre: '', email: '', phone: '' });
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<any>(null);

  const totalPasos = preguntas.length + 1;
  const progreso = ((paso + 1) / totalPasos) * 100;

  const handleOpcion = (id: string, valor: string) => {
    setRespuestas({ ...respuestas, [id]: valor });
    setTimeout(() => setPaso(paso + 1), 250);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...datos, respuestas })
      });
      const data = await res.json();
      setResultado(data.perfil);
      setEnviado(true);
    } catch (err) {
      console.error(err);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section id="quiz" className="py-32 bg-bone">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-ink/60 mb-4">El quiz</p>
          <h2 className="display text-5xl md:text-6xl">Tu identidad olfativa</h2>
        </div>

        <div className="border border-ink/10 bg-white/60 p-8 md:p-12">
          <div className="h-px bg-ink/10 mb-8 relative">
            <motion.div
              className="absolute top-0 left-0 h-px bg-ink"
              animate={{ width: `${progreso}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>

          <AnimatePresence mode="wait">
            {!enviado && paso < preguntas.length && (
              <motion.div
                key={paso}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-xs uppercase tracking-widest text-ink/50 mb-4">
                  Pregunta {paso + 1} / {preguntas.length}
                </p>
                <h3 className="display text-3xl md:text-4xl mb-8">{preguntas[paso].label}</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {preguntas[paso].opciones.map((o) => (
                    <button
                      key={o}
                      onClick={() => handleOpcion(preguntas[paso].id, o)}
                      className="text-left p-5 border border-ink/20 hover:border-ink hover:bg-ink hover:text-bone transition-all"
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {!enviado && paso === preguntas.length && (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <h3 className="display text-3xl md:text-4xl mb-8">Recibe tu recomendación por WhatsApp</h3>
                <input
                  required
                  placeholder="Tu nombre"
                  value={datos.nombre}
                  onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
                  className="w-full p-4 border border-ink/20 bg-transparent focus:outline-none focus:border-ink"
                />
                <input
                  required
                  type="email"
                  placeholder="Email"
                  value={datos.email}
                  onChange={(e) => setDatos({ ...datos, email: e.target.value })}
                  className="w-full p-4 border border-ink/20 bg-transparent focus:outline-none focus:border-ink"
                />
                <input
                  required
                  type="tel"
                  placeholder="WhatsApp (+34 …)"
                  value={datos.phone}
                  onChange={(e) => setDatos({ ...datos, phone: e.target.value })}
                  className="w-full p-4 border border-ink/20 bg-transparent focus:outline-none focus:border-ink"
                />
                <label className="flex items-start gap-3 text-xs text-ink/70">
                  <input type="checkbox" required className="mt-1" />
                  <span>Acepto la política de privacidad y recibir comunicaciones de Olfativa AI.</span>
                </label>
                <button type="submit" disabled={enviando} className="btn-primary w-full disabled:opacity-50">
                  {enviando ? 'Procesando…' : 'Ver mi fragancia'}
                </button>
              </motion.form>
            )}

            {enviado && resultado && (
              <motion.div
                key="resultado"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <p className="text-xs uppercase tracking-widest text-gold mb-4">Tu identidad olfativa</p>
                <h3 className="display text-4xl md:text-5xl mb-4">Arquetipo {resultado.arquetipo}</h3>
                <p className="text-lg text-ink/80 mb-2">Familia: <span className="italic">{resultado.familia_recomendada}</span></p>
                <p className="text-ink/70 max-w-xl mx-auto mt-6 italic">"{resultado.justificacion}"</p>
                <p className="text-sm text-ink/60 mt-8">
                  Hemos enviado los detalles a tu WhatsApp. Revisa tu teléfono en los próximos segundos.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
