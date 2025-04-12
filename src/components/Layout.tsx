
import React, { useEffect } from 'react';
import NavBar from './NavBar';
import { useAudio } from '@/context/AudioContext';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  hideNav?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, className, hideNav = false }) => {
  const { initializeAudio } = useAudio();

  useEffect(() => {
    // Initialize audio context when the layout is first mounted
    const handleUserInteraction = () => {
      initializeAudio();
      // Remove event listeners after initialization
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };

    // Add event listeners for user interaction
    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('touchstart', handleUserInteraction);

    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [initializeAudio]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!hideNav && <NavBar />}
      <main className={cn("flex-1 w-full max-w-screen-md mx-auto px-4 py-6", className)}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
