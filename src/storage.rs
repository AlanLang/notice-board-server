use anyhow::Result;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use tokio::fs;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::models::{CreateMessage, Message, Priority, UpdateMessage};

// 数据存储结构
#[derive(Debug, Serialize, Deserialize, Default, Clone)]
pub struct DataStore {
  pub messages: HashMap<Uuid, Message>,
  pub clients: HashMap<String, ClientStatus>,
  pub last_updated: DateTime<Utc>,
}

// 客户端状态
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ClientStatus {
  pub id: String,
  pub name: String,
  pub last_seen: DateTime<Utc>,
  pub is_online: bool,
  pub ip_address: Option<String>,
  pub device_info: Option<String>,
}

// 文件存储管理器
pub struct FileStorage {
  data_dir: PathBuf,
  data: RwLock<DataStore>,
}

impl FileStorage {
  pub async fn new<P: AsRef<Path>>(data_dir: P) -> Result<Self> {
    let data_dir = data_dir.as_ref().to_path_buf();

    // 确保数据目录存在
    fs::create_dir_all(&data_dir).await?;

    let data_file = data_dir.join("data.json");
    let data = if data_file.exists() {
      let content = fs::read_to_string(&data_file).await?;
      serde_json::from_str(&content).unwrap_or_default()
    } else {
      DataStore::default()
    };

    Ok(FileStorage {
      data_dir,
      data: RwLock::new(data),
    })
  }

  // 保存数据到文件
  async fn save_to_file(&self) -> Result<()> {
    let data = self.data.read().await;
    let content = serde_json::to_string_pretty(&*data)?;
    let data_file = self.data_dir.join("data.json");
    fs::write(data_file, content).await?;
    Ok(())
  }

  // 创建留言
  pub async fn create_message(&self, msg: CreateMessage) -> Result<Message> {
    let id = Uuid::new_v4();
    let now = Utc::now();

    let message = Message {
      id,
      title: msg.title,
      content: msg.content,
      author: msg.author,
      created_at: now,
      updated_at: now,
      priority: msg.priority,
      expires_at: msg.expires_at,
    };

    {
      let mut data = self.data.write().await;
      data.messages.insert(id, message.clone());
      data.last_updated = now;
    }

    self.save_to_file().await?;
    Ok(message)
  }

  // 获取所有留言
  pub async fn get_messages(&self) -> Result<Vec<Message>> {
    let data = self.data.read().await;
    let now = Utc::now();

    let mut messages: Vec<Message> = data
      .messages
      .values()
      .filter(|msg| {
        // 过滤过期的留言
        msg.expires_at.is_none() || msg.expires_at.unwrap() > now
      })
      .cloned()
      .collect();

    // 按优先级和创建时间排序
    messages.sort_by(|a, b| {
      let priority_order = |p: &Priority| match p {
        Priority::Urgent => 1,
        Priority::High => 2,
        Priority::Normal => 3,
        Priority::Low => 4,
      };

      priority_order(&a.priority)
        .cmp(&priority_order(&b.priority))
        .then(b.created_at.cmp(&a.created_at))
    });

    Ok(messages)
  }

  // 获取单个留言
  pub async fn get_message(&self, id: Uuid) -> Result<Option<Message>> {
    let data = self.data.read().await;
    Ok(data.messages.get(&id).cloned())
  }

  // 更新留言
  pub async fn update_message(&self, id: Uuid, update: UpdateMessage) -> Result<Option<Message>> {
    let now = Utc::now();

    {
      let mut data = self.data.write().await;
      if let Some(message) = data.messages.get_mut(&id) {
        if let Some(title) = update.title {
          message.title = title;
        }
        if let Some(content) = update.content {
          message.content = content;
        }
        if let Some(author) = update.author {
          message.author = author;
        }
        if let Some(priority) = update.priority {
          message.priority = priority;
        }
        if let Some(expires_at) = update.expires_at {
          message.expires_at = Some(expires_at);
        }
        message.updated_at = now;
        data.last_updated = now;
      } else {
        return Ok(None);
      }
    }

    self.save_to_file().await?;
    self.get_message(id).await
  }

  // 删除留言
  pub async fn delete_message(&self, id: Uuid) -> Result<bool> {
    let removed = {
      let mut data = self.data.write().await;
      let removed = data.messages.remove(&id).is_some();
      if removed {
        data.last_updated = Utc::now();
      }
      removed
    };

    if removed {
      self.save_to_file().await?;
    }

    Ok(removed)
  }

  // 客户端管理方法

  // 注册或更新客户端状态
  pub async fn update_client_status(&self, client: ClientStatus) -> Result<()> {
    {
      let mut data = self.data.write().await;
      data.clients.insert(client.id.clone(), client);
      data.last_updated = Utc::now();
    }

    self.save_to_file().await?;
    Ok(())
  }

  // 获取所有客户端状态
  pub async fn get_clients(&self) -> Result<Vec<ClientStatus>> {
    let data = self.data.read().await;
    Ok(data.clients.values().cloned().collect())
  }

  // 获取在线客户端
  pub async fn get_online_clients(&self) -> Result<Vec<ClientStatus>> {
    let data = self.data.read().await;
    let now = Utc::now();

    Ok(
      data
        .clients
        .values()
        .filter(|client| {
          client.is_online && (now - client.last_seen).num_minutes() < 5 // 5分钟内活动视为在线
        })
        .cloned()
        .collect(),
    )
  }

  // 标记客户端离线
  pub async fn mark_client_offline(&self, client_id: &str) -> Result<()> {
    {
      let mut data = self.data.write().await;
      if let Some(client) = data.clients.get_mut(client_id) {
        client.is_online = false;
        client.last_seen = Utc::now();
        data.last_updated = Utc::now();
      }
    }

    self.save_to_file().await?;
    Ok(())
  }

  // 获取数据统计信息
  pub async fn get_stats(&self) -> Result<DataStats> {
    let data = self.data.read().await;
    let now = Utc::now();

    let total_messages = data.messages.len();
    let active_messages = data
      .messages
      .values()
      .filter(|msg| msg.expires_at.is_none() || msg.expires_at.unwrap() > now)
      .count();

    let online_clients = data
      .clients
      .values()
      .filter(|client| client.is_online && (now - client.last_seen).num_minutes() < 5)
      .count();

    Ok(DataStats {
      total_messages,
      active_messages,
      total_clients: data.clients.len(),
      online_clients,
      last_updated: data.last_updated,
    })
  }
}

#[derive(Debug, Serialize)]
pub struct DataStats {
  pub total_messages: usize,
  pub active_messages: usize,
  pub total_clients: usize,
  pub online_clients: usize,
  pub last_updated: DateTime<Utc>,
}
