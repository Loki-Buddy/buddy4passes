use serde::{Serialize, Deserialize};
use tauri::State;
use reqwest::Client;
use std::sync::Arc;
use serde_json::Value;

#[derive(Serialize, Deserialize)]
struct MyData {
    user_email: String,
}

#[tauri::command]
pub async fn delete_user(client: State<'_, Arc<Client>>, email: &str) -> Result<Value, String> {
    let data = MyData {
        user_email: email.to_string(),
    };

    let token = "";

    let response = client
        .delete("http://3.74.73.164:3000/user/delete")
        .header("Authorization", format!("Bearer {}", token))
        .json(&data)
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json::<Value>()
        .await
        .map_err(|e| e.to_string())?;

    Ok(response)
}