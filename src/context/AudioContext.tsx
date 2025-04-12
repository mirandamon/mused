
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

// Updated sound sources with authentic drum kit sounds
const PREDEFINED_SOUNDS: { name: string; src: string }[] = [
  { name: 'Kick', src: 'data:audio/wav;base64,UklGRtAWAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0Ya4WAAAAAP8AAAACAAAA/f///gIAAAEAAAD9AAAA/v///gAAAAH/AAD+/v8AAP8AAAEBAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAABAAEAAAAAAAAAAQEAAAAAAAAAAAEAAAAAAAAAAAAAAQAAAAAAAAAAAAEAAAABAAAAAAD///8AAgEAAAAAAAAAAP8AAAABAAAA/////wAAAAEBAAAA/wAAAAAAAAD/AQAAAQAAAP7///4BAQACAQAAAQAAAf8AAAEBAAABAAAA/wAAAP8AAAACAAAA//8AAAEAAAD//wAA//8AAAIAAQD+/wAA//8AAAIAAQD9/wAA//8AAAIBAQABAwIAAAX//wII/f8FC/f/FxzfACYpvACMkG0A0NQ7AM/cFgDBzgwApbAQABUeEgAcJAgA5OrpANXd5AAcJNsAHybFAMLK1QBiaugA9Pj4ACAm8gD2+v8Ayc/xAM3S3QCjqM0Auby3AP8C6QADDNED8PPfA9LV0APGyccDr7PgA7K28AOSl+kDcHbjA11h9gM7Pe0DFhfnAwME1wPm6NoDfYHTAwABwQOipswDhYm6A21wvQNfYrcDUlS1A0dJvwM+QbwDNzm+Ayorxwc1ONsHQETyBzM27wYpLesFGh3jBQgL5QXu8fUF0dbkBbW75AXAxPMFsrbeBaepzwWcn80Fk5XIBYeKygWAg9AFcnXQBWdq0QVcX84FUlTSBUpM1QU/QdYFNTfbBSsv3AUkKdsFHiPWBRkg1AUUGc8FEhbKBRERxQUVGLsFHSC1BSwutgU7PLQFVFewBWVoqgV6fKQFAAAAAQAAAAEAAAABAAAAAgAAAAIAAAACAAAAAwAAAAMAAAAEAAAABQAAAAYAAAAHAAAACQAAAAsAAAAMAAAADwAAABIAAAAVAAAAGAAAABwAAAAgAAAAJAAAACkAAAAvAAAANQAAADsAAABCAAAASgAAAFMAAABcAAAAZQAAAG8AAAB5AAAAhAAAAI8AAACbAAAApwAAALQAAADCAAAA0AAAAOAAAADwAAAAAAAAEAAAADAHAABwDwAAMBgAAHAgAADwKAAA8DEAAPg6AAD4QwAAAE0AAABWAAAAXwAAAGgAAABxAAAAewAAAIQAAACOAAAAmAAAAKIAAACsAAAAtgAAAMEAAADMAAAA1wAAAOMAAADvAAAA+wAAAAcBAAAUAQAAIQEAAC4BAAA8AQAASwEAAFkBAABoAQAAeAEAAIcBAACYAQAAqAEAALkBAADKAQAA3QEAAPABAAAEAgAAGAIAACwCAABBAgAAVgIAAGsCAACCAgAAlwIAAK0CAADDAgAA2gIAAPICAAAJAwAAIQMAADkDAABRAwAAawMAAIQDAACeAwAAvAMAANkDAAD3AwAAFQQAADMEAABRBAAAcgQAAJEEAACwBAAA0QQAAPEAAAARAQAAR/7//7v8///6+v//ZPn//xj4//8T9///l/X//2n0//+N8///+fL//6ny//+X8v//5/L///fz//9j9f//8vb//8D4//+h+v//qvz//87+//8AAAAAJgEAAGQCAADMAwAAPAUAAMEGAACgCAAArgoAAOIMAABtDwAAPBIAAEYVAABxGAAAuh0AABcjAABoKAAA1C0AAHUzAABRNwAAbDsAAIo/AAC3QwAA/0cAAF9MAADtUAAApVUAAIJaAAB5XwAAhmQAAEZnAAA=' },
  { name: 'Snare', src: 'data:audio/wav;base64,UklGRvQFAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YdAFAAAAAAAASUZ9b31vXHYlb4RK9WFNTGpdC1MUYIJPiWrKUEVSiEhEVZ5aUUZPT2ZaVEQNWh9PJVYJW3lW4U2DTzhnx0qVXs5GS03HVu9ELl1LUgxW+FLKU+5bfUYvVTpR/VC0Va1Nbl1JTkVMIl6nTCVaEVMjUElZjEVWXF9QokzqU6RQeVExWWVLBlQnWItLOlYIWDtI2Wh0QDVeWUfWWQxUOUlsXzpHkFQMVupKcF3VSthRhVTbRihj/kUeXUxN+1TDVWpI32VxRAFdtU97UsFV30NJZehFbFkQUypVeVGsUSxcGk1pXaVKwlqrTx9R1V7tRSdh6kwXW5pSjkwiXGhMvVKIXOxH+luyVGNL+GJmSHRgOFAKVTRXIkkWYu1N/FYDWN1KMWPYR/ZgcVADVJ5UGk4jXGJPuluaUVlOUV69SUhf+1CJVvpULEvcXvNJE1tXVWdLx1qMVbVGk2XpR4pfiVF9UWNZOEshXshKGFtsUixRU1z9SVBc/lFpUt5WnklvYOJJyll8U3FPTFtsTPpZs1KTUJBXWUwcXpBLC1kRVbFM3FvbTsJUDViKS/5cv0p9XDhRa03FW85LwlYwVmBL6l0zS7JZEVOITvNZTU1AWbtOwlqFUExT5lfNRwBipESAXV9M9FMdVRdIMWNkRX9bRVFuUo9UB0eUYlVKU1xhTxdTLVoHSjdg2ErfWfJP2VG7WU1LdV7qS0VaNE8eUthbpEvZXbRMdlkQUC9RoFvxSlhdKVEHUk1YAUptXmdKTlnETlpR+1q8S5pemE69WBpS/E5RXSVMfF2KTb5WUVK6TQlcj08nUjJYU0ttXehMYFcMU/NNZ1uXTQ1cI09sUwxX6UkWYDRLi1f/UEBRo1kzS3ReXktoWNVPIVJYWVRMpVswTvZVN1HITbpar0uhWxlPRVLeV6hK5V7GSaVbDFBSUztXHExQW19OaVb3UfJNDlt3TURYTlFbTtpaLUy/WDRSnE4OWbFNGVsSTrlXZ1JMTsFaZk69WSFRgVF5V6VMX1u2Th9XcFG2TsJZJkz4WQJRaFGPVrlMS1r/TtRWdlCPUJlXsUuMWlBOylVMUjNPFFnNTPpY5lDkUB9XrE0LWi5Og1ZTUeBOXlhoTH9X0FCRUXBVBEz6WVVNMFecUAxQK1hLTKtY6U/MT8lW2E3tWCFPaVXEUPpPvlXhTXpYh07aVsRRnk5CWB9Nc1WTUuNMrVfGTixWs094UElUskzzWJpOc1VSUzhOz1U+TS5ZO08sVuVP40/0VNBNiVUdUIFOfVfkTExYz07oUxdT/03DVt5NkFahT6VRq1QfTcRZRk7XVj9Qek+cVwZOblQLUDZSLFQiThtZpkvMWABQKVBTVZlMRltKTQlYklBLUQdTQ01xWPtNAFbnUMJOnlcdThJZHk4aVixR8E0+V9VNy1UwUFRPi1TITFxa5UwvWHJQVFCQU4xNSlnmTKlY0E6aVJ1R0E1kWIRNIVgmTytUSFJJTl9W/k1MV1NPelKYUmZM7lmwTS5W1U+5UIpTF01aWD9OuVR+URJQUFMvTeJW1E8FUlNRRk7gVS9OlVbHTudSNVPkS6JZrU7NVG1RpE81VfNNIlfwTr9TUlGxTWBWy00JWIlOOVPtUR5Ot1YmTblW+E5TUhhSXE1FWFtOHVa5UJZOCLWABQM=' },
  { name: 'Hi-Hat', src: 'data:audio/wav;base64,UklGRrQEAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YZAEAADDw8MAZmZmAPLy8gCsrKwAjIyMAJKSkgCKiooATU1NAEtLSwCDg4MAb29vANzc3AAsLCwAKioqAGBgYAAvLy8AGxsbAHp6egB3d3cAKCgoACEhIQDp6ekAFxcXAAkJCQBzc3MAFRUVABQUFADExMQABQUFAKqqqgDs7OwATk5OAM/PzwAEBAQAtra2ABISEgDz8/MA9fX1ALi4uADy8vIAzc3NADg4OAADAwMAd3d3ALm5uQCSkpIA9PT0AO3t7QC1tbUAaGhoAAICAgBjY2MAt7e3AJWVlQAgICAA5OTkAJqamgDS0tIACAgIAC4uLgCXl5cA+vr6AIKCggBWVlYADAwMAFtbWwDj4+MAZGRkAGJiYgCysrIAx8fHAKGhoQBnZ2cABgYGAFRUVAAGBgYAvr6+AAsLCwBSUlIAFhYWABwcHADFxcUAW1tbACUlJQAmJiYACAgIABQUFACPj48AWlpaANHR0QASEhIAUVFRAFZWVgA9PT0A29vbABcXFwCtra0Ax8fHAM3NzQAuLi4A1dXVABQUFAD8/PwAKCgoAAAAAABTU1MA2NjYAA8PDwALCwsAGhoaAPr6+gAxMTEAHBwcAO7u7gDo6OgANzc3ACkpKQBtbW0AAQEBAE9PTwBcXFwAyMjIAFJSUgBHR0cAFRUVABoaGgDNzc0AHh4eACcnJwB6enoA1dXVABkZGQACAgIAvb29ALu7uwDh4eEAZ2dnACIiIgD39/cAfHx8AA0NDQDm5uYAPT09AK+vrwATExMAHh4eAPf39wAeHh4AKysrAO/v7wD5+fkADQ0NAA4ODgCXl5cAKCgoAIqKigCAgIAAICAgACAgIACVlZUA7e3tAFBQUAAqKioA8PDwABoaGgDW1tYADg4OAO7u7gAYGBgA8fHxAA8PDwCZmZkAERERAFpaWgApKSkAoaGhAJeXlwCBgYEA7u7uALm5uQB3d3cAJycnAEpKSgAcHBwAwsLCANra2gDZ2dkACQkJAJaWlgDw8PAA7OzsAPv7+wArKysAQ0NDANfX1wBqamoA5eXlAFtbWwBjY2MAJSUlAO/v7wA0NDQAYGBgAODg4ABOTk4AUlJSAIWFhQDb29sAHR0dAHl5eQD19fUAV1dXACMjIwDo6OgAoKCgAAcHBwBZWVkAhISEAJiYmABnZ2cAfX19AOzs7ADw8PAA8vLyAAgICACHh4cAZWVlAJCQkAATExMAmpqaABUVFQC0tLQAAAAAAAAAAAAAAAAA5eXlAPHx8QDv7+8A5ubmAIiIiABKSkoAcHBwAJWVlQAAAAAAAAAAAAAAAAAAAAAATk5OAG9vbwBPT08AhoaGAMrKygAUFBQAZ2dnAJiYmADCwsIAAAAAAAAAAAAAAAAAAAAAAGlpaQAsLCwAra2tAN/f3wDQ0NAA09PTAEpKSgAQEBAAAAAAAAAAAAAAAAAAAAAAAJOTkwDa2toABwcHAE1NTQCWlpYAfn5+APj4+AAcHBwAv7+/AMvLywDq6uoAAAAAAAAAAAAAAAAAAAAAAJCQkAB7e3sAqampABMTEwBYWFgAR0dHADY2NgAZGRkAdXV1AEZGRgAMDAwAjo6OAAAAAAAAAAAAAAAAAInmnZbkiw==' },
  { name: 'Clap', src: 'data:audio/wav;base64,UklGRpQFAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YXAFAAD+/v7+/vz8/Pz6+vr69/f39/X19fXy8vLy8PDw8O3t7e3q6urq6Ojo6Ovr6+vs7Ozs7e3t7e7u7u7t7e3t7Ozs7Ozs7Ozr6+vr6urq6unp6enp6enp6Ojo6Ofn5+fl5eXl4+Pj49/f39/b29vb19fX19PT09PPz8/Py8vLy8fHx8fDw8PDv7+/v7u7u7u3t7e3s7Ozs6+vr6+rq6urp6enp6Ojo6Ofn5+fm5ubm5eXl5eTk5OTj4+Pj4uLi4uHh4eHg4ODg39/f39/f39/e3t7e3t7e3t3d3d3d3d3d3d3d3dzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3d3d3d3d3d3e3t7e3t7e3t7e3t7f39/f39/f3+Dg4ODg4ODg4eHh4eLi4uLj4+Pj5OTk5OXl5eXm5ubm5+fn5+jo6Ojp6enp6urq6uvr6+vs7Ozs7e3t7e7u7u7v7+/v8PDw8PHx8fHy8vLy8/Pz8/T09PT19fX19vb29vf39/f4+Pj4+fn5+fr6+vr7+/v7/Pz8/P39/f3+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v79/f39/f39/fz8/Pz7+/v7+vr6+vn5+fn4+Pj49/f39/b29vb19fX18/Pz8/Ly8vLw8PDw7u7u7uzs7Ozq6urq6Ojo6Obm5ubl5eXl5OTk5OPj4+Pj4+Pj4uLi4uLi4uLi4uLi4+Pj4+Pj4+Pk5OTk5eXl5efn5+fo6Ojo6urq6uzs7Ozv7+/v8fHx8fT09PT29vb2+Pj4+Pr6+vr6+vr6+/v7+/z8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/A==' },
  { name: 'Tom', src: 'data:audio/wav;base64,UklGRvwEAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YdgEAAAAAAAA/v7+/vz8/Pz6+vr69/f39/X19fXy8vLy8PDw8O3t7e3q6urq6Ojo6Ovr6+vs7Ozs7e3t7e7u7u7t7e3t7Ozs7Ozs7Ozr6+vr6urq6unp6enp6Ojo6Ofn5+fl5eXl4+Pj49/f39/b29vb19fX19PT09PPz8/Py8vLy8fHx8fDw8PDv7+/v7u7u7u3t7e3s7Ozs6+vr6+rq6urp6enp6Ojo6Ofn5+fm5ubm5eXl5eTk5OTj4+Pj4uLi4uHh4eHg4ODg39/f39/f39/e3t7e3t7e3t3d3d3d3d3d3d3d3dzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3d3d3d3d3d3e3t7e3t7e3t7e3t7f39/f39/f3+Dg4ODg4ODg4eHh4eLi4uLj4+Pj5OTk5OXl5eXm5ubm5+fn5+jo6Ojp6enp6urq6uvr6+vs7Ozs7e3t7e7u7u7v7+/v8PDw8PHx8fHy8vLy8/Pz8/T09PT19fX19vb29vf39/f4+Pj4+fn5+fr6+vr7+/v7/Pz8/P39/f3+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v79/f39/f39/fz8/Pz7+/v7+vr6+vn5+fn4+Pj49/f39/b29vb19fX18/Pz8/Ly8vLw8PDw7u7u7uzs7Ozq6urq6Ojo6Obm5ubl5eXl5OTk5OPj4+Pj4+Pj4uLi4uLi4uLi4uLi4+Pj4+Pj4+Pk5OTk5eXl5efn5+fo6Ojo6urq6uzs7Ozv7+/v8fHx8fT09PT29vb2+Pj4+Pr6+vr6+vr6+/v7+/z8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/A==' }
];

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
      
      // Load predefined sounds
      const loadPromises = PREDEFINED_SOUNDS.map(async (sound) => {
        try {
          return await loadSoundFile(context, sound.src, sound.name);
        } catch (error) {
          console.error(`Failed to load ${sound.name}:`, error);
          // Create a fallback tone for this sound
          const buffer = createToneBuffer(context, 200 + Math.random() * 500);
          return { 
            id: `sound-${Date.now()}-${Math.floor(Math.random() * 1000)}`, 
            name: sound.name, 
            src: sound.src,
            audioBuffer: buffer
          };
        }
      });
      
      const loadedSounds = await Promise.all(loadPromises);
      console.log("Successfully loaded sounds:", loadedSounds);
      setSounds(loadedSounds);
      isAudioInitialized.current = true;
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

