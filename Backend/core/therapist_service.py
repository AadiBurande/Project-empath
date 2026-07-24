# core/therapist_service.py
# Therapist Finder Service with Google Places & MongoDB

import os
import requests
from datetime import datetime
from pymongo import MongoClient
from bson.objectid import ObjectId
from config import MONGODB_URI, DB_NAME, GOOGLE_PLACES_API_KEY

class TherapistFinderService:
    def __init__(self):
        self.google_api_key = GOOGLE_PLACES_API_KEY
        self.client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        self.db = self.client[DB_NAME]
    
    def search_therapists_in_db(self, latitude, longitude, radius_km=10, filters=None):
        therapists_col = self.db['therapists']
        try:
            query = {
                'location.coordinates': {
                    '$near': {
                        '$geometry': {'type': 'Point', 'coordinates': [longitude, latitude]},
                        '$maxDistance': radius_km * 1000
                    }
                }
            }
            results = list(therapists_col.find(query).limit(20))
            for therapist in results:
                therapist['_id'] = str(therapist['_id'])
            return {'success': True, 'therapists': results, 'count': len(results)}
        except Exception as e:
            return {'success': False, 'error': str(e)}

therapist_service = TherapistFinderService()
