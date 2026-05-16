import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import AuctionDetail from './pages/AuctionDetail'
import Sell from './pages/Sell'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"            element={<Home />} />
        <Route path="/auction/:id" element={<AuctionDetail />} />
        <Route path="/sell"        element={<Sell />} />
      </Routes>
    </>
  )
}
