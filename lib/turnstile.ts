const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export interface TurnstileVerifyResult {
  success: boolean;
  errorCodes?: string[];
  skipped?: boolean;
}

/**
 * Valida o token do Cloudflare Turnstile enviado pelo frontend.
 * A chave secreta NUNCA é exposta ao cliente — vem de
 * process.env.TURNSTILE_SECRET_KEY e o POST é feito aqui, no backend.
 *
 * OPCIONAL: se TURNSTILE_SECRET_KEY não estiver configurada, a verificação
 * é pulada e considerada aprovada (útil em ambientes de teste). Em produção,
 * configure sempre — sem isso o endpoint fica sem proteção anti-bot.
 */
export async function verifyTurnstileToken(
  token: string,
  remoteIp: string,
): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn(
      "[turnstile] TURNSTILE_SECRET_KEY não configurada — verificação anti-bot desativada (modo opcional).",
    );
    return { success: true, skipped: true };
  }

  const body = new URLSearchParams();
  body.append("secret", secret);
  body.append("response", token);
  if (remoteIp) body.append("remoteip", remoteIp);

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    return { success: false, errorCodes: ["turnstile_http_error"] };
  }

  const data = (await response.json()) as {
    success: boolean;
    "error-codes"?: string[];
  };

  return { success: data.success, errorCodes: data["error-codes"] };
}
