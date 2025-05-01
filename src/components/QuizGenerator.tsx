
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { QuizQuestion } from '@/integrations/supabase/client';
import { Trash2, Plus, X, Save, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { Textarea } from '@/components/ui/textarea';
import { QuizService } from '@/services/QuizService';
import { toast } from 'sonner';
import { addDays } from 'date-fns';

interface QuizGeneratorProps {
  onClose?: () => void;
}

const QuizGenerator: React.FC<QuizGeneratorProps> = ({ onClose }) => {
  const { toast: hookToast } = useToast();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [activeTab, setActiveTab] = useState('create');
  const [withPassword, setWithPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [duration, setDuration] = useState(24); // Duration in hours

  // Dummy question template
  const createNewQuestion = (): QuizQuestion => ({
    id: `q-${Math.random().toString(36).substring(2, 11)}`,
    question: '',
    type: 'mcq',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: ''
  });

  // Add a new question
  const addQuestion = () => {
    setQuestions([...questions, createNewQuestion()]);
  };

  // Remove a question
  const removeQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  // Update a question
  const updateQuestion = (index: number, updatedQuestion: QuizQuestion) => {
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    setQuestions(newQuestions);
  };

  // Handle question text change
  const handleQuestionChange = (index: number, text: string) => {
    const question = { ...questions[index], question: text };
    updateQuestion(index, question);
  };

  // Handle question type change
  const handleTypeChange = (index: number, type: 'mcq' | 'truefalse') => {
    const question = { ...questions[index], type };
    
    // Reset options and correct answer based on type
    if (type === 'mcq') {
      question.options = ['', '', '', ''];
      question.correctAnswer = '';
    } else {
      question.options = undefined;
      question.correctAnswer = true;
    }
    
    updateQuestion(index, question);
  };

  // Handle option change
  const handleOptionChange = (questionIndex: number, optionIndex: number, text: string) => {
    const question = { ...questions[questionIndex] };
    if (question.options) {
      const options = [...question.options];
      options[optionIndex] = text;
      question.options = options;
      updateQuestion(questionIndex, question);
    }
  };

  // Handle correct answer change for MCQ
  const handleCorrectAnswerChange = (questionIndex: number, answer: string) => {
    const question = { ...questions[questionIndex], correctAnswer: answer };
    updateQuestion(questionIndex, question);
  };

  // Handle correct answer change for True/False
  const handleTrueFalseAnswerChange = (questionIndex: number, isTrue: boolean) => {
    const question = { ...questions[questionIndex], correctAnswer: isTrue };
    updateQuestion(questionIndex, question);
  };

  // Handle explanation change
  const handleExplanationChange = (index: number, text: string) => {
    const question = { ...questions[index], explanation: text };
    updateQuestion(index, question);
  };

  // Validate form
  const validateForm = () => {
    if (!title) {
      toast.error('Please enter a quiz title');
      return false;
    }
    
    if (questions.length === 0) {
      toast.error('Please add at least one question');
      return false;
    }
    
    // Check if all questions are complete
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      
      if (!q.question.trim()) {
        toast.error(`Question ${i + 1} is empty`);
        return false;
      }
      
      if (q.type === 'mcq') {
        if (!q.options || q.options.some(opt => !opt.trim())) {
          toast.error(`Question ${i + 1} has empty options`);
          return false;
        }
        
        if (!q.correctAnswer) {
          toast.error(`Question ${i + 1} doesn't have a correct answer selected`);
          return false;
        }
      }
    }
    
    if (withPassword && !password.trim()) {
      toast.error('Please enter a password or disable password protection');
      return false;
    }
    
    return true;
  };

  // Save quiz
  const saveQuiz = async () => {
    if (!validateForm()) return;

    try {
      // Calculate expiration date
      const expiresAt = addDays(new Date(), duration);

      const quizData = {
        title,
        questions,
        difficulty,
        expires_at: expiresAt.toISOString(),
        ...(withPassword && { password })
      };

      if (user) {
        // Save to database if user is logged in
        const result = await QuizService.createQuiz(quizData);
        if (result) {
          toast.success('Quiz created successfully');
          if (onClose) onClose();
        }
      } else {
        // Save to local storage if user is not logged in
        QuizService.saveToLocalStorage(quizData);
        if (onClose) onClose();
      }
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast.error('Failed to save quiz');
    }
  };

  // Check if a question is complete
  const isQuestionComplete = (question: QuizQuestion) => {
    if (!question.question.trim()) return false;
    
    if (question.type === 'mcq') {
      return (
        question.options !== undefined &&
        question.options.every(option => option.trim() !== '') &&
        question.correctAnswer !== ''
      );
    }
    
    return true;
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="create">Create Quiz</TabsTrigger>
          <TabsTrigger value="preview" disabled={questions.length === 0}>Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quiz-title">Quiz Title</Label>
                <Input
                  id="quiz-title"
                  placeholder="Enter quiz title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger id="difficulty">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Quiz Duration (hours)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="168"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 24)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Quiz will expire after {duration} hours from creation
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="password-protection"
                    checked={withPassword}
                    onCheckedChange={setWithPassword}
                  />
                  <Label htmlFor="password-protection">Password Protection</Label>
                </div>
                
                {withPassword && (
                  <div>
                    <Input
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Questions</h2>
              <Button onClick={addQuestion} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" /> Add Question
              </Button>
            </div>
            
            {questions.length === 0 ? (
              <div className="text-center py-8 border border-dashed rounded-md">
                <p className="text-muted-foreground">No questions added yet</p>
                <Button onClick={addQuestion} variant="outline" className="mt-2">
                  <Plus className="h-4 w-4 mr-1" /> Add Your First Question
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((question, index) => (
                  <Card key={question.id} className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeQuestion(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="flex items-center gap-2">
                            <span>Question {index + 1}</span>
                            {isQuestionComplete(question) ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-destructive" />
                            )}
                          </Label>
                          <Textarea
                            placeholder="Enter your question"
                            value={question.question}
                            onChange={(e) => handleQuestionChange(index, e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`q-${index}-type`}>Question Type</Label>
                          <Select
                            value={question.type}
                            onValueChange={(value) => handleTypeChange(index, value as 'mcq' | 'truefalse')}
                          >
                            <SelectTrigger id={`q-${index}-type`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mcq">Multiple Choice</SelectItem>
                              <SelectItem value="truefalse">True/False</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {question.type === 'mcq' && question.options && (
                          <div className="space-y-3">
                            <Label>Options</Label>
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-2">
                                <RadioGroup
                                  value={question.correctAnswer === option ? option : ''}
                                  onValueChange={(value) => handleCorrectAnswerChange(index, value)}
                                  className="flex-none"
                                >
                                  <RadioGroupItem value={option || `__empty_${optIndex}`} />
                                </RadioGroup>
                                <Input
                                  placeholder={`Option ${optIndex + 1}`}
                                  value={option}
                                  onChange={(e) => handleOptionChange(index, optIndex, e.target.value)}
                                  className="flex-1"
                                />
                              </div>
                            ))}
                            <p className="text-xs text-muted-foreground">Select the correct answer</p>
                          </div>
                        )}
                        
                        {question.type === 'truefalse' && (
                          <div className="space-y-3">
                            <Label>Correct Answer</Label>
                            <RadioGroup
                              value={question.correctAnswer === true ? 'true' : 'false'}
                              onValueChange={(value) => handleTrueFalseAnswerChange(index, value === 'true')}
                              className="flex space-x-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="true" id={`q-${index}-true`} />
                                <Label htmlFor={`q-${index}-true`}>True</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="false" id={`q-${index}-false`} />
                                <Label htmlFor={`q-${index}-false`}>False</Label>
                              </div>
                            </RadioGroup>
                          </div>
                        )}
                        
                        <div>
                          <Label htmlFor={`q-${index}-explanation`}>Explanation (Optional)</Label>
                          <Textarea
                            id={`q-${index}-explanation`}
                            placeholder="Explain the correct answer"
                            value={question.explanation || ''}
                            onChange={(e) => handleExplanationChange(index, e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-between pt-4 border-t">
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}
            <div className="flex gap-2">
              <Button 
                variant="default" 
                onClick={saveQuiz}
                disabled={questions.length === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Quiz
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">{title || 'Quiz Preview'}</h2>
                <p className="text-muted-foreground">Difficulty: {difficulty}</p>
              </div>
              <Button variant="outline" onClick={() => setActiveTab('create')}>
                Back to Edit
              </Button>
            </div>
            
            <div className="space-y-6">
              {questions.map((question, index) => (
                <Card key={question.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium">Question {index + 1}</h3>
                        <p>{question.question}</p>
                      </div>
                      
                      {question.type === 'mcq' && question.options && (
                        <RadioGroup value={question.correctAnswer}>
                          {question.options.map((option, i) => (
                            <div key={i} className="flex items-center space-x-2">
                              <RadioGroupItem value={option} id={`preview-${index}-opt-${i}`} />
                              <Label htmlFor={`preview-${index}-opt-${i}`}>
                                {option}
                                {option === question.correctAnswer && ' (Correct)'}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      )}
                      
                      {question.type === 'truefalse' && (
                        <RadioGroup value={question.correctAnswer ? 'true' : 'false'}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id={`preview-${index}-true`} />
                            <Label htmlFor={`preview-${index}-true`}>
                              True
                              {question.correctAnswer === true && ' (Correct)'}
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id={`preview-${index}-false`} />
                            <Label htmlFor={`preview-${index}-false`}>
                              False
                              {question.correctAnswer === false && ' (Correct)'}
                            </Label>
                          </div>
                        </RadioGroup>
                      )}
                      
                      {question.explanation && (
                        <div className="mt-2 text-sm border-l-2 border-accent/50 pl-2">
                          <span className="font-medium">Explanation:</span> {question.explanation}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setActiveTab('create')}>
                Back to Edit
              </Button>
              <Button 
                variant="default" 
                onClick={saveQuiz}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Quiz
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuizGenerator;
