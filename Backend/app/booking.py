# app/booking.py
# Confidential Campus Counsellor Booking API Blueprint (Pillar 2)

from flask import Blueprint, request, jsonify
from datetime import datetime
from pymongo import MongoClient
from bson.objectid import ObjectId
from app.auth import token_required
from config import MONGODB_URI, DB_NAME

booking_bp = Blueprint('booking', __name__, url_prefix='/api/booking')

def get_db():
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    return client[DB_NAME]

SEED_COUNSELLORS = [
    {
        "name": "Dr. Ananya Sharma",
        "title": "Senior Clinical Psychologist",
        "department": "Student Welfare & Counseling Cell",
        "specialization": ["Academic Anxiety", "Depression", "Exam Stress"],
        "languages": ["English", "Hindi"],
        "email": "ananya.sharma@campus.edu.in",
        "available_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "time_slots": ["09:00 AM", "10:30 AM", "01:30 PM", "03:00 PM", "04:30 PM"],
        "location": "Room 204, Student Activity Centre",
        "rating": 4.9,
        "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
    },
    {
        "name": "Prof. Rajesh Kulkarni",
        "title": "Counseling Psychologist & Student Mentor",
        "department": "Department of Applied Psychology",
        "specialization": ["Placement Stress", "Burnout", "Career Guidance"],
        "languages": ["English", "Hindi", "Marathi"],
        "email": "rajesh.kulkarni@campus.edu.in",
        "available_days": ["Monday", "Wednesday", "Friday"],
        "time_slots": ["10:00 AM", "11:30 AM", "02:00 PM", "04:00 PM"],
        "location": "Room 112, Humanities Block",
        "rating": 4.8,
        "avatar_url": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150"
    },
    {
        "name": "Dr. Meera Deshmukh",
        "title": "Psychotherapist & Peer Support Coordinator",
        "department": "Campus Mental Health Center",
        "specialization": ["Relationship & Peer Issues", "Self-Esteem", "Trauma Support"],
        "languages": ["English", "Marathi"],
        "email": "meera.deshmukh@campus.edu.in",
        "available_days": ["Tuesday", "Thursday", "Saturday"],
        "time_slots": ["10:00 AM", "11:30 AM", "02:30 PM", "04:00 PM"],
        "location": "Health & Wellness Center, North Campus",
        "rating": 4.95,
        "avatar_url": "https://images.unsplash.com/photo-1594824813566-88855ce78961?w=150"
    }
]

def seed_counsellors_if_empty(db):
    if db.counsellors.count_documents({}) == 0:
        db.counsellors.insert_many(SEED_COUNSELLORS)
        print("✅ Seeded campus counsellors into MongoDB")

@booking_bp.route('/counsellors', methods=['GET'])
def get_counsellors():
    try:
        db = get_db()
        seed_counsellors_if_empty(db)
        counsellors = list(db.counsellors.find({}))
        for c in counsellors:
            c['_id'] = str(c['_id'])
        return jsonify({'success': True, 'counsellors': counsellors}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@booking_bp.route('/counsellors/<counsellor_id>', methods=['GET'])
def get_counsellor_details(counsellor_id):
    try:
        db = get_db()
        counsellor = db.counsellors.find_one({'_id': ObjectId(counsellor_id)})
        if not counsellor:
            return jsonify({'success': False, 'message': 'Counsellor not found'}), 404
        counsellor['_id'] = str(counsellor['_id'])
        return jsonify({'success': True, 'counsellor': counsellor}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@booking_bp.route('/counsellors/<counsellor_id>/slots', methods=['GET'])
def get_available_slots(counsellor_id):
    date_str = request.args.get('date', datetime.utcnow().strftime('%Y-%m-%d'))
    try:
        db = get_db()
        counsellor = db.counsellors.find_one({'_id': ObjectId(counsellor_id)})
        if not counsellor:
            return jsonify({'success': False, 'message': 'Counsellor not found'}), 404
            
        all_slots = counsellor.get('time_slots', [])
        booked_appts = list(db.appointments.find({
            'counsellor_id': counsellor_id,
            'date': date_str,
            'status': {'$in': ['confirmed', 'pending']}
        }))
        booked_slots = [a['time_slot'] for a in booked_appts]
        available_slots = [slot for slot in all_slots if slot not in booked_slots]
        
        return jsonify({
            'success': True,
            'date': date_str,
            'all_slots': all_slots,
            'available_slots': available_slots,
            'booked_slots': booked_slots
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@booking_bp.route('/appointments', methods=['POST'])
@token_required
def create_appointment():
    data = request.get_json() or {}
    counsellor_id = data.get('counsellor_id')
    date_str = data.get('date')
    time_slot = data.get('time_slot')
    notes = data.get('notes', '')
    mode = data.get('mode', 'In-Person')
    
    if not counsellor_id or not date_str or not time_slot:
        return jsonify({'success': False, 'message': 'Counsellor ID, date, and time slot are required'}), 400
        
    try:
        db = get_db()
        counsellor = db.counsellors.find_one({'_id': ObjectId(counsellor_id)})
        if not counsellor:
            return jsonify({'success': False, 'message': 'Counsellor not found'}), 404
            
        existing = db.appointments.find_one({
            'counsellor_id': counsellor_id,
            'date': date_str,
            'time_slot': time_slot,
            'status': {'$in': ['confirmed', 'pending']}
        })
        if existing:
            return jsonify({'success': False, 'message': 'This slot is already booked'}), 400
            
        user = request.current_user
        appointment_doc = {
            'student_id': user['_id'],
            'student_name': user.get('name', 'Student'),
            'student_email': user.get('email'),
            'counsellor_id': counsellor_id,
            'counsellor_name': counsellor.get('name'),
            'counsellor_title': counsellor.get('title'),
            'location': counsellor.get('location'),
            'date': date_str,
            'time_slot': time_slot,
            'mode': mode,
            'notes': notes,
            'status': 'confirmed',
            'created_at': datetime.utcnow()
        }
        
        result = db.appointments.insert_one(appointment_doc)
        appointment_doc['_id'] = str(result.inserted_id)
        
        return jsonify({'success': True, 'message': 'Appointment booked confidentially', 'appointment': appointment_doc}), 201
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@booking_bp.route('/appointments/mine', methods=['GET'])
@token_required
def get_my_appointments():
    try:
        db = get_db()
        user = request.current_user
        appointments = list(db.appointments.find({'student_id': user['_id']}).sort('created_at', -1))
        for appt in appointments:
            appt['_id'] = str(appt['_id'])
        return jsonify({'success': True, 'appointments': appointments}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@booking_bp.route('/appointments/<appointment_id>/cancel', methods=['PATCH'])
@token_required
def cancel_appointment(appointment_id):
    try:
        db = get_db()
        user = request.current_user
        appt = db.appointments.find_one({'_id': ObjectId(appointment_id), 'student_id': user['_id']})
        if not appt:
            return jsonify({'success': False, 'message': 'Appointment not found'}), 404
            
        db.appointments.update_one({'_id': ObjectId(appointment_id)}, {'$set': {'status': 'cancelled', 'updated_at': datetime.utcnow()}})
        return jsonify({'success': True, 'message': 'Appointment cancelled successfully'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
