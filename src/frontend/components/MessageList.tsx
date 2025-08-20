import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Message } from './NoticeBoard';

interface MessageListProps {
  messages: Message[];
  onDelete: (id: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages, onDelete }) => {
  const getPriorityColor = (priority: Message['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'high':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'normal':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'low':
        return 'bg-gray-100 border-gray-300 text-gray-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: Message['priority']) => {
    switch (priority) {
      case 'urgent':
        return '紧急';
      case 'high':
        return '高';
      case 'normal':
        return '普通';
      case 'low':
        return '低';
      default:
        return '普通';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (messages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        暂无留言，点击上方按钮添加第一条留言吧！
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <Card key={message.id} className="relative">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">{message.title}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>作者: {message.author}</span>
                  <span>•</span>
                  <span>{formatDate(message.created_at)}</span>
                  <span className={`px-2 py-1 rounded text-xs border ${getPriorityColor(message.priority)}`}>
                    {getPriorityLabel(message.priority)}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm('确定要删除这条留言吗？')) {
                  onDelete(message.id);
                }
              }}
            >
              删除
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default MessageList;