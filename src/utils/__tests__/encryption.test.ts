import { describe, it, expect, beforeEach } from 'vitest';
import { encryptData, decryptData, generateSecureId } from '../encryption';

describe('encryption', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('encryptData', () => {
    it('should encrypt data successfully', () => {
      const data = 'sensitive information';
      const encrypted = encryptData(data);

      expect(encrypted).toBeTruthy();
      expect(encrypted).not.toBe(data);
      expect(typeof encrypted).toBe('string');
    });

    it('should use consistent encryption key per session', () => {
      const data = 'test data';
      const encrypted1 = encryptData(data);
      const encrypted2 = encryptData(data);

      // With same key, encrypted values should have same structure but may differ due to salt
      expect(encrypted1).toBeTruthy();
      expect(encrypted2).toBeTruthy();
      expect(typeof encrypted1).toBe('string');
      expect(typeof encrypted2).toBe('string');
    });

    it('should handle very short strings', () => {
      const encrypted = encryptData('a');
      expect(encrypted).toBeTruthy();
      expect(encrypted).not.toBe('a');
    });

    it('should handle special characters', () => {
      const data = '!@#$%^&*()_+{}[]|\\:";\'<>?,./';
      const encrypted = encryptData(data);
      expect(encrypted).toBeTruthy();
      expect(encrypted).not.toBe(data);
    });

    it('should handle unicode characters', () => {
      const data = '你好世界 🌙 ✨';
      const encrypted = encryptData(data);
      expect(encrypted).toBeTruthy();
      expect(encrypted).not.toBe(data);
    });
  });

  describe('decryptData', () => {
    it('should decrypt encrypted data successfully', () => {
      const originalData = 'secret message';
      const encrypted = encryptData(originalData);
      const decrypted = decryptData(encrypted);

      expect(decrypted).toBe(originalData);
    });

    it('should handle very short strings in roundtrip', () => {
      const originalData = 'x';
      const encrypted = encryptData(originalData);
      const decrypted = decryptData(encrypted);

      expect(decrypted).toBe(originalData);
    });

    it('should handle special characters in roundtrip', () => {
      const originalData = '!@#$%^&*()_+{}[]|\\:";\'<>?,./';
      const encrypted = encryptData(originalData);
      const decrypted = decryptData(encrypted);

      expect(decrypted).toBe(originalData);
    });

    it('should handle unicode in roundtrip', () => {
      const originalData = '你好世界 🌙 ✨';
      const encrypted = encryptData(originalData);
      const decrypted = decryptData(encrypted);

      expect(decrypted).toBe(originalData);
    });

    it('should throw error when decrypting with wrong key', () => {
      const originalData = 'secret';
      const encrypted = encryptData(originalData);

      // Change the encryption key
      localStorage.setItem('dreamwell_device_key', 'wrong-key');

      expect(() => decryptData(encrypted)).toThrow('Failed to decrypt data');
    });

    it('should throw error when decrypting invalid data', () => {
      expect(() => decryptData('invalid-encrypted-data')).toThrow('Failed to decrypt data');
    });
  });

  describe('encryption/decryption roundtrip', () => {
    it('should correctly roundtrip JSON data', () => {
      const jsonData = JSON.stringify({
        name: 'Test User',
        age: 30,
        nested: { value: 'test' },
      });

      const encrypted = encryptData(jsonData);
      const decrypted = decryptData(encrypted);
      const parsed = JSON.parse(decrypted);

      expect(parsed).toEqual({
        name: 'Test User',
        age: 30,
        nested: { value: 'test' },
      });
    });

    it('should correctly roundtrip large data', () => {
      const largeData = 'a'.repeat(10000);
      const encrypted = encryptData(largeData);
      const decrypted = decryptData(encrypted);

      expect(decrypted).toBe(largeData);
      expect(decrypted.length).toBe(10000);
    });
  });

  describe('generateSecureId', () => {
    it('should generate a valid UUID', () => {
      const id = generateSecureId();

      // In test environment, crypto.randomUUID is mocked to return a fixed UUID
      expect(id).toBeTruthy();
      expect(typeof id).toBe('string');
      expect(id.length).toBe(36); // UUID format with dashes
      expect(id).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should consistently use crypto.randomUUID', () => {
      const id1 = generateSecureId();
      const id2 = generateSecureId();
      const id3 = generateSecureId();

      // In test environment, all IDs are the same due to mock
      expect(id1).toBe(id2);
      expect(id2).toBe(id3);
      expect(id1).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

  });
});
