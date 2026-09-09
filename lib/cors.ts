import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Lê a lista de origens permitidas do env ALLOWED_ORIGIN (produção)
 * e sempre libera localhost em qualquer porta para desenvolvimento.
 * Ex.: ALLOWED_ORIGIN="https://seusite.com,https://www.seusite.com"
 */
function getAllowedOrigins(): string[] {
  const fromEnv = (process.env.ALLOWED_ORIGIN || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  const localhostPatterns = ["http://localhost:5173", "http://127.0.0.1:5173"];

  return [...fromEnv, ...localhostPatterns];
}

function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return false;
  const allowed = getAllowedOrigins();
  if (allowed.includes(origin)) return true;
  // Aceita qualquer porta em localhost/127.0.0.1 durante desenvolvimento.
  return /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
}

/**
 * Aplica os headers de CORS explícitos na resposta.
 * Retorna `true` se a requisição for um preflight OPTIONS já finalizado
 * (o handler chamador deve então retornar imediatamente).
 */
export function applyCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin as string | undefined;

  if (isOriginAllowed(origin) && origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }

  return false;
}
