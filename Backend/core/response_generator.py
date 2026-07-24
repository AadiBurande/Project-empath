# response_generator.py - AI Response Generator with Multi-language & Crisis Support

import google.generativeai as genai
from config import (
    GEMINI_API_KEY,
    GEMINI_TEMPERATURE,
    GEMINI_MAX_TOKENS,
    CRISIS_HELPLINES,
    AI_SOLUTION_PROMPTS
)

CRISIS_KEYWORDS = [
    "suicide", "kill myself", "self harm", "ending my life", "don't want to live", 
    "hopeless", "worthless", "helpless", "depressed", "no point", "can't go on", 
    "dead", "hurt myself", "die", "give up", "alone", "ending it all"
]

class ResponseGenerator:
    def __init__(self, language='en'):
        self.language = language
        
        print("🤖 Initializing ResponseGenerator (Gemini)...")
        try:
            if not GEMINI_API_KEY:
                raise ValueError("GEMINI_API_KEY not found in environment variables")
            
            genai.configure(api_key=GEMINI_API_KEY)
            generation_config = {
                "temperature": GEMINI_TEMPERATURE,
                "top_p": 1,
                "top_k": 1,
                "max_output_tokens": GEMINI_MAX_TOKENS
            }
            self.model = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                generation_config=generation_config
            )
            print("   ✅ ResponseGenerator initialized successfully.")
        except Exception as e:
            print(f"   ❌ Error initializing Gemini: {e}")
            self.model = None

    def check_for_crisis(self, text):
        if not text:
            return False
        text_lower = text.lower()
        for keyword in CRISIS_KEYWORDS:
            if keyword in text_lower:
                return True
        return False

    def get_crisis_response(self, emotion, location_country='IN'):
        helplines = CRISIS_HELPLINES.get('IN', {})
        response = "💙 Crisis Support Notice:\n"
        response += "If you are in deep distress or safety crisis, please connect with these free 24/7 helplines:\n"
        response += f"• {helplines.get('name')}: {helplines.get('number')}\n"
        response += "You are not alone. Help is available."
        return response

    def generate_response(self, dominant_emotion, fused_scores, transcribed_text):
        if not self.model:
            return "🔌 AI system offline. Please add GEMINI_API_KEY to .env"
        
        if self.check_for_crisis(transcribed_text):
            return self.get_crisis_response(dominant_emotion, location_country='IN')
        
        system_prompt = f"""You are 'Empath,' a compassionate AI mental health support chatbot for Indian college students.
Be deeply empathetic, non-judgmental, warm, and supportive.
Keep responses concise (2-3 sentences max).
Acknowledge their feelings and offer 1 practical gentle coping suggestion.
Current emotion detected: {dominant_emotion}"""

        try:
            prompt = (
                f"{system_prompt}\n\n"
                f"User's words: \"{transcribed_text}\"\n"
                f"Detected emotion: {dominant_emotion}\n\n"
                "Generate warm empathetic response now:"
            )
            
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"❌ Error generating response: {e}")
            return "I'm here to listen and support you. Please tell me more about what you're feeling."
