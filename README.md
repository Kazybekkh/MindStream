# Mindstream

Mindstream listens to your speech, tracks the dominant themes, and steers Livepeer Daydream prompts in real time. The stack now focuses on the Python streaming/summary tooling and the Daydream console—on-chain contracts are archived.
This project was developed by Genki Asahi and Kazybek Khairulla. 

Hackathon DEMO - [[https://www.youtube.com/watch?v=R5AhDbXoXCo]]


## Repo layout
- `backend/` – Python package (`backend.mindstream`) with the AssemblyAI listener, Daydream API helper, local summarizer, and Flask bridge. CLI entry points live in `backend/scripts/`.
- `frontend/` – Static console for spinning up Daydream streams and registering the active stream id with the backend.
- `docs/` – Hackathon notes and prior setup guides.
- `archive/` – Legacy contracts and experimental scripts (not part of the current flow).

## Quick start
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt

# Stream mic audio, print keywords, and optionally push prompts to Daydream
python -m backend.scripts.run_audio_stream

# Use the local SLM summarizer to drive Daydream prompts
python -m backend.scripts.run_slm_bridge

# Serve the frontend + register stream ids with the backend listener
python -m backend.scripts.run_server   # open http://localhost:8000
```

## Environment
- `ASSEMBLYAI_API_KEY` – required for the audio stream client.
- `DAYDREAM_API_KEY` / `DAYDREAM_STREAM_ID` – needed when sending prompts to Livepeer Daydream.
- `SLM_MODEL_ID` – optional HF model id for the local summarizer (defaults to `sshleifer/distilbart-cnn-12-6`).

## How it works
1) **Capture**: `backend.mindstream.audio_stream.WeightedStreamClient` streams mic audio to AssemblyAI and maintains a decaying keyword queue.  
2) **Prompt updates**: the same client can push the latest summary to Daydream via `daydream_api.update_prompt_text`.  
3) **Local summarizer (optional)**: `backend.mindstream.slm_bridge.SLMSummaryBridge` batches transcripts and sends concise prompts instead of raw keywords.  
4) **Frontend**: `frontend/` spins up a Daydream stream and posts the stream id to the backend so audio-driven prompts know where to go.

Contracts for logging prompt transitions are no longer in use; the Solidity + deployment notes now live under `archive/contracts/`.
