import { BookingProvider } from './context/BookingContext'
import React from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import Dashboard from './components/Dashboard'
import UserContext from './components/UserContext'

createRoot(document.getElementById('react-dashboard')).render(
  <React.StrictMode>
    <UserContext.Provider
      value={{
        name: 'CineBook User',
        role: 'User'
      }}
    >
      <BookingProvider>
      <Dashboard />
      </BookingProvider>
    </UserContext.Provider>
  </React.StrictMode>
)