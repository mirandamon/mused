
import React from 'react';
import FullScreenBeatPost from './FullScreenBeatPost';
import FeedBeatPost from './FeedBeatPost';

interface PostProps {
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
  fullScreen?: boolean;
}

const BeatPost: React.FC<PostProps> = ({
  post,
  onLike,
  onComment,
  onRemix,
  fullScreen = false
}) => {
  return fullScreen ? (
    <FullScreenBeatPost 
      post={post}
      onLike={onLike}
      onComment={onComment}
      onRemix={onRemix}
    />
  ) : (
    <FeedBeatPost
      post={post}
      onLike={onLike}
      onComment={onComment}
      onRemix={onRemix}
    />
  );
};

export default BeatPost;
