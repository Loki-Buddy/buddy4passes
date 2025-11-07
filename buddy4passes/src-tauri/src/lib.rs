mod crypt;
mod routes;

use reqwest::Client;
use std::sync::Arc;


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let client = Arc::new(Client::new());

    tauri::Builder::default()
        .manage(client)
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            routes::user_delete::delete_user,
            routes::account_display::display_accounts
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}