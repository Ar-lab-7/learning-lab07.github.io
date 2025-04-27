
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Default admin credentials
const DEFAULT_ADMIN = {
  email: 'abhinav@2010learner',
  password: 'learning-67-lab+@2010'
};

export const AuthService = {
  // Check if the entered credentials match the admin credentials
  verifyAdminCredentials: async (username: string, password: string): Promise<boolean> => {
    // Check if the entered credentials match the admin credentials
    if (username === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
      localStorage.setItem('isAdminLoggedIn', 'true');
      return true;
    }
    return false;
  },

  // Check if user is logged in as admin
  isAdminLoggedIn: (): boolean => {
    return localStorage.getItem('isAdminLoggedIn') === 'true';
  },

  // Log out admin
  logoutAdmin: (): void => {
    localStorage.removeItem('isAdminLoggedIn');
    toast.success('Logged out successfully');
  }
};
