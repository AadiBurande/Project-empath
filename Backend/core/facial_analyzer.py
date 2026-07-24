# core/facial_analyzer.py
# Facial emotion analysis using ONNX models

import cv2
import numpy as np
import onnxruntime as ort
import os
import requests
from tqdm import tqdm
from config import FACE_DETECTION_SCALE, FACE_DETECTION_MIN_NEIGHBORS, FACE_RESIZE_SIZE

def download_model(url, file_name):
    if os.path.exists(file_name) and os.path.getsize(file_name) > 1000:
        return
    
    print(f"   Downloading: {os.path.basename(file_name)}")
    try:
        response = requests.get(url, stream=True, allow_redirects=True, timeout=60)
        response.raise_for_status()
        
        total_size = int(response.headers.get('content-length', 0))
        with tqdm(total=total_size, unit='iB', unit_scale=True, desc=os.path.basename(file_name)) as pbar:
            with open(file_name, 'wb') as f:
                for data in response.iter_content(1024):
                    pbar.update(len(data))
                    f.write(data)
        print(f"   ✅ Downloaded successfully")
    except Exception as e:
        print(f"   ❌ Download failed: {e}")
        if os.path.exists(file_name):
            os.remove(file_name)

class FacialAnalyzer:
    EMOTION_LABELS = [
        'neutral', 'joy', 'surprise', 'sadness',
        'anger', 'disgust', 'fear', 'contempt'
    ]
    
    def __init__(self):
        print("😊 Initializing FacialAnalyzer...")
        
        self.model_dir = "models"
        os.makedirs(self.model_dir, exist_ok=True)
        
        model_urls = [
            "https://media.githubusercontent.com/media/onnx/models/main/validated/vision/body_analysis/emotion_ferplus/model/emotion-ferplus-8.onnx",
            "https://github.com/onnx/models/raw/main/validated/vision/body_analysis/emotion_ferplus/model/emotion-ferplus-8.onnx"
        ]
        self.model_path = os.path.join(self.model_dir, "emotion-ferplus-8.onnx")
        
        for url in model_urls:
            download_model(url, self.model_path)
            if os.path.exists(self.model_path) and os.path.getsize(self.model_path) > 1000:
                break
        
        face_cascade_url = "https://raw.githubusercontent.com/opencv/opencv/master/data/haarcascades/haarcascade_frontalface_default.xml"
        self.face_cascade_path = os.path.join(self.model_dir, "haarcascade_frontalface_default.xml")
        download_model(face_cascade_url, self.face_cascade_path)
        
        try:
            if os.path.exists(self.model_path) and os.path.getsize(self.model_path) > 1000:
                self.session = ort.InferenceSession(self.model_path)
                self.input_name = self.session.get_inputs()[0].name
                self.output_name = self.session.get_outputs()[0].name
            else:
                print("   ⚠️  Facial ONNX model not available locally. Facial emotion detection will be skipped.")
                self.session = None
            
            self.face_cascade = cv2.CascadeClassifier(self.face_cascade_path)
            if self.face_cascade.empty():
                print("   ⚠️  Failed to load Haar Cascade face detector.")
            
            if self.session:
                print("   ✅ FacialAnalyzer initialized successfully")
        except Exception as e:
            print(f"   ⚠️  FacialAnalyzer initialization warning: {e}")
            self.session = None
    
    def analyze_frame_from_bytes(self, image_bytes):
        if not self.session:
            return {}
        
        try:
            img = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
            if img is None:
                return {}
            
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            faces = self.face_cascade.detectMultiScale(
                gray,
                scaleFactor=FACE_DETECTION_SCALE,
                minNeighbors=FACE_DETECTION_MIN_NEIGHBORS
            )
            
            if len(faces) == 0:
                return {}
            
            (x, y, w, h) = faces[0]
            face = gray[y:y+h, x:x+w]
            
            resized_face = cv2.resize(face, FACE_RESIZE_SIZE)
            processed_face = resized_face.reshape(1, 1, *FACE_RESIZE_SIZE).astype(np.float32)
            
            result = self.session.run([self.output_name], {self.input_name: processed_face})
            scores = result[0][0]
            
            softmax_scores = np.exp(scores) / np.sum(np.exp(scores))
            
            return {
                'neutral': float(softmax_scores[0]),
                'joy': float(softmax_scores[1]),
                'surprise': float(softmax_scores[2]),
                'sadness': float(softmax_scores[3]),
                'anger': float(softmax_scores[4]),
                'disgust': float(softmax_scores[5]),
                'fear': float(softmax_scores[6]),
                'contempt': float(softmax_scores[7])
            }
            
        except Exception as e:
            print(f"   ❌ Error analyzing facial expression: {e}")
            return {}
