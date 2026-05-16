import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer', 'process', 'util', 'stream'],
      globals: { Buffer: true, process: true },
    }),
  ],
  resolve: {
    dedupe: ['@solana/web3.js', '@coral-xyz/anchor'],
  },
  optimizeDeps: {
    include: ['@coral-xyz/anchor', '@solana/web3.js'],
  },
})
