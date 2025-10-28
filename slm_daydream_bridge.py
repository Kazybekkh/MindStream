"""Bridge realtime transcripts to Livepeer Daydream using a local SLM."""

from __future__ import annotations

import os
import threading
from collections import deque
from typing import Deque

from dotenv import find_dotenv, load_dotenv

from daydream_api import update_prompt_text
from local_summarizer import LocalSummarizer
from weighted_audio_stream import WeightedStreamClient


class SLMSummaryBridge:
    def __init__(self, *, stream_id: str, api_key: str, interval: float = 8.0):
        self.stream_id = stream_id
        self.api_key = api_key
        self.interval = interval
        self.buffer: Deque[str] = deque(maxlen=64)
        self.stop_event = threading.Event()
        self.thread: threading.Thread | None = None
        self.summarizer = LocalSummarizer()
        self.last_prompt: str | None = None

    def start(self):
        self.thread = threading.Thread(target=self._loop, name="slm-summary", daemon=True)
        self.thread.start()

    def stop(self):
        self.stop_event.set()
        if self.thread and self.thread.is_alive():
            self.thread.join(timeout=1.0)

    def ingest(self, text: str):
        if text:
            self.buffer.append(text)

    def _loop(self):
        while not self.stop_event.wait(self.interval):
            chunk = " ".join(self.buffer).strip()
            if not chunk:
                continue
            summary = self.summarizer.summarize(chunk)
            if not summary or summary == self.last_prompt:
                continue
            try:
                update_prompt_text(summary, stream_id=self.stream_id, api_key=self.api_key)
                self.last_prompt = summary
                print(f"[slm] {summary}")
            except Exception as exc:  # noqa: BLE001
                print(f"[slm] failed to update Daydream: {exc}")


def main():
    load_dotenv(find_dotenv())
    stream_id = os.getenv("DAYDREAM_STREAM_ID")
    api_key = os.getenv("DAYDREAM_API_KEY")

    if not stream_id or not api_key:
        raise RuntimeError("DAYDREAM_STREAM_ID and DAYDREAM_API_KEY must be set.")

    bridge = SLMSummaryBridge(stream_id=stream_id, api_key=api_key)
    bridge.start()

    client = WeightedStreamClient(on_transcript=bridge.ingest, enable_daydream_updates=False)
    try:
        client.start()
    finally:
        bridge.stop()


if __name__ == "__main__":
    main()
