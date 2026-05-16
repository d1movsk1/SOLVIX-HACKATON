export const IDL = {
  address: "9qxFLefPHgt1CNBkGRR3SXSno51hLgzEEvoysxUe5Uk5",
  metadata: {
    name: "riznica_program",
    version: "0.1.0",
    spec: "0.1.0",
  },
  instructions: [
    {
      name: "listItem",
      discriminator: [174, 245, 22, 211, 228, 103, 121, 13],
      accounts: [
        { name: "auction",       writable: true,  signer: false },
        { name: "seller",        writable: true,  signer: true  },
        { name: "systemProgram", writable: false, signer: false },
      ],
      args: [
        { name: "title",           type: "string" },
        { name: "description",     type: "string" },
        { name: "imageUri",        type: "string" },
        { name: "startingBid",     type: "u64"    },
        { name: "durationSeconds", type: "i64"    },
      ],
    },
    {
      name: "placeBid",
      discriminator: [238, 77, 148, 91, 200, 151, 92, 146],
      accounts: [
        { name: "auction",                writable: true,  signer: false },
        { name: "bidder",                 writable: true,  signer: true  },
        { name: "bidderTokenAccount",     writable: true,  signer: false },
        { name: "prevBidderTokenAccount", writable: true,  signer: false },
        { name: "escrowTokenAccount",     writable: true,  signer: false },
        { name: "tokenProgram",           writable: false, signer: false },
      ],
      args: [
        { name: "amount", type: "u64" },
      ],
    },
    {
      name: "endAuction",
      discriminator: [252, 110, 101, 234, 66, 104, 28, 87],
      accounts: [
        { name: "auction",            writable: true,  signer: false },
        { name: "escrowTokenAccount", writable: true,  signer: false },
        { name: "sellerTokenAccount", writable: true,  signer: false },
        { name: "tokenProgram",       writable: false, signer: false },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "auction",
      discriminator: [218, 94, 247, 242, 126, 233, 131, 81],
    },
  ],
  types: [
    {
      name: "auction",
      type: {
        kind: "struct",
        fields: [
          { name: "seller",        type: "pubkey" },
          { name: "title",         type: "string" },
          { name: "description",   type: "string" },
          { name: "imageUri",      type: "string" },
          { name: "startingBid",   type: "u64"    },
          { name: "currentBid",    type: "u64"    },
          { name: "currentBidder", type: "pubkey" },
          { name: "endsAt",        type: "i64"    },
          { name: "ended",         type: "bool"   },
          { name: "nftMinted",     type: "bool"   },
          { name: "bump",          type: "u8"     },
        ],
      },
    },
  ],
  errors: [
    { code: 6000, name: "TitleTooLong",      msg: "Насловот е подолг од 100 знаци"           },
    { code: 6001, name: "DescTooLong",       msg: "Описот е подолг од 500 знаци"             },
    { code: 6002, name: "InvalidBid",        msg: "Почетната понуда мора да е > 0"           },
    { code: 6003, name: "InvalidDuration",   msg: "Траењето мора да е > 0"                   },
    { code: 6004, name: "AuctionEnded",      msg: "Аукцијата е веќе завршена"                },
    { code: 6005, name: "AuctionNotExpired", msg: "Аукцијата сè уште не е завршена"          },
    { code: 6006, name: "AuctionExpired",    msg: "Аукцијата истече"                         },
    { code: 6007, name: "BidTooLow",         msg: "Понудата мора да е поголема од тековната" },
    { code: 6008, name: "SellerCannotBid",   msg: "Продавачот не може да понудува"           },
  ],
}