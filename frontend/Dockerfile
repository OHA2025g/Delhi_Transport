# ============================================
# Frontend Dockerfile - Multi-stage build (React + Nginx)
# 
# ✅ NEW KPI CARDS INCLUDED (Executive Dashboard):
# 
# 1. Revenue Collected Card:
#    - Title: "Revenue Collected"
#    - Icon: DollarSign
#    - Data Source: summary.revenue_collected from API
#    - Format: ₹X.XXCr (if >= 10M), ₹X.XXL (if >= 100K), ₹X (otherwise)
#    - Location: frontend/src/pages/ExecutiveDashboard.jsx lines 102-117
#    - Color: secondary
# 
# 2. Tax Defaulter Count Card:
#    - Title: "Tax Defaulter Count"
#    - Icon: Shield
#    - Data Source: summary.tax_defaulter_count from API
#    - Format: Number with locale formatting (e.g., 3,336)
#    - Location: frontend/src/pages/ExecutiveDashboard.jsx lines 127-133
#    - Color: info
# 
# 3. Accident Card:
#    - Title: "Accident"
#    - Icon: AlertTriangle
#    - Data Source: summary.accidents from API
#    - Format: Number with locale formatting (e.g., 11,330)
#    - Location: frontend/src/pages/ExecutiveDashboard.jsx lines 143-149
#    - Color: primary
# 
# Executive Dashboard Component:
# - File: frontend/src/pages/ExecutiveDashboard.jsx
# - Fetches from: /api/dashboard/executive-summary
# - Displays all KPI cards including the three new ones above
# ============================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies for native modules (if needed)
# Uncomment if you face build issues with native modules
# RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
# Using --legacy-peer-deps to handle peer dependency conflicts
RUN npm ci --legacy-peer-deps

# Copy all source files
COPY . .

# Build-time environment variables
# NOTE: CRA reads REACT_APP_* at build time only
# In production, frontend uses relative /api path (proxied by nginx)
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL}

# Build the React application
# This includes all components including ExecutiveDashboard with new KPI cards
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy build output from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy Nginx configuration
# This includes /api proxy configuration for backend API
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create health endpoint
RUN echo '{"status":"healthy"}' > /usr/share/nginx/html/health && \
    chmod 644 /usr/share/nginx/html/health

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -fsS http://localhost/health || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
