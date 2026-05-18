export default function Footer() {
  return (
    <footer className="bg-ink text-bone py-16">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-12">
        <div>
          <p className="display text-2xl mb-2">Olfativa AI</p>
          <p className="text-bone/60 text-sm">Perfumería de autor potenciada por IA.</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-gold mb-4">Tienda</p>
          <ul className="space-y-2 text-sm text-bone/80">
            <li>Colección</li>
            <li>Quiz olfativo</li>
            <li>Tarjetas regalo</li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-gold mb-4">Ayuda</p>
          <ul className="space-y-2 text-sm text-bone/80">
            <li>Envíos y devoluciones</li>
            <li>Preguntas frecuentes</li>
            <li>Contacto WhatsApp</li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-gold mb-4">Legal</p>
          <ul className="space-y-2 text-sm text-bone/80">
            <li>Política de privacidad</li>
            <li>Términos y condiciones</li>
            <li>Cookies</li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 mt-12 pt-8 border-t border-bone/10 text-xs text-bone/50">
        © 2026 Olfativa AI · Made with intention
      </div>
    </footer>
  );
}
