import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

/**
 * Rate limit de proteção contra abuso: no máximo 3 submissões
 * por IP a cada 10 minutos (janela deslizante).
 * Credenciais do Upstash vêm de process.env (nunca hardcoded).
 *
 * OPCIONAL: se UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN não
 * estiverem configuradas, o rate limit é simplesmente pulado (útil em
 * ambientes de teste). Em produção, configure sempre — sem isso o
 * endpoint fica sem proteção contra abuso/spam.
 */
let ratelimit: Ratelimit | null | undefined; // undefined = ainda não inicializado

function getRatelimit(): Ratelimit | null {
  if (ratelimit !== undefined) return ratelimit;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn(
      "[rate-limit] UPSTASH_REDIS_REST_URL/TOKEN não configuradas — rate limit desativado (modo opcional).",
    );
    ratelimit = null;
    return ratelimit;
  }

  const redis = new Redis({ url, token });

  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "10 m"),
    prefix: "leadform:ratelimit",
    analytics: false,
  });

  return ratelimit;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  limit: number;
  reset: number;
  skipped?: boolean;
}

/**
 * Verifica (e consome) uma requisição do IP informado.
 * Retorna success=false quando o limite de 3/10min já foi atingido.
 * Se o Upstash não estiver configurado, retorna success=true (skipped=true).
 */
export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const rl = getRatelimit();
  if (!rl) {
    return { success: true, remaining: Infinity, limit: Infinity, reset: 0, skipped: true };
  }
  const { success, remaining, limit, reset } = await rl.limit(ip);
  return { success, remaining, limit, reset };
}

