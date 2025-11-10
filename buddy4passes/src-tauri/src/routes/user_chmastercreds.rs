use serde::{Serialize, Deserialize};
use tauri::State;
use reqwest::Client;
use std::sync::Arc;
use serde_json::{Value, json};
use crate::crypt::crypt::CryptoService;  // Importiere CryptoService

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
pub async fn change_master_creds(client: State<'_, Arc<Client>>, data: MasterData) -> Result<Value, String> {
    // Prüfe ob das alte Passwort richtig ist
    let user_data = client
        .get("http://3.74.73.164:3000/user/data")
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json::<Value>()
        .await
        .map_err(|e| e.to_string())?;

    println!("user_data: {}", user_data["master_password"].as_str().unwrap());

    let test = CryptoService::verify_password(&data.old_master_password.clone().unwrap(), &user_data["master_password"].as_str().unwrap()).is_err();
    
    println!("test: {}", test);

    if test {
        return Err("Falsches Passwort!".to_string());
    }

    // Erst prüfen ob die Passwörter übereinstimmen
    if let (Some(new_pass), Some(confirm_pass)) = (&data.new_master_password, &data.confirm_new_master_password) {
        if new_pass != confirm_pass {
            return Err("Die neuen Passwörter stimmen nicht überein!".to_string());
        }
    }

    // Hash die neuen Passwörter
    let new_master_password_hash = match &data.new_master_password {
        Some(pass) => Some(CryptoService::hash_password(pass).map_err(|e| e.to_string())?),
        None => None
    };

    // Erstelle das JSON-Objekt mit den gehashten Passwörtern
    let request_data = json!({
        "new_user_name": data.new_user_name,
        "new_user_email": data.new_user_email,
        "old_master_password": data.old_master_password,
        "new_master_password": new_master_password_hash,
        //"confirm_new_master_password": data.confirm_new_master_password,
    });

    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMywiaWF0IjoxNzYyNzc5NTMwLCJleHAiOjE3NjI3Nzk4MzB9.FnjVeeTvimIMmwFJNB35kjy3lch9PDfdnsbSm7DWOWk";
    
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