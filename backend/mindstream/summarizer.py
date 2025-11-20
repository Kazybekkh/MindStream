"""
Local SLM-based summarizer built on Hugging Face transformers.

Usage:
    from local_summarizer import LocalSummarizer
    summarizer = LocalSummarizer()
    summary = summarizer.summarize("long transcript text ...")
"""

from __future__ import annotations

import os
from functools import lru_cache
from typing import Optional

import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer


@lru_cache(maxsize=1)
def _load_tokenizer(model_id: str):
    return AutoTokenizer.from_pretrained(model_id)


@lru_cache(maxsize=1)
def _load_model(model_id: str):
    return AutoModelForSeq2SeqLM.from_pretrained(model_id)


class LocalSummarizer:
    """
    Thin wrapper over a seq2seq model (default: DistilBART CNN) for fast local summaries.
    """

    def __init__(
        self,
        model_id: Optional[str] = None,
        max_input_tokens: int = 768,
        max_new_tokens: int = 80,
        device: Optional[str] = None,
    ):
        self.model_id = model_id or os.getenv("SLM_MODEL_ID", "sshleifer/distilbart-cnn-12-6")
        self.max_input_tokens = max_input_tokens
        self.max_new_tokens = max_new_tokens

        self.tokenizer = _load_tokenizer(self.model_id)
        self.model = _load_model(self.model_id)

        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(self.device)
        self.model.eval()

    def summarize(self, text: str, prefix: str = "Summarize in 2 short phrases: ") -> str:
        if not text.strip():
            return ""

        prompt = f"{prefix}{text.strip()}"
        encoded = self.tokenizer(
            prompt,
            truncation=True,
            max_length=self.max_input_tokens,
            return_tensors="pt",
        )
        encoded = {k: v.to(self.device) for k, v in encoded.items()}

        with torch.no_grad():
            output_ids = self.model.generate(
                **encoded,
                do_sample=False,
                num_beams=4,
                max_new_tokens=self.max_new_tokens,
                length_penalty=1.0,
            )

        summary = self.tokenizer.decode(output_ids[0], skip_special_tokens=True)
        return self._condense(summary)

    @staticmethod
    def _condense(summary: str) -> str:
        """Trim the model output down to two micro-sentences (~5 words each)."""
        if not summary:
            return ""

        sentences = [chunk.strip() for chunk in summary.replace("?", ".").replace("!", ".").split(".") if chunk.strip()]
        trimmed = []
        for sentence in sentences:
            words = sentence.split()
            if not words:
                continue
            trimmed.append(" ".join(words[:5]))
            if len(trimmed) == 2:
                break

        if not trimmed:
            return ""
        return ". ".join(trimmed).strip() + "."


if __name__ == "__main__":
    import sys

    sample_text = (
        " ".join(sys.argv[1:]) or "Mindstream listens to speech, finds the dominant theme, and steers Livepeer Daydream visuals accordingly."
    )
    summarizer = LocalSummarizer()
    print(summarizer.summarize(sample_text))
