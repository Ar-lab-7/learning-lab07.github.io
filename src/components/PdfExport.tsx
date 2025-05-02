
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { marked } from 'marked';
import { toast } from 'sonner';

interface PdfExportProps {
  content: string;
  title?: string;
  fileName?: string;
  isWebContent?: boolean;
}

const PdfExport: React.FC<PdfExportProps> = ({ 
  content, 
  title = 'Document', 
  fileName = 'document.pdf',
  isWebContent = false
}) => {
  const generatePdf = async () => {
    try {
      const pdf = new jsPDF();
      
      // Set black background color for the entire page
      pdf.setFillColor(0, 0, 0);
      pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), 'F');
      
      // Set text color to high contrast
      pdf.setTextColor(255, 255, 255); // White text for high contrast
      
      // Add title
      pdf.setFontSize(24);
      const titleWidth = pdf.getStringUnitWidth(title) * 24 / pdf.internal.scaleFactor;
      const titleX = (pdf.internal.pageSize.getWidth() - titleWidth) / 2;
      pdf.text(title, titleX, 20);
      
      // Add horizontal line
      pdf.setDrawColor(100, 100, 255); // Light blue line for contrast
      pdf.setLineWidth(0.5);
      pdf.line(20, 25, pdf.internal.pageSize.getWidth() - 20, 25);
      
      // Process content
      pdf.setFontSize(12);
      
      let processedContent = '';
      if (isWebContent) {
        // For HTML content, extract just the text for now
        const strippedHtml = content.replace(/<[^>]+>/g, '\n');
        processedContent = strippedHtml;
      } else {
        // For markdown, convert to plain text
        const html = marked.parse(content);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html as string; // Fix: Cast to string explicitly
        processedContent = tempDiv.textContent || tempDiv.innerText || '';
      }
      
      // Split by lines and add to PDF
      const lines = processedContent.split('\n');
      let y = 40;
      const lineHeight = 7;
      
      // Set text color for content to high visibility
      pdf.setTextColor(0, 255, 255); // Cyan for high contrast 
      
      lines.forEach((line) => {
        if (line.trim() === '') {
          y += lineHeight / 2;
          return;
        }
        
        // Check if starting a new section (likely a heading)
        if (line.startsWith('#') || line.startsWith('HEADING')) {
          pdf.setFontSize(16);
          pdf.setTextColor(255, 255, 0); // Yellow for headings
          line = line.replace(/^#+\s/, ''); // Remove markdown heading symbols
        } else {
          pdf.setFontSize(12);
          pdf.setTextColor(0, 255, 255); // Back to cyan for normal text
        }
        
        // Check if we need a new page
        if (y > pdf.internal.pageSize.getHeight() - 20) {
          pdf.addPage();
          pdf.setFillColor(0, 0, 0);
          pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), 'F');
          y = 20;
        }
        
        // Add text with text wrapping
        const textLines = pdf.splitTextToSize(line, pdf.internal.pageSize.getWidth() - 40);
        pdf.text(textLines, 20, y);
        y += lineHeight * textLines.length;
      });
      
      // Save the PDF
      pdf.save(fileName);
      toast.success(`PDF exported as ${fileName}`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <Button onClick={generatePdf} variant="secondary" size="sm">
      <FileDown className="mr-2" size={16} />
      Export PDF
    </Button>
  );
};

export default PdfExport;
