
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { QuizService } from '@/services/QuizService';
import { Quiz } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import QuizTaker from '@/components/QuizTaker';

const QuizTakePage = () => {
  const { id } = useParams<{ id: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Check if it's a local quiz
        if (id?.startsWith('local-')) {
          const localQuizzes = QuizService.getLocalQuizzes();
          const foundQuiz = localQuizzes.find(q => q.id === id);
          
          if (foundQuiz) {
            setQuiz(foundQuiz);
          } else {
            setError('Quiz not found');
          }
        } else if (id) {
          // Fetch from database
          const fetchedQuiz = await QuizService.getQuiz(id);
          
          if (fetchedQuiz) {
            setQuiz(fetchedQuiz);
          } else {
            setError('Quiz not found');
          }
        } else {
          setError('Invalid quiz ID');
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
        setError('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  const handleQuizComplete = (score: number, total: number) => {
    console.log(`Quiz completed with score: ${score}/${total}`);
    // Could implement score recording logic here
  };

  if (loading) {
    return (
      <div className="container mx-auto py-16 px-4 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-muted-foreground mb-6">{error || 'Quiz not found'}</p>
        <Button asChild>
          <Link to="/quizzes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quizzes
          </Link>
        </Button>
      </div>
    );
  }

  // Check if quiz has expired
  const isExpired = new Date(quiz.expires_at) < new Date();
  
  if (isExpired) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Quiz Expired</h1>
        <p className="text-muted-foreground mb-6">
          This quiz is no longer available as it has expired
        </p>
        <Button asChild>
          <Link to="/quizzes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quizzes
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="outline" asChild className="mb-4">
          <Link to="/quizzes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quizzes
          </Link>
        </Button>
      </div>

      <QuizTaker
        id={quiz.id}
        title={quiz.title}
        questions={quiz.questions}
        difficulty={quiz.difficulty}
        password={quiz.password}
        onQuizComplete={handleQuizComplete}
      />
    </div>
  );
};

export default QuizTakePage;
