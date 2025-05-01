
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
}

/**
 * Monaco-based code editor component for content editing
 */
const CodeEditor: React.FC<CodeEditorProps> = ({ 
  value, 
  onChange, 
  language = 'markdown',
  height = '400px',
  isWebEditor = false
}) => {
  const { isMobile } = useDeviceType();
  const [activeLanguage, setActiveLanguage] = useState(language);
  const [htmlContent, setHtmlContent] = useState('');
  const [cssContent, setCssContent] = useState('');
  const [jsContent, setJsContent] = useState('');
  
  // Parse web content if in web editor mode
  useEffect(() => {
    if (isWebEditor) {
      try {
        // Try to parse the combined content if it exists
        const htmlMatch = value.match(/<html>([\s\S]*?)<\/html>/);
        const cssMatch = value.match(/<css>([\s\S]*?)<\/css>/);
        const jsMatch = value.match(/<javascript>([\s\S]*?)<\/javascript>/);
        
        // Set the individual content sections
        setHtmlContent(htmlMatch ? htmlMatch[1] : '');
        setCssContent(cssMatch ? cssMatch[1] : '');
        setJsContent(jsMatch ? jsMatch[1] : '');
      } catch (error) {
        console.error('Error parsing web content:', error);
        // Initialize with empty content if parsing fails
        setHtmlContent('');
        setCssContent('');
        setJsContent('');
      }
    }
  }, [isWebEditor, value]);
  
  // Combine web content when individual sections change
  useEffect(() => {
    if (isWebEditor) {
      const combinedContent = 
        `<html>${htmlContent}</html>
<css>${cssContent}</css>
<javascript>${jsContent}</javascript>`;
      
      onChange(combinedContent);
    }
  }, [htmlContent, cssContent, jsContent, isWebEditor, onChange]);
  
  // Handle editor value change based on active language
  const handleEditorChange = (newValue: string | undefined) => {
    if (isWebEditor) {
      switch (activeLanguage) {
        case 'html':
          setHtmlContent(newValue || '');
          break;
        case 'css':
          setCssContent(newValue || '');
          break;
        case 'javascript':
          setJsContent(newValue || '');
          break;
        default:
          break;
      }
    } else {
      onChange(newValue || '');
    }
  };

  return (
    <div className="rounded-md border border-eduAccent/20 overflow-hidden">
      {isWebEditor && (
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
        language={isWebEditor ? activeLanguage : language}
        value={isWebEditor ? 
          (activeLanguage === 'html' ? htmlContent : 
           activeLanguage === 'css' ? cssContent : 
           jsContent) : value}
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
