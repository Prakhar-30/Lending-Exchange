import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import WalletConnect from './WalletConnect';

const Header = () => {
  const location = useLocation();
  
  const navigation = [
    { name: 'Home', path: '/' },
    { name: 'Swap', path: '/swap' },
    { name: 'Liquidity', path: '/liquidity' },
    { name: 'Lending', path: '/lending' }
  ];

  return (
    <header className="bg-black border-b-2 border-cyber-blue">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-cyber font-bold text-neon-green animate-glow">
              DeLex Protocol
            </Link>
            <nav className="ml-10 flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-3 py-2 text-sm font-cyber transition-colors ${
                    location.pathname === item.path
                      ? 'text-cyber-blue border-b-2 border-cyber-blue'
                      : 'text-gray-300 hover:text-electric-purple'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <WalletConnect />
        </div>
      </div>
    </header>
  );
};

export default Header;