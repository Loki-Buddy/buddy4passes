pub mod crypt {
    use aes_gcm::{
        aead::{Aead, KeyInit, OsRng},
        Aes256Gcm, Key, Nonce
    };
    use argon2::{
        password_hash::{rand_core::OsRng as ArgonRng, PasswordHasher, SaltString},
        Argon2, PasswordHash, PasswordVerifier,
    };
    use base64::{engine::general_purpose, Engine as _};
    use std::str;
    use thiserror::Error;
    use rand::RngCore;

    #[derive(Error, Debug)]
    pub enum CryptoError {
        #[error("Encryption failed")]
        EncryptionError,
        #[error("Decryption failed")]
        DecryptionError,
        #[error("Hashing failed")]
        HashingError,
        #[error("Verification failed")]
        VerificationError,
        #[error("Invalid key length")]
        KeyError,
    }

    // Länge der Verschlüsselungsschlüssel in Bytes
    const KEY_LENGTH: usize = 32; // 256 Bit für AES-256
    const NONCE_LENGTH: usize = 12; // 96 Bit für GCM

    pub struct CryptoService {
        key: [u8; KEY_LENGTH],
    }

    impl CryptoService {
        /// Erstellt einen neuen CryptoService mit einem zufälligen Schlüssel
        pub fn new_random() -> Self {
            let mut key = [0u8; KEY_LENGTH];
            rand::rngs::OsRng.try_fill_bytes(&mut key);
            Self { key }
        }

        /// Erstellt einen CryptoService mit einem bestehenden Schlüssel (als Base64-String)
        pub fn from_key(key: &str) -> Result<Self, CryptoError> {
            let key_bytes = general_purpose::STANDARD
                .decode(key)
                .map_err(|_| CryptoError::KeyError)?;
        
            if key_bytes.len() != KEY_LENGTH {
                return Err(CryptoError::KeyError);
            }

            let mut key_array = [0u8; KEY_LENGTH];
            key_array.copy_from_slice(&key_bytes);
        
            Ok(Self { key: key_array })
        }

        /// Gibt den Schlüssel als Base64-String zurück
        pub fn get_key(&self) -> String {
            general_purpose::STANDARD.encode(&self.key)
        }

        /// Verschlüsselt einen String
        pub fn encrypt(&self, data: &str) -> Result<String, CryptoError> {
            let key = Key::<Aes256Gcm>::from_slice(&self.key);
            let cipher = Aes256Gcm::new(key);
            
            // Erstelle einen zufälligen 96-bit Nonce für AES-GCM
            let mut nonce_bytes = [0u8; 12];
            rand::rngs::OsRng.fill_bytes(&mut nonce_bytes);
            let nonce = Nonce::from_slice(&nonce_bytes);
            
            // Verschlüssele die Daten
            let ciphertext = cipher
                .encrypt(nonce, data.as_bytes())
                .map_err(|_| CryptoError::EncryptionError)?;
            
            // Kombiniere Nonce und Chiffretext
            let mut result = nonce_bytes.to_vec();
            result.extend_from_slice(&ciphertext);
            
            Ok(general_purpose::STANDARD.encode(&result))
        }

        /// Entschlüsselt einen String
        pub fn decrypt(&self, encrypted: &str) -> Result<String, CryptoError> {
            let key = Key::<Aes256Gcm>::from_slice(&self.key);
            let cipher = Aes256Gcm::new(key);
        
            // Dekodiere den Base64-String
            let decoded = general_purpose::STANDARD
                .decode(encrypted)
                .map_err(|_| CryptoError::DecryptionError)?;
        
            if decoded.len() < 12 { // 12 Bytes für den Nonce
                return Err(CryptoError::DecryptionError);
            }
        
            // Extrahiere Nonce und Chiffretext
            let (nonce_bytes, ciphertext) = decoded.split_at(12);
            let nonce = Nonce::from_slice(nonce_bytes);
        
            // Entschlüssele die Daten
            let plaintext = cipher
                .decrypt(nonce, ciphertext)
                .map_err(|_| CryptoError::DecryptionError)?;
        
            // Konvertiere die Bytes zurück in einen String
            String::from_utf8(plaintext).map_err(|_| CryptoError::DecryptionError)
        }

    }
    
    /// Erstellt einen sicheren Hash eines Passworts
    pub fn hash_password(password: &str) -> Result<String, CryptoError> {
        let salt = SaltString::generate(&mut ArgonRng);
        let argon2 = Argon2::default();
    
        let hash = argon2
            .hash_password(password.as_bytes(), &salt)
            .map_err(|_| CryptoError::HashingError)?
            .to_string();
    
        Ok(hash)
    }

    /// Überprüft ein Passwort gegen einen gespeicherten Hash
    pub fn verify_password(password: &str, hash: &str) -> Result<(), CryptoError> {
        let parsed_hash = PasswordHash::new(hash).map_err(|_| CryptoError::VerificationError)?;
    
        Argon2::default()
            .verify_password(password.as_bytes(), &parsed_hash)
            .map_err(|_| CryptoError::VerificationError)
    }
    #[cfg(test)]
    mod tests {
        use super::*;

        #[test]
        fn test_encryption_decryption() {
            let crypto = CryptoService::new_random();
            let original = "Geheime Nachricht";
        
            let encrypted = crypto.encrypt(original).unwrap();
            let decrypted = crypto.decrypt(&encrypted).unwrap();
        
            assert_eq!(original, decrypted);
        }

        #[test]
        fn test_password_hashing() {
            let password = "sicheres_passwort123!";
        
            let hash = hash_password(password).unwrap();
            assert_ne!(password, hash);
        
            let result = verify_password(password, &hash);
            assert!(result.is_ok());
        
            let wrong_password = "falsches_passwort";
            let result = verify_password(wrong_password, &hash);
            assert!(result.is_err());
        }
    }
}