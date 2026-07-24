# therapist_database.py - MongoDB setup for Therapist Finder

from pymongo import MongoClient, ASCENDING, DESCENDING, GEO2D
from pymongo.errors import DuplicateKeyError, ConnectionFailure
from datetime import datetime
import os
from dotenv import load_dotenv
from config import MONGODB_URI, DB_NAME

load_dotenv()

class TherapistDatabase:
    """MongoDB-based therapist database management"""
    
    def __init__(self, mongo_uri=None, db_name=DB_NAME):
        self.mongo_uri = mongo_uri or MONGODB_URI
        
        try:
            self.client = MongoClient(self.mongo_uri, serverSelectionTimeoutMS=5000)
            self.client.admin.command('ping')
            print("✅ Connected to MongoDB successfully")
        except ConnectionFailure as e:
            print(f"❌ Failed to connect to MongoDB: {e}")
            raise
        
        self.db = self.client[db_name]
        self._init_collections()
    
    def _init_collections(self):
        """Create collections and indexes"""
        if 'therapists' not in self.db.list_collection_names():
            self.db.create_collection('therapists')
            print("✅ Created 'therapists' collection")
        
        therapists_col = self.db['therapists']
        therapists_col.create_index([('location.coordinates', GEO2D)], name='location_index')
        therapists_col.create_index([('google_place_id', ASCENDING)], unique=True, sparse=True, name='google_place_id_index')
