from flask import Flask, request, jsonify, send_from_directory
from threading import Thread

from weighted_audio_stream import WeightedStreamClient

class Server:

    def get_stream_id(self):
        return self.stream_id

    def __init__(self):
        self.app = Flask(__name__, static_folder='frontend', static_url_path='')

        # Variable to store the stream_id
        self.stream_id = None

        # Serve static files (e.g., index.html, JS, CSS) from the /static directory
        @self.app.route('/')
        def serve_index():
            return send_from_directory(self.app.static_folder, 'index.html')

        @self.app.route('/api/hello')
        def hello():
            return jsonify({"hello": "world"})

        @self.app.route('/set_stream_id', methods=['POST', 'GET'])
        def set_stream_id():
            global stream_id

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

    def run_flask(self):
        self.app.run(host='0.0.0.0', port=8000, debug=False, use_reloader=False)

if __name__ == "__main__":
    server = Server()
    # Start Flask in background thread
    thread = Thread(target=server.run_flask)
    thread.daemon = True
    thread.start()

    WeightedStreamClient(server.get_stream_id).start()