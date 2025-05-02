
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CustomQuestionParserProps {
  onAddQuestions: (questions: any[]) => void;
}

const CustomQuestionParser: React.FC<CustomQuestionParserProps> = ({ onAddQuestions }) => {
  const [customQuestions, setCustomQuestions] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const parseCustomQuestions = () => {
    setIsParsing(true);
    setTimeout(() => {
      try {
        const lines = customQuestions.trim().split('\n');
        let currentQuestion: any = null;
        const parsedQuestions: any[] = [];
        
        lines.forEach(line => {
          const trimmedLine = line.trim();
          
          // Skip empty lines
          if (!trimmedLine) return;
          
          // Question line
          if (trimmedLine.startsWith('Q:') || trimmedLine.match(/^\d+\./)) {
            // Save previous question if exists
            if (currentQuestion && currentQuestion.text && currentQuestion.options.length > 0) {
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
                    currentQuestion.options[1].toLowerCase().includes('false')) {
                  currentQuestion.type = 'true-false';
                }
              }
            }
          }
        });
        
        // Add the last question
        if (currentQuestion && currentQuestion.text && currentQuestion.options.length > 0) {
          parsedQuestions.push(currentQuestion);
        }
        
        if (parsedQuestions.length > 0) {
          // Add to existing questions
          onAddQuestions(parsedQuestions);
          setCustomQuestions(''); // Clear the input area
          toast.success(`Added ${parsedQuestions.length} custom questions`);
        } else {
          toast.error("No valid questions found");
        }
      } catch (error) {
        console.error("Error parsing custom questions:", error);
        toast.error("Failed to parse custom questions. Check the format and try again.");
      } finally {
        setIsParsing(false);
      }
    }, 500);
  };

  return (
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
          className="mt-4 w-full"
          disabled={isParsing}
        >
          {isParsing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Parsing...
            </>
          ) : (
            <>Add Custom Questions</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CustomQuestionParser;
