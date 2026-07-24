# app/community.py
# Moderated Anonymous Peer Support Platform API Blueprint (Pillar 4)

from flask import Blueprint, request, jsonify
from datetime import datetime
import random
from pymongo import MongoClient
from bson.objectid import ObjectId
from config import MONGODB_URI, DB_NAME, CRISIS_HELPLINES
from core.response_generator import CRISIS_KEYWORDS

community_bp = Blueprint('community', __name__, url_prefix='/api/community')

def get_db():
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    return client[DB_NAME]

ANONYMOUS_ALIASES = [
    "Supportive Owl", "Hopeful Phoenix", "Brave Cheetah", "Quiet Panda",
    "Calm Dolphin", "Empathetic Elephant", "Resilient Tiger", "Gentle Koala"
]

SEED_POSTS = [
    {
        "author_alias": "Supportive Owl",
        "title": "Anyone else feeling overwhelmed by 7th sem placement season?",
        "content": "I've been preparing for technical rounds for 3 months, but the anxiety right before coding rounds is paralyzing.",
        "tag": "Placement Stress",
        "relate_count": 14,
        "comments_count": 3,
        "is_flagged": False,
        "created_at": datetime.utcnow()
    }
]

def seed_community_if_empty(db):
    if db.forum_posts.count_documents({}) == 0:
        db.forum_posts.insert_many(SEED_POSTS)
        print("✅ Seeded community forum posts into MongoDB")

def check_crisis_content(text):
    if not text:
        return False
    text_lower = text.lower()
    for kw in CRISIS_KEYWORDS:
        if kw in text_lower:
            return True
    return False

@community_bp.route('/posts', methods=['GET'])
def get_posts():
    tag = request.args.get('tag')
    try:
        db = get_db()
        seed_community_if_empty(db)
        query = {}
        if tag and tag != 'All':
            query['tag'] = tag
        posts = list(db.forum_posts.find(query).sort('created_at', -1).limit(30))
        for p in posts:
            p['_id'] = str(p['_id'])
        return jsonify({'success': True, 'posts': posts, 'count': len(posts)}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@community_bp.route('/posts', methods=['POST'])
def create_post():
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    content = data.get('content', '').strip()
    tag = data.get('tag', 'General Venting')
    
    if not title or not content:
        return jsonify({'success': False, 'message': 'Title and content are required'}), 400
        
    try:
        db = get_db()
        is_crisis = check_crisis_content(title + " " + content)
        author_alias = random.choice(ANONYMOUS_ALIASES)
        
        post_doc = {
            'author_alias': author_alias,
            'title': title,
            'content': content,
            'tag': tag,
            'relate_count': 0,
            'comments_count': 0,
            'is_flagged': is_crisis,
            'created_at': datetime.utcnow()
        }
        
        result = db.forum_posts.insert_one(post_doc)
        post_doc['_id'] = str(result.inserted_id)
        
        response_payload = {
            'success': True,
            'message': 'Post published anonymously',
            'post': post_doc,
            'is_flagged': is_crisis
        }
        
        if is_crisis:
            response_payload['crisis_notice'] = {
                'message': 'We noticed your post mentions deep emotional distress. Help is available 24/7.',
                'helplines': CRISIS_HELPLINES.get('IN', {})
            }
            
        return jsonify(response_payload), 201
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@community_bp.route('/posts/<post_id>/comments', methods=['GET'])
def get_comments(post_id):
    try:
        db = get_db()
        comments = list(db.forum_comments.find({'post_id': post_id}).sort('created_at', 1))
        for c in comments:
            c['_id'] = str(c['_id'])
        return jsonify({'success': True, 'comments': comments}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@community_bp.route('/posts/<post_id>/comments', methods=['POST'])
def add_comment(post_id):
    data = request.get_json() or {}
    content = data.get('content', '').strip()
    if not content:
        return jsonify({'success': False, 'message': 'Comment content required'}), 400
    try:
        db = get_db()
        post = db.forum_posts.find_one({'_id': ObjectId(post_id)})
        if not post:
            return jsonify({'success': False, 'message': 'Post not found'}), 404
        is_crisis = check_crisis_content(content)
        author_alias = random.choice(ANONYMOUS_ALIASES)
        comment_doc = {
            'post_id': post_id,
            'author_alias': author_alias,
            'content': content,
            'is_flagged': is_crisis,
            'created_at': datetime.utcnow()
        }
        db.forum_comments.insert_one(comment_doc)
        db.forum_posts.update_one({'_id': ObjectId(post_id)}, {'$inc': {'comments_count': 1}})
        return jsonify({'success': True, 'message': 'Comment added', 'comment': comment_doc}), 201
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@community_bp.route('/posts/<post_id>/relate', methods=['POST'])
def relate_post(post_id):
    try:
        db = get_db()
        result = db.forum_posts.update_one({'_id': ObjectId(post_id)}, {'$inc': {'relate_count': 1}})
        if result.matched_count == 0:
            return jsonify({'success': False, 'message': 'Post not found'}), 404
        return jsonify({'success': True, 'message': 'Support logged'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
