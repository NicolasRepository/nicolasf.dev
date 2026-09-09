import { Resend } from "resend";
import type { LeadInput } from "./validation";

/**
 * Dispara um e-mail de notificação (via Resend) sempre que um novo
 * lead é capturado. Chamado em modo "fire and forget" dentro de um
 * Promise.allSettled — uma falha aqui NUNCA deve derrubar a resposta
 * de sucesso já garantida pela gravação no banco.
 *
 * OPCIONAL: se RESEND_API_KEY / NOTIFICATION_EMAIL_TO / _FROM não
 * estiverem configuradas, o envio é simplesmente pulado (modo opcional,
 * útil em ambientes de teste).
 */
export async function sendLeadNotificationEmail(lead: LeadInput, leadId: number): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFICATION_EMAIL_TO;
  const from = process.env.NOTIFICATION_EMAIL_FROM;

  if (!apiKey || !to || !from) {
    console.warn(
      "[email] RESEND_API_KEY/NOTIFICATION_EMAIL_TO/FROM não configuradas — notificação por e-mail pulada (modo opcional).",
    );
    return;
  }

  const resend = new Resend(apiKey);

  const tipoLabel =
    lead.tipo === "empresa" ? "Empresa" : lead.tipo === "agencia" ? "Agência" : "Outros";

  await resend.emails.send({
    from,
    to,
    subject: `Novo lead do site: ${lead.nome}`,
    html: `
      <h2>Novo lead recebido pelo formulário do site</h2>
      <p><strong>ID:</strong> ${leadId}</p>
      <p><strong>Nome:</strong> ${lead.nome}</p>
      <p><strong>WhatsApp:</strong> ${lead.whatsapp}</p>
      <p><strong>Email:</strong> ${lead.email}</p>
      <p><strong>Ramo:</strong> ${lead.ramo}</p>
      <p><strong>Tipo de cliente:</strong> ${tipoLabel}</p>
    `,
  });
}
