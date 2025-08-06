#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::command;
use std::process::Command;

#[command]
async fn open_folder(path: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }
    
    #[cfg(target_os = "windows")]
    {
        Command::new("explorer")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }
    
    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }
    
    Ok(())
}

#[command]
async fn get_desktop_path() -> Result<String, String> {
    let home_dir = dirs::home_dir()
        .ok_or("Could not find home directory")?;
    
    let desktop_path = home_dir.join("Desktop");
    
    Ok(desktop_path.to_string_lossy().to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![open_folder, get_desktop_path])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
