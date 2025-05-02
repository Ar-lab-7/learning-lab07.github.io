
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
  explanation: string;
  type: 'multiple-choice' | 'true-false';
}

interface CustomQuestionParserProps {
  onAddQuestions: (questions: Question[]) => void;
}

const CustomQuestionParser: React.FC<CustomQuestionParserProps> = ({ onAddQuestions }) => {
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const parseQuestions = () => {
    if (!rawText.trim()) {
      toast.error("Please paste your questions first");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Split by double newlines to separate questions
      const questionBlocks = rawText.split(/\n\s*\n/);
      
      const parsedQuestions: Question[] = questionBlocks
        .filter(block => block.trim().length > 0)
        .map(block => {
          const lines = block.trim().split('\n');
          
          // First line is the question text
          const questionText = lines[0].replace(/^\d+\.\s*/, '').trim();
          
          // Find the correct answer marker (usually indicated by * or [correct])
          const correctOptionIndex = lines.findIndex((line, i) => 
            i > 0 && (line.includes('*') || line.toLowerCase().includes('[correct]') || line.toLowerCase().includes('(correct)'))
          ) - 1;
          
          // Parse options, removing any markers
          const options = lines.slice(1)
            .map(line => line.replace(/^[a-z]\)\s*|\*|\[correct\]|\(correct\)/gi, '').trim())
            .filter(line => line.length > 0);
          
          // Find explanation if it exists (usually after "Explanation:" or similar)
          const explanationIndex = lines.findIndex(line => 
            line.toLowerCase().includes('explanation:') || 
            line.toLowerCase().includes('reason:')
          );
          
          let explanation = '';
          if (explanationIndex !== -1) {
            explanation = lines[explanationIndex].replace(/^(explanation|reason):\s*/i, '').trim();
            if (explanationIndex + 1 < lines.length && !lines[explanationIndex + 1].includes(':')) {
              explanation += ' ' + lines[explanationIndex + 1].trim();
            }
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
        onAddQuestions(parsedQuestions);
        toast.success(`Successfully parsed ${parsedQuestions.length} questions`);
        setRawText('');
      } else {
        toast.error("No valid questions found. Please check the format.");
      }
    } catch (error) {
      console.error("Error parsing questions:", error);
      toast.error("Failed to parse questions. Check the format and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Custom Question Parser</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder={`Paste your questions here in this format:
          
1. What is the capital of France?
a) London
b) Paris *
c) Berlin
d) Madrid

Explanation: Paris is the capital of France.

2. The Earth is flat.
a) True
b) False [correct]

Explanation: The Earth is approximately spherical.`}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          rows={10}
          className="mb-4"
        />
        <div className="flex justify-end">
          <Button 
            onClick={parseQuestions} 
            disabled={isProcessing || !rawText.trim()}
          >
            {isProcessing ? 'Processing...' : 'Parse Questions'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomQuestionParser;
