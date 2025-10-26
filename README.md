# Mindstream

Mindstream is a real-time Livepeer Daydream console that listens to your mic, extracts the key idea from your speech, summarizes it locally with a small language model, and continuously re-prompts the Daydream stream so the visuals mirror your conversation.

## TL;DR

- AssemblyAI realtime STT streams your voice.
- A decaying keyword tracker + sentence buffer keeps track of what you just said.
- A distilled HuggingFace model (`local_summarizer.py`) produces micro-sentences (≈2 × 5 words).
- The Daydream bridge pushes those prompts to Livepeer via the REST API.
- Optional: record the evolution on-chain with `MindstreamThemeLogger.sol`.

## Repo structure

- `weighted_audio_stream.py` – mic capture + AssemblyAI client + sentence-aware keyword tracker.
- `daydream_prompt_bridge.py` – pipes keyword snapshots into the Daydream REST API.
- `slm_daydream_bridge.py` / `local_summarizer.py` – run the on-device summarizer loop and drive Daydream with short sentences.
- `frontend/` – static dashboard (status badge, live camera vs. Daydream output, stream metadata, activity log).
- `daydream_api.py` – helpers for keyword or free-form prompt updates.
- `contracts/` – `MindstreamThemeLogger.sol` + deployment guide for Base Sepolia + Envio indexing.
- `facial_emotion_detector.py` – placeholder (disabled to keep deps light).

## Quick start

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r python-requirements.txt

# keyword tracker only
python weighted_audio_stream.py

# keywords -> Daydream
python daydream_prompt_bridge.py

# local SLM summary -> Daydream
python slm_daydream_bridge.py
```

Frontend preview:
```bash
cd frontend
npx serve .
# visit the printed localhost URL
```

## Environment

Set these variables (shell or `.env`):

- `ASSEMBLYAI_API_KEY` – realtime STT token.
- `DAYDREAM_API_KEY`, `DAYDREAM_STREAM_ID` – Livepeer Daydream auth/stream.
- `DAYDREAM_MODEL_ID`, `DAYDREAM_STYLE` (optional) – tweak Daydream aesthetics.
- `SLM_MODEL_ID` (optional) – override the summarizer model (`sshleifer/distilbart-cnn-12-6` by default).

## Flow

1. **Capture:** `weighted_audio_stream.py` opens the mic, streams PCM chunks to AssemblyAI, decays keyword weights, and builds sentence fragments.
2. **Summarize:** Every ~8 seconds, `slm_daydream_bridge.py` concatenates recent transcripts and feeds them through the local DistilBART model to get two punchy clauses.
3. **Prompt:** `daydream_api.py` PATCHes the Daydream stream with those summaries (or keyword phrases as fallback).
4. **Visualize:** The frontend shows raw webcam vs. Daydream output, plus metadata (stream ID, playback link, logs).
5. **Persist (optional):** `MindstreamThemeLogger.sol` emits `ThemeLogged` events that Envio can index for history playback.

## Testing & linting

- Python utilities: `source .venv/bin/activate && python weighted_audio_stream.py` (or whichever bridge you want to test).
- Frontend: static HTML/CSS/JS; lint manually or with your preferred tools.

## Next steps

- Swap in richer summarizer models (Flan-T5, LLaMA adapters) or plug in sentence embedding filters.
- Extend the frontend with prompt history, style presets, and on-chain timeline playback.
- Build the Envio HyperIndex integration to display the `ThemeLogged` ledger inside the console.
