
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, CheckCircle, Clock, Lock, AlertCircle } from 'lucide-react';
import { QuizService } from '@/services/QuizService';
import { Quiz, QuizQuestion } from '@/integrations/supabase/client';

const QuizTakePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('questions');
  const [password, setPassword] = useState('');
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!id) {
        setError('No quiz ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const quizData = await QuizService.getQuiz(id);
        
        if (quizData) {
          setQuiz(quizData);
          if (quizData.password) {
            setIsPasswordRequired(true);
          }
          
          // Initialize time remaining if there is a time limit
          if (quizData.time_limit) {
            setTimeRemaining(quizData.time_limit * 60); // convert to seconds
          }
        } else {
          setError('Quiz not found');
        }
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError('Failed to load quiz');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  useEffect(() => {
    // Timer for quiz if time limit is set
    if (timeRemaining !== null && timeRemaining > 0 && !showResults) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, showResults]);

  const handlePasswordSubmit = () => {
    if (quiz?.password === password) {
      setIsPasswordCorrect(true);
      setIsPasswordRequired(false);
    } else {
      setIsPasswordCorrect(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = () => {
    if (!quiz) return;
    
    setIsSubmitting(true);
    let correctCount = 0;
    
    quiz.questions.forEach((question: QuizQuestion) => {
      const userAnswer = answers[question.id];
      if (userAnswer === question.correctAnswer) {
        correctCount++;
      }
    });
    
    const finalScore = Math.round((correctCount / quiz.questions.length) * 100);
    setScore(finalScore);
    setShowResults(true);
    setIsSubmitting(false);
    setActiveTab('results');
  };

  const getAnswerStatus = (question: QuizQuestion): 'correct' | 'incorrect' | 'unanswered' => {
    const userAnswer = answers[question.id];
    
    if (!userAnswer) {
      return 'unanswered';
    }
    
    return userAnswer === question.correctAnswer ? 'correct' : 'incorrect';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    );
  }

  if (isPasswordRequired) {
    return (
      <div className="container mx-auto max-w-md px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock size={20} />
              Password Protected Quiz
            </CardTitle>
            <CardDescription>
              This quiz is protected. Please enter the password to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={!isPasswordCorrect ? 'border-destructive' : ''}
                />
                {!isPasswordCorrect && (
                  <p className="text-destructive text-sm mt-1">Incorrect password. Please try again.</p>
                )}
              </div>
              <Button onClick={handlePasswordSubmit} className="w-full">
                Submit
              </Button>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!quiz) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Button variant="outline" size="sm" onClick={() => navigate('/')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{quiz.title}</CardTitle>
              <CardDescription>{quiz.description}</CardDescription>
            </div>
            {timeRemaining !== null && (
              <div className="text-right">
                <span className="text-sm text-muted-foreground">Time Remaining</span>
                <div className={`flex items-center font-mono text-lg ${timeRemaining < 60 ? 'text-destructive' : ''}`}>
                  <Clock className="mr-1 h-4 w-4" />
                  {formatTime(timeRemaining)}
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="ml-6">
            <TabsTrigger value="questions" disabled={showResults}>Questions</TabsTrigger>
            <TabsTrigger value="results" disabled={!showResults}>Results</TabsTrigger>
          </TabsList>
          
          <CardContent>
            <TabsContent value="questions" className="space-y-6">
              {quiz.questions.map((question: QuizQuestion, index: number) => (
                <div key={question.id} className="p-4 border rounded-md">
                  <h3 className="font-medium mb-3">
                    {index + 1}. {question.question}
                  </h3>
                  
                  <RadioGroup 
                    value={answers[question.id] || ''} 
                    onValueChange={(value) => handleAnswerChange(question.id, value)}
                    className="space-y-2"
                  >
                    {question.options.map((option: string, optionIndex: number) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`${question.id}-${optionIndex}`} />
                        <Label htmlFor={`${question.id}-${optionIndex}`}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
              
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || Object.keys(answers).length === 0} 
                  className="px-6"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Answers'}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="results">
              <div className="mb-6 text-center">
                <div className="text-3xl font-bold mb-1">Your Score: {score}%</div>
                <div className="text-muted-foreground">
                  {score >= (quiz.passing_score || 70) ? 'You passed!' : 'You didn\'t pass. Try again!'}
                </div>
              </div>
              
              <div className="space-y-6">
                {quiz.questions.map((question: QuizQuestion, index: number) => {
                  const status = getAnswerStatus(question);
                  
                  return (
                    <div 
                      key={question.id} 
                      className={`p-4 border rounded-md ${
                        status === 'correct' 
                          ? 'bg-green-50 border-green-200' 
                          : status === 'incorrect' 
                            ? 'bg-red-50 border-red-200' 
                            : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-medium">
                          {index + 1}. {question.question}
                        </h3>
                        {status === 'correct' && (
                          <CheckCircle className="text-green-500 h-5 w-5 mt-1" />
                        )}
                        {status === 'incorrect' && (
                          <AlertCircle className="text-red-500 h-5 w-5 mt-1" />
                        )}
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        {question.options.map((option: string, optionIndex: number) => (
                          <div 
                            key={optionIndex} 
                            className={`p-2 rounded ${
                              option === question.correctAnswer 
                                ? 'bg-green-100 border border-green-200' 
                                : option === answers[question.id] && option !== question.correctAnswer
                                  ? 'bg-red-100 border border-red-200'
                                  : 'bg-background'
                            }`}
                          >
                            {option}
                            {option === question.correctAnswer && (
                              <span className="ml-2 text-green-600 text-sm">(Correct Answer)</span>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {question.explanation && (
                        <div className="bg-muted p-3 rounded-md mt-2 text-sm">
                          <strong>Explanation:</strong> {question.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => navigate('/')}>
                  Return to Home
                </Button>
                <Button onClick={() => {
                  setAnswers({});
                  setShowResults(false);
                  setActiveTab('questions');
                }}>
                  Try Again
                </Button>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default QuizTakePage;
