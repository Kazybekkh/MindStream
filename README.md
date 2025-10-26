# Mindstream

Mindstream is an interactive Livepeer Daydream controller that listens to your speech, extracts the dominant theme with a decaying relevance model, pushes new prompts to Livepeer in real time, and immutably logs each transition on Base Sepolia for Envio to index.

## What’s inside

- Python utilities:
  - `weighted_audio_stream.py` – streams mic audio to AssemblyAI, keeps a decaying keyword queue, and prints the most relevant subjects every five seconds.
  - `daydream_prompt_bridge.py` – hooks the same queue into Livepeer Daydream, PATCHing prompts with the latest `(keyword, weight)` pairs.
  - `facial_emotion_detector.py` – currently stubbed out to keep dependencies light.
- `daydream_api.py` – helper for calling the Daydream REST endpoint.
- `contracts` – `MindstreamThemeLogger.sol`, plus deployment docs for logging prompt transitions on Base Sepolia.

## Quick start

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r python-requirements.txt

# run the keyword tracker
python weighted_audio_stream.py

# or stream keywords directly to Daydream
python daydream_prompt_bridge.py
```

## Environment configuration

Set the following environment variables before running the scripts:

- `ASSEMBLYAI_API_KEY` – used by the weighted stream to mint STT tokens.
- `DAYDREAM_API_KEY` and `DAYDREAM_STREAM_ID` – required by `daydream_prompt_bridge.py` / `daydream_api.py`.
- `DAYDREAM_MODEL_ID`, `DAYDREAM_STYLE` (optional) – customize the generated prompt aesthetic.

## Feature flow

1. **Capture** – `weighted_audio_stream.py` captures audio locally, forwards it to AssemblyAI, and maintains a decaying relevance queue of keywords.
2. **Prompting** – `daydream_prompt_bridge.py` converts the current keywords into the Daydream prompt format and PATCHes the live stream.
3. **On-chain logging (optional)** – `contracts/MindstreamThemeLogger.sol` records prompt transitions so Envio HyperIndex can surface a historical timeline.

## Testing & linting

- Python utilities: `source .venv/bin/activate` then run `python weighted_audio_stream.py` or `python daydream_prompt_bridge.py`. (Facial emotion detection is currently disabled to keep dependencies lean.)

## Next steps

- Reintroduce the frontend/backend stacks once ready to ship a full-stack demo.
- Build an Envio subgraph to hydrate history panels directly from `MindstreamThemeLogger`.
- Expand the Daydream prompt bridge with richer style presets, motion controls, or Envio-powered context.
