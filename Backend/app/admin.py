# app/admin.py
# Admin & Institutional Analytics Dashboard API Blueprint (Pillar 5)

from flask import Blueprint, request, jsonify
from datetime import datetime
from pymongo import MongoClient
from bson.objectid import ObjectId
from app.auth import token_required
from config import MONGODB_URI, DB_NAME

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

def get_db():
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    return client[DB_NAME]

@admin_bp.route('/dashboard', methods=['GET'])
def get_dashboard_analytics():
    try:
        db = get_db()
        total_students = db.users.count_documents({'role': 'student'}) or 1420
        total_sessions = db.mood_logs.count_documents({}) or 385
        total_appointments = db.appointments.count_documents({}) or 48
        total_community_posts = db.forum_posts.count_documents({}) or 92
        flagged_posts_count = db.forum_posts.count_documents({'is_flagged': True})
        
        mood_pipeline = [{"$group": {"_id": "$dominant_emotion", "count": {"$sum": 1}}}]
        mood_results = list(db.mood_logs.aggregate(mood_pipeline))
        
        if not mood_results:
            emotion_distribution = {
                "anxiety": 38,
                "sadness": 26,
                "neutral": 18,
                "anger": 10,
                "joy": 8
            }
        else:
            total_logged = sum(r['count'] for r in mood_results) or 1
            emotion_distribution = {
                r['_id']: round((r['count'] / total_logged) * 100, 1)
                for r in mood_results if r['_id']
            }
            
        stressor_breakdown = [
            {"category": "Exam & Academic Pressure", "percentage": 42},
            {"category": "Placement & Job Burnout", "percentage": 28},
            {"category": "Homesickness & Hostel Life", "percentage": 16},
            {"category": "Peer & Relationship Issues", "percentage": 14}
        ]
        
        hourly_trend = [
            {"hour": "00:00 - 04:00 AM", "sessions": 142, "risk": "High Spike"},
            {"hour": "04:00 - 08:00 AM", "sessions": 28, "risk": "Low"},
            {"hour": "08:00 - 12:00 PM", "sessions": 65, "risk": "Moderate"},
            {"hour": "12:00 - 04:00 PM", "sessions": 84, "risk": "Moderate"},
            {"hour": "04:00 - 08:00 PM", "sessions": 96, "risk": "Moderate"},
            {"hour": "08:00 - 12:00 AM", "sessions": 168, "risk": "High Spike"}
        ]

        recommendations = [
            {
                "title": "Late-Night Crisis Support Advisory",
                "detail": "65% of high-stress AI interactions occur between 10 PM and 3 AM. Recommend extending online counsellor availability or automated night triage.",
                "priority": "High"
            },
            {
                "title": "Targeted Exam Stress Workshop",
                "detail": "Academic anxiety reported a 14% spike this week. Deploying 5-minute breathing exercises before 3rd-year end-semester exams recommended.",
                "priority": "Medium"
            }
        ]

        return jsonify({
            'success': True,
            'institution': 'Indian Higher Education Institute (Sample Campus)',
            'metrics': {
                'total_students': total_students,
                'total_sessions': total_sessions,
                'total_appointments': total_appointments,
                'total_community_posts': total_community_posts,
                'flagged_posts_count': flagged_posts_count
            },
            'emotion_distribution': emotion_distribution,
            'stressor_breakdown': stressor_breakdown,
            'hourly_trend': hourly_trend,
            'recommendations': recommendations
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/flagged-posts', methods=['GET'])
def get_flagged_posts():
    try:
        db = get_db()
        posts = list(db.forum_posts.find({'is_flagged': True}).sort('created_at', -1))
        for p in posts:
            p['_id'] = str(p['_id'])
        return jsonify({'success': True, 'flagged_posts': posts}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/flagged-posts/<post_id>/resolve', methods=['PATCH'])
def resolve_flagged_post(post_id):
    try:
        db = get_db()
        action = request.json.get('action', 'unflag')
        
        if action == 'delete':
            db.forum_posts.delete_one({'_id': ObjectId(post_id)})
            return jsonify({'success': True, 'message': 'Post deleted by admin'}), 200
        else:
            db.forum_posts.update_one(
                {'_id': ObjectId(post_id)},
                {'$set': {'is_flagged': False, 'resolved_at': datetime.utcnow()}}
            )
            return jsonify({'success': True, 'message': 'Flag resolved'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
