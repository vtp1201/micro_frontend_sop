import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { initializeWebFragments } from 'web-fragments'

import App from './App.tsx'

initializeWebFragments()

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
