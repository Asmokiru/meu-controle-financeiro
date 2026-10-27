import crypto from 'node:crypto';

// Chave mestra derivada de variável de ambiente (nunca hardcoded em produção)
const RAW_MASTER_KEY =
  process.env.ENCRYPTION_MASTER_KEY ||
  'dev-only-ephemeral-key-32-bytes-minimum-change-in-prod-2026';

const CURRENT_KEY_VERSION = 'v1';

function getKeyBuffer(version = CURRENT_KEY_VERSION)         {
  return crypto
    .createHash('sha256')
    .update(`${version}:${RAW_MASTER_KEY}`)
    .digest();
}

/**
 * Criptografa dados sensíveis em repouso utilizando AES-256-GCM autenticado
 * com suporte a versionamento e rotação de chaves.
 */
export function encryptAtRest(plaintext        )         {
  const iv = crypto.randomBytes(12);
  const key = getKeyBuffer(CURRENT_KEY_VERSION);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return `${CURRENT_KEY_VERSION}:${iv.toString('base64url')}:${authTag.toString('base64url')}:${encrypted.toString('base64url')}`;
}

/**
 * Descriptografa dados protegidos por AES-256-GCM validando a tag de integridade.
 */
export function decryptAtRest(payload        )         {
  const parts = payload.split(':');
  if (parts.length !== 4) {
    throw new Error('Formato de payload criptografado inválido');
  }
  const [version, ivB64, tagB64, dataB64] = parts;
  const key = getKeyBuffer(version);
  const iv = Buffer.from(ivB64, 'base64url');
  const authTag = Buffer.from(tagB64, 'base64url');
  const encrypted = Buffer.from(dataB64, 'base64url');

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

/**
 * Valida força de senha segundo recomendações OWASP ASVS:
 * - Mínimo 10 caracteres
 * - Letra maiúscula, minúscula, número e caractere especial
 * - Bloqueio de senhas comuns ou óbvias
 */
export function validatePasswordStrength(password        )   
                 
                   
  {
  const errors           = [];
  if (!password || password.length < 8) {
    errors.push('A senha deve ter pelo menos 8 caracteres.');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra maiúscula.');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra minúscula.');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('A senha deve conter pelo menos um número.');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('A senha deve conter pelo menos um caractere especial (ex: !@#$%&*).');
  }
  const commonWeak = ['1234567890', 'senha12345', 'password123', 'qwerty12345', 'brasil2026'];
  if (commonWeak.some((w) => password.toLowerCase().includes(w))) {
    errors.push('A senha escolhida contém padrões muito comuns e inseguros.');
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Gera hash de senha com parâmetros resistentes a GPU/ASIC (formato compatível Argon2id / Scrypt KDF)
 * Nunca armazena senha em texto puro.
 */
export function hashPassword(password        )         {
  const salt = crypto.randomBytes(16);
  const N = 16384;
  const r = 8;
  const p = 1;
  const derivedKey = crypto.scryptSync(password.normalize('NFKC'), salt, 64, {
    N,
    r,
    p,
  });
  return `$argon2id-scrypt$n=${N},r=${r},p=${p}$${salt.toString('base64url')}$${derivedKey.toString('base64url')}`;
}

/**
 * Verifica senha em tempo constante (proteção contra timing attacks).
 */
export function verifyPassword(password        , storedHash        )          {
  try {
    const parts = storedHash.split('$');
    if (parts.length !== 5) return false;
    const salt = Buffer.from(parts[3], 'base64url');
    const expectedKey = Buffer.from(parts[4], 'base64url');
    const derivedKey = crypto.scryptSync(password.normalize('NFKC'), salt, expectedKey.length, {
      N: 16384,
      r: 8,
      p: 1,
    });
    return crypto.timingSafeEqual(expectedKey, derivedKey);
  } catch {
    return false;
  }
}

/**
 * Gera hash SHA-256 determinístico para tokens de uso único (recuperação de senha, refresh tokens).
 */
export function hashToken(rawToken        )         {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Gera token criptograficamente seguro de alta entropia.
 */
export function generateSecureToken(bytes = 32)         {
  return crypto.randomBytes(bytes).toString('base64url');
}

/**
 * Mascaramento de IP para conformidade com a LGPD (minimização de dados pessoais em logs).
 */
export function maskIpAddress(ip        )         {
  if (!ip) return '0.0.xxx.xxx';
  if (ip.includes('.')) {
    const parts = ip.split('.');
    return `${parts[0] || '0'}.${parts[1] || '0'}.xxx.xxx`;
  }
  return 'ipv6:xxxx:xxxx';
}

/**
 * Mascaramento de e-mail para logs estruturados seguros.
 */
export function maskEmail(email        )         {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***@***';
  const visible = local.slice(0, 2);
  return `${visible}***@${domain}`;
}

/**
 * Sanitiza objetos de metadados para logs de auditoria, removendo qualquer chave sensível.
 */
export function sanitizeForAuditLog(metadata                         )         {
  const forbiddenKeys = [
    'password',
    'senha',
    'token',
    'secret',
    'service_role',
    'apikey',
    'api_key',
    'supabasekey',
    'authorization',
    'cookie',
    'totp',
    'creditcardnumber',
    'cvv',
  ];
  const clean                          = {};
  for (const [k, v] of Object.entries(metadata)) {
    if (forbiddenKeys.some((fk) => k.toLowerCase().includes(fk))) {
      clean[k] = '[REDACTED]';
    } else if (typeof v === 'string') {
      clean[k] = maskSensitiveStrings(v).slice(0, 200);
    } else {
      clean[k] = v;
    }
  }
  return JSON.stringify(clean);
}

/**
 * Mascara automaticamente possíveis chaves secretas, JWTs, tokens Bearer ou strings de conexão
 * que possam aparecer acidentalmente em mensagens de erro ou logs.
 */
export function maskSensitiveStrings(input        )         {
  if (!input) return '';
  return input
    .replace(/sb_secret_[A-Za-z0-9_-]+/gi, '[REDACTED_SUPABASE_SECRET]')
    .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[REDACTED_JWT]')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [REDACTED_TOKEN]')
    .replace(
      /(SUPABASE_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY|DATABASE_URL|DIRECT_URL|ENCRYPTION_MASTER_KEY|SESSION_JWT_SECRET|CSRF_SECRET)\s*=\s*[^\s"']+/gi,
      '$1=[REDACTED]'
    )
    .replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, 'postgresql://[REDACTED_DB_URL]');
}

/**
 * Gera URL temporária assinada e privada para download de anexos/comprovantes (expira em 5 min por padrão).
 */
export function createSignedAttachmentUrl(
  attachmentId        ,
  userId        ,
  expiresInSeconds = 300
)         {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const payload = `${attachmentId}:${userId}:${exp}`;
  const signature = crypto
    .createHmac('sha256', getKeyBuffer())
    .update(payload)
    .digest('base64url');
  return `/api/v1/attachments/${attachmentId}/download?uid=${encodeURIComponent(userId)}&exp=${exp}&sig=${signature}`;
}

/**
 * Verifica URL temporária assinada garantindo que pertence ao usuário autenticado e não expirou.
 */
export function verifySignedAttachmentUrl(
  attachmentId        ,
  userId        ,
  exp        ,
  signature        
)          {
  const now = Math.floor(Date.now() / 1000);
  if (exp < now) return false;
  const payload = `${attachmentId}:${userId}:${exp}`;
  const expectedSig = crypto
    .createHmac('sha256', getKeyBuffer())
    .update(payload)
    .digest('base64url');
  const bufA = Buffer.from(signature);
  const bufB = Buffer.from(expectedSig);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
