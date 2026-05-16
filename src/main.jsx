import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { clusterApiUrl } from '@solana/web3.js'
import { PrivyProvider } from '@privy-io/react-auth'
import App from './App.jsx'
import './index.css'

const endpoint = clusterApiUrl('devnet')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <PrivyProvider
        appId={import.meta.env.VITE_PRIVY_APP_ID}
        config={{
          loginMethods: ['google', 'email'],
          appearance: {
            theme: 'light',
            accentColor: '#b8963e',
            loginMessage: 'Добредојдовте во Ризница',
          },
          embeddedWallets: {
            createOnLogin: 'users-without-wallets',
            requireUserPasswordOnCreate: false,
          },
          solanaClusters: [{ name: 'devnet', rpcUrl: endpoint }],
        }}
      >
        <App />
      </PrivyProvider>
    </BrowserRouter>
  </React.StrictMode>
)