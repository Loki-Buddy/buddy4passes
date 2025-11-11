use serde::{Serialize, Deserialize};
use tauri::State;
use reqwest::Client;
use std::sync::Arc;
use serde_json::{Value, json};
use crate::crypt::crypt::CryptoError;
use crate::crypt::crypt::hash_password;
use crate::crypt::crypt::verify_password;

#[derive(Serialize, Deserialize)]
pub struct MasterData {
    #[serde(skip_serializing_if = "Option::is_none")]
    new_user_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    new_user_email: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    old_master_password: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    new_master_password: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    confirm_new_master_password: Option<String>,
}

#[tauri::command]
pub async fn change_master_creds(client: State<'_, Arc<Client>>, data: MasterData, user_name: String) -> Result<Value, String> {
    
    let user_response = client
        .get("http://3.74.73.164:3000/user/data")
        .json(&json!({"user_name": user_name}))
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json::<Value>()
        .await
        .map_err(|e| e.to_string())?;

    let old_master_password_hash = user_response["master_password"].as_str().unwrap_or_default().to_string();

    let result: Result<(), CryptoError> = if data
        .new_master_password
        .as_deref()
        .map(|s| !s.trim().is_empty())
        .unwrap_or(false)
    {
        if !data
            .confirm_new_master_password
            .as_deref()
            .map(|s| !s.trim().is_empty())
            .unwrap_or(false)
        {
            return Err("Bitte Bestätigung für das neue Passwort angeben.".to_string());
        }

        if data.new_master_password != data.confirm_new_master_password {
            return Err("Die neuen Passwörter stimmen nicht überein!".to_string());
        }

        if !data
            .old_master_password
            .as_deref()
            .map(|s| !s.trim().is_empty())
            .unwrap_or(false)
        {
            return Err("Altes Passwort erforderlich!".to_string());
        }

        verify_password(&data.old_master_password.as_ref().unwrap(), &old_master_password_hash)
    } else {
        Ok(())
    };

    result.map_err(|e| e.to_string())?;

    let hashed_new_master_password: Option<String> = if data
        .new_master_password
        .as_deref()
        .map(|s| !s.trim().is_empty())
        .unwrap_or(false)
    {
        Some(
            hash_password(data.new_master_password.as_ref().unwrap())
                .map_err(|e| e.to_string())?
        )
    } else {
        None
    };

    let request_data = json!({
        "new_user_name": data.new_user_name,
        "new_user_email": data.new_user_email,
        "new_master_password": hashed_new_master_password,
    });

    let token = "";

    let response = client
        .put("http://3.74.73.164:3000/user/chmastercreds")
        .header("Authorization", format!("Bearer {}", token))
        .json(&request_data)
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json::<Value>()
        .await
        .map_err(|e| e.to_string())?;

    Ok(response)
}