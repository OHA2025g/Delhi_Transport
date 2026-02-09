# Delhi Vehicle Portal - Citizen Assistance Platform

A comprehensive AI-powered citizen assistance platform for transport department with advanced analytics, KPIs, and real-time dashboards.

## 🚀 Quick Start

### Option 1: Docker (Recommended)

**Prerequisites**: Docker Engine 20.10+ and Docker Compose 2.0+

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Using Makefile** (easier):
```bash
make build    # Build images
make up       # Start services (production)
make up-dev   # Start services (development)
make logs     # View logs
make down     # Stop services
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- MongoDB: localhost:27017

See [Docker Setup Guide](docs/DOCKER_SETUP.md) for detailed instructions.

### Option 2: Manual Setup

**Prerequisites**
- Python 3.8+
- Node.js 16+
- MongoDB 4.4+

**Backend Setup**
```bash
cd backend
pip install -r requirements.txt
# Configure .env file with MongoDB connection
python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend Setup**
```bash
cd frontend
npm install
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📁 Project Structure

```
delhi_vehicle_portal/
├── backend/          # FastAPI backend
├── frontend/         # React frontend
├── tests/            # All test files
├── docs/             # Documentation
├── data/             # Data files (Excel, GeoJSON)
└── database/         # Database files
```

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for detailed structure.

## 🧪 Testing

Run comprehensive test suite:
```bash
python3 tests/run_all_tests.py
```

Individual test suites:
```bash
python3 tests/test_smoke.py              # Smoke tests
python3 tests/test_unit_comprehensive.py # Unit tests
python3 tests/test_all_endpoints.py     # API tests
python3 tests/test_database.py          # Database tests
python3 tests/test_security.py          # Security tests
python3 tests/test_integration.py       # Integration tests
python3 tests/test_validation.py        # Validation tests
python3 tests/test_performance.py       # Performance tests
```

## 📊 Features

1. **KPI Dashboard** - National, State, and RTO level KPIs
2. **Advanced KPI Dashboard** - Derived metrics and analytics
3. **Executive Dashboard** - High-level executive insights
4. **India Heat Map** - State-wise data visualization
5. **AI Chatbot** - Multilingual voice-enabled assistant
6. **Vehicle Analytics** - VAHAN data analysis
7. **Ticket Management** - AI-powered categorization
8. **Sentiment Analysis** - Public mood analysis
9. **Document Verification** - OCR for documents
10. **Facial Recognition** - Identity verification
11. **Vehicle Detection** - Automatic classification

## 🔧 Configuration

### Environment Variables

Create `backend/.env`:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=citizen_assistance
RATE_LIMIT_ENABLED=false
RATE_LIMIT_RPM=100
```

### Data Loading

Data is automatically loaded from Excel files in `data/excel/` on first startup:
- `Vahan1.xlsx` - Vehicle registration data
- `Tickets.xlsx` - Ticket/grievance data
- `Parivahan_Dashboard_extra_KPI.xlsx` - KPI data
- `transport_extra_kpi_mock_data_FY2025_26.xlsx` - Additional KPI data

## 📚 Documentation

- [Project Structure](PROJECT_STRUCTURE.md)
- [Test Reports](docs/TEST_REPORT.md)
- [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
- [API Documentation](http://localhost:8000/docs)

## 🛠️ Development

### Backend Development
```bash
cd backend
# Install dependencies
pip install -r requirements.txt

# Run with auto-reload
python -m uvicorn server:app --reload

# Run tests
python3 ../tests/test_all_endpoints.py
```

### Frontend Development
```bash
cd frontend
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## 🧪 Test Coverage

The project includes comprehensive testing:
- ✅ Unit Testing
- ✅ API/Functional Testing
- ✅ Database Testing
- ✅ Security Testing
- ✅ Integration Testing
- ✅ Validation/Boundary Testing
- ✅ Performance Testing
- ✅ Regression Testing
- ✅ Compatibility Testing
- ✅ Smoke/Sanity Testing

See [docs/TEST_REPORT.md](docs/TEST_REPORT.md) for detailed test results.

## 📝 License

[Add your license information here]

## 👥 Contributors

[Add contributor information here]

## 📞 Support

For issues and questions, please refer to:
- [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
- [Error Troubleshooting](docs/ERROR_TROUBLESHOOTING.md)

