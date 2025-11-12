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
pub async fn change_account_creds(client: State<'_, Arc<Client>>, state: State<'_, Arc<MemoryStore>>, data: AccountCredentialsResponse, userid: i32) -> Result<Value, String>  {
    Ok(("").into())
}