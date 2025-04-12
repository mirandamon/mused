
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import BeatGrid from '@/components/BeatGrid';
import { useAudio } from '@/context/AudioContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const Remix = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { getPostById, addPost } = useAudio();
  const [originalPost, setOriginalPost] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (postId) {
      const post = getPostById(postId);
      if (post) {
        setOriginalPost(post);
      } else {
        setNotFound(true);
      }
    }
  }, [postId, getPostById]);

  const handleSave = (grid: any[][]) => {
    if (!originalPost) return;
    
    setIsSubmitting(true);
    
    // Create a new remixed post
    const createdAt = new Date();
    const remixedPost = {
      id: uuidv4(),
      authorId: 'user1', // Current user ID
      authorName: 'Alex', // Current user name
      grid,
      createdAt,
      timestamp: createdAt, // Make sure timestamp is included
      likes: 0,
      hasLiked: false,
      comments: [],
      originalPostId: originalPost.id,
      originalAuthorName: originalPost.authorName,
    };
    
    // Simulate network request
    setTimeout(() => {
      addPost(remixedPost);
      setIsSubmitting(false);
      navigate('/feed');
    }, 800);
  };

  if (notFound) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Beat Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The beat you're trying to remix couldn't be found.
            </p>
            <Button onClick={() => navigate('/feed')}>Go to Feed</Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!originalPost) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-primary/30 border-t-primary animate-rotate-beat" />
          </div>
          <p className="mt-4 text-muted-foreground">Loading beat to remix...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Remix Beat</h1>
      </div>
      
      <div className="rounded-lg bg-secondary/50 border p-3 mb-6 flex items-center text-sm">
        <Info className="h-4 w-4 mr-2 flex-shrink-0" />
        <p>
          You're remixing a beat by{' '}
          <span className="font-medium">{originalPost.authorName}</span>. Make it your own!
        </p>
      </div>
      
      <div className="flex flex-col">
        <BeatGrid initialGrid={originalPost.grid} onSave={handleSave} />
        
        <div className="text-center text-sm text-muted-foreground mt-6">
          <p>Modify the original beat by changing which pads are active</p>
          <p>Long press a pad to change its sound</p>
        </div>
        
        {isSubmitting && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-primary/30 border-t-primary animate-rotate-beat" />
            </div>
            <p className="mt-4 text-muted-foreground">Saving remixed beat...</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Remix;
