"use client";
import React, { useState, useEffect } from "react";
import { useAccount, useSendTransaction, useSwitchChain, useWriteContract } from "wagmi";
import { parseEther, parseUnits } from "viem";

const erc20Abi = [
  {
    constant: false,
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    type: "function",
  },
];

export default function TokenPurchase() {
  const { address: userAddress, isConnected, chain } = useAccount();
  const { sendTransaction } = useSendTransaction();
  const { switchChain } = useSwitchChain();
  const { writeContract } = useWriteContract();

  const [tokenType, setTokenType] = useState("ETH");
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState("eth");
  const [tokenPrice, setTokenPrice] = useState(0.001);
  const [ethPrice, setEthPrice] = useState(0);
  const [bnbPrice, setBnbPrice] = useState(0);
  const [remainingTime, setRemainingTime] = useState(15 * 24 * 60 * 60 * 1000); // 10 gün geri sayım

  const RECEIVER_WALLET = "0x55caDabFEf9797f41a34c2A99A24182105eA803a";
  const USDT_ETH_CONTRACT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
  const USDT_BSC_CONTRACT = "0x55d398326f99059fF775485246999027B3197955";

  const ETHEREUM_CHAIN_ID = 1;
  const BSC_CHAIN_ID = 56;

  // İlk cüzdan bağlantısında Ethereum ağına geçiş
  

  // API'den ETH ve BNB fiyatlarını çek
  useEffect(() => {
    async function fetchPrices() {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,binancecoin&vs_currencies=usd"
        );
        const data = await response.json();
        setEthPrice(data.ethereum.usd);
        setBnbPrice(data.binancecoin.usd);
      } catch (error) {
        console.error("Fiyatlar alınamadı:", error);
      }
    }
    fetchPrices();
    
    // Zamanlayıcı
    const timer = setInterval(() => {
      setRemainingTime((prev) => (prev > 1000 ? prev - 1000 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Geri sayım hesaplaması
  const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
  const seconds = Math.floor((remainingTime / 1000) % 60);

  // Minimum 50 USDT kontrolü
  const isBelowMinimum =
    parseFloat(amount) * (tokenType === "ETH" ? ethPrice : tokenType === "BNB" ? bnbPrice : 1) < 5;

  // Token miktarını hesapla
  const calculatedTokens = amount
    ? Math.floor(
        (parseFloat(amount) *
          (tokenType === "ETH" ? ethPrice : tokenType === "BNB" ? bnbPrice : 1)) /
        tokenPrice
      )
    : "0";

  // Ağ geçişi
  async function handleSwitchToBSC() {
    try {
      await switchChain({ chainId: BSC_CHAIN_ID }); // BSC ağına geçiş
      setNetwork("bsc"); // Ağ durumunu güncelle
      setTokenType("BNB"); // Varsayılan token tipini ayarla
    } catch (error) {
      alert("BSC ağına geçiş yapılamadı!");
      console.error(error);
    }
  }
  
  async function handleSwitchToETH() {
    try {
      await switchChain({chainId:ETHEREUM_CHAIN_ID}); // ETH ağına geçiş
      setNetwork("eth"); // Ağ durumunu güncelle
      setTokenType("ETH"); // Varsayılan token tipini ayarla
    } catch (error) {
      alert("Ethereum ağına geçiş yapılamadı!");
      console.error(error);
    }
  }

  // Transfer işlemleri
  async function handleTransfer() {
    if (!isConnected || !userAddress) {
      alert("Lütfen cüzdanınızı bağlayın!");
      return;
    }

    try {
      if (tokenType === "ETH" && network === "eth") {
        await sendTransaction({
          to: RECEIVER_WALLET,
          value: parseEther(amount),
        });
      } else if (tokenType === "USDT" && network === "eth") {
        await writeContract({
          address: USDT_ETH_CONTRACT,
          abi: erc20Abi,
          functionName: "transfer",
          args: [RECEIVER_WALLET, parseUnits(amount, 6)],
          gas: BigInt(80000),
        });
      } else if (tokenType === "BNB" && network === "bsc") {
        await sendTransaction({
          to: RECEIVER_WALLET,
          value: parseEther(amount),
          gas: BigInt(21000),
          maxFeePerGas: BigInt(3_000_000_000),
          maxPriorityFeePerGas: BigInt(1_000_000_000),
        });
      } else if (tokenType === "USDT" && network === "bsc") {
        await writeContract({
          address: USDT_BSC_CONTRACT,
          abi: erc20Abi,
          functionName: "transfer",
          args: [RECEIVER_WALLET, parseUnits(amount, 18)],
          gas: BigInt(80000),
        });
      }
    } catch (error) {
      console.error("Transfer başarısız:", error);
      alert("Transfer başarısız. Lütfen tekrar deneyin.");
    }
  }

  return (
    
    <div className="absolute top-0 left-0 flex flex-col items-center gap-4 mt-6 p-4 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg bg-blue-700 text-white rounded-lg shadow-lg border-2 border-white font-mono">
  {/* Başlık */}
  <h2 className="text-xl sm:text-2xl md:text-4xl font-bold mb-4 text-center ">
    BUY $UFOCOW TOKEN NOW
  </h2>

  {/* Zamanlayıcı */}
  <div className="flex gap-2 mb-4 flex-wrap justify-center">
    <div className="flex flex-col justify-center items-center w-16 h-12 md:w-20 md:h-16 border border-white rounded text-center">
      <div className="text-md md:text-xl font-bold">{days}</div>
      <div className="text-xs md:text-sm text-gray-300">Days</div>
    </div>
    <div className="flex flex-col justify-center items-center w-16 h-12 md:w-20 md:h-16 border border-white rounded text-center">
      <div className="text-md md:text-xl font-bold">{hours}</div>
      <div className="text-xs md:text-sm text-gray-300">Hours</div>
    </div>
    <div className="flex flex-col justify-center items-center w-16 h-12 md:w-20 md:h-16 border border-white rounded text-center">
      <div className="text-md md:text-xl font-bold">{minutes}</div>
      <div className="text-xs md:text-sm text-gray-300">Minutes</div>
    </div>
    <div className="flex flex-col justify-center items-center w-16 h-12 md:w-20 md:h-16 border border-white rounded text-center">
      <div className="text-md md:text-xl font-bold">{seconds}</div>
      <div className="text-xs md:text-sm text-gray-300">Seconds</div>
    </div>
  </div>

  {/* TOTAL RAISED */}
  <div className="text-center text-md sm:text-lg md:text-xl mb-4">
    <span className="text-gray-300">TOTAL RAISED :</span>{" "}
    <span className="text-white font-bold">$100.000</span>
  </div>

  {/* ETH ve USDT Butonları */}
  <div className="flex gap-4 flex-wrap justify-center mb-4">
    <button
      onClick={() => setTokenType(network === "bsc" ? "BNB" : "ETH")}
      className={`w-28 sm:w-32 h-10 sm:h-12 flex items-center justify-center gap-2 p-2 rounded-full border-[1px] transition-all duration-300 ${
        tokenType === (network === "bsc" ? "BNB" : "ETH")
          ? "bg-white text-black border-black font-bold"
          : "bg-gray-700 bg-opacity-50 text-white font-bold border-white hover:bg-white hover:text-black hover:border-black"
      }`}
    >
      <img
        src={
          network === "bsc"
            ? "https://cryptologos.cc/logos/binance-coin-bnb-logo.png"
            : "https://cryptologos.cc/logos/ethereum-eth-logo.png"
        }
        alt={network === "bsc" ? "BNB Logo" : "ETH Logo"}
        className="w-4 h-4 sm:w-6 sm:h-6"
      />
      {network === "bsc" ? "BNB" : "ETH"}
    </button>
    <button
      onClick={() => setTokenType("USDT")}
      className={`w-28 sm:w-32 h-10 sm:h-12 flex items-center justify-center gap-2 p-2 rounded-full border-[1px] transition-all duration-300 ${
        tokenType === "USDT"
          ? "bg-white text-black border-black font-bold"
          : "bg-gray-700 bg-opacity-50 text-white font-bold border-white hover:bg-white hover:text-black hover:border-black"
      }`}
    >
      <img
        src="https://cryptologos.cc/logos/tether-usdt-logo.png"
        alt="USDT Logo"
        className="w-4 h-4 sm:w-6 sm:h-6"
      />
      USDT
    </button>
  </div>

  {/* Token Bilgisi */}
  <div className="flex items-center justify-center gap-4 w-full my-4">
    <div className="h-px flex-1 bg-white"></div>
    <span className="text-xs sm:text-lg text-white text-center">
      1 $UFOCOW = <span className="font-bold">$0.001</span>
    </span>
    <div className="h-px flex-1 bg-white"></div>
  </div>
  <style>
{`
  /* Chrome, Safari, Edge ve Opera için */
  .no-spinner::-webkit-inner-spin-button,
  .no-spinner::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox için */
  .no-spinner {
    -moz-appearance: textfield;
  }
`}
</style>
  {/* Miktar Girişi */}
  <div className="flex flex-col gap-2 sm:flex-row w-full">
    <div className="flex items-center gap-2 w-full sm:w-1/2 border border-white rounded-full p-2 bg-transparent">
      <img
        src={
          tokenType === "ETH"
            ? "https://cryptologos.cc/logos/ethereum-eth-logo.png"
            : tokenType === "BNB"
            ? "https://cryptologos.cc/logos/binance-coin-bnb-logo.png"
            : "https://cryptologos.cc/logos/tether-usdt-logo.png"
        }
        alt={tokenType === "ETH" ? "ETH Logo" : tokenType === "BNB" ? "BNB Logo" : "USDT Logo"}
        className="w-4 h-4 sm:w-6 sm:h-6"
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full bg-transparent text-white outline-none no-spinner"
      />
    </div>
    <div className="flex items-center gap-2 w-full sm:w-1/2 border border-white rounded-full p-2 bg-transparent">
      <img
        src="https://bscscan.com/token/images/ufocow_32.png"
        alt="Token Logo"
        className="w-4 h-4 sm:w-6 sm:h-6"
      />
      <input
        type="text"
        readOnly
        value={`${calculatedTokens}`}
        className="w-full bg-transparent text-white outline-none"
      />
    </div>
  </div>

  {/* Gönder ve Ağ Geçiş Butonları */}
  <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
    <button
      onClick={handleTransfer}
      disabled={isBelowMinimum || !isConnected}
      title={
        !isConnected
          ? "Please connect your wallet"
          : isBelowMinimum
          ? "Minimum 50 USDT"
          : ""
      }
      className={`w-full sm:w-48 h-10 sm:h-12 p-2 rounded-full border-[1px] transition-all duration-300 font-bold ${
        isBelowMinimum || !isConnected
          ? "bg-gray-400 text-white cursor-not-allowed font-bold"
          : "bg-white text-black border-black hover:bg-transparent hover:text-white hover:border-white font-bold"
      }`}
    >
      Buy $UFOCOW
    </button>
    <button
      onClick={isConnected ? (network === "eth" ? handleSwitchToBSC : handleSwitchToETH) : undefined}
      disabled={!isConnected}
      className={`flex items-center justify-center gap-2 w-full sm:w-48 h-10 sm:h-12 p-2 rounded-full border-[1px] transition-all duration-300 font-bold ${
        !isConnected
          ? "bg-gray-400 text-white cursor-not-allowed"
          : "bg-transparent hover:bg-white hover:text-black hover:border-black"
      }`}
      title={!isConnected ? "Please connect your wallet" : ""}
    >
      <img
        src={
          network === "eth"
            ? "https://cryptologos.cc/logos/binance-coin-bnb-logo.png"
            : "https://cryptologos.cc/logos/ethereum-eth-logo.png"
        }
        alt={network === "eth" ? "ETH Logo" : "BNB Logo"}
        className="w-4 h-4 sm:w-6 sm:h-6"
      />
      Switch to {network === "eth" ? "BSC" : "ETH"}
    </button>
  </div>
  {/* Wallet Connect Butonu */}
  <w3m-button className="mt-4" />
    
</div>

    
  );
}
