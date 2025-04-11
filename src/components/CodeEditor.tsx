
import React, { useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useDeviceType } from '@/hooks/use-mobile';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
}

/**
 * Monaco-based code editor component for content editing
 */
const CodeEditor: React.FC<CodeEditorProps> = ({ 
  value, 
  onChange, 
  language = 'markdown', 
  height = '400px' 
}) => {
  const { isMobile } = useDeviceType();
  
  // Handle editor value change
  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '');
  };

  return (
    <div className="rounded-md border border-eduAccent/20 overflow-hidden">
      <Editor
        height={height}
        language={language}
        value={value}
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
