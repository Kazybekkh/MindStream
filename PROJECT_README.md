# 🌊 Mindstream

An interactive web application that transforms your live webcam feed into a dynamic, AI-generated visual narrative using Livepeer Daydream. The visual style and content evolve in real-time based on the dominant themes detected in your speech, analyzed via a custom decaying relevance algorithm.

## 🎯 Project Overview

**Hackathon Tracks:**
- 🎥 Livepeer: Real-Time AI Video Generation
- 📊 Envio: Best Use of HyperIndex

**Tech Stack:**
- Frontend: Next.js 14, React, TailwindCSS, Socket.IO Client
- Backend: Node.js, Express, Socket.IO, AssemblyAI, Ethers.js
- Blockchain: Solidity (Base Sepolia), Envio Indexer
- AI Services: Livepeer Daydream API, AssemblyAI Real-Time STT

## 🚀 Quick Start

### Prerequisites

Make sure you have the following installed:
- Node.js (v18+)
- pnpm (v8+)
- Docker (for Envio indexer)
- MetaMask wallet with Base Sepolia testnet configured

### Installation

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd MindStream
```

2. **Install dependencies:**
```bash
pnpm install
```

3. **Configure environment variables:**

Backend (`packages/backend/.env`):
```bash
cd packages/backend
cp .env.example .env
# Edit .env and add your API keys:
# - ASSEMBLYAI_API_KEY (from https://www.assemblyai.com/dashboard)
# - LIVEPEER_API_KEY (from https://livepeer.studio/dashboard/developers/api-keys)
# - WALLET_PRIVATE_KEY (export from MetaMask - KEEP SECRET!)
```

4. **Get test ETH for Base Sepolia:**
- Visit: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- Or: https://sepolia-faucet.base.org/

### Running the Project

**Development mode (runs both frontend and backend):**
```bash
pnpm dev
```

Or run individually:

```bash
# Backend only (port 3001)
pnpm dev:backend

# Frontend only (port 3000)
pnpm dev:frontend
```

**Access the app:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 📁 Project Structure

```
MindStream/
├── packages/
│   ├── frontend/          # Next.js frontend
│   │   ├── app/           # Next.js 14 app directory
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities & hooks
│   └── backend/           # Node.js backend
│       └── src/
│           ├── index.js              # Main server
│           ├── blockchainService.js  # Blockchain integration
│           └── themeAnalyzer.js      # Theme detection algorithm
├── testaudio.py          # Audio testing script (Python)
├── pnpm-workspace.yaml   # Monorepo config
└── package.json          # Root package.json
```

## 🎨 How It Works

1. **Speech-to-Text**: User speaks into microphone → AssemblyAI transcribes in real-time
2. **Theme Detection**: Custom decaying relevance algorithm analyzes speech to extract dominant themes
3. **Visual Generation**: Themes → Livepeer Daydream API → AI-generated video overlays
4. **Blockchain Logging**: Theme shifts are logged immutably on Base Sepolia
5. **Indexing**: Envio indexes blockchain events for fast historical queries

## 🔧 Next Steps (Phase 1-5)

- [ ] **Phase 1**: Implement AssemblyAI integration in backend
- [ ] **Phase 2**: Deploy smart contract to Base Sepolia
- [ ] **Phase 3**: Integrate Livepeer Daydream API
- [ ] **Phase 4**: Set up Envio indexer
- [ ] **Phase 5**: Polish UI and add visualizations

## 📝 API Keys Needed

| Service | Purpose | Get Key From |
|---------|---------|--------------|
| AssemblyAI | Speech-to-text | https://www.assemblyai.com/dashboard |
| Livepeer | AI video generation | https://livepeer.studio/dashboard/developers/api-keys |
| Base Sepolia RPC | Blockchain access | Public RPC or Alchemy/Infura |

## 🧪 Testing

**Test audio streaming (Python script):**
```bash
# Install dependencies
pip install pyaudio websocket-client

# Run test
python testaudio.py
```

## 🤝 Contributing

This is a hackathon project built for the Livepeer and Envio tracks. Feel free to fork and improve!

## 📄 License

MIT License - see LICENSE file for details

---

Built with ❤️ for the hackathon
