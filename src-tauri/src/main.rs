// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_plugin_opener::OpenerExt;

// 📁 פונקציה לפתיחת תיקיות במערכת
#[tauri::command]
async fn open_folder(app: tauri::AppHandle, path: String) -> Result<(), String> {
    println!("📁 Opening folder: {}", path);
    
    app.opener()
        .open_path(&path, None::<&str>)
        .map_err(|e| {
            eprintln!("❌ Error opening folder: {}", e);
            e.to_string()
        })
}

// 💬 פונקציה לפתיחת WhatsApp עם מספר טלפון (FIXED: הוסף support למסר)
#[tauri::command]
async fn open_whatsapp(app: tauri::AppHandle, phone: String, message: Option<String>) -> Result<(), String> {
    println!("💬 Opening WhatsApp for: {} with message: {:?}", phone, message);
    
    // נבנה את ה-URL של WhatsApp
    let whatsapp_url = if let Some(msg) = message {
        format!("whatsapp://send?phone={}&text={}", phone, urlencoding::encode(&msg))
    } else {
        format!("whatsapp://send?phone={}", phone)
    };
    
    // ניסיון ראשון: WhatsApp Desktop
    match app.opener().open_url(&whatsapp_url, None::<&str>) {
        Ok(_) => {
            println!("✅ WhatsApp Desktop opened successfully");
            Ok(())
        }
        Err(desktop_error) => {
            println!("⚠️ Desktop WhatsApp failed: {}, trying web version...", desktop_error);
            
            // ניסיון שני: WhatsApp Web
            let web_url = if let Some(msg) = message {
                format!("https://wa.me/{}?text={}", phone, urlencoding::encode(&msg))
            } else {
                format!("https://wa.me/{}", phone)
            };
            
            app.opener()
                .open_url(&web_url, None::<&str>)
                .map_err(|e| {
                    eprintln!("❌ Error opening WhatsApp Web: {}", e);
                    e.to_string()
                })
        }
    }
}

// 📧 פונקציה לפתיחת אימייל (FIXED: הוסף support ל-body)
#[tauri::command]
async fn open_email(app: tauri::AppHandle, email: String, subject: Option<String>, body: Option<String>) -> Result<(), String> {
    println!("📧 Opening email for: {} with subject: {:?}", email, subject);
    
    let mut mailto_url = format!("mailto:{}", email);
    let mut params = Vec::new();
    
    if let Some(subj) = subject {
        params.push(format!("subject={}", urlencoding::encode(&subj)));
    }
    
    if let Some(body_text) = body {
        params.push(format!("body={}", urlencoding::encode(&body_text)));
    }
    
    if !params.is_empty() {
        mailto_url.push_str(&format!("?{}", params.join("&")));
    }
    
    app.opener()
        .open_url(&mailto_url, None::<&str>)
        .map_err(|e| {
            eprintln!("❌ Error opening email: {}", e);
            e.to_string()
        })
}

// 📞 פונקציה לפתיחת חייגן (FIXED: הוסף פונקציה חסרה)
#[tauri::command]
async fn open_url(app: tauri::AppHandle, url: String) -> Result<(), String> {
    println!("🔗 Opening URL: {}", url);
    
    app.opener()
        .open_url(&url, None::<&str>)
        .map_err(|e| {
            eprintln!("❌ Error opening URL: {}", e);
            e.to_string()
        })
}

// 🔍 פונקציה לבדיקת חיבור (debugging)
#[tauri::command]
async fn test_connection() -> Result<String, String> {
    println!("🔍 Testing Tauri connection...");
    Ok("✅ Tauri connection is working!".to_string())
}

fn main() {
    println!("🚀 Starting Project Pulse HE...");
    
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![
            open_folder,
            open_whatsapp, 
            open_email,
            open_url,
            test_connection  // פונקציה לטסטים
        ])
        .setup(|app| {
            println!("✅ Tauri app setup completed");
            println!("🔧 Available commands: open_folder, open_whatsapp, open_email, open_url, test_connection");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
