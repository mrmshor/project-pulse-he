// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::api::shell;

// פונקציה לפתיחת תיקיות
#[tauri::command]
fn open_folder(path: String) -> Result<(), String> {
    shell::open(&tauri::api::shell::Scope::default(), path, None)
        .map_err(|e| format!("Failed to open folder: {}", e))
}

// פונקציה לפתיחת WhatsApp
#[tauri::command] 
fn open_whatsapp(phone: String, message: Option<String>) -> Result<(), String> {
    let url = if let Some(msg) = message {
        format!("https://wa.me/{}?text={}", phone, urlencoding::encode(&msg))
    } else {
        format!("https://wa.me/{}", phone)
    };
    
    shell::open(&tauri::api::shell::Scope::default(), url, None)
        .map_err(|e| format!("Failed to open WhatsApp: {}", e))
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![open_folder, open_whatsapp])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
