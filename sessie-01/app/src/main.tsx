import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// NL Design System: registreer alle nldd-* componenten.
// De tokens/fonts (CSS) worden via @import bovenaan index.css geladen.
import '@nldd/design-system';

import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
