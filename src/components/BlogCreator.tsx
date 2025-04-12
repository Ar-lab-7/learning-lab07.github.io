
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Bold, Italic, List, Image, Link, Heading, Check, Type, AlignLeft, Table, FileDown, Save, Eye } from 'lucide-react';
import { toast } from 'sonner';
import DevicePreview from './DevicePreview';
import { BlogService } from '@/services/BlogService';
import { marked } from 'marked';
import { Blog } from '@/integrations/supabase/client';

interface BlogCreatorProps {
  onClose: () => void;
  onSave: (blogData: { title: string, content: string, date: string, readTime: string, imageUrl?: string }) => void;
  blogToEdit?: Blog | null;
  onUpdate?: (id: string, blogData: Partial<Blog>) => Promise<void>;
}

const TEMPLATE_OPTIONS = [
  { value: 'blank', label: 'Blank Template' },
  { value: 'article', label: 'Article Template' },
  { value: 'tutorial', label: 'Tutorial Template' },
  { value: 'quiz', label: 'Quiz Template' }
];

const BlogCreator: React.FC<BlogCreatorProps> = ({ onClose, onSave, blogToEdit, onUpdate }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [template, setTemplate] = useState('blank');
  const [activeTab, setActiveTab] = useState('write');
  const [generatedCode, setGeneratedCode] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Initialize with blogToEdit data if provided
  useEffect(() => {
    if (blogToEdit) {
      setTitle(blogToEdit.title);
      setContent(blogToEdit.content);
      setImageUrl(blogToEdit.imageUrl || blogToEdit.image_url || '');
    }
  }, [blogToEdit]);
  
  const handleTemplateChange = (value: string) => {
    // Only apply template if we're not editing an existing blog
    if (blogToEdit) {
      toast.info('Templates cannot be applied when editing a blog');
      return;
    }
    
    setTemplate(value);
    
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
    const textArea = document.getElementById('content-area') as HTMLTextAreaElement;
    if (!textArea) {
      toast.error('Text editor not found');
      return;
    }
    
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
      case 'table':
        newText = content.substring(0, start) + 
        `\n| Header 1 | Header 2 | Header 3 |\n| -------- | -------- | -------- |\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |` + 
        content.substring(end);
        break;
    }
    
    setContent(newText);
    
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
    
    const date = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
    const readTime = `${readTimeMinutes} min${readTimeMinutes > 1 ? 's' : ''} read`;
    
    const blogData = {
      title,
      content,
      date,
      readTime,
      imageUrl: imageUrl || undefined
    };
    
    const codeString = JSON.stringify(blogData, null, 2);
    setGeneratedCode(codeString);
    setActiveTab('preview-code');
    
    toast.success('Blog code generated!');
  };

  const handlePreview = () => {
    try {
      const html = marked.parse(content);
      setPreviewHtml(`<h1>${title}</h1>${html}`);
      setActiveTab('preview-device');
    } catch (error) {
      console.error('Error generating preview:', error);
      toast.error('Failed to generate preview');
    }
  };

  const handleSaveToSupabase = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Please add both title and content');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const date = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
      
      const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
      const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
      const readTime = `${readTimeMinutes} min${readTimeMinutes > 1 ? 's' : ''} read`;
      
      if (blogToEdit && onUpdate) {
        // If editing, update the existing blog
        await onUpdate(blogToEdit.id, {
          title,
          content,
          readTime,
          imageUrl
        });
        toast.success('Blog updated successfully!');
      } else {
        // If creating, save as new blog
        const blogData = {
          title,
          content,
          date,
          readTime,
          imageUrl: imageUrl || undefined
        };
        
        onSave(blogData);
        toast.success('Blog saved successfully!');
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving blog:', error);
      toast.error('Failed to save blog');
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    toast.success('Code copied to clipboard!');
  };

  const downloadBlogFile = () => {
    if (!generatedCode) {
      toast.error('Please generate code first');
      return;
    }
    
    const fileName = title.toLowerCase().replace(/\s+/g, '-') + '.json';
    const blob = new Blob([generatedCode], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`File "${fileName}" downloaded successfully!`);
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="container max-w-4xl mx-auto my-8 p-6 glass rounded-lg animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{blogToEdit ? 'Edit Blog' : 'Create New Blog'}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Input
            type="text"
            placeholder="Blog Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-medium bg-secondary/60 border-eduAccent/20 focus:border-eduAccent"
          />
          
          <Input
            type="text"
            placeholder="Image URL (optional)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="bg-secondary/60 border-eduAccent/20 focus:border-eduAccent"
          />
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="w-1/3">
            <Select value={template} onValueChange={handleTemplateChange} disabled={!!blogToEdit}>
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
          
          <div className="flex items-center space-x-2 bg-secondary/60 p-1 rounded-md overflow-x-auto">
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
            <Button variant="ghost" size="icon" onClick={() => insertFormatting('table')} title="Insert Table">
              <Table size={18} />
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="preview-device" onClick={handlePreview}>Preview</TabsTrigger>
            <TabsTrigger value="preview-code">Generated Code</TabsTrigger>
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
          
          <TabsContent value="preview-device" className="mt-4">
            <DevicePreview contentHtml={previewHtml} />
          </TabsContent>
          
          <TabsContent value="preview-code" className="mt-4">
            <div className="bg-secondary/60 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium">Generated Blog Code</h3>
                <div className="flex gap-2">
                  <Button onClick={copyToClipboard} variant="secondary" size="sm">Copy Code</Button>
                  <Button onClick={downloadBlogFile} variant="secondary" size="sm">
                    <FileDown size={16} className="mr-1" />
                    Download JSON
                  </Button>
                </div>
              </div>
              <pre className="whitespace-pre-wrap text-sm overflow-x-auto p-4 bg-black/30 rounded border border-eduAccent/20">
                {generatedCode || 'Generate code first using the button below'}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="secondary" onClick={generateBlogCode}>
            <FileDown size={16} className="mr-1" />
            Generate Code
          </Button>
          <Button variant="secondary" onClick={handlePreview}>
            <Eye size={16} className="mr-1" />
            Preview
          </Button>
          <Button onClick={handleSaveToSupabase} disabled={isSaving}>
            <Save size={16} className="mr-1" />
            {isSaving ? 'Saving...' : blogToEdit ? 'Update Blog' : 'Save Blog'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BlogCreator;
