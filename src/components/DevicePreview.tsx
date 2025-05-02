
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Smartphone, Tablet, Laptop } from 'lucide-react';

interface DevicePreviewProps {
  contentHtml: string;
  isWebContent?: boolean;
}

const DevicePreview: React.FC<DevicePreviewProps> = ({ contentHtml, isWebContent = false }) => {
  const [activeDevice, setActiveDevice] = useState('desktop');
  
  const getDeviceClass = () => {
    switch (activeDevice) {
      case 'mobile':
        return 'w-[320px] h-[568px]';
      case 'tablet':
        return 'w-[768px] h-[1024px] scale-[0.6] origin-top-left';
      case 'desktop':
      default:
        return 'w-full max-w-[1200px] h-[675px] scale-[0.8] origin-top-left';
    }
  };

  // Function to process web content
  const processWebContent = (content: string): string => {
    try {
      // Extract HTML, CSS, and JS content from the combined content
      const htmlMatch = content.match(/<html>([\s\S]*?)<\/html>/) || ['', ''];
      const cssMatch = content.match(/<css>([\s\S]*?)<\/css>/) || ['', ''];
      const jsMatch = content.match(/<javascript>([\s\S]*?)<\/javascript>/) || ['', ''];
      
      // Create a complete HTML document with the extracted parts
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <style>${cssMatch[1]}</style>
        </head>
        <body>
          ${htmlMatch[1] || content}
          <script>${jsMatch[1]}</script>
        </body>
        </html>
      `;
    } catch (error) {
      console.error('Error processing web content:', error);
      return `
        <!DOCTYPE html>
        <html>
        <body>
          <p>Error processing content</p>
        </body>
        </html>
      `;
    }
  };

  // Function to render device content
  const renderContent = () => {
    if (isWebContent) {
      const htmlContent = processWebContent(contentHtml);
      return (
        <iframe
          srcDoc={htmlContent}
          className="w-full h-full"
          title="Preview"
          sandbox="allow-same-origin allow-scripts"
        />
      );
    }
    
    return (
      <div 
        className="w-full h-full overflow-auto p-4" 
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    );
  };

  return (
    <div className="w-full">
      <Tabs value={activeDevice} onValueChange={setActiveDevice} className="mb-4">
        <TabsList>
          <TabsTrigger value="mobile" className="flex items-center">
            <Smartphone className="mr-2" size={16} />
            Mobile
          </TabsTrigger>
          <TabsTrigger value="tablet" className="flex items-center">
            <Tablet className="mr-2" size={16} />
            Tablet
          </TabsTrigger>
          <TabsTrigger value="desktop" className="flex items-center">
            <Laptop className="mr-2" size={16} />
            Desktop
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="mobile" className="mt-4">
          <div className="flex justify-center">
            <div className={`device-frame border-2 rounded-md overflow-hidden ${getDeviceClass()}`}>
              {renderContent()}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="tablet" className="mt-4">
          <div className="flex justify-center">
            <div className={`device-frame border-2 rounded-md overflow-hidden ${getDeviceClass()}`}>
              {renderContent()}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="desktop" className="mt-4">
          <div className="flex justify-center">
            <div className={`device-frame border-2 rounded-md overflow-hidden ${getDeviceClass()}`}>
              {renderContent()}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DevicePreview;
