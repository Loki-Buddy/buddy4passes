use aes_gcm::aead::rand_core::le;
use tauri::State;
use reqwest::Client;
use std::sync::Arc;
use serde_json::{Value, json};

use crate::routes::user_login::MemoryStore;
use crate::crypt::crypt::CryptoService;

#[tauri::command]
pub async fn display_accounts(
    client: State<'_, Arc<Client>>,
    state: State<'_, Arc<MemoryStore>>,
) -> Result<Value, String> {

    let token = state.token.lock().unwrap().clone().unwrap_or_default();


    let response = client
        .get("http://3.74.73.164:3000/accounts")
        .header("Authorization", format!("Bearer {}", token))
        .send()
        .await
        .map_err(|e| e.to_string())?;

        if !response.status().is_success() {
        let msg_json = response.json::<Value>().await.map_err(|e| e.to_string())?;
        return Ok(msg_json);
    }


        let response = response.json::<Value>()
        .await
        .map_err(|e| e.to_string())?;


    let key = state.key.lock().unwrap().clone().unwrap_or_default();
    let crypto = CryptoService::from_key(&key.as_str())
        .map_err(|e| format!("Fehler beim Erstellen des CryptoService: {}", e))?;

    let accounts = response.as_array().ok_or("Response ist kein Array")?;


    let decrypted_accounts: Vec<Value> = accounts
        .iter()
        .map(|acc| {
            let service = acc["service"].as_str().unwrap_or_default().to_string();
            let account_id = acc["account_id"].as_i64().unwrap_or_default();

            let decrypted_email = acc["service_email"]
                .as_str()
                .and_then(|v| crypto.decrypt(v).ok())
                .unwrap_or_default();

            let decrypted_username = acc["service_username"]
                .as_str()
                .and_then(|v| crypto.decrypt(v).ok())
                .unwrap_or_default();

            let decrypted_password = acc["service_password"]
                .as_str()
                .and_then(|v| crypto.decrypt(v).ok())
                .unwrap_or_default();

            let group_id = acc["group_id"].as_u64().unwrap_or_default();

            json!({
                "account_id": account_id,
                "service": service,
                "service_email": decrypted_email,
                "service_username": decrypted_username,
                "service_password": decrypted_password,
                "group_id": group_id
            })
        })
        .collect();

    Ok(Value::Array(decrypted_accounts))
}
