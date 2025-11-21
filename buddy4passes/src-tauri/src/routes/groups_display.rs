use tauri::State;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use crate::routes::user_login::MemoryStore;

#[derive(Serialize, Deserialize, Debug)]
pub struct GroupItem {
    group_id: u32,
    group_name: String,
}

#[derive(Serialize)]
pub struct GroupResult {
    pub success: bool,
    pub message: String,
    pub groups: Option<Vec<GroupItem>>,
}

#[tauri::command]
pub async fn get_groups(
    client: State<'_, Arc<Client>>,
    state: State<'_, Arc<MemoryStore>>,
) -> Result<GroupResult, String> {

    // Token abrufen
    let token = state
        .token
        .lock()
        .unwrap()
        .clone()
        .unwrap_or_default();

    // GET Endpoint
    let api_url = "http://3.74.73.164:3000/groups";

    // Anfrage senden
    let response = client
        .get(api_url)
        .header("Authorization", format!("Bearer {}", token))
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
                "Fehler beim Abrufen der Gruppen (HTTP {}): {}",
                status.as_u16(),
                error_text
            ),
            groups: None,
        });
    }

    // JSON-Liste der Gruppen einlesen
    let groups: Vec<GroupItem> = response
        .json()
        .await
        .map_err(|_| "Antwort konnte nicht gelesen werden".to_string())?;

    Ok(GroupResult {
        success: true,
        message: "Gruppen erfolgreich abgerufen".to_string(),
        groups: Some(groups),
    })
}
