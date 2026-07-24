# app/resources.py
# Psychoeducational Resource Hub API Blueprint (Pillar 3)

from flask import Blueprint, request, jsonify
from datetime import datetime
from pymongo import MongoClient
from bson.objectid import ObjectId
from config import MONGODB_URI, DB_NAME

resources_bp = Blueprint('resources', __name__, url_prefix='/api/resources')

def get_db():
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    return client[DB_NAME]

SEED_RESOURCES = [
    {
        "title": "5-4-3-2-1 Grounding Technique for Exam Anxiety",
        "description": "A quick 5-minute sensory grounding technique to instantly reduce panic and exam pressure.",
        "category": "Grounding",
        "content_type": "exercise",
        "language": "en",
        "tags": ["Exam Stress", "Anxiety", "Quick Relief"],
        "read_time_minutes": 5,
        "content": "When feeling overwhelmed before or during an exam, pause and engage your senses:\n\n1. **5 Things You Can See**: Look around your desk or room.\n2. **4 Things You Can Touch**: Feel your seat, the texture of your shirt.\n3. **3 Things You Can Hear**: Listen for ambient sounds.\n4. **2 Things You Can Smell**: Breathe in softly.\n5. **1 Thing You Can Taste**: Take a sip of water.\n\nTake three deep breaths.",
        "media_url": None,
        "created_at": datetime.utcnow()
    },
    {
        "title": "परीक्षा तनाव प्रबंधन एवं गहरी सांस का अभ्यास (Hindi)",
        "description": "परीक्षा के दौरान चिंता और तनाव को नियंत्रित करने के लिए आसान प्राणायाम और मानसिक शांत करने की तकनीकें।",
        "category": "Breathing",
        "content_type": "article",
        "language": "hi",
        "tags": ["परीक्षा तनाव", "चिंता", "प्राणायाम"],
        "read_time_minutes": 4,
        "content": "परीक्षा के समय घबराहट होना स्वाभाविक है। इसे शांत करने के लिए 4-7-8 श्वास तकनीक अपनाएं:\n\n1. नाक से **4 सेकंड** तक गहरी सांस लें।\n2. सांस को **7 सेकंड** के लिए रोककर रखें।\n3. मुंह से धीरे-धीरे **8 सेकंड** में सांस छोड़ें।",
        "media_url": None,
        "created_at": datetime.utcnow()
    },
    {
        "title": "प्लेसमेंट आणि करिअरचा ताण कसा हाताळावा? (Marathi)",
        "description": "इंजिनिअरिंग आणि पदवीच्या विद्यार्थ्यांसाठी प्लेसमेंटच्या काळातील ताणतणाव व्यवस्थापन मार्गदर्शक.",
        "category": "Career Stress",
        "content_type": "article",
        "language": "mr",
        "tags": ["प्लेसमेंट", "कारकीर्द", "ताण व्यवस्थापन"],
        "read_time_minutes": 6,
        "content": "प्लेसमेंटच्या काळात होणाऱ्या अपयशाची भीती दूर ठेवण्यासाठी काही महत्त्वाच्या टिप्स:\n\n1. **तुलना टाळा**: प्रत्येक विद्यार्थ्याचा मार्ग वेगळा असतो.\n2. **मॉक इंटरव्यू**: मित्रांसोबत सराव करा.\n3. **झोप आणि आहार**: किमान ७ तास झोप आवश्यक आहे.",
        "media_url": None,
        "created_at": datetime.utcnow()
    }
]

def seed_resources_if_empty(db):
    if db.resources.count_documents({}) == 0:
        db.resources.insert_many(SEED_RESOURCES)
        print("✅ Seeded psychoeducational resources into MongoDB")

@resources_bp.route('', methods=['GET'])
def get_resources():
    category = request.args.get('category')
    language = request.args.get('language')
    search = request.args.get('search')
    
    try:
        db = get_db()
        seed_resources_if_empty(db)
        
        query = {}
        if category and category != 'All':
            query['category'] = category
        if language and language != 'all':
            query['language'] = language
        if search:
            query['$or'] = [
                {'title': {'$regex': search, '$options': 'i'}},
                {'description': {'$regex': search, '$options': 'i'}},
                {'tags': {'$in': [search]}}
            ]
            
        resources = list(db.resources.find(query).sort('created_at', -1))
        for r in resources:
            r['_id'] = str(r['_id'])
            
        return jsonify({'success': True, 'resources': resources, 'count': len(resources)}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@resources_bp.route('/<resource_id>', methods=['GET'])
def get_resource_detail(resource_id):
    try:
        db = get_db()
        resource = db.resources.find_one({'_id': ObjectId(resource_id)})
        if not resource:
            return jsonify({'success': False, 'message': 'Resource not found'}), 404
        resource['_id'] = str(resource['_id'])
        return jsonify({'success': True, 'resource': resource}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
