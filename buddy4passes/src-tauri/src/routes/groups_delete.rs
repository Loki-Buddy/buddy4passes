use tauri::State;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use crate::routes::user_login::MemoryStore;

#[derive(Serialize)]
struct DeleteGroupRequest {
    group_id: i32,
}

#[derive(Deserialize, Debug)]
struct GroupResponse {
    message: String,
}

#[derive(Serialize)]
pub struct GroupResult {
    pub success: bool,
    pub message: String,
}

#[tauri::command]
pub async fn delete_group(
    client: State<'_, Arc<Client>>,
    state: State<'_, Arc<MemoryStore>>,
    group_id: i32,
) -> Result<GroupResult, String> {

    // Token abrufen
    let token = state.token.lock().unwrap().clone().unwrap_or_default();

    // Der korrekte DELETE-Endpunkt
    let api_url = "http://3.74.73.164:3000/groups/delete";

    // JSON-Daten für das Backend
    let body = DeleteGroupRequest { group_id };

    // Anfrage senden
    let response = client
        .delete(api_url)
        .header("Authorization", format!("Bearer {}", token))
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Fehler beim Senden der Anfrage: {}", e))?;

    let status = response.status();

    // Fehler vom Backend abfangen
    if !status.is_success() {
        let error_text = response.text().await.unwrap_or_default();
        return Ok(GroupResult {
            success: false,
            message: format!(
                "Fehler beim Löschen der Gruppe (HTTP {}): {}",
                status.as_u16(),
                error_text
            ),
        });
    }

    // JSON-Antwort lesen
    let group_response: GroupResponse = response
        .json()
        .await
        .map_err(|_| "Antwort konnte nicht gelesen werden".to_string())?;

    Ok(GroupResult {
        success: true,
        message: group_response.message,
    })
}
