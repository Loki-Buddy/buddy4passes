// use argon2::password_hash::Value;
use tauri::State;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::sync::{Arc, Mutex};
use std::fs;
use std::env;
use crate::crypt::crypt::verify_password;

#[derive(Serialize)]
struct LoginRequest {
    user_name: String,
    master_password: String,
}
// #[derive(Deserialize, Serialize)]
// struct UserRequest {
//     user_name: String,
// }

#[derive(Deserialize, Debug)]
struct LoginResponse {
    message: String,
    token: Option<String>,
    refresh_token: Option<String>,
}

#[derive(Serialize)]
pub struct LoginResult {
    pub success: bool,
    pub message: String,
}

// Token wird im RAM gespeichert
pub struct MemoryStore {
    pub key: Mutex<Option<String>>,
    pub token: Mutex<Option<String>>,
    pub refresh_token: Mutex<Option<String>>,
}

// Tauri command für den Login
#[tauri::command]
pub async fn login_user(
    client: State<'_, Arc<Client>>,
    state: State<'_, Arc<MemoryStore>>,
    username: String,
    masterpassword: String,
) -> Result<LoginResult, String> {
    
    // gehashtes Passwort anfordern
    let hash_response = client
        .get("http://3.74.73.164:3000/user/data")
        .query(&[("user_name", &username)])
        .send()
        .await
        .map_err(|e| format!("Fehler beim Senden der Anfrage: {}", e))?;
        


    if !hash_response.status().is_success() {
        return Ok(LoginResult {
            success: false,
            message: format!("Login fehlgeschlagen"),
        });
    };

    let user_json = hash_response
        .json::<Value>()
        .await
        .map_err(|_| format!("Antwort konnte nicht gelesen werden"))?;
    let old_master_password_hash = user_json["master_password"].as_str().unwrap_or_default().to_string();
    let verification = verify_password(&masterpassword, &old_master_password_hash);
    verification.map_err(|e| format!("Login fehlgeschlagen: {}", e))?;
    
    
    // Cloud-Backend-Endpunkt
    let api_url="http://3.74.73.164:3000/user/login";
    let user_set= LoginRequest {
            user_name: username,
            master_password: old_master_password_hash,
        };
    // Anfrage absenden
    let response = client
        .post(api_url)
        .json(&user_set)
        .send()
        .await
        .map_err(|e| format!("Fehler beim Senden der Anfrage: {}", e))?;

    // Antwort prüfen
    let status = response.status();
    if !status.is_success() {
        return Ok(LoginResult {
            success: false,
            message: format!("Login fehlgeschlagen (HTTP {}): {}", status.as_u16(), status),
        });
    }


    let login_response: LoginResponse = response
        .json()
        .await
        .map_err(|e| format!("Antwort konnte nicht gelesen werden: {}", e))?;

        

    if let Some(token)=login_response.token {
        // Token im Speicher ablegen
        if let Ok(mut stored_token) = state.token.lock() {
            *stored_token = Some(token);
        } else {
            eprintln!("Warnung: Token konnte nicht in MemoryStore gespeichert werden!");
        }        
        
            let appdata = env::var("LOCALAPPDATA")
                .or_else(|_| env::var("USER"))
                .unwrap_or_else(|_| "Unbekannt".to_string());
            let path = format!("{}\\Buddy4Passes\\user_key_{}.txt", appdata, user_set.user_name);
            let bytes = fs::read(&path).map_err(|_| "Fehler beim Lesen!")?;
            let key = String::from_utf8(bytes).map_err(|_| "Fehler beim Konvertieren zu UTF-8!")?;
        
            // Key im Speicher ablegen
                if let Ok(mut stored_key) = state.key.lock() {
                    *stored_key = Some(key);
                } else {
                    eprintln!("Warnung: Key konnte nicht in MemoryStore gespeichert werden!");
                }

                if let Some(refresh_token) = login_response.refresh_token {
                    if let Ok(mut stored) = state.refresh_token.lock() {
                        *stored = Some(refresh_token);
                    }
                }

                
        Ok(LoginResult {
            success: true,
            message: format!("{} (Token gespeichert)", login_response.message),

        })
    } else {
        Ok(LoginResult {
            success: false,
            message: format!("{} (kein Token erhalten)", login_response.message),
        })
    }
}

