import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import AuctionDetail from './pages/AuctionDetail'
import Sell from './pages/Sell'
import MyAuctions from './pages/MyAuctions'

export default function App() {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: `url('/src/assets/old-brown-vintage-parchment-paper-texture.jpg')`,
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay за читливост */}
      <div className="min-h-screen" style={{ backgroundColor: 'rgba(245, 240, 232, 0.65)' }}>
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