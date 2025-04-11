
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, CalendarIcon, ClockIcon, Download, Copy, Share } from 'lucide-react';
import { useDeviceType } from '@/hooks/use-mobile';
import { toast } from 'sonner';

interface BlogViewerProps {
  blog: {
    title: string;
    content: string;
    date: string;
    readTime: string;
    imageUrl?: string;
  };
  onClose: () => void;
}

const BlogViewer: React.FC<BlogViewerProps> = ({ blog, onClose }) => {
  const { isMobile, isTablet } = useDeviceType();
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Enable smooth scrolling for the content
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
  
  // Function to handle sharing the blog
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: `Check out this blog: ${blog.title}`,
          url: window.location.href,
        });
        toast.success('Blog shared successfully!');
      } catch (error) {
        console.error('Error sharing:', error);
        toast.error('Failed to share the blog');
      }
    } else {
      // Fallback to copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('URL copied to clipboard!');
    }
  };
  
  // Function to copy blog content
  const copyContent = () => {
    navigator.clipboard.writeText(blog.content);
    toast.success('Blog content copied to clipboard!');
  };
  
  // Function to download blog as text file
  const downloadBlog = () => {
    const element = document.createElement('a');
    const file = new Blob([blog.content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${blog.title.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Blog downloaded successfully!');
  };
  
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
    html = html.replace(/(<li.*<\/li>)/gs, '<ul class="my-2">$1</ul>');
    
    // Replace tables
    const convertTable = (match: string) => {
      const rows = match.trim().split('\n');
      let tableHtml = '<div class="overflow-x-auto my-4"><table class="w-full border-collapse">';
      
      rows.forEach((row, rowIndex) => {
        const cells = row.split('|').filter(cell => cell.trim() !== '');
        const isHeader = rowIndex === 0;
        const isDelimiter = row.includes('----');
        
        if (!isDelimiter) {
          tableHtml += '<tr>';
          cells.forEach(cell => {
            if (isHeader) {
              tableHtml += `<th class="border border-white/20 px-3 py-2 bg-white/5">${cell.trim()}</th>`;
            } else {
              tableHtml += `<td class="border border-white/20 px-3 py-2">${cell.trim()}</td>`;
            }
          });
          tableHtml += '</tr>';
        }
      });
      
      tableHtml += '</table></div>';
      return tableHtml;
    };
    
    // Find and convert tables
    const tableRegex = /\|.*\|[\s\S]*?\|.*\|/g;
    html = html.replace(tableRegex, convertTable);
    
    // Replace checkboxes
    html = html
      .replace(/\[x\] (.*$)/gm, '<div class="flex items-center gap-2 ml-5 my-1"><input type="checkbox" checked disabled /><span>$1</span></div>')
      .replace(/\[ \] (.*$)/gm, '<div class="flex items-center gap-2 ml-5 my-1"><input type="checkbox" disabled /><span>$1</span></div>');
    
    // Replace images with responsive handling
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, 
      '<div class="my-4"><img src="$2" alt="$1" class="rounded-lg max-w-full max-h-[50vh] object-contain mx-auto" loading="lazy" onerror="this.onerror=null; this.src=\'/placeholder.svg\'; this.classList.add(\'border\', \'border-dashed\', \'border-gray-400\', \'p-4\');" /></div>'
    );
    
    // Replace links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-eduHighlight hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Replace fill in the blanks
    html = html.replace(/_{3,}(.*?)_{3,}/g, '<span class="px-2 mx-1 border-b-2 border-eduAccent">$1</span>');
    
    // Replace code blocks with syntax highlighting
    html = html.replace(/```(.*?)\n([\s\S]*?)```/g, 
      '<pre class="bg-black/30 p-3 rounded-md overflow-x-auto my-3"><code class="language-$1">$2</code></pre>'
    );
    
    // Replace inline code
    html = html.replace(/`(.*?)`/g, '<code class="bg-black/20 px-1 rounded text-eduHighlight">$1</code>');
    
    // Replace paragraphs
    html = html.replace(/^(?!<[a-z]).+/gm, '<p class="my-2">$&</p>');
    
    // Fix any broken paragraphs
    html = html.replace(/<p><\/p>/g, '');
    
    return { __html: html };
  };
  
  return (
    <div 
      className="overlay" 
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="blog-title"
    >
      <div 
        className="container max-w-3xl mx-auto my-6 glass rounded-lg animate-fade-in max-h-[90vh] flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-3 sm:p-4 md:p-5 border-b border-white/10 sticky top-0 bg-eduDark/80 backdrop-blur-md z-10">
          <h1 id="blog-title" className="text-lg sm:text-xl md:text-2xl font-bold line-clamp-1">{blog.title}</h1>
          <div className="flex items-center gap-1 sm:gap-2">
            {!isMobile && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={downloadBlog} 
                  className="text-eduLight/70 hover:text-eduLight"
                  title="Download blog"
                >
                  <Download size={18} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={copyContent} 
                  className="text-eduLight/70 hover:text-eduLight"
                  title="Copy content"
                >
                  <Copy size={18} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleShare} 
                  className="text-eduLight/70 hover:text-eduLight"
                  title="Share blog"
                >
                  <Share size={18} />
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} className="text-eduLight">
              <X size={20} />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6 px-3 sm:px-4 md:px-5 py-2 border-b border-white/10 text-xs sm:text-sm text-muted-foreground sticky top-[57px] sm:top-[65px] md:top-[73px] bg-eduDark/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-1">
            <CalendarIcon size={14} />
            <span>{blog.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <ClockIcon size={14} />
            <span>{blog.readTime}</span>
          </div>
          
          {isMobile && (
            <div className="flex items-center gap-2 ml-auto">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={copyContent} 
                className="h-7 w-7 text-eduLight/70"
              >
                <Copy size={14} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={downloadBlog} 
                className="h-7 w-7 text-eduLight/70"
              >
                <Download size={14} />
              </Button>
            </div>
          )}
        </div>
        
        {blog.imageUrl && (
          <div className="px-3 sm:px-4 md:px-5 pt-3 sm:pt-4 relative max-h-[25vh] sm:max-h-[30vh] overflow-hidden">
            <img 
              src={blog.imageUrl} 
              alt={blog.title} 
              className="w-full object-cover rounded-lg max-h-[25vh] sm:max-h-[30vh]"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = '/placeholder.svg';
                target.classList.add('border', 'border-dashed', 'border-gray-400', 'p-4');
              }}
            />
          </div>
        )}
        
        <ScrollArea className="flex-grow overflow-auto">
          <div className="p-3 sm:p-4 md:p-5" ref={contentRef}>
            <div 
              className="prose prose-invert prose-eduAccent max-w-none"
              dangerouslySetInnerHTML={renderContent(blog.content)}
            />
          </div>
        </ScrollArea>
        
        {/* Mobile action bar */}
        {isMobile && (
          <div className="p-3 border-t border-white/10 flex justify-center">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleShare} 
              className="px-4"
            >
              <Share size={14} className="mr-2" />
              Share
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogViewer;
