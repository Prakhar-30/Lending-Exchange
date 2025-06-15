import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../hooks/useWallet';
import { useContract } from '../hooks/useContract';
import { MOCK_TOKENS } from '../contracts/MockToken';
import toast from 'react-hot-toast';

const SwapInterface = () => {
  const { account, signer } = useWallet();
  const { delexContract, tokenContracts } = useContract(signer);
  
  const [fromToken, setFromToken] = useState('TKNA');
  const [toToken, setToToken] = useState('TKNB');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [pools, setPools] = useState([]);
  const [selectedPool, setSelectedPool] = useState(null);
  const [loading, setLoading] = useState(false);
  const [balances, setBalances] = useState({});

  useEffect(() => {
    if (delexContract) {
      loadPools();
    }
  }, [delexContract]);

  useEffect(() => {
    if (account && tokenContracts) {
      loadBalances();
    }
  }, [account, tokenContracts]);

  useEffect(() => {
    if (fromAmount && selectedPool && delexContract) {
      calculateOutput();
    }
  }, [fromAmount, selectedPool, fromToken, toToken]);

  const loadPools = async () => {
    try {
      const poolIds = await delexContract.getAllPools();
      const poolsData = await Promise.all(
        poolIds.map(async (poolId) => {
          const pool = await delexContract.getPoolInfo(poolId);
          return { id: poolId, ...pool };
        })
      );
      setPools(poolsData);
      
      // Find pool for current token pair
      const pool = poolsData.find(p => 
        (p.tokenA === MOCK_TOKENS[fromToken].address && p.tokenB === MOCK_TOKENS[toToken].address) ||
        (p.tokenA === MOCK_TOKENS[toToken].address && p.tokenB === MOCK_TOKENS[fromToken].address)
      );
      setSelectedPool(pool);
    } catch (error) {
      console.error('Error loading pools:', error);
    }
  };

  const loadBalances = async () => {
    try {
      const newBalances = {};
      for (const [symbol, token] of Object.entries(MOCK_TOKENS)) {
        const balance = await tokenContracts[symbol].balanceOf(account);
        newBalances[symbol] = ethers.utils.formatEther(balance);
      }
      setBalances(newBalances);
    } catch (error) {
      console.error('Error loading balances:', error);
    }
  };

  const calculateOutput = async () => {
    if (!selectedPool || !fromAmount) return;
    
    try {
      const amountIn = ethers.utils.parseEther(fromAmount);
      const isTokenA = selectedPool.tokenA === MOCK_TOKENS[fromToken].address;
      
      const reserveIn = isTokenA ? selectedPool.reserveA : selectedPool.reserveB;
      const reserveOut = isTokenA ? selectedPool.reserveB : selectedPool.reserveA;
      
      const amountOut = await delexContract.getAmountOut(amountIn, reserveIn, reserveOut);
      setToAmount(ethers.utils.formatEther(amountOut));
    } catch (error) {
      console.error('Error calculating output:', error);
      setToAmount('0');
    }
  };

  const handleSwap = async () => {
    if (!account || !delexContract || !selectedPool || !fromAmount) return;
    
    try {
      setLoading(true);
      
      const amountIn = ethers.utils.parseEther(fromAmount);
      const minAmountOut = ethers.utils.parseEther((parseFloat(toAmount) * 0.95).toString()); // 5% slippage
      
      // Approve token spend
      const tokenContract = tokenContracts[fromToken];
      const allowance = await tokenContract.allowance(account, delexContract.address);
      
      if (allowance.lt(amountIn)) {
        toast.loading('Approving token spend...');
        const approveTx = await tokenContract.approve(delexContract.address, amountIn);
        await approveTx.wait();
        toast.dismiss();
      }
      
      toast.loading('Swapping tokens...');
      const swapTx = await delexContract.swap(
        selectedPool.id,
        MOCK_TOKENS[fromToken].address,
        amountIn,
        minAmountOut
      );
      
      await swapTx.wait();
      toast.dismiss();
      toast.success('Swap successful!');
      
      // Reset form and reload data
      setFromAmount('');
      setToAmount('');
      loadBalances();
      loadPools();
      
    } catch (error) {
      toast.dismiss();
      toast.error('Swap failed: ' + error.message);
      console.error('Swap error:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const requestTestTokens = async (tokenSymbol) => {
    try {
      toast.loading('Requesting test tokens...');
      const tx = await tokenContracts[tokenSymbol].faucet();
      await tx.wait();
      toast.dismiss();
      toast.success(`Received 1000 ${tokenSymbol}!`);
      loadBalances();
    } catch (error) {
      toast.dismiss();
      toast.error('Faucet failed: ' + error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="cyber-card border-cyber-blue rounded-xl p-6 pencil-effect">
        <h2 className="text-2xl font-cyber text-neon-green mb-6 text-center animate-glow">
          Token Swap
        </h2>
        
        {/* Test Token Faucets */}
        <div className="mb-6 p-4 border border-electric-purple rounded-lg">
          <h3 className="text-electric-purple font-cyber mb-2">Get Test Tokens:</h3>
          <div className="flex space-x-2">
            {Object.keys(MOCK_TOKENS).map(symbol => (
              <button
                key={symbol}
                onClick={() => requestTestTokens(symbol)}
                className="px-3 py-1 bg-electric-purple text-black font-cyber text-sm rounded hover:bg-opacity-80 transition-all"
              >
                Get {symbol}
              </button>
            ))}
          </div>
        </div>

        {/* From Token */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-gray-300 font-cyber">From</label>
            <span className="text-gray-400 text-sm">
              Balance: {balances[fromToken] || '0'}
            </span>
          </div>
          <div className="flex space-x-2">
            <select
              value={fromToken}
              onChange={(e) => setFromToken(e.target.value)}
              className="w-20 bg-black border border-gray-600 rounded-lg px-3 py-2 text-white font-cyber"
            >
              {Object.keys(MOCK_TOKENS).map(symbol => (
                <option key={symbol} value={symbol}>{symbol}</option>
              ))}
            </select>
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-black border border-gray-600 rounded-lg px-3 py-2 text-white font-cyber"
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center mb-4">
          <button
            onClick={switchTokens}
            className="p-2 bg-hot-pink text-black rounded-full hover:bg-opacity-80 transition-all neon-border border-hot-pink"
          >
            ⇅
          </button>
        </div>

        {/* To Token */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-gray-300 font-cyber">To</label>
            <span className="text-gray-400 text-sm">
              Balance: {balances[toToken] || '0'}
            </span>
          </div>
          <div className="flex space-x-2">
            <select
              value={toToken}
              onChange={(e) => setToToken(e.target.value)}
              className="w-20 bg-black border border-gray-600 rounded-lg px-3 py-2 text-white font-cyber"
            >
              {Object.keys(MOCK_TOKENS).map(symbol => (
                <option key={symbol} value={symbol}>{symbol}</option>
              ))}
            </select>
            <input
              type="number"
              value={toAmount}
              readOnly
              placeholder="0.0"
              className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-gray-400 font-cyber"
            />
          </div>
        </div>

        {/* Pool Info */}
        {selectedPool && (
          <div className="mb-6 p-3 border border-laser-orange rounded-lg">
            <div className="text-laser-orange font-cyber text-sm mb-1">Pool Info:</div>
            <div className="text-gray-300 text-xs">
              Reserves: {ethers.utils.formatEther(selectedPool.reserveA)} / {ethers.utils.formatEther(selectedPool.reserveB)}
            </div>
          </div>
        )}

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          disabled={!account || loading || !fromAmount || !selectedPool}
          className="w-full py-3 bg-neon-green text-black font-cyber text-lg rounded-lg hover:bg-opacity-80 transition-all neon-border border-neon-green disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Swapping...' : 'Swap Tokens'}
        </button>
      </div>
    </div>
  );
};

export default SwapInterface;