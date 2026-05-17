import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { createV1, mplCore } from '@metaplex-foundation/mpl-core'
import { generateSigner, signerIdentity, publicKey as umiPk } from '@metaplex-foundation/umi'
import { clusterApiUrl } from '@solana/web3.js'

export async function mintNFT({ title, description, imageUri, winner, phantom }) {
  const umi = createUmi(clusterApiUrl('devnet')).use(mplCore())

  // Поврзи го Phantom како signer
  const phantomSigner = {
    publicKey:    umiPk(phantom.publicKey.toString()),
    signMessage:  async (msg) => phantom.signMessage(msg),
    signTransaction: async (tx) => phantom.signTransaction(tx),
    signAllTransactions: async (txs) => phantom.signAllTransactions(txs),
  }
  umi.use(signerIdentity(phantomSigner))

  // NFT metadata
  const metadata = {
    name:        title,
    description: description,
    image:       imageUri,
    attributes: [
      { trait_type: 'Платформа',   value: 'Ризница'   },
      { trait_type: 'Верифициран', value: 'Да'        },
      { trait_type: 'Победник',    value: winner      },
    ],
  }

  // Качи metadata на Cloudinary
  const metadataUri = await uploadMetadata(metadata)

  // Минтирај NFT
  const asset = generateSigner(umi)
  await createV1(umi, {
    asset,
    name:    title,
    uri:     metadataUri,
    owner:   umiPk(winner),
  }).sendAndConfirm(umi)

  return { mint: asset.publicKey.toString() }
}

async function uploadMetadata(metadata) {
  const blob     = new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  const file     = new File([blob], 'metadata.json')
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)
  formData.append('resource_type', 'raw')

  const res  = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/raw/upload`,
    { method: 'POST', body: formData }
  )
  const data = await res.json()
  return data.secure_url
}