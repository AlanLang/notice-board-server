import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import MessageForm from './MessageForm';
import MessageList from './MessageList';

export interface Message {
  id: string;
  title: string;
  content: string;
  author: string;
  created_at: string;
  updated_at: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expires_at?: string;
  enabled: boolean;
}

export interface CreateMessage {
  title: string;
  content: string;
  author: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expires_at?: string;
}

const NoticeBoard: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createMessage = async (messageData: CreateMessage) => {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error('Failed to create message');
      }

      await fetchMessages();
      setShowForm(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      const response = await fetch(`/api/messages/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      await fetchMessages();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const toggleMessageEnabled = async (id: string) => {
    try {
      const response = await fetch(`/api/messages/${id}/toggle`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle message status');
      }

      await fetchMessages();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <div className="text-lg text-gray-600 font-medium">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-6xl">
        {/* 头部区域 */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                🏠 家庭留言板
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                温馨留言，传递关爱
              </p>
            </div>
            <Button 
              onClick={() => setShowForm(!showForm)}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              size="lg"
            >
              {showForm ? '✕ 取消' : '✏️ 添加留言'}
            </Button>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 mx-4 sm:mx-0">
            <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
              <div className="flex items-center">
                <div className="text-red-400 mr-3">⚠️</div>
                <div className="text-red-700 font-medium">{error}</div>
              </div>
            </div>
          </div>
        )}
        
        {/* 表单区域 */}
        {showForm && (
          <div className="mb-6 mx-4 sm:mx-0">
            <MessageForm 
              onSubmit={createMessage}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}
        
        {/* 留言列表区域 */}
        <div className="mx-4 sm:mx-0">
          <MessageList 
            messages={messages} 
            onDelete={deleteMessage}
            onToggleEnabled={toggleMessageEnabled}
          />
        </div>
      </div>
    </div>
  );
};

export default NoticeBoard;