import os
from threading import Thread
from flask import Flask, jsonify, request, send_from_directory

from weighted_audio_stream import WeightedStreamClient

class Server:
    def __init__(self):
        self.app = Flask(__name__, static_folder='frontend', static_url_path='')
        self.stream_id = None

        # Serve static files (e.g., index.html, JS, CSS) from the /static directory
        @self.app.route('/')
        def serve_index():
            return send_from_directory(self.app.static_folder, 'index.html')

        # Simple JSON API endpoint
        @self.app.route('/api/hello')
        def hello_world():
            return jsonify({"hello": "world"})
        

        @self.app.route('/set_stream_id', methods=['POST', 'GET'])
        def set_stream_id():
            # Accept via JSON body (POST)
            if request.method == 'POST' and request.is_json:
                data = request.get_json()
                stream_id = data.get('stream_id')

            # Accept via query parameter (GET /set_stream_id?stream_id=xyz)
            elif request.method == 'GET':
                stream_id = request.args.get('stream_id')

            if not stream_id:
                return jsonify({"error": "Missing stream_id"}), 400

            self.stream_id = stream_id

            return jsonify({"message": "Stream ID set", "stream_id": stream_id})
    
    def get_stream_id(self):
        return self.stream_id

    def run(self):
        self.app.run(host='0.0.0.0', port=8000, debug=False, use_reloader=False)

if __name__ == '__main__':
    server = Server()

    flask_thread = Thread(target=server.run)
    flask_thread.daemon = True  # ensures the thread exits when main program does
    flask_thread.start()

    # stream_id = os.getenv("DAYDREAM_STREAM_ID")

    WeightedStreamClient(
        stream_id_getter = server.get_stream_id,
        auth_key = os.getenv("DAYDREAM_API_ID")
    ).start()