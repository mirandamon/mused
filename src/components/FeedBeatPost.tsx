
import React, { useState } from 'react';
import { Heart, MessageCircle, Share, Repeat2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import BeatGrid from './BeatGrid';
import PostCommentSection from './PostCommentSection';

interface FeedBeatPostProps {
  post: {
    id: string;
    authorName: string;
    timestamp: Date;
    grid: any[][];
    likes: number;
    hasLiked: boolean;
    comments: any[];
    originalPostId?: string;
    originalAuthorName?: string;
  };
  onLike?: () => void;
  onComment?: (text: string) => void;
  onRemix?: () => void;
}

const FeedBeatPost: React.FC<FeedBeatPostProps> = ({
  post,
  onLike,
  onComment,
  onRemix
}) => {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim() && onComment) {
      onComment(comment);
      setComment('');
    }
  };

  return (
    <Card className="overflow-hidden modern-card">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{post.authorName}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
            </p>
          </div>
        </div>
        
        {post.originalPostId && (
          <div className="text-xs text-muted-foreground flex items-center">
            <Repeat2 className="h-3 w-3 mr-1" />
            <span>Remixed from {post.originalAuthorName}</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <BeatGrid 
          initialGrid={post.grid}
          readOnly={true}
        />
      </div>
      
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onLike} 
            className={`p-0 h-auto ${post.hasLiked ? 'text-red-500' : ''}`}
          >
            <Heart className={`h-5 w-5 mr-1 ${post.hasLiked ? 'fill-red-500' : ''}`} />
            <span>{post.likes}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowComments(true)}
            className="p-0 h-auto"
          >
            <MessageCircle className="h-5 w-5 mr-1" />
            <span>{post.comments.length}</span>
          </Button>
        </div>
        
        <div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onRemix}
            className="p-0 h-auto text-primary"
          >
            <Repeat2 className="h-5 w-5 mr-1" />
            <span>Remix</span>
          </Button>
        </div>
      </div>
      
      <Dialog open={showComments} onOpenChange={setShowComments}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          
          <PostCommentSection 
            comments={post.comments}
            comment={comment}
            setComment={setComment}
            handleCommentSubmit={handleCommentSubmit}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default FeedBeatPost;
