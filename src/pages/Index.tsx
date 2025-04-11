
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import BlogCard from '@/components/BlogCard';
import SearchBar from '@/components/SearchBar';
import BlogCreator from '@/components/BlogCreator';
import ChatOverlay from '@/components/ChatOverlay';
import BlogViewer from '@/components/BlogViewer';
import { PlusCircle, MessageCircle, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

// Import sample blogs from local files
import webDevBlog from '@/blogs/webDevelopment.json';
import algorithmsBlog from '@/blogs/algorithms.json';

const Index = () => {
  // Initialize with the sample blogs
  const [blogs, setBlogs] = useState([webDevBlog, algorithmsBlog]);
  const [filteredBlogs, setFilteredBlogs] = useState(blogs);
  const [showBlogCreator, setShowBlogCreator] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<typeof blogs[0] | null>(null);

  useEffect(() => {
    // Try to load saved blogs from localStorage
    const savedBlogs = localStorage.getItem('eduScribeBlogs');
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

  useEffect(() => {
    // Save blogs to localStorage whenever they change
    localStorage.setItem('eduScribeBlogs', JSON.stringify(blogs));
  }, [blogs]);

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
  };

  const handleAddBlog = (blogData: typeof blogs[0]) => {
    const newBlogs = [...blogs, blogData];
    setBlogs(newBlogs);
    setFilteredBlogs(newBlogs);
    toast.success('New blog added successfully!');
  };

  // Handle blog visibility toggling with animation
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

  return (
    <div className="min-h-screen bg-eduDark">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <BookOpen className="text-eduAccent" size={28} />
              <h1 className="text-3xl font-bold text-eduLight">EduScribe Canvas</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setShowChat(true)}
                className="bg-eduAccent/20 hover:bg-eduAccent/30 text-eduLight"
              >
                <MessageCircle className="mr-2" size={18} />
                Chat Q&A
              </Button>
              <Button onClick={() => setShowBlogCreator(true)}>
                <PlusCircle className="mr-2" size={18} />
                Create Blog
              </Button>
            </div>
          </div>
          
          <div className="flex justify-center">
            <SearchBar onSearch={handleSearch} />
          </div>
        </header>
        
        <main>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      
      {showBlogCreator && <BlogCreator onClose={closeBlogCreator} onSave={handleAddBlog} />}
      {showChat && <ChatOverlay onClose={closeChat} blogs={blogs} />}
      {selectedBlog && <BlogViewer blog={selectedBlog} onClose={closeBlogViewer} />}
    </div>
  );
};

export default Index;
