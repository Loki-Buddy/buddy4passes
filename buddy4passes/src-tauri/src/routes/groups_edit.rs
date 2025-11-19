use serde_json::Value;
use tauri::State;
use reqwest::Client;
use serde_json::json;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use crate::routes::user_login::MemoryStore;


#[derive(Deserialize, Serialize)]
pub struct Group {
    group_id: i32,
    new_group_name: String,
}

#[tauri::command]
pub async fn edit_group(
    client: State<'_, Arc<Client>>,
    state: State<'_, Arc<MemoryStore>>,
    group: Group,
) -> Result<Value, String> {
    // Token abrufen
    let token = state.token.lock().unwrap().clone().unwrap_or_default();

    let response = client
    .put("http://3.74.73.164:3000/groups/edit")
    .header("Authorization", format!("Bearer {}", token))
    .json(&group)
    .send()
    .await
    .map_err(|e| format!("Fehler beim Senden der Anfrage: {}", e))?;
    
    if !response.status().is_success() {
        return Ok(json!({"message" : "Gruppenname konnte nicht geaendert werden"}));
    }
    
    let response = response
    .json::<Value>()
    .await
    .map_err(|e| format!("Fehler beim Parsen der Antwort: {}", e))?;
    
    Ok(response)
}