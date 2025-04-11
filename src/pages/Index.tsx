
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import BlogCard from '@/components/BlogCard';
import SearchBar from '@/components/SearchBar';
import BlogCreator from '@/components/BlogCreator';
import ChatOverlay from '@/components/ChatOverlay';
import BlogViewer from '@/components/BlogViewer';
import { PlusCircle, MessageCircle, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

// Sample blogs data structure
const sampleBlogs = [
  {
    title: "Introduction to Web Development",
    content: "# Introduction to Web Development\n\nWeb development is the work involved in developing a website for the Internet or an intranet. Web development can range from developing a simple single static page of plain text to complex web applications, electronic businesses, and social network services.\n\n## Frontend Development\n\nFrontend development deals with the visual aspects of a website - the part that users interact with.\n\n* HTML for structure\n* CSS for styling\n* JavaScript for interactivity\n\n## Backend Development\n\nBackend development focuses on databases, server configuration, and application logic.\n\n* Node.js\n* Python\n* Ruby\n* Java\n\n## Getting Started\n\nTo get started with web development, you should first learn the basics of HTML and CSS. These are the building blocks of the web.",
    date: "Apr 10, 2025",
    readTime: "3 mins read"
  },
  {
    title: "Understanding Algorithms and Data Structures",
    content: "# Algorithms and Data Structures\n\nAlgorithms and data structures are essential concepts in computer science and programming.\n\n## What are Data Structures?\n\nData structures are specialized formats for organizing and storing data. Some common data structures include:\n\n- Arrays\n- Linked Lists\n- Stacks\n- Queues\n- Trees\n- Graphs\n- Hash Tables\n\n## Common Algorithms\n\n### Sorting Algorithms\n\nSorting algorithms arrange data in a certain order, most commonly in numerical or lexicographical order.\n\n- Bubble Sort\n- Insertion Sort\n- Quick Sort\n- Merge Sort\n\n### Search Algorithms\n\nSearch algorithms help find specific items in a data structure.\n\n- Linear Search\n- Binary Search\n\n## Complexity Analysis\n\nWe analyze algorithms using **Big O notation** which describes the performance or complexity of an algorithm.",
    date: "Apr 11, 2025",
    readTime: "4 mins read"
  }
];

const Index = () => {
  const [blogs, setBlogs] = useState(sampleBlogs);
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

  const handleImportBlogs = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const importedData = JSON.parse(content);
        
        if (Array.isArray(importedData)) {
          setBlogs(importedData);
          setFilteredBlogs(importedData);
          toast.success('Blogs imported successfully!');
        } else if (typeof importedData === 'object') {
          // Single blog import
          const newBlogs = [...blogs, importedData];
          setBlogs(newBlogs);
          setFilteredBlogs(newBlogs);
          toast.success('Blog imported successfully!');
        } else {
          toast.error('Invalid import format');
        }
      } catch (error) {
        console.error('Error importing blogs:', error);
        toast.error('Failed to import blogs');
      }
    };
    
    reader.readAsText(file);
    // Reset the input
    e.target.value = '';
  };

  const exportBlogs = () => {
    const dataStr = JSON.stringify(blogs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'eduScribeBlogs.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
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
              <div className="relative">
                <input
                  type="file"
                  id="import-blogs"
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  accept=".json"
                  onChange={handleImportBlogs}
                />
                <Button variant="outline" size="sm">
                  Import
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={exportBlogs}>
                Export
              </Button>
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
