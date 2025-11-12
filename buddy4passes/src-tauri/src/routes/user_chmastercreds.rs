use serde::{Serialize, Deserialize};
use tauri::State;
use reqwest::Client;
use std::sync::Arc;
use std::fs;
use std::env;
use serde_json::{Value, json};
use crate::crypt::crypt::Cryptomessage;
use crate::crypt::crypt::hash_password;
use crate::crypt::crypt::verify_password;
use crate::routes::user_login::MemoryStore;

#[derive(Serialize, Deserialize)]
pub struct MasterData {
    #[serde(skip_serializing_if = "Option::is_none")]
    new_user_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    new_user_email: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    old_master_password: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    new_master_password: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    confirm_new_master_password: Option<String>,
}

#[tauri::command]
pub async fn change_master_creds(client: State<'_, Arc<Client>>,state: State<'_, Arc<MemoryStore>>, data: MasterData, username: String) -> Result<Value, String> {
    // Rufe die aktuellen Benutzerdaten vom Server ab - mit Query-Parameter statt JSON-Body
    let user_response = client
        .get("http://3.74.73.164:3000/user/data")
        .query(&[("user_name", &username)])
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json::<Value>()
        .await
        .map_err(|e| e.to_string())?;
    
    // Nur prüfen, wenn ein neuer Benutzername angegeben wurde
    if let Some(new_name) = &data.new_user_name {
        let existing_user = client
            .get("http://3.74.73.164:3000/user/data")
            .query(&[("user_name", new_name)])
            .send()
            .await
            .map_err(|e| e.to_string())?;

            if existing_user.status().is_success() {
                return Ok(json!({"message": "Benutzername bereits vergeben."}));    
            }

            let _existing_user = existing_user
                .json::<Value>()
                .await
                .map_err(|e| e.to_string())?;
    }
    
    // Validierung für neue Email-Adresse
    if let Some(new_email) = &data.new_user_email {
        let existing_email_user = client
            .get("http://3.74.73.164:3000/user/data")
            .query(&[("user_email", new_email)])
            .send()
            .await
            .map_err(|e| e.to_string())?
            .json::<Value>()
            .await
            .map_err(|e| e.to_string())?;

        // Wenn die neue Email bereits existiert → Fehler
        if !existing_email_user["user_email"].is_null() && existing_email_user["user_email"].as_str().unwrap_or("") != user_response["user_email"].as_str().unwrap_or("") {
            return Ok(json!({"message": "Es existiert bereits ein Account mit dieser Email."}));
        }
    }

    // Extrahiere den Argon2-Hash des aktuellen Master-Passworts aus der Serverantwort
    let old_master_password_hash = user_response["master_password"].as_str().unwrap_or_default().to_string();

    // Validiere die Eingabedaten und verifiziere das alte Passwort, falls ein neues Passwort angegeben wurde
    let result: Result<(), Cryptomessage> = if data
        .new_master_password
        .as_deref()
        .map(|s| !s.trim().is_empty())
        .unwrap_or(false)
    {
        // Prüfe, ob die Passwort-Bestätigung gesetzt und nicht leer ist
        if !data
            .confirm_new_master_password
            .as_deref()
            .map(|s| !s.trim().is_empty())
            .unwrap_or(false)
        {
            return Ok(json!({"message": "Bitte Bestätigung für das neue Passwort angeben."}));
        }

        // Vergleiche das neue Passwort mit der Bestätigung (Klartext)
        if data.new_master_password != data.confirm_new_master_password {
            return Ok(json!({"message": "Die neuen Passwörter stimmen nicht überein!"}));
        }

        // Prüfe, ob das alte Passwort angegeben und nicht leer ist
        if !data
            .old_master_password
            .as_deref()
            .map(|s| !s.trim().is_empty())
            .unwrap_or(false)
        {
            return Ok(json!({"message" : "Altes Passwort erforderlich!"}));
        }

        // Verifiziere das alte Passwort gegen den gespeicherten Hash (Argon2-Vergleich)
        verify_password(&data.old_master_password.as_ref().unwrap(), &old_master_password_hash)
    } else {
        // Falls kein neues Passwort angegeben wurde, überspringe Validierungen
        Ok(())
    };

    // Gebe einen Fehler zurück, falls verify_password fehlschlagen ist
    result.map_err(|e| e.to_string())?;

    // Hashe das neue Master-Passwort mit Argon2, falls eines angegeben wurde
    let hashed_new_master_password: Option<String> = if data
        .new_master_password
        .as_deref()
        .map(|s| !s.trim().is_empty())
        .unwrap_or(false)
    {
        // Berechne den Argon2-Hash und konvertiere Fehler in String
        Some(
            hash_password(data.new_master_password.as_ref().unwrap())
                .map_err(|e| e.to_string())?
        )
    } else {
        // Falls kein neues Passwort, setze den Wert auf None
        None
    };

    // Konstruiere das JSON-Objekt für den PUT-Request an den Server
    let request_data = json!({
        "new_user_name": data.new_user_name,
        "new_user_email": data.new_user_email,
        "new_master_password": hashed_new_master_password,
    });


    let token = state.token.lock().unwrap().clone().unwrap_or_default();


    // Sende die Änderungen an den Server und erhalte die Bestätigung als JSON zurück
    let response = client
        .put("http://3.74.73.164:3000/user/chmastercreds")
        .header("Authorization", format!("Bearer {}", token))
        .json(&request_data)
        .send()
        .await
        .map_err(|e| e.to_string())?;

        if request_data["new_user_name"].as_str() != None {
            let appdata = env::var("LOCALAPPDATA")
            .or_else(|_| env::var("USER"))
            .unwrap_or_else(|_| "Unbekannt".to_string());
            fs::rename(&format!("{}\\Buddy4Passes\\user_key_{}.txt", appdata, user_response["user_name"].as_str().unwrap_or("")), &format!("{}\\Buddy4Passes\\user_key_{}.txt", appdata, data.new_user_name.expect("Empty String").as_str())).expect("Failed to rename file");
        }

    let response = response.json::<Value>()
        .await
        .map_err(|e| e.to_string())?;
    
    // Gebe die Serverantwort an den Client zurück
    Ok(response)
}