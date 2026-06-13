import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import OpeningPitch from './OpeningPitch'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OpeningPitch />
  </StrictMode>,
)
