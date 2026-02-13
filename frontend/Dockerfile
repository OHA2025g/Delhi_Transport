# Frontend Dockerfile - Simple multi-stage build (CRA/CRACO) + Nginx
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# If you ever face native module build issues, uncomment these:
# RUN apk add --no-cache python3 make g++

# Install deps
COPY package*.json ./
# If you use npm:
RUN npm ci --legacy-peer-deps

# Copy source and build
COPY . .

# Build-time env (NOTE: CRA reads REACT_APP_* at build time only)
ARG REACT_APP_BACKEND_URL=https://delhitransport.demoapi.agrayianailabs.com
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# curl for healthcheck
RUN apk add --no-cache curl

# Copy build output
COPY --from=builder /app/build /usr/share/nginx/html

# Nginx config (make sure it listens on 80)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Health endpoint (simple file)
RUN echo '{"status":"healthy"}' > /usr/share/nginx/html/health && chmod 644 /usr/share/nginx/html/health

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -fsS http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
