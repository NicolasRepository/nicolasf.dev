import type { VercelRequest, VercelResponse } from "@vercel/node";
import { leadSchema, formatZodErrors } from "../lib/validation";
import { checkRateLimit } from "../lib/redis";
import { verifyTurnstileToken } from "../lib/turnstile";
import { insertLead } from "../lib/db";
import { sendMakeWebhook } from "../lib/webhook";
import { sendLeadNotificationEmail } from "../lib/email";
import { applyCors } from "../lib/cors";

/**
 * POST /api/lead
 *
 * Pipeline (nessa ordem):
 *  1. Parse + validação (Zod)
 *  2. Rate limit por IP (Upstash Redis) — 3 envios / 10 min
 *  3. Verificação anti-bot (Cloudflare Turnstile)
 *  4. Persistência primária (Neon Postgres)
 *  5. Execuções paralelas assíncronas (Make.com webhook + Resend e-mail)
 *  6. Resposta estruturada ao cliente
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS explícito: apenas domínio de produção + localhost.
  const isPreflightHandled = applyCors(req, res);
  if (isPreflightHandled) return;

  if (req.method !== "POST") {
    res.status(405).json({ success: false, error: "Método não permitido" });
    return;
  }

  // IP do cliente (Vercel injeta x-forwarded-for; pode conter uma lista, o primeiro é o cliente real).
  const forwardedFor = req.headers["x-forwarded-for"];
  const clientIp = (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor)
    ?.split(",")[0]
    ?.trim() || req.socket?.remoteAddress || "unknown";

  // 1. Parse + validação Zod -------------------------------------------------
  const parseResult = leadSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: "Dados inválidos",
      fields: formatZodErrors(parseResult.error),
    });
    return;
  }
  const lead = parseResult.data;

  // 2. Rate limit (Redis) ------------------------------------------------------
  try {
    const rl = await checkRateLimit(clientIp);
    if (!rl.success) {
      res.status(429).json({
        success: false,
        error: "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
      });
      return;
    }
  } catch (err) {
    console.error("Erro ao checar rate limit:", err);
    res.status(500).json({ success: false, error: "Erro interno. Tente novamente mais tarde." });
    return;
  }

  // 3. Verificação anti-bot (Turnstile) -----------------------------------------
  try {
    const verification = await verifyTurnstileToken(lead.turnstileToken, clientIp);
    if (!verification.success) {
      res.status(403).json({ success: false, error: "Falha na verificação anti-bot" });
      return;
    }
  } catch (err) {
    console.error("Erro ao verificar Turnstile:", err);
    res.status(500).json({ success: false, error: "Erro interno. Tente novamente mais tarde." });
    return;
  }

  // 4. Persistência primária (Neon DB) -------------------------------------------
  let insertedId: number;
  try {
    const inserted = await insertLead({ ...lead, ip: clientIp });
    insertedId = inserted.id;
  } catch (err) {
    // Nunca expor stack trace / detalhes do Postgres na resposta de produção.
    console.error("Erro ao inserir lead no banco:", err);
    res.status(500).json({ success: false, error: "Erro interno. Tente novamente mais tarde." });
    return;
  }

  // 5. Execuções paralelas assíncronas (dispara e esquece) --------------------------
  const results = await Promise.allSettled([
    sendMakeWebhook(lead, insertedId),
    sendLeadNotificationEmail(lead, insertedId),
  ]);
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      const label = i === 0 ? "Make.com webhook" : "Resend e-mail";
      console.error(`Falha na integração assíncrona (${label}):`, result.reason);
    }
  });

  // 6. Resposta de sucesso ------------------------------------------------------
  res.status(201).json({
    success: true,
    message: "Lead capturado com sucesso",
    id: insertedId,
  });
}
