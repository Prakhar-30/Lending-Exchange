import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { useContract } from '../hooks/useContract';
import { ethers } from 'ethers';

const Home = () => {
  const { account } = useWallet();
  const { delexContract } = useContract();
  const [stats, setStats] = useState({
    totalPools: 0,
    totalLiquidity: '0',
    totalBorrowed: '0'
  });

  useEffect(() => {
    if (delexContract) {
      loadStats();
    }
  }, [delexContract]);

  const loadStats = async () => {
    try {
      const poolIds = await delexContract.getAllPools();
      let totalLiquidity = ethers.BigNumber.from(0);
      let totalBorrowed = ethers.BigNumber.from(0);
      
      for (const poolId of poolIds) {
        const pool = await delexContract.getPoolInfo(poolId);
        totalLiquidity = totalLiquidity.add(pool.reserveA).add(pool.reserveB);
        totalBorrowed = totalBorrowed.add(pool.totalBorrowedA).add(pool.totalBorrowedB);
      }
      
      setStats({
        totalPools: poolIds.length,
        totalLiquidity: ethers.utils.formatEther(totalLiquidity),
        totalBorrowed: ethers.utils.formatEther(totalBorrowed)
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-6xl md:text-8xl font-cyber font-bold text-neon-green mb-6 animate-glow">
              DeLex Protocol
            </h1>
            <p className="text-xl md:text-2xl text-cyber-blue mb-8 font-cyber">
              Decentralized Lending + Exchange Protocol on BlockDAG
            </p>
            <p className="text-lg text-gray-300 mb-12 max-w-3xl mx-auto">
              Experience the future of DeFi with our unified protocol that combines 
              AMM trading and lending capabilities, powered by BlockDAG's high-performance blockchain.
            </p>
            
            {!account ? (
              <div className="text-electric-purple font-cyber text-lg">
                Connect your wallet to start trading and lending
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/swap"
                  className="px-8 py-4 bg-neon-green text-black font-cyber text-xl rounded-lg hover:bg-opacity-80 transition-all neon-border border-neon-green"
                >
                  Start Swapping
                </Link>
                <Link
                  to="/liquidity"
                  className="px-8 py-4 bg-electric-purple text-black font-cyber text-xl rounded-lg hover:bg-opacity-80 transition-all neon-border border-electric-purple"
                >
                  Add Liquidity
                </Link>
                <Link
                  to="/lending"
                  className="px-8 py-4 bg-hot-pink text-black font-cyber text-xl rounded-lg hover:bg-opacity-80 transition-all neon-border border-hot-pink"
                >
                  Start Lending
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-cyber text-center text-laser-orange mb-12 animate-glow">
            Protocol Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="cyber-card border-cyber-blue rounded-xl p-6 text-center pencil-effect">
              <div className="text-3xl font-cyber text-cyber-blue mb-2">
                {stats.totalPools}
              </div>
              <div className="text-gray-300 font-cyber">Total Pools</div>
            </div>
            <div className="cyber-card border-neon-green rounded-xl p-6 text-center pencil-effect">
              <div className="text-3xl font-cyber text-neon-green mb-2">
                {parseFloat(stats.totalLiquidity).toFixed(2)}
              </div>
              <div className="text-gray-300 font-cyber">Total Liquidity</div>
            </div>
            <div className="cyber-card border-hot-pink rounded-xl p-6 text-center pencil-effect">
              <div className="text-3xl font-cyber text-hot-pink mb-2">
                {parseFloat(stats.totalBorrowed).toFixed(2)}
              </div>
              <div className="text-gray-300 font-cyber">Total Borrowed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-cyber text-center text-electric-purple mb-12 animate-glow">
            Protocol Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="cyber-card border-neon-green rounded-xl p-6 pencil-effect">
              <h3 className="text-xl font-cyber text-neon-green mb-4">⚡ Lightning Fast Swaps</h3>
              <p className="text-gray-300">
                Execute trades instantly with minimal fees using our optimized AMM on BlockDAG's high-performance network.
              </p>
            </div>
            <div className="cyber-card border-electric-purple rounded-xl p-6 pencil-effect">
              <h3 className="text-xl font-cyber text-electric-purple mb-4">🚀 Provide Liquidity</h3>
              <p className="text-gray-300">
                Earn fees by providing liquidity to trading pairs and help power the decentralized exchange.
              </p>
            </div>
            <div className="cyber-card border-hot-pink rounded-xl p-6 pencil-effect">
              <h3 className="text-xl font-cyber text-hot-pink mb-4">💎 Lending & Borrowing</h3>
              <p className="text-gray-300">
                Use your tokens as collateral to borrow other assets or lend your tokens to earn interest.
              </p>
            </div>
            <div className="cyber-card border-cyber-blue rounded-xl p-6 pencil-effect">
              <h3 className="text-xl font-cyber text-cyber-blue mb-4">🔒 Secure & Audited</h3>
              <p className="text-gray-300">
                Built with security in mind, featuring battle-tested smart contract patterns and comprehensive testing.
              </p>
            </div>
            <div className="cyber-card border-laser-orange rounded-xl p-6 pencil-effect">
              <h3 className="text-xl font-cyber text-laser-orange mb-4">🌐 BlockDAG Powered</h3>
              <p className="text-gray-300">
                Leveraging BlockDAG's innovative DAG structure for superior scalability and transaction throughput.
              </p>
            </div>
            <div className="cyber-card border-neon-green rounded-xl p-6 pencil-effect">
              <h3 className="text-xl font-cyber text-neon-green mb-4">🎮 Gamified Experience</h3>
              <p className="text-gray-300">
                Enjoy a unique, gamified DeFi experience with neon aesthetics and smooth user interactions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;