
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Send, Bot, User } from 'lucide-react';
import { toast } from 'sonner';

interface ChatOverlayProps {
  onClose: () => void;
  blogs: Array<{
    title: string;
    content: string;
    date: string;
    readTime: string;
    imageUrl?: string;
  }>;
}

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  formattedText?: string;
}

const ChatOverlay: React.FC<ChatOverlayProps> = ({ onClose, blogs }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      text: "Hi! I'm EduBot. Ask me any questions about the blog content, and I'll try to help you.",
      formattedText: "<p>Hi! I'm EduBot. Ask me any questions about the blog content, and I'll try to help you.</p>", 
      isUser: false 
    }
  ]);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Convert markdown to HTML
  const markdownToHtml = (markdown: string) => {
    if (!markdown) return '';
    
    let html = markdown;
    
    // Convert headings
    html = html.replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold my-2">$1</h1>');
    html = html.replace(/^## (.*$)/gm, '<h2 class="text-lg font-semibold my-2">$1</h2>');
    html = html.replace(/^### (.*$)/gm, '<h3 class="text-md font-medium my-1">$1</h3>');
    
    // Convert bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert lists
    html = html.replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>');
    html = html.replace(/<\/li>\n<li/g, '</li><li');
    html = html.replace(/(<li.*<\/li>)/gs, '<ul class="my-2">$1</ul>');
    
    // Convert tables
    const convertTable = (match: string) => {
      const rows = match.trim().split('\n');
      let tableHtml = '<table class="border-collapse w-full my-2">';
      
      rows.forEach((row, rowIndex) => {
        const cells = row.split('|').filter(cell => cell.trim() !== '');
        const isHeader = rowIndex === 0;
        const isDelimiter = row.includes('----');
        
        if (!isDelimiter) {
          tableHtml += '<tr>';
          cells.forEach(cell => {
            if (isHeader) {
              tableHtml += `<th class="border border-gray-600 px-2 py-1 bg-gray-800">${cell.trim()}</th>`;
            } else {
              tableHtml += `<td class="border border-gray-600 px-2 py-1">${cell.trim()}</td>`;
            }
          });
          tableHtml += '</tr>';
        }
      });
      
      tableHtml += '</table>';
      return tableHtml;
    };
    
    // Find and convert tables
    const tableRegex = /\|.*\|[\s\S]*?\|.*\|/g;
    html = html.replace(tableRegex, convertTable);
    
    // Convert checkboxes
    html = html.replace(/\[x\] (.*$)/gm, '<div class="flex items-center gap-2 ml-4 my-1"><input type="checkbox" checked disabled /><span>$1</span></div>');
    html = html.replace(/\[ \] (.*$)/gm, '<div class="flex items-center gap-2 ml-4 my-1"><input type="checkbox" disabled /><span>$1</span></div>');
    
    // Convert links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-400 hover:underline" target="_blank">$1</a>');
    
    // Convert fill in the blanks
    html = html.replace(/_{3,}(.*?)_{3,}/g, '<span class="px-2 mx-1 border-b-2 border-blue-500">$1</span>');
    
    // Convert paragraphs
    html = html.replace(/^(?!<[a-z]).+/gm, '<p class="my-1">$&</p>');
    
    // Fix any broken paragraphs
    html = html.replace(/<p><\/p>/g, '');
    
    return html;
  };
  
  // Function to find answers in blog content
  const findAnswer = (question: string) => {
    try {
      // Normalize the question
      const normalizedQuestion = question.toLowerCase().trim();
      
      // Content from all blogs joined together for searching
      const allContent = blogs.map(blog => blog.content.toLowerCase()).join(' ');
      
      // Try to find direct matches or related content
      const words = normalizedQuestion.split(/\s+/).filter(word => word.length > 3);
      
      // Extract sentences from blog content
      const sentences = allContent.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);
      
      // Score each sentence based on word matches
      const scoredSentences = sentences.map(sentence => {
        const score = words.reduce((count, word) => {
          return sentence.includes(word) ? count + 1 : count;
        }, 0);
        return { sentence, score };
      });
      
      // Sort by score (descending)
      scoredSentences.sort((a, b) => b.score - a.score);
      
      // If we have good matches
      if (scoredSentences.length > 0 && scoredSentences[0].score > 0) {
        // Find which blog the answer comes from
        const topSentence = scoredSentences[0].sentence;
        const sourceBlog = blogs.find(blog => 
          blog.content.toLowerCase().includes(topSentence)
        );
        
        const blogReference = sourceBlog 
          ? `\n\n(Found in blog: "${sourceBlog.title}")` 
          : '';
        
        // Get surrounding context
        const topSentences = scoredSentences
          .slice(0, 2)
          .map(s => s.sentence)
          .join('. ');
        
        // Look for formatting in the original content
        let formattedAnswer = '';
        
        if (sourceBlog) {
          // Try to find the original formatting
          const lowerContent = sourceBlog.content.toLowerCase();
          const sentenceIndex = lowerContent.indexOf(topSentence);
          
          if (sentenceIndex >= 0) {
            // Extract a larger chunk of content to preserve formatting
            const startIndex = Math.max(0, lowerContent.lastIndexOf('\n', sentenceIndex));
            const endIndex = Math.min(sourceBlog.content.length, lowerContent.indexOf('\n\n', sentenceIndex + topSentence.length));
            
            if (endIndex > startIndex) {
              formattedAnswer = sourceBlog.content.substring(startIndex, endIndex);
            }
          }
        }
        
        if (!formattedAnswer) {
          formattedAnswer = topSentences.charAt(0).toUpperCase() + topSentences.slice(1);
        }
        
        return formattedAnswer + blogReference;
      }
      
      return "I couldn't find specific information about that in the blogs. Could you rephrase your question?";
    } catch (error) {
      console.error('Error finding answer:', error);
      return "Sorry, there was an error processing your question. Please try again.";
    }
  };
  
  // Function to generate suggestions based on input
  const generateSuggestions = (input: string) => {
    if (!input.trim()) {
      setSuggestions([]);
      return;
    }
    
    try {
      const words = input.toLowerCase().split(/\s+/);
      const lastWord = words[words.length - 1];
      
      // Extract keywords from blog content
      const keywords = blogs.flatMap(blog => {
        const content = blog.content.toLowerCase();
        const extracted = content.split(/\s+/)
          .filter(word => word.length > 3)
          .filter(word => !['and', 'the', 'this', 'that', 'with'].includes(word));
        return [...extracted, blog.title.toLowerCase()];
      });
      
      // Find matching keywords
      const matchingKeywords = [...new Set(keywords)].filter(keyword => 
        keyword.startsWith(lastWord) && keyword !== lastWord
      ).slice(0, 3);
      
      // Generate complete suggestions
      const completeSuggestions = matchingKeywords.map(keyword => {
        const inputWithoutLastWord = words.slice(0, -1).join(' ');
        return inputWithoutLastWord ? `${inputWithoutLastWord} ${keyword}` : keyword;
      });
      
      setSuggestions(completeSuggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      setSuggestions([]);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    generateSuggestions(e.target.value);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    try {
      // Add user message
      const userMessage: Message = {
        id: Date.now(),
        text: input,
        isUser: true
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Clear suggestions and input
      setSuggestions([]);
      setInput('');
      
      // Generate response
      setTimeout(() => {
        const answer = findAnswer(input);
        const formattedText = markdownToHtml(answer);
        
        const botMessage: Message = {
          id: Date.now() + 1,
          text: answer,
          formattedText,
          isUser: false
        };
        
        setMessages(prev => [...prev, botMessage]);
      }, 500);
    } catch (error) {
      console.error('Error handling chat submission:', error);
      toast.error('An error occurred. Please try again.');
    }
  };
  
  const applySuggestion = (suggestion: string) => {
    setInput(suggestion);
    setSuggestions([]);
    
    // Focus the input field
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="container max-w-2xl mx-auto my-8 h-[80vh] flex flex-col glass rounded-lg animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h2 className="text-xl font-bold">EduScribe Q&A Chat</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
        </div>
        
        <ScrollArea className="flex-grow p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-2 max-w-[80%] ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`p-1 rounded-full ${message.isUser ? 'bg-eduHighlight/20' : 'bg-eduAccent/20'}`}>
                    {message.isUser ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  <div className={`p-3 rounded-lg ${message.isUser ? 'bg-eduHighlight/20 text-eduLight' : 'bg-eduAccent/20 text-eduLight'}`}>
                    {message.formattedText ? (
                      <div dangerouslySetInnerHTML={{ __html: message.formattedText }} />
                    ) : (
                      message.text
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {suggestions.length > 0 && (
          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Button 
                  key={index} 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => applySuggestion(suggestion)}
                  className="text-sm py-1"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Ask a question about the blog content..."
              value={input}
              onChange={handleInputChange}
              className="flex-grow bg-secondary/60 border-eduAccent/20 focus:border-eduAccent"
            />
            <Button type="submit" size="icon"><Send size={18} /></Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatOverlay;
