from __future__ import annotations

import logging
from threading import Lock, Thread
from typing import Optional

from flask import Flask, jsonify, request, send_from_directory

from weighted_audio_stream import WeightedStreamClient


class StreamRegistry:
    """Thread-safe holder for the active Daydream stream id."""

    def __init__(self, initial: Optional[str] = None):
        self._stream_id = initial
        self._lock = Lock()

    def set(self, stream_id: Optional[str]) -> None:
        with self._lock:
            self._stream_id = stream_id

    def get(self) -> Optional[str]:
        with self._lock:
            return self._stream_id


def create_app(registry: StreamRegistry) -> Flask:
    app = Flask(__name__, static_folder="frontend", static_url_path="")

    @app.route("/")
    def serve_index() -> str:
        return send_from_directory(app.static_folder, "index.html")

    @app.route("/<path:path>")
    def serve_static(path: str):
        return send_from_directory(app.static_folder, path)

    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok"})

    @app.route("/api/stream-id", methods=["GET", "POST"])
    def stream_id():
        if request.method == "GET":
            current = registry.get()
            if not current:
                return jsonify({"stream_id": None}), 404
            return jsonify({"stream_id": current})

        payload = request.get_json(silent=True) or {}
        stream_id_value = payload.get("stream_id")
        if not stream_id_value:
            return jsonify({"error": "stream_id is required"}), 400

        registry.set(stream_id_value)
        return jsonify({"stream_id": stream_id_value})

    return app


def run_server(app: Flask) -> None:
    app.run(host="0.0.0.0", port=8000, debug=False, use_reloader=False)


def main() -> None:
    logging.basicConfig(level=logging.INFO)
    registry = StreamRegistry()
    app = create_app(registry)

    flask_thread = Thread(target=run_server, args=(app,), daemon=True)
    flask_thread.start()

    client = WeightedStreamClient(stream_id_provider=registry.get)
    client.start()


if __name__ == "__main__":
    main()
