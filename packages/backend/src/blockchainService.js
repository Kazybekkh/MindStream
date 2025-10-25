import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

class BlockchainService {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.contract = null;
  }

  async initialize() {
    try {
      // Connect to Base Sepolia
      this.provider = new ethers.providers.JsonRpcProvider(
        process.env.RPC_URL || 'https://sepolia.base.org'
      );

      // Initialize wallet
      if (process.env.WALLET_PRIVATE_KEY) {
        this.wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, this.provider);
        console.log('✅ Wallet connected:', this.wallet.address);
      }

      // TODO: Initialize contract when CONTRACT_ADDRESS is set
      if (process.env.CONTRACT_ADDRESS) {
        // this.contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, this.wallet);
      }

      return true;
    } catch (error) {
      console.error('❌ Blockchain initialization failed:', error);
      return false;
    }
  }

  async logThemeShift(sessionId, timestamp, theme, prompt) {
    if (!this.contract) {
      console.warn('Contract not initialized, skipping blockchain log');
      return null;
    }

    try {
      const tx = await this.contract.logThemeShift(
        sessionId,
        timestamp,
        theme,
        prompt
      );
      const receipt = await tx.wait();
      console.log('✅ Theme shift logged on-chain:', receipt.transactionHash);
      return receipt;
    } catch (error) {
      console.error('❌ Failed to log theme shift:', error);
      throw error;
    }
  }

  async getSessionHistory(sessionId) {
    if (!this.contract) {
      return [];
    }

    try {
      const history = await this.contract.getSessionHistory(sessionId);
      return history;
    } catch (error) {
      console.error('❌ Failed to get session history:', error);
      throw error;
    }
  }
}

export default new BlockchainService();
