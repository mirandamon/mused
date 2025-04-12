
import { Capacitor } from '@capacitor/core';

/**
 * Check if the app is running on a native mobile platform
 */
export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Check if the app is running on iOS
 */
export const isIOS = (): boolean => {
  return Capacitor.getPlatform() === 'ios';
};

/**
 * Check if the app is running on Android
 */
export const isAndroid = (): boolean => {
  return Capacitor.getPlatform() === 'android';
};

/**
 * Get the current platform
 */
export const getPlatform = (): string => {
  return Capacitor.getPlatform();
};

/**
 * Initialize platform-specific settings
 */
export const initPlatform = (): void => {
  // Set up any platform-specific configurations here
  // This function should be called when the app initializes
  
  if (isNativePlatform()) {
    // Configure native platform specific settings
    document.body.classList.add('native-platform');
    
    if (isIOS()) {
      document.body.classList.add('ios-platform');
    } else if (isAndroid()) {
      document.body.classList.add('android-platform');
    }
  }
};
