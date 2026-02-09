# Project Structure

This document describes the reorganized structure of the Delhi Vehicle Portal project.

## Directory Structure

```
delhi_vehicle_portal/
├── backend/                    # Backend application (FastAPI)
│   ├── api/                   # API routes (organized by domain)
│   ├── core/                  # Core configuration and setup
│   │   ├── config.py         # Application configuration
│   │   ├── database.py       # Database connection
│   │   └── middleware.py     # Custom middleware
│   ├── services/             # Business logic layer
│   ├── utils/                # Utility functions
│   │   └── helpers.py        # Helper functions
│   ├── models/               # Data models
│   │   └── README.md
│   ├── server.py             # Main FastAPI application
│   ├── requirements.txt      # Python dependencies
│   ├── Dockerfile            # Production Dockerfile
│   └── Dockerfile.dev        # Development Dockerfile
│
├── frontend/                  # Frontend application (React)
│   ├── src/
│   │   ├── api/              # API client functions
│   │   ├── components/       # Reusable React components
│   │   │   └── ui/           # UI components (Shadcn/ui)
│   │   ├── pages/            # React page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility libraries
│   │   ├── config/           # Configuration files
│   │   │   └── api.js        # API configuration
│   │   ├── constants/        # Constants
│   │   │   └── routes.js     # Route definitions
│   │   ├── App.js            # Main App component
│   │   └── index.js          # Entry point
│   ├── public/               # Static assets
│   ├── package.json          # Node.js dependencies
│   ├── Dockerfile            # Production Dockerfile
│   ├── Dockerfile.dev        # Development Dockerfile
│   └── nginx.conf            # Nginx configuration
│
├── tests/                     # All test files
│   ├── test_smoke.py         # Smoke/Sanity tests
│   ├── test_unit.py          # Unit tests
│   ├── test_unit_comprehensive.py  # Comprehensive unit tests
│   ├── test_all_endpoints.py # API/Functional tests
│   ├── test_database.py     # Database tests
│   ├── test_security.py     # Security tests
│   ├── test_integration.py  # Integration tests
│   ├── test_validation.py   # Validation/Boundary tests
│   ├── test_performance.py  # Performance/Load tests
│   ├── test_regression.py   # Regression tests
│   ├── test_compatibility.py # Compatibility tests
│   └── run_all_tests.py     # Master test runner
│
├── docs/                      # All documentation
│   ├── ARCHITECTURE.md       # Architecture documentation
│   ├── RESTRUCTURING_COMPLETE.md # Restructuring summary
│   ├── DOCKER_SETUP.md       # Docker setup guide
│   ├── TEST_REPORT.md        # Test reports
│   └── ...                   # Other documentation files
│
├── data/                      # Data files
│   ├── excel/                # Excel data files
│   │   ├── Vahan1.xlsx
│   │   ├── Tickets.xlsx
│   │   ├── Parivahan_Dashboard_extra_KPI.xlsx
│   │   └── transport_extra_kpi_mock_data_FY2025_26.xlsx
│   └── geojson/              # GeoJSON files
│       └── maps-master.zip
│
├── database/                  # Database-related files
│   ├── vahan_data.json       # Legacy JSON data
│   └── tickets_data.json     # Legacy JSON data
│
├── docker/                    # Docker-related files
│   ├── docker-compose.yml    # Production compose
│   └── docker-compose.dev.yml # Development compose
│
├── scripts/                   # Utility scripts
│   ├── deploy/               # Deployment scripts
│   └── utils/                # Utility scripts
│
├── memory/                    # Project memory/PRD
│   └── PRD.md
│
├── docker-compose.yml         # Production compose (symlink)
├── docker-compose.dev.yml     # Development compose (symlink)
├── Makefile                   # Make commands
├── .gitignore                 # Git ignore rules
├── README.md                  # Quick start guide
└── PROJECT_STRUCTURE.md       # This file
```

## Key Directories

### `/backend`
FastAPI backend application containing:
- **`api/`**: API routes organized by domain (to be implemented)
- **`core/`**: Core configuration, database connection, middleware
- **`services/`**: Business logic layer (to be implemented)
- **`utils/`**: Utility functions and helpers
- **`models/`**: Data models
- **`server.py`**: Main FastAPI application

### `/frontend`
React frontend application containing:
- **`api/`**: API client functions (to be implemented)
- **`components/`**: Reusable React components and UI components (Shadcn/ui)
- **`pages/`**: Page components
- **`hooks/`**: Custom React hooks
- **`lib/`**: Utility libraries
- **`config/`**: Configuration files (API config)
- **`constants/`**: Constants (routes, etc.)
- **`public/`**: Static assets

### `/tests`
All test files organized by test type:
- **Smoke tests**: Quick sanity checks
- **Unit tests**: Individual function testing
- **API tests**: Endpoint functionality
- **Database tests**: Data integrity
- **Security tests**: Security validation
- **Integration tests**: Component interaction
- **Validation tests**: Edge cases
- **Performance tests**: Load/stress testing
- **Regression tests**: Existing functionality
- **Compatibility tests**: Cross-platform/browser

### `/docs`
All project documentation:
- Test reports and summaries
- Troubleshooting guides
- Technical documentation
- API documentation

### `/data`
All data files organized by type:
- **excel/**: Excel data files
- **geojson/**: Geographic data files

## Running Tests

From the project root:
```bash
# Run all tests
python3 tests/run_all_tests.py

# Run individual test suites
python3 tests/test_smoke.py
python3 tests/test_unit_comprehensive.py
python3 tests/test_all_endpoints.py
# ... etc
```

## Running the Application

### Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Benefits of This Structure

1. **Clear Separation**: Backend, frontend, tests, and docs are clearly separated
2. **Easy Navigation**: Related files are grouped together
3. **Scalability**: Easy to add new tests, docs, or data files
4. **Maintainability**: Clear organization makes maintenance easier
5. **Professional**: Follows industry best practices

## Migration Notes

- All test files moved from root to `/tests`
- All documentation moved from root to `/docs`
- All Excel files moved to `/data/excel`
- All GeoJSON files moved to `/data/geojson`
- Test imports updated to work with new structure
- Test runner updated to reflect new locations

