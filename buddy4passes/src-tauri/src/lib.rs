mod crypt;
mod routes;

use reqwest::Client;
use std::sync::{Arc, Mutex};
use routes::user_login::MemoryStore;


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let client = Arc::new(Client::new());
    let token = Arc::new(MemoryStore {token: Mutex::new(None)});
    tauri::Builder::default()
        .manage(client)
        .manage(token)
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            routes::user_delete::delete_user,
            routes::user_registration::register_user_test,
            routes::user_login::login_user
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}