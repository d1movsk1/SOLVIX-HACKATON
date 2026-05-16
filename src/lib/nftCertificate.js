// Генерира NFT сертификат слика со Canvas
export async function generateNFTCertificate({ title, winner, finalBid, location, nftId, itemImage }) {
  const canvas = document.createElement('canvas')
  canvas.width = 600
 canvas.height = 380
  const ctx = canvas.getContext('2d')

  // Позадина
  ctx.fillStyle = '#f5f0e8'
  ctx.fillRect(0, 0, 600, 380)

  // Рамка
  ctx.strokeStyle = '#c4a97d'
  ctx.lineWidth = 6
  ctx.strokeRect(15, 15, 570, 350)
  ctx.strokeStyle = '#d4c5a9'
  ctx.lineWidth = 2
  ctx.strokeRect(25, 25, 550, 330)

  // Слика на предметот (лево)
  if (itemImage) {
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      await new Promise((res, rej) => {
        img.onload = res
        img.onerror = res // продолжи дури и без слика
        img.src = itemImage
      })
      ctx.save()
      ctx.beginPath()
      ctx.roundRect(40, 40, 220, 300, 10)
      ctx.clip()
      ctx.drawImage(img, 40, 40, 220, 300)
      ctx.restore()
    } catch {}
  }

  // Десна страна — текст
  const x = 290

  // Наслов "NFT Certificate"
  ctx.fillStyle = '#c4a97d'
  ctx.font = 'bold 13px serif'
  ctx.fillText('✦ NFT СЕРТИФИКАТ ЗА АВТЕНТИКАЦИЈА ✦', x, 70)

  // Наслов на предметот
  ctx.fillStyle = '#1a1a1a'
  ctx.font = 'bold 28px serif'
  const words = title.split(' ')
  let line = '', y = 115
  for (const word of words) {
    const test = line + word + ' '
    if (ctx.measureText(test).width > 460 && line) {
      ctx.fillText(line, x, y)
      line = word + ' '
      y += 35
    } else {
      line = test
    }
  }
  ctx.fillText(line, x, y)
  y += 20

  // Линија
  ctx.strokeStyle = '#d4c5a9'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x, y + 10)
  ctx.lineTo(760, y + 10)
  ctx.stroke()
  y += 30

  // Детали
  ctx.font = '14px serif'
  ctx.fillStyle = '#666'
  ctx.fillText('Победник:', x, y + 20)
  ctx.fillStyle = '#1a1a1a'
  ctx.font = 'bold 16px serif'
  ctx.fillText(winner, x + 100, y + 20)

  ctx.font = '14px serif'
  ctx.fillStyle = '#666'
  ctx.fillText('Финална цена:', x, y + 50)
  ctx.fillStyle = '#1a1a1a'
  ctx.font = 'bold 16px serif'
  ctx.fillText(`${finalBid} USDC`, x + 120, y + 50)

  ctx.font = '14px serif'
  ctx.fillStyle = '#666'
  ctx.fillText('Локација:', x, y + 80)
  ctx.fillStyle = '#1a1a1a'
  ctx.font = 'bold 16px serif'
  ctx.fillText(location, x + 90, y + 80)

  ctx.font = '14px serif'
  ctx.fillStyle = '#666'
  ctx.fillText('Датум:', x, y + 110)
  ctx.fillStyle = '#1a1a1a'
  ctx.font = 'bold 16px serif'
  ctx.fillText(new Date().toLocaleDateString('mk-MK'), x + 70, y + 110)

  // NFT ID
  ctx.font = '11px monospace'
  ctx.fillStyle = '#999'
  ctx.fillText(`NFT ID: ${nftId}`, x, y + 150)
  ctx.fillText('Мрежа: Solana Devnet', x, y + 168)

  // Watermark
  ctx.font = 'italic 13px serif'
  ctx.fillStyle = '#c4a97d'
  ctx.fillText('Ризница — Аукција на автентични македонски предмети', x, 465)

  return canvas.toDataURL('image/png', 0,4)
}