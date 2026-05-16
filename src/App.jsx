import { Routes, Route, Navigate } from 'react-router-dom'
import { usePrivy } from '@privy-io/react-auth'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import AuctionDetail from './pages/AuctionDetail'
import Sell from './pages/Sell'
import MyAuctions from './pages/MyAuctions'
import Login from './pages/Login'

// Заштитена рута — само за логирани корисници
function Protected({ children }) {
  const { authenticated, ready } = usePrivy()

  if (!ready) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-parchment-3 border-t-gold rounded-full animate-spin" />
    </div>
  )

  if (!authenticated) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <>
      <Routes>
        {/* Јавна рута — логин без navbar */}
        <Route path="/login" element={<Login />} />

        {/* Сите останати рути — со navbar */}
        <Route path="*" element={
          <>
            <Navbar />
            <Routes>
              <Route path="/"            element={<Home />} />
              <Route path="/auction/:id" element={<AuctionDetail />} />
              <Route path="/sell"        element={
                <Protected><Sell /></Protected>
              } />
              <Route path="/my-auctions" element={
                <Protected><MyAuctions /></Protected>
              } />
            </Routes>
          </>
        } />
      </Routes>
    </>
  )
}