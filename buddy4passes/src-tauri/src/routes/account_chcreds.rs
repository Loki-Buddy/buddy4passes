use tauri::State;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use std::sync::{Arc};
use crate::routes::user_login::MemoryStore;
use crate::crypt::crypt::CryptoService;


#[derive(Serialize, Deserialize)]
pub struct AccountCredentialsResponse {
    #[serde(skip_serializing_if = "Option::is_none")]
    new_servicename: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    new_serviceemail: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    new_serviceusername: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    new_servicepassword: Option<String>,
}

#[tauri::command]
pub async fn change_account_creds(client: State<'_, Arc<Client>>, state: State<'_, Arc<MemoryStore>>, data: AccountCredentialsResponse, accountid: i64) -> Result<Value, String>  {

    // Token abrufen
    let token = state.token.lock().unwrap().clone().unwrap_or_default();

    // Key abrufen zum Verschlüsseln
    let key = state.key.lock().unwrap().clone().unwrap_or_default();

    // Verschlüsselung der Parameter
    let crypto = CryptoService::from_key(&key.as_str()).unwrap();
    
    let encrypted_email = data.new_serviceemail
        .as_ref()
        .map(|email| crypto.encrypt(email)
            .map_err(|e| format!("Fehler beim Verschlüsseln der E-Mail: {}", e)))
        .transpose()?;
    
    let encrypted_username = data.new_serviceusername
        .as_ref()
        .map(|username| crypto.encrypt(username)
            .map_err(|e| format!("Fehler beim Verschlüsseln des Benutzernamens: {}", e)))
        .transpose()?;
    
    let encrypted_password = data.new_servicepassword
        .as_ref()
        .map(|password| crypto.encrypt(password)
            .map_err(|e| format!("Fehler beim Verschlüsseln des Passworts: {}", e)))
        .transpose()?;

    // Anfrage an den Server senden
    let response = client
        .put("http://3.74.73.164:3000/account/edit")
        .header("Authorization", format!("Bearer {}", token))
        .json(&json!({"account_id": accountid, "service_name": data.new_servicename, "service_email": encrypted_email, "service_username": encrypted_username, "service_password": encrypted_password}))
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json::<Value>()
        .await
        .map_err(|e| e.to_string())?;

    Ok(response)
}