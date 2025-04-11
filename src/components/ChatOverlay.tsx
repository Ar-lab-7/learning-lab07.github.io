
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Send, Bot, User } from 'lucide-react';

interface ChatOverlayProps {
  onClose: () => void;
  blogs: Array<{
    title: string;
    content: string;
    date: string;
    readTime: string;
  }>;
}

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

const ChatOverlay: React.FC<ChatOverlayProps> = ({ onClose, blogs }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      text: "Hi! I'm EduBot. Ask me any questions about the blog content, and I'll try to help you.", 
      isUser: false 
    }
  ]);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Function to find answers in blog content
  const findAnswer = (question: string) => {
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
      
      return `Based on the blog content: ${topSentences.charAt(0).toUpperCase() + topSentences.slice(1)}${blogReference}`;
    }
    
    return "I couldn't find specific information about that in the blogs. Could you rephrase your question?";
  };
  
  // Function to generate suggestions based on input
  const generateSuggestions = (input: string) => {
    if (!input.trim()) {
      setSuggestions([]);
      return;
    }
    
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
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    generateSuggestions(e.target.value);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
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
      
      const botMessage: Message = {
        id: Date.now() + 1,
        text: answer,
        isUser: false
      };
      
      setMessages(prev => [...prev, botMessage]);
    }, 500);
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
                    {message.text}
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
