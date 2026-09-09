import { z } from "zod";

/**
 * Schema de validação do formulário de contato/lead.
 * Todo dado que chega em req.body passa por aqui ANTES de tocar
 * no banco de dados ou em qualquer outra integração (Resend, Make.com etc).
 */
export const leadSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(120, "Nome muito longo"),
  whatsapp: z
    .string()
    .trim()
    .min(8, "WhatsApp inválido")
    .max(20, "WhatsApp inválido")
    .regex(/^[0-9+()\-\s]+$/, "WhatsApp deve conter apenas números e símbolos válidos"),
  email: z.string().trim().email("Email inválido").max(160, "Email muito longo"),
  ramo: z
    .string()
    .trim()
    .min(2, "Informe o ramo da empresa")
    .max(160, "Ramo muito longo"),
  tipo: z.enum(["empresa", "agencia", "outros"], {
    errorMap: () => ({ message: "Tipo de cliente inválido" }),
  }),
  // Token gerado pelo widget Cloudflare Turnstile no frontend.
  // Opcional: se o site não tiver TURNSTILE_SITE_KEY/SECRET_KEY configurados,
  // a verificação anti-bot é simplesmente pulada no backend (ver lib/turnstile.ts).
  turnstileToken: z.string().optional().default(""),
});

export type LeadInput = z.infer<typeof leadSchema>;

/**
 * Formata os erros do Zod num formato simples { campo: mensagem }
 * para ser devolvido ao frontend em um 400 Bad Request.
 */
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
}
