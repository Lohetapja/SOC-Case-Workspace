import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'
import { applyAppearance, loadAppearance } from './utils/appearanceSettings'

// Apply saved appearance preferences before first paint to avoid a theme flash.
applyAppearance(loadAppearance())

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
