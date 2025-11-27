import { useContext } from 'react';
import { Web3Context } from '../contexts/Web3Context';

const ConnectWallet = () => {
  const { address, connectWallet, disconnectWallet } = useContext(Web3Context);

  return (
    <div className="connect-wallet">
      {!address ? (
        <button onClick={connectWallet}>连接钱包</button>
      ) : (
        <div className="wallet-info">
          <span>{address.substring(0, 6)}...{address.substring(address.length - 4)}</span>
          <button onClick={disconnectWallet}>断开连接</button>
        </div>
      )}
    </div>
  );
};

export default ConnectWallet;