import React from 'react';
import { useWallet } from '../hooks/useWallet';

const WalletConnect = () => {
  const { account, loading, connectWallet, disconnectWallet } = useWallet();

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="flex items-center">
      {account ? (
        <div className="flex items-center space-x-4">
          <div className="text-cyber-blue font-cyber text-sm">
            {formatAddress(account)}
          </div>
          <button
            onClick={disconnectWallet}
            className="px-4 py-2 bg-hot-pink text-black font-cyber text-sm rounded-lg hover:bg-opacity-80 transition-all neon-border border-hot-pink"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={loading}
          className="px-6 py-3 bg-neon-green text-black font-cyber text-lg rounded-lg hover:bg-opacity-80 transition-all neon-border border-neon-green disabled:opacity-50 animate-glow"
        >
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  );
};

export default WalletConnect;