use tauri::State;
use reqwest::Client;
use serde::{Deserialize, Serialize};
// use serde_json::Value;
use std::sync::{Arc};
use crate::routes::user_login::MemoryStore;
use crate::crypt::crypt::CryptoService;

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
    servicename: String,
    serviceemail: String,
    serviceusername: String,
    servicepassword: String,
) -> Result<AccountResult, String> {

    // Token abrufen
    let token = state.token.lock().unwrap().clone().unwrap_or_default();

    // Key abrufen zum Verschlüsseln
    let key = state.key.lock().unwrap().clone().unwrap_or_default();

    // Verschlüsselung der Parameter
    let crypto = CryptoService::from_key(&key.as_str()).unwrap();
    let encrypted_email = crypto.encrypt(&serviceemail)
        .map_err(|e| format!("Fehler beim Verschlüsseln des Passworts: {}", e))?;
    let encrypted_username = crypto.encrypt(&serviceusername)
        .map_err(|e| format!("Fehler beim Verschlüsseln des Passworts: {}", e))?;
    let encrypted_password = crypto.encrypt(&servicepassword)
        .map_err(|e| format!("Fehler beim Verschlüsseln des Passworts: {}", e))?;


    // API-Endpunkt
    let api_url = "http://3.74.73.164:3000/account/add";

    // Anfrage-Rumpf
    let account_data = AccountRequest {
        service: servicename,
        service_email: encrypted_email,
        service_username: encrypted_username,
        service_password: encrypted_password,
    };

    // Anfrage absenden
    let response = client
        .post(api_url)
        .header("Authorization", format!("Bearer {}", token))
        .json(&account_data)
        .send()
        .await
        .map_err(|e| format!("Fehler beim Senden der Anfrage: {}", e))?;

    let status = response.status();

    if !status.is_success() {
        let error_text = response.text().await.unwrap_or_default();
        return Ok(AccountResult {
            success: false,
            message: format!("Fehler beim Erstellen des Accounts (HTTP {}): {}", status.as_u16(), error_text),
        });
    }

    // Account auswerten
    let account_response: AccountResponse = response
        .json()
        .await
        .map_err(|_| "Antwort konnte nicht gelesen werden".to_string())?;

    Ok(AccountResult {
        success: true,
        message: account_response.message,
    })
}