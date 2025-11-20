# """
# Bridge AssemblyAI keyword queue to Livepeer Daydream streams.
# """

# from __future__ import annotations

# import os
# from typing import Sequence, Tuple

# import requests
# from dotenv import find_dotenv, load_dotenv

# from daydream_api import update_prompt
# from weighted_audio_stream import WeightedStreamClient

# load_dotenv(find_dotenv())


# class DaydreamPromptRelay:
#     """
#     Sends keyword dictionaries to the Daydream API using the shared helper.
#     """

#     def __init__(self, *, stream_id: str, api_key: str, min_weight: float = 0.2):
#         self.stream_id = stream_id
#         self.api_key = api_key
#         self.min_weight = min_weight
#         self.last_payload: Tuple[Tuple[str, float], ...] | None = None

#     def __call__(self, keywords: Sequence[Tuple[str, float]]):
#         filtered = tuple(
#             (word, round(weight, 2))
#             for word, weight in keywords
#             if weight >= self.min_weight and word
#         )
#         if not filtered or filtered == self.last_payload:
#             return

#         payload_dict = {word: weight for word, weight in filtered}
#         try:
#             update_prompt(payload_dict, stream_id=self.stream_id, api_key=self.api_key)
#             self.last_payload = filtered
#             print(f"[daydream] updated keywords: {payload_dict}")
#         except requests.RequestException as exc:
#             print(f"[daydream] failed to update stream: {exc}")


# def main():
#     #stream_id = os.getenv("DAYDREAM_STREAM_ID")
#     #api_key = os.getenv("DAYDREAM_API_KEY")
#     stream_id = "str_UX7EFXkMCtGHVyPs"
#     api_key = "sk_8FaGDNPSuVXD6vonZWGAjUDpWpCs5vvsfC6QCuquKYf1hE7Ve6FjSNFYo9JspiqN"
#     if not stream_id or not api_key:
#         raise RuntimeError("DAYDREAM_STREAM_ID and DAYDREAM_API_KEY must be set.")

#     relay = DaydreamPromptRelay(stream_id=stream_id, api_key=api_key)
#     client = WeightedStreamClient()
#     client.start()


# if __name__ == "__main__":
#     main()
