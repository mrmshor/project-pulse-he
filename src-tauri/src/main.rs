// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    // Initialize logging for debugging
    env_logger::init();
    
    tauri::Builder::default()
        .setup(|app| {
            // Safe setup - no panic calls
            println!("App is starting...");
            
            // Create app directories safely
            if let Some(app_dir) = app.path_resolver().app_data_dir() {
                if let Err(e) = std::fs::create_dir_all(&app_dir) {
                    eprintln!("Warning: Failed to create app directory: {}", e);
                    // Don't panic - just log the error
                }
            }
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
