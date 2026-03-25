import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { router } from './router'
import { loadCMUDictionary } from './utils/cmuDict'
import './index.css'

// Start loading dictionary immediately (overlaps with React initialization)
loadCMUDictionary().catch(console.error);

const rootEl = document.getElementById('root')!;
rootEl.classList.add('hydrated');

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  </React.StrictMode>,
)
