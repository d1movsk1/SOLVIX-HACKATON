import { Connection, clusterApiUrl } from '@solana/web3.js'

export const NETWORK = 'devnet'
export const connection = new Connection(clusterApiUrl(NETWORK), 'confirmed')