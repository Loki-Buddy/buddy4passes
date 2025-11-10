use serde::{Deserialize, Serialize};
use tauri::State;
use reqwest::Client;
use std::sync::Arc;
use serde_json::Value;
use crate::crypt::crypt::hash_password;
use crate::crypt::crypt;

let test = CryptoService::new_random();

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


    let json = resp
        .json::<Value>()
        .await
        .map_err(|e| format!("Failed to parse JSON response: {}", e))?;


    Ok(json)
}