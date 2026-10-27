import crypto from 'node:crypto';
import { hashToken } from './crypto.ts';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Codifica Buffer em Base32 (RFC 4648) para compatibilidade com apps autenticadores TOTP.
 */
export function encodeBase32(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

/**
 * Decodifica string Base32 (RFC 4648) para Buffer.
 */
export function decodeBase32(base32: string): Buffer {
  const cleaned = base32.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (let i = 0; i < cleaned.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(cleaned[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

/**
 * Gera um segredo TOTP aleatório de 160 bits (20 bytes) em Base32.
 */
export function generateTotpSecret(): string {
  return encodeBase32(crypto.randomBytes(20));
}

/**
 * Calcula o código TOTP de 6 dígitos (RFC 6238 / HOTP RFC 4226) para um dado instante.
 */
export function generateTotpCode(
  secretBase32: string,
  timestampMs = Date.now(),
  stepSeconds = 30
): string {
  const counter = Math.floor(timestampMs / 1000 / stepSeconds);
  const counterBuf = Buffer.alloc(8);
  counterBuf.writeBigUInt64BE(BigInt(counter), 0);

  const key = decodeBase32(secretBase32);
  const hmac = crypto.createHmac('sha1', key).update(counterBuf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = binary % 1_000_000;
  return otp.toString().padStart(6, '0');
}

/**
 * Verifica um código TOTP de 6 dígitos com tolerância de janela de ±1 step (30s) para clock skew.
 */
export function verifyTotpCode(
  secretBase32: string,
  code: string,
  timestampMs = Date.now(),
  windowSteps = 1
): boolean {
  const cleanCode = (code || '').trim();
  if (!/^\d{6}$/.test(cleanCode)) return false;

  for (let w = -windowSteps; w <= windowSteps; w++) {
    const checkTime = timestampMs + w * 30_000;
    const expected = generateTotpCode(secretBase32, checkTime);
    const bufA = Buffer.from(cleanCode);
    const bufB = Buffer.from(expected);
    if (bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)) {
      return true;
    }
  }
  return false;
}

/**
 * Gera URI otpauth:// para exibição em QR Code de aplicativos autenticadores.
 */
export function buildOtpAuthUri(
  email: string,
  secretBase32: string,
  issuer = 'Meu Controle Financeiro'
): string {
  const label = encodeURIComponent(`${issuer}:${email}`);
  const encodedIssuer = encodeURIComponent(issuer);
  return `otpauth://totp/${label}?secret=${secretBase32}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Gera códigos de backup de uso único (8 códigos no formato XXXX-XXXX) e seus respectivos hashes.
 */
export function generateBackupCodes(count = 8): {
  plainCodes: string[];
  hashedCodes: string[];
} {
  const plainCodes: string[] = [];
  const hashedCodes: string[] = [];
  for (let i = 0; i < count; i++) {
    const raw = crypto.randomBytes(4).toString('hex').toUpperCase();
    const formatted = `${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
    plainCodes.push(formatted);
    hashedCodes.push(hashToken(formatted));
  }
  return { plainCodes, hashedCodes };
}
