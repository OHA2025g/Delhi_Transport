# ============================================
# Multi-stage Dockerfile for Delhi Vehicle Portal Backend
# Includes: FastAPI, MongoDB, OCR (Tesseract), and all dependencies
# 
# ✅ NEW KPI FEATURES INCLUDED (Executive Dashboard):
# - revenue_collected: Aggregated from kpi_state_general collection
#   * Field: "Revenue - Total"
#   * Sums all records for latest month
#   * Returns: Float (rounded to 2 decimals)
# 
# - tax_defaulter_count: Aggregated from kpi_rto_performance collection
#   * Field: "Tax Defaulter - Count"
#   * Sums all RTO records for latest month
#   * Returns: Integer (rounded to 0 decimals)
# 
# - accidents: Aggregated from kpi_state_general collection
#   * Field: "Road Accidents"
#   * Sums all records for latest month
#   * Returns: Integer (rounded to 0 decimals)
# 
# Executive Dashboard API Endpoint:
# - GET /api/dashboard/executive-summary
#   * Returns all KPI fields including the three new ones above
#   * Handles state/district/city filtering
#   * Includes AI insights and data quality metrics
# ============================================

# Stage 1: Builder stage - Install Python dependencies
FROM python:3.11-slim as builder

# Install system dependencies for building Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    make \
    cmake \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for better Docker layer caching
COPY backend/requirements.txt .

# Upgrade pip and install Python dependencies
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# Stage 2: Runtime stage - Final optimized image
FROM python:3.11-slim

# Install runtime system dependencies
# Including Tesseract OCR, OpenCV dependencies, and utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Tesseract OCR and language data (English & Hindi)
    tesseract-ocr \
    tesseract-ocr-eng \
    tesseract-ocr-hin \
    # Image processing libraries for OpenCV and PIL
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    # Additional dependencies for EasyOCR and OpenCV
    libgthread-2.0-0 \
    libgtk-3-0 \
    libavcodec-dev \
    libavformat-dev \
    libswscale-dev \
    libgstreamer1.0-0 \
    libgstreamer-plugins-base1.0-0 \
    # PDF processing (for PDF to image conversion)
    poppler-utils \
    # Utilities
    curl \
    wget \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy Python packages from builder stage
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Create necessary directories
RUN mkdir -p ./backend/models \
    ./backend/api \
    ./backend/services \
    ./backend/excel \
    ./data/excel \
    ./logs

# Copy application code
# Main server file (includes new KPI fields: revenue_collected, tax_defaulter_count, accidents)
# Location: backend/server.py lines 4047-4126
COPY backend/server.py ./backend/

# Core modules (config, database, middleware)
COPY backend/core/ ./backend/core/

# Utils modules (helpers, field value extractors)
COPY backend/utils/ ./backend/utils/

# Copy data files (Excel files for initial data loading)
COPY data/excel/Vahan1.xlsx ./data/excel/Vahan1.xlsx
COPY data/excel/Tickets.xlsx ./data/excel/Tickets.xlsx
COPY data/excel/transport_extra_kpi_mock_data_FY2025_26.xlsx ./data/excel/transport_extra_kpi_mock_data_FY2025_26.xlsx
COPY data/excel/Parivahan_Dashboard_extra_KPI.xlsx ./data/excel/Parivahan_Dashboard_extra_KPI.xlsx

# Copy RTO Analysis Excel processing modules
COPY backend/excel/ ./backend/excel/

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app \
    # Tesseract configuration
    TESSDATA_PREFIX=/usr/share/tesseract-ocr/5/tessdata \
    TESSERACT_CMD=/usr/bin/tesseract \
    # OpenCV configuration
    OPENCV_DISABLE_OMP_THREADS=1

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["python", "-m", "uvicorn", "backend.server:app", "--host", "0.0.0.0", "--port", "8000"]
