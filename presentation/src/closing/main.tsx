import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import ClosingPitch from './ClosingPitch'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClosingPitch />
  </StrictMode>,
)
