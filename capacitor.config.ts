import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.com.mused",
  appName: "Mused",
  webDir: "dist",
  server: {
    url: "https://4c528161-5b87-419d-a799-9077f884e59f.lovableproject.com?forceHideBadge=true",
    cleartext: true,
  },
  // Additional configuration for handling audio permissions
  plugins: {
    Permissions: {
      microphone: true,
    },
  },
};

export default config;
