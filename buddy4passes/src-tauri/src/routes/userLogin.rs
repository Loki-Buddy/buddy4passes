use tauri::State;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};

#[derive(Serialize)]
struct LoginRequest {
    user_name: String,
    master_password: String,
}

#[derive(Deserialize, Debug)]
struct LoginResponse {
    message: String,
    token: Option<String>,
}

// Token wird im RAM gespeichert
struct MemoryStore {
    token: Mutex<Option<String>>,
}

// Tauri command für den Login
#[tauri::command]
async fn login_user(
    state: State<'_, Arc<MemoryStore>>,
    user_name: String,
    master_password: String,
) -> Result<String, String> {
    let client=Client::new();

    // Cloud-Backend-Endpunkt
    let api_url="http://3.74.73.164:3000/user/login";

    // Anfrage absenden
    let response = client
        .post(api_url)
        .json(&LoginRequest {
            user_name,
            master_password,
        })
        .send()
        .await
        .map_err(|e| e.to_string())?;

    // Antwort prüfen
    if !response.status().is_success() {
        return Err(format!("Login fehlgeschlagen: {}", response.status()));
    }

    let login_response: LoginResponse=response
        .json()
        .await
        .map_err(|e| format!("Antwort konnte nicht gelesen werden: {}", e))?;

    if let Some(token)=login_response.token {
        // Token im Speicher ablegen
        let mut stored_token = state.token.lock().unwrap();
        *stored_token = Some(token.clone());

        Ok(format!("{} (Token im Speicher)", login_response.message))
    } else {
        Err("Kein Token erhalten".to_string())
    }
}

// Authentifizierte Anfrage mit Token
#[tauri::command]
async fn fetch_protected_resource(state: State<'_, Arc<MemoryStore>>) -> Result<String, String> {
    let token = {
        let stored = state.token.lock().unwrap();
        stored.clone()
    };

    let client = Client::new();
    let res = client
        .get("http://3.74.73.164:3000/user/protected")
        .bearer_auth(&token)
        .send()
        .await
        .map_err(|e| format!("Fehler bei Anfrage: {}", e))?;

    if res.status().is_success() {
        let body = res.text().awaot.map_err(|e| e.to_string())?;
        Ok(body)
    } else {
        Err(format!("Backend-Fehler: {}", res.status()))
    }
}

// App starten
fn main() {
    tauri::Builder::default()
        .manage(Arc::new(MemoryStore {
            token: Mutex::new(None),
        }))
        .invoke_handler(tauri::generate_handler![login_user, fetch_protected_resource])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}