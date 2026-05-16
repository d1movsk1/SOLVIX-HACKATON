# Ризница — Аукциска платформа на Solana

Аукции на автентични македонски предмети, верифицирани со NFT на Solana.

## Старт

```bash
npm install
npm run dev
# → http://localhost:5173
```

## Страни

| Route | Опис |
|---|---|
| `/` | Листа на аукции — пребарување, филтри, сортирање |
| `/auction/:id` | Детал страница, понуда модал |
| `/sell` | Форма за листање нов предмет |

## Структура

```
src/
├── components/
│   ├── layout/Navbar.jsx        # Навигација + hamburger мени (мобилно)
│   └── ui/
│       ├── AuctionCard.jsx      # Картичка за аукција
│       ├── BidModal.jsx         # Sheet на мобилно, модал на десктоп
│       └── Countdown.jsx        # Live тајмер
├── pages/
│   ├── Home.jsx                 # Листа со филтри
│   ├── AuctionDetail.jsx        # Детал + понуда
│   └── Sell.jsx                 # Форма за листање
├── hooks/
│   ├── useWallet.js             # Phantom wallet state
│   └── useAuctions.js           # Аукции state
└── lib/
    ├── solana.js                # ⚠️ TODO — замени со вистински Anchor повици
    └── mockData.js              # Mock податоци
```

## Solana TODO

Сите функции во `src/lib/solana.js` се placeholder.
Замени ги по редослед:

1. `connectWallet()` → `@solana/wallet-adapter-react`
2. `listItem()` → Anchor `list_item` инструкција
3. `placeBid()` → Anchor `place_bid` + escrow PDA
4. `endAuction()` → Anchor `end_auction`
5. `claimNft()` → Metaplex Core mint + `claim_nft`
6. `uploadImage()` → IPFS / Arweave

```bash
# Кога ќе го имплементираш Solana делот:
npm install @solana/web3.js @solana/wallet-adapter-react \
  @solana/wallet-adapter-phantom @coral-xyz/anchor \
  @metaplex-foundation/mpl-core @solana/pay
```

## Девнет

- SOL: https://faucet.solana.com
- USDC: https://faucet.circle.com
- Explorer: https://explorer.solana.com/?cluster=devnet
