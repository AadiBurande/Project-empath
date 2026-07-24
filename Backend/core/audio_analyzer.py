# core/audio_analyzer.py
# Audio prosody analysis

import librosa
import numpy as np
import pickle
import os
from config import CUSTOM_AUDIO_MODEL_PATH

class AudioAnalyzer:
    """Analyzes audio prosody (tone, pitch, rhythm) to detect emotions."""
    
    def __init__(self):
        print("🎵 Initializing AudioAnalyzer...")
        
        try:
            with open(CUSTOM_AUDIO_MODEL_PATH, 'rb') as f:
                self.model = pickle.load(f)
            print(f"   ✅ Trained audio model loaded from '{CUSTOM_AUDIO_MODEL_PATH}'")
        except FileNotFoundError:
            print(f"   ⚠️  Audio model not found at '{CUSTOM_AUDIO_MODEL_PATH}'")
            print("   Prosody analysis will be disabled (returning empty scores)")
            self.model = None
        except Exception as e:
            print(f"   ❌ Error loading audio model: {e}")
            self.model = None
    
    def _extract_features(self, file_name):
        try:
            y, sr = librosa.load(file_name, sr=22050)
            result = np.array([])
            
            mfccs = np.mean(librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40).T, axis=0)
            result = np.hstack((result, mfccs))
            
            stft = np.abs(librosa.stft(y))
            chroma = np.mean(librosa.feature.chroma_stft(S=stft, sr=sr).T, axis=0)
            result = np.hstack((result, chroma))
            
            mel = np.mean(librosa.feature.melspectrogram(y=y, sr=sr).T, axis=0)
            result = np.hstack((result, mel))
            
            return result.reshape(1, -1)
            
        except Exception as e:
            print(f"   ❌ Error extracting audio features: {e}")
            return None
    
    def analyze_prosody(self, audio_file_path):
        if not self.model:
            return {}
        
        features = self._extract_features(audio_file_path)
        if features is None:
            return {}
        
        try:
            probabilities = self.model.predict_proba(features)[0]
            classes = self.model.classes_
            return {label: float(score) for label, score in zip(classes, probabilities)}
        except Exception as e:
            print(f"   ❌ Error during prosody analysis: {e}")
            return {}
