// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use std::path::Path;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn open_path(path: String) -> Result<(), String> {
    use tauri_plugin_shell::ShellExt;
    
    let app_handle = tauri::AppHandle::get_global()
        .ok_or_else(|| "Failed to get app handle".to_string())?;
        
    let shell = app_handle.shell();
    
    #[cfg(target_os = "macos")]
    {
        shell.command("open")
            .args([&path])
            .spawn()
            .map_err(|e| format!("Failed to open path: {}", e))?;
    }
    
    #[cfg(target_os = "windows")]
    {
        shell.command("explorer")
            .args([&path])
            .spawn()
            .map_err(|e| format!("Failed to open path: {}", e))?;
    }
    
    #[cfg(target_os = "linux")]
    {
        shell.command("xdg-open")
            .args([&path])
            .spawn()
            .map_err(|e| format!("Failed to open path: {}", e))?;
    }
    
    Ok(())
}

#[tauri::command]
async fn validate_path(path: String) -> Result<bool, String> {
    let path_obj = Path::new(&path);
    Ok(path_obj.exists() && path_obj.is_dir())
}

#[tauri::command]
async fn open_url(url: String) -> Result<(), String> {
    use tauri_plugin_shell::ShellExt;
    
    let app_handle = tauri::AppHandle::get_global()
        .ok_or_else(|| "Failed to get app handle".to_string())?;
    
    let shell = app_handle.shell();
    shell.open(&url, None)
        .map_err(|e| format!("Failed to open URL: {}", e))?;
    
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            tauri::AppHandle::set_global(app.handle().clone())
                .map_err(|_| "Failed to set global app handle")?;
            
            println!("App is starting...");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            open_path,
            validate_path,
            open_url
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
