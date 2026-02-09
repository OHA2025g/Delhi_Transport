# Architecture Documentation

## Project Structure

```
delhi_vehicle_portal/
├── backend/                    # Backend application (FastAPI)
│   ├── api/                   # API routes organized by domain
│   │   ├── __init__.py
│   │   ├── dashboard.py       # Dashboard endpoints
│   │   ├── kpi.py             # KPI endpoints
│   │   ├── tickets.py         # Ticket management endpoints
│   │   ├── chatbot.py         # Chatbot endpoints
│   │   └── ai_services.py     # AI service endpoints (OCR, facial, vehicle)
│   ├── core/                  # Core configuration and setup
│   │   ├── __init__.py
│   │   ├── config.py          # Application configuration
│   │   ├── database.py        # Database connection
│   │   └── middleware.py      # Custom middleware
│   ├── services/              # Business logic layer
│   │   ├── __init__.py
│   │   ├── kpi_service.py     # KPI calculation logic
│   │   ├── data_service.py    # Data loading and processing
│   │   └── insights_service.py # Insights generation
│   ├── utils/                 # Utility functions
│   │   ├── __init__.py
│   │   └── helpers.py         # Helper functions
│   ├── models/                 # Data models
│   │   └── README.md
│   ├── server.py              # Main FastAPI application
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile             # Production Dockerfile
│   └── Dockerfile.dev         # Development Dockerfile
│
├── frontend/                   # Frontend application (React)
│   ├── src/
│   │   ├── api/               # API client functions
│   │   │   ├── dashboard.js   # Dashboard API calls
│   │   │   ├── kpi.js         # KPI API calls
│   │   │   └── tickets.js     # Ticket API calls
│   │   ├── components/        # React components
│   │   │   ├── ui/            # UI components (Shadcn/ui)
│   │   │   └── ...            # Custom components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility libraries
│   │   ├── config/            # Configuration files
│   │   │   └── api.js         # API configuration
│   │   ├── constants/         # Constants
│   │   │   └── routes.js      # Route definitions
│   │   ├── App.js             # Main App component
│   │   └── index.js           # Entry point
│   ├── public/                # Static assets
│   ├── package.json           # Node.js dependencies
│   ├── Dockerfile             # Production Dockerfile
│   ├── Dockerfile.dev         # Development Dockerfile
│   └── nginx.conf             # Nginx configuration
│
├── tests/                      # Test files
│   ├── test_smoke.py
│   ├── test_unit.py
│   ├── test_all_endpoints.py
│   └── ...
│
├── docs/                       # Documentation
│   ├── ARCHITECTURE.md        # This file
│   ├── DOCKER_SETUP.md
│   └── ...
│
├── data/                       # Data files
│   ├── excel/                 # Excel data files
│   └── geojson/               # GeoJSON files
│
├── docker/                     # Docker-related files
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   └── ...
│
├── scripts/                    # Utility scripts
│   ├── deploy/                # Deployment scripts
│   └── utils/                 # Utility scripts
│
├── docker-compose.yml         # Production compose (symlink)
├── docker-compose.dev.yml     # Development compose (symlink)
├── Makefile                   # Make commands
├── README.md                  # Main README
└── PROJECT_STRUCTURE.md       # Project structure documentation
```

## Architecture Principles

### Backend Architecture

1. **Separation of Concerns**
   - `api/`: API route handlers (thin layer)
   - `services/`: Business logic (thick layer)
   - `core/`: Configuration and infrastructure
   - `utils/`: Reusable utility functions

2. **Modularity**
   - Each domain has its own API router
   - Services are organized by functionality
   - Easy to add new features

3. **Scalability**
   - Clear boundaries between layers
   - Easy to add new endpoints
   - Easy to refactor services

### Frontend Architecture

1. **Component Organization**
   - Pages: Top-level route components
   - Components: Reusable UI components
   - UI: Shadcn/ui components

2. **API Layer**
   - Centralized API configuration
   - Domain-specific API clients
   - Consistent error handling

3. **Configuration**
   - Centralized constants
   - Route definitions
   - API configuration

## Data Flow

```
Frontend (React)
    ↓ API Calls
API Layer (axios)
    ↓ HTTP Requests
Backend API Routes (FastAPI)
    ↓ Business Logic
Services Layer
    ↓ Data Access
Database (MongoDB)
```

## Key Design Decisions

1. **Monolithic Backend**: Single FastAPI application for simplicity
2. **Modular Frontend**: Component-based React architecture
3. **MongoDB**: Document database for flexible schema
4. **Docker**: Containerization for easy deployment
5. **Separation of Concerns**: Clear boundaries between layers

## Future Improvements

1. **Backend**
   - Split into microservices if needed
   - Add caching layer (Redis)
   - Add message queue for async tasks

2. **Frontend**
   - Add state management (Redux/Zustand)
   - Add API response caching
   - Optimize bundle size

3. **Infrastructure**
   - Add CI/CD pipeline
   - Add monitoring and logging
   - Add automated testing in CI

