import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { TemaProvider } from './context/TemaContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TemaProvider>
      <App />
    </TemaProvider>
  </StrictMode>,
)