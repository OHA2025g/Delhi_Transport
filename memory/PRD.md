# Citizen Assistance Platform - Product Requirements Document

## Original Problem Statement
Build a comprehensive Citizen Assistance Platform with 7 AI-powered modules for the Transport Department:
1. Citizen Assistance Chatbot with Speech-to-Speech Translation (multilingual: Hindi, Marathi, Tamil, English)
2. Dashboard with Predictive & Advanced Analytics (using Vahan1.xlsx - 9,536 records)
3. Sentiment Analysis (using Tickets.xlsx - 275 records)
4. Automated Ticketing System with AI categorization
5. OCR-Based Document Verification (Aadhaar, RC, DL, Insurance, PUC)
6. Facial Recognition for identity verification
7. Vehicle Class Detection from images

## User Personas
- **Government Officials**: Need executive dashboards, KPIs, and AI insights for decision making
- **Transport Department Staff**: Manage tickets, verify documents, handle citizen queries
- **Citizens**: Seek information about DL, RC, challans via chatbot (voice/text)
- **Data Analysts**: Analyze vehicle registration trends, sentiment patterns

## Core Requirements
- Design: Gujarat WCD portal style (purple gradient theme)
- Backend: FastAPI + MongoDB
- Frontend: React + Shadcn/UI
- LLM: Emergent LLM Key (with fallback responses)
- STT: Google Speech-to-Text API (MOCKED)
- OCR: Gemini Vision (MOCKED)

## What's Been Implemented (January 2025)

### Backend (FastAPI)
- ✅ MongoDB integration with Vahan and Tickets data loaded
- ✅ Dashboard APIs: executive-summary, vahan/kpis, top-manufacturers, vehicle-class-distribution
- ✅ Ticket APIs: list, create, kpis, sentiment-analysis
- ✅ Chatbot API with fallback responses (DL, RC, Challan, Grievance queries)
- ✅ STT, OCR, Facial Recognition, Vehicle Detection APIs (MOCKED)
- ✅ NaN value handling for JSON serialization

### Frontend (React)
- ✅ Landing page with Gujarat WCD purple gradient theme
- ✅ Executive Dashboard with 8 KPI cards, trend charts, AI insights
- ✅ Vehicle Analytics with state-wise, fuel, class distribution charts
- ✅ Ticket Management with data table, filters, status/priority charts
- ✅ Sentiment Analysis dashboard with trend visualization
- ✅ Chatbot page with multilingual support (4 languages)
- ✅ Document Verification upload interface
- ✅ Facial Recognition dual-image verification
- ✅ Vehicle Detection with classification results
- ✅ Floating chatbot widget on all pages
- ✅ Responsive sidebar navigation

### Data Integration
- ✅ 9,536 vehicle registration records from Vahan1.xlsx
- ✅ 275 support tickets from Tickets.xlsx
- ✅ Real-time KPI calculations from MongoDB

## Prioritized Backlog

### P0 - Critical (Done)
- [x] Landing page with stats
- [x] Executive Dashboard with KPIs
- [x] Chatbot with responses
- [x] Ticket management system
- [x] Data visualization charts

### P1 - Important
- [ ] Integrate real Google Speech-to-Text API
- [ ] Integrate real Gemini Vision OCR
- [ ] Implement actual facial recognition using face_recognition library
- [ ] Implement YOLO-based vehicle detection
- [ ] Add user authentication

### P2 - Nice to Have
- [ ] Real-time WebSocket for chatbot
- [ ] Voice output (TTS) implementation
- [ ] PDF report generation
- [ ] Email notifications for tickets
- [ ] Dark/light theme toggle

## Technical Architecture
```
Frontend (React + Vite)
├── Pages: Landing, Dashboard, Analytics, Tickets, Chatbot, OCR, Facial, Vehicle
├── Components: Sidebar, FloatingChatbot, KPI Cards, Charts (Recharts)
└── Styling: Tailwind CSS + Shadcn/UI

Backend (FastAPI)
├── Routers: dashboard, tickets, chatbot, stt, ocr, facial, vehicle
├── Database: MongoDB (citizen_assistance)
└── Collections: vahan_data, tickets_data, facial_verifications

Data Sources
├── Vahan1.xlsx (9,536 vehicle registrations)
└── Tickets.xlsx (275 support tickets)
```

## Next Steps
1. Add balance to Emergent LLM Key for AI-powered chatbot responses
2. Set up Google Cloud credentials for real STT
3. Implement facial recognition with actual face matching
4. Add vehicle detection using computer vision models
5. User authentication and role-based access
