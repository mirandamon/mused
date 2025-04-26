
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

type Sound = {
  id: string;
  name: string;
  src: string;
  audioBuffer?: AudioBuffer;
}

type GridPosition = {
  row: number;
  col: number;
}

type BeatPad = {
  id: string;
  position: GridPosition;
  soundId: string | null;
  active: boolean;
}

type BeatGrid = BeatPad[][];

type PostData = {
  id: string;
  authorId: string;
  authorName: string;
  grid: BeatGrid;
  createdAt: Date;
  timestamp: Date;
  likes: number;
  hasLiked: boolean;
  comments: Comment[];
  originalPostId?: string;
  originalAuthorName?: string;
}

type Comment = {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  timestamp: Date;
}

interface AudioContextType {
  audioContext: AudioContext | null;
  isPlaying: boolean;
  sounds: Sound[];
  currentBeat: number;
  bpm: number;
  setBpm: (bpm: number) => void;
  initializeAudio: () => Promise<void>;
  loadSound: (src: string, name: string) => Promise<Sound>;
  playSound: (soundId: string) => void;
  startSequence: (grid: BeatGrid) => void;
  stopSequence: () => void;
  createEmptyGrid: (rows?: number, cols?: number) => BeatGrid;
  posts: PostData[];
  addPost: (post: PostData) => void;
  likePost: (postId: string) => void;
  commentOnPost: (postId: string, comment: Comment) => void;
  getPostById: (postId: string) => PostData | undefined;
  recordSound: () => Promise<Sound>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const DEFAULT_GRID_SIZE = 4;
const DEFAULT_BPM = 120;

type SoundApiResponse = {
  name: string;
  owner_user_id: string;
  source_type: string;
  source_url: string;
  created_at: any;
  id: string;
}

const loadSoundFile = async (context: AudioContext, src: string, name: string): Promise<Sound> => {
  try {
    const soundId = `sound-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Check if src is a data URI (our local fallback)
    if (src.startsWith('data:audio')) {
      const response = await fetch(src);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await context.decodeAudioData(arrayBuffer);
      return { id: soundId, name, src, audioBuffer };
    } else {
      // Try the external URL
      try {
        const response = await fetch(src);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await context.decodeAudioData(arrayBuffer);
        return { id: soundId, name, src, audioBuffer };
      } catch (error) {
        console.error('Failed to load sound from URL, using fallback tone:', error);
        // On error, create a simple tone as a fallback
        const buffer = createToneBuffer(context, 200 + Math.random() * 500);
        return { 
          id: `sound-${Date.now()}-${Math.floor(Math.random() * 1000)}`, 
          name, 
          src,
          audioBuffer: buffer
        };
      }
    }
  } catch (error) {
    console.error('Failed to load sound:', error);
    throw new Error(`Failed to load sound: ${error.message}`);
  }
};

// Helper function to create a simple tone buffer
const createToneBuffer = (context: AudioContext, frequency: number, duration: number = 0.5): AudioBuffer => {
  const sampleRate = context.sampleRate;
  const length = sampleRate * duration;
  const buffer = context.createBuffer(1, length, sampleRate);
  const channel = buffer.getChannelData(0);
  
  for (let i = 0; i < length; i++) {
    channel[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * Math.exp(-3 * i / length);
  }
  
  return buffer;
};

const USERS = [
  { id: 'user1', name: 'Alex' },
  { id: 'user2', name: 'Taylor' },
  { id: 'user3', name: 'Jordan' },
  { id: 'user4', name: 'Casey' },
];

const getCurrentUser = () => {
  return USERS[0]; // Default to first user for this demo
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [apiFetchSuccess, setApiFetchSuccess] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [posts, setPosts] = useState<PostData[]>([]);
  
  const sequenceInterval = useRef<number | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);
  const isAudioInitialized = useRef<boolean>(false);
  const currentGrid = useRef<BeatGrid | null>(null);

  const initializeAudio = async () => {
    if (isAudioInitialized.current && audioContext) {
      return; // Already initialized
    }
    
    try {
      console.log("Initializing audio context...");
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(context);
      
       // Load sounds from API
       try {
        const response = await fetch('/api/sounds');
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        const data = await response.json();
        
        const loadedSounds = await Promise.all(data.sounds.map(async (sound:SoundApiResponse) => {
          try {
              return await loadSoundFile(context, sound.source_url, sound.name);
          } catch (error) {
              console.error(`Failed to load sound ${sound.name} from API:`, error);
               // Create a fallback tone for this sound
              const buffer = createToneBuffer(context, 200 + Math.random() * 500);
              return { 
                id: `sound-${Date.now()}-${Math.floor(Math.random() * 1000)}`, 
                name: sound.name, 
                src: sound.source_url,
                audioBuffer: buffer
              };
          }
      }));

        setSounds(loadedSounds);
        setApiFetchSuccess(true);
        isAudioInitialized.current = true;
      } catch (error) {
        console.error("Failed to fetch sounds from API:", error);
         // Fallback to a simple tone
        const buffer = createToneBuffer(context, 300 + Math.random() * 400);
        const fallbackSound = { 
          id: `sound-${Date.now()}-${Math.floor(Math.random() * 1000)}`, 
          name: 'fallback_sound', 
          src: '',
          audioBuffer: buffer
        };
        setSounds([fallbackSound]);
      }
    } catch (error) {
      console.error("Failed to initialize audio:", error);
      throw error;
    }
  };

  const loadSound = async (src: string, name: string): Promise<Sound> => {
    if (!audioContext) {
      throw new Error('Audio context not initialized');
    }
    
    try {
      const newSound = await loadSoundFile(audioContext, src, name);
      setSounds((prev) => [...prev, newSound]);
      return newSound;
    } catch (error) {
      console.error('Failed to load sound:', error);
      // Fallback to a simple tone
      const buffer = createToneBuffer(audioContext, 300 + Math.random() * 400);
      const fallbackSound = { 
        id: `sound-${Date.now()}-${Math.floor(Math.random() * 1000)}`, 
        name, 
        src,
        audioBuffer: buffer
      };
      setSounds((prev) => [...prev, fallbackSound]);
      return fallbackSound;
    }
  };

  const startSequence = (grid: BeatGrid) => {
    if (!audioContext) {
      console.error("Cannot start sequence: Audio context not initialized");
      return;
    }
    
    setIsPlaying(true);
    setCurrentBeat(0);
    
    // Store current grid reference for possible BPM updates
    currentGrid.current = grid;
    
    // Calculate beat duration based on BPM
    updateSequenceTempo(grid);
  };

  const updateSequenceTempo = (grid: BeatGrid) => {
    // Clear existing interval if any
    if (sequenceInterval.current) {
      clearInterval(sequenceInterval.current);
      sequenceInterval.current = null;
    }
    
    const beatDuration = 60000 / bpm / 4; // Quarter notes
    const totalCols = grid[0]?.length || DEFAULT_GRID_SIZE;
    
    console.log(`Updating tempo to ${bpm} BPM (${beatDuration}ms per beat)`);
    
    sequenceInterval.current = window.setInterval(() => {
      setCurrentBeat((prev) => {
        const newBeat = (prev + 1) % totalCols;
        
        // Play all active sounds in the current column
        const totalRows = grid.length;
        for (let row = 0; row < totalRows; row++) {
          const pad = grid[row][newBeat];
          if (pad && pad.active && pad.soundId) {
            playSound(pad.soundId);
          }
        }
        
        return newBeat;
      });
    }, beatDuration);
  };

  const stopSequence = () => {
    if (sequenceInterval.current) {
      clearInterval(sequenceInterval.current);
      sequenceInterval.current = null;
    }
    setIsPlaying(false);
    setCurrentBeat(0);
    currentGrid.current = null;
  };

  const handleSetBpm = (newBpm: number) => {
    setBpm(newBpm);
    
    // If currently playing, update the sequence tempo immediately
    if (isPlaying && currentGrid.current) {
      updateSequenceTempo(currentGrid.current);
    }
  };

  const playSound = (soundId: string) => {
    if (!audioContext) {
      console.error("Cannot play sound: Audio context not initialized");
      return;
    }
    
    const sound = sounds.find(s => s.id === soundId);
    if (!sound || !sound.audioBuffer) {
      console.error(`Sound not found or not loaded: ${soundId}`);
      return;
    }
    
    try {
      const source = audioContext.createBufferSource();
      source.buffer = sound.audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    } catch (error) {
      console.error("Failed to play sound:", error);
    }
  };

  const createEmptyGrid = (rows = DEFAULT_GRID_SIZE, cols = DEFAULT_GRID_SIZE): BeatGrid => {
    const grid: BeatGrid = [];
    
    for (let row = 0; row < rows; row++) {
      const rowPads: BeatPad[] = [];
      for (let col = 0; col < cols; col++) {
        rowPads.push({
          id: `pad-${row}-${col}-${Date.now()}`,
          position: { row, col },
          soundId: row < sounds.length ? sounds[row].id : null,
          active: false
        });
      }
      grid.push(rowPads);
    }
    
    return grid;
  };

  const recordSound = async (): Promise<Sound> => {
    if (!audioContext) {
      throw new Error('Audio context not initialized');
    }
    
    return new Promise((resolve, reject) => {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          mediaRecorder.current = new MediaRecorder(stream);
          recordedChunks.current = [];
          
          mediaRecorder.current.ondataavailable = (e) => {
            if (e.data.size > 0) {
              recordedChunks.current.push(e.data);
            }
          };
          
          mediaRecorder.current.onstop = async () => {
            try {
              const blob = new Blob(recordedChunks.current, { type: 'audio/webm' });
              const arrayBuffer = await blob.arrayBuffer();
              const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
              
              // Generate a unique ID
              const soundId = `sound-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
              
              // Use a simple name instead of URL.createObjectURL which causes storage issues
              const sound: Sound = {
                id: soundId,
                name: `Recording ${sounds.length + 1}`,
                src: 'recorded-audio', // Just a placeholder, not a real URL
                audioBuffer
              };
              
              setSounds(prev => [...prev, sound]);
              resolve(sound);
              
              // Clean up
              stream.getTracks().forEach(track => track.stop());
            } catch (error) {
              console.error('Error processing recorded audio:', error);
              reject(error);
            }
          };
          
          mediaRecorder.current.start();
          
          // Record for 3 seconds max
          setTimeout(() => {
            if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
              mediaRecorder.current.stop();
            }
          }, 3000);
        })
        .catch(error => {
          console.error('Error accessing microphone:', error);
          reject(error);
        });
    });
  };

  const addPost = (post: PostData) => {
    setPosts(prev => [post, ...prev]);
  };

  const likePost = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          hasLiked: !post.hasLiked,
          likes: post.hasLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const commentOnPost = (postId: string, comment: Comment) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, comment]
        };
      }
      return post;
    }));
  };

  const getPostById = (postId: string) => {
    return posts.find(post => post.id === postId);
  };

  useEffect(() => {
    if (isPlaying && currentGrid.current) {
      updateSequenceTempo(currentGrid.current);
    }
  }, [bpm]);

  const contextValue: AudioContextType = {
    audioContext,
    isPlaying,
    apiFetchSuccess,
    sounds,
    currentBeat,
    bpm,
    setBpm: handleSetBpm,
    initializeAudio,
    loadSound,
    playSound,
    startSequence,
    stopSequence,
    createEmptyGrid,
    posts,
    addPost,
    likePost,
    commentOnPost,
    getPostById,
    recordSound
  };

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

