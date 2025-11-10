use serde::{Deserialize, Serialize};
use std::fs;
use tauri::State;
use reqwest::Client;
use std::sync::Arc;
use std::env;
use serde_json::Value;
use crate::crypt::crypt::hash_password;
use crate::crypt::crypt::CryptoService;

pub fn create_and_save_key(file_path: &str) -> Result<(), std::io::Error> {
    // Erstelle neuen zufälligen CryptoService
    let crypto = CryptoService::new_random();
    // Hole den Schlüssel als Base64-String
    let key_base64 = crypto.get_key();
    // Speichere den Schlüssel in einer Datei
    fs::write(file_path, key_base64)?;
    Ok(())
}
#[derive(Clone, Deserialize, Serialize)]
struct NewUser {
    user_name: String,
    user_email: String,
    master_password: String,
}

#[tauri::command]
pub async fn register_user_test(
    client: State<'_, Arc<Client>>,
    name: String,
    email: String,
    masterpassword: String,
) -> Result<Value, String> {
    println!("test");
    let masterpw_str: &str = &masterpassword;
    let master_password_hash = hash_password(masterpw_str);

    let new_user = NewUser {
        user_name: name.to_string(),
        user_email: email.to_string(),
        master_password: master_password_hash.unwrap_or_default(),
    };

    let resp = client
        .post("http://3.74.73.164:3000/user/register")
        .json(&new_user)
        .send()
        .await
        .map_err(|e| format!("HTTP request failed: {}", e))?;

    if resp.status().is_success() {
        let appdata = env::var("LOCALAPPDATA")
        .or_else(|_| env::var("USER"))
        .unwrap_or_else(|_| "Unbekannt".to_string());
        fs::create_dir_all(&format!("{}\\Buddy4Passes", appdata)).expect("Failed to create directory");
        create_and_save_key(&format!("{}\\Buddy4Passes\\user_key_{}.txt", appdata, &new_user.user_name.as_str())).expect("Failed to create and save key");
    }
    let json = resp
    .json::<Value>()
    .await
    .map_err(|e| format!("Failed to parse JSON response: {}", e))?;
    
    Ok(json)
}