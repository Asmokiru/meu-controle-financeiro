import crypto from 'node:crypto';

const CSRF_SECRET =
  process.env.CSRF_SECRET || 'csrf-secret-key-meu-controle-financeiro-2026';

/**
 * Cabeçalhos HTTP obrigatórios de segurança (OWASP Secure Headers)
 */
export function getSecurityHeaders(origin?: string): Record<string, string> {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:3000';
  const safeOrigin = origin === allowedOrigin ? origin : allowedOrigin;

  return {
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'Content-Security-Policy':
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy':
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
    'Access-Control-Allow-Origin': safeOrigin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-CSRF-Token, Authorization',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  };
}

/**
 * Rate Limiter em memória com bloqueio progressivo (suporta Redis em produção).
 */
interface RateBucket {
  count: number;
  resetAt: number;
  blockedUntil: number;
}

const rateBuckets = new Map<string, RateBucket>();

export function checkRateLimit(
  key: string,
  maxRequests = 20,
  windowMs = 60_000,
  progressiveLockMs = 300_000
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  const bucket = rateBuckets.get(key);

  if (bucket && bucket.blockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((bucket.blockedUntil - now) / 1000),
    };
  }

  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(key, {
      count: 1,
      resetAt: now + windowMs,
      blockedUntil: 0,
    });
    return { allowed: true, remaining: maxRequests - 1, retryAfterSeconds: 0 };
  }

  bucket.count += 1;
  if (bucket.count > maxRequests) {
    const multiplier = Math.min(bucket.count - maxRequests, 5);
    bucket.blockedUntil = now + progressiveLockMs * multiplier;
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((bucket.blockedUntil - now) / 1000),
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - bucket.count),
    retryAfterSeconds: 0,
  };
}

export function resetRateLimitsForTest(): void {
  rateBuckets.clear();
}

/**
 * Gera token CSRF vinculado à sessão do usuário (HMAC-SHA256).
 */
export function generateCsrfToken(sessionId: string): string {
  const nonce = crypto.randomBytes(16).toString('base64url');
  const mac = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(`${sessionId}:${nonce}`)
    .digest('base64url');
  return `${nonce}.${mac}`;
}

/**
 * Valida token CSRF em tempo constante contra a sessão ativa.
 */
export function verifyCsrfToken(sessionId: string, token: string): boolean {
  if (!sessionId || !token || !token.includes('.')) return false;
  const [nonce, mac] = token.split('.');
  if (!nonce || !mac) return false;
  const expectedMac = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(`${sessionId}:${nonce}`)
    .digest('base64url');
  const bufA = Buffer.from(mac);
  const bufB = Buffer.from(expectedMac);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Sanitiza strings contra injeção XSS e caracteres de controle.
 */
export function sanitizeText(input: unknown, maxLength = 255): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .trim()
    .slice(0, maxLength);
}

/**
 * Valida uploads de comprovantes por tipo MIME, extensão, tamanho máximo e Magic Bytes (conteúdo real).
 */
const ALLOWED_MIME_TYPES: Record<string, number[][]> = {
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
  'image/png': [[0x89, 0x50, 0x4e, 0x47]], // .PNG
  'image/jpeg': [[0xff, 0xd8, 0xff]], // JPEG SOI
};

export function validateAttachmentUpload(params: {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  contentBuffer: Buffer;
}): { valid: boolean; error?: string; sha256Checksum?: string } {
  const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

  if (!params.fileName || params.fileName.length > 200) {
    return { valid: false, error: 'Nome de arquivo inválido.' };
  }
  if (params.sizeBytes <= 0 || params.sizeBytes > MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: 'O arquivo deve ter no máximo 5 MB.',
    };
  }

  const signatures = ALLOWED_MIME_TYPES[params.mimeType];
  if (!signatures) {
    return {
      valid: false,
      error: 'Tipo de arquivo não permitido. Use apenas PDF, PNG ou JPEG.',
    };
  }

  const matchesSignature = signatures.some((sig) =>
    sig.every((byte, idx) => params.contentBuffer[idx] === byte)
  );
  if (!matchesSignature) {
    return {
      valid: false,
      error:
        'O conteúdo binário do arquivo não corresponde ao formato declarado (bloqueio de segurança).',
    };
  }

  const sha256Checksum = crypto
    .createHash('sha256')
    .update(params.contentBuffer)
    .digest('hex');

  return { valid: true, sha256Checksum };
}
