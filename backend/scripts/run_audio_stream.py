"""CLI entry point for the keyword-driven audio stream client."""

from backend.mindstream.audio_stream import WeightedStreamClient


def main() -> None:
    WeightedStreamClient().start()


if __name__ == "__main__":
    main()
