import CryptoJS from 'crypto-js';
import * as SecureStore from 'expo-secure-store';

/**
 * Chave de criptografia - DEVE ser movida para variável de ambiente em produção
 * Esta é uma chave exemplo, substitua por uma chave segura e única
 */
const ENCRYPTION_KEY = process.env.EXPO_PUBLIC_ENCRYPTION_KEY || 'bytebank-secure-key-2025';

/**
 * Serviço de criptografia para dados sensíveis
 */
export class EncryptionService {
  /**
   * Criptografa dados usando AES-256
   */
  static encrypt(data: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
      return encrypted;
    } catch (error) {
      console.error('Erro ao criptografar dados:', error);
      throw new Error('Falha na criptografia');
    }
  }

  /**
   * Descriptografa dados criptografados com AES-256
   */
  static decrypt(encryptedData: string): string {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
      const original = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!original) {
        throw new Error('Dados corrompidos ou chave incorreta');
      }
      
      return original;
    } catch (error) {
      console.error('Erro ao descriptografar dados:', error);
      throw new Error('Falha na descriptografia');
    }
  }

  /**
   * Criptografa um objeto JavaScript
   */
  static encryptObject<T>(obj: T): string {
    const jsonString = JSON.stringify(obj);
    return this.encrypt(jsonString);
  }

  /**
   * Descriptografa para um objeto JavaScript
   */
  static decryptObject<T>(encryptedData: string): T {
    const decrypted = this.decrypt(encryptedData);
    return JSON.parse(decrypted) as T;
  }

  /**
   * Gera hash SHA-256 (útil para verificação de integridade)
   */
  static hash(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }

  /**
   * Compara hash com dados originais
   */
  static verifyHash(data: string, hash: string): boolean {
    return this.hash(data) === hash;
  }
}

/**
 * Serviço de armazenamento seguro usando Expo SecureStore
 * Dados são criptografados e armazenados de forma segura no dispositivo
 */
export class SecureStorageService {
  /**
   * Salva dados de forma segura
   */
  static async save(key: string, value: string): Promise<void> {
    try {
      const encrypted = EncryptionService.encrypt(value);
      await SecureStore.setItemAsync(key, encrypted);
      console.log(`✅ Dados salvos de forma segura: ${key}`);
    } catch (error) {
      console.error(`Erro ao salvar dados seguros (${key}):`, error);
      throw new Error('Falha ao salvar dados seguros');
    }
  }

  /**
   * Salva objeto de forma segura
   */
  static async saveObject<T>(key: string, obj: T): Promise<void> {
    const jsonString = JSON.stringify(obj);
    await this.save(key, jsonString);
  }

  /**
   * Recupera dados seguros
   */
  static async get(key: string): Promise<string | null> {
    try {
      const encrypted = await SecureStore.getItemAsync(key);
      
      if (!encrypted) {
        return null;
      }
      
      return EncryptionService.decrypt(encrypted);
    } catch (error) {
      console.error(`Erro ao recuperar dados seguros (${key}):`, error);
      return null;
    }
  }

  /**
   * Recupera objeto seguro
   */
  static async getObject<T>(key: string): Promise<T | null> {
    try {
      const jsonString = await this.get(key);
      
      if (!jsonString) {
        return null;
      }
      
      return JSON.parse(jsonString) as T;
    } catch (error) {
      console.error(`Erro ao recuperar objeto seguro (${key}):`, error);
      return null;
    }
  }

  /**
   * Remove dados seguros
   */
  static async remove(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
      console.log(`🗑️ Dados seguros removidos: ${key}`);
    } catch (error) {
      console.error(`Erro ao remover dados seguros (${key}):`, error);
      throw new Error('Falha ao remover dados seguros');
    }
  }

  /**
   * Verifica se existe dados para a chave
   */
  static async exists(key: string): Promise<boolean> {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value !== null;
    } catch (error) {
      return false;
    }
  }
}

/**
 * Chaves para armazenamento seguro
 */
export const SecureStorageKeys = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  USER_CREDENTIALS: 'user_credentials',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  LAST_LOGIN: 'last_login',
} as const;
