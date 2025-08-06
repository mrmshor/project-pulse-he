// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn open_path(app: tauri::AppHandle, path: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        use tauri_plugin_shell::ShellExt;
        app.shell().command("open").args([&path]).spawn()
            .map_err(|e| format!("Failed to open: {}", e))?;
    }
    
    Ok(())
}

#[tauri::command]
async fn open_url(app: tauri::AppHandle, url: String) -> Result<(), String> {
    use tauri_plugin_shell::ShellExt;
    app.shell().open(&url, None)
        .map_err(|e| format!("Failed to open URL: {}", e))?;
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet, open_path, open_url])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
