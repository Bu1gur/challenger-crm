import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Version info for debugging
console.log('🚀 Challenger CRM v1.0.0 - PRODUCTION FIX - HTTP 422 SOLVED!');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
