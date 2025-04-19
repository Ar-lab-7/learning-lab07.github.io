
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Check, ArrowLeft, Table } from 'lucide-react';
import { toast } from 'sonner';

interface TableCreatorProps {
  onInsert: (tableMarkdown: string) => void;
  onBack: () => void;
}

const BlogEditorTable: React.FC<TableCreatorProps> = ({ onInsert, onBack }) => {
  const [rows, setRows] = useState<number>(3);
  const [columns, setColumns] = useState<number>(3);
  const [headers, setHeaders] = useState<string[]>(['Header 1', 'Header 2', 'Header 3']);
  const [cells, setCells] = useState<string[][]>([
    ['Cell 1', 'Cell 2', 'Cell 3'],
    ['Cell 4', 'Cell 5', 'Cell 6']
  ]);

  const handleRowsChange = (newRows: number) => {
    if (newRows < 1) return;
    if (newRows > cells.length) {
      // Add new rows
      const newCells = [...cells];
      for (let i = cells.length; i < newRows; i++) {
        newCells.push(Array(columns).fill(''));
      }
      setCells(newCells);
    } else {
      // Remove rows
      setCells(cells.slice(0, newRows));
    }
    setRows(newRows);
  };

  const handleColumnsChange = (newColumns: number) => {
    if (newColumns < 1) return;
    if (newColumns > columns) {
      // Add new columns
      const newHeaders = [...headers];
      for (let i = headers.length; i < newColumns; i++) {
        newHeaders.push(`Header ${i + 1}`);
      }
      setHeaders(newHeaders);

      const newCells = cells.map(row => {
        const newRow = [...row];
        for (let i = row.length; i < newColumns; i++) {
          newRow.push('');
        }
        return newRow;
      });
      setCells(newCells);
    } else {
      // Remove columns
      setHeaders(headers.slice(0, newColumns));
      setCells(cells.map(row => row.slice(0, newColumns)));
    }
    setColumns(newColumns);
  };

  const handleHeaderChange = (index: number, value: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = value;
    setHeaders(newHeaders);
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newCells = [...cells];
    newCells[rowIndex][colIndex] = value;
    setCells(newCells);
  };

  const generateTableMarkdown = () => {
    if (headers.length === 0 || cells.length === 0) {
      toast.error('Table must have at least one row and column');
      return;
    }

    let markdown = '\n';
    
    // Generate headers
    markdown += '| ' + headers.join(' | ') + ' |\n';
    
    // Generate separator
    markdown += '| ' + headers.map(() => '--------').join(' | ') + ' |\n';
    
    // Generate rows
    cells.forEach(row => {
      markdown += '| ' + row.join(' | ') + ' |\n';
    });

    onInsert(markdown);
  };

  return (
    <div className="p-4 bg-background border rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-1">
          <ArrowLeft size={16} />
          <span>Back</span>
        </Button>
        <h3 className="text-xl font-medium">Table Creator</h3>
        <Button onClick={generateTableMarkdown} className="flex items-center gap-1">
          <Check size={16} />
          <span>Insert Table</span>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Rows</label>
          <Input 
            type="number" 
            min="1"
            value={rows} 
            onChange={(e) => handleRowsChange(parseInt(e.target.value) || 1)} 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Columns</label>
          <Input 
            type="number" 
            min="1"
            value={columns} 
            onChange={(e) => handleColumnsChange(parseInt(e.target.value) || 1)} 
          />
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2">Headers</h4>
        <div className="flex flex-wrap gap-2">
          {headers.map((header, index) => (
            <Input
              key={`header-${index}`}
              className="w-full sm:w-auto flex-grow"
              value={header}
              onChange={(e) => handleHeaderChange(index, e.target.value)}
              placeholder={`Header ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <h4 className="text-sm font-medium mb-2">Cell Content</h4>
        <table className="min-w-full border">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={`col-${index}`} className="border p-2 text-left text-sm">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cells.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`}>
                {row.map((cell, colIndex) => (
                  <td key={`cell-${rowIndex}-${colIndex}`} className="border p-1">
                    <Input
                      value={cell}
                      onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                      placeholder={`Cell (${rowIndex+1},${colIndex+1})`}
                      className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BlogEditorTable;
