# """
# Lightweight helper to patch Livepeer Daydream streams with weighted keywords.
# """

# from __future__ import annotations

# import os
# from typing import Mapping

# import requests
# from dotenv import find_dotenv, load_dotenv

# load_dotenv(find_dotenv())


# def update_prompt(
#     keyword_weights: Mapping[str, float],
#     *,
#     stream_id: str | None = None,
#     api_key: str | None = None,
# ) -> None:
#     """
#     Patch the Daydream stream with the provided keyword weights.

#     Args:
#         keyword_weights: dict-like object where keys are keywords and values are weights.
#         stream_id: optional override; defaults to DAYDREAM_STREAM_ID env var.
#         api_key: optional override; defaults to DAYDREAM_API_KEY env var.
#     """

#     stream_id = stream_id or os.getenv("DAYDREAM_STREAM_ID")
#     api_key = api_key or os.getenv("DAYDREAM_API_KEY")

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

#     response = requests.patch(url, json=payload, headers=headers, timeout=10)
#     response.raise_for_status()
