
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { toast } from 'sonner';

interface PdfExportProps {
  content: string;
  title: string;
  fileName?: string;
  includeStyles?: boolean;
  isWebContent?: boolean;
}

const PdfExport: React.FC<PdfExportProps> = ({ 
  content, 
  title, 
  fileName, 
  includeStyles = true,
  isWebContent = false
}) => {
  const generatePdf = async () => {
    try {
      // Dynamically import jsPDF and html2canvas only when needed
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);
      
      toast.loading('Generating PDF...');
      
      // Create a temporary div to render the content
      const tempDiv = document.createElement('div');
      tempDiv.className = 'pdf-export-container';
      
      // Add styles if includeStyles is true
      if (includeStyles) {
        tempDiv.style.fontFamily = 'Arial, sans-serif';
        tempDiv.style.padding = '20px';
        tempDiv.style.maxWidth = '800px';
        tempDiv.style.margin = '0 auto';
        tempDiv.style.backgroundColor = 'white';
        tempDiv.style.color = 'black';
      }
      
      // Add content to the div
      const titleElement = document.createElement('h1');
      titleElement.textContent = title;
      titleElement.style.marginBottom = '20px';
      titleElement.style.borderBottom = '1px solid #ccc';
      titleElement.style.paddingBottom = '10px';
      
      tempDiv.appendChild(titleElement);
      
      if (isWebContent) {
        // Handle web content (HTML, CSS, JS)
        try {
          const htmlMatch = content.match(/<html>([\s\S]*?)<\/html>/);
          const cssMatch = content.match(/<css>([\s\S]*?)<\/css>/);
          
          const htmlContent = htmlMatch ? htmlMatch[1] : '';
          const cssContent = cssMatch ? cssMatch[1] : '';
          
          // Create style element for CSS
          const styleElement = document.createElement('style');
          styleElement.textContent = cssContent;
          tempDiv.appendChild(styleElement);
          
          // Add HTML content
          const contentDiv = document.createElement('div');
          contentDiv.innerHTML = htmlContent;
          tempDiv.appendChild(contentDiv);
        } catch (error) {
          console.error('Error parsing web content for PDF:', error);
          const errorElement = document.createElement('p');
          errorElement.textContent = 'Error generating PDF from web content.';
          tempDiv.appendChild(errorElement);
        }
      } else {
        // Convert markdown-like content to HTML
        const contentElement = document.createElement('div');
        contentElement.innerHTML = renderContent(content);
        tempDiv.appendChild(contentElement);
      }
      
      // Temporarily add to document for rendering
      document.body.appendChild(tempDiv);
      
      try {
        // Get PDF dimensions
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
      
        // Render the content to canvas
        const canvas = await html2canvas(tempDiv, {
          scale: 2,
          backgroundColor: 'white',
          logging: false
        });
        
        // Calculate the number of pages
        const imgData = canvas.toDataURL('image/png');
        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = pdfWidth;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        
        let heightLeft = imgHeight;
        let position = 0;
        
        // Add first page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
        
        // Add subsequent pages if needed
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
        }
        
        // Save the PDF
        const safeName = fileName || `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`;
        pdf.save(safeName);
        
        toast.success('PDF downloaded successfully!');
      } catch (error) {
        console.error('Error rendering PDF:', error);
        toast.error('Failed to generate PDF: Rendering error');
      } finally {
        // Clean up
        document.body.removeChild(tempDiv);
        toast.dismiss();
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
      toast.dismiss();
    }
  };
  
  // Function to render markdown-like content
  const renderContent = (content: string) => {
    // Replace headings
    let html = content
      .replace(/^# (.*$)/gm, '<h1 style="font-size: 24px; font-weight: bold; margin-top: 20px; margin-bottom: 10px;">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 style="font-size: 20px; font-weight: bold; margin-top: 15px; margin-bottom: 10px;">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 style="font-size: 18px; font-weight: bold; margin-top: 10px; margin-bottom: 10px;">$1</h3>');
    
    // Replace bold and italic
    html = html
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Replace lists
    html = html.replace(/^- (.*$)/gm, '<li style="margin-left: 20px;">$1</li>');
    html = html.replace(/<\/li>\n<li/g, '</li><li');
    html = html.replace(/(<li.*<\/li>)/gs, '<ul style="margin-top: 10px; margin-bottom: 10px;">$1</ul>');
    
    // Replace paragraphs
    html = html.replace(/^(?!<[a-z]).+/gm, '<p style="margin-bottom: 10px;">$&</p>');
    
    // Fix any broken paragraphs
    html = html.replace(/<p><\/p>/g, '');
    
    return html;
  };

  return (
    <Button 
      onClick={generatePdf} 
      variant="outline" 
      size="sm" 
      className="gap-1"
    >
      <FileDown className="h-4 w-4 mr-1" />
      Export PDF
    </Button>
  );
};

export default PdfExport;
