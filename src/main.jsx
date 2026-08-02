import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { PrimeReactProvider } from 'primereact/api'

import 'primereact/resources/themes/lara-light-green/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'
import './utils/primeLocale.js'
import './index.css'

import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { EntidadProvider } from './context/EntidadContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PrimeReactProvider value={{ locale: 'es', ripple: true }}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <EntidadProvider>
              <App />
            </EntidadProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </PrimeReactProvider>
  </StrictMode>,
)
