import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import '@fontsource-variable/plus-jakarta-sans'
import './styles/tokens.css'
import './styles/base.css'
import './styles/app.css'
import { ThemeProvider } from './lib/theme.tsx'
import { ToastProvider } from './components/ui.tsx'
import App from './App.tsx'
import { watchScriptFonts } from './lib/scriptFonts.ts'
import { watchScrollRegions } from './lib/scrollRegions.ts'

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root element in index.html')

createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <App />
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>,
)
watchScriptFonts()
watchScrollRegions()
