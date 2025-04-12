
// Helper functions for audio processing

// Generate a unique ID for audio assets
export const generateAudioId = (): string => {
  return `audio_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
};

// Calculate beat time in milliseconds based on BPM
export const calculateBeatTime = (bpm: number): number => {
  return 60000 / bpm;
};

// Convert time in seconds to formatted time string
export const formatTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

// Normalize audio data to fit between -1 and 1
export const normalizeAudioData = (audioData: Float32Array): Float32Array => {
  const max = Math.max(...Array.from(audioData).map(Math.abs));
  
  if (max === 0) return audioData;
  
  const scaleFactor = 1.0 / max;
  return new Float32Array(audioData.map(sample => sample * scaleFactor));
};

// Calculate average audio level from an array of audio data
export const calculateAudioLevel = (audioData: Float32Array): number => {
  const sum = audioData.reduce((acc, val) => acc + Math.abs(val), 0);
  return sum / audioData.length;
};

// Convert base64 audio to audio buffer
export const base64ToAudioBuffer = async (
  audioContext: AudioContext,
  base64String: string
): Promise<AudioBuffer> => {
  const base64Data = base64String.split(',')[1];
  const binaryString = window.atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
  return audioBuffer;
};

// Visualize audio data on a canvas
export const visualizeAudio = (
  canvas: HTMLCanvasElement,
  audioData: Float32Array,
  color: string = '#4f46e5'
): void => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const width = canvas.width;
  const height = canvas.height;
  
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  
  ctx.beginPath();
  const sliceWidth = width / audioData.length;
  let x = 0;
  
  for (let i = 0; i < audioData.length; i++) {
    const y = (audioData[i] * height / 2) + height / 2;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    
    x += sliceWidth;
  }
  
  ctx.lineTo(width, height / 2);
  ctx.stroke();
};
