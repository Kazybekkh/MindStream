# 🎯 MINDSTREAM - Complete Hackathon Project Setup

## ✅ PHASE 0: ENVIRONMENT SETUP - COMPLETE!

Your Mindstream project is now fully scaffolded and ready for the 24-hour hackathon targeting **Livepeer** and **Envio** tracks.

---

## 📂 Complete Project Structure

```
MindStream/
├── 📦 packages/
│   ├── frontend/                    # Next.js 14 Frontend
│   │   ├── app/
│   │   │   ├── page.js             # Main app with webcam + theme display
│   │   │   ├── layout.js           # Root layout
│   │   │   └── globals.css         # TailwindCSS globals
│   │   ├── components/
│   │   │   ├── WebcamStream.js     # Webcam capture component
│   │   │   ├── ThemeDisplay.js     # Real-time theme visualization
│   │   │   └── HistoryPanel.js     # Blockchain history from Envio
│   │   ├── lib/
│   │   │   └── useSocket.js        # Socket.IO React hook
│   │   ├── package.json
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   ├── postcss.config.js
│   │   └── tsconfig.json
│   │
│   └── backend/                     # Node.js Backend
│       ├── src/
│       │   ├── index.js            # Express + Socket.IO server
│       │   ├── blockchainService.js # Base Sepolia integration
│       │   └── themeAnalyzer.js    # Decaying relevance algorithm
│       ├── package.json
│       └── .env.example            # Environment template
│
├── 🔗 contracts/
│   ├── MindstreamThemeLogger.sol   # Solidity smart contract
│   └── DEPLOYMENT_GUIDE.md         # Deployment instructions
│
├── 📄 Documentation
│   ├── PROJECT_README.md           # Main project documentation
│   ├── SETUP_COMPLETE.md          # Setup completion guide
│   └── README.md                   # Original README
│
├── 🐍 Python Testing
│   └── testaudio.py               # AssemblyAI audio test (UNTOUCHED)
│
└── ⚙️ Configuration
    ├── package.json               # Root monorepo config
    ├── pnpm-workspace.yaml        # PNPM workspace
    └── .gitignore                 # Comprehensive gitignore
```

---

## 🚀 IMMEDIATE NEXT STEPS

### Step 1: Install Dependencies (5 minutes)

```bash
cd /Users/kazybekkhairulla/Encode2025/MindStream
pnpm install
```

This will install all dependencies for both frontend and backend.

### Step 2: Configure API Keys (10 minutes)

1. **Create backend .env file:**
```bash
cd packages/backend
cp .env.example .env
```

2. **Get API keys and add to `.env`:**

| Variable | Get From | Purpose |
|----------|----------|---------|
| `ASSEMBLYAI_API_KEY` | https://www.assemblyai.com/dashboard | Speech-to-text |
| `LIVEPEER_API_KEY` | https://livepeer.studio/dashboard | AI video generation |
| `WALLET_PRIVATE_KEY` | MetaMask → Base Sepolia | Blockchain transactions |

3. **Get Base Sepolia test ETH:**
   - https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
   - https://sepolia-faucet.base.org/

### Step 3: Run Development Servers (2 minutes)

```bash
# From project root
pnpm dev
```

This runs both:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

Or run individually:
```bash
pnpm dev:frontend  # Port 3000
pnpm dev:backend   # Port 3001
```

### Step 4: Verify Setup

1. Open http://localhost:3000
2. Check connection status (should show 🟢 Connected)
3. Allow webcam/microphone permissions
4. Check backend health: http://localhost:3001/health

---

## 📋 HACKATHON ROADMAP (Phases 1-5)

### ✅ Phase 0: Environment Setup (COMPLETE - 1-2 hours)
- [x] Monorepo structure with pnpm
- [x] Frontend (Next.js + React + TailwindCSS)
- [x] Backend (Node.js + Express + Socket.IO)
- [x] Theme analyzer algorithm
- [x] Blockchain service skeleton
- [x] Smart contract code
- [x] Comprehensive documentation

### 🔄 Phase 1: Backend Integration (2-3 hours)
- [ ] Integrate AssemblyAI real-time transcription
- [ ] Connect theme analyzer to transcription stream
- [ ] Emit theme updates via Socket.IO
- [ ] Test end-to-end audio → theme flow

**Files to modify:**
- `packages/backend/src/index.js` (add AssemblyAI)
- `packages/backend/src/themeAnalyzer.js` (test algorithm)

### 🔄 Phase 2: Smart Contract Deployment (2-3 hours)
- [ ] Deploy `MindstreamThemeLogger.sol` to Base Sepolia
- [ ] Save contract address and ABI
- [ ] Update backend with contract integration
- [ ] Test logging theme shifts on-chain

**Resources:**
- `contracts/DEPLOYMENT_GUIDE.md`
- Remix IDE: https://remix.ethereum.org/

### 🔄 Phase 3: Livepeer Integration (2-3 hours)
- [ ] Set up Livepeer Daydream API calls
- [ ] Generate prompts from detected themes
- [ ] Stream AI-generated video
- [ ] Overlay on webcam feed

**API Docs:**
- https://docs.livepeer.org/api-reference/generate/text-to-video

### 🔄 Phase 4: Envio Indexer (2-3 hours)
- [ ] Install Envio CLI: `npm i -g @envio-dev/cli`
- [ ] Initialize indexer: `envio init`
- [ ] Configure to index `ThemeShiftLogged` events
- [ ] Set up GraphQL endpoint
- [ ] Connect frontend HistoryPanel to indexed data

**Resources:**
- https://docs.envio.dev/docs/getting-started

### 🔄 Phase 5: Polish & Demo (2-3 hours)
- [ ] UI/UX improvements
- [ ] Error handling and loading states
- [ ] Performance optimization
- [ ] Prepare demo script
- [ ] Record demo video
- [ ] Write submission README

---

## 🎨 KEY FEATURES

### 1. Decaying Relevance Algorithm
Located in `packages/backend/src/themeAnalyzer.js`:
- Exponential decay of theme scores over time
- Keyword-based theme extraction (can be enhanced with NLP/LLM)
- Real-time dominant theme detection
- Visual prompt generation

### 2. Real-Time Architecture
- **WebSocket** communication (Socket.IO)
- **AssemblyAI** streaming transcription
- **Livepeer** real-time video generation
- **Blockchain** event logging

### 3. Blockchain Integration
- **Base Sepolia** testnet
- **Ethers.js** v5 for wallet/contract interaction
- **Immutable** theme shift logging
- **Envio** indexing for fast queries

---

## 🔧 DEVELOPMENT COMMANDS

```bash
# Install all dependencies
pnpm install

# Run both frontend + backend
pnpm dev

# Run individually
pnpm dev:frontend
pnpm dev:backend

# Build for production
pnpm build

# Build individually
pnpm build:frontend
pnpm build:backend
```

---

## 🐛 TROUBLESHOOTING

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### pnpm Not Found
```bash
npm install -g pnpm
```

### Node Version Issues
```bash
# Check version (need 18+)
node --version

# Use nvm to install
nvm install 18
nvm use 18
```

### PyAudio Installation Failed (for testaudio.py)
```bash
# macOS - install PortAudio first
brew install portaudio
export LDFLAGS="-L/opt/homebrew/lib"
export CPPFLAGS="-I/opt/homebrew/include"
pip install PyAudio
```

---

## 📚 USEFUL RESOURCES

### APIs & Documentation
- **Livepeer Docs**: https://docs.livepeer.org/
- **Livepeer Daydream**: https://docs.livepeer.org/api-reference/generate/text-to-video
- **AssemblyAI Real-Time**: https://www.assemblyai.com/docs/speech-to-text/streaming
- **Envio Docs**: https://docs.envio.dev/
- **Base Sepolia**: https://docs.base.org/

### Blockchain Tools
- **Remix IDE**: https://remix.ethereum.org/
- **Base Sepolia Explorer**: https://sepolia.basescan.org/
- **Base Faucet**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

### Testing
- **Socket.IO Client**: https://socket.io/docs/v4/client-api/
- **GraphQL Playground**: (Envio provides this)

---

## ⚠️ IMPORTANT SECURITY NOTES

1. **NEVER commit `.env` files** with real API keys
2. **Rotate wallet private key** after hackathon
3. Use **Base Sepolia testnet only** (never mainnet)
4. Keep `WALLET_PRIVATE_KEY` secret and secure
5. Add `.env` to `.gitignore` (already done)

---

## 🎯 HACKATHON SUBMISSION CHECKLIST

- [ ] Working demo deployed/recorded
- [ ] Smart contract deployed on Base Sepolia
- [ ] Envio indexer running and queryable
- [ ] Livepeer integration functional
- [ ] README with setup instructions
- [ ] Demo video (< 5 minutes)
- [ ] GitHub repository public
- [ ] Contract verified on BaseScan
- [ ] GraphQL endpoint accessible

---

## 🎉 YOU'RE READY TO BUILD!

Everything is set up. Your next command should be:

```bash
cd /Users/kazybekkhairulla/Encode2025/MindStream
pnpm install
pnpm dev
```

Then open http://localhost:3000 and start hacking! 🚀

---

## 📞 NEED HELP?

Check these files:
- `PROJECT_README.md` - Main documentation
- `SETUP_COMPLETE.md` - Setup verification
- `contracts/DEPLOYMENT_GUIDE.md` - Contract deployment
- `packages/backend/.env.example` - Environment variables

---

Built for **Livepeer** (AI Video) and **Envio** (HyperIndex) tracks
Good luck with your hackathon! 🏆

