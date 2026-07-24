# Project Empath — Digital Mental Health & Psychological Support System

> **Culturally-Tailored, Institution-Integrated Digital Mental Health Platform for Indian Higher Education.**

---

## 📁 Clean Repository Directory Structure

```
Project Empath/
│
├── Backend/                    # Python Flask + Socket.IO API & AI Engine
│   ├── app/                    # 5 Pillar REST & Socket.IO Route Blueprints
│   │   ├── admin.py            # Pillar 5: Institutional Analytics Engine
│   │   ├── api.py              # Core Flask-SocketIO Server & Telemetry
│   │   ├── auth.py             # User Auth & JWT Token Verification
│   │   ├── booking.py          # Pillar 2: Confidential Counsellor Booking API
│   │   ├── community.py        # Pillar 4: Anonymous Peer Support Forum API
│   │   └── resources.py        # Pillar 3: Psychoeducational Hub API
│   ├── core/                   # Multimodal AI Engine Modules
│   │   ├── audio_analyzer.py   # Librosa MFCC Prosody Analysis
│   │   ├── facial_analyzer.py  # OpenCV ONNX FER+ Face Expression Classifier
│   │   ├── fusion_engine.py    # 3-Modality Weighted Emotion Fusion (50% Text, 30% Face, 20% Prosody)
│   │   ├── response_generator.py # Google Gemini 1.5 Flash Empathetic Response Generator
│   │   ├── text_analyzer.py    # Whisper Speech-To-Text & DistilBERT Text Emotion Classifier
│   │   └── therapist_service.py # Google Places & Local Therapist Integration
│   ├── models/                 # Pre-trained Weights & ONNX Models
│   ├── config.py               # Centralized Configuration & Helpline Directory
│   ├── main.py                 # Backend Server Entrypoint (Port 5000)
│   └── requirements.txt        # Python Dependencies
│
├── Frontend/                   # Modern Vite + React + Tailwind v4 Web Application
│   ├── src/
│   │   ├── components/         # Header, Sidebar, Footer, Webcam Feed, Cards
│   │   ├── contexts/           # AuthContext (JWT Authentication State)
│   │   ├── pages/              # 5 Pillar Pages (Chat, Booking, Resources, Community, Admin, Auth)
│   │   ├── utils/              # API Fetch Wrapper
│   │   ├── App.jsx             # React Router DOM Setup & Protected Guards
│   │   ├── main.jsx            # Entrypoint
│   │   └── index.css           # Tailwind Imports
│   ├── package.json            # Node Dependencies
│   └── vite.config.js          # Vite Bundler Config
│
├── Database/                   # Local MongoDB Data Files (mongodb)
├── .env                        # Environment Variables (GEMINI_API_KEY)
├── .gitignore
└── README.md                   # Project Documentation
```

---

## 🚀 Quick Start Guide

### 1. Launch Backend API Server (Port 5000)

```powershell
cd Backend
python -m pip install -r requirements.txt
python main.py
```

---

### 2. Launch Frontend Web Application (Port 5173)

In a second terminal window:

```powershell
cd Frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser!

---

## 🏛️ The 5 Pillars of Project Empath

1. **AI-Guided First-Aid (The Triage System)**: 24/7 multimodal emotion chat (text, voice, webcam face expression) with Google Gemini AI and automatic crisis keyword flagging.
2. **Confidential Counsellor Booking (The Bridge)**: Private scheduling tool linking students directly with on-campus psychological professionals.
3. **Psychoeducational Resource Hub (The Self-Care Toolkit)**: Multi-language guides, audio relaxations, and grounding exercises in English, Hindi (हिंदी), and Marathi (मराठी).
4. **Moderated Peer Support Platform (The Community)**: Anonymous forum where students vent under auto-assigned creative aliases, with automated safety moderation.
5. **Admin & Institutional Dashboard (The Policy Engine)**: Aggregated, anonymized telemetry for Deans & IQAC to deploy targeted campus mental health policies.
