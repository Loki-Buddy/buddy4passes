use tauri::State;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};

#[derive(Serialize)]
struct LoginRequest {
    user_name: String,
    master_password: String,
}

#[derive(Deserialize, Debug)]
struct LoginResponse {
    message: String,
    token: Option<String>,
}

// Token wird im RAM gespeichert
pub struct MemoryStore {
    pub token: Mutex<Option<String>>,
}

// Tauri command für den Login
#[tauri::command]
pub async fn login_user(
    state: State<'_, Arc<MemoryStore>>,
    user_name: String,
    master_password: String,
) -> Result<String, String> {
    let client = Client::new();

    // Cloud-Backend-Endpunkt
    let api_url="http://3.74.73.164:3000/user/login";

    // Anfrage absenden
    let response = client
        .post(api_url)
        .json(&LoginRequest {
            user_name,
            master_password,
        })
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

    let login_response: LoginResponse=response
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

