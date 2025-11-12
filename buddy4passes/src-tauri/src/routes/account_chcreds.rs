use tauri::State;
use reqwest::Client;
use serde::{Deserialize, Serialize};
// use serde_json::Value;
use std::sync::{Arc};
use crate::routes::user_login::MemoryStore;
use crate::crypt::crypt::CryptoService;


#[derive(Serialize)]
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

