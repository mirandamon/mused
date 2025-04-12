
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import BeatPost from '@/components/BeatPost';
import { useAudio } from '@/context/AudioContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { motion } from "framer-motion";
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Interface for post data used in the feed
interface PostData {
  id: string;
  authorName: string;
  timestamp: Date;
  grid: any[][];
  likes: number;
  hasLiked: boolean;
  comments: any[];
  originalPostId?: string;
  originalAuthorName?: string;
}

// Sample posts for development/demo purposes
const samplePosts = [
  {
    id: "post1",
    authorName: "DJ Beats",
    timestamp: new Date(), 
    grid: [
      [
        { id: 'pad-0-0', position: { row: 0, col: 0 }, soundId: 'clap', active: false },
        { id: 'pad-0-1', position: { row: 0, col: 1 }, soundId: 'hihat', active: true },
        { id: 'pad-0-2', position: { row: 0, col: 2 }, soundId: 'kick', active: false },
        { id: 'pad-0-3', position: { row: 0, col: 3 }, soundId: 'openhihat', active: true }
      ],
      [
        { id: 'pad-1-0', position: { row: 1, col: 0 }, soundId: 'snare', active: false },
        { id: 'pad-1-1', position: { row: 1, col: 1 }, soundId: null, active: false },
        { id: 'pad-1-2', position: { row: 1, col: 2 }, soundId: null, active: false },
        { id: 'pad-1-3', position: { row: 1, col: 3 }, soundId: null, active: false }
      ],
      [
        { id: 'pad-2-0', position: { row: 2, col: 0 }, soundId: null, active: false },
        { id: 'pad-2-1', position: { row: 2, col: 1 }, soundId: null, active: false },
        { id: 'pad-2-2', position: { row: 2, col: 2 }, soundId: 'clap', active: true },
        { id: 'pad-2-3', position: { row: 2, col: 3 }, soundId: null, active: false }
      ],
      [
        { id: 'pad-3-0', position: { row: 3, col: 0 }, soundId: null, active: false },
        { id: 'pad-3-1', position: { row: 3, col: 1 }, soundId: null, active: false },
        { id: 'pad-3-2', position: { row: 3, col: 2 }, soundId: null, active: false },
        { id: 'pad-3-3', position: { row: 3, col: 3 }, soundId: 'kick', active: true }
      ]
    ],
    likes: 12,
    hasLiked: false,
    comments: [
      { id: 'comment1', authorName: 'Commenter1', text: 'Great beat!' },
      { id: 'comment2', authorName: 'Commenter2', text: 'Love the rhythm.' }
    ],
  },
  {
    id: "post2",
    authorName: "BeatMaker404",
    timestamp: new Date(),
    grid: [
      [
        { id: 'pad-0-0', position: { row: 0, col: 0 }, soundId: 'kick', active: true },
        { id: 'pad-0-1', position: { row: 0, col: 1 }, soundId: 'snare', active: false },
        { id: 'pad-0-2', position: { row: 0, col: 2 }, soundId: 'kick', active: true },
        { id: 'pad-0-3', position: { row: 0, col: 3 }, soundId: 'snare', active: false }
      ],
      [
        { id: 'pad-1-0', position: { row: 1, col: 0 }, soundId: 'hihat', active: true },
        { id: 'pad-1-1', position: { row: 1, col: 1 }, soundId: null, active: false },
        { id: 'pad-1-2', position: { row: 1, col: 2 }, soundId: 'hihat', active: true },
        { id: 'pad-1-3', position: { row: 1, col: 3 }, soundId: null, active: false }
      ],
      [
        { id: 'pad-2-0', position: { row: 2, col: 0 }, soundId: 'openhihat', active: false },
        { id: 'pad-2-1', position: { row: 2, col: 1 }, soundId: null, active: false },
        { id: 'pad-2-2', position: { row: 2, col: 2 }, soundId: 'clap', active: true },
        { id: 'pad-2-3', position: { row: 2, col: 3 }, soundId: null, active: false }
      ],
      [
        { id: 'pad-3-0', position: { row: 3, col: 0 }, soundId: null, active: false },
        { id: 'pad-3-1', position: { row: 3, col: 1 }, soundId: null, active: false },
        { id: 'pad-3-2', position: { row: 3, col: 2 }, soundId: 'kick', active: true },
        { id: 'pad-3-3', position: { row: 3, col: 3 }, soundId: null, active: false }
      ]
    ],
    likes: 8,
    hasLiked: true,
    comments: [],
  },
];

const Feed = () => {
  const { posts } = useAudio();
  const [allPosts, setAllPosts] = useState<PostData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, you would fetch posts from Supabase here
        // For now, we're using sample posts combined with any from context
        
        const combinedPosts = [...samplePosts, ...posts];
        
        // Sort posts by timestamp in descending order (most recent first)
        combinedPosts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        
        setAllPosts(combinedPosts);
      } catch (error) {
        console.error("Error loading posts:", error);
        toast.error("Failed to load posts");
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, [posts]);

  const handleLike = (postId: string) => {
    // Implement like functionality
    setAllPosts(prev => 
      prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likes: post.hasLiked ? post.likes - 1 : post.likes + 1,
            hasLiked: !post.hasLiked
          };
        }
        return post;
      })
    );
  };

  const handleComment = (postId: string, text: string) => {
    // Implement comment functionality
    const newComment = {
      id: `comment-${Date.now()}`,
      authorName: "Current User",
      text,
      timestamp: new Date()
    };
    
    setAllPosts(prev => 
      prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, newComment]
          };
        }
        return post;
      })
    );
  };

  const handleRemix = (postId: string) => {
    // Will navigate to remix page
    console.log(`Remixing post ${postId}`);
  };

  return (
    <Layout>
      <motion.div 
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold">Beat Feed</h1>
        <Button asChild>
          <Link to="/create" className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Create Beat
          </Link>
        </Button>
      </motion.div>
      
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-muted-foreground">Loading posts...</div>
          </div>
        ) : allPosts.length > 0 ? (
          allPosts.map((post) => (
            <BeatPost
              key={post.id}
              post={post}
              onLike={() => handleLike(post.id)}
              onComment={(text) => handleComment(post.id, text)}
              onRemix={() => handleRemix(post.id)}
            />
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No beats have been posted yet.</p>
            <p className="mt-2">Be the first to create one!</p>
          </div>
        )}
      </motion.div>
    </Layout>
  );
};

export default Feed;
