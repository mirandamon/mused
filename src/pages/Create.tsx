
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import BeatGrid from '@/components/BeatGrid';
import { useAudio } from '@/context/AudioContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wand2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { motion } from "framer-motion";

const Create = () => {
  const navigate = useNavigate();
  const { addPost, initializeAudio } = useAudio();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showCta, setShowCta] = useState(true);
  
  useEffect(() => {
    // Initialize audio when component loads
    const init = async () => {
      try {
        await initializeAudio();
        setIsInitialized(true);
        console.log("Audio initialization successful");
      } catch (error) {
        console.error('Failed to initialize audio:', error);
        setInitError('Failed to initialize audio. Please try again.');
        toast.error('Failed to initialize audio. Please try again.');
      }
    };
    
    init();

    // Hide CTA after scrolling
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setShowCta(false);
      } else {
        setShowCta(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [initializeAudio]);

  const handleSave = (grid: any[][]) => {
    setIsSubmitting(true);
    
    // Create a new post with the saved grid and metadata
    const createdAt = new Date();
    const newPost = {
      id: uuidv4(),
      authorId: 'user1', // Current user ID
      authorName: 'Alex', // Current user name
      grid,
      createdAt,
      timestamp: createdAt, // Make sure timestamp is included
      likes: 0,
      hasLiked: false,
      comments: [],
    };
    
    // Simulate network request
    setTimeout(() => {
      addPost(newPost);
      setIsSubmitting(false);
      toast.success('Beat published successfully!');
      navigate('/feed');
    }, 800);
  };

  return (
    <Layout>
      <div className="relative">
        <motion.div 
          className="flex items-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-2 rounded-full hover:bg-secondary/80"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Create Beat</h1>
        </motion.div>
        
        <motion.div 
          className="flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {initError ? (
            <motion.div 
              className="p-6 bg-card rounded-xl border shadow-sm text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-destructive mb-4">{initError}</p>
              <Button 
                onClick={() => window.location.reload()}
                variant="default"
                className="bg-primary hover:bg-primary/90"
              >
                Retry
              </Button>
            </motion.div>
          ) : (
            <div className="relative">
              {showCta && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="absolute -top-2 left-4 z-10"
                >
                  <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs shadow-sm border border-primary/20 flex items-center gap-1">
                    <Wand2 className="h-3 w-3" />
                    <span>Tap pads to activate sounds</span>
                  </div>
                </motion.div>
              )}
              <BeatGrid onSave={handleSave} isInitialized={isInitialized} />
            </div>
          )}
          
          <motion.div 
            className="text-center text-sm text-muted-foreground mt-6 grid gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <p className="bg-secondary/50 p-2 rounded-lg">Tap a pad to toggle it on/off</p>
            <p className="bg-secondary/50 p-2 rounded-lg">Long press a pad to change its sound</p>
            <p className="bg-secondary/50 p-2 rounded-lg">Use settings to expand your beat grid</p>
          </motion.div>
          
          {isSubmitting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50"
            >
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-primary/30 border-t-primary animate-rotate-beat" />
              </div>
              <p className="mt-4 text-muted-foreground">Publishing beat...</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default Create;
