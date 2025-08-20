import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select } from './ui/select';
import { CreateMessage } from './NoticeBoard';

interface MessageFormProps {
  onSubmit: (message: CreateMessage) => void;
  onCancel: () => void;
}

const MessageForm: React.FC<MessageFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<CreateMessage>({
    title: '',
    content: '',
    author: '',
    priority: 'normal',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim() || !formData.author.trim()) {
      alert('请填写所有必填字段');
      return;
    }

    onSubmit(formData);
    setFormData({
      title: '',
      content: '',
      author: '',
      priority: 'normal',
    });
  };

  const handleChange = (field: keyof CreateMessage, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          ✏️ 添加新留言
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
              📝 标题 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="请输入留言标题"
              className="h-12 border-2 border-gray-200 focus:border-blue-400 rounded-lg transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
              💬 内容 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="请输入留言内容"
              rows={4}
              className="border-2 border-gray-200 focus:border-blue-400 rounded-lg resize-none transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="author" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                👤 作者 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="author"
                type="text"
                value={formData.author}
                onChange={(e) => handleChange('author', e.target.value)}
                placeholder="请输入你的名字"
                className="h-12 border-2 border-gray-200 focus:border-blue-400 rounded-lg transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                🎯 优先级
              </Label>
              <Select
                id="priority"
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value as CreateMessage['priority'])}
                className="h-12 border-2 border-gray-200 focus:border-blue-400 rounded-lg transition-colors"
              >
                <option value="low">🟢 低</option>
                <option value="normal">🔵 普通</option>
                <option value="high">🟠 高</option>
                <option value="urgent">🔴 紧急</option>
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              type="submit"
              className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              ✅ 提交留言
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="flex-1 sm:flex-none h-12 border-2 border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-700 font-medium rounded-lg transition-all duration-200"
            >
              ❌ 取消
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default MessageForm;