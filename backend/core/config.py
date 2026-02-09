"""
Configuration settings for the application.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent.parent.parent

# Load environment variables
load_dotenv(ROOT_DIR / 'backend' / '.env')

# MongoDB Configuration
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'citizen_assistance')
MONGO_TIMEOUT_MS = int(os.environ.get("MONGO_TIMEOUT_MS", "2000"))

# Rate Limiting
RATE_LIMIT_ENABLED = os.environ.get('RATE_LIMIT_ENABLED', 'false').lower() == 'true'
RATE_LIMIT_RPM = int(os.environ.get('RATE_LIMIT_RPM', '100'))

# CORS Configuration
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
]

# Data Paths
DATA_DIR = ROOT_DIR / "data"
EXCEL_DATA_DIR = DATA_DIR / "excel"
GEOJSON_DATA_DIR = DATA_DIR / "geojson"

