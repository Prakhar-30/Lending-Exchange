import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { DELEX_CORE_ADDRESS, DELEX_CORE_ABI } from '../contracts/DeLexCore';
import { MOCK_TOKENS, MOCK_TOKEN_ABI } from '../contracts/MockToken';

export const useContract = (signer) => {
  const [delexContract, setDelexContract] = useState(null);
  const [tokenContracts, setTokenContracts] = useState({});

  useEffect(() => {
    if (signer) {
      // Initialize DeLex contract
      const delex = new ethers.Contract(DELEX_CORE_ADDRESS, DELEX_CORE_ABI, signer);
      setDelexContract(delex);

      // Initialize token contracts
      const tokens = {};
      Object.keys(MOCK_TOKENS).forEach(key => {
        tokens[key] = new ethers.Contract(
          MOCK_TOKENS[key].address,
          MOCK_TOKEN_ABI,
          signer
        );
      });
      setTokenContracts(tokens);
    }
  }, [signer]);

  return { delexContract, tokenContracts };
};