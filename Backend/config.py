# config.py - Backend Configuration
import os
from dotenv import load_dotenv

load_dotenv()

# ===== API KEYS =====
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
GOOGLE_PLACES_API_KEY = os.getenv('GOOGLE_PLACES_API_KEY', '')

# ===== MODEL PATHS =====
CUSTOM_TEXT_MODEL_PATH = os.getenv('CUSTOM_TEXT_MODEL_PATH', 'models/text_emotion_model')
CUSTOM_AUDIO_MODEL_PATH = os.getenv('CUSTOM_AUDIO_MODEL_PATH', 'models/audio_emotion_model.pkl')
TEXT_EMOTION_MODEL = os.getenv('TEXT_EMOTION_MODEL', 'bhadresh-savani/distilbert-base-uncased-emotion')

# ===== MODEL SETTINGS =====
WHISPER_MODEL = "small"
GEMINI_TEMPERATURE = 0.9
GEMINI_MAX_TOKENS = 2048

# ===== FACE DETECTION SETTINGS =====
FACE_DETECTION_SCALE = 1.1
FACE_DETECTION_MIN_NEIGHBORS = 5
FACE_RESIZE_SIZE = (300, 300)

# ===== SERVER SETTINGS =====
SERVER_HOST = '0.0.0.0'
SERVER_PORT = 5000
DEBUG = True

# ===== LANGUAGE SUPPORT =====
SUPPORTED_LANGUAGES = {
    'en': 'English',
    'hi': 'हिंदी',
    'mr': 'मराठी'
}

# ===== CRISIS HELPLINES =====
CRISIS_HELPLINES = {
    'IN': {
        'name': 'AASRA - आसरा (India)',
        'number': '9820466726',
        'description': 'Suicide prevention helpline',
        'hours': '24/7',
        'languages': ['Hindi', 'English']
    },
    'IN_iCall': {
        'name': 'iCall (India)',
        'number': '9152987821',
        'description': 'Emotional support & crisis intervention',
        'hours': '9:30 AM - 9:30 PM',
        'languages': ['Hindi', 'English', 'Marathi']
    },
    'IN_VANDREVALA': {
        'name': 'Vandrevala Foundation (India)',
        'number': '9999 666 555',
        'description': 'Mental health crisis support',
        'hours': '24/7',
        'languages': ['Hindi', 'English']
    },
    'INTERNATIONAL': {
        'name': 'Global Crisis Helplines',
        'url': 'findahelpline.com',
        'description': 'Find helplines by country'
    }
}

# ===== AI SOLUTION PROMPTS =====
AI_SOLUTION_PROMPTS = {
    'sadness': {
        'en': 'You seem sad. Try: 1) Deep breathing 2) Activity you enjoy 3) Reach out to someone',
        'hi': 'आप उदास हैं। करें: 1) गहरी सांस 2) पसंदीदा काम 3) किसी से बात करें',
        'mr': 'आप उदास आहात. करा: 1) गहरी श्वास 2) पसंदीचे काम 3) किणाशी बोला'
    },
    'anxiety': {
        'en': 'You seem anxious. Try: 1) 5-4-3-2-1 grounding 2) Meditation 3) Walk',
        'hi': 'आप चिंतित हैं। करें: 1) 5-4-3-2-1 तकनीक 2) ध्यान 3) टहलना',
        'mr': 'आप चिंतीत आहात. करा: 1) 5-4-3-2-1 तंत्र 2) ध्यान 3) टहल'
    }
}

# ===== SOCKETIO SETTINGS =====
SOCKETIO_BUFFER_SIZE = 10000000
SOCKETIO_CORS_ORIGINS = "*"
SOCKETIO_CORS_ALLOWED_ORIGINS = SOCKETIO_CORS_ORIGINS

# ===== JWT & AUTHENTICATION SETTINGS =====
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'empath-jwt-secret-key-2026')
JWT_EXPIRATION_HOURS = 24

# ===== DATABASE SETTINGS =====
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://127.0.0.1:27017/empath_db')
DB_NAME = 'empath_db'
