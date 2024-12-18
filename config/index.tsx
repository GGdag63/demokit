import { cookieStorage, createStorage } from "wagmi";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { mainnet, arbitrum} from "@reown/appkit/networks";
import { bscMainnet} from "@/config/bscNetwork"; // BSC ağını içe aktar

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) {
  throw new Error("Project Id is not defined.");
}

// BSC'yi mevcut ağlara ekleyin
export const networks = [mainnet, arbitrum, bscMainnet];

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  networks, // Ağlara BSC'yi dahil ettik
  projectId,
   // Varsayılan ağı BSC olarak ayarla
});

export const config = wagmiAdapter.wagmiConfig;
