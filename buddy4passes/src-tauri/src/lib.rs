mod crypt;
mod routes;

use reqwest::Client;
use std::sync::{Arc, Mutex};
use routes::user_login::MemoryStore;


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let client = Arc::new(Client::new());
    let token = Arc::new(MemoryStore {token: Mutex::new(None), key: Mutex::new(None)});
    tauri::Builder::default()
        .manage(client)
        .manage(token)
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            routes::user_delete::delete_user,
            routes::account_display::display_accounts,
            routes::user_chmastercreds::change_master_creds,
            routes::user_registration::register_user_test,
            routes::user_login::login_user,
            routes::account_add::add_account,
            routes::account_chcreds::change_account_creds,
            routes::account_delete::delete_account,
            routes::groups_add::add_group,
            routes::groups_edit::edit_group,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}