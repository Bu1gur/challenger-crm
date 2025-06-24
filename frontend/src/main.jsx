import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Version info for debugging
console.log('🚀 Challenger CRM v0.9.0 - Build 9576090 - HTTP 422 FIXED - DEPLOYED');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
