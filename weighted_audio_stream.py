"""
Weighted keyword streaming demo.

This script mirrors `testaudio.py` by connecting to AssemblyAI's streaming API,
but instead of printing every transcript chunk it keeps a decaying queue of the
most relevant keywords being spoken and only emits those.
"""

import json
import os
import re
import threading
import time
from collections import deque
from datetime import datetime
from typing import Callable, Deque, Dict, List, Optional, Tuple
from urllib.parse import urlencode

import pyaudio
import websocket
from dotenv import find_dotenv, load_dotenv
import requests

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

CONNECTION_PARAMS = {"sample_rate": 16000, "format_turns": True}
API_ENDPOINT_BASE_URL = "wss://streaming.assemblyai.com/v3/ws"
API_ENDPOINT = f"{API_ENDPOINT_BASE_URL}?{urlencode(CONNECTION_PARAMS)}"

FRAMES_PER_BUFFER = 800  # 50ms @16kHz
SAMPLE_RATE = CONNECTION_PARAMS["sample_rate"]
CHANNELS = 1
FORMAT = pyaudio.paInt16

load_dotenv(find_dotenv())
API_KEY = os.getenv("API_KEY")
DAYDREAM_STREAM_ID = os.getenv("DAYDREAM_STREAM_ID")
DAYDREAM_API_KEY = os.getenv("DAYDREAM_API_KEY") or os.getenv("DAYDREAM_API_ID")

# ---------------------------------------------------------------------------
# Keyword momentum tracker
# ---------------------------------------------------------------------------

STOPWORDS = {
    "the",
    "a",
    "an",
    "and",
    "or",
    "is",
    "are",
    "am",
    "was",
    "were",
    "but",
    "that",
    "this",
    "to",
    "in",
    "of",
    "on",
    "it",
    "for",
    "with",
    "as",
    "be",
    "by",
    "at",
    "from",
    "so",
    "we",
    "you",
    "i",
}


class KeywordMomentumTracker:
    """
    Maintains a weighted queue of keywords with exponential decay so the UI
    focuses on the most recent, most repeated ideas instead of raw transcript text.
    """

    WORD_PATTERN = re.compile(r"[a-zA-Z0-9']+")

    def __init__(self, max_keywords: int = 8, halflife_seconds: float = 20.0, decay_floor: float = 0.05):
        self.max_keywords = max_keywords
        self.halflife = halflife_seconds
        self.decay_floor = decay_floor
        self.weights: Dict[str, float] = {}
        self.last_timestamp = time.time()
        self.last_emitted: Deque[Tuple[str, float]] = deque()

    def ingest(self, text: str, now: float | None = None) -> Deque[Tuple[str, float]]:
        if not text:
            return self.last_emitted

        current_time = now or time.time()
        self._decay(current_time)

        for token in self._tokenize(text):
            self.weights[token] = self.weights.get(token, 0.0) + 1.0

        self.last_emitted = self._top_keywords()
        return self.last_emitted

    def _decay(self, current_time: float) -> None:
        elapsed = current_time - self.last_timestamp
        if elapsed <= 0:
            return

        decay_factor = 0.1 ** (elapsed / self.halflife)
        stale_keys = []
        for word, weight in self.weights.items():
            decayed = weight * decay_factor
            if decayed <= self.decay_floor:
                stale_keys.append(word)
            else:
                self.weights[word] = decayed

        for key in stale_keys:
            self.weights.pop(key, None)

        self.last_timestamp = current_time

    def _tokenize(self, text: str) -> List[str]:
        tokens = []
        for match in self.WORD_PATTERN.findall(text.lower()):
            if len(match) < 3 or match in STOPWORDS:
                continue
            tokens.append(match)
        return tokens

    def current_keywords(self) -> Deque[Tuple[str, float]]:
        """
        Returns the latest ordered keywords without mutating internal weights.
        """
        if not self.last_emitted:
            self.last_emitted = self._top_keywords()
        return self.last_emitted

    def _top_keywords(self) -> Deque[Tuple[str, float]]:
        return deque(sorted(self.weights.items(), key=lambda item: item[1], reverse=True)[: self.max_keywords])


# ---------------------------------------------------------------------------
# Streaming client
# ---------------------------------------------------------------------------

class WeightedStreamClient:
    def __init__(self, stream_id_provider: Optional[Callable[[], Optional[str]]] = None):
        self.audio = None
        self.stream = None
        self.ws_app = None
        self.audio_thread = None
        self.refresh_thread = None
        self.stop_event = threading.Event()
        self.tracker = KeywordMomentumTracker()
        self.last_printed: Tuple[str, ...] | None = None
        self.refresh_interval = 5.0
        self.pending_text = ""
        self.latest_sentence_summary = ""
        self.stream_id_provider = stream_id_provider
        self.default_stream_id = DAYDREAM_STREAM_ID
        self.daydream_key = DAYDREAM_API_KEY
        self._missing_stream_warning_emitted = False

    def start(self):
        if not API_KEY:
            raise RuntimeError("API_KEY missing. Please set it in your environment.")
        if not self.daydream_key:
            raise RuntimeError("DAYDREAM_API_KEY missing. Please set it in your environment.")

        self.audio = pyaudio.PyAudio()
        try:
            self.stream = self.audio.open(
                input=True,
                frames_per_buffer=FRAMES_PER_BUFFER,
                channels=CHANNELS,
                format=FORMAT,
                rate=SAMPLE_RATE,
            )
            print("Microphone stream ready. Speak to discover the dominant keywords.")
        except Exception as exc:
            if self.audio:
                self.audio.terminate()
            raise RuntimeError(f"Unable to open microphone: {exc}") from exc

        self.ws_app = websocket.WebSocketApp(
            API_ENDPOINT,
            header={"Authorization": API_KEY},
            on_open=self._on_open,
            on_message=self._on_message,
            on_error=self._on_error,
            on_close=self._on_close,
        )

        ws_thread = threading.Thread(target=self.ws_app.run_forever, name="assemblyai-ws")
        ws_thread.daemon = True
        ws_thread.start()

        self.refresh_thread = threading.Thread(target=self._emit_loop, name="keyword-refresh", daemon=True)
        self.refresh_thread.start()

        try:
            while ws_thread.is_alive():
                time.sleep(0.1)
        except KeyboardInterrupt:
            self.stop_event.set()
            print("\nStopping stream...")
            if self.ws_app and self.ws_app.sock and self.ws_app.sock.connected:
                try:
                    self.ws_app.send(json.dumps({"type": "Terminate"}))
                    time.sleep(1)
                except Exception as exc:  # noqa: BLE001
                    print(f"Error sending terminate message: {exc}")
            if self.ws_app:
                self.ws_app.close()
            ws_thread.join(timeout=2.0)
        finally:
            self._cleanup()

    # ------------------------------------------------------------------
    # WebSocket callbacks
    # ------------------------------------------------------------------

    def _on_open(self, ws):
        print("Connected to AssemblyAI streaming endpoint.")

        def stream_audio():
            while not self.stop_event.is_set():
                try:
                    audio_chunk = self.stream.read(FRAMES_PER_BUFFER, exception_on_overflow=False)
                    ws.send(audio_chunk, opcode=websocket.ABNF.OPCODE_BINARY)
                except Exception as exc:  # noqa: BLE001
                    print(f"Audio streaming error: {exc}")
                    break

        self.audio_thread = threading.Thread(target=stream_audio, name="audio-stream", daemon=True)
        self.audio_thread.start()

    def _on_message(self, _ws, message):
        try:
            payload = json.loads(message)
        except json.JSONDecodeError:
            return

        msg_type = payload.get("type")

        if msg_type == "Begin":
            session_id = payload.get("id")
            expires_at = payload.get("expires_at")
            print(
                f"Session started ({session_id}), expires at {datetime.fromtimestamp(expires_at)}."
            )
            return

        if msg_type != "Turn":
            return

        transcript = payload.get("transcript") or ""
        if not transcript.strip():
            return

        self.tracker.ingest(transcript)
        self._ingest_sentence(transcript)

    def _on_error(self, _ws, error):
        print(f"WebSocket error: {error}")
        self.stop_event.set()

    def _on_close(self, _ws, status, msg):
        print(f"WebSocket closed. status={status}, msg={msg}")
        self.stop_event.set()
        if self.audio_thread and self.audio_thread.is_alive():
            self.audio_thread.join(timeout=1.0)

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _cleanup(self):
        self.stop_event.set()
        if self.refresh_thread and self.refresh_thread.is_alive():
            self.refresh_thread.join(timeout=1.0)
        if self.stream:
            if self.stream.is_active():
                self.stream.stop_stream()
            self.stream.close()
        if self.audio:
            self.audio.terminate()
        print("Clean exit.")

    def _emit_loop(self):
        while not self.stop_event.is_set():
            keywords = tuple(self.tracker.current_keywords())
            snapshot = tuple(f"({word}, {weight:.2f})" for word, weight in keywords)
            if snapshot and snapshot != self.last_printed:
                self.last_printed = snapshot
                phrase = self.latest_sentence_summary or self._keywords_to_phrase(keywords)
                if phrase:
                    print(f"[summary] {phrase}")
                formatted = ", ".join(snapshot)
                print(f"[keywords] {formatted}")
                stream_id = self._resolve_stream_id()
                if not stream_id:
                    self.stop_event.wait(self.refresh_interval)
                    continue
                try:
                    update_prompt(stream_id, self.daydream_key, phrase or formatted)
                except requests.RequestException as exc:
                    print(f"[daydream] failed to update stream: {exc}")
            elif not snapshot and self.last_printed:
                self.last_printed = ()
                print("[keywords] (listening)")
            self.stop_event.wait(self.refresh_interval)
        print("Keyword emitter stopped.")

    def _resolve_stream_id(self) -> Optional[str]:
        stream_id = self.stream_id_provider() if self.stream_id_provider else self.default_stream_id
        if stream_id:
            if self._missing_stream_warning_emitted:
                print(f"[daydream] using stream {stream_id}")
                self._missing_stream_warning_emitted = False
            return stream_id
        if not self._missing_stream_warning_emitted:
            print("[daydream] waiting for stream id from frontend...")
            self._missing_stream_warning_emitted = True
        return None

    def _ingest_sentence(self, text: str):
        fragment = text.strip()
        if not fragment:
            return
        if self.pending_text:
            self.pending_text += " "
        self.pending_text += fragment

        sentences = re.split(r"(?<=[.!?])\s+", self.pending_text)
        if len(sentences) <= 1:
            return

        # keep last unfinished fragment
        self.pending_text = sentences[-1]
        for sentence in sentences[:-1]:
            summary = self._sentence_summary(sentence)
            if summary:
                self.latest_sentence_summary = summary

    def _sentence_summary(self, sentence: str) -> str:
        words = []
        for token in KeywordMomentumTracker.WORD_PATTERN.findall(sentence.lower()):
            if len(token) <= 2 or token in STOPWORDS:
                continue
            if token not in words:
                words.append(token)
            if len(words) == 6:
                break
        if not words:
            return ""
        primary = " ".join(words[:3])
        secondary = " ".join(words[3:6])
        if secondary:
            return f"{primary}. {secondary}"
        return primary

    @staticmethod
    def _keywords_to_phrase(keywords: Tuple[Tuple[str, float], ...]) -> str:
        words = []
        for word, _ in keywords:
            if len(word) <= 3:
                continue
            if word not in words:
                words.append(word)
            if len(words) == 5:
                break
        if not words:
            return ""
        return " ".join(words).strip()

def update_prompt(stream_id: str, auth_key: str, prompt: str) -> None:
    if not stream_id:
        raise ValueError("stream_id is required to update Daydream")
    if not auth_key:
        raise ValueError("Daydream API key missing")
    url = f"https://api.daydream.live/v1/streams/{stream_id}"

    payload = {
        "params": {
            # "prompt": [[keyword, weight] for keyword, weight in list(prompt.items())]
            "prompt": prompt
        }
    }
    headers = {
        "Authorization": f"Bearer {auth_key}",
        "Content-Type": "application/json"
    }

    response = requests.patch(url, json=payload, headers=headers, timeout=10)
    response.raise_for_status()
