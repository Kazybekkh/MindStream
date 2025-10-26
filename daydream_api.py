"""Helpers for calling the Livepeer Daydream REST API."""
from __future__ import annotations
import os
from typing import Mapping, Optional
import requests
from dotenv import find_dotenv, load_dotenv
load_dotenv(find_dotenv())
API_BASE = "https://api.daydream.live/v1/streams"
# from __future__ import annotations
# import os
# from typing import Mapping
def update_prompt(
    keyword_weights: Mapping[str, float],
    *,
    stream_id: Optional[str] = None,
    api_key: Optional[str] = None,
) -> None:
    """
    Patch the Daydream stream with a weighted keyword list.
    The API currently expects a comma-separated string of (keyword, weight) tuples.
    """
# import requests
# from dotenv import find_dotenv, load_dotenv
    stream_id = stream_id or os.getenv("DAYDREAM_STREAM_ID")
    api_key = api_key or os.getenv("DAYDREAM_API_KEY")
    if not stream_id or not api_key:
        raise RuntimeError("DAYDREAM_STREAM_ID and DAYDREAM_API_KEY must be set")
# load_dotenv(find_dotenv())
    prompt_string = ", ".join(f"({keyword}, {weight})" for keyword, weight in keyword_weights.items())
    _patch_stream(stream_id, api_key, prompt_string)
# def update_prompt(
#     keyword_weights: Mapping[str, float],
#     *,
#     stream_id: str | None = None,
#     api_key: str | None = None,
# ) -> None:
#     """
#     Patch the Daydream stream with the provided keyword weights.
def update_prompt_text(
    prompt: str,
    *,
    stream_id: Optional[str] = None,
    api_key: Optional[str] = None,
) -> None:
    """Send a raw prompt string (already formatted sentence/summary) to Daydream."""
#     Args:
#         keyword_weights: dict-like object where keys are keywords and values are weights.
#         stream_id: optional override; defaults to DAYDREAM_STREAM_ID env var.
#         api_key: optional override; defaults to DAYDREAM_API_KEY env var.
#     """
    stream_id = stream_id or os.getenv("DAYDREAM_STREAM_ID")
    api_key = api_key or os.getenv("DAYDREAM_API_KEY")
    if not stream_id or not api_key:
        raise RuntimeError("DAYDREAM_STREAM_ID and DAYDREAM_API_KEY must be set")
#     stream_id = stream_id or os.getenv("DAYDREAM_STREAM_ID")
#     api_key = api_key or os.getenv("DAYDREAM_API_KEY")
    _patch_stream(stream_id, api_key, prompt)
#     if not stream_id or not api_key:
#         raise RuntimeError("DAYDREAM_STREAM_ID and DAYDREAM_API_KEY must be set")
#     url = f"https://api.daydream.live/v1/streams/{stream_id}"
#     payload = {
#         "params": {
#             "prompt": [[keyword, weight] for keyword, weight in keyword_weights.items()]
#         }
#     }
#     headers = {
#         "Authorization": f"Bearer {api_key}",
#         "Content-Type": "application/json",
#     }
def _patch_stream(stream_id: str, api_key: str, prompt_value: str) -> None:
    url = f"{API_BASE}/{stream_id}"
    payload = {"params": {"prompt": prompt_value}}
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
#     response = requests.patch(url, json=payload, headers=headers, timeout=10)
#     response.raise_for_status()
    response = requests.patch(url, json=payload, headers=headers, timeout=10)
    response.raise_for_status()