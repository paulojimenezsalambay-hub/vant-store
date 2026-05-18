# Olfativa AI · Frontend (Next.js 14)

Landing de alta conversión con quiz olfativo integrado al ecosistema n8n.

## Quickstart

```bash
pnpm install   # o npm install
cp .env.example .env.local
# rellena N8N_WEBHOOK_URL y el resto de variables
pnpm dev
```

Abre http://localhost:3000

## Stack

- Next.js 14 (App Router)
- TypeScript estricto
- Tailwind CSS
- Framer Motion para microinteracciones
- GSAP (opcional, para scroll-linked animations avanzadas)
- Zod para validación de payloads

## Estructura

```
frontend/
├── app/
│   ├── layout.tsx       ← Tipografía global + metadata SEO
│   ├── page.tsx         ← Composición de secciones
│   ├── globals.css      ← Tokens de diseño + utilidades
│   └── api/quiz/route.ts ← Server route → webhook n8n
├── components/
│   ├── Hero.tsx
│   ├── SocialProof.tsx
│   ├── FragranceSelector.tsx
│   ├── HowItWorks.tsx
│   ├── Testimonials.tsx
│   ├── Quiz.tsx
│   ├── Guarantee.tsx
│   └── Footer.tsx
└── lib/
    └── n8n-client.ts    ← Helper para invocar webhooks server-side
```

## Tokens de diseño

- `ink` `#0b0b0b` — fondos oscuros y texto principal
- `bone` `#f4efe6` — fondo claro premium
- `gold` `#c9a96e` — acento editorial
- `wine` `#5a1a2b` — acento secundario

## Performance budget

- LCP < 1.8 s
- CLS < 0.05
- TBT < 200 ms

## Deploy

```bash
vercel --prod
```

Variables de entorno necesarias en Vercel: ver `.env.example`.
