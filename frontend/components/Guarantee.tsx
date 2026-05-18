export default function Guarantee() {
  const items = [
    { titulo: 'Devolución 30 días', desc: 'Si tu fragancia no es la tuya, te enviamos otra. Sin coste.' },
    { titulo: 'Envío en 24 horas', desc: 'Pedido antes de las 14 h, en casa al día siguiente.' },
    { titulo: 'Hecho en Francia', desc: 'Maceración mínima de 6 semanas. Sin atajos.' }
  ];

  return (
    <section className="py-24 bg-bone border-t border-ink/10">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-12">
        {items.map((i) => (
          <div key={i.titulo} className="text-center">
            <h3 className="display text-2xl mb-3">{i.titulo}</h3>
            <p className="text-ink/70">{i.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
