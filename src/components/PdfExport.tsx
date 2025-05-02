
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
      
      // Add styles with black background and high contrast text
      if (includeStyles) {
        tempDiv.style.fontFamily = 'Arial, sans-serif';
        tempDiv.style.padding = '40px';
        tempDiv.style.maxWidth = '800px';
        tempDiv.style.margin = '0 auto';
        tempDiv.style.backgroundColor = '#000000';
        tempDiv.style.color = '#FFFFFF';
      }
      
      // Add content to the div
      const titleElement = document.createElement('h1');
      titleElement.textContent = title;
      titleElement.style.marginBottom = '20px';
      titleElement.style.borderBottom = '1px solid #444';
      titleElement.style.paddingBottom = '10px';
      titleElement.style.color = '#FFFFFF';
      titleElement.style.fontSize = '24px';
      titleElement.style.fontWeight = 'bold';
      
      tempDiv.appendChild(titleElement);
      
      if (isWebContent) {
        // Handle web content (HTML, CSS, JS)
        try {
          const parser = new DOMParser();
          const contentDiv = document.createElement('div');
          
          // Set the HTML content directly
          contentDiv.innerHTML = content;
          
          // Apply high contrast styles to all text elements
          const textElements = contentDiv.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, li, td, th');
          textElements.forEach(el => {
            (el as HTMLElement).style.color = '#FFFFFF';
            (el as HTMLElement).style.opacity = '1';
          });
          
          tempDiv.appendChild(contentDiv);
        } catch (error) {
          console.error('Error parsing web content for PDF:', error);
          const errorElement = document.createElement('p');
          errorElement.textContent = 'Error generating PDF from web content.';
          errorElement.style.color = '#FF5555';
          tempDiv.appendChild(errorElement);
        }
      } else {
        // Convert markdown-like content to HTML with high contrast styling
        const contentElement = document.createElement('div');
        contentElement.innerHTML = renderContent(content);
        
        // Apply high contrast styles to all text elements
        const textElements = contentElement.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, li');
        textElements.forEach(el => {
          (el as HTMLElement).style.color = '#FFFFFF';
          (el as HTMLElement).style.opacity = '1';
        });
        
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
          backgroundColor: '#000000',
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
  
  // Function to render markdown-like content with high contrast styling
  const renderContent = (content: string) => {
    // Replace headings
    let html = content
      .replace(/^# (.*$)/gm, '<h1 style="font-size: 24px; font-weight: bold; margin-top: 20px; margin-bottom: 10px; color: #FFFFFF;">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 style="font-size: 20px; font-weight: bold; margin-top: 15px; margin-bottom: 10px; color: #FFFFFF;">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 style="font-size: 18px; font-weight: bold; margin-top: 10px; margin-bottom: 10px; color: #FFFFFF;">$1</h3>');
    
    // Replace bold and italic
    html = html
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #FFFFFF;">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em style="color: #FFFFFF;">$1</em>');
    
    // Replace lists
    html = html.replace(/^- (.*$)/gm, '<li style="margin-left: 20px; color: #FFFFFF;">$1</li>');
    html = html.replace(/<\/li>\n<li/g, '</li><li');
    html = html.replace(/(<li.*<\/li>)/gs, '<ul style="margin-top: 10px; margin-bottom: 10px; color: #FFFFFF;">$1</ul>');
    
    // Replace paragraphs
    html = html.replace(/^(?!<[a-z]).+/gm, '<p style="margin-bottom: 10px; color: #FFFFFF;">$&</p>');
    
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
