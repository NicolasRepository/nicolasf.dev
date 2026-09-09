import type { LeadInput } from "./validation";

/**
 * Dispara o payload do lead para o Make.com, que fica responsável
 * pela automação posterior (ex.: sincronizar com Google Sheets).
 * Também roda em "fire and forget" via Promise.allSettled.
 *
 * OPCIONAL: se MAKE_WEBHOOK_URL não estiver configurada, o disparo é
 * simplesmente pulado (modo opcional, útil em ambientes de teste).
 */
export async function sendMakeWebhook(lead: LeadInput, leadId: number): Promise<void> {
  const webhookUrl = process.env.MAKE_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("[webhook] MAKE_WEBHOOK_URL não configurada — disparo ao Make.com pulado (modo opcional).");
    return;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: leadId,
      nome: lead.nome,
      whatsapp: lead.whatsapp,
      email: lead.email,
      ramo: lead.ramo,
      tipo: lead.tipo,
      origem: "site-portfolio",
      capturado_em: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Make.com webhook retornou status ${response.status}`);
  }
}
