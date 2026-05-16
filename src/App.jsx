import { Routes, Route, Navigate } from 'react-router-dom'
import { usePrivy } from '@privy-io/react-auth'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import AuctionDetail from './pages/AuctionDetail'
import Sell from './pages/Sell'
import MyAuctions from './pages/MyAuctions'
import Login from './pages/Login'
import paperTexture from './assets/paper-texture.jpg'

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

// Wrapper со paper texture позадина — важи за сите страни
function PageWrapper({ children, withNavbar = true }) {
  return (
    <div
      style={{
        backgroundImage: `url(${paperTexture})`,
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        minHeight: '100vh',
      }}
    >
      <div style={{ minHeight: '100vh', backgroundColor: 'rgba(240, 232, 208, 0.55)' }}>
        {withNavbar && <Navbar />}
        {children}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={
        <PageWrapper withNavbar={false}>
          <Login />
        </PageWrapper>
      } />
      <Route path="*" element={
        <PageWrapper>
          <Routes>
            <Route path="/"            element={<Home />} />
            <Route path="/auction/:id" element={<AuctionDetail />} />
            <Route path="/sell"        element={<Protected><Sell /></Protected>} />
            <Route path="/my-auctions" element={<Protected><MyAuctions /></Protected>} />
          </Routes>
        </PageWrapper>
      } />
    </Routes>
  )
}