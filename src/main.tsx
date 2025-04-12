
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initPlatform } from './utils/capacitorUtils.ts'

// Initialize platform-specific settings
initPlatform();

createRoot(document.getElementById("root")!).render(<App />);
