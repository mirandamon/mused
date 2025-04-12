
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import BeatGrid from './BeatGrid';
import { useAudio } from '@/context/AudioContext';
import { Heart, MessageCircle, Share, Repeat2, X } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import PostVisualizer from './PostVisualizer';
import PostCommentSection from './PostCommentSection';

interface FullScreenBeatPostProps {
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

const FullScreenBeatPost: React.FC<FullScreenBeatPostProps> = ({
  post,
  onLike,
  onComment,
  onRemix
}) => {
  const { startSequence, stopSequence, isPlaying } = useAudio();
  const [autoPlaying, setAutoPlaying] = useState(false);
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [visualizerValues, setVisualizerValues] = useState<number[]>(Array(16).fill(0).map(() => Math.random() * 30 + 10));
  const visualizerRef = useRef<number[]>(Array(16).fill(0).map(() => Math.random() * 30 + 10));
  const animationFrameRef = useRef<number | null>(null);
  
  useEffect(() => {
    // Start the sequence when the component mounts
    if (post && post.grid) {
      startSequence(post.grid);
      setAutoPlaying(true);
      
      initVisualizer();
    }
    
    return () => {
      // Stop the sequence when the component unmounts
      stopSequence();
      setAutoPlaying(false);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [post, startSequence, stopSequence]);
  
  const initVisualizer = () => {
    const values = Array(16).fill(0).map(() => Math.random() * 30 + 10);
    visualizerRef.current = values;
    setVisualizerValues(values);
    
    const updateVisualizer = () => {
      if (!visualizerRef.current) return;
      
      const newValues = visualizerRef.current.map(v => {
        const changeAmount = (Math.random() * 15) - 5;
        let newVal = v + changeAmount;
        
        if (newVal < 5) newVal = 5;
        if (newVal > 60) newVal = 60;
        
        return newVal;
      });
      
      visualizerRef.current = newValues;
      setVisualizerValues(newValues);
      
      animationFrameRef.current = requestAnimationFrame(updateVisualizer);
    };
    
    animationFrameRef.current = requestAnimationFrame(updateVisualizer);
  };
  
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim() && onComment) {
      onComment(comment);
      setComment('');
    }
  };
  
  const gridRows = post?.grid?.length || 4;
  
  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-black to-slate-900">
      <PostVisualizer visualizerValues={visualizerValues} gridRows={gridRows} />
      
      <div className="z-10 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-xl blur-xl opacity-70" />
          <div className="relative bg-black/50 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-xl">
            <BeatGrid 
              initialGrid={post.grid}
              readOnly={true}
            />
          </div>
        </motion.div>
      </div>
      
      <div className="absolute bottom-8 left-8 right-8 z-20 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="border-2 border-white">
            <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-white">{post.authorName}</p>
            <p className="text-xs text-white/70">
              {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
            </p>
            
            {post.originalPostId && (
              <div className="text-xs text-white/70 flex items-center mt-1">
                <Repeat2 className="h-3 w-3 mr-1" />
                <span>Remixed from {post.originalAuthorName}</span>
              </div>
            )}
          </div>
        </div>
      
        <div className="flex flex-col items-center space-y-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onLike} 
            className="rounded-full bg-black/40 backdrop-blur-sm w-12 h-12 flex flex-col items-center justify-center"
          >
            <Heart className={`h-6 w-6 ${post.hasLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
            <span className="text-xs text-white mt-1">{post.likes}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowComments(true)}
            className="rounded-full bg-black/40 backdrop-blur-sm w-12 h-12 flex flex-col items-center justify-center"
          >
            <MessageCircle className="h-6 w-6 text-white" />
            <span className="text-xs text-white mt-1">{post.comments.length}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onRemix}
            className="rounded-full bg-black/40 backdrop-blur-sm w-12 h-12 flex flex-col items-center justify-center"
          >
            <Repeat2 className="h-6 w-6 text-white" />
            <span className="text-xs text-white mt-1">Remix</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full bg-black/40 backdrop-blur-sm w-12 h-12"
          >
            <Share className="h-6 w-6 text-white" />
          </Button>
        </div>
      </div>
      
      <Dialog open={showComments} onOpenChange={setShowComments}>
        <DialogContent className="sm:max-w-md border-none bg-card/95 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Comments</span>
            </DialogTitle>
          </DialogHeader>
          
          <PostCommentSection 
            comments={post.comments}
            comment={comment}
            setComment={setComment}
            handleCommentSubmit={handleCommentSubmit}
            darkMode={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FullScreenBeatPost;
