import { usePrivy, useWallets } from '@privy-io/react-auth'

export function useWallet() {
  const { login, logout, authenticated, user } = usePrivy()
  const { wallets } = useWallets()

  // Земи го embedded Solana wallet
  const solanaWallet = wallets.find(w => w.chainType === 'solana')

  return {
    connected:   authenticated,
    publicKey:   solanaWallet?.address,
    shortKey:    solanaWallet?.address
      ? solanaWallet.address.slice(0,4) + '...' + solanaWallet.address.slice(-4)
      : '',
    connect:     login,
    disconnect:  logout,
    wallet:      solanaWallet, // за потпишување трансакции
  }
}