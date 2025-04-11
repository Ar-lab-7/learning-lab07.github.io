
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Bold, Italic, List, Image, Link, Heading, Check, Type, AlignLeft } from 'lucide-react';
import { toast } from 'sonner';

interface BlogCreatorProps {
  onClose: () => void;
  onSave: (blogData: { title: string, content: string, date: string, readTime: string }) => void;
}

const TEMPLATE_OPTIONS = [
  { value: 'blank', label: 'Blank Template' },
  { value: 'article', label: 'Article Template' },
  { value: 'tutorial', label: 'Tutorial Template' },
  { value: 'quiz', label: 'Quiz Template' }
];

const BlogCreator: React.FC<BlogCreatorProps> = ({ onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [template, setTemplate] = useState('blank');
  const [activeTab, setActiveTab] = useState('write');
  const [generatedCode, setGeneratedCode] = useState('');
  
  const handleTemplateChange = (value: string) => {
    setTemplate(value);
    
    // Set template content based on selection
    switch(value) {
      case 'article':
        setContent('# Introduction\n\nWrite your introduction here.\n\n## Main Content\n\nYour main content goes here.\n\n## Conclusion\n\nSummarize your article here.');
        break;
      case 'tutorial':
        setContent('# Tutorial Title\n\n## Prerequisites\n- Item 1\n- Item 2\n\n## Step 1: Getting Started\nInstructions for step 1.\n\n## Step 2: Next Steps\nInstructions for step 2.\n\n## Conclusion\nWhat we learned in this tutorial.');
        break;
      case 'quiz':
        setContent('# Quiz Title\n\n## Question 1\nWhat is the answer to this question?\n- [ ] Option A\n- [ ] Option B\n- [x] Option C\n- [ ] Option D\n\n## Question 2\nFill in the blank: _____.\n\nAnswer: The correct answer\n\n## True or False\nThis statement is true.\n\nAnswer: True');
        break;
      default:
        setContent('');
    }
  };

  const insertFormatting = (format: string) => {
    // Get cursor position
    const textArea = document.getElementById('content-area') as HTMLTextAreaElement;
    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newText = content;
    
    switch(format) {
      case 'bold':
        newText = content.substring(0, start) + `**${selectedText || 'bold text'}**` + content.substring(end);
        break;
      case 'italic':
        newText = content.substring(0, start) + `*${selectedText || 'italic text'}*` + content.substring(end);
        break;
      case 'heading':
        newText = content.substring(0, start) + `## ${selectedText || 'Heading'}` + content.substring(end);
        break;
      case 'list':
        newText = content.substring(0, start) + `\n- ${selectedText || 'List item'}` + content.substring(end);
        break;
      case 'image':
        newText = content.substring(0, start) + `![${selectedText || 'Image description'}](image-url)` + content.substring(end);
        break;
      case 'link':
        newText = content.substring(0, start) + `[${selectedText || 'Link text'}](https://example.com)` + content.substring(end);
        break;
      case 'checkbox':
        newText = content.substring(0, start) + `\n- [ ] ${selectedText || 'Task'}` + content.substring(end);
        break;
      case 'fillblank':
        newText = content.substring(0, start) + `___${selectedText || ''}___` + content.substring(end);
        break;
    }
    
    setContent(newText);
    
    // Restore focus to textarea
    setTimeout(() => {
      textArea.focus();
      textArea.setSelectionRange(
        start + (newText.length - content.length),
        start + (newText.length - content.length)
      );
    }, 0);
  };

  const generateBlogCode = () => {
    if (!title.trim()) {
      toast.error('Please add a title for your blog');
      return;
    }
    
    if (!content.trim()) {
      toast.error('Please add content to your blog');
      return;
    }
    
    // Generate date and read time
    const date = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    
    // Estimate read time based on word count (average reading speed: 200 words/minute)
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
    const readTime = `${readTimeMinutes} min${readTimeMinutes > 1 ? 's' : ''} read`;
    
    // Generate the blog code
    const blogData = {
      title,
      content,
      date,
      readTime
    };
    
    const codeString = JSON.stringify(blogData, null, 2);
    setGeneratedCode(codeString);
    setActiveTab('preview');
    
    toast.success('Blog code generated!');
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Please add both title and content');
      return;
    }
    
    // Generate date and read time
    const date = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
    const readTime = `${readTimeMinutes} min${readTimeMinutes > 1 ? 's' : ''} read`;
    
    onSave({ title, content, date, readTime });
    toast.success('Blog saved successfully!');
    onClose();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    toast.success('Code copied to clipboard!');
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="container max-w-4xl mx-auto my-8 p-6 glass rounded-lg animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create New Blog</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
        </div>
        
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Blog Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-medium bg-secondary/60 border-eduAccent/20 focus:border-eduAccent"
          />
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="w-1/3">
            <Select value={template} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2 bg-secondary/60 p-1 rounded-md">
            <Button variant="ghost" size="icon" onClick={() => insertFormatting('bold')} title="Bold">
              <Bold size={18} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => insertFormatting('italic')} title="Italic">
              <Italic size={18} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => insertFormatting('heading')} title="Heading">
              <Heading size={18} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => insertFormatting('list')} title="List">
              <List size={18} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => insertFormatting('image')} title="Image">
              <Image size={18} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => insertFormatting('link')} title="Link">
              <Link size={18} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => insertFormatting('checkbox')} title="Checkbox">
              <Check size={18} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => insertFormatting('fillblank')} title="Fill in the blank">
              <Type size={18} />
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="preview">Preview Code</TabsTrigger>
          </TabsList>
          
          <TabsContent value="write" className="mt-4">
            <textarea
              id="content-area"
              className="content-area w-full"
              rows={15}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your blog content here..."
            />
          </TabsContent>
          
          <TabsContent value="preview" className="mt-4">
            <div className="bg-secondary/60 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium">Generated Blog Code</h3>
                <Button onClick={copyToClipboard} variant="secondary" size="sm">Copy Code</Button>
              </div>
              <pre className="whitespace-pre-wrap text-sm overflow-x-auto p-4 bg-black/30 rounded border border-eduAccent/20">
                {generatedCode || 'Generate code first using the button below'}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="secondary" onClick={generateBlogCode}>Generate Code</Button>
          <Button onClick={handleSave}>Save Blog</Button>
        </div>
      </div>
    </div>
  );
};

export default BlogCreator;
