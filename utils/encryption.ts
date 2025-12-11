import CryptoJS from 'crypto-js';

const SECRET_KEY = 'heartspace-secure-key-2024';

export class SecureStorage {
  private static generateKey(): string {
    return CryptoJS.SHA256(SECRET_KEY + (localStorage.getItem('heartspace_user_device') || 'default-device')).toString();
  }

  static encryptData(data: any): string {
    try {
      const jsonData = JSON.stringify(data);
      const encrypted = CryptoJS.AES.encrypt(jsonData, this.generateKey()).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      return JSON.stringify(data);
    }
  }

  static decryptData(encryptedData: string): any {
    try {
      if (!encryptedData || encryptedData.trim() === '') {
        return null;
      }
      
      // Check if data is already in plain JSON format (legacy data)
      try {
        const plainData = JSON.parse(encryptedData);
        // If it's valid JSON and not encrypted, return as-is (legacy support)
        if (typeof plainData === 'object' || Array.isArray(plainData)) {
          console.log('Detected legacy plain data, migrating to secure storage');
          return plainData;
        }
      } catch {
        // Not plain JSON, proceed with decryption
      }
      
      // Try to decrypt as AES encrypted data
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.generateKey());
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedData) {
        return null;
      }
      
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Decryption failed:', error);
      // If all else fails, try to parse as plain JSON
      try {
        return JSON.parse(encryptedData);
      } catch {
        return null;
      }
    }
  }

  static setItem(key: string, value: any): void {
    try {
      const encrypted = this.encryptData(value);
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Secure storage setItem failed:', error);
    }
  }

  static getItem(key: string): any {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      return this.decryptData(encrypted);
    } catch (error) {
      console.error('Secure storage getItem failed:', error);
      return null;
    }
  }

  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Secure storage removeItem failed:', error);
    }
  }

  static clearAllSecureData(): void {
    const secureKeys = [
      'heartspace_users_db',
      'heartspace_moods_db',
      'heartspace_weekly_reports_db',
      'heartspace_monthly_reports_db',
      'heartspace_lucky_date',
      'heartspace_lucky_note',
      'heartspace_time_courier_packages'
    ];

    secureKeys.forEach(key => {
      this.removeItem(key);
    });
  }
}

export class PasswordManager {
  private static salt = 'heartspace-salt-2024';

  static hashPassword(password: string): string {
    return CryptoJS.SHA256(password + this.salt).toString();
  }

  static verifyPassword(password: string, storedPassword: string): boolean {
    // Check if password is already hashed (64 characters for SHA-256 hex)
    if (storedPassword.length === 64 && /^[a-f0-9]+$/.test(storedPassword)) {
      // Password is already hashed, verify against hash
      const inputHash = this.hashPassword(password);
      return inputHash === storedPassword;
    } else {
      // Legacy plain text password support
      console.log('Detected legacy plain text password, please update for security');
      return password === storedPassword;
    }
  }

  static isSecurePassword(password: string): boolean {
    return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
  }

  // Method to check if password needs migration
  static needsMigration(storedPassword: string): boolean {
    return storedPassword.length !== 64 || !/^[a-f0-9]+$/.test(storedPassword);
  }

  // Method to migrate password from plain text to hashed
  static migratePassword(plainPassword: string): string {
    return this.hashPassword(plainPassword);
  }
}