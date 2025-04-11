
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Import Prism.js for code highlighting
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markdown';
import 'prismjs/themes/prism-tomorrow.css';

// Initialize code highlighting
document.addEventListener('DOMContentLoaded', () => {
  Prism.highlightAll();
});

// Mount the React application
createRoot(document.getElementById("root")!).render(<App />);
