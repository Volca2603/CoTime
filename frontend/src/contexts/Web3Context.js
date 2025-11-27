import { createContext, useState, useEffect } from 'react';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);

  // 初始化钱包连接
  const connectWallet = async () => {
    const web3Modal = new Web3Modal({
      network: "mumbai", // 测试网
      cacheProvider: true,
    });
    const instance = await web3Modal.connect();
    const ethersProvider = new ethers.providers.Web3Provider(instance);
    const ethersSigner = ethersProvider.getSigner();
    const addr = await ethersSigner.getAddress();
    const cid = await ethersProvider.getNetwork().then(net => net.chainId);

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