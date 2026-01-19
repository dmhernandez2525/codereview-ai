import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

/**
 * Derives an encryption key from a password using PBKDF2.
 */
function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha256');
}

/**
 * Encrypts a string using AES-256-GCM.
 * Returns a base64 encoded string containing salt + iv + authTag + encrypted data.
 */
export function encrypt(plaintext: string, secretKey: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = deriveKey(secretKey, salt);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  const authTag = cipher.getAuthTag();

  // Combine salt + iv + authTag + encrypted data
  const combined = Buffer.concat([salt, iv, authTag, encrypted]);

  return combined.toString('base64');
}

/**
 * Decrypts a base64 encoded string that was encrypted with encrypt().
 */
export function decrypt(encryptedBase64: string, secretKey: string): string {
  const combined = Buffer.from(encryptedBase64, 'base64');

  // Extract components
  const salt = combined.subarray(0, SALT_LENGTH);
  const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const authTag = combined.subarray(
    SALT_LENGTH + IV_LENGTH,
    SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH
  );
  const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);

  const key = deriveKey(secretKey, salt);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString('utf8');
}

/**
 * Validates that an API key has the expected format.
 */
export function validateApiKeyFormat(apiKey: string, provider: string): boolean {
  switch (provider) {
    case 'openai':
      // OpenAI keys start with 'sk-' and are 51 chars
      return /^sk-[a-zA-Z0-9]{48}$/.test(apiKey) || /^sk-proj-[a-zA-Z0-9-_]{80,}$/.test(apiKey);

    case 'anthropic':
      // Anthropic keys start with 'sk-ant-'
      return /^sk-ant-[a-zA-Z0-9-_]{80,}$/.test(apiKey);

    case 'gemini':
      // Google AI keys are 39 chars
      return /^[a-zA-Z0-9_-]{39}$/.test(apiKey);

    default:
      // Unknown provider, just check it's not empty
      return apiKey.length > 10;
  }
}

/**
 * Gets a hint for an API key (last 4 characters).
 */
export function getApiKeyHint(apiKey: string): string {
  if (apiKey.length < 8) {
    return '****';
  }
  return `...${apiKey.slice(-4)}`;
}

/**
 * Generates a secure random token.
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hashes a value using SHA-256.
 */
export function hashValue(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}
