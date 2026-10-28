import React from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import { AuthProvider } from './context/AuthContext'
import { BookingProvider } from './context/BookingContext'
import App from './App'
import './style.css'

const rootElement = document.getElementById('root') || document.getElementById('react-dashboard')

if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <AuthProvider>
        <BookingProvider>
          <App />
          <Analytics />
        </BookingProvider>
      </AuthProvider>
    </React.StrictMode>
  )
}
