use serde::{Serialize, Deserialize};
use tauri::State;
use reqwest::Client;
use std::sync::Arc;
use serde_json::{json, Value};
use std::{env, fs};

use crate::routes::user_login::MemoryStore;

#[derive(Serialize, Deserialize)]
struct MyData {
    user_email: String,
}

#[tauri::command]
pub async fn delete_user(client: State<'_, Arc<Client>>, state: State<'_, Arc<MemoryStore>>, email: &str, username: &str) -> Result<Value, String> {
    let data = MyData {
        user_email: email.to_string(),
    };

    let token = state.token.lock().unwrap().clone().unwrap_or_default();

    let response = client
        .delete("http://3.74.73.164:3000/user/delete")
        .header("Authorization", format!("Bearer {}", token))
        .json(&data)
        .send()
        .await
        .map_err(|e| e.to_string())?;

 
    if response.status().is_success() {
        let appdata = env::var("LOCALAPPDATA")
            .or_else(|_| env::var("USER"))
            .unwrap_or_else(|_| "Unbekannt".to_string());
        
        let path = format!("{}\\Buddy4Passes\\user_key_{}.txt", appdata, username);
        fs::remove_file(path).expect("Failed to remove file");
    }
    else {
        return Ok(json!({"message": "Nutzer konnte nicht gelöscht werden"}));
    }

    let json = response
        .json::<Value>()
        .await
        .map_err(|e| format!("Failed to parse JSON response: {}", e))?;

    Ok(json)
}