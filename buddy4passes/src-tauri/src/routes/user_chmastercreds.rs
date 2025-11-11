use serde::{Serialize, Deserialize};
use tauri::State;
use reqwest::Client;
use std::sync::Arc;
use serde_json::{Value, json};
use crate::crypt::crypt::CryptoError;
use crate::crypt::crypt::hash_password;
use crate::crypt::crypt::verify_password;

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
pub async fn change_master_creds(client: State<'_, Arc<Client>>, data: MasterData, user_name: String) -> Result<Value, String> {
    
    // Rufe die aktuellen Benutzerdaten vom Server ab, um den gespeicherten Master-Passwort-Hash zu erhalten
    let user_response = client
        .get("http://3.74.73.164:3000/user/data")
        .json(&json!({"user_name": user_name}))
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json::<Value>()
        .await
        .map_err(|e| e.to_string())?;

    // Extrahiere den Argon2-Hash des aktuellen Master-Passworts aus der Serverantwort
    let old_master_password_hash = user_response["master_password"].as_str().unwrap_or_default().to_string();

    // Validiere die Eingabedaten und verifiziere das alte Passwort, falls ein neues Passwort angegeben wurde
    let result: Result<(), CryptoError> = if data
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
            return Err("Bitte Bestätigung für das neue Passwort angeben.".to_string());
        }

        // Vergleiche das neue Passwort mit der Bestätigung (Klartext)
        if data.new_master_password != data.confirm_new_master_password {
            return Err("Die neuen Passwörter stimmen nicht überein!".to_string());
        }

        // Prüfe, ob das alte Passwort angegeben und nicht leer ist
        if !data
            .old_master_password
            .as_deref()
            .map(|s| !s.trim().is_empty())
            .unwrap_or(false)
        {
            return Err("Altes Passwort erforderlich!".to_string());
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

    // Setze den JWT-Token für die Authentifizierung (sollte aus dem Kontext kommen)
    let token = "";

    // Sende die Änderungen an den Server und erhalte die Bestätigung als JSON zurück
    let response = client
        .put("http://3.74.73.164:3000/user/chmastercreds")
        .header("Authorization", format!("Bearer {}", token))
        .json(&request_data)
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json::<Value>()
        .await
        .map_err(|e| e.to_string())?;

    // Gebe die Serverantwort an den Client zurück
    Ok(response)
}