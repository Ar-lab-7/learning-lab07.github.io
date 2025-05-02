
import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useDeviceType } from '@/hooks/use-mobile';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
  isWebEditor?: boolean;
  singleFileMode?: boolean;
}

/**
 * Monaco-based code editor component for content editing
 * Supports markdown or combined HTML/CSS/JS editing
 */
const CodeEditor: React.FC<CodeEditorProps> = ({ 
  value, 
  onChange, 
  language = 'markdown',
  height = '400px',
  isWebEditor = false,
  singleFileMode = false
}) => {
  const { isMobile } = useDeviceType();
  const [activeLanguage, setActiveLanguage] = useState(language);
  const [htmlContent, setHtmlContent] = useState('');
  const [cssContent, setCssContent] = useState('');
  const [jsContent, setJsContent] = useState('');
  const [combinedContent, setCombinedContent] = useState('');
  
  // Parse web content based on mode
  useEffect(() => {
    if (isWebEditor) {
      if (singleFileMode) {
        // When in single file mode, the entire content is in one string
        setCombinedContent(value);
        
        // Try to extract parts for the tabbed view if needed
        try {
          const htmlMatch = value.match(/<html>([\s\S]*?)<\/html>/) || ['', ''];
          const cssMatch = value.match(/<css>([\s\S]*?)<\/css>/) || ['', ''];
          const jsMatch = value.match(/<javascript>([\s\S]*?)<\/javascript>/) || ['', ''];
          
          setHtmlContent(htmlMatch[1] || '');
          setCssContent(cssMatch[1] || '');
          setJsContent(jsMatch[1] || '');
        } catch (error) {
          console.error('Error parsing single file content:', error);
        }
      } else {
        // Traditional separate content mode
        try {
          // Try to parse the combined content if it exists
          const htmlMatch = value.match(/<html>([\s\S]*?)<\/html>/) || ['', ''];
          const cssMatch = value.match(/<css>([\s\S]*?)<\/css>/) || ['', ''];
          const jsMatch = value.match(/<javascript>([\s\S]*?)<\/javascript>/) || ['', ''];
          
          // Set the individual content sections
          setHtmlContent(htmlMatch[1] || '');
          setCssContent(cssMatch[1] || '');
          setJsContent(jsMatch[1] || '');
          
          // Create combined view for single file mode
          setCombinedContent(value);
        } catch (error) {
          console.error('Error parsing web content:', error);
          // Initialize with empty content if parsing fails
          setHtmlContent('');
          setCssContent('');
          setJsContent('');
          setCombinedContent('');
        }
      }
    }
  }, [isWebEditor, value, singleFileMode]);
  
  // Combine web content when individual sections change
  useEffect(() => {
    if (isWebEditor && !singleFileMode) {
      const newCombined = 
        `<html>${htmlContent}</html>
<css>${cssContent}</css>
<javascript>${jsContent}</javascript>`;
      
      setCombinedContent(newCombined);
      onChange(newCombined);
    }
  }, [htmlContent, cssContent, jsContent, isWebEditor, onChange, singleFileMode]);
  
  // Handle editor value change based on active language and mode
  const handleEditorChange = (newValue: string | undefined) => {
    if (!newValue) return;
    
    if (isWebEditor) {
      if (singleFileMode) {
        // In single file mode, we update the entire content at once
        setCombinedContent(newValue);
        onChange(newValue);
      } else {
        // In tabbed mode, we update the specific section
        switch (activeLanguage) {
          case 'html':
            setHtmlContent(newValue);
            break;
          case 'css':
            setCssContent(newValue);
            break;
          case 'javascript':
            setJsContent(newValue);
            break;
          default:
            break;
        }
      }
    } else {
      // Regular markdown mode
      onChange(newValue);
    }
  };

  const getEditorLanguage = () => {
    if (!isWebEditor) return language;
    if (singleFileMode) return 'html'; // Use HTML as base language for combined mode
    return activeLanguage;
  };

  const getEditorValue = () => {
    if (!isWebEditor) return value;
    if (singleFileMode) return combinedContent;
    
    switch (activeLanguage) {
      case 'html': return htmlContent;
      case 'css': return cssContent;
      case 'javascript': return jsContent;
      default: return '';
    }
  };

  return (
    <div className="rounded-md border border-eduAccent/20 overflow-hidden">
      {isWebEditor && !singleFileMode && (
        <Tabs value={activeLanguage} onValueChange={setActiveLanguage as any} className="bg-eduDark/50 p-1">
          <TabsList>
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="css">CSS</TabsTrigger>
            <TabsTrigger value="javascript">JavaScript</TabsTrigger>
          </TabsList>
        </Tabs>
      )}
      <Editor
        height={height}
        language={getEditorLanguage()}
        value={getEditorValue()}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: !isMobile },
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          fontSize: isMobile ? 13 : 14,
          lineNumbers: 'on',
          tabSize: 2,
          folding: true,
          automaticLayout: true,
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            verticalHasArrows: false,
            horizontalHasArrows: false,
          },
        }}
        loading={
          <div className="h-full w-full flex items-center justify-center bg-eduDark/80">
            <div className="text-eduLight animate-pulse">Loading editor...</div>
          </div>
        }
        onMount={(editor) => {
          // Focus the editor on mount
          editor.focus();
        }}
      />
    </div>
  );
};

export default CodeEditor;
