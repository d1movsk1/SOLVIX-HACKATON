import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import AuctionDetail from './pages/AuctionDetail'
import Sell from './pages/Sell'
import MyAuctions from './pages/MyAuctions'
import paperTexture from './assets/paper-texture.jpg'

export default function App() {
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
      <div style={{ minHeight: '100vh', backgroundColor: 'rgba(245, 240, 232, 0.55)' }}>
        <Navbar />
        <Routes>
          <Route path="/"            element={<Home />} />
          <Route path="/auction/:id" element={<AuctionDetail />} />
          <Route path="/sell"        element={<Sell />} />
          <Route path="/my-auctions" element={<MyAuctions />} />
        </Routes>
      </div>
    </div>
  )
}