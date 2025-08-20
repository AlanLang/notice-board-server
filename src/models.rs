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
}
