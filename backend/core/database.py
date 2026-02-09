"""
Database connection and setup.
"""
from motor.motor_asyncio import AsyncIOMotorClient
from .config import MONGO_URL, DB_NAME, MONGO_TIMEOUT_MS

# MongoDB connection
client = AsyncIOMotorClient(
    MONGO_URL,
    serverSelectionTimeoutMS=MONGO_TIMEOUT_MS,
    connectTimeoutMS=MONGO_TIMEOUT_MS,
    socketTimeoutMS=MONGO_TIMEOUT_MS,
)

db = client[DB_NAME]

# Collection references
vahan_collection = db.vahan_data
tickets_collection = db.tickets_data
kpi_state_collection = db.kpi_state_general
kpi_rto_collection = db.kpi_rto_general
facial_verifications_collection = db.facial_verifications

