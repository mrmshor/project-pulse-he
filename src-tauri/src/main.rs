// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::api::shell;
use std::process::Command;

// ✅ פתיחת תיקיות במחשב - עובד על כל המערכות
#[tauri::command]
fn open_folder(path: String) -> Result<(), String> {
    println!("🗂️ Opening folder: {}", path);
    
    // ניסיון ראשון: shell API של Tauri
    match shell::open(&tauri::api::shell::Scope::default(), &path, None) {
        Ok(_) => {
            println!("✅ Folder opened successfully via Tauri shell");
            Ok(())
        },
        Err(e) => {
            println!("⚠️ Tauri shell failed: {}, trying OS commands...", e);
            
            // ניסיון שני: פקודות מערכת הפעלה נייטיביות
            let result = if cfg!(target_os = "windows") {
                // Windows: explorer
                Command::new("explorer")
                    .arg(&path)
                    .spawn()
                    .map(|_| ())
            } else if cfg!(target_os = "macos") {
                // macOS: open
                Command::new("open")
                    .arg(&path)
                    .spawn()
                    .map(|_| ())
            } else {
                // Linux: xdg-open
                Command::new("xdg-open")
                    .arg(&path)
                    .spawn()
                    .map(|_| ())
            };
            
            match result {
                Ok(_) => {
                    println!("✅ Folder opened successfully via OS command");
                    Ok(())
                },
                Err(e) => {
                    let error_msg = format!("❌ Failed to open folder: {}", e);
                    println!("{}", error_msg);
                    Err(error_msg)
                }
            }
        }
    }
}

// ✅ פתיחת WhatsApp במחשב - עם fallback חכם ומלא
#[tauri::command] 
fn open_whatsapp(phone: String, message: Option<String>) -> Result<(), String> {
    println!("💬 Opening WhatsApp for phone: {}", phone);
    
    // URL בנייה
    let url = if let Some(msg) = message {
        format!("https://wa.me/{}?text={}", phone, urlencoding::encode(&msg))
    } else {
        format!("https://wa.me/{}", phone)
    };
    
    let whatsapp_protocol = format!("whatsapp://send?phone={}", phone);
    
    println!("🔗 WhatsApp URL: {}", url);
    println!("🔗 WhatsApp Protocol: {}", whatsapp_protocol);
    
    // ניסיון ראשון: פרוטוקול WhatsApp Desktop
    match shell::open(&tauri::api::shell::Scope::default(), &whatsapp_protocol, None) {
        Ok(_) => {
            println!("✅ WhatsApp Desktop opened successfully");
            Ok(())
        },
        Err(e) => {
            println!("⚠️ WhatsApp Desktop failed: {}, trying web version...", e);
            
            // ניסיון שני: WhatsApp Web
            match shell::open(&tauri::api::shell::Scope::default(), &url, None) {
                Ok(_) => {
                    println!("✅ WhatsApp Web opened successfully");
                    Ok(())
                },
                Err(e2) => {
                    println!("⚠️ WhatsApp Web failed: {}, trying OS commands...", e2);
                    
                    // ✅ תיקון: ניסיון שלישי מלא - פקודות מערכת הפעלה
                    let result = if cfg!(target_os = "windows") {
                        Command::new("cmd")
                            .args(&["/C", "start", "", &url])
                            .spawn()
                            .map(|_| ())
                    } else if cfg!(target_os = "macos") {
                        Command::new("open")
                            .arg(&url)
                            .spawn()
                            .map(|_| ())
                    } else {
                        Command::new("xdg-open")
                            .arg(&url)
                            .spawn()
                            .map(|_| ())
                    };
                    
                    match result {
                        Ok(_) => {
                            println!("✅ WhatsApp opened via OS command");
                            Ok(())
                        },
                        Err(e3) => {
                            let error_msg = format!("❌ All WhatsApp methods failed. Shell: {}, Web: {}, OS: {}", e, e2, e3);
                            println!("{}", error_msg);
                            Err(error_msg)
                        }
                    }
                }
            }
        }
    }
}

// ✅ פתיחת אימייל במחשב - תיקון מלא
#[tauri::command]
fn open_email(email: String, subject: Option<String>, body: Option<String>) -> Result<(), String> {
    println!("📧 Opening email for: {}", email);
    
    let mut mailto_url = format!("mailto:{}", email);
    let mut params = Vec::new();
    
    if let Some(subj) = subject {
        params.push(format!("subject={}", urlencoding::encode(&subj)));
    }
    
    if let Some(body_text) = body {
        params.push(format!("body={}", urlencoding::encode(&body_text)));
    }
    
    if !params.is_empty() {
        mailto_url.push('?');
        mailto_url.push_str(&params.join("&"));
    }
    
    println!("📧 Email URL: {}", mailto_url);
    
    // ✅ תיקון: השלמת הפונקציה המלאה
    match shell::open(&tauri::api::shell::Scope::default(), &mailto_url, None) {
        Ok(_) => {
            println!("✅ Email client opened successfully");
            Ok(())
        },
        Err(e) => {
            let error_msg = format!("❌ Failed to open email client: {}", e);
            println!("{}", error_msg);
            Err(error_msg)
        }
    }
}

// ✅ פתיחת חיוג במחשב
#[tauri::command]
fn open_phone(phone_number: String) -> Result<(), String> {
    println!("📞 Opening phone for: {}", phone_number);
    
    let tel_url = format!("tel:{}", phone_number);
    
    match shell::open(&tauri::api::shell::Scope::default(), &tel_url, None) {
        Ok(_) => {
            println!("✅ Phone dialer opened successfully");
            Ok(())
        },
        Err(e) => {
            let error_msg = format!("❌ Failed to open phone dialer: {}", e);
            println!("{}", error_msg);
            Err(error_msg)
        }
    }
}

// ✅ בדיקת מערכת הפעלה
#[tauri::command]
fn get_os_info() -> Result<String, String> {
    let os = if cfg!(target_os = "windows") {
        "windows"
    } else if cfg!(target_os = "macos") {
        "macos"
    } else if cfg!(target_os = "linux") {
        "linux"
    } else {
        "unknown"
    };
    
    println!("🖥️ Operating System: {}", os);
    Ok(os.to_string())
}

// ✅ פונקציה main מלאה ותקינה
fn main() {
    println!("🚀 Starting Project Pulse Hebrew Desktop App");
    
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            open_folder,
            open_whatsapp, 
            open_email,
            open_phone,
            get_os_info
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
