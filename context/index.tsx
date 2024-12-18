"use client"

import { wagmiAdapter, projectId } from "@/config"
import { createAppKit } from "@reown/appkit"
import { mainnet,arbitrum, bsc,sepolia } from "@reown/appkit/networks"
import { bscMainnet,bscTestnet } from "../config/bscNetwork";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React,{ type ReactNode} from "react"
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi"

const queryClient = new QueryClient()

if (!projectId) {
    throw new Error("Project Id is not defined.")
}

const metadata = {
    name:"demokit",
    description:"demokit -evm",
    url: "https://exampleapp.com",

}

const modal = createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks: [mainnet,bscMainnet],
    defaultNetwork: mainnet,
    features: {
        analytics:true,
        email:true,
        socials: ["google","x","github"],
        emailShowWallets: true
    },
    themeMode: "dark"
})

function ContextProvider ({ children, cookies}:{ children: ReactNode; cookies: string | null}) {
    const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

    return (
        <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </WagmiProvider>
    )
}

export default ContextProvider