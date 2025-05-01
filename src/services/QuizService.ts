
import { supabase, Quiz, QuizQuestion } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const QuizService = {
  // Create a new quiz competition
  createQuiz: async (quizData: Omit<Quiz, 'id' | 'created_at' | 'author_id'>): Promise<Quiz | null> => {
    try {
      console.log('Creating quiz:', quizData);
      
      // Store questions as JSONB
      const { data, error } = await supabase
        .from('quizzes')
        .insert({
          title: quizData.title,
          questions: quizData.questions,
          difficulty: quizData.difficulty,
          expires_at: quizData.expires_at,
          password: quizData.password
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating quiz:', error);
        toast.error(`Failed to create quiz: ${error.message}`);
        return null;
      }

      toast.success('Quiz created successfully');
      return data;
    } catch (error) {
      console.error('Error in createQuiz:', error);
      toast.error('Failed to create quiz');
      return null;
    }
  },

  // Get all quizzes
  getQuizzes: async (): Promise<Quiz[]> => {
    try {
      console.log('Fetching quizzes');
      
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching quizzes:', error);
        toast.error('Failed to fetch quizzes');
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getQuizzes:', error);
      toast.error('Failed to fetch quizzes');
      return [];
    }
  },

  // Get active quizzes (not expired)
  getActiveQuizzes: async (): Promise<Quiz[]> => {
    try {
      console.log('Fetching active quizzes');
      
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .gte('expires_at', now)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching active quizzes:', error);
        toast.error('Failed to fetch active quizzes');
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getActiveQuizzes:', error);
      toast.error('Failed to fetch active quizzes');
      return [];
    }
  },

  // Get a specific quiz by ID
  getQuiz: async (id: string): Promise<Quiz | null> => {
    try {
      console.log('Fetching quiz:', id);
      
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching quiz:', error);
        toast.error('Failed to fetch quiz');
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getQuiz:', error);
      toast.error('Failed to fetch quiz');
      return null;
    }
  },

  // Check quiz password
  checkPassword: async (quizId: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('password')
        .eq('id', quizId)
        .single();

      if (error) {
        console.error('Error checking password:', error);
        return false;
      }

      // If no password set, allow access
      if (!data?.password) return true;
      
      // Check password match
      return data.password === password;
    } catch (error) {
      console.error('Error in checkPassword:', error);
      return false;
    }
  },

  // Save a quiz locally (for non-developer users)
  saveToLocalStorage: (quiz: Omit<Quiz, 'id' | 'created_at' | 'author_id'>) => {
    try {
      const savedQuizzes = JSON.parse(localStorage.getItem('userQuizzes') || '[]');
      const newQuiz = {
        ...quiz,
        id: `local-${Date.now()}`,
        created_at: new Date().toISOString()
      };
      
      savedQuizzes.push(newQuiz);
      localStorage.setItem('userQuizzes', JSON.stringify(savedQuizzes));
      
      toast.success('Quiz saved to local storage');
      return newQuiz;
    } catch (error) {
      console.error('Error saving to local storage:', error);
      toast.error('Failed to save quiz locally');
      return null;
    }
  },
  
  // Get quizzes from local storage
  getLocalQuizzes: (): Quiz[] => {
    try {
      return JSON.parse(localStorage.getItem('userQuizzes') || '[]');
    } catch (error) {
      console.error('Error getting quizzes from local storage:', error);
      return [];
    }
  }
};
