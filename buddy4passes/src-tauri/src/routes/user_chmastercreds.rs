use serde::{Serialize, Deserialize};
use tauri::State;
use reqwest::Client;
use std::sync::Arc;
use serde_json::Value;

#[derive(Serialize, Deserialize)]
pub struct MasterData {
    new_user_name: String,
    new_user_email: String,
    old_master_password: String,
    new_master_password: String,
    confirm_new_master_password: String,
}

#[tauri::command]
pub async fn change_master_creds(client: State<'_, Arc<Client>>, data: MasterData) -> Result<Value, String> {
    let data = MasterData {
        new_user_name: data.new_user_name.to_string(),
        new_user_email: data.new_user_email.to_string(),
        old_master_password: data.old_master_password.to_string(),
        new_master_password: data.new_master_password.to_string(),
        confirm_new_master_password: data.confirm_new_master_password.to_string(),
    };
    
    let token = "";
    
    let response = client
        .put("http://3.74.73.164:3000/user/chmastercreds")
        .json(&data)
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json::<Value>()
        .await
        .map_err(|e| e.to_string())?;

    Ok(response)
}