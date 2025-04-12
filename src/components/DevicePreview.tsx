
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Laptop, Smartphone, Tablet } from 'lucide-react';

interface DevicePreviewProps {
  contentHtml: string;
}

const DevicePreview: React.FC<DevicePreviewProps> = ({ contentHtml }) => {
  const [activeDevice, setActiveDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
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
  
  return (
    <div className="bg-secondary/60 rounded-lg p-4 flex flex-col items-center">
      <Tabs value={activeDevice} onValueChange={(value) => setActiveDevice(value as 'desktop' | 'tablet' | 'mobile')}>
        <TabsList className="mb-4">
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
      
      <div className={`border bg-white rounded-md overflow-hidden transition-all ${getDeviceClass()}`}>
        <div className="h-full overflow-auto">
          <iframe
            title="Content Preview"
            srcDoc={`
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
                    }
                    img {
                      max-width: 100%;
                      height: auto;
                    }
                    pre {
                      background: #f4f4f4;
                      padding: 10px;
                      border-radius: 4px;
                      overflow-x: auto;
                    }
                    h1, h2, h3, h4, h5, h6 {
                      margin-top: 1.5em;
                      margin-bottom: 0.5em;
                    }
                    table {
                      border-collapse: collapse;
                      width: 100%;
                    }
                    th, td {
                      border: 1px solid #ddd;
                      padding: 8px;
                    }
                    blockquote {
                      border-left: 4px solid #ddd;
                      padding-left: 16px;
                      margin-left: 0;
                      font-style: italic;
                    }
                  </style>
                </head>
                <body>
                  ${contentHtml}
                </body>
              </html>
            `}
            className="w-full h-full border-0"
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
};

export default DevicePreview;
