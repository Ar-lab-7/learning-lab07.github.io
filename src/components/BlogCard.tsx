
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, ClockIcon, ImageIcon } from "lucide-react";
import { useDeviceType } from '@/hooks/use-mobile';

interface BlogCardProps {
  title: string;
  date: string;
  readTime: string;
  imageUrl?: string;
  onClick: () => void;
}

/**
 * BlogCard component for displaying blog previews in a grid
 */
const BlogCard: React.FC<BlogCardProps> = ({ title, date, readTime, imageUrl, onClick }) => {
  const { isMobile } = useDeviceType();
  
  return (
    <Card 
      onClick={onClick} 
      className="chapter-card cursor-pointer overflow-hidden transition-all hover:scale-[1.02] duration-200"
    >
      <div className="relative w-full h-32 sm:h-36 md:h-40 overflow-hidden bg-secondary/40">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
            loading="lazy"
            onError={(e) => {
              // Fallback to placeholder on image error
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const fallback = document.createElement('div');
                fallback.className = 'w-full h-full flex items-center justify-center';
                fallback.innerHTML = `<div class="text-muted-foreground"><svg width="${isMobile ? 24 : 32}" height="${isMobile ? 24 : 32}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></div>`;
                parent.appendChild(fallback);
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="text-muted-foreground" size={isMobile ? 24 : 32} />
          </div>
        )}
      </div>
      
      <CardHeader className="py-2 px-3 sm:px-4 md:px-5">
        <CardTitle className="text-base sm:text-lg md:text-xl font-medium text-eduLight line-clamp-2">{title}</CardTitle>
      </CardHeader>
      
      <CardContent className="py-1 px-3 sm:px-4 md:px-5 pb-3">
        <div className="flex items-center text-xs md:text-sm text-muted-foreground gap-3 md:gap-4">
          <div className="flex items-center gap-1">
            <CalendarIcon size={isMobile ? 12 : 14} />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-1">
            <ClockIcon size={isMobile ? 12 : 14} />
            <span>{readTime}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogCard;
