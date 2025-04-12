
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Comment from './Comment';
import { MessageCircle } from 'lucide-react';

interface PostCommentSectionProps {
  comments: any[];
  comment: string;
  setComment: (comment: string) => void;
  handleCommentSubmit: (e: React.FormEvent) => void;
  darkMode?: boolean;
}

const PostCommentSection: React.FC<PostCommentSectionProps> = ({
  comments,
  comment,
  setComment,
  handleCommentSubmit,
  darkMode = false
}) => {
  return (
    <>
      <ScrollArea className="h-[300px] pr-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <Comment
              key={comment.id}
              authorName={comment.authorName}
              text={comment.text}
              timestamp={comment.timestamp}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <MessageCircle className="h-8 w-8 mb-2 opacity-50" />
            <p>No comments yet</p>
          </div>
        )}
      </ScrollArea>
      <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2 mt-3">
        <Input
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className={`flex-1 ${darkMode ? 'bg-background/50' : ''}`}
        />
        <Button 
          type="submit" 
          variant="default" 
          disabled={!comment.trim()}
        >
          Post
        </Button>
      </form>
    </>
  );
};

export default PostCommentSection;
