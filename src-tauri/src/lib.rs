use std::process::Command;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct DownloadResult {
    success: bool,
    message: String,
    file_path: Option<String>,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn download_video(url: String, format: String, quality: String) -> Result<DownloadResult, String> {
    println!("Downloading: {} as {} with quality {}", url, format, quality);

    // Create base command
    let mut cmd = Command::new("yt-dlp");

    // Add common arguments
    cmd.arg("--no-playlist");

    // Format specific arguments
    if format == "audio" {
        cmd.arg("-x");
        cmd.arg("--audio-format");
        cmd.arg("mp3");
    } else {
        // Video format
        if quality != "highest" {
            cmd.arg("-f");

            match quality.as_str() {
                "1080p" => cmd.arg("bestvideo[height<=1080]+bestaudio/best[height<=1080]"),
                "720p" => cmd.arg("bestvideo[height<=720]+bestaudio/best[height<=720]"),
                "480p" => cmd.arg("bestvideo[height<=480]+bestaudio/best[height<=480]"),
                "360p" => cmd.arg("bestvideo[height<=360]+bestaudio/best[height<=360]"),
                _ => cmd.arg("best"),
            };
        }
    }

    // Add URL
    cmd.arg(&url);

    // Execute command
    match cmd.output() {
        Ok(output) => {
            if output.status.success() {
                let stdout = String::from_utf8_lossy(&output.stdout).to_string();

                // Try to extract file path from output
                let file_path = if stdout.contains("Destination:") {
                    let parts: Vec<&str> = stdout.split("Destination:").collect();
                    if parts.len() > 1 {
                        let file_line = parts[1].lines().next().unwrap_or("").trim();
                        Some(file_line.to_string())
                    } else {
                        None
                    }
                } else {
                    None
                };

                Ok(DownloadResult {
                    success: true,
                    message: "Download completed successfully".to_string(),
                    file_path,
                })
            } else {
                let stderr = String::from_utf8_lossy(&output.stderr).to_string();
                Err(format!("Download failed: {}", stderr))
            }
        },
        Err(e) => Err(format!("Failed to execute yt-dlp: {}", e)),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, download_video])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
