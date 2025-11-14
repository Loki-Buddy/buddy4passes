use tauri::State;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use crate::routes::user_login::MemoryStore;

#[derive(Serialize)]
struct DeleteAccountRequest {
    account_id: i32,
}

#[derive(Deserialize, Debug)]
struct DeleteAccountResponse {
    message: String,
}

#[derive(Serialize)]
pub struct DeleteAccountResult {
    pub success: bool,
    pub message: String,
}

// Einzel-Account löschen
#[tauri::command]
pub async fn delete_account(
    client: State<'_, Arc<Client>>,
    state: State<'_, Arc<MemoryStore>>,
    accountid: i32,
) -> Result<DeleteAccountResult, String> {

    // Token abrufen
    let token = state.token.lock().unwrap().clone().unwrap_or_default();

    // API-Endpunkt
    let api_url = "http://3.74.73.164:3000/account/delete";

    // Anfrage-Rumpf
    let delete_data = DeleteAccountRequest { account_id: accountid };

    // DELETE absenden mit JSON-Body
    let response = client
        .delete(api_url)
        .header("Authorization", format!("Bearer {}", token))
        .json(&delete_data)
        .send()
        .await
        .map_err(|e| format!("Fehler beim Senden der Anfrage: {}", e))?;

    let status = response.status();

    if !status.is_success() {
        return Ok(DeleteAccountResult {
            success: false,
            message: format!(
                "Fehler beim Löschen des Accounts",
            ),
        });
    }

    // Antwort auswerten
    let delete_response: DeleteAccountResponse = response
        .json()
        .await
        .map_err(|_| "Antwort konnte nicht gelesen werden".to_string())?;

    Ok(DeleteAccountResult {
        success: true,
        message: delete_response.message,
    })
}