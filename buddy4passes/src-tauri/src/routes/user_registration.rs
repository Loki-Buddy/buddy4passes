use serde::{Deserialize, Serialize};

#[derive(Clone, Deserialize)]
pub struct NewUser {
    pub user_name: String,
    pub user_email: String,
    pub master_password: String,
}

#[derive(Serialize, Debug)]
pub struct SafeUser {
    pub user_name: String,
    pub user_email: String,
}

#[derive(Serialize, Debug)]
pub struct RegisterResponse {
    pub message: String,
    pub user: SafeUser,
}

#[tauri::command]
pub async fn register_user_remote(new_user: NewUser) -> Result<RegisterResponse, String> {
    // 1) Basis-URL aus Env (dev) oder Default
    let base_url = std::env::var("CLOUD_BASE_URL").unwrap_or_else(|_| "http://127.0.0.1:3000".to_string());
    let endpoint = format!("{}/user/register", base_url.trim_end_matches('/'));

    // 2) Clone, weil wir es in den blocking-Thread geben
    let payload = new_user.clone();

    // 3) spawn_blocking um die blocking reqwest-API zu verwenden ohne den async runtime thread zu blocken
    let result = tauri::async_runtime::spawn_blocking(move || {
        let client = reqwest::blocking::Client::new();
        // Send POST JSON
        let resp = client.post(&endpoint)
            .json(&payload)
            .send()
            .map_err(|e| format!("HTTP request failed: {}", e))?;

        let status = resp.status();
        if !status.is_success() {
            // versuche die Fehlernachricht aus dem Body zu lesen
            let text = resp.text().unwrap_or_else(|_| format!("HTTP {}", status));
            return Err(format!("Remote error: {}", text));
        }

        // Parse JSON-Response
        let json_val: serde_json::Value = resp.json()
            .map_err(|e| format!("Failed to parse JSON response: {}", e))?;

        Ok(json_val)
    }).await.map_err(|e| format!("Task join error: {}", e))?;

    // 4) Convertiere die JSON-Antwort in den lokalen Typ
    let json = result.map_err(|s| s)?;

    // Erwartete Struktur: { message: string, user: { user_name, user_email } }
    let message = json.get("message")
        .and_then(|m| m.as_str())
        .ok_or_else(|| "Missing `message` in response".to_string())?
        .to_string();

    let user_obj = json.get("user").and_then(|u| u.as_object())
        .ok_or_else(|| "Missing `user` object in response".to_string())?;

    let user_name = user_obj.get("user_name").and_then(|v| v.as_str()).unwrap_or("").to_string();
    let user_email = user_obj.get("user_email").and_then(|v| v.as_str()).unwrap_or("").to_string();

    Ok(RegisterResponse {
        message,
        user: SafeUser { user_name, user_email },
    })
}