/**
 * Cliente delgado para invocar webhooks de n8n desde el servidor.
 * No lo importes en componentes cliente: la URL y el secreto viven en server-only env vars.
 */

type N8nWebhookPath = 'quiz-lead' | 'cart-abandoned' | 'order-paid';

interface N8nResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

export async function callN8nWebhook<T = unknown>(
  path: N8nWebhookPath,
  payload: Record<string, unknown>
): Promise<N8nResponse<T>> {
  const baseUrl = process.env.N8N_WEBHOOK_URL?.replace(/\/[^/]+\/?$/, '');
  if (!baseUrl) return { ok: false, error: 'N8N_WEBHOOK_URL no configurado' };

  const url = `${baseUrl}/${path}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Olfativa-Secret': process.env.N8N_SHARED_SECRET ?? ''
      },
      body: JSON.stringify(payload),
      cache: 'no-store'
    });

    if (!res.ok) return { ok: false, error: `n8n ${res.status}` };
    const data = (await res.json()) as T;
    return { ok: true, data };
  } catch (err: any) {
    return { ok: false, error: err?.message ?? 'network error' };
  }
}
