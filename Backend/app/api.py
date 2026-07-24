# app/api.py
# Main Flask-SocketIO Backend Application for Project Empath

from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import os
import sys
import tempfile
import base64
import binascii
from datetime import datetime
from pymongo import MongoClient

# Add project root to path
project_root = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Import AI modules
from core.text_analyzer import TextAnalyzer
from core.audio_analyzer import AudioAnalyzer
from core.facial_analyzer import FacialAnalyzer
from core.fusion_engine import fuse_emotions_numpy
from core.response_generator import ResponseGenerator
from core.therapist_service import therapist_service

from config import (
    GEMINI_API_KEY, SOCKETIO_BUFFER_SIZE, SOCKETIO_CORS_ALLOWED_ORIGINS,
    MONGODB_URI, DB_NAME
)

# Import API Blueprints (5 Pillars)
from app.auth import auth_bp
from app.booking import booking_bp
from app.resources import resources_bp
from app.community import community_bp
from app.admin import admin_bp

# ===== SETUP FLASK APP =====
app = Flask(__name__)
app.config['SECRET_KEY'] = 'empath-ai-secret-key-2026'

# Enable CORS for React frontend
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Register Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(booking_bp)
app.register_blueprint(resources_bp)
app.register_blueprint(community_bp)
app.register_blueprint(admin_bp)

# Configure SocketIO
socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    max_http_buffer_size=SOCKETIO_BUFFER_SIZE
)

# ===== INITIALIZE AI MODULES =====
print("\n" + "="*60)
print("🚀 INITIALIZING EMPATH AI BACKEND & 5-PILLAR SYSTEM")
print("="*60 + "\n")

text_analyzer = TextAnalyzer()
audio_analyzer = AudioAnalyzer()
facial_analyzer = FacialAnalyzer()
response_generator = ResponseGenerator()

print("\n" + "="*60)
print("✅ ALL MODULES & BLUEPRINTS INITIALIZED SUCCESSFULLY")
print("="*60 + "\n")

# ===== HELPER FUNCTIONS =====
def pad_base64(data):
    missing_padding = len(data) % 4
    if missing_padding:
        data += '=' * (4 - missing_padding)
    return data

def log_mood_session(dominant_emotion, fused_scores, session_type='text'):
    try:
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=2000)
        db = client[DB_NAME]
        db.mood_logs.insert_one({
            'dominant_emotion': dominant_emotion,
            'fused_scores': fused_scores,
            'session_type': session_type,
            'timestamp': datetime.utcnow()
        })
    except Exception as e:
        print(f"⚠️ Error logging mood: {e}")

# ===== ROUTES =====
@app.route('/health')
def health():
    return {
        'status': 'ok',
        'message': 'Project Empath Backend API is running',
        'pillars': ['AI-Guided Triage', 'Confidential Booking', 'Resource Hub', 'Peer Forum', 'Admin Dashboard']
    }

# ===== SOCKETIO EVENT HANDLERS =====
@socketio.on('connect')
def handle_connect():
    print(f"\n✅ Client connected with session ID: {request.sid}")
    emit('ai_response', {'text': '👋 Welcome to Empath. I\'m here to listen and support you.'})

@socketio.on('disconnect')
def handle_disconnect():
    print(f"❌ Client disconnected with session ID: {request.sid}\n")

@socketio.on('session_start')
def handle_session_start(data):
    mode = data.get('mode', 'text')
    print(f"\n🎯 New session started in '{mode}' mode.")
    emit('ai_response', {
        'text': "I'm here and ready to listen whenever you're ready to share."
    })

@socketio.on('text_input')
def handle_text_input(data):
    user_text = data.get('text', '').strip()
    image_b64 = data.get('image')

    if not user_text:
        return

    print(f"\n--- 📝 TEXT INPUT MODE ---")
    print(f"User text: '{user_text}'")

    text_emotion = text_analyzer.analyze_text_emotion(user_text)
    print(f"📊 Text emotion: {text_emotion}")

    facial_emotion = {}
    if image_b64:
        try:
            image_data = pad_base64(image_b64.split(',')[1])
            image_bytes = base64.b64decode(image_data)
            facial_emotion = facial_analyzer.analyze_frame_from_bytes(image_bytes)
            print(f"😊 Facial emotion: {facial_emotion}")
        except Exception as e:
            print(f"⚠️ Error processing facial image: {e}")

    predictions_to_fuse = {'text': text_emotion, 'face': facial_emotion}
    fusion_weights = {'text': 0.7, 'face': 0.3}
    fused_emotion = fuse_emotions_numpy(predictions_to_fuse, fusion_weights)
    dominant_emotion = max(fused_emotion, key=fused_emotion.get) if fused_emotion else "neutral"

    print(f"🎨 Fused emotion: {dominant_emotion}")

    ai_response = response_generator.generate_response(
        dominant_emotion,
        fused_emotion,
        user_text
    )
    print(f"🤖 AI Response: {ai_response}\n")

    log_mood_session(dominant_emotion, fused_emotion, session_type='text')

    emit('analysis_result', {
        'transcribed_text': user_text,
        'ai_response': ai_response,
        'dominant_emotion': dominant_emotion,
        'text_emotion': text_emotion, 
        'fused_scores': fused_emotion
    })

@socketio.on('stream')
def handle_stream(data):
    audio_b64 = data.get('audio')
    image_b64 = data.get('image')

    if not audio_b64 or not image_b64:
        print("⚠️ Incomplete stream data received")
        return

    try:
        audio_data_padded = pad_base64(audio_b64)
        image_data_padded = pad_base64(image_b64.split(',')[1])

        audio_bytes = base64.b64decode(audio_data_padded)
        image_bytes = base64.b64decode(image_data_padded)

    except binascii.Error as e:
        print(f"❌ Base64 decoding error: {e}")
        return

    temp_dir = tempfile.gettempdir()
    temp_audio_path = os.path.join(temp_dir, f"stream_audio_{request.sid}.webm")

    with open(temp_audio_path, 'wb') as f_audio:
        f_audio.write(audio_bytes)

    print(f"\n--- 🎤 VOICE MODE ---")
    print(f"Audio saved: {temp_audio_path} ({len(audio_bytes)} bytes)")

    facial_emotion = facial_analyzer.analyze_frame_from_bytes(image_bytes)
    print(f"😊 Facial analysis: {facial_emotion}")

    transcribed_text = text_analyzer.transcribe_audio(temp_audio_path)
    print(f"🎙️ Transcription: '{transcribed_text}'")

    if not transcribed_text or not transcribed_text.strip():
        print("⚠️ No speech detected in audio")
        emit('analysis_result', {
            'transcribed_text': '',
            'dominant_emotion': 'neutral',
            'ai_response': "I didn't quite catch that. Could you please say it again?"
        })
        if os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)
        return

    text_emotion = text_analyzer.analyze_text_emotion(transcribed_text)
    print(f"📊 Text emotion: {text_emotion}")

    prosody_emotion = audio_analyzer.analyze_prosody(temp_audio_path)
    print(f"🎵 Prosody analysis: {prosody_emotion}")

    predictions_to_fuse = {
        'text': text_emotion,
        'prosody': prosody_emotion,
        'face': facial_emotion
    }
    fusion_weights = {
        'text': 0.5,
        'face': 0.3,
        'prosody': 0.2
    }
    fused_emotion = fuse_emotions_numpy(predictions_to_fuse, fusion_weights)
    dominant_emotion = max(fused_emotion, key=fused_emotion.get) if fused_emotion else "neutral"

    print(f"🎨 Fused emotion: {dominant_emotion}")

    ai_response = response_generator.generate_response(
        dominant_emotion,
        fused_emotion,
        transcribed_text
    )
    print(f"🤖 AI Response: {ai_response}\n")

    log_mood_session(dominant_emotion, fused_emotion, session_type='voice')

    emit('analysis_result', {
        'transcribed_text': transcribed_text,
        'dominant_emotion': dominant_emotion,
        'ai_response': ai_response,
        'fused_scores': fused_emotion
    })

    if os.path.exists(temp_audio_path):
        os.remove(temp_audio_path)

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("Starting Empath AI Backend Server on Port 5000...")
    socketio.run(app, debug=True, host='0.0.0.0', port=5000, use_reloader=False)
