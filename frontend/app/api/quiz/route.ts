import { NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Server route que reenvía el payload del quiz al webhook de n8n.
 * Mantenemos la URL del webhook en el servidor para evitar exponerla en el cliente.
 */

const QuizSchema = z.object({
  nombre: z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().min(6).max(20),
  respuestas: z.record(z.string(), z.string())
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = QuizSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.format() }, { status: 400 });
    }

    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    const secret = process.env.N8N_SHARED_SECRET;

    if (!webhookUrl) {
      return NextResponse.json({ ok: false, error: 'N8N_WEBHOOK_URL no configurado' }, { status: 500 });
    }

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(secret ? { 'X-Olfativa-Secret': secret } : {})
      },
      body: JSON.stringify(parsed.data),
      cache: 'no-store'
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ ok: false, error: 'Error n8n', detail: text }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'unknown' }, { status: 500 });
  }
}
