mod handlers;
mod models;
mod storage;

use axum::{
  Router,
  routing::{delete, get, get_service, post, put},
};
use std::{net::SocketAddr, sync::Arc};
use tower_http::{
  cors::CorsLayer,
  services::{ServeDir, ServeFile},
};

use handlers::{
  AppState, create_message, delete_message, get_active_messages,
  get_clients, get_message, get_messages, get_messages_paginated, get_stats,
  toggle_message_enabled, update_message,
};
use storage::FileStorage;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
  // 设置日志级别
  if std::env::var("RUST_LOG").is_err() {
    unsafe {
      std::env::set_var("RUST_LOG", "info");
    }
  }
  env_logger::init();

  // 初始化文件存储
  let data_dir = std::env::var("DATA_DIR").unwrap_or_else(|_| "./data".to_string());
  let storage = FileStorage::new(&data_dir).await?;
  let app_state: AppState = Arc::new(storage);

  // API 路由
  let api_routes = Router::new()
    .route("/messages", get(get_messages).post(create_message))
    .route("/messages/paginated", get(get_messages_paginated))
    .route("/messages/active", get(get_active_messages))
    .route(
      "/messages/{id}",
      get(get_message).put(update_message).delete(delete_message),
    )
    .route("/messages/{id}/toggle", post(toggle_message_enabled))
    .route("/clients", get(get_clients))
    .route("/stats", get(get_stats))
    .with_state(app_state);

  // 构建静态文件服务（用于 serve ./web 目录）
  let serve_dir = ServeDir::new("./web").not_found_service(ServeFile::new("./web/index.html"));

  let app = Router::new()
    .nest("/api", api_routes)
    .fallback_service(get_service(serve_dir));

  let addr = SocketAddr::from(([0, 0, 0, 0], 3003));
  let listener = tokio::net::TcpListener::bind(addr).await?;
  log::info!("Listening on {}", addr);
  axum::serve(listener, app).await?;

  Ok(())
}
