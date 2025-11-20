use tauri::State;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use crate::routes::user_login::MemoryStore;

#[derive(Serialize)]
struct GroupRequest {
    group_name: String,
}

#[derive(Deserialize, Debug)]
struct GroupResponse {
    message: String,
    #[serde(default)]
    group_id: Option<i64>,  // <- Optional, falls Server es nicht liefert
}

#[derive(Serialize)]
pub struct GroupResult {
    pub success: bool,
    pub message: String,
    pub group_id: Option<i64>
}

#[tauri::command]
pub async fn add_group(
    client: State<'_, Arc<Client>>,
    state: State<'_, Arc<MemoryStore>>,
    groupname: String,
) -> Result<GroupResult, String> {

    // Token abrufen
    let token = state.token.lock().unwrap().clone().unwrap_or_default();

    // API-Endpunkt für Gruppen
    let api_url = "http://3.74.73.164:3000/groups/add";

    // JSON-Daten für Cloud-Backend
    let group_data = GroupRequest {
        group_name: groupname,
    };

    // Anfrage senden
    let response = client
        .post(api_url)
        .header("Authorization", format!("Bearer {}", token))
        .json(&group_data)
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
                "Fehler beim Erstellen der Gruppe (HTTP {}): {}",
                status.as_u16(),
                error_text
            ),
            group_id: None,
        });
    }

    // Rohantwort auslesen und loggen
    let body = response.text().await.unwrap_or_default();
    println!("Server-Antwort: {}", body);

    // JSON-Antwort parsen
    let group_response: GroupResponse = serde_json::from_str(&body)
        .map_err(|e| format!("Parse-Fehler: {}. Rohdaten: {}", e, body))?;
    
    Ok(GroupResult {
        success: true,
        message: group_response.message,
        group_id: group_response.group_id,  // <- Kann jetzt None sein
    })
}
