import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { TonAdapter } from '@reown/appkit-adapter-ton'
import { mainnet, polygon, bsc } from '@reown/appkit/networks'
import { solana, solanaTestnet } from '@reown/appkit/networks'
import { ton, tonTestnet } from '@reown/appkit/networks'
import { TonConnect } from '@tonconnect/ui-react'

export const metadata = {
  name: 'Predict Market',
  description: 'Multichain Prediction Market',
  url: 'https://yourapp.com',
  icons: ['https://avatars.mywebsite.com/']
}

// 1. Initialize Adapters
const ethersAdapter = new EthersAdapter()
const solanaAdapter = new SolanaAdapter()
const tonAdapter = new TonAdapter()

// 2. Create the multichain modal
export const modal = createAppKit({
  adapters: [solanaAdapter, tonAdapter,ethersAdapter],
  networks: [mainnet, polygon, bsc, solana, ton], 
  metadata,
  
defaultNetwork: ton,
themeMode: "light",
  projectId: import.meta.env.VITE_WC_PROJECT_ID,
  features: { 
    analytics: true,
    email: false, 
    socials: [],

  }
})