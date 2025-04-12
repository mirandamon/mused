
import React from 'react';
import { motion } from 'framer-motion';

interface PostVisualizerProps {
  visualizerValues: number[];
  gridRows: number;
}

const PostVisualizer: React.FC<PostVisualizerProps> = ({
  visualizerValues,
  gridRows
}) => {
  return (
    <div className="absolute inset-0 z-0">
      <motion.div 
        className="absolute top-1/4 -left-[10%] w-[40%] aspect-square bg-blue-500/20 rounded-full filter blur-[80px]"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ 
          repeat: Infinity,
          duration: 8,
          ease: "easeInOut"
        }}
      />
      
      <motion.div 
        className="absolute bottom-1/4 -right-[5%] w-[30%] aspect-square bg-purple-500/20 rounded-full filter blur-[80px]"
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ 
          repeat: Infinity,
          duration: 6,
          ease: "easeInOut",
          delay: 1
        }}
      />
    
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div className="relative w-full max-w-2xl flex justify-center">
          <div className="absolute -bottom-32 left-0 right-0 flex items-end justify-center gap-1 h-20">
            {visualizerValues.map((value, index) => (
              <motion.div
                key={`viz-bottom-${index}`}
                className="w-2 bg-gradient-to-t from-blue-500/80 to-purple-500/80 rounded-t-full"
                style={{ height: `${value}px` }}
                animate={{ height: `${value}px` }}
                transition={{ duration: 0.2 }}
              />
            ))}
          </div>
          
          <div className="absolute -top-32 left-0 right-0 flex items-start justify-center gap-1 h-20">
            {visualizerValues.reverse().map((value, index) => (
              <motion.div
                key={`viz-top-${index}`}
                className="w-2 bg-gradient-to-b from-pink-500/80 to-purple-500/80 rounded-b-full"
                style={{ height: `${value * 0.7}px` }}
                animate={{ height: `${value * 0.7}px` }}
                transition={{ duration: 0.2 }}
              />
            ))}
          </div>
          
          {gridRows <= 6 && (
            <>
              <div className="absolute -left-32 top-0 bottom-0 flex items-center justify-center gap-1 w-20 h-full flex-col">
                {visualizerValues.slice(0, 8).map((value, index) => (
                  <motion.div
                    key={`viz-left-${index}`}
                    className="h-2 bg-gradient-to-r from-blue-500/80 to-purple-500/80 rounded-l-full"
                    style={{ width: `${value * 1.5}px` }}
                    animate={{ width: `${value * 1.5}px` }}
                    transition={{ duration: 0.3 }}
                  />
                ))}
              </div>
              
              <div className="absolute -right-32 top-0 bottom-0 flex items-center justify-center gap-1 w-20 h-full flex-col">
                {visualizerValues.slice(0, 8).reverse().map((value, index) => (
                  <motion.div
                    key={`viz-right-${index}`}
                    className="h-2 bg-gradient-to-l from-pink-500/80 to-purple-500/80 rounded-r-full"
                    style={{ width: `${value * 1.5}px` }}
                    animate={{ width: `${value * 1.5}px` }}
                    transition={{ duration: 0.3 }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostVisualizer;
