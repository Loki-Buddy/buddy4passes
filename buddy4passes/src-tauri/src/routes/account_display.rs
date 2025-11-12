use tauri::State;
use reqwest::Client;
use std::sync::Arc;
use serde_json::Value;

use crate::routes::user_login::MemoryStore;

#[tauri::command]
pub async fn display_accounts(client: State<'_, Arc<Client>>,  state: State<'_, Arc<MemoryStore>>) -> Result<Value, String> {

    let token = state.token.lock().unwrap().clone().unwrap_or_default();

    let response = client
        .get("http://3.74.73.164:3000/accounts")
        .header("Authorization", format!("Bearer {}", token))
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json::<Value>()
        .await
        .map_err(|e| e.to_string())?;

    Ok(response)
}