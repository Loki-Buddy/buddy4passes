mod crypt;
mod routes;

use reqwest::Client;
use std::sync::{Arc, Mutex};
use routes::user_login::MemoryStore;


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let client = Arc::new(Client::new());
    let token = Arc::new(MemoryStore {token: Mutex::new(None), key: Mutex::new(None), refresh_token: Mutex::new(None)});
    tauri::Builder::default()
        .manage(client.clone())
        .manage(token.clone())
        .plugin(tauri_plugin_opener::init())
        .setup(move |_| {
            let client_clone = client.clone();
            let state_clone = token.clone();

            tauri::async_runtime::spawn(async move {
                loop {
                    tokio::time::sleep(std::time::Duration::from_secs(240)).await;

                    let refresh_token = {
                        state_clone.refresh_token.lock().unwrap().clone()
                    };

                    let Some(refresh_token) = refresh_token else {
                        continue;
                    };

                    let response = client_clone
                        .post("http://3.74.73.164:3000/user/refresh")
                        .json(&serde_json::json!({ "refresh_token": refresh_token }))
                        .send()
                        .await;

                    if let Ok(resp) = response {
                        if resp.status().is_success() {
                            if let Ok(json) = resp.json::<serde_json::Value>().await {
                                if let Some(new_token) = json["token"].as_str() {
                                    *state_clone.token.lock().unwrap() =
                                        Some(new_token.to_string());
                                }
                            }
                        }
                    }
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            routes::user_delete::delete_user,
            routes::account_display::display_accounts,
            routes::user_chmastercreds::change_master_creds,
            routes::user_registration::register_user_test,
            routes::user_login::login_user,
            routes::account_add::add_account,
            routes::account_chcreds::change_account_creds,
            routes::account_delete::delete_account,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}