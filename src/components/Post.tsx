import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Repeat2, Share, MoreVertical, Music } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAudio } from '@/context/AudioContext';
import BeatGrid from './BeatGrid';
import { formatDistanceToNow } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import Comment from './Comment';

interface PostProps {
  id: string;
  authorName: string;
  timestamp: Date;
  grid: any[][];
  likes: number;
  hasLiked: boolean;
  comments: any[];
  onLike: () => void;
  onComment: (text: string) => void;
  onRemix: () => void;
  originalPostId?: string;
  originalAuthorName?: string;
}

const Post: React.FC<PostProps> = ({
  id,
  authorName,
  timestamp,
  grid,
  likes,
  hasLiked,
  comments,
  onLike,
  onComment,
  onRemix,
  originalPostId,
  originalAuthorName,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onComment(newComment);
      setNewComment('');
    }
  };

  const initials = authorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <Card className="w-full mb-6 overflow-hidden transition-all duration-300 hover:shadow-md animate-slide-up">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 border">
              <AvatarFallback className="bg-muted">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{authorName}</div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(timestamp, { addSuffix: true })}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
        {originalPostId && (
          <div className="text-xs text-muted-foreground mt-2 flex items-center">
            <Repeat2 className="h-3 w-3 mr-1" />
            Remixed from <Link to={`/post/${originalPostId}`} className="text-primary ml-1 font-medium">{originalAuthorName}</Link>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <BeatGrid initialGrid={grid} readOnly={true} />
      </CardContent>
      <CardFooter className="flex-col space-y-3 pt-1 px-4 pb-4">
        <div className="flex justify-between items-center w-full">
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`rounded-full ${hasLiked ? 'text-red-500' : ''}`}
              onClick={onLike}
            >
              <Heart className={`h-5 w-5 ${hasLiked ? 'fill-current' : ''}`} />
            </Button>
            <DialogTrigger asChild onClick={() => setShowComments(true)}>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MessageCircle className="h-5 w-5" />
              </Button>
            </DialogTrigger>
          </div>
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={onRemix}
            >
              <Repeat2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Share className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col w-full">
          <div className="text-sm">
            <span className="font-medium">{likes} {likes === 1 ? 'like' : 'likes'}</span>
          </div>
          {comments.length > 0 && (
            <button 
              className="text-sm text-muted-foreground text-left mt-1"
              onClick={() => setShowComments(true)}
            >
              View all {comments.length} comments
            </button>
          )}
        </div>
      </CardFooter>

      <Dialog open={showComments} onOpenChange={setShowComments}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
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
          <form onSubmit={handleSubmitComment} className="flex items-center mt-3">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-background border border-input rounded-l-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Button 
              type="submit" 
              variant="default" 
              className="rounded-l-none"
              disabled={!newComment.trim()}
            >
              Post
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default Post;
