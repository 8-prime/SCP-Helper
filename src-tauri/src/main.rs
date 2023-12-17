// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::io::prelude::*;
use std::net::TcpStream;
use ssh2::Channel;
use ssh2::Session;
use tauri::Manager;
use std::path::Path;
use std::fs::metadata;
use std::fs::File;
use std::io::{BufReader, BufRead};


#[derive(Clone, serde::Serialize)]
struct Progress {
    progress: u64,
}


fn upload() -> Result<(), String> {
    let tcp = TcpStream::connect("127.0.0.1:22").unwrap();
    let mut sess = Session::new().unwrap();
    sess.set_tcp_stream(tcp);
    sess.handshake().unwrap();
    
    sess.userauth_password("username", "password").unwrap();

    // Write the file
    let mut remote_file = sess.scp_send(Path::new("remote"), 0o644, 10, None).unwrap();
    remote_file.write(b"1234567890").unwrap();
    // Close the channel and wait for the whole content to be transferred
    remote_file.send_eof().unwrap();
    remote_file.wait_eof().unwrap();
    remote_file.close().unwrap();
    remote_file.wait_close().unwrap();

    Ok(())
}

async fn path_is_file(file_path: &str) -> Result<bool, String> {
    match metadata(file_path) {
        Ok(md) => md.is_file(),
        Err(_) => return Err("Couldn read file metadata to dertermine if path is file".to_string())
    };
    Ok(true)
}

async fn read_file_in_byte_chunks(file: &mut File, buffer_size: &usize, remote_file: &mut Channel, app: &tauri::AppHandle, len: &u64) -> Result<(), Box<dyn std::error::Error>> {

    let mut progress = 0;
    let mut iteration = 0;

    let mut reader = BufReader::with_capacity(*buffer_size, file);

    loop {
        let buffer = reader.fill_buf()?;

        let buffer_length = buffer.len();

        if buffer_length == 0 {
            break;
        }

        remote_file.write(buffer).unwrap();

        reader.consume(buffer_length);

        progress += buffer_length;
        iteration += 1;
        if iteration % 100 == 0 {
            app.emit_all("progress",  Progress { progress: progress as u64 * 100 / len  }).unwrap();
        }
    }

    Ok(())
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn copy_files(user: &str, password: &str, local_path: &str, remote_url: &str, remote_path: &str, app: tauri::AppHandle) -> Result<(), String> {
    let tcp = TcpStream::connect(format!("{}:22", remote_url)).map_err(|err| format!("Failed to connect with: {}", err))?;
    let mut sess = Session::new().map_err(|_| "Couldnt start session".to_string())?;
    sess.set_tcp_stream(tcp);
    sess.handshake().map_err(|_| "Couldnt complete handschake".to_string())?;
    
    sess.userauth_password(user, password).map_err(|_| "Couldnt auth with given credentials".to_string())?;

    if path_is_file(&local_path).await? {
        let path = Path::new(&local_path);
        let file_name = match path.file_name() {
            Some(v) => v.to_str().unwrap(),
            None => return Err("Could not load file name".to_string())
        };
        
        let mut f = File::open(path).map_err(|_|  "Couldnt open file to read bytes for transfer".to_string())?;
        let len = f.metadata().unwrap().len();

        let remote_file_name = String::from(format!("{}/{}", remote_path, file_name));
        let mut remote_file = sess.scp_send(Path::new(&remote_file_name), 0o644, len, None).map_err(|err| format!("Couldnt create new file on host: {}. Tried to create {}", err.message(), remote_file_name))?;

        let chunk_size = 1024;
        let _ = read_file_in_byte_chunks(&mut f, &chunk_size, &mut remote_file, &app, &len).await;

        // Close the channel and wait for the whole content to be transferred
        remote_file.send_eof().unwrap();
        remote_file.wait_eof().unwrap();
        remote_file.close().unwrap();
        remote_file.wait_close().unwrap();
    }
    else {

    }
    return Ok(());
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![greet, copy_files])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
