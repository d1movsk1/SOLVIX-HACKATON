import emailjs from '@emailjs/browser'

export async function sendNFTEmail({ auction, winnerEmail, winnerName }) {
  const nftId = `NFT-${auction.id}-${Date.now()}`

  const params = {
    to_email: winnerEmail,
    winner_name: winnerName,
    item_title: auction.title,
    final_bid: String(auction.currentBid),
    location: String(auction.location),
    nft_id: nftId,
    date: new Date().toLocaleDateString('mk-MK'),
  }

  console.log('Params size:', JSON.stringify(params).length, 'bytes')

  await emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    params,
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY
  )

  return { nftId }
}