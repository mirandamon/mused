
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface CommentProps {
  authorName: string;
  text: string;
  timestamp: Date;
}

const Comment: React.FC<CommentProps> = ({ authorName, text, timestamp }) => {
  const initials = authorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="flex space-x-3 mb-4">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="bg-secondary p-3 rounded-lg">
          <div className="font-medium text-sm">{authorName}</div>
          <p className="text-sm mt-1">{text}</p>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
        </div>
      </div>
    </div>
  );
};

export default Comment;
