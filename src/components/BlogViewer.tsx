
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, CalendarIcon, ClockIcon, Download, Copy, Share } from 'lucide-react';
import { useDeviceType } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import DevicePreview from './DevicePreview';
import { marked } from 'marked';
import PdfExport from './PdfExport';

interface BlogViewerProps {
  blog: {
    title: string;
    content: string;
    date: string;
    readTime: string;
    imageUrl?: string;
    subject?: string;
  };
  onClose: () => void;
}

const BlogViewer: React.FC<BlogViewerProps> = ({ blog, onClose }) => {
  const { isMobile } = useDeviceType();
  
  useEffect(() => {
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
  
  // Convert markdown to HTML for preview
  const previewHtml = `<h1>${blog.title}</h1>${marked.parse(blog.content)}`;
  
  return (
    <div 
      className="overlay" 
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="blog-title"
    >
      <div 
        className="container max-w-4xl mx-auto my-6 glass rounded-lg animate-fade-in max-h-[90vh] flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-3 sm:p-4 md:p-5 border-b border-white/10 sticky top-0 bg-eduDark/80 backdrop-blur-md z-10">
          <h1 id="blog-title" className="text-lg sm:text-xl md:text-2xl font-bold line-clamp-1">{blog.title}</h1>
          <div className="flex items-center gap-1 sm:gap-2">
            {!isMobile && (
              <>
                <PdfExport 
                  content={blog.content} 
                  title={blog.title}
                  fileName={`${blog.title.replace(/\s+/g, '-').toLowerCase()}.pdf`}
                />
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
          {blog.subject && (
            <div className="flex items-center gap-1">
              <span className="px-2 py-0.5 bg-accent/20 rounded-full text-xs">
                {blog.subject}
              </span>
            </div>
          )}
          
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
            </div>
          )}
        </div>
        
        <div className="flex-grow overflow-auto">
          <DevicePreview contentHtml={previewHtml} />
        </div>
        
        {/* Mobile action bar */}
        {isMobile && (
          <div className="p-3 border-t border-white/10 flex justify-center gap-2">
            <PdfExport 
              content={blog.content} 
              title={blog.title}
              fileName={`${blog.title.replace(/\s+/g, '-').toLowerCase()}.pdf`}
            />
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
