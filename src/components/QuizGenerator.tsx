
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { QuizService } from "@/services/QuizService";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { addDays } from 'date-fns';
import { QuizQuestion } from '@/integrations/supabase/client';

interface QuizGeneratorProps {
  onClose?: () => void;
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
  explanation: string;
  type: 'multiple-choice' | 'true-false';
}

const QuizGenerator: React.FC<QuizGeneratorProps> = ({ onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: crypto.randomUUID(),
      text: '',
      options: ['', '', '', ''],
      correctOption: 0,
      explanation: '',
      type: 'multiple-choice'
    }
  ]);
  const [isPublic, setIsPublic] = useState(true);
  const [timeLimit, setTimeLimit] = useState('');
  const [passingScore, setPassingScore] = useState('70');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [showExplanation, setShowExplanation] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [allowRetakes, setAllowRetakes] = useState(true);
  const [showResults, setShowResults] = useState(true);
  const [bulkQuestions, setBulkQuestions] = useState('');
  const [activeTab, setActiveTab] = useState('manual');
  const [difficulty, setDifficulty] = useState('medium');
  const [category, setCategory] = useState('general');
  const [isGenerating, setIsGenerating] = useState(false);
  const [customQuestions, setCustomQuestions] = useState('');
  
  const navigate = useNavigate();
  const { toast: showToast } = useToast();

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: crypto.randomUUID(),
        text: '',
        options: ['', '', '', ''],
        correctOption: 0,
        explanation: '',
        type: 'multiple-choice'
      }
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = [...questions];
      newQuestions.splice(index, 1);
      setQuestions(newQuestions);
    } else {
      toast.error("You need at least one question");
    }
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions];
    
    if (field === 'type' && value === 'true-false') {
      newQuestions[index] = {
        ...newQuestions[index],
        [field]: value,
        options: ['True', 'False'],
        correctOption: 0
      };
    } else {
      newQuestions[index] = {
        ...newQuestions[index],
        [field]: value
      };
    }
    
    setQuestions(newQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    if (newQuestions[questionIndex].options.length < 6) {
      newQuestions[questionIndex].options.push('');
      setQuestions(newQuestions);
    } else {
      toast.error("Maximum 6 options allowed per question");
    }
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    if (newQuestions[questionIndex].options.length > 2) {
      // If removing the correct option, reset correctOption to 0
      if (optionIndex === newQuestions[questionIndex].correctOption) {
        newQuestions[questionIndex].correctOption = 0;
      } else if (optionIndex < newQuestions[questionIndex].correctOption) {
        // If removing an option before the correct one, adjust the index
        newQuestions[questionIndex].correctOption -= 1;
      }
      
      newQuestions[questionIndex].options.splice(optionIndex, 1);
      setQuestions(newQuestions);
    } else {
      toast.error("Minimum 2 options required");
    }
  };

  const addTag = () => {
    if (currentTag && !tags.includes(currentTag) && tags.length < 5) {
      setTags([...tags, currentTag]);
      setCurrentTag('');
    } else if (tags.length >= 5) {
      toast.error("Maximum 5 tags allowed");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const validateQuiz = () => {
    if (!title) {
      toast.error("Please add a title");
      return false;
    }

    if (!description) {
      toast.error("Please add a description");
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text) {
        toast.error(`Question ${i + 1} is missing text`);
        return false;
      }

      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j]) {
          toast.error(`Question ${i + 1}, Option ${j + 1} is empty`);
          return false;
        }
      }
    }

    if (requiresPassword && !password) {
      toast.error("Password is required when password protection is enabled");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateQuiz()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create an expiration date (24 hours from now)
      const expiresAt = addDays(new Date(), 1).toISOString();
      
      const quizData = {
        title,
        description,
        questions: questions.map(q => ({
          id: q.id,
          question: q.text,
          type: q.type === 'true-false' ? 'truefalse' as const : 'mcq' as const,
          options: q.options,
          correctAnswer: q.type === 'true-false' 
            ? q.options[q.correctOption].toLowerCase() === 'true' 
            : q.options[q.correctOption],
          explanation: q.explanation,
        })),
        difficulty,
        expires_at: expiresAt,
        password: requiresPassword ? password : undefined
      };
      
      const response = await QuizService.createQuiz(quizData);
      
      if (response) {
        toast.success("Quiz created successfully!");
        if (onClose) {
          onClose();
        } else {
          navigate(`/quiz/${response.id}`);
        }
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
      toast.error("Failed to create quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const parseBulkQuestions = () => {
    try {
      // Split by double newlines to separate questions
      const questionBlocks = bulkQuestions.split(/\n\s*\n/);
      
      const parsedQuestions: Question[] = questionBlocks.map(block => {
        const lines = block.trim().split('\n');
        
        // First line is the question text
        const questionText = lines[0].replace(/^\d+\.\s*/, '').trim();
        
        // Find the correct answer marker (usually indicated by * or [correct])
        const correctOptionIndex = lines.findIndex((line, i) => 
          i > 0 && (line.includes('*') || line.toLowerCase().includes('[correct]'))
        ) - 1;
        
        // Parse options, removing any markers
        const options = lines.slice(1)
          .map(line => line.replace(/^[a-z]\)\s*|\*|\[correct\]/gi, '').trim())
          .filter(line => line.length > 0);
        
        // Find explanation if it exists (usually after "Explanation:" or similar)
        const explanationIndex = lines.findIndex(line => 
          line.toLowerCase().includes('explanation:') || 
          line.toLowerCase().includes('reason:')
        );
        
        let explanation = '';
        if (explanationIndex !== -1) {
          explanation = lines[explanationIndex].replace(/^(explanation|reason):\s*/i, '').trim();
        }
        
        return {
          id: crypto.randomUUID(),
          text: questionText,
          options: options.length > 0 ? options : ['', '', '', ''],
          correctOption: correctOptionIndex >= 0 ? correctOptionIndex : 0,
          explanation,
          type: options.length === 2 && 
                (options[0].toLowerCase().includes('true') || options[0].toLowerCase().includes('false')) && 
                (options[1].toLowerCase().includes('true') || options[1].toLowerCase().includes('false')) 
                ? 'true-false' : 'multiple-choice'
        };
      });
      
      if (parsedQuestions.length > 0) {
        setQuestions(parsedQuestions);
        setActiveTab('manual');
        toast.success(`Successfully parsed ${parsedQuestions.length} questions`);
      } else {
        toast.error("No valid questions found");
      }
    } catch (error) {
      console.error("Error parsing questions:", error);
      toast.error("Failed to parse questions. Check the format and try again.");
    }
  };

  const generateQuestions = async () => {
    setIsGenerating(true);
    try {
      // This would connect to an AI service or backend endpoint
      // For now, we'll simulate with a timeout and sample questions
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const sampleQuestions = [
        {
          id: crypto.randomUUID(),
          text: 'What is the capital of France?',
          options: ['Paris', 'London', 'Berlin', 'Madrid'],
          correctOption: 0,
          explanation: 'Paris is the capital and most populous city of France.',
          type: 'multiple-choice' as const
        },
        {
          id: crypto.randomUUID(),
          text: 'The Earth is flat.',
          options: ['True', 'False'],
          correctOption: 1,
          explanation: 'The Earth is approximately spherical in shape.',
          type: 'true-false' as const
        },
        {
          id: crypto.randomUUID(),
          text: 'Which programming language was created by Brendan Eich?',
          options: ['Java', 'JavaScript', 'Python', 'C++'],
          correctOption: 1,
          explanation: 'JavaScript was created by Brendan Eich while he was at Netscape.',
          type: 'multiple-choice' as const
        }
      ];
      
      setQuestions(sampleQuestions);
      setActiveTab('manual');
      toast.success("Generated sample questions");
    } catch (error) {
      console.error("Error generating questions:", error);
      toast.error("Failed to generate questions");
    } finally {
      setIsGenerating(false);
    }
  };

  const parseCustomQuestions = () => {
    try {
      const lines = customQuestions.trim().split('\n');
      let currentQuestion: Question | null = null;
      const parsedQuestions: Question[] = [];
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        
        // Skip empty lines
        if (!trimmedLine) return;
        
        // Question line
        if (trimmedLine.startsWith('Q:') || trimmedLine.match(/^\d+\./)) {
          // Save previous question if exists
          if (currentQuestion) {
            parsedQuestions.push(currentQuestion);
          }
          
          // Start new question
          currentQuestion = {
            id: crypto.randomUUID(),
            text: trimmedLine.replace(/^(Q:|^\d+\.)\s*/, ''),
            options: [],
            correctOption: 0,
            explanation: '',
            type: 'multiple-choice'
          };
        } 
        // Option line
        else if (trimmedLine.match(/^[A-D][).:]/) || trimmedLine.startsWith('-')) {
          if (currentQuestion) {
            const cleanOption = trimmedLine.replace(/^[A-D][).:]|-\s*/, '').trim();
            currentQuestion.options.push(cleanOption);
            
            // Mark as correct option if it has an asterisk or [correct]
            if (cleanOption.includes('*') || cleanOption.toLowerCase().includes('[correct]')) {
              currentQuestion.options[currentQuestion.options.length - 1] = cleanOption.replace(/\*|\[correct\]/gi, '').trim();
              currentQuestion.correctOption = currentQuestion.options.length - 1;
            }
          }
        }
        // Explanation line
        else if (trimmedLine.toLowerCase().startsWith('explanation:') || trimmedLine.toLowerCase().startsWith('reason:')) {
          if (currentQuestion) {
            currentQuestion.explanation = trimmedLine.replace(/^(explanation|reason):\s*/i, '');
          }
        }
        // Mark as true/false if it looks like that type
        else if (trimmedLine.toLowerCase() === 'true' || trimmedLine.toLowerCase() === 'false') {
          if (currentQuestion) {
            if (currentQuestion.options.length < 2) {
              currentQuestion.options.push(trimmedLine);
              if (currentQuestion.options.length === 2 && 
                  currentQuestion.options[0].toLowerCase() === 'true' && 
                  currentQuestion.options[1].toLowerCase() === 'false') {
                currentQuestion.type = 'true-false';
              }
            }
          }
        }
      });
      
      // Add the last question
      if (currentQuestion && currentQuestion.text) {
        parsedQuestions.push(currentQuestion);
      }
      
      if (parsedQuestions.length > 0) {
        // Add to existing questions
        setQuestions([...questions, ...parsedQuestions]);
        setActiveTab('manual');
        setCustomQuestions(''); // Clear the input area
        toast.success(`Added ${parsedQuestions.length} custom questions`);
      } else {
        toast.error("No valid questions found");
      }
    } catch (error) {
      console.error("Error parsing custom questions:", error);
      toast.error("Failed to parse custom questions. Check the format and try again.");
    }
  };

  const copyQuizLink = () => {
    // This would be replaced with the actual quiz link after creation
    navigator.clipboard.writeText("https://example.com/quiz/sample-id");
    showToast({
      title: "Link copied",
      description: "Quiz link copied to clipboard"
    });
  };

  const duplicateQuestion = (index: number) => {
    const questionToDuplicate = questions[index];
    const duplicatedQuestion = {
      ...questionToDuplicate,
      id: crypto.randomUUID()
    };
    const newQuestions = [...questions];
    newQuestions.splice(index + 1, 0, duplicatedQuestion);
    setQuestions(newQuestions);
    toast.success("Question duplicated");
  };

  return (
    <div className="container max-w-4xl py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create New Quiz</CardTitle>
          <CardDescription>
            Design your quiz with multiple choice questions, settings, and options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Quiz Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Quiz Title</Label>
                  <Input 
                    id="title" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="Enter quiz title"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Enter quiz description"
                    className="mt-1"
                    rows={3}
                  />
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <div className="w-full md:w-[calc(50%-0.5rem)]">
                    <Label htmlFor="timeLimit">Time Limit (minutes, optional)</Label>
                    <Input 
                      id="timeLimit" 
                      type="number" 
                      value={timeLimit} 
                      onChange={(e) => setTimeLimit(e.target.value)} 
                      placeholder="No time limit"
                      min="1"
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="w-full md:w-[calc(50%-0.5rem)]">
                    <Label htmlFor="passingScore">Passing Score (%)</Label>
                    <Input 
                      id="passingScore" 
                      type="number" 
                      value={passingScore} 
                      onChange={(e) => setPassingScore(e.target.value)} 
                      min="0"
                      max="100"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <div className="w-full md:w-[calc(50%-0.5rem)]">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select 
                      value={difficulty} 
                      onValueChange={setDifficulty}
                    >
                      <SelectTrigger id="difficulty" className="mt-1">
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
                
                <div>
                  <Label htmlFor="tags">Tags (up to 5)</Label>
                  <div className="flex mt-1">
                    <Input 
                      id="tags" 
                      value={currentTag} 
                      onChange={(e) => setCurrentTag(e.target.value)} 
                      onKeyDown={handleKeyDown}
                      placeholder="Add tag and press Enter"
                      className="rounded-r-none"
                    />
                    <Button 
                      type="button" 
                      onClick={addTag}
                      className="rounded-l-none"
                      variant="secondary"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-sm py-1 px-2">
                        {tag}
                        <button 
                          type="button" 
                          onClick={() => removeTag(tag)} 
                          className="ml-2 text-muted-foreground hover:text-foreground"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Quiz Settings */}
              <Accordion type="single" collapsible defaultValue="settings">
                <AccordionItem value="settings">
                  <AccordionTrigger>Quiz Settings</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="isPublic">Public Quiz</Label>
                        <Switch 
                          id="isPublic" 
                          checked={isPublic} 
                          onCheckedChange={setIsPublic}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="requiresPassword">Password Protected</Label>
                        <Switch 
                          id="requiresPassword" 
                          checked={requiresPassword} 
                          onCheckedChange={setRequiresPassword}
                        />
                      </div>
                      
                      {requiresPassword && (
                        <div className="col-span-2">
                          <Label htmlFor="password">Quiz Password</Label>
                          <Input 
                            id="password" 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Enter password"
                            className="mt-1"
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="shuffleQuestions">Shuffle Questions</Label>
                        <Switch 
                          id="shuffleQuestions" 
                          checked={shuffleQuestions} 
                          onCheckedChange={setShuffleQuestions}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="shuffleOptions">Shuffle Options</Label>
                        <Switch 
                          id="shuffleOptions" 
                          checked={shuffleOptions} 
                          onCheckedChange={setShuffleOptions}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showExplanation">Show Explanations</Label>
                        <Switch 
                          id="showExplanation" 
                          checked={showExplanation} 
                          onCheckedChange={setShowExplanation}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="allowRetakes">Allow Retakes</Label>
                        <Switch 
                          id="allowRetakes" 
                          checked={allowRetakes} 
                          onCheckedChange={setAllowRetakes}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showResults">Show Results</Label>
                        <Switch 
                          id="showResults" 
                          checked={showResults} 
                          onCheckedChange={setShowResults}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <Separator />
              
              {/* Questions Section */}
              <div>
                <h3 className="text-lg font-medium mb-4">Questions</h3>
                
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                    <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
                    <TabsTrigger value="custom">Custom Questions</TabsTrigger>
                    <TabsTrigger value="generate">AI Generate</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="manual" className="space-y-6">
                    {questions.map((question, qIndex) => (
                      <Card key={question.id} className="relative">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-base">Question {qIndex + 1}</CardTitle>
                            <div className="flex gap-2">
                              <Button 
                                type="button" 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => duplicateQuestion(qIndex)}
                                title="Duplicate question"
                              >
                                <Copy size={16} />
                              </Button>
                              <Button 
                                type="button" 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => removeQuestion(qIndex)}
                                className="text-destructive"
                                title="Remove question"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <Label htmlFor={`question-${qIndex}`}>Question Text</Label>
                              <Select 
                                value={question.type} 
                                onValueChange={(value) => updateQuestion(qIndex, 'type', value)}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Question Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                                  <SelectItem value="true-false">True/False</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Textarea 
                              id={`question-${qIndex}`} 
                              value={question.text} 
                              onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)} 
                              placeholder="Enter question text"
                              rows={2}
                            />
                          </div>
                          
                          <div>
                            <Label className="mb-2 block">Options</Label>
                            {question.options.map((option, oIndex) => (
                              <div key={oIndex} className="flex items-center mb-2">
                                <div className="mr-2">
                                  <Checkbox 
                                    id={`correct-${qIndex}-${oIndex}`}
                                    checked={question.correctOption === oIndex}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        updateQuestion(qIndex, 'correctOption', oIndex);
                                      }
                                    }}
                                  />
                                </div>
                                <Input 
                                  value={option} 
                                  onChange={(e) => updateOption(qIndex, oIndex, e.target.value)} 
                                  placeholder={`Option ${oIndex + 1}`}
                                  className="flex-1"
                                  disabled={question.type === 'true-false'}
                                />
                                {question.type !== 'true-false' && (
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => removeOption(qIndex, oIndex)}
                                    className="ml-2"
                                    disabled={question.options.length <= 2}
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                )}
                              </div>
                            ))}
                            
                            {question.type !== 'true-false' && (
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                onClick={() => addOption(qIndex)}
                                className="mt-2"
                                disabled={question.options.length >= 6}
                              >
                                <Plus size={16} className="mr-1" /> Add Option
                              </Button>
                            )}
                          </div>
                          
                          <div>
                            <Label htmlFor={`explanation-${qIndex}`}>Explanation (Optional)</Label>
                            <Textarea 
                              id={`explanation-${qIndex}`} 
                              value={question.explanation} 
                              onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)} 
                              placeholder="Explain why the correct answer is right"
                              rows={2}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={addQuestion}
                      className="w-full"
                    >
                      <Plus size={16} className="mr-2" /> Add Question
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="bulk">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Bulk Import Questions</CardTitle>
                        <CardDescription>
                          Paste questions in bulk format. Each question should be separated by a blank line.
                          Mark the correct answer with an asterisk (*) or [correct].
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Textarea 
                          value={bulkQuestions} 
                          onChange={(e) => setBulkQuestions(e.target.value)} 
                          placeholder={`What is the capital of France?\nParis*\nLondon\nBerlin\nMadrid\nExplanation: Paris is the capital of France.\n\nThe Earth is flat.\nTrue\nFalse*`}
                          rows={10}
                          className="font-mono text-sm"
                        />
                        <Button 
                          type="button" 
                          onClick={parseBulkQuestions}
                          className="mt-4"
                        >
                          Parse Questions
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="custom">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Add Custom Questions</CardTitle>
                        <CardDescription>
                          Add your own custom questions in a simple format. You can use:
                          <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                            <li>Q: or 1. to start a question</li>
                            <li>A: or - to add options</li>
                            <li>Add * or [correct] to mark the correct answer</li>
                            <li>Start with "Explanation:" to add an explanation</li>
                          </ul>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Textarea 
                          value={customQuestions} 
                          onChange={(e) => setCustomQuestions(e.target.value)} 
                          placeholder={`Q: What is 2+2?\nA: 3\nA: 4*\nA: 5\nA: 6\nExplanation: Basic addition\n\n2. Is water wet?\n- Yes\n- No [correct]\nExplanation: Water makes things wet but isn't itself wet`}
                          rows={10}
                          className="font-mono text-sm"
                        />
                        <Button 
                          type="button" 
                          onClick={parseCustomQuestions}
                          className="mt-4"
                        >
                          Add Custom Questions
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="generate">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Generate Questions with AI</CardTitle>
                        <CardDescription>
                          Let AI generate quiz questions based on your preferences
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label htmlFor="category">Category</Label>
                            <Select 
                              value={category} 
                              onValueChange={setCategory}
                            >
                              <SelectTrigger id="category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="general">General Knowledge</SelectItem>
                                <SelectItem value="science">Science</SelectItem>
                                <SelectItem value="history">History</SelectItem>
                                <SelectItem value="geography">Geography</SelectItem>
                                <SelectItem value="programming">Programming</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="difficulty">Difficulty</Label>
                            <Select 
                              value={difficulty} 
                              onValueChange={setDifficulty}
                            >
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
                        
                        <Button 
                          type="button" 
                          onClick={generateQuestions}
                          disabled={isGenerating}
                          className="w-full"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>Generate Questions</>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Quiz...
                  </>
                ) : (
                  <>Create Quiz</>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={copyQuizLink}
              >
                <Copy size={16} className="mr-2" /> Copy Quiz Link
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <div>Questions: {questions.length}</div>
          <div>Last updated: {new Date().toLocaleDateString()}</div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuizGenerator;
