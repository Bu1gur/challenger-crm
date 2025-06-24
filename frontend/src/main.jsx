import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Version info for debugging
console.log('🚀 Challenger CRM v0.9.0 - Build 537a2c7 - HTTP 422 FIXED');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
