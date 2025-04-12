
import { supabase, Blog } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const BlogService = {
  // Get all blogs from Supabase
  getBlogs: async (): Promise<Blog[]> => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching blogs:', error);
        toast.error('Failed to fetch blogs');
        return [];
      }

      // Convert database field names to component field names for compatibility
      return (data || []).map(blog => ({
        ...blog,
        readTime: blog.read_time,
        imageUrl: blog.image_url || undefined
      }));
    } catch (error) {
      console.error('Error in getBlogs:', error);
      toast.error('Failed to fetch blogs');
      return [];
    }
  },

  // Create a new blog in Supabase
  createBlog: async (blogData: Omit<Blog, 'id' | 'created_at' | 'updated_at' | 'author_id'>): Promise<Blog | null> => {
    try {
      // Ensure we have the database fields set
      const dbBlogData = {
        title: blogData.title,
        content: blogData.content,
        date: blogData.date,
        read_time: blogData.readTime,
        image_url: blogData.imageUrl
      };

      const { data, error } = await supabase
        .from('blogs')
        .insert(dbBlogData)
        .select()
        .single();

      if (error) {
        console.error('Error creating blog:', error);
        toast.error('Failed to create blog');
        return null;
      }

      // Map the response to include the component-expected fields
      const responseBlog: Blog = {
        ...data,
        readTime: data.read_time,
        imageUrl: data.image_url
      };

      toast.success('Blog created successfully');
      return responseBlog;
    } catch (error) {
      console.error('Error in createBlog:', error);
      toast.error('Failed to create blog');
      return null;
    }
  },

  // Update an existing blog
  updateBlog: async (id: string, blogData: Partial<Blog>): Promise<Blog | null> => {
    try {
      // Convert component field names to database field names if needed
      const dbUpdateData: any = {
        ...blogData
      };
      
      if (blogData.readTime) {
        dbUpdateData.read_time = blogData.readTime;
        delete dbUpdateData.readTime;
      }
      
      if (blogData.imageUrl) {
        dbUpdateData.image_url = blogData.imageUrl;
        delete dbUpdateData.imageUrl;
      }

      const { data, error } = await supabase
        .from('blogs')
        .update(dbUpdateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating blog:', error);
        toast.error('Failed to update blog');
        return null;
      }

      // Map the response to include the component-expected fields
      const responseBlog: Blog = {
        ...data,
        readTime: data.read_time,
        imageUrl: data.image_url
      };

      toast.success('Blog updated successfully');
      return responseBlog;
    } catch (error) {
      console.error('Error in updateBlog:', error);
      toast.error('Failed to update blog');
      return null;
    }
  },

  // Delete a blog
  deleteBlog: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting blog:', error);
        toast.error('Failed to delete blog');
        return false;
      }

      toast.success('Blog deleted successfully');
      return true;
    } catch (error) {
      console.error('Error in deleteBlog:', error);
      toast.error('Failed to delete blog');
      return false;
    }
  },

  // Save a blog to local storage (for non-developer users)
  saveToLocalStorage: (blog: Omit<Blog, 'id' | 'created_at' | 'updated_at' | 'author_id'>) => {
    try {
      const savedBlogs = JSON.parse(localStorage.getItem('userBlogs') || '[]');
      const newBlog = {
        ...blog,
        id: `local-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      savedBlogs.push(newBlog);
      localStorage.setItem('userBlogs', JSON.stringify(savedBlogs));
      
      toast.success('Blog saved to local storage');
      return newBlog;
    } catch (error) {
      console.error('Error saving to local storage:', error);
      toast.error('Failed to save blog locally');
      return null;
    }
  },
  
  // Get blogs from local storage
  getLocalBlogs: (): Blog[] => {
    try {
      const savedBlogs = JSON.parse(localStorage.getItem('userBlogs') || '[]');
      return savedBlogs.map((blog: any) => ({
        ...blog,
        readTime: blog.readTime || blog.read_time,
        imageUrl: blog.imageUrl || blog.image_url
      }));
    } catch (error) {
      console.error('Error getting blogs from local storage:', error);
      return [];
    }
  }
};
