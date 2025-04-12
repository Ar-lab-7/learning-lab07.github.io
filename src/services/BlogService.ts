
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

      return data || [];
    } catch (error) {
      console.error('Error in getBlogs:', error);
      toast.error('Failed to fetch blogs');
      return [];
    }
  },

  // Create a new blog in Supabase
  createBlog: async (blogData: Omit<Blog, 'id' | 'created_at' | 'updated_at' | 'author_id'>): Promise<Blog | null> => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .insert({
          ...blogData,
          author_id: supabase.auth.getUser().then(res => res.data.user?.id),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating blog:', error);
        toast.error('Failed to create blog');
        return null;
      }

      toast.success('Blog created successfully');
      return data;
    } catch (error) {
      console.error('Error in createBlog:', error);
      toast.error('Failed to create blog');
      return null;
    }
  },

  // Update an existing blog
  updateBlog: async (id: string, blogData: Partial<Blog>): Promise<Blog | null> => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .update(blogData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating blog:', error);
        toast.error('Failed to update blog');
        return null;
      }

      toast.success('Blog updated successfully');
      return data;
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
  }
};
