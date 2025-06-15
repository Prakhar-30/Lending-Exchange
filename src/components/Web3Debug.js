import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useContract } from '../hooks/useContract';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

const Web3Debug = () => {
  const { account, provider, signer, chainId, isConnected } = useWallet();
  const { delexContract, tokenContracts, contractsReady } = useContract(signer);
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    runDebugChecks();
  }, [account, provider, signer, delexContract, tokenContracts]);

  const runDebugChecks = async () => {
    const info = {
      timestamp: new Date().toISOString(),
      wallet: {
        hasMetaMask: !!window.ethereum,
        account,
        chainId,
        isConnected
      },
      provider: !!provider,
      signer: !!signer,
      contracts: {
        delexReady: !!delexContract,
        tokensReady: Object.keys(tokenContracts).length > 0,
        contractsReady
      }
    };

    // Test contract calls if everything is ready
    if (delexContract && contractsReady && account) {
      try {
        // Test DeLex contract
        const owner = await delexContract.owner();
        const poolIds = await delexContract.getAllPools();
        info.contracts.delexTests = {
          owner,
          poolCount: poolIds.length,
          pools: poolIds
        };

        // Test token contracts
        info.contracts.tokenTests = {};
        for (const [symbol, contract] of Object.entries(tokenContracts)) {
          try {
            const name = await contract.name();
            const balance = await contract.balanceOf(account);
            info.contracts.tokenTests[symbol] = {
              name,
              balance: ethers.utils.formatEther(balance)
            };
          } catch (error) {
            info.contracts.tokenTests[symbol] = { error: error.message };
          }
        }
      } catch (error) {
        info.contracts.error = error.message;
      }
    }

    setDebugInfo(info);
  };

  const testFaucet = async (tokenSymbol) => {
    if (!tokenContracts[tokenSymbol]) {
      toast.error(`${tokenSymbol} contract not ready`);
      return;
    }

    try {
      toast.loading(`Requesting ${tokenSymbol} from faucet...`);
      const tx = await tokenContracts[tokenSymbol].faucet();
      const receipt = await tx.wait();
      toast.dismiss();
      toast.success(`${tokenSymbol} faucet successful! Tx: ${receipt.transactionHash}`);
      runDebugChecks();
    } catch (error) {
      toast.dismiss();
      toast.error(`Faucet failed: ${error.message}`);
      console.error('Faucet error:', error);
    }
  };

  const testCreatePool = async () => {
    if (!delexContract) {
      toast.error('DeLex contract not ready');
      return;
    }

    try {
      toast.loading('Creating TKNA/TKNB pool...');
      const tokenA = tokenContracts.TKNA.address;
      const tokenB = tokenContracts.TKNB.address;
      const tx = await delexContract.createPool(tokenA, tokenB);
      const receipt = await tx.wait();
      toast.dismiss();
      toast.success(`Pool created! Tx: ${receipt.transactionHash}`);
      runDebugChecks();
    } catch (error) {
      toast.dismiss();
      if (error.message.includes('Pool exists')) {
        toast.error('Pool already exists');
      } else {
        toast.error(`Create pool failed: ${error.message}`);
      }
      console.error('Create pool error:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 rounded-lg text-white font-mono text-sm">
      <h2 className="text-xl font-bold mb-4 text-neon-green">Web3 Debug Console</h2>
      
      {/* Quick Actions */}
      <div className="mb-6 p-4 bg-gray-800 rounded">
        <h3 className="text-lg mb-2 text-cyber-blue">Quick Tests</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => testFaucet('TKNA')}
            disabled={!contractsReady}
            className="px-3 py-1 bg-electric-purple text-black rounded disabled:opacity-50"
          >
            Get TKNA
          </button>
          <button
            onClick={() => testFaucet('TKNB')}
            disabled={!contractsReady}
            className="px-3 py-1 bg-electric-purple text-black rounded disabled:opacity-50"
          >
            Get TKNB
          </button>
          <button
            onClick={testCreatePool}
            disabled={!contractsReady}
            className="px-3 py-1 bg-hot-pink text-black rounded disabled:opacity-50"
          >
            Create Pool
          </button>
          <button
            onClick={runDebugChecks}
            className="px-3 py-1 bg-neon-green text-black rounded"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Debug Info */}
      <div className="space-y-4">
        <div className="p-4 bg-gray-800 rounded">
          <h3 className="text-lg mb-2 text-laser-orange">Connection Status</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className={`${debugInfo.wallet?.hasMetaMask ? 'text-green-400' : 'text-red-400'}`}>
                MetaMask: {debugInfo.wallet?.hasMetaMask ? '✅' : '❌'}
              </div>
              <div className={`${debugInfo.wallet?.isConnected ? 'text-green-400' : 'text-red-400'}`}>
                Connected: {debugInfo.wallet?.isConnected ? '✅' : '❌'}
              </div>
              <div className={`${debugInfo.provider ? 'text-green-400' : 'text-red-400'}`}>
                Provider: {debugInfo.provider ? '✅' : '❌'}
              </div>
            </div>
            <div>
              <div className={`${debugInfo.signer ? 'text-green-400' : 'text-red-400'}`}>
                Signer: {debugInfo.signer ? '✅' : '❌'}
              </div>
              <div className={`${debugInfo.contracts?.contractsReady ? 'text-green-400' : 'text-red-400'}`}>
                Contracts: {debugInfo.contracts?.contractsReady ? '✅' : '❌'}
              </div>
              <div>Chain ID: {debugInfo.wallet?.chainId || 'N/A'}</div>
            </div>
          </div>
        </div>

        {debugInfo.wallet?.account && (
          <div className="p-4 bg-gray-800 rounded">
            <h3 className="text-lg mb-2 text-cyber-blue">Account Info</h3>
            <div>Address: {debugInfo.wallet.account}</div>
          </div>
        )}

        {debugInfo.contracts?.delexTests && (
          <div className="p-4 bg-gray-800 rounded">
            <h3 className="text-lg mb-2 text-electric-purple">DeLex Contract</h3>
            <div>Owner: {debugInfo.contracts.delexTests.owner}</div>
            <div>Pool Count: {debugInfo.contracts.delexTests.poolCount}</div>
            {debugInfo.contracts.delexTests.pools.length > 0 && (
              <div>
                Pools:
                <pre className="text-xs mt-1 p-2 bg-gray-700 rounded overflow-x-auto">
                  {JSON.stringify(debugInfo.contracts.delexTests.pools, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {debugInfo.contracts?.tokenTests && (
          <div className="p-4 bg-gray-800 rounded">
            <h3 className="text-lg mb-2 text-hot-pink">Token Contracts</h3>
            {Object.entries(debugInfo.contracts.tokenTests).map(([symbol, data]) => (
              <div key={symbol} className="mb-2">
                <strong>{symbol}:</strong>
                {data.error ? (
                  <span className="text-red-400 ml-2">{data.error}</span>
                ) : (
                  <span className="ml-2">
                    {data.name} - Balance: {data.balance}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {debugInfo.contracts?.error && (
          <div className="p-4 bg-red-900 rounded">
            <h3 className="text-lg mb-2 text-red-400">Contract Error</h3>
            <div className="text-red-200">{debugInfo.contracts.error}</div>
          </div>
        )}

        <div className="p-4 bg-gray-800 rounded">
          <h3 className="text-lg mb-2 text-gray-400">Raw Debug Data</h3>
          <pre className="text-xs bg-gray-700 p-2 rounded overflow-x-auto max-h-64">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default Web3Debug;