
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
      
      <div className={`border rounded-md overflow-hidden transition-all ${getDeviceClass()}`}>
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
