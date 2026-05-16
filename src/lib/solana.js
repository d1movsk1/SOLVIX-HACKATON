// ─────────────────────────────────────────────────────────────
//  solana.js — Placeholder. Replace TODO sections with real calls.
// ─────────────────────────────────────────────────────────────

export async function connectWallet() {
  if (!window.solana?.isPhantom)
    throw new Error('Phantom wallet not found. Install it from phantom.app')
  const response = await window.solana.connect()
  return response.publicKey.toString()
}

export async function disconnectWallet() {
  if (window.solana) await window.solana.disconnect()
}

// TODO: Anchor program — list_item instruction
export async function listItem({ title, description, imageUri, startingBid, durationHours }) {
  console.log('[SOLANA TODO] list_item', { title, startingBid, durationHours })
  await delay(1200)
  return { signature: mockTx(), auctionId: 'mock_' + Date.now() }
}

// TODO: Anchor program — place_bid instruction + escrow PDA lock
export async function placeBid({ auctionId, amount, bidderWallet }) {
  console.log('[SOLANA TODO] place_bid', { auctionId, amount })
  await delay(1200)
  return { signature: mockTx() }
}

// TODO: Anchor program — end_auction + release escrow
export async function endAuction({ auctionId }) {
  console.log('[SOLANA TODO] end_auction', { auctionId })
  await delay(1200)
  return { signature: mockTx() }
}

// TODO: Metaplex Core mint + Anchor claim_nft
export async function claimNft({ auctionId, winnerWallet }) {
  console.log('[SOLANA TODO] claim_nft', { auctionId })
  await delay(2000)
  return { signature: mockTx(), nftMint: 'mock_nft_' + Math.random().toString(36).slice(2) }
}

// TODO: IPFS / Arweave upload (web3.storage or Bundlr)
export async function uploadImage(file) {
  console.log('[SOLANA TODO] upload image', file?.name)
  await delay(800)
  return 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&q=80'
}

export function shortenAddress(addr) {
  if (!addr) return ''
  return addr.slice(0, 4) + '...' + addr.slice(-4)
}

export function explorerUrl(signature) {
  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`
}

const delay = ms => new Promise(r => setTimeout(r, ms))
const mockTx = () => 'mock_tx_' + Math.random().toString(36).slice(2)
