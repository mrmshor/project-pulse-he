// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_plugin_opener::OpenerExt;  // 🆕 במקום tauri::api::shell

// 📁 פונקציה לפתיחת תיקיות במערכת
#[tauri::command]
async fn open_folder(app: tauri::AppHandle, path: String) -> Result<(), String> {
    app.opener()
        .open_path(&path, None::<&str>)
        .map_err(|e| e.to_string())
}

// 💬 פונקציה לפתיחת WhatsApp עם מספר טלפון
#[tauri::command]
async fn open_whatsapp(app: tauri::AppHandle, phone: String) -> Result<(), String> {
    let whatsapp_url = format!("whatsapp://send?phone={}", phone);
    app.opener()
        .open_url(&whatsapp_url, None::<&str>)
        .map_err(|e| e.to_string())
}

// 📧 פונקציה לפתיחת אימייל
#[tauri::command]
async fn open_email(app: tauri::AppHandle, email: String, subject: Option<String>) -> Result<(), String> {
    let mut mailto_url = format!("mailto:{}", email);
    if let Some(subj) = subject {
        mailto_url.push_str(&format!("?subject={}", urlencoding::encode(&subj)));
    }
    app.opener()
        .open_url(&mailto_url, None::<&str>)
        .map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![
            open_folder,
            open_whatsapp, 
            open_email
        ])  // 🆕 הוספת הפונקציות החדשות
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
