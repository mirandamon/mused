
import React from 'react';
import { motion } from 'framer-motion';

interface BrandIconProps {
  size?: number;
  className?: string;
}

const BrandIcon: React.FC<BrandIconProps> = ({ size = 48, className = '' }) => {
  const circleVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: (i: number) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        type: "spring",
        stiffness: 100
      }
    })
  };
  
  const waveVariants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: { 
      pathLength: 1, 
      opacity: 1,
      transition: {
        delay: 0.3,
        duration: 0.8,
        ease: "easeInOut"
      }
    }
  };
  
  return (
    <motion.div 
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{ 
        duration: 20,
        repeat: Infinity,
        ease: "linear",
        repeatType: "loop"
      }}
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center ${className}`}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 80 80" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Circular elements */}
        <motion.circle 
          cx="40" 
          cy="40" 
          r="30" 
          stroke="currentColor" 
          strokeOpacity="0.15" 
          strokeWidth="2"
          custom={0}
          variants={circleVariants}
          initial="initial"
          animate="animate"
          className="text-primary"
        />
        
        <motion.circle 
          cx="40" 
          cy="40" 
          r="24" 
          stroke="currentColor" 
          strokeOpacity="0.3" 
          strokeWidth="2"
          custom={1}
          variants={circleVariants}
          initial="initial"
          animate="animate"
          className="text-primary"
        />
        
        <motion.circle 
          cx="40" 
          cy="40" 
          r="18" 
          stroke="currentColor" 
          strokeOpacity="0.45" 
          strokeWidth="2"
          custom={2}
          variants={circleVariants}
          initial="initial"
          animate="animate"
          className="text-primary"
        />
        
        {/* Sound wave elements */}
        <motion.path
          d="M20,40 C25,20 30,10 40,10 C50,10 55,20 60,40 C55,60 50,70 40,70 C30,70 25,60 20,40 Z"
          variants={waveVariants}
          initial="initial"
          animate="animate"
          stroke="currentColor" 
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          className="text-primary"
        />
        
        {/* Center dot */}
        <motion.circle 
          cx="40" 
          cy="40" 
          r="5"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            delay: 0.6,
            duration: 0.5,
            type: "spring",
            stiffness: 200
          }}
          fill="currentColor"
          className="text-primary"
        />
      </svg>

      {/* Pulsing beats */}
      <motion.div 
        className="absolute inset-0 rounded-full"
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.7, 0.4]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        style={{ 
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0) 70%)'
        }}
      />
    </motion.div>
  );
};

export default BrandIcon;
