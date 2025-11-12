use tauri::State;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::sync::{Arc, Mutex};
use crate::commands::login::MemoryStore;
use crate::crypt::crypt::encrypt_text;

#[derive(Serialize)]
struct AccountRequest {
    service: String,
    service_email: String,
    service_username: String,
    service_password: String, // soll verschlüsselt gesendet werden
}

#[derive(Deserialize, Debug)]
struct AccountResponse {
    message: String,
}

#[derive(Serialize)]
pub struct AccountResult {
    pub success: bool,
    pub message: String,
}

// Account hinzufügen
#[tauri::command]
pub async fn add_account(
    client: State<'_, Arc<Client>>,
    state: State<'_, Arc<MemoryStore>>,
    service: String,
    service_email: String,
    service_username: String,
    service_password: String,
) -> Result<AccountResult, String> {

    // Token abrufen
    let token_guard = state
        .token
        .lock()
        .map_err(|_| "Kein Zugriff auf Token")?;
    let token = token_guard
        .clone()
        .ok_or("Kein gültiger Token gefunden. Bitte einloggen!")?;
    drop(token_guard);

    // Key abrufen zum Verschlüsseln
    let key_guard = state
        .key
        .lock()
        .map_err(|_| "Zugriff auf Key fehlgeschlagen")?;
    let key = key_guard
        .clone()
        .ok_or("kein gültiger Schlüssel gefunden. Bitte einloggen!")?;
    drop(key_guard);

    // Passwort verschlüsseln
    let encrypted_password = encrypt_text(&service_password, &key)
        .map_err(|_| format!("Fehler beim Verschlüsseln des Passworts: {}", e))?;

    // API-Endpunkt
    let api_url = "http://3.74.73.164:3000/account/add";

    let account_data = AccountRequest {
        service,
        service_email,
        service_username,
        service_password: encrypted_password,
    };
}