# Smart Contract Deployment Guide

## MindstreamThemeLogger Contract

This contract logs theme shifts on Base Sepolia blockchain for indexing by Envio.

### Quick Deploy with Remix

1. **Open Remix IDE**: https://remix.ethereum.org/

2. **Create new file**: `MindstreamThemeLogger.sol`

3. **Copy contract code** from `contracts/MindstreamThemeLogger.sol`

4. **Compile**:
   - Select Solidity compiler version: `0.8.20+`
   - Click "Compile"

5. **Deploy**:
   - Go to "Deploy & Run Transactions"
   - Select Environment: "Injected Provider - MetaMask"
   - Make sure MetaMask is on **Base Sepolia** network
   - Click "Deploy"
   - Confirm transaction in MetaMask

6. **Save contract address**: Copy the deployed contract address

7. **Update backend**:
   ```bash
   # Edit packages/backend/.env
   CONTRACT_ADDRESS=0x... # paste your contract address
   ```

### Deploy with Hardhat (Alternative)

```bash
# Install Hardhat
cd MindStream
pnpm add -D hardhat @nomicfoundation/hardhat-toolbox

# Initialize Hardhat
npx hardhat init

# Follow prompts, select "Create a JavaScript project"

# Deploy script (create scripts/deploy.js):
# See hardhat-deploy-example.js below
```

### Verify on BaseScan

After deployment, verify your contract:

1. Go to: https://sepolia.basescan.org/
2. Search for your contract address
3. Click "Contract" → "Verify and Publish"
4. Upload source code or use Hardhat verification

### Get Contract ABI

After compilation in Remix:
1. Go to "Solidity Compiler" tab
2. Click "ABI" button (copy icon)
3. Save to `packages/backend/src/contractABI.json`

Or if using Hardhat:
```bash
# ABI is in: artifacts/contracts/MindstreamThemeLogger.sol/MindstreamThemeLogger.json
```

### Update Backend Integration

In `packages/backend/src/blockchainService.js`:

```javascript
import contractABI from './contractABI.json' assert { type: 'json' };

// In initialize() method:
if (process.env.CONTRACT_ADDRESS) {
  this.contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    contractABI,
    this.wallet
  );
}
```

### Test the Contract

```javascript
// Test in Node.js or browser console
const sessionId = 'test-session-' + Date.now();
const theme = 'nature';
const prompt = 'A lush forest with natural lighting';

const tx = await contract.logThemeShift(sessionId, theme, prompt);
await tx.wait();
console.log('Theme shift logged!');

// Query history
const history = await contract.getSessionHistory(sessionId);
console.log('Session history:', history);
```

### Contract Events (for Envio)

The contract emits these events:
- `ThemeShiftLogged`: Main event for theme changes
- `SessionStarted`: When a new session begins

Envio will index these events for fast GraphQL queries.

### Base Sepolia Network Info

- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Block Explorer**: https://sepolia.basescan.org
- **Faucet**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

### Estimated Gas Costs

- Deploy: ~0.001-0.002 ETH (test ETH)
- logThemeShift: ~0.0001 ETH per call
- Read operations: Free (view functions)

### Security Notes

- ✅ No funds stored in contract
- ✅ Only emits events and stores data
- ✅ No owner privileges needed
- ✅ Anyone can log theme shifts
- ⚠️ Consider adding access control for production

### Next Steps

After deployment:
1. Save contract address to `.env`
2. Save ABI to `contractABI.json`
3. Set up Envio indexer (Phase 4)
4. Test end-to-end flow

---

Ready for Phase 2! 🚀
