
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

const BlogCard: React.FC<BlogCardProps> = ({ title, date, readTime, imageUrl, onClick }) => {
  const { isMobile } = useDeviceType();
  
  return (
    <Card 
      onClick={onClick} 
      className="chapter-card cursor-pointer hover:border-eduAccent/50 overflow-hidden"
    >
      {imageUrl ? (
        <div className="w-full h-28 md:h-32 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>
      ) : (
        <div className="w-full h-28 md:h-32 bg-secondary/40 flex items-center justify-center">
          <ImageIcon className="text-muted-foreground" size={isMobile ? 24 : 32} />
        </div>
      )}
      <CardHeader className="py-2 px-4 md:pb-2 md:px-6">
        <CardTitle className="text-lg md:text-xl font-medium text-eduLight line-clamp-2">{title}</CardTitle>
      </CardHeader>
      <CardContent className="py-2 px-4 md:px-6">
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
