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
                        let rt = state_clone.refresh_token.lock().unwrap().clone();
                        rt
                    };

                    let Some(refresh_token) = refresh_token else {
                        continue;
                    };

                    println!("[REFRESH LOOP] Sende Refresh-Request...");

                    let response = client_clone
                        .post("http://3.74.73.164:3000/user/refresh")
                        .json(&serde_json::json!({ "refresh_token": refresh_token }))
                        .send()
                        .await;

                    match response {
                        Ok(resp) => {

                            if resp.status().is_success() {
                                match resp.json::<serde_json::Value>().await {
                                    Ok(json) => {
                                        println!("[REFRESH LOOP] Server-Antwort JSON: {}", json);

                                        if let Some(new_token) = json["token"].as_str() {
                                            println!("[REFRESH LOOP] Neuer Token erhalten: {}", new_token);

                                            {
                                                let mut token_lock = state_clone.token.lock().unwrap();
                                                *token_lock = Some(new_token.to_string());
                                            }

                                        }
                                    }
                                    Err(e) => {
                                        println!("[REFRESH LOOP] Fehler beim Lesen von JSON: {}", e);
                                    }
                                }
                            } else {
                                println!("[REFRESH LOOP] Server hat Fehler zurückgegeben!");
                            }
                        }
                        Err(e) => {
                            println!("[REFRESH LOOP] Netzwerkfehler: {}", e);
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
            routes::groups_add::add_group,
            routes::groups_display::get_groups,
            routes::groups_edit::edit_group,
            routes::groups_delete::delete_group,
            routes::user_fetchdataauth::fetch_data,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}