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
    <Card>
      <CardHeader>
        <CardTitle>添加新留言</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">标题 *</Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="请输入留言标题"
              required
            />
          </div>

          <div>
            <Label htmlFor="content">内容 *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="请输入留言内容"
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="author">作者 *</Label>
            <Input
              id="author"
              type="text"
              value={formData.author}
              onChange={(e) => handleChange('author', e.target.value)}
              placeholder="请输入你的名字"
              required
            />
          </div>

          <div>
            <Label htmlFor="priority">优先级</Label>
            <Select
              id="priority"
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value as CreateMessage['priority'])}
            >
              <option value="low">低</option>
              <option value="normal">普通</option>
              <option value="high">高</option>
              <option value="urgent">紧急</option>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button type="submit">
              提交留言
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              取消
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default MessageForm;