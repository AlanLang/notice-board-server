use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::Json,
};
use serde_json::{json, Value};
use uuid::Uuid;

use crate::{storage::FileStorage, models::{CreateMessage, UpdateMessage, PaginationParams}};

pub type AppState = std::sync::Arc<FileStorage>;

pub async fn create_message(
    State(storage): State<AppState>,
    Json(payload): Json<CreateMessage>,
) -> Result<(StatusCode, Json<Value>), StatusCode> {
    match storage.create_message(payload).await {
        Ok(message) => Ok((StatusCode::CREATED, Json(json!(message)))),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

pub async fn get_messages(
    State(storage): State<AppState>,
) -> Result<Json<Value>, StatusCode> {
    match storage.get_messages().await {
        Ok(messages) => Ok(Json(json!(messages))),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

pub async fn get_active_messages(
    State(storage): State<AppState>,
) -> Result<Json<Value>, StatusCode> {
    match storage.get_active_messages().await {
        Ok(messages) => Ok(Json(json!(messages))),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

pub async fn get_messages_paginated(
    Query(params): Query<PaginationParams>,
    State(storage): State<AppState>,
) -> Result<Json<Value>, StatusCode> {
    let page = params.page.unwrap_or(1).max(1);
    let page_size = params.page_size.unwrap_or(10).clamp(1, 100);
    
    match storage.get_active_messages_paginated(page, page_size).await {
        Ok(response) => Ok(Json(json!(response))),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

pub async fn get_message(
    Path(id): Path<String>,
    State(storage): State<AppState>,
) -> Result<Json<Value>, StatusCode> {
    let uuid = Uuid::parse_str(&id).map_err(|_| StatusCode::BAD_REQUEST)?;
    
    match storage.get_message(uuid).await {
        Ok(Some(message)) => Ok(Json(json!(message))),
        Ok(None) => Err(StatusCode::NOT_FOUND),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

pub async fn update_message(
    Path(id): Path<String>,
    State(storage): State<AppState>,
    Json(payload): Json<UpdateMessage>,
) -> Result<Json<Value>, StatusCode> {
    let uuid = Uuid::parse_str(&id).map_err(|_| StatusCode::BAD_REQUEST)?;
    
    match storage.update_message(uuid, payload).await {
        Ok(Some(message)) => Ok(Json(json!(message))),
        Ok(None) => Err(StatusCode::NOT_FOUND),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

pub async fn delete_message(
    Path(id): Path<String>,
    State(storage): State<AppState>,
) -> Result<StatusCode, StatusCode> {
    let uuid = Uuid::parse_str(&id).map_err(|_| StatusCode::BAD_REQUEST)?;
    
    match storage.delete_message(uuid).await {
        Ok(true) => Ok(StatusCode::NO_CONTENT),
        Ok(false) => Err(StatusCode::NOT_FOUND),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

pub async fn toggle_message_enabled(
    Path(id): Path<String>,
    State(storage): State<AppState>,
) -> Result<Json<Value>, StatusCode> {
    let uuid = Uuid::parse_str(&id).map_err(|_| StatusCode::BAD_REQUEST)?;
    
    // 先获取当前留言状态
    let current_message = match storage.get_message(uuid).await {
        Ok(Some(message)) => message,
        Ok(None) => return Err(StatusCode::NOT_FOUND),
        Err(_) => return Err(StatusCode::INTERNAL_SERVER_ERROR),
    };
    
    // 切换 enabled 状态
    let update = UpdateMessage {
        title: None,
        content: None,
        author: None,
        priority: None,
        expires_at: None,
        enabled: Some(!current_message.enabled),
    };
    
    match storage.update_message(uuid, update).await {
        Ok(Some(message)) => Ok(Json(json!(message))),
        Ok(None) => Err(StatusCode::NOT_FOUND),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

// 新增客户端状态相关 API
pub async fn get_clients(
    State(storage): State<AppState>,
) -> Result<Json<Value>, StatusCode> {
    match storage.get_clients().await {
        Ok(clients) => Ok(Json(json!(clients))),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

pub async fn get_stats(
    State(storage): State<AppState>,
) -> Result<Json<Value>, StatusCode> {
    match storage.get_stats().await {
        Ok(stats) => Ok(Json(json!(stats))),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}