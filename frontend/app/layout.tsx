import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Olfativa AI — Descubre tu identidad olfativa',
  description: 'Perfumería de lujo con recomendación por inteligencia artificial. Tu fragancia, validada por tu perfil.',
  openGraph: {
    title: 'Olfativa AI',
    description: 'Descubre la fragancia que encarna quién eres.',
    type: 'website',
    locale: 'es_ES'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bone text-ink antialiased font-sans">{children}</body>
    </html>
  );
}
