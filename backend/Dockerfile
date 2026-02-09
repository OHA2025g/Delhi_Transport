# Multi-stage build for optimized Docker image
FROM python:3.11-slim as builder

# Install system dependencies for building Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Final stage - runtime image
FROM python:3.11-slim

# Install system dependencies for runtime
# Including Tesseract OCR and its dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Tesseract OCR and language data
    tesseract-ocr \
    tesseract-ocr-eng \
    tesseract-ocr-hin \
    # Image processing libraries for OpenCV and PIL
    libgl1-mesa-glx \
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
    # Utilities
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy Python packages from builder stage
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Create necessary directories first
RUN mkdir -p ./backend/models ./backend/api ./backend/services ./data/excel ./logs

# Copy application code - main files (required)
COPY backend/server.py ./backend/
COPY backend/core/ ./backend/core/
COPY backend/utils/ ./backend/utils/

# Copy models directory (has README.md, so it exists)
COPY backend/models/ ./backend/models/

# Copy data files
COPY data/excel/ ./data/excel/

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    TESSDATA_PREFIX=/usr/share/tesseract-ocr/5/tessdata \
    TESSERACT_CMD=/usr/bin/tesseract

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["python", "-m", "uvicorn", "backend.server:app", "--host", "0.0.0.0", "--port", "8000"]
