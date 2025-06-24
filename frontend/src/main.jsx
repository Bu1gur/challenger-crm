import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Version info for debugging
console.log('🚀 Challenger CRM v1.0.1 - PAYMENT AMOUNT FIX!');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
