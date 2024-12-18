import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"]});

import { headers } from "next/headers";
import ContextProvider from "@/context";

export const metadata: Metadata = {
  title: "demokit app",
  description:"Powered by reown"
};

export default async function RootLayout({
  children

}: Readonly<{
  children:React.ReactNode
}>) {
  const cookies = (await headers()).get("cookie")

  return(
    <html lang="en">
      <body className={inter.className}>
        <ContextProvider cookies={cookies}>{children}</ContextProvider>
      </body>
    </html>
  )
}