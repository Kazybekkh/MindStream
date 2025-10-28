# MindstreamThemeLogger Deployment Cheat Sheet

## 1. Prerequisites

- Node.js LTS and pnpm (already configured in the repo)
- Foundry or Hardhat. Commands below assume `forge` but you can port them to Hardhat easily.
- Base Sepolia RPC endpoint (Alchemy, Ankr, or Blast) and funded deployer key. Remember to also fund the same account with BaseSepolia ETH from [the official faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet).
- Wallet private key stored in `packages/backend/.env` as `WALLET_PRIVATE_KEY`.

## 2. Compile + Test Locally

```bash
forge build
forge test
```

If you are using Hardhat instead, run `pnpm hardhat compile`.

## 3. Deploy to Base Sepolia

```bash
forge create \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $WALLET_PRIVATE_KEY \
  contracts/MindstreamThemeLogger.sol:MindstreamThemeLogger
```

Copy the deployed address into `packages/backend/.env` as `MINDSTREAM_CONTRACT_ADDRESS`.

## 4. Verify the Contract

```bash
forge verify-contract \
  --watch \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --verifier blockscout \
  --verifier-url https://base-sepolia.blockscout.com/api \
  <DEPLOYED_ADDRESS> \
  MindstreamThemeLogger
```

## 5. Envio Indexing

1. Install the Envio CLI globally: `npm i -g @envio-dev/cli`.
2. Initialize a workspace: `envio init mindstream-indexer`.
3. Point the data source to the deployed contract and import the `ThemeLogged` event.
4. Expose the resulting GraphQL endpoint for the frontend (`graphql-request` is already installed).

That’s it—once the contract emits events you can hydrate the UI or automate leaderboards directly from Envio’s HyperIndex.
