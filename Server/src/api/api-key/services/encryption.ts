/**
 * API Key Encryption Service
 * Provides AES-256-GCM encryption for storing BYOK API keys
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

/**
 * Gets the encryption key from environment or generates a secure default for development
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET_KEY;

  if (!secret) {
    // In development, use a deterministic key for testing
    if (process.env.NODE_ENV === 'development') {
      return crypto.scryptSync('dev-secret-key', 'dev-salt', 32);
    }
    throw new Error('ENCRYPTION_SECRET_KEY environment variable is required in production');
  }

  // Derive a 32-byte key from the secret using scrypt
  return crypto.scryptSync(secret, 'codereview-ai-salt', 32);
}

/**
 * Encrypts an API key using AES-256-GCM
 * Returns a base64 encoded string containing: salt + iv + authTag + ciphertext
 */
export function encryptApiKey(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Combine salt + iv + authTag + encrypted data
  const combined = Buffer.concat([salt, iv, authTag, encrypted]);

  return combined.toString('base64');
}

/**
 * Decrypts an API key encrypted with encryptApiKey
 */
export function decryptApiKey(encryptedData: string): string {
  const key = getEncryptionKey();
  const combined = Buffer.from(encryptedData, 'base64');

  // Extract components
  const salt = combined.subarray(0, SALT_LENGTH);
  const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const authTag = combined.subarray(
    SALT_LENGTH + IV_LENGTH,
    SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH
  );
  const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);

  // salt is included for future key derivation enhancements
  void salt;

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  return decrypted.toString('utf8');
}

/**
 * Creates a key hint (last 4 characters) for display purposes
 */
export function createKeyHint(apiKey: string): string {
  if (apiKey.length < 8) {
    return '****';
  }
  return `****${apiKey.slice(-4)}`;
}

/**
 * Validates API key format for different providers
 */
export function validateKeyFormat(
  provider: string,
  apiKey: string
): { valid: boolean; error?: string } {
  switch (provider) {
    case 'openai':
      // OpenAI keys start with 'sk-' and are 51+ characters
      if (!apiKey.startsWith('sk-')) {
        return { valid: false, error: 'OpenAI API keys must start with "sk-"' };
      }
      if (apiKey.length < 40) {
        return { valid: false, error: 'OpenAI API key appears to be too short' };
      }
      break;

    case 'anthropic':
      // Anthropic keys start with 'sk-ant-'
      if (!apiKey.startsWith('sk-ant-')) {
        return { valid: false, error: 'Anthropic API keys must start with "sk-ant-"' };
      }
      if (apiKey.length < 50) {
        return { valid: false, error: 'Anthropic API key appears to be too short' };
      }
      break;

    case 'gemini':
      // Google AI keys are typically 39 characters
      if (apiKey.length < 30) {
        return { valid: false, error: 'Google AI API key appears to be too short' };
      }
      break;

    default:
      return { valid: false, error: `Unknown provider: ${provider}` };
  }

  return { valid: true };
}

/**
 * Tests an API key by making a minimal API call to the provider
 */
export async function testApiKey(
  provider: string,
  apiKey: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    switch (provider) {
      case 'openai': {
        const response = await fetch('https://api.openai.com/v1/models', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        });

        if (response.status === 401) {
          return { valid: false, error: 'Invalid API key' };
        }
        if (response.status === 429) {
          return { valid: false, error: 'Rate limited - key may be valid but quota exceeded' };
        }
        if (!response.ok) {
          return { valid: false, error: `API returned status ${response.status}` };
        }
        return { valid: true };
      }

      case 'anthropic': {
        // Anthropic doesn't have a simple models endpoint, use a minimal completion test
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1,
            messages: [{ role: 'user', content: 'Hi' }],
          }),
        });

        if (response.status === 401) {
          return { valid: false, error: 'Invalid API key' };
        }
        if (response.status === 429) {
          return { valid: false, error: 'Rate limited - key may be valid but quota exceeded' };
        }
        // A successful response or validation error means the key is valid
        return { valid: true };
      }

      case 'gemini': {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`,
          { method: 'GET' }
        );

        if (response.status === 400 || response.status === 403) {
          return { valid: false, error: 'Invalid API key' };
        }
        if (!response.ok) {
          return { valid: false, error: `API returned status ${response.status}` };
        }
        return { valid: true };
      }

      default:
        return { valid: false, error: `Unknown provider: ${provider}` };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { valid: false, error: `Connection error: ${message}` };
  }
}
