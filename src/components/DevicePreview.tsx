
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Laptop, Smartphone, Tablet, RefreshCw } from 'lucide-react';

interface DevicePreviewProps {
  contentHtml: string;
  isWebContent?: boolean;
}

const DevicePreview: React.FC<DevicePreviewProps> = ({ contentHtml, isWebContent = false }) => {
  const [activeDevice, setActiveDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [parsedContent, setParsedContent] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  
  useEffect(() => {
    if (isWebContent) {
      try {
        // Try to parse the HTML, CSS, and JS content
        const htmlMatch = contentHtml.match(/<html>([\s\S]*?)<\/html>/);
        const cssMatch = contentHtml.match(/<css>([\s\S]*?)<\/css>/);
        const jsMatch = contentHtml.match(/<javascript>([\s\S]*?)<\/javascript>/);
        
        const html = htmlMatch ? htmlMatch[1] : '';
        const css = cssMatch ? cssMatch[1] : '';
        const js = jsMatch ? jsMatch[1] : '';
        
        // Combine the content into a full HTML document
        const fullHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>${css}</style>
            </head>
            <body>
              ${html}
              <script>${js}</script>
            </body>
          </html>
        `;
        
        setParsedContent(fullHtml);
      } catch (error) {
        console.error('Error parsing web content:', error);
        setParsedContent(`
          <html>
            <body>
              <p>Error parsing content: ${error}</p>
            </body>
          </html>
        `);
      }
    } else {
      // Regular markdown/HTML content
      setParsedContent(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            <style>
              body {
                font-family: 'Inter', sans-serif;
                padding: 20px;
                line-height: 1.6;
                max-width: 100%;
                color: #F1F0FB;
                background-color: #1A1F2C;
              }
              img {
                max-width: 100%;
                height: auto;
                border-radius: 0.5rem;
              }
              pre {
                background: rgba(0, 0, 0, 0.3);
                padding: 16px;
                border-radius: 6px;
                overflow-x: auto;
                margin: 12px 0;
              }
              code {
                background: rgba(0, 0, 0, 0.2);
                padding: 2px 4px;
                border-radius: 4px;
                color: #1EAEDB;
              }
              h1 {
                font-size: 2rem;
                font-weight: 700;
                margin-bottom: 1rem;
                line-height: 1.2;
              }
              h2, h3, h4, h5, h6 {
                margin-top: 1.5em;
                margin-bottom: 0.5em;
                color: #F1F0FB;
              }
              h2 {
                font-size: 1.5rem;
                font-weight: 600;
              }
              h3 {
                font-size: 1.25rem;
                font-weight: 500;
              }
              p {
                margin: 0.5rem 0;
              }
              a {
                color: #1EAEDB;
                text-decoration: none;
              }
              a:hover {
                text-decoration: underline;
              }
              table {
                border-collapse: collapse;
                width: 100%;
                margin: 16px 0;
              }
              th, td {
                border: 1px solid rgba(255, 255, 255, 0.2);
                padding: 8px 12px;
                text-align: left;
              }
              th {
                background: rgba(255, 255, 255, 0.05);
              }
              ul, ol {
                margin: 8px 0;
                padding-left: 24px;
              }
              li {
                margin: 4px 0;
              }
              blockquote {
                border-left: 4px solid #D6BCFA;
                padding-left: 16px;
                margin-left: 0;
                margin-right: 0;
                font-style: italic;
                color: rgba(241, 240, 251, 0.8);
              }
              hr {
                border: none;
                height: 1px;
                background: rgba(255, 255, 255, 0.1);
                margin: 24px 0;
              }
              input[type="checkbox"] {
                margin-right: 8px;
              }
            </style>
          </head>
          <body>
            ${contentHtml}
          </body>
        </html>
      `);
    }
  }, [contentHtml, isWebContent]);
  
  // Get the device dimensions based on the active device
  const getDeviceClass = () => {
    switch (activeDevice) {
      case 'desktop':
        return 'w-full max-w-4xl h-[600px]';
      case 'tablet':
        return 'w-[768px] h-[500px]';
      case 'mobile':
        return 'w-[320px] h-[568px]';
      default:
        return 'w-full';
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  return (
    <div className="bg-secondary/60 rounded-lg p-4 flex flex-col items-center">
      <div className="flex w-full justify-between items-center mb-4">
        <Tabs value={activeDevice} onValueChange={(value) => setActiveDevice(value as 'desktop' | 'tablet' | 'mobile')}>
          <TabsList>
            <TabsTrigger value="desktop" className="flex items-center gap-2">
              <Laptop size={16} />
              <span className="hidden sm:inline">Desktop</span>
            </TabsTrigger>
            <TabsTrigger value="tablet" className="flex items-center gap-2">
              <Tablet size={16} />
              <span className="hidden sm:inline">Tablet</span>
            </TabsTrigger>
            <TabsTrigger value="mobile" className="flex items-center gap-2">
              <Smartphone size={16} />
              <span className="hidden sm:inline">Mobile</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {isWebContent && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            className="flex items-center gap-1"
          >
            <RefreshCw size={14} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        )}
      </div>
      
      <div className={`border rounded-md overflow-hidden transition-all ${getDeviceClass()}`}>
        <div className="h-full overflow-auto">
          <iframe
            key={refreshKey}
            title="Content Preview"
            srcDoc={parsedContent}
            className="w-full h-full border-0"
            sandbox={isWebContent ? "allow-scripts allow-same-origin" : "allow-same-origin"}
          />
        </div>
      </div>
    </div>
  );
};

export default DevicePreview;
