import React, { useState, useEffect } from 'react';
import { QuizService } from '@/services/QuizService';
import { Quiz } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import QuizGenerator from '@/components/QuizGenerator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Timer, AlertCircle, Lock, ArrowRight } from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

const QuizPage = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const { user } = useAuth();

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      let fetchedQuizzes: Quiz[] = [];
      
      // Get quizzes from database if user is authenticated
      if (user) {
        fetchedQuizzes = await QuizService.getQuizzes();
      }
      
      // Get quizzes from local storage (for all users, they might have created some while logged out)
      const localQuizzes = QuizService.getLocalQuizzes();
      
      // Combine and sort by created_at date (newest first)
      const combinedQuizzes = [...fetchedQuizzes, ...localQuizzes].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setQuizzes(combinedQuizzes);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [user]);

  const handleCreateClose = () => {
    setCreateOpen(false);
    fetchQuizzes();
  };

  // Determine if a quiz is active (not expired)
  const isQuizActive = (quiz: Quiz) => {
    return !isPast(new Date(quiz.expires_at));
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Quizzes</h1>
          <p className="text-muted-foreground">Create and take quizzes to test your knowledge</p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>Create Quiz</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[90%] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create a New Quiz</DialogTitle>
            </DialogHeader>
            <QuizGenerator onClose={handleCreateClose} />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => {
            const isActive = isQuizActive(quiz);
            const expiresIn = formatDistanceToNow(new Date(quiz.expires_at), { addSuffix: true });
            
            return (
              <Card 
                key={quiz.id} 
                className={`${!isActive ? 'opacity-60' : ''} transition-all hover:shadow-lg`}
              >
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <div className="flex-1 truncate mr-2">
                      {quiz.title}
                    </div>
                    {quiz.password && (
                      <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </CardTitle>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      <span>{format(new Date(quiz.created_at), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      <span>{quiz.questions.length} questions</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                    </span>
                    
                    {!isActive && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                        Expired
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm">
                    {isActive ? (
                      <span className="flex items-center gap-1">
                        <Timer className="h-3 w-3 text-muted-foreground" />
                        <span>Expires {expiresIn}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 text-muted-foreground" />
                        <span>Expired {expiresIn}</span>
                      </span>
                    )}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    asChild 
                    className="w-full"
                    variant={isActive ? "default" : "outline"}
                    disabled={!isActive}
                  >
                    <Link to={`/quiz/${quiz.id}`}>
                      {isActive ? 'Take Quiz' : 'Quiz Expired'} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold mb-2">No Quizzes Found</h2>
          <p className="text-muted-foreground mb-4">
            Create your first quiz to get started
          </p>
          <Button onClick={() => setCreateOpen(true)}>
            Create a Quiz
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuizPage;
