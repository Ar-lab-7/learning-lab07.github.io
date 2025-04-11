
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { X, FileDown, Plus, Minus, FileText, ClipboardCheck } from 'lucide-react';
import { useDeviceType } from '@/hooks/use-mobile';

interface QuestionPaperGeneratorProps {
  blogs: {
    title: string;
    content: string;
    date: string;
    readTime: string;
    imageUrl?: string;
  }[];
  onClose: () => void;
}

interface Question {
  id: number;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'short-answer' | 'long-answer';
  options?: string[];
  answer?: string;
  marks: number;
}

const QuestionPaperGenerator: React.FC<QuestionPaperGeneratorProps> = ({ blogs, onClose }) => {
  const { isMobile } = useDeviceType();
  const [selectedBlogs, setSelectedBlogs] = useState<number[]>([]);
  const [paperTitle, setPaperTitle] = useState('Question Paper');
  const [duration, setDuration] = useState('60');
  const [totalMarks, setTotalMarks] = useState('100');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeTab, setActiveTab] = useState('setup');
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
  
  const handleBlogToggle = (index: number) => {
    setSelectedBlogs(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };
  
  const extractContentFromBlogs = () => {
    return selectedBlogs.map(index => {
      const blog = blogs[index];
      const content = blog.content
        .replace(/^#.+$/gm, '') // Remove headers
        .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
        .replace(/\*\*/g, '') // Remove bold markers
        .replace(/\*/g, '') // Remove italic markers
        .replace(/\n+/g, ' ') // Replace multiple new lines with space
        .trim();
      
      return {
        title: blog.title,
        content
      };
    });
  };
  
  const generateRandomQuestions = () => {
    const selectedBlogsContent = extractContentFromBlogs();
    if (selectedBlogsContent.length === 0) {
      toast.error('Please select at least one blog');
      return;
    }
    
    const questionTypes = ['multiple-choice', 'true-false', 'fill-blank', 'short-answer', 'long-answer'] as const;
    const newQuestions: Question[] = [];
    
    // Generate 5 random questions (in real app, this would use ML/AI)
    for (let i = 0; i < 5; i++) {
      const blogIndex = Math.floor(Math.random() * selectedBlogsContent.length);
      const blog = selectedBlogsContent[blogIndex];
      const sentences = blog.content.split(/[.!?]+/).filter(s => s.trim().length > 10);
      if (sentences.length === 0) continue;
      
      const sentenceIndex = Math.floor(Math.random() * sentences.length);
      const sentence = sentences[sentenceIndex].trim();
      
      const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
      const marks = type === 'long-answer' ? 10 : type === 'short-answer' ? 5 : 2;
      
      let question: Question = {
        id: Date.now() + i,
        text: `Based on "${blog.title}": ${sentence}?`,
        type,
        marks
      };
      
      if (type === 'multiple-choice') {
        question.options = ['Option A', 'Option B', 'Option C', 'Option D'];
        question.answer = 'Option A';
      } else if (type === 'true-false') {
        question.options = ['True', 'False'];
        question.answer = 'True';
      } else if (type === 'fill-blank') {
        // Replace a word with blanks
        const words = sentence.split(' ').filter(w => w.length > 4);
        if (words.length > 0) {
          const word = words[Math.floor(Math.random() * words.length)];
          question.text = `Based on "${blog.title}": ${sentence.replace(word, '_________')}`;
          question.answer = word;
        }
      }
      
      newQuestions.push(question);
    }
    
    setQuestions(newQuestions);
    toast.success('Questions generated');
    setActiveTab('questions');
  };
  
  const addCustomQuestion = () => {
    const newQuestion: Question = {
      id: Date.now(),
      text: '',
      type: 'multiple-choice',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      answer: '',
      marks: 2
    };
    
    setQuestions([...questions, newQuestion]);
    setSelectedQuestionIndex(questions.length);
    setActiveTab('questions');
  };
  
  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };
  
  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    const question = updatedQuestions[questionIndex];
    if (question.options) {
      question.options.push(`Option ${String.fromCharCode(65 + question.options.length)}`);
      updatedQuestions[questionIndex] = question;
      setQuestions(updatedQuestions);
    }
  };
  
  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    const question = updatedQuestions[questionIndex];
    if (question.options) {
      question.options = question.options.filter((_, i) => i !== optionIndex);
      updatedQuestions[questionIndex] = question;
      setQuestions(updatedQuestions);
    }
  };
  
  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    const question = updatedQuestions[questionIndex];
    if (question.options) {
      question.options[optionIndex] = value;
      updatedQuestions[questionIndex] = question;
      setQuestions(updatedQuestions);
    }
  };
  
  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
    setSelectedQuestionIndex(null);
  };
  
  const generateQuestionPaper = () => {
    if (questions.length === 0) {
      toast.error('Please generate or add questions first');
      return;
    }
    
    // Create a downloadable HTML file
    const calculatedTotalMarks = questions.reduce((total, q) => total + q.marks, 0);
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${paperTitle}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
          .header { text-align: center; margin-bottom: 40px; }
          .instructions { border: 1px solid #ddd; padding: 15px; margin-bottom: 30px; }
          .question { margin-bottom: 20px; }
          .options { margin-left: 20px; }
          @media print {
            @page { margin: 2cm; }
            body { font-size: 12pt; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${paperTitle}</h1>
          <p>Duration: ${duration} minutes | Total Marks: ${calculatedTotalMarks}</p>
        </div>
        
        <div class="instructions">
          <h3>Instructions:</h3>
          <ul>
            <li>Answer all questions.</li>
            <li>Write clearly and show all your work.</li>
            <li>Time management is crucial.</li>
          </ul>
        </div>
        
        <div class="questions">
    `;
    
    questions.forEach((q, index) => {
      html += `
        <div class="question">
          <p><strong>Q${index + 1}. [${q.marks} marks]</strong> ${q.text}</p>
      `;
      
      if (q.type === 'multiple-choice' || q.type === 'true-false') {
        html += `<div class="options">`;
        q.options?.forEach(option => {
          html += `<p>□ ${option}</p>`;
        });
        html += `</div>`;
      } else if (q.type === 'fill-blank') {
        html += `<p>(Fill in the blank)</p>`;
      } else if (q.type === 'short-answer') {
        html += `<p>(Answer in 2-3 sentences)</p>`;
      } else if (q.type === 'long-answer') {
        html += `<p>(Answer in 300-500 words)</p>`;
      }
      
      html += `</div>`;
    });
    
    html += `
        </div>
        
        <div class="footer">
          <p>Created with Learning Lab - AR Labs</p>
        </div>
      </body>
      </html>
    `;
    
    // Create a blob and download
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paperTitle.replace(/\s+/g, '-').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Question paper downloaded');
  };
  
  const calculateTotalMarks = () => {
    return questions.reduce((total, q) => total + q.marks, 0);
  };
  
  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="container max-w-4xl mx-auto my-4 md:my-8 glass rounded-lg animate-fade-in max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-white/10">
          <h1 className="text-xl md:text-2xl font-bold">Question Paper Generator</h1>
          <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
        </div>
        
        <Tabs defaultValue="setup" className="flex-grow flex flex-col" value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-white/10">
            <TabsList className="p-2 h-auto bg-transparent border-b-0">
              <TabsTrigger value="setup" className="text-sm md:text-base">Setup</TabsTrigger>
              <TabsTrigger value="questions" className="text-sm md:text-base">Questions</TabsTrigger>
              <TabsTrigger value="preview" className="text-sm md:text-base">Preview</TabsTrigger>
            </TabsList>
          </div>
          
          <ScrollArea className="flex-grow overflow-auto">
            <TabsContent value="setup" className="p-4 md:p-6 mt-0">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Paper Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="paper-title">Paper Title</Label>
                      <Input 
                        id="paper-title" 
                        value={paperTitle} 
                        onChange={(e) => setPaperTitle(e.target.value)}
                        className="bg-secondary/40"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Input 
                          id="duration" 
                          type="number"
                          value={duration} 
                          onChange={(e) => setDuration(e.target.value)}
                          className="bg-secondary/40"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="total-marks">Total Marks</Label>
                        <Input 
                          id="total-marks" 
                          type="number"
                          value={totalMarks} 
                          onChange={(e) => setTotalMarks(e.target.value)}
                          className="bg-secondary/40"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Select Blogs</h2>
                  <p className="text-sm text-muted-foreground">Choose blogs to generate questions from:</p>
                  
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {blogs.map((blog, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 rounded-md bg-secondary/20">
                        <Checkbox 
                          id={`blog-${index}`} 
                          checked={selectedBlogs.includes(index)}
                          onCheckedChange={() => handleBlogToggle(index)}
                        />
                        <div>
                          <label 
                            htmlFor={`blog-${index}`}
                            className="font-medium leading-none cursor-pointer hover:text-eduAccent transition-colors"
                          >
                            {blog.title}
                          </label>
                          <p className="text-sm text-muted-foreground">{blog.readTime}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 flex items-center justify-between">
                  <Button variant="outline" onClick={addCustomQuestion}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Custom Question
                  </Button>
                  <Button onClick={generateRandomQuestions}>
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Generate Questions
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="questions" className="p-4 md:p-6 mt-0 h-full">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Questions</h2>
                  {questions.length > 0 ? (
                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                      {questions.map((question, index) => (
                        <div 
                          key={question.id} 
                          className={`p-3 rounded-md cursor-pointer border ${selectedQuestionIndex === index ? 'bg-secondary border-eduAccent' : 'bg-secondary/20 border-transparent'}`}
                          onClick={() => setSelectedQuestionIndex(index)}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-medium">Q{index + 1}. [{question.marks} marks]</h3>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeQuestion(index);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {question.text || 'Empty question'}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-secondary/20 rounded-md">
                      <p className="text-muted-foreground">No questions yet.</p>
                      <Button 
                        variant="outline" 
                        className="mt-4" 
                        onClick={generateRandomQuestions}
                      >
                        Generate Questions
                      </Button>
                    </div>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={addCustomQuestion}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Question
                  </Button>
                </div>
                
                <div className="md:col-span-2">
                  {selectedQuestionIndex !== null && questions[selectedQuestionIndex] ? (
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold">Edit Question {selectedQuestionIndex + 1}</h2>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="question-text">Question Text</Label>
                          <Input 
                            id="question-text" 
                            value={questions[selectedQuestionIndex].text}
                            onChange={(e) => updateQuestion(selectedQuestionIndex, 'text', e.target.value)}
                            className="bg-secondary/40"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="question-type">Question Type</Label>
                            <Select
                              value={questions[selectedQuestionIndex].type}
                              onValueChange={(value) => updateQuestion(
                                selectedQuestionIndex, 
                                'type', 
                                value as Question['type']
                              )}
                            >
                              <SelectTrigger className="bg-secondary/40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                                <SelectItem value="true-false">True/False</SelectItem>
                                <SelectItem value="fill-blank">Fill in the Blank</SelectItem>
                                <SelectItem value="short-answer">Short Answer</SelectItem>
                                <SelectItem value="long-answer">Long Answer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="question-marks">Marks</Label>
                            <Input 
                              id="question-marks" 
                              type="number"
                              min="1"
                              value={questions[selectedQuestionIndex].marks}
                              onChange={(e) => updateQuestion(selectedQuestionIndex, 'marks', parseInt(e.target.value) || 1)}
                              className="bg-secondary/40"
                            />
                          </div>
                        </div>
                        
                        {(questions[selectedQuestionIndex].type === 'multiple-choice' || 
                          questions[selectedQuestionIndex].type === 'true-false') && (
                          <div className="space-y-2">
                            <Label>Options</Label>
                            <div className="space-y-2">
                              {questions[selectedQuestionIndex].options?.map((option, optIndex) => (
                                <div key={optIndex} className="flex space-x-2">
                                  <Input 
                                    value={option}
                                    onChange={(e) => updateOption(selectedQuestionIndex, optIndex, e.target.value)}
                                    className="bg-secondary/40"
                                  />
                                  {questions[selectedQuestionIndex].type === 'multiple-choice' && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="shrink-0"
                                      onClick={() => removeOption(selectedQuestionIndex, optIndex)}
                                      disabled={questions[selectedQuestionIndex].options?.length <= 2}
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                              
                              {questions[selectedQuestionIndex].type === 'multiple-choice' && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="mt-2"
                                  onClick={() => addOption(selectedQuestionIndex)}
                                >
                                  <Plus className="mr-2 h-3 w-3" />
                                  Add Option
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {questions[selectedQuestionIndex].type === 'fill-blank' && (
                          <div className="space-y-2">
                            <Label htmlFor="fill-blank-answer">Correct Answer</Label>
                            <Input 
                              id="fill-blank-answer" 
                              value={questions[selectedQuestionIndex].answer || ''}
                              onChange={(e) => updateQuestion(selectedQuestionIndex, 'answer', e.target.value)}
                              className="bg-secondary/40"
                              placeholder="Enter the correct answer for the blank"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center p-6">
                        <p className="text-muted-foreground">Select a question to edit or create a new one.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="p-4 md:p-6 mt-0">
              <div className="space-y-6">
                <div className="bg-white/5 rounded-lg p-4 md:p-6 border border-white/10">
                  <div className="text-center mb-6">
                    <h1 className="text-xl md:text-2xl font-bold">{paperTitle}</h1>
                    <p className="text-sm md:text-base text-muted-foreground">
                      Duration: {duration} minutes | Total Marks: {calculateTotalMarks()}
                    </p>
                  </div>
                  
                  <div className="mb-6 border border-white/10 rounded-md p-4 bg-white/5">
                    <h3 className="font-semibold mb-2">Instructions:</h3>
                    <ul className="space-y-1 text-sm list-disc pl-5">
                      <li>Answer all questions.</li>
                      <li>Write clearly and show all your work.</li>
                      <li>Time management is crucial.</li>
                    </ul>
                  </div>
                  
                  {questions.length > 0 ? (
                    <div className="space-y-6">
                      {questions.map((q, index) => (
                        <div key={q.id} className="p-4 border border-white/10 rounded-md bg-white/5">
                          <p className="font-medium mb-2">
                            Q{index + 1}. [{q.marks} marks] {q.text}
                          </p>
                          
                          {q.type === 'multiple-choice' || q.type === 'true-false' ? (
                            <div className="ml-5 space-y-1 mt-2">
                              {q.options?.map((option, oi) => (
                                <div key={oi} className="flex items-center gap-2">
                                  <div className="w-4 h-4 rounded-full border border-white/30"></div>
                                  <span>{option}</span>
                                </div>
                              ))}
                            </div>
                          ) : q.type === 'fill-blank' ? (
                            <p className="italic text-sm text-muted-foreground mt-1">(Fill in the blank)</p>
                          ) : q.type === 'short-answer' ? (
                            <p className="italic text-sm text-muted-foreground mt-1">(Answer in 2-3 sentences)</p>
                          ) : (
                            <p className="italic text-sm text-muted-foreground mt-1">(Answer in 300-500 words)</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No questions added yet.</p>
                      <Button 
                        variant="outline" 
                        className="mt-4" 
                        onClick={() => setActiveTab('questions')}
                      >
                        Add Questions
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('questions')}
                  >
                    Back to Questions
                  </Button>
                  
                  <Button 
                    onClick={generateQuestionPaper}
                    disabled={questions.length === 0}
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Download Question Paper
                  </Button>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
};

export default QuestionPaperGenerator;
