
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X, Send, Loader2, Download, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import PdfExport from './PdfExport';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface QuestionPaperGeneratorProps {
  onClose: () => void;
  blogs: {
    title: string;
    content: string;
    date: string;
    readTime: string;
    subject?: string;
  }[];
}

interface Question {
  id: number;
  text: string;
  type: 'multiple-choice' | 'short-answer' | 'true-false';
  options?: string[];
  answer: string;
}

const QuestionPaperGenerator: React.FC<QuestionPaperGeneratorProps> = ({ onClose, blogs }) => {
  const [topic, setTopic] = useState('');
  const [selectedBlog, setSelectedBlog] = useState('');
  const [questionType, setQuestionType] = useState('mixed');
  const [numQuestions, setNumQuestions] = useState('10');
  const [difficultyLevel, setDifficultyLevel] = useState('moderate');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [generatedPaper, setGeneratedPaper] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizDuration, setQuizDuration] = useState('24');
  const [quizPassword, setQuizPassword] = useState('');
  const [showAnswers, setShowAnswers] = useState(false);
  
  const generatePaper = async () => {
    if (!topic.trim() && !selectedBlog) {
      toast.error('Please select a blog or enter a topic');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Choose the content to base questions on
      let contentToUse = topic;
      
      if (selectedBlog && selectedBlog !== "custom-topic") {
        const selectedBlogContent = blogs.find(blog => blog.title === selectedBlog);
        if (selectedBlogContent) {
          contentToUse = selectedBlogContent.content;
        }
      }
      
      // Start with a header
      let paper = `# ${topic || selectedBlog} - Question Paper\n\n`;
      paper += `## ${difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)} Difficulty - ${numQuestions} Questions\n\n`;
      
      // Generate different types of questions based on questionType
      const generatedQuestionsArray: Question[] = [];
      
      switch (questionType) {
        case 'multiple-choice':
          for (let i = 1; i <= parseInt(numQuestions); i++) {
            const question: Question = {
              id: i,
              text: `Question ${i}: What is the main concept discussed in the content?`,
              type: 'multiple-choice',
              options: [
                'Option A: This is a possible answer',
                'Option B: This is another option',
                'Option C: This might be correct',
                'Option D: Or perhaps this one is right',
              ],
              answer: 'C'
            };
            generatedQuestionsArray.push(question);
            
            paper += `### Question ${i}\n${question.text}\n\n`;
            if (question.options) {
              question.options.forEach(opt => {
                paper += `- ${opt}\n`;
              });
            }
            if (showAnswers) {
              paper += `\n**Answer: ${question.answer}**\n`;
            }
            paper += '\n';
          }
          break;
          
        case 'short-answer':
          for (let i = 1; i <= parseInt(numQuestions); i++) {
            const question: Question = {
              id: i,
              text: `Question ${i}: Explain briefly the significance of the key point made about ${topic || 'this topic'}.`,
              type: 'short-answer',
              answer: 'This would require a concise explanation about the main concept.'
            };
            generatedQuestionsArray.push(question);
            
            paper += `### Question ${i}\n${question.text}\n\n_Answer in 2-3 sentences._\n\n`;
            if (showAnswers) {
              paper += `**Sample Answer: ${question.answer}**\n\n`;
            }
          }
          break;
          
        case 'true-false':
          for (let i = 1; i <= parseInt(numQuestions); i++) {
            const question: Question = {
              id: i,
              text: `Question ${i}: The document suggests that ${topic || 'this concept'} is the most important factor in this field.`,
              type: 'true-false',
              answer: i % 2 === 0 ? 'True' : 'False'
            };
            generatedQuestionsArray.push(question);
            
            paper += `### Question ${i}\n${question.text}\n\n- [ ] True\n- [ ] False\n\n`;
            if (showAnswers) {
              paper += `**Answer: ${question.answer}**\n\n`;
            }
          }
          break;
          
        case 'mixed':
        default:
          for (let i = 1; i <= parseInt(numQuestions); i++) {
            let question: Question;
            
            if (i % 3 === 0) {
              question = {
                id: i,
                text: `Question ${i}: Is it accurate to state that ${topic || 'this topic'} directly influences related outcomes?`,
                type: 'true-false',
                answer: i % 2 === 0 ? 'True' : 'False'
              };
              paper += `### Question ${i} (True/False)\n${question.text}\n\n- [ ] True\n- [ ] False\n\n`;
              if (showAnswers) {
                paper += `**Answer: ${question.answer}**\n\n`;
              }
            } else if (i % 3 === 1) {
              question = {
                id: i,
                text: `Question ${i}: What is a key characteristic of ${topic || 'this subject'}?`,
                type: 'multiple-choice',
                options: [
                  'Option A: First possible characteristic',
                  'Option B: Second possible characteristic',
                  'Option C: Third possible characteristic',
                  'Option D: Fourth possible characteristic',
                ],
                answer: 'B'
              };
              paper += `### Question ${i} (Multiple Choice)\n${question.text}\n\n`;
              if (question.options) {
                question.options.forEach(opt => {
                  paper += `- ${opt}\n`;
                });
              }
              if (showAnswers) {
                paper += `\n**Answer: ${question.answer}**\n\n`;
              } else {
                paper += '\n';
              }
            } else {
              question = {
                id: i,
                text: `Question ${i}: Briefly describe how ${topic || 'this concept'} applies in a practical scenario.`,
                type: 'short-answer',
                answer: 'A practical application would involve implementation in a relevant context.'
              };
              paper += `### Question ${i} (Short Answer)\n${question.text}\n\n_Answer in 3-4 sentences._\n\n`;
              if (showAnswers) {
                paper += `**Sample Answer: ${question.answer}**\n\n`;
              }
            }
            
            generatedQuestionsArray.push(question);
          }
          break;
      }
      
      if (additionalInstructions) {
        paper += `## Additional Instructions\n\n${additionalInstructions}\n`;
      }
      
      // Add quiz information if in quiz mode
      if (isQuizMode) {
        paper += `\n## Quiz Competition\nThis quiz is available for 24 hours.\n`;
        paper += `Difficulty: ${difficultyLevel}\n`;
        paper += `Total Questions: ${numQuestions}\n`;
        if (quizPassword) {
          paper += `This quiz is password protected.\n`;
        }
      }
      
      setGeneratedPaper(paper);
      setGeneratedQuestions(generatedQuestionsArray);
      toast.success('Question paper generated successfully!');
      
      // Save to Supabase if it's a quiz
      if (isQuizMode) {
        try {
          const expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + parseInt(quizDuration));
          
          const { data, error } = await supabase
            .from('quizzes')
            .insert({
              title: topic || selectedBlog,
              questions: generatedQuestionsArray,
              difficulty: difficultyLevel,
              expires_at: expiresAt.toISOString(),
              password: quizPassword || null
            })
            .select('id')
            .single();
            
          if (error) {
            console.error('Error saving quiz:', error);
            toast.error('Failed to create online quiz');
          } else {
            toast.success(`Quiz created! Available for ${quizDuration} hours`);
          }
        } catch (error) {
          console.error('Error creating quiz:', error);
          toast.error('Failed to create online quiz');
        }
      }
    } catch (error) {
      console.error('Error generating paper:', error);
      toast.error('Failed to generate question paper');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const downloadPaper = () => {
    if (!generatedPaper) {
      toast.error('Please generate a question paper first');
      return;
    }
    
    const element = document.createElement('a');
    const file = new Blob([generatedPaper], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${topic || selectedBlog}-questions.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Question paper downloaded successfully!');
  };
  
  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="container max-w-4xl mx-auto my-8 p-6 glass rounded-lg animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Question Paper Generator</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Blog or Enter Topic</label>
                <Select value={selectedBlog} onValueChange={setSelectedBlog}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a blog" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom-topic">-- Enter custom topic below --</SelectItem>
                    {blogs.map((blog, index) => (
                      <SelectItem key={index} value={blog.title}>
                        {blog.title} {blog.subject && `(${blog.subject})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Custom Topic</label>
                <Input 
                  value={topic} 
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter topic (optional if blog selected)"
                  disabled={!!selectedBlog && selectedBlog !== "custom-topic"}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Question Type</label>
                  <Select value={questionType} onValueChange={setQuestionType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select question type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                      <SelectItem value="short-answer">Short Answer</SelectItem>
                      <SelectItem value="true-false">True/False</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Number of Questions</label>
                  <Select value={numQuestions} onValueChange={setNumQuestions}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select number of questions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Questions</SelectItem>
                      <SelectItem value="10">10 Questions</SelectItem>
                      <SelectItem value="15">15 Questions</SelectItem>
                      <SelectItem value="20">20 Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Difficulty Level</label>
                <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="challenging">Challenging</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Switch id="show-answers" checked={showAnswers} onCheckedChange={setShowAnswers} />
                <Label htmlFor="show-answers">Include answers in generated paper</Label>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Switch id="quiz-mode" checked={isQuizMode} onCheckedChange={setIsQuizMode} />
                <Label htmlFor="quiz-mode">Create as online quiz competition</Label>
              </div>
              
              {isQuizMode && (
                <div className="space-y-4 pl-6 border-l-2 border-accent/30 mt-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Quiz Duration (hours)</label>
                    <Select value={quizDuration} onValueChange={setQuizDuration}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hour</SelectItem>
                        <SelectItem value="6">6 hours</SelectItem>
                        <SelectItem value="12">12 hours</SelectItem>
                        <SelectItem value="24">24 hours</SelectItem>
                        <SelectItem value="48">48 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Quiz Password (optional)</label>
                    <Input 
                      type="password"
                      value={quizPassword} 
                      onChange={(e) => setQuizPassword(e.target.value)}
                      placeholder="Leave empty for no password"
                    />
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">Additional Instructions</label>
                <Textarea 
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  placeholder="Any specific instructions for answering the questions"
                  rows={3}
                />
              </div>
              
              <Button 
                onClick={generatePaper} 
                disabled={isGenerating || (!topic && !selectedBlog)}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Generate Question Paper
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div>
            <div className="rounded-lg border p-4 h-full bg-secondary/20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Generated Paper</h3>
                {generatedPaper && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={downloadPaper}>
                      <Download className="mr-2 h-4 w-4" />
                      Download TXT
                    </Button>
                    <PdfExport 
                      content={generatedPaper} 
                      title={topic || selectedBlog || 'Question Paper'}
                      fileName={`${(topic || selectedBlog || 'questions').replace(/\s+/g, '-').toLowerCase()}.pdf`}
                    />
                  </div>
                )}
              </div>
              {generatedPaper ? (
                <div className="overflow-y-auto h-[400px] whitespace-pre-wrap">
                  <div className="prose prose-invert max-w-none text-sm">
                    {generatedPaper.split('\n').map((line, index) => {
                      if (line.startsWith('# ')) {
                        return <h1 key={index} className="text-xl font-bold mt-2">{line.substring(2)}</h1>;
                      } else if (line.startsWith('## ')) {
                        return <h2 key={index} className="text-lg font-semibold mt-4">{line.substring(3)}</h2>;
                      } else if (line.startsWith('### ')) {
                        return <h3 key={index} className="text-base font-medium mt-3">{line.substring(4)}</h3>;
                      } else if (line.startsWith('- ')) {
                        return <div key={index} className="flex items-start mt-1"><span className="mr-2">•</span><span>{line.substring(2)}</span></div>;
                      } else if (line.trim().startsWith('_')) {
                        return <p key={index} className="italic text-muted-foreground">{line}</p>;
                      } else if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
                        return <p key={index} className="font-bold text-accent">{line}</p>;
                      } else if (line.trim() === '') {
                        return <div key={index} className="h-2"></div>;
                      } else {
                        return <p key={index}>{line}</p>;
                      }
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-eduLight/60">
                  <p className="text-center">Generated question paper will appear here</p>
                  <p className="text-center text-sm">Configure the parameters on the left and click Generate</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionPaperGenerator;
