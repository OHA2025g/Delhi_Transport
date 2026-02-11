# Frontend Dockerfile
# Multi-stage build for optimized production image

# Stage 1: Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY craco.config.js ./
COPY postcss.config.js ./
COPY tailwind.config.js ./
COPY jsconfig.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY public/ ./public/
COPY src/ ./src/

# Build the application
RUN npm run build

# Stage 2: Production stage
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration template
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Copy GeoJSON files to public directory
COPY public/states.geojson /usr/share/nginx/html/states.geojson

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Start nginx
# Nginx image automatically runs envsubst on templates in /etc/nginx/templates
# and outputs to /etc/nginx/conf.d
CMD ["nginx", "-g", "daemon off;"]

