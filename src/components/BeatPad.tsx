
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAudio } from '@/context/AudioContext';

interface BeatPadProps {
  id: string;
  row: number;
  col: number;
  isActive: boolean;
  soundId: string | null;
  currentBeat: number;
  isPlaying: boolean;
  onToggle: () => void;
  onSelectSound: () => void;
}

const BeatPad: React.FC<BeatPadProps> = ({
  id,
  row,
  col,
  isActive,
  soundId,
  currentBeat,
  isPlaying,
  onToggle,
  onSelectSound,
}) => {
  const { playSound, sounds } = useAudio();
  const [isPressed, setIsPressed] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [ripples, setRipples] = useState<{x: number, y: number, id: number}[]>([]);
  const [isEntering, setIsEntering] = useState(true);
  const longPressTimer = useRef<number | null>(null);
  const padRef = useRef<HTMLDivElement>(null);
  const wasActive = useRef<boolean>(isActive);
  const rippleIdRef = useRef(0);

  const soundName = soundId 
    ? sounds.find(s => s.id === soundId)?.name || 'Sound'
    : null;

  // Play sound and animate when this pad is the current beat and active
  useEffect(() => {
    if (isPlaying && col === currentBeat && isActive && soundId) {
      console.log(`BeatPad ${row},${col} is active and current, playing sound ${soundId}`);
      playSound(soundId);
      setHasAnimated(true);
      setTimeout(() => setHasAnimated(false), 200);
    }
  }, [isPlaying, col, currentBeat, isActive, soundId, playSound, row]);
  
  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsEntering(false);
    }, (row * 4 + col) * 50 + 300); // Stagger the animations
    
    return () => clearTimeout(timer);
  }, [row, col]);
  
  // Track active state changes during playback
  useEffect(() => {
    wasActive.current = isActive;
  }, [isActive]);

  const addRipple = (x: number, y: number) => {
    const newRipple = {
      x,
      y,
      id: rippleIdRef.current
    };
    
    rippleIdRef.current += 1;
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 800); // Match the animation duration
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsPressed(true);
    
    // Create ripple effect
    if (padRef.current) {
      const rect = padRef.current.getBoundingClientRect();
      let x, y;
      
      if ('touches' in e) {
        // Touch event
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
      } else {
        // Mouse event
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
      }
      
      addRipple(x, y);
    }
    
    longPressTimer.current = window.setTimeout(() => {
      onSelectSound();
      longPressTimer.current = null;
    }, 500);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
    if (longPressTimer.current !== null) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
      onToggle();
      
      // Play sound only when toggling on (not when toggling off)
      if (!isActive && soundId) {
        playSound(soundId);
      }
    }
  };

  const handleMouseLeave = () => {
    setIsPressed(false);
    if (longPressTimer.current !== null) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (longPressTimer.current !== null) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  return (
    <div
      ref={padRef}
      style={{
        '--index': row * 4 + col, // For staggered animations
      } as React.CSSProperties}
      className={cn(
        "beat-pad relative flex items-center justify-center rounded-xl text-xs font-medium overflow-hidden",
        "h-16 w-16 select-none cursor-pointer transition-all duration-200",
        "border shadow-sm backdrop-blur-sm",
        isEntering ? "grid-item-enter" : "",
        isActive && soundId
          ? "border-primary/30 bg-primary/10 text-primary shadow-md" 
          : "border-border bg-card/80 text-muted-foreground hover:bg-card/90",
        hasAnimated && "animate-pop",
        col === currentBeat && isPlaying && "ring-2 ring-primary/50",
        isPressed && "scale-95",
        "ripple-container"
      )}
      onMouseDown={handleMouseDown as any}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseDown as any}
      onTouchEnd={handleMouseUp}
      onContextMenu={(e) => {
        e.preventDefault();
        onSelectSound();
      }}
      data-row={row}
      data-col={col}
      data-sound-id={soundId}
      data-active={isActive}
    >
      {soundName && isActive && (
        <span className={cn(
          "absolute top-1 left-1 text-[10px] px-1 py-0.5 rounded-full max-w-[90%] truncate",
          "bg-primary/20 text-primary ring-1 ring-primary/30"
        )}>
          {soundName}
        </span>
      )}
      
      {isActive && soundId && (
        <div 
          className={cn(
            "absolute inset-0 rounded-xl overflow-hidden",
            hasAnimated ? "opacity-60" : "opacity-30"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/5" />
        </div>
      )}
      
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: '120px',
            height: '120px',
            marginLeft: '-60px',
            marginTop: '-60px',
          }}
        />
      ))}
      
      {col === currentBeat && isPlaying && isActive && (
        <div className="absolute inset-0 bg-primary/5 animate-pulse-light rounded-xl" />
      )}
    </div>
  );
};

export default BeatPad;
