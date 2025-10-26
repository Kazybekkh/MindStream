# Hackathon Playbook

## Tracks

- **Livepeer Real-Time AI Video** – Showcase how Mindstream remixes Daydream prompts based on spoken themes. Demo script:
  1. Start backend + frontend.
  2. Enable webcam/mic, speak through at least two different topics.
  3. Create a new Daydream session and show the video surface updating with the evolving prompts.
- **Envio HyperIndex** – Point Envio to the `ThemeLogged` event so every prompt change is queryable with sub-second latency. Provide dashboards or the built-in GraphQL playground as part of the judging flow.

## Demo Checklist

1. **Story intro (1 min)** – Explain the concept (voice -> analyzer -> Livepeer -> Base -> Envio).
2. **Live run (3 min)** – Show the UI, waveform/prompt updates, blockchain explorer tx, and Envio query.
3. **Architecture recap (1 min)** – Reference `PROJECT_README.md` diagram and highlight how the decaying relevance model works.

## Helpful commands

```bash
pnpm --filter @mindstream/backend dev  # starts Express + sockets
pnpm --filter @mindstream/frontend dev # starts Next.js UI
forge script Deploy.s.sol --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast
envio dev --watch                       # hot-reload indexer mappings
```

## Troubleshooting tips

- **No AssemblyAI audio** – Check that the browser granted microphone access and that `ASSEMBLYAI_API_KEY` can mint realtime tokens.
- **Livepeer 401** – Regenerate the Studio API key and update the backend `.env`.
- **Envio lag** – Make sure the RPC used by the indexer is Base Sepolia and that the contract was verified so the ABI can be imported easily.
