# core/text_analyzer.py
# Text transcription and emotion analysis

import whisper
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import torch
import os
from config import CUSTOM_TEXT_MODEL_PATH, WHISPER_MODEL, TEXT_EMOTION_MODEL

class TextAnalyzer:
    def __init__(self):
        print("📝 Initializing TextAnalyzer...")
        print(f"   Loading Whisper model ('{WHISPER_MODEL}')...")
        self.stt_model = whisper.load_model(WHISPER_MODEL)
        print("   ✅ Whisper model loaded.")
        
        print("   Loading Text Emotion classifier...")
        if os.path.exists(CUSTOM_TEXT_MODEL_PATH):
            tokenizer = AutoTokenizer.from_pretrained(CUSTOM_TEXT_MODEL_PATH)
            model = AutoModelForSequenceClassification.from_pretrained(CUSTOM_TEXT_MODEL_PATH)
            self.emotion_classifier = pipeline("text-classification", model=model, tokenizer=tokenizer, top_k=None)
            self.is_custom_model = True
        else:
            print(f"   Using pre-trained model: {TEXT_EMOTION_MODEL}")
            self.emotion_classifier = pipeline("text-classification", model=TEXT_EMOTION_MODEL, top_k=None)
            self.is_custom_model = False
        
        print("   ✅ Text Emotion classifier loaded.")
    
    def transcribe_audio(self, audio_file_path):
        try:
            result = self.stt_model.transcribe(audio_file_path, language='en')
            return result['text']
        except Exception as e:
            print(f"   ❌ Error during transcription: {e}")
            return ""
    
    def analyze_text_emotion(self, text):
        if not text or not text.strip():
            return {}
        
        try:
            emotion_results = self.emotion_classifier(text)[0]
            if self.is_custom_model:
                label2id = self.emotion_classifier.model.config.label2id
                id2label = {v: k for k, v in label2id.items()}
                return {id2label[int(d['label'].split('_')[1])]: d['score'] for d in emotion_results}
            else:
                return {d['label']: d['score'] for d in emotion_results}
        except Exception as e:
            print(f"   ❌ Error during text emotion analysis: {e}")
            return {}
