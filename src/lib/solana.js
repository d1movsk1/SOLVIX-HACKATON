import { Program, AnchorProvider, BN, web3 } from '@coral-xyz/anchor'
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { IDL } from './idl.js'

const { SystemProgram } = web3

export const PROGRAM_ID = new PublicKey('9qxFLefPHgt1CNBkGRR3SXSno51hLgzEEvoysxUe5Uk5')
export const CONNECTION  = new Connection(clusterApiUrl('devnet'), 'confirmed')
export const USDC_MINT   = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU')

// Конвертирај секој PublicKey преку toString() за да избегнеш верзиски конфликт
function pk(key) {
  if (!key) throw new Error('PublicKey is undefined')
  return new PublicKey(key.toString())
}

function makeAnchorWallet(wallet) {
  if (!wallet?.publicKey) throw new Error('Wallet not connected')
  return {
    publicKey:           pk(wallet.publicKey),
    signTransaction:     async (tx) => wallet.signTransaction(tx),
    signAllTransactions: async (txs) => wallet.signAllTransactions
      ? wallet.signAllTransactions(txs)
      : Promise.all(txs.map(tx => wallet.signTransaction(tx))),
  }
}

function getProgram(anchorWallet) {
  const provider = new AnchorProvider(CONNECTION, anchorWallet, {
    commitment: 'confirmed',
    preflightCommitment: 'confirmed',
  })
  return new Program(IDL, provider)
}

function getReadonlyProgram() {
  const dummy = {
    publicKey:           new PublicKey('11111111111111111111111111111111'),
    signTransaction:     async t => t,
    signAllTransactions: async ts => ts,
  }
  return new Program(IDL, new AnchorProvider(CONNECTION, dummy, { commitment: 'confirmed' }))
}

export function getAuctionPDA(sellerPubkey, title) {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('auction'), pk(sellerPubkey).toBuffer(), Buffer.from(title)],
    PROGRAM_ID
  )
  return pda
}

export async function listItem({ title, description, imageUri, startingBid, durationHours, wallet }) {
  const anchorWallet = makeAnchorWallet(wallet)
  const program      = getProgram(anchorWallet)
  const auctionPDA   = getAuctionPDA(anchorWallet.publicKey, title)

  console.log('listItem → PDA:', auctionPDA.toString())

  const tx = await program.methods
    .listItem(
      title,
      description,
      imageUri,
      new BN(Math.round(startingBid * 1_000_000)),
      new BN(durationHours * 3600),
    )
    .accounts({
      auction:       auctionPDA,
      seller:        anchorWallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc()

  return { signature: tx, auctionId: auctionPDA.toString() }
}

export async function placeBid({ auctionId, amount, prevBidderWallet, wallet }) {
  const anchorWallet  = makeAnchorWallet(wallet)
  const program       = getProgram(anchorWallet)
  const auctionPubkey = pk(auctionId)
  const bidder        = anchorWallet.publicKey

  const bidderTokenAccount     = await getAssociatedTokenAddress(USDC_MINT, bidder)
  const escrowTokenAccount     = await getAssociatedTokenAddress(USDC_MINT, auctionPubkey, true)
  const prevBidderTokenAccount = prevBidderWallet
    ? await getAssociatedTokenAddress(USDC_MINT, pk(prevBidderWallet))
    : bidderTokenAccount

  const tx = await program.methods
    .placeBid(new BN(Math.round(amount * 1_000_000)))
    .accounts({
      auction:                auctionPubkey,
      bidder,
      bidderTokenAccount,
      prevBidderTokenAccount,
      escrowTokenAccount,
      tokenProgram:           TOKEN_PROGRAM_ID,
    })
    .rpc()

  return { signature: tx }
}

export async function endAuction({ auctionId, sellerWallet, wallet }) {
  const anchorWallet       = makeAnchorWallet(wallet)
  const program            = getProgram(anchorWallet)
  const auctionPubkey      = pk(auctionId)
  const sellerPubkey       = pk(sellerWallet)
  const escrowTokenAccount = await getAssociatedTokenAddress(USDC_MINT, auctionPubkey, true)
  const sellerTokenAccount = await getAssociatedTokenAddress(USDC_MINT, sellerPubkey)

  const tx = await program.methods
    .endAuction()
    .accounts({
      auction:            auctionPubkey,
      escrowTokenAccount,
      sellerTokenAccount,
      tokenProgram:       TOKEN_PROGRAM_ID,
    })
    .rpc()

  return { signature: tx }
}

export async function fetchAuctions() {
  try {
    const program  = getReadonlyProgram()
    const accounts = await program.account.auction.all()
    return accounts.map(a => ({
      id:            a.publicKey.toString(),
      title:         a.account.title,
      description:   a.account.description,
      image:         a.account.imageUri,
      seller:        shortenAddress(a.account.seller.toString()),
      sellerWallet:  a.account.seller.toString(),
      currentBid:    a.account.currentBid.toNumber() / 1_000_000,
      startingBid:   a.account.startingBid.toNumber() / 1_000_000,
      currency:      'USDC',
      endsAt:        a.account.endsAt.toNumber() * 1000,
      bids:          0,
      categories:    ['Антиквитети'],
      location:      'Македонија',
      ended:         a.account.ended,
      nftMinted:     a.account.nftMinted,
      currentBidder: a.account.currentBidder.toString() !== '11111111111111111111111111111111'
        ? a.account.currentBidder.toString()
        : null,
    }))
  } catch (err) {
    console.warn('fetchAuctions:', err.message)
    return []
  }
}

export async function uploadImage(file) {
  // Користи го името на фајлот како seed за рандом но конзистентна слика
  const seed = encodeURIComponent(file.name.replace(/\.[^/.]+$/, ''))
  return `https://picsum.photos/seed/${seed}/800/600`
}

export function shortenAddress(addr) {
  if (!addr) return ''
  return addr.slice(0, 4) + '...' + addr.slice(-4)
}

export function explorerUrl(signature) {
  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`
}
