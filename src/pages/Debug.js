import React from 'react';
import Web3Debug from '../components/Web3Debug';

const Debug = () => {
  return (
    <div className="min-h-screen bg-black py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-cyber text-neon-green mb-4 animate-glow">
            Web3 Debug Console
          </h1>
          <p className="text-lg text-gray-300">
            Test your wallet connection and smart contracts
          </p>
        </div>
        
        <Web3Debug />
      </div>
    </div>
  );
};

export default Debug;