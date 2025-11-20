# Project Mindstream – Builder Notes

## Architecture

| Layer | Tech | Responsibilities |
| --- | --- | --- |
| Frontend | Next.js 14, Tailwind, Socket.IO client, react-webcam | Streams webcam/mic, renders Livepeer video surface, shows live analyzer state + history |
| Backend | Express, Socket.IO, AssemblyAI realtime WS, Livepeer REST, Ethers v5 | Maintains realtime sessions, generates prompts, forwards to Livepeer, writes Base Sepolia log |
| Smart Contracts | Solidity (`MindstreamThemeLogger`) | Emits `ThemeLogged` events consumed by Envio HyperIndex |

## Key flows

1. **Session bootstrap** – Frontend connects to `/socket.io`, backend seeds a `ThemeAnalyzer`, and returns a `sessionId`.
2. **Realtime STT** – When the user toggles the webcam, the frontend emits `assembly:start`, backend fetches an AssemblyAI token and proxies audio frames.
3. **Prompt changes** – Analyzer detects a dominant keyword change, backend emits `theme:update`, calls `recordTheme`, and the frontend updates UI + history.
4. **Livepeer Daydream** – Frontend POSTs `/api/daydream/session` with the current prompt, backend forwards to Livepeer Studio and returns playback metadata.

## Commands

```bash
# Install everything
pnpm install

# Backend dev server
pnpm --filter @mindstream/backend dev

# Frontend dev server
pnpm --filter @mindstream/frontend dev

# Contracts (using Foundry)
forge build
```

## Environment variables

See `packages/backend/.env.example`. Frontend optionally uses `NEXT_PUBLIC_BACKEND_URL`.

## Envio integration sketch

1. Deploy `MindstreamThemeLogger`.
2. Run `envio init mindstream-indexer`.
3. In the schema, add the `ThemeLogged` event and map it to an entity with fields `participant`, `theme`, `prompt`, `timestamp`, `txHash`.
4. Point `graphql-request` in the frontend (placeholder for now) to the generated GraphQL endpoint for historical queries.
