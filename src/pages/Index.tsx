
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { PlusSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import BrandIcon from '@/components/BrandIcon';

const Index = () => {
  const navigate = useNavigate();

  return (
    <Layout className="relative overflow-hidden min-h-screen">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10 bg-shimmer" />
      
      {/* Floating Blobs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 1.5 }}
        className="absolute -z-5 inset-0 overflow-hidden"
      >
        <motion.div 
          className="blob absolute top-1/4 -left-[10%] w-[40%] aspect-square bg-blue-500/30"
          animate={{ 
            y: [0, 30, 0],
            x: [0, 15, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="blob absolute top-[10%] right-[5%] w-[25%] aspect-square bg-purple-500/30"
          animate={{ 
            y: [0, -20, 0],
            x: [0, -10, 0],
            scale: [1, 1.03, 1]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="blob absolute bottom-[10%] right-[10%] w-[30%] aspect-square bg-pink-500/20"
          animate={{ 
            y: [0, -15, 0],
            x: [0, -5, 0],
            scale: [1, 1.04, 1]
          }}
          transition={{ 
            duration: 18,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] p-8 text-center"
      >
        {/* Brand Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <BrandIcon size={120} />
        </motion.div>
        
        {/* Heading */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-6xl md:text-7xl font-bold tracking-tight text-slate-800"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-700">
            Mused
          </span>
        </motion.h1>
        
        {/* Tagline */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-xl md:text-2xl text-slate-700 max-w-md mx-auto mt-6 leading-relaxed"
        >
          Create, share, and remix beat patterns
        </motion.p>
        
        {/* Beat Visualization */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 1 }}
          className="my-12 flex items-center justify-center gap-2"
        >
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <motion.div
              key={i}
              className="w-1 md:w-1.5 bg-slate-500/50 rounded-full"
              animate={{ 
                height: i % 2 === 0 
                  ? [15, 35, 15] 
                  : [25, 15, 25],
                opacity: [0.4, 0.9, 0.4]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                delay: i * 0.1,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
        
        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 mt-6 w-full max-w-md mx-auto"
        >
          <Button 
            onClick={() => navigate('/create')}
            className="flex-1 h-12 rounded-full bg-white hover:bg-white/90 text-slate-800 transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
            size="lg"
          >
            <PlusSquare className="mr-2 h-5 w-5" />
            Create Beat
          </Button>
          
          <Button 
            onClick={() => navigate('/feed')}
            variant="outline"
            className="flex-1 h-12 rounded-full border-white text-slate-700 hover:bg-white/10 transform transition-all duration-300 hover:scale-105"
            size="lg"
          >
            Explore Beats
          </Button>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Index;
