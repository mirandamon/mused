
/**
 * Special handling for iOS audio initialization
 * iOS requires user interaction to start audio context
 */
export const initializeIOSAudio = async (): Promise<void> => {
  // Create a silent buffer to activate audio context on iOS
  const silentBuffer = new AudioContext();
  const buffer = silentBuffer.createBuffer(1, 1, 22050);
  const source = silentBuffer.createBufferSource();
  source.buffer = buffer;
  source.connect(silentBuffer.destination);
  source.start(0);
  
  // Resume AudioContext after user interaction
  document.addEventListener('touchstart', function unlockAudio() {
    document.removeEventListener('touchstart', unlockAudio, false);
    silentBuffer.resume().then(() => {
      console.log('AudioContext unlocked on iOS');
    });
  }, false);
};

/**
 * Detect mobile browser and apply specific handling
 */
export const handleMobileAudio = async (): Promise<void> => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
                
  if (isIOS) {
    await initializeIOSAudio();
  }
};
