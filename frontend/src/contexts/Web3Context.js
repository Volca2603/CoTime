import { createContext, useState, useEffect } from 'react';
import Web3Modal from 'web3modal';
import { ethers, BrowserProvider } from 'ethers'; // 使用正确的BrowserProvider

export const Web3Context = createContext();

// 保持组件名称，避免与导入的BrowserProvider冲突
export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);

  // 初始化钱包连接
  const connectWallet = async () => {
    const web3Modal = new Web3Modal({
      network: "sepolia", 
      cacheProvider: true,
    });
    const instance = await web3Modal.connect();
    // 使用BrowserProvider替代Web3Provider
    const ethersProvider = new BrowserProvider(instance);
    const ethersSigner = await ethersProvider.getSigner(); // 在v6中需要await
    const addr = await ethersSigner.getAddress();
    const network = await ethersProvider.getNetwork();
    const cid = network.chainId;

    setProvider(ethersProvider);
    setSigner(ethersSigner);
    setAddress(addr);
    setChainId(cid);
  };

  // 断开钱包
  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setChainId(null);
    localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER");
  };

  return (
    <Web3Context.Provider value={{ 
      provider, signer, address, chainId, 
      connectWallet, disconnectWallet 
    }}>
      {children}
    </Web3Context.Provider>
  );
};