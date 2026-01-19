import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { createKeyHint, decryptApiKey, encryptApiKey, validateKeyFormat } from './encryption';

describe('encryption', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, NODE_ENV: 'development' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('encryptApiKey / decryptApiKey', () => {
    it('should encrypt and decrypt a string correctly', () => {
      const originalKey = 'sk-test123456789abcdefghijklmnopqrstuvwxyz';

      const encrypted = encryptApiKey(originalKey);
      const decrypted = decryptApiKey(encrypted);

      expect(decrypted).toBe(originalKey);
    });

    it('should produce different ciphertext for the same input (due to random IV)', () => {
      const originalKey = 'sk-test123456789';

      const encrypted1 = encryptApiKey(originalKey);
      const encrypted2 = encryptApiKey(originalKey);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should produce base64 encoded output', () => {
      const encrypted = encryptApiKey('test-key');

      // Base64 should only contain valid characters
      expect(encrypted).toMatch(/^[A-Za-z0-9+/]+=*$/);
    });

    it('should handle empty strings', () => {
      const encrypted = encryptApiKey('');
      const decrypted = decryptApiKey(encrypted);

      expect(decrypted).toBe('');
    });

    it('should handle long API keys', () => {
      const longKey = 'sk-' + 'a'.repeat(200);

      const encrypted = encryptApiKey(longKey);
      const decrypted = decryptApiKey(encrypted);

      expect(decrypted).toBe(longKey);
    });

    it('should handle unicode characters', () => {
      const unicodeKey = 'sk-test-🔑-key-日本語';

      const encrypted = encryptApiKey(unicodeKey);
      const decrypted = decryptApiKey(encrypted);

      expect(decrypted).toBe(unicodeKey);
    });
  });

  describe('createKeyHint', () => {
    it('should show last 4 characters with asterisks', () => {
      const apiKey = 'sk-test123456789abcdefgh';
      const hint = createKeyHint(apiKey);

      expect(hint).toBe('****efgh');
    });

    it('should return asterisks for short keys', () => {
      const shortKey = 'short';
      const hint = createKeyHint(shortKey);

      expect(hint).toBe('****');
    });

    it('should handle exactly 8 character keys', () => {
      const key = '12345678';
      const hint = createKeyHint(key);

      expect(hint).toBe('****5678');
    });
  });

  describe('validateKeyFormat', () => {
    describe('openai', () => {
      it('should accept valid OpenAI keys', () => {
        const result = validateKeyFormat('openai', 'sk-1234567890abcdefghijklmnopqrstuvwxyz12345');

        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should reject keys without sk- prefix', () => {
        const result = validateKeyFormat('openai', 'pk-1234567890abcdefghijklmnopqrstuvwxyz12345');

        expect(result.valid).toBe(false);
        expect(result.error).toContain('sk-');
      });

      it('should reject short keys', () => {
        const result = validateKeyFormat('openai', 'sk-short');

        expect(result.valid).toBe(false);
        expect(result.error).toContain('too short');
      });
    });

    describe('anthropic', () => {
      it('should accept valid Anthropic keys', () => {
        const result = validateKeyFormat(
          'anthropic',
          'sk-ant-1234567890abcdefghijklmnopqrstuvwxyz1234567890abc'
        );

        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should reject keys without sk-ant- prefix', () => {
        const result = validateKeyFormat(
          'anthropic',
          'sk-1234567890abcdefghijklmnopqrstuvwxyz1234567890abc'
        );

        expect(result.valid).toBe(false);
        expect(result.error).toContain('sk-ant-');
      });

      it('should reject short keys', () => {
        const result = validateKeyFormat('anthropic', 'sk-ant-short');

        expect(result.valid).toBe(false);
        expect(result.error).toContain('too short');
      });
    });

    describe('gemini', () => {
      it('should accept valid Gemini keys', () => {
        const result = validateKeyFormat('gemini', 'AIzaSyDtest1234567890abcdefghij');

        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should reject short keys', () => {
        const result = validateKeyFormat('gemini', 'short');

        expect(result.valid).toBe(false);
        expect(result.error).toContain('too short');
      });
    });

    describe('unknown provider', () => {
      it('should reject unknown providers', () => {
        const result = validateKeyFormat('unknown', 'some-key');

        expect(result.valid).toBe(false);
        expect(result.error).toContain('Unknown provider');
      });
    });
  });
});
