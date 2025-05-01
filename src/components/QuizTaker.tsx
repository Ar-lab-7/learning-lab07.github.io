
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { QuizQuestion } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Lock } from 'lucide-react';

interface QuizTakerProps {
  id: string;
  title: string;
  questions: QuizQuestion[];
  difficulty: string;
  password?: string;
  onQuizComplete?: (score: number, total: number) => void;
}

const QuizTaker: React.FC<QuizTakerProps> = ({ 
  id, 
  title, 
  questions, 
  difficulty,
  password,
  onQuizComplete 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | boolean | null)[]>(Array(questions.length).fill(null));
  const [showResults, setShowResults] = useState(false);
  const [isPasswordProtected, setIsPasswordProtected] = useState(!!password);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [authenticated, setAuthenticated] = useState(!password);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (answer: string | boolean) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateScore();
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        score++;
      }
    });

    if (onQuizComplete) {
      onQuizComplete(score, questions.length);
    }

    toast.success(`You scored ${score} out of ${questions.length}!`);
    return score;
  };

  const checkPassword = () => {
    if (enteredPassword === password) {
      setAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password');
    }
  };

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-background/20 backdrop-blur-sm rounded-lg">
        <div className="mb-4 text-accent">
          <Lock size={40} />
        </div>
        <h2 className="text-xl text-center font-semibold mb-4">Password Protected Quiz</h2>
        <p className="text-sm text-center mb-6 text-muted-foreground">
          This quiz is password protected. Please enter the password to access it.
        </p>
        <div className="space-y-4 w-full max-w-md">
          <Input 
            type="password"
            placeholder="Enter password"
            value={enteredPassword}
            onChange={(e) => setEnteredPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && checkPassword()}
          />
          {passwordError && (
            <p className="text-sm text-destructive text-center">{passwordError}</p>
          )}
          <Button 
            className="w-full" 
            onClick={checkPassword}
          >
            Access Quiz
          </Button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Quiz Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-2xl font-bold mb-2">Your Score: {score}/{questions.length}</p>
            <p className="text-lg">
              {score === questions.length 
                ? 'Perfect! You got all questions right!' 
                : score > questions.length / 2 
                  ? 'Good job! You passed the quiz.' 
                  : 'Keep practicing!'}
            </p>
          </div>
          
          <div className="space-y-4 mt-8">
            <h3 className="text-lg font-medium">Review Answers:</h3>
            {questions.map((question, i) => (
              <div key={i} className="border rounded-md p-4">
                <p className="font-medium">{i + 1}. {question.question}</p>
                
                <div className="mt-2">
                  {question.type === 'mcq' && question.options && (
                    <div className="grid gap-2">
                      {question.options.map((option) => (
                        <div 
                          key={option} 
                          className={`p-2 rounded-md ${
                            option === question.correctAnswer 
                              ? 'bg-green-100 dark:bg-green-900/20'
                              : answers[i] === option && option !== question.correctAnswer
                                ? 'bg-red-100 dark:bg-red-900/20'
                                : ''
                          }`}
                        >
                          {option}
                          {option === question.correctAnswer && ' ✓'}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {question.type === 'truefalse' && (
                    <div className="grid gap-2">
                      <div className={`p-2 rounded-md ${
                        question.correctAnswer === true
                          ? 'bg-green-100 dark:bg-green-900/20'
                          : answers[i] === true
                            ? 'bg-red-100 dark:bg-red-900/20'
                            : ''
                      }`}>
                        True
                        {question.correctAnswer === true && ' ✓'}
                      </div>
                      <div className={`p-2 rounded-md ${
                        question.correctAnswer === false
                          ? 'bg-green-100 dark:bg-green-900/20' 
                          : answers[i] === false
                            ? 'bg-red-100 dark:bg-red-900/20'
                            : ''
                      }`}>
                        False
                        {question.correctAnswer === false && ' ✓'}
                      </div>
                    </div>
                  )}
                </div>
                
                {question.explanation && (
                  <div className="mt-2 text-sm text-muted-foreground border-t pt-2">
                    <span className="font-medium">Explanation:</span> {question.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.reload()} className="w-full">
            Take Another Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>Difficulty: {difficulty}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>
          
          {currentQuestion.type === 'mcq' && currentQuestion.options && (
            <RadioGroup
              value={answers[currentQuestionIndex]?.toString() || ''}
              onValueChange={(value) => handleAnswer(value)}
            >
              {currentQuestion.options.map((option) => (
                <div key={option} className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          )}
          
          {currentQuestion.type === 'truefalse' && (
            <RadioGroup
              value={answers[currentQuestionIndex]?.toString() || ''}
              onValueChange={(value) => handleAnswer(value === 'true')}
            >
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="true" id="true" />
                <Label htmlFor="true">True</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="false" />
                <Label htmlFor="false">False</Label>
              </div>
            </RadioGroup>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handlePrevious} 
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={answers[currentQuestionIndex] === null}
        >
          {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuizTaker;
