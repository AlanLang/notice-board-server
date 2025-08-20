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

  useEffect(() => {
    fetchMessages();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-3xl font-bold">家庭留言板</CardTitle>
              <Button onClick={() => setShowForm(!showForm)}>
                {showForm ? '取消' : '添加留言'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            {showForm && (
              <div className="mb-6">
                <MessageForm 
                  onSubmit={createMessage}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            )}
            
            <MessageList 
              messages={messages} 
              onDelete={deleteMessage}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NoticeBoard;