use tauri::State;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};

#[derive(Serialize)]
struct AccountRequest {
    service: String,
    service_email: String,
    servcie_username: String,
    servcie_password: String,
}

#[derive(Deserialize, Debug)]
struct AccountResponse {
    message: String,
}

pub struct AccountResult {
    pub success: bool,
    pub message: String,
}

#[tauri::command]
pub async fn add_account(
    client: State<'_, Arc<Client>>,
    state: State<'_, Arc<MemoryStore>>,
    servicename: String,
    serviceemail: String,
    servcieusername: String,
    servciepassword: String,
) -> Result<AccountResult, String> {
    let client = Client::new();
    let api_url = "http://3.74.73.164:3000/account/add";

    // Token aus dem MemoryStore abrufen
    let token_guard = state.token.lock().map_err(|_| "Zugriff auf Token fehlgeschlagen")?;
    let token = token_guard.clone().ok_or("Kein gültiger Token gefunden. Bitte einloggen!")?;
    drop(token_guard);

    // Anfrage vorbereiten mit Auth-Header
    let response = client
        .post(api_url)
        .header("Authorization", format!("Bearer {}", token))
        .json(&AccountRequest {
            service,
            service_email,
            servcie_username,
            servcie_password,
        })
        .send()
        .await
        .map_err(|e| format!("Fehler beim Senden der Anfrage: {}", e))?;

    let status = response.status();
    let text = response.text().await.unwrap_or_default();

    // Antwort auswerten
    if !status.is_success() {
        return Ok(AccountResult {
            success: false,
            message: format!("Fehler beim Erstellen des Accounts (HTTP {}): {}", status, text),
        });
    }

    let account_response: AccountResponse = 
        serde_json::from_str(&text).unwrap_or(AccountResponse {
            message: "Antwort konnte nicht gelesen werden".into(),
        });
    
    Ok(AccountResult {
        success: true,
        message: account_response.message,
    })
}