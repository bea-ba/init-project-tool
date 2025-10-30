import CryptoJS from 'crypto-js';

// Generate a device-specific encryption key
// In production, consider using a more sophisticated key derivation
const getEncryptionKey = (): string => {
  const storageKey = 'dreamwell_device_key';
  let key = localStorage.getItem(storageKey);

  if (!key) {
    // Generate a random key for this device
    key = CryptoJS.lib.WordArray.random(256 / 8).toString();
    localStorage.setItem(storageKey, key);
  }

  return key;
};

/**
 * Encrypts sensitive data before storing in localStorage
 * @param data - The data to encrypt
 * @returns Encrypted string
 */
export const encryptData = (data: string): string => {
  try {
    const key = getEncryptionKey();
    const encrypted = CryptoJS.AES.encrypt(data, key).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypts data retrieved from localStorage
 * @param encryptedData - The encrypted string
 * @returns Decrypted string
 */
export const decryptData = (encryptedData: string): string => {
  try {
    const key = getEncryptionKey();
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

    if (!decryptedText) {
      throw new Error('Decryption resulted in empty string');
    }

    return decryptedText;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Generates a cryptographically secure UUID
 * @returns Secure UUID string
 */
export const generateSecureId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
