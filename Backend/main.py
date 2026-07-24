# main.py
# Entry point for Project Empath Backend API Server

import sys
import os

# Add project root to path
project_root = os.path.abspath(os.path.dirname(__file__))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Import Flask app and SocketIO
from app.api import app, socketio

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 STARTING EMPATH AI BACKEND SERVER")
    print("="*60)
    print("\n📍 API Server running at: http://localhost:5000")
    print("   Press Ctrl+C to stop the server\n")
    
    # Run SocketIO server (headless API mode)
    socketio.run(
        app,
        debug=True,
        host='0.0.0.0',
        port=5000,
        use_reloader=False,
        allow_unsafe_werkzeug=True
    )
