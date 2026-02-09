# Citizen Assistance & Transport Platform

A comprehensive AI-powered citizen assistance platform for transport department with 7 modules.

## Features

1. **AI Chatbot** - Multilingual voice-enabled assistant (Hindi, Marathi, Tamil, English)
2. **Executive Dashboard** - Real-time KPIs, forecasts, AI-generated insights
3. **Vehicle Analytics** - VAHAN data analysis with charts and reports
4. **Ticket Management** - AI-powered categorization and SLA tracking
5. **Sentiment Analysis** - Public mood analysis from grievances
6. **Document Verification** - OCR for Aadhaar, DL, RC, Insurance, PUC
7. **Facial Recognition** - Identity verification for enforcement
8. **Vehicle Detection** - Automatic classification from images

## Quick Start

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
# Set environment variables in .env
python -m uvicorn server:app --host 0.0.0.0 --port 8001
```

### Frontend Setup
```bash
cd frontend
yarn install
yarn start
```

### Database
- MongoDB required
- Data auto-loads from Excel files on startup

## Project Structure
```
├── backend/
│   ├── server.py          # FastAPI application
│   ├── requirements.txt   # Python dependencies
│   └── .env              # Environment variables
├── frontend/
│   ├── src/
│   │   ├── pages/        # React pages
│   │   ├── components/   # Reusable components
│   │   └── App.js        # Main app component
│   └── package.json
├── data/
│   ├── Vahan1.xlsx       # Vehicle registration data
│   └── Tickets.xlsx      # Support tickets data
└── docs/
    └── AI_MODELS_AND_INTEGRATIONS.md
```

## Data Sources
- **Vahan1.xlsx**: 9,536 vehicle registration records
- **Tickets.xlsx**: 275 support tickets

## Environment Variables

### Backend
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=citizen_assistance
EMERGENT_LLM_KEY=<your-key>
```

### Frontend
```
REACT_APP_BACKEND_URL=<backend-url>
```

## License
© 2025 Citizen Assistance & Transport Platform
