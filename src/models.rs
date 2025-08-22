use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Message {
  pub id: Uuid,
  pub title: String,
  pub content: String,
  pub author: String,
  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
  pub priority: Priority,
  pub expires_at: Option<DateTime<Utc>>,
  pub enabled: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum Priority {
  Low,
  Normal,
  High,
  Urgent,
}

#[derive(Debug, Deserialize)]
pub struct CreateMessage {
  pub title: String,
  pub content: String,
  pub author: String,
  pub priority: Priority,
  pub expires_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateMessage {
  pub title: Option<String>,
  pub content: Option<String>,
  pub author: Option<String>,
  pub priority: Option<Priority>,
  pub expires_at: Option<DateTime<Utc>>,
  pub enabled: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct PaginationParams {
  pub page: Option<u32>,
  pub page_size: Option<u32>,
}

#[derive(Debug, Serialize)]
pub struct PaginatedResponse<T> {
  pub data: Vec<T>,
  pub total: usize,
  pub page: u32,
  pub page_size: u32,
  pub total_pages: u32,
}
