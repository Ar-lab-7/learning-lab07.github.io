import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import BlogCard from '@/components/BlogCard';
import SearchBar from '@/components/SearchBar';
import BlogCreator from '@/components/BlogCreator';
import ChatOverlay from '@/components/ChatOverlay';
import BlogViewer from '@/components/BlogViewer';
import QuestionPaperGenerator from '@/components/QuestionPaperGenerator';
import SettingsDialog from '@/components/SettingsDialog';
import LoginDialog from '@/components/LoginDialog';
import { PlusCircle, MessageCircle, BookOpen, FileText, Settings, BarChart2, LogIn, LogOut, User } from 'lucide-react';
import { toast } from 'sonner';
import { useDeviceType } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Blog } from '@/integrations/supabase/client';
import { BlogService } from '@/services/BlogService';
import { TrafficService } from '@/services/TrafficService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Main Index page component
 */
const Index = () => {
  // State management
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [showBlogCreator, setShowBlogCreator] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showQuestionPaper, setShowQuestionPaper] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { isMobile, isTablet } = useDeviceType();
  const { user, profile, signOut, isDeveloper } = useAuth();

  // Record pageview for analytics
  useEffect(() => {
    TrafficService.recordPageview();
  }, []);

  // Load blogs from Supabase
  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true);
      try {
        const fetchedBlogs = await BlogService.getBlogs();
        setBlogs(fetchedBlogs);
        setFilteredBlogs(fetchedBlogs);
      } catch (error) {
        console.error('Error fetching blogs:', error);
        toast.error('Failed to fetch blogs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();

    // Subscribe to changes in the blogs table
    const channel = supabase
      .channel('public:blogs')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blogs',
        },
        () => {
          fetchBlogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
  const handleAddBlog = (blogData: { title: string, content: string, date: string, readTime: string, imageUrl?: string }) => {
    const newBlog: Blog = {
      id: Math.random().toString(36).substring(2, 9), // Temporary ID, will be replaced by Supabase
      title: blogData.title,
      content: blogData.content,
      date: blogData.date,
      read_time: blogData.readTime,
      readTime: blogData.readTime,
      image_url: blogData.imageUrl,
      imageUrl: blogData.imageUrl,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const newBlogs = [...blogs, newBlog];
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

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
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
              
              {isDeveloper && (
                <>
                  <Button 
                    onClick={() => setShowBlogCreator(true)}
                    size={isMobile ? "sm" : "default"}
                  >
                    <PlusCircle className="mr-2" size={isMobile ? 16 : 18} />
                    Create Blog
                  </Button>
                  
                  <Link to="/traffic">
                    <Button
                      variant="secondary"
                      size={isMobile ? "sm" : "default"}
                      className="text-eduLight"
                    >
                      <BarChart2 className="mr-2" size={isMobile ? 16 : 18} />
                      Traffic
                    </Button>
                  </Link>
                </>
              )}
              
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
              
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size={isMobile ? "sm" : "icon"} className="text-eduLight">
                      {isMobile ? (
                        <>
                          <User className="mr-2" size={16} />
                          Profile
                        </>
                      ) : (
                        <User size={20} />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      {profile?.username || user.email}
                      {isDeveloper && <span className="ml-2 text-xs text-primary">(Developer)</span>}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2" size={16} />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => setShowLogin(true)}
                  variant="default"
                  size={isMobile ? "sm" : "default"}
                >
                  <LogIn className="mr-2" size={isMobile ? 16 : 18} />
                  Login
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex justify-center">
            <SearchBar onSearch={handleSearch} />
          </div>
        </header>
        
        <main>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eduAccent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
              {filteredBlogs.length > 0 ? (
                filteredBlogs.map((blog) => (
                  <BlogCard
                    key={blog.id}
                    title={blog.title}
                    date={blog.date}
                    readTime={blog.readTime || blog.read_time}
                    imageUrl={blog.imageUrl || blog.image_url}
                    onClick={() => setSelectedBlog(blog)}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <h3 className="text-xl font-medium text-muted-foreground mb-2">No blogs found</h3>
                  <p className="text-muted-foreground mb-4">
                    {blogs.length === 0 
                      ? 'No blogs have been created yet.' 
                      : 'Create your first blog or try a different search term.'}
                  </p>
                  {isDeveloper && (
                    <Button onClick={() => setShowBlogCreator(true)}>Create Blog</Button>
                  )}
                </div>
              )}
            </div>
          )}
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
      {showBlogCreator && <BlogCreator onClose={() => setShowBlogCreator(false)} onSave={(blogData) => {
        // Convert data format to match what components expect
        const convertedBlog = {
          ...blogData,
          id: Math.random().toString(36).substring(2, 9),
          read_time: blogData.readTime,
          image_url: blogData.imageUrl,
          readTime: blogData.readTime,
          imageUrl: blogData.imageUrl,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        handleAddBlog(blogData);
      }} />}
      {showChat && 
        <ChatOverlay 
          onClose={() => setShowChat(false)} 
          blogs={blogs.map(blog => ({
            title: blog.title,
            content: blog.content,
            date: blog.date,
            readTime: blog.readTime,
            imageUrl: blog.imageUrl
          }))} 
        />
      }
      
      {selectedBlog && 
        <BlogViewer 
          blog={{
            title: selectedBlog.title,
            content: selectedBlog.content,
            date: selectedBlog.date,
            readTime: selectedBlog.readTime,
            imageUrl: selectedBlog.imageUrl
          }} 
          onClose={() => setSelectedBlog(null)} 
        />
      }
      
      {showQuestionPaper && 
        <QuestionPaperGenerator 
          onClose={() => setShowQuestionPaper(false)} 
          blogs={blogs.map(blog => ({
            title: blog.title,
            content: blog.content,
            date: blog.date,
            readTime: blog.readTime,
            imageUrl: blog.imageUrl
          }))} 
        />
      }
      
      {/* Settings Dialog */}
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
      
      {/* Login Dialog */}
      <LoginDialog open={showLogin} onOpenChange={setShowLogin} />
    </div>
  );
};

export default Index;
