
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BlogEditorTable from './BlogEditorTable';
import { Bold, Italic, List, Image, Link, Heading, Check, Type, Quote, ListOrdered, Code } from 'lucide-react';

interface BlogEditorUtilsProps {
  onFormatInsert: (format: string, customContent?: string) => void;
  content: string;
}

const BlogEditorUtils: React.FC<BlogEditorUtilsProps> = ({ onFormatInsert, content }) => {
  const [showTableCreator, setShowTableCreator] = useState(false);
  
  const handleInsertTable = (tableMarkdown: string) => {
    onFormatInsert('custom-table', tableMarkdown);
    setShowTableCreator(false);
  };

  const formatOptions = [
    { id: 'text', label: 'Text', items: [
      { id: 'heading', icon: <Heading size={18} />, title: 'Heading' },
      { id: 'bold', icon: <Bold size={18} />, title: 'Bold' },
      { id: 'italic', icon: <Italic size={18} />, title: 'Italic' },
      { id: 'quote', icon: <Quote size={18} />, title: 'Quote' },
    ]},
    { id: 'lists', label: 'Lists', items: [
      { id: 'list', icon: <List size={18} />, title: 'Bullet List' },
      { id: 'ordered-list', icon: <ListOrdered size={18} />, title: 'Numbered List' },
      { id: 'checkbox', icon: <Check size={18} />, title: 'Checkbox' },
    ]},
    { id: 'elements', label: 'Elements', items: [
      { id: 'image', icon: <Image size={18} />, title: 'Image' },
      { id: 'link', icon: <Link size={18} />, title: 'Link' },
      { id: 'table', icon: <Link size={18} />, title: 'Table', action: () => setShowTableCreator(true) },
      { id: 'code', icon: <Code size={18} />, title: 'Code Block' },
      { id: 'fillblank', icon: <Type size={18} />, title: 'Fill in blank' },
    ]},
  ];

  const [activeSection, setActiveSection] = useState('text');

  if (showTableCreator) {
    return <BlogEditorTable onInsert={handleInsertTable} onBack={() => setShowTableCreator(false)} />;
  }

  return (
    <div className="bg-background/80 p-2 rounded-md border">
      <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          {formatOptions.map(section => (
            <TabsTrigger key={section.id} value={section.id}>{section.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      
      <div className="flex items-center flex-wrap gap-1 mt-2">
        {formatOptions.find(s => s.id === activeSection)?.items.map(item => (
          <Button 
            key={item.id}
            variant="ghost" 
            size="icon" 
            title={item.title}
            onClick={() => item.action ? item.action() : onFormatInsert(item.id)}
          >
            {item.icon}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default BlogEditorUtils;
