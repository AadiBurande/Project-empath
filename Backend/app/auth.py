# app/auth.py
# User authentication and authorization blueprint

from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
from functools import wraps
from pymongo import MongoClient
from bson.objectid import ObjectId

from config import JWT_SECRET_KEY, JWT_EXPIRATION_HOURS, MONGODB_URI, DB_NAME

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

def get_db():
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    return client[DB_NAME]

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header:
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
            else:
                token = auth_header
                
        if not token:
            return jsonify({'success': False, 'message': 'Token is missing'}), 401
            
        try:
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
            db = get_db()
            user = db.users.find_one({'_id': ObjectId(payload['user_id'])})
            if not user:
                return jsonify({'success': False, 'message': 'User not found'}), 401
            user['_id'] = str(user['_id'])
            user.pop('password_hash', None)
            request.current_user = user
        except jwt.ExpiredSignatureError:
            return jsonify({'success': False, 'message': 'Token has expired'}), 401
        except Exception as e:
            return jsonify({'success': False, 'message': f'Invalid token: {str(e)}'}), 401
            
        return f(*args, **kwargs)
    return decorated

def generate_token(user_id, email, role):
    payload = {
        'user_id': str(user_id),
        'email': email,
        'role': role,
        'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm='HS256')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    college = data.get('college', 'Indian Higher Education Institution')
    role = data.get('role', 'student')
    language = data.get('language', 'en')
    
    if not name or not email or not password:
        return jsonify({'success': False, 'message': 'Name, email, and password are required'}), 400
        
    try:
        db = get_db()
        existing_user = db.users.find_one({'email': email})
        if existing_user:
            return jsonify({'success': False, 'message': 'Email is already registered'}), 400
            
        password_hash = generate_password_hash(password)
        
        user_doc = {
            'name': name,
            'email': email,
            'password_hash': password_hash,
            'college': college,
            'role': role,
            'language': language,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = db.users.insert_one(user_doc)
        user_id = str(result.inserted_id)
        
        token = generate_token(user_id, email, role)
        
        user_response = {
            'id': user_id,
            'name': name,
            'email': email,
            'college': college,
            'role': role,
            'language': language
        }
        
        return jsonify({
            'success': True,
            'message': 'Registration successful',
            'token': token,
            'user': user_response
        }), 201
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required'}), 400
        
    try:
        db = get_db()
        user = db.users.find_one({'email': email})
        
        if not user or not check_password_hash(user.get('password_hash', ''), password):
            return jsonify({'success': False, 'message': 'Invalid email or password'}), 401
            
        user_id = str(user['_id'])
        token = generate_token(user_id, user['email'], user.get('role', 'student'))
        
        user_response = {
            'id': user_id,
            'name': user.get('name'),
            'email': user.get('email'),
            'college': user.get('college'),
            'role': user.get('role', 'student'),
            'language': user.get('language', 'en')
        }
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'token': token,
            'user': user_response
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_me():
    return jsonify({'success': True, 'user': request.current_user}), 200
