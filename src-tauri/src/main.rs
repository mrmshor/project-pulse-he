// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn open_folder_dialog() -> Result<Option<String>, String> {
    use tauri::api::dialog::FileDialogBuilder;
    
    let folder = FileDialogBuilder::new()
        .pick_folder();
        
    match folder {
        Some(path) => Ok(Some(path.to_string_lossy().to_string())),
        None => Ok(None)
    }
}

#[tauri::command] 
async fn open_url(url: String) -> Result<(), String> {
    tauri::api::shell::open(&tauri::Env::default(), &url, None)
        .map_err(|e| format!("Failed to open URL: {}", e))?;
    Ok(())
}

#[tauri::command]
async fn open_email(email: String, subject: Option<String>) -> Result<(), String> {
    let mut mailto = format!("mailto:{}", email);
    if let Some(subj) = subject {
        mailto.push_str(&format!("?subject={}", urlencoding::encode(&subj)));
    }
    
    tauri::api::shell::open(&tauri::Env::default(), &mailto, None)
        .map_err(|e| format!("Failed to open email: {}", e))?;
    Ok(())
}

#[tauri::command]
async fn open_whatsapp(phone: String, message: Option<String>) -> Result<(), String> {
    let clean_phone = phone.replace(['+', '-', ' '], "");
    let mut whatsapp_url = format!("https://wa.me/{}", clean_phone);
    
    if let Some(msg) = message {
        whatsapp_url.push_str(&format!("?text={}", urlencoding::encode(&msg)));
    }
    
    tauri::api::shell::open(&tauri::Env::default(), &whatsapp_url, None)
        .map_err(|e| format!("Failed to open WhatsApp: {}", e))?;
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .setup(|_app| {
            println!("App is starting...");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            open_folder_dialog,
            open_url,
            open_email,
            open_whatsapp
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
