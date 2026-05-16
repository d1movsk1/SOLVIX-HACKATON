import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { WalletProvider } from './hooks/WalletContext'
import { AuctionsProvider } from './hooks/AuctionsContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <WalletProvider>
        <AuctionsProvider>
          <App />
        </AuctionsProvider>
      </WalletProvider>
    </BrowserRouter>
  </React.StrictMode>
)