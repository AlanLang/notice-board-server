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
        return 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg';
      case 'high':
        return 'bg-gradient-to-r from-orange-400 to-amber-400 text-white shadow-md';
      case 'normal':
        return 'bg-gradient-to-r from-blue-400 to-indigo-400 text-white shadow-md';
      case 'low':
        return 'bg-gradient-to-r from-gray-400 to-slate-400 text-white shadow-sm';
      default:
        return 'bg-gradient-to-r from-gray-400 to-slate-400 text-white shadow-sm';
    }
  };

  const getPriorityLabel = (priority: Message['priority']) => {
    switch (priority) {
      case 'urgent':
        return '🔴 紧急';
      case 'high':
        return '🟠 高';
      case 'normal':
        return '🔵 普通';
      case 'low':
        return '🟢 低';
      default:
        return '🔵 普通';
    }
  };

  const getPriorityIcon = (priority: Message['priority']) => {
    switch (priority) {
      case 'urgent':
        return '🚨';
      case 'high':
        return '⚡';
      case 'normal':
        return '📌';
      case 'low':
        return '📝';
      default:
        return '📌';
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
      <div className="text-center py-16">
        <div className="text-8xl mb-6">📝</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">还没有留言哦</h3>
        <p className="text-gray-500">点击上方按钮添加第一条留言吧！</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {messages.map((message, index) => (
        <Card 
          key={message.id} 
          className="relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] bg-white/90 backdrop-blur-sm border-0"
          style={{
            animationDelay: `${index * 0.1}s`
          }}
        >
          {/* 优先级指示条 */}
          <div className={`absolute top-0 left-0 w-full h-2 ${getPriorityColor(message.priority)}`}></div>
          
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div className="flex-1">
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2 mb-3">
                  <span className="text-2xl">{getPriorityIcon(message.priority)}</span>
                  {message.title}
                </CardTitle>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">👤 {message.author}</span>
                  </div>
                  <span className="hidden sm:inline">•</span>
                  <div className="flex items-center gap-1">
                    <span>🕒 {formatDate(message.created_at)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getPriorityColor(message.priority)}`}>
                  {getPriorityLabel(message.priority)}
                </span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="py-4">
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-200">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{message.content}</p>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end pt-0 pb-4">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm('确定要删除这条留言吗？')) {
                  onDelete(message.id);
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              🗑️ 删除
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default MessageList;