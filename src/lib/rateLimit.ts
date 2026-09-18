/**
 * Rate limiting mínimo em memória para funcionar out-of-the-box em dev.
 *
 * IMPORTANTE (item 35): em produção com mais de uma instância/servidor, isto NÃO
 * é suficiente porque cada instância tem sua própria memória. Troque este módulo
 * por um client Redis/Upstash (ex: @upstash/ratelimit) mantendo a mesma assinatura
 * de `checkRateLimit`, para que o restante do código não precise mudar.
 */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterMs: 0 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count, retryAfterMs: 0 };
}

// Presets usados nas rotas (item 34/35)
export const RATE_LIMITS = {
  login: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 tentativas / 15 min por IP+conta
  adminWrite: { limit: 30, windowMs: 60 * 1000 },
  linkIdentify: { limit: 10, windowMs: 60 * 1000 },
  click: { limit: 60, windowMs: 60 * 1000 },
};

export function getClientIp(headers: Headers): string {
  const fwd = headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return headers.get('x-real-ip') ?? 'unknown';
}
