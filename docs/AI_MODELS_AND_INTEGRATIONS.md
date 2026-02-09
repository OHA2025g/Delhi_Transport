# Citizen Assistance & Transport Platform

## AI Models & Integrations Used

### 1. Large Language Model (LLM) - Chatbot
- **Provider**: OpenAI via Emergent LLM Key
- **Model**: GPT-4o-mini (with fallback responses)
- **Purpose**: Intent understanding, response generation for citizen queries
- **Capabilities**:
  - Driving License queries
  - Vehicle Registration (RC) information
  - Traffic Challan payment guidance
  - Grievance registration
  - Multilingual support (Hindi, Marathi, Tamil, English)

### 2. Speech-to-Text (STT)
- **Provider**: Google Cloud Speech-to-Text API
- **Status**: MOCKED for demo (returns sample transcriptions)
- **Supported Languages**:
  - Hindi (hi-IN)
  - Marathi (mr-IN)
  - Tamil (ta-IN)
  - English (en-IN)

### 3. Text-to-Speech (TTS)
- **Provider**: Browser Web Speech API (SpeechSynthesis)
- **Purpose**: Read chatbot responses aloud
- **Status**: Functional using browser native TTS

### 4. OCR - Document Verification
- **Provider**: Gemini Vision via Emergent LLM Key
- **Model**: gemini-2.5-flash
- **Status**: MOCKED for demo
- **Supported Documents**:
  - Aadhaar Card
  - Driving License (DL)
  - Registration Certificate (RC)
  - Vehicle Insurance
  - PUC Certificate

### 5. Facial Recognition
- **Status**: MOCKED for demo
- **Purpose**: Identity verification for DL issuance
- **Future Implementation**: face_recognition library or cloud API

### 6. Vehicle Class Detection
- **Status**: MOCKED for demo
- **Purpose**: Automatic vehicle classification from images
- **Future Implementation**: YOLO or similar computer vision model
- **Classes Detected**:
  - Two Wheeler
  - Four Wheeler (LMV)
  - Heavy Goods Vehicle
  - Bus

### 7. Sentiment Analysis
- **Implementation**: Rule-based mock (random assignment)
- **Categories**: Positive, Neutral, Negative
- **Future Enhancement**: NLP-based sentiment classification

## Data Sources

### Vahan1.xlsx (Vehicle Registration Data)
- **Records**: 9,536 vehicle registrations
- **Fields**: 60 columns including:
  - Registration details (regn_no, regn_dt, regn_type)
  - Vehicle info (maker, model, fuel, vh_class)
  - Owner details (owner_name, address)
  - Financial (sale_amt)
  - Compliance (regn_upto, fit_upto)

### Tickets.xlsx (Support Tickets)
- **Records**: 275 tickets
- **Fields**: 12 columns including:
  - Project, Subject, Status, Priority
  - Module Name, Category
  - Dates (Created, Updated, Closed)

## Environment Variables Required

```env
# Backend (.env)
MONGO_URL=mongodb://localhost:27017
DB_NAME=citizen_assistance
EMERGENT_LLM_KEY=<your-emergent-llm-key>
CORS_ORIGINS=*

# For Google STT (if implementing real integration)
GOOGLE_APPLICATION_CREDENTIALS=<path-to-service-account-json>
```

## API Endpoints

### Dashboard
- GET /api/dashboard/executive-summary
- GET /api/dashboard/vahan/kpis
- GET /api/dashboard/vahan/top-manufacturers
- GET /api/dashboard/vahan/vehicle-class-distribution
- GET /api/dashboard/vahan/registration-delay-stats

### Tickets
- GET /api/tickets/kpis
- GET /api/tickets/list
- POST /api/tickets/create
- GET /api/tickets/sentiment-analysis

### Chatbot
- POST /api/chatbot/chat
- GET /api/chatbot/history/{session_id}

### STT (Speech-to-Text)
- POST /api/stt/transcribe

### OCR (Document Verification)
- POST /api/ocr/verify

### Facial Recognition
- POST /api/facial/verify

### Vehicle Detection
- POST /api/vehicle/detect

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Shadcn/UI, Recharts
- **Backend**: FastAPI, Python 3.11
- **Database**: MongoDB
- **AI Integration**: emergentintegrations library
