
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, ClockIcon } from "lucide-react";

interface BlogCardProps {
  title: string;
  date: string;
  readTime: string;
  onClick: () => void;
}

const BlogCard: React.FC<BlogCardProps> = ({ title, date, readTime, onClick }) => {
  return (
    <Card 
      onClick={onClick} 
      className="chapter-card cursor-pointer hover:border-eduAccent/50"
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-medium text-eduLight">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-muted-foreground gap-4">
          <div className="flex items-center gap-1">
            <CalendarIcon size={14} />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-1">
            <ClockIcon size={14} />
            <span>{readTime}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogCard;
