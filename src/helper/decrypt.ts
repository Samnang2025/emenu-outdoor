export function decryptData(ciphertext: any, secretKey: string): string {
    // Convert Base64 URL-safe encoding back to regular Base64
    const base64Ciphertext = ciphertext.replace(/-/g, '+').replace(/_/g, '/');
    // Decrypt data using AES
    const CryptoJS = require("crypto-js")
    const bytes = CryptoJS.AES.decrypt(base64Ciphertext, secretKey);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedData;
  }

  
