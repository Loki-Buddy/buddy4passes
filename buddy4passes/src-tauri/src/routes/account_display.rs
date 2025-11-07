use tauri::State;
use reqwest::Client;
use std::sync::Arc;
use serde_json::Value;

#[tauri::command]
pub async fn display_accounts(client: State<'_, Arc<Client>>) -> Result<Value, String> {

    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo4LCJpYXQiOjE3NjI1Mjc0MjgsImV4cCI6MTc2MjUyNzcyOH0.w3WwEoFYN9_5s7ZLmz3p0bDK34gDPYslgBxv6wQmElE";

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