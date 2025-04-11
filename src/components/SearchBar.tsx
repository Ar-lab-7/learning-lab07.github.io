
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (term: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
        <Search size={18} />
      </div>
      <Input
        type="text"
        placeholder="Search chapters..."
        className="pl-10 pr-10 py-2 w-full bg-secondary/60 border-eduAccent/20 focus:border-eduAccent placeholder:text-muted-foreground"
        value={searchTerm}
        onChange={handleSearch}
      />
      {searchTerm && (
        <button
          onClick={clearSearch}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-eduLight"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
