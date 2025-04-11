
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import BlogCard from '@/components/BlogCard';
import SearchBar from '@/components/SearchBar';
import BlogCreator from '@/components/BlogCreator';
import ChatOverlay from '@/components/ChatOverlay';
import BlogViewer from '@/components/BlogViewer';
import QuestionPaperGenerator from '@/components/QuestionPaperGenerator';
import SettingsDialog from '@/components/SettingsDialog';
import { PlusCircle, MessageCircle, BookOpen, FileText, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useDeviceType } from '@/hooks/use-mobile';

// Import sample blogs from local files
import webDevBlog from '@/blogs/webDevelopment.json';
import algorithmsBlog from '@/blogs/algorithms.json';

/**
 * Main Index page component
 */
const Index = () => {
  // State management
  const [blogs, setBlogs] = useState([webDevBlog, algorithmsBlog]);
  const [filteredBlogs, setFilteredBlogs] = useState(blogs);
  const [showBlogCreator, setShowBlogCreator] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showQuestionPaper, setShowQuestionPaper] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<typeof blogs[0] | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const { isMobile, isTablet } = useDeviceType();

  // Load blogs from localStorage on mount
  useEffect(() => {
    // Try to load saved blogs from localStorage
    const savedBlogs = localStorage.getItem('learningLabBlogs');
    if (savedBlogs) {
      try {
        const parsedBlogs = JSON.parse(savedBlogs);
        if (Array.isArray(parsedBlogs) && parsedBlogs.length) {
          setBlogs(parsedBlogs);
          setFilteredBlogs(parsedBlogs);
        }
      } catch (error) {
        console.error('Error loading saved blogs:', error);
        toast.error('Failed to load saved blogs');
      }
    }
  }, []);

  // Save blogs to localStorage when they change
  useEffect(() => {
    localStorage.setItem('learningLabBlogs', JSON.stringify(blogs));
  }, [blogs]);

  // Handle search functionality
  const handleSearch = (term: string) => {
    if (!term.trim()) {
      setFilteredBlogs(blogs);
      return;
    }
    
    const normalized = term.toLowerCase();
    const filtered = blogs.filter(blog => 
      blog.title.toLowerCase().includes(normalized) || 
      blog.content.toLowerCase().includes(normalized)
    );
    
    setFilteredBlogs(filtered);
    
    // Show feedback about search results
    if (filtered.length === 0) {
      toast.info('No blogs match your search criteria');
    }
  };

  // Handle adding a new blog
  const handleAddBlog = (blogData: typeof blogs[0]) => {
    const newBlogs = [...blogs, blogData];
    setBlogs(newBlogs);
    setFilteredBlogs(newBlogs);
    toast.success('New blog added successfully!');
  };

  // Handle overlay visibility toggling with animation
  const closeBlogViewer = () => {
    const overlay = document.querySelector('.overlay');
    if (overlay) {
      overlay.classList.add('closing');
      setTimeout(() => {
        setSelectedBlog(null);
      }, 300);
    } else {
      setSelectedBlog(null);
    }
  };

  const closeBlogCreator = () => {
    const overlay = document.querySelector('.overlay');
    if (overlay) {
      overlay.classList.add('closing');
      setTimeout(() => {
        setShowBlogCreator(false);
      }, 300);
    } else {
      setShowBlogCreator(false);
    }
  };

  const closeChat = () => {
    const overlay = document.querySelector('.overlay');
    if (overlay) {
      overlay.classList.add('closing');
      setTimeout(() => {
        setShowChat(false);
      }, 300);
    } else {
      setShowChat(false);
    }
  };

  const closeQuestionPaper = () => {
    const overlay = document.querySelector('.overlay');
    if (overlay) {
      overlay.classList.add('closing');
      setTimeout(() => {
        setShowQuestionPaper(false);
      }, 300);
    } else {
      setShowQuestionPaper(false);
    }
  };

  return (
    <div className="min-h-screen bg-eduDark flex flex-col">
      <div className="container mx-auto px-4 py-6 sm:py-8 flex-grow">
        <header className="mb-8 sm:mb-10">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="text-eduAccent" size={isMobile ? 24 : 28} />
              <h1 className="text-2xl sm:text-3xl font-bold text-eduLight">Learning Lab</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-center">
              <Button 
                onClick={() => setShowChat(true)}
                className="bg-eduAccent/20 hover:bg-eduAccent/30 text-eduLight"
                size={isMobile ? "sm" : "default"}
              >
                <MessageCircle className="mr-2" size={isMobile ? 16 : 18} />
                Chat Q&A
              </Button>
              <Button 
                onClick={() => setShowQuestionPaper(true)}
                className="bg-eduAccent/20 hover:bg-eduAccent/30 text-eduLight"
                size={isMobile ? "sm" : "default"}
              >
                <FileText className="mr-2" size={isMobile ? 16 : 18} />
                Question Paper
              </Button>
              <Button 
                onClick={() => setShowBlogCreator(true)}
                size={isMobile ? "sm" : "default"}
              >
                <PlusCircle className="mr-2" size={isMobile ? 16 : 18} />
                Create Blog
              </Button>
              <Button
                onClick={() => setShowSettings(true)}
                variant="ghost"
                size={isMobile ? "sm" : "icon"}
                className="text-eduLight"
                title="Settings"
              >
                {isMobile ? (
                  <Settings className="mr-2" size={16} />
                ) : (
                  <Settings size={20} />
                )}
                {isMobile && "Settings"}
              </Button>
            </div>
          </div>
          
          <div className="flex justify-center">
            <SearchBar onSearch={handleSearch} />
          </div>
        </header>
        
        <main>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {filteredBlogs.length > 0 ? (
              filteredBlogs.map((blog, index) => (
                <BlogCard
                  key={index}
                  title={blog.title}
                  date={blog.date}
                  readTime={blog.readTime}
                  imageUrl={blog.imageUrl}
                  onClick={() => setSelectedBlog(blog)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <h3 className="text-xl font-medium text-muted-foreground mb-2">No blogs found</h3>
                <p className="text-muted-foreground mb-4">Create your first blog or try a different search term.</p>
                <Button onClick={() => setShowBlogCreator(true)}>Create Blog</Button>
              </div>
            )}
          </div>
        </main>
      </div>
      
      <footer className="mt-auto py-4 sm:py-6 bg-secondary/20 border-t border-white/10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Learning Lab. Created by AR Labs
          </p>
        </div>
      </footer>
      
      {/* Modals and Overlays */}
      {showBlogCreator && <BlogCreator onClose={closeBlogCreator} onSave={handleAddBlog} />}
      {showChat && <ChatOverlay onClose={closeChat} blogs={blogs} />}
      {selectedBlog && <BlogViewer blog={selectedBlog} onClose={closeBlogViewer} />}
      {showQuestionPaper && <QuestionPaperGenerator onClose={closeQuestionPaper} blogs={blogs} />}
      
      {/* Settings Dialog */}
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
    </div>
  );
};

export default Index;
