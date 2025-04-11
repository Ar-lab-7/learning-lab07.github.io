
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, CalendarIcon, ClockIcon } from 'lucide-react';

interface BlogViewerProps {
  blog: {
    title: string;
    content: string;
    date: string;
    readTime: string;
  };
  onClose: () => void;
}

const BlogViewer: React.FC<BlogViewerProps> = ({ blog, onClose }) => {
  // Function to render markdown-like content
  const renderContent = (content: string) => {
    // Replace headings
    let html = content
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold my-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold my-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium my-2">$1</h3>');
    
    // Replace bold and italic
    html = html
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Replace lists
    html = html.replace(/^- (.*$)/gm, '<li class="ml-5">$1</li>');
    html = html.replace(/<\/li>\n<li/g, '</li><li');
    html = html.replace(/(<li.*<\/li>)/s, '<ul class="my-2">$1</ul>');
    
    // Replace checkboxes
    html = html
      .replace(/\[x\] (.*$)/gm, '<div class="flex items-center gap-2 ml-5 my-1"><input type="checkbox" checked disabled /><span>$1</span></div>')
      .replace(/\[ \] (.*$)/gm, '<div class="flex items-center gap-2 ml-5 my-1"><input type="checkbox" disabled /><span>$1</span></div>');
    
    // Replace images
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="my-4 rounded-lg max-w-full" />');
    
    // Replace links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-eduHighlight hover:underline" target="_blank">$1</a>');
    
    // Replace fill in the blanks
    html = html.replace(/_{3,}(.*?)_{3,}/g, '<span class="px-2 mx-1 border-b-2 border-eduAccent">$1</span>');
    
    // Replace paragraphs
    html = html.replace(/^(?!<[a-z]).+/gm, '<p class="my-2">$&</p>');
    
    // Fix any broken paragraphs
    html = html.replace(/<p><\/p>/g, '');
    
    return { __html: html };
  };
  
  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="container max-w-3xl mx-auto my-8 glass rounded-lg animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold">{blog.title}</h1>
          <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
        </div>
        
        <div className="flex items-center gap-6 px-6 py-3 border-b border-white/10 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <CalendarIcon size={14} />
            <span>{blog.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <ClockIcon size={14} />
            <span>{blog.readTime}</span>
          </div>
        </div>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="p-6">
            <div 
              className="prose prose-invert prose-eduAccent max-w-none"
              dangerouslySetInnerHTML={renderContent(blog.content)}
            />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default BlogViewer;
