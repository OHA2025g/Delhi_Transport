"""
Custom middleware for the application.
"""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from time import time
from collections import defaultdict
from .config import RATE_LIMIT_ENABLED, RATE_LIMIT_RPM

# Rate limiting storage
_rate_limit_store: dict[str, list[float]] = defaultdict(list)

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware to limit requests per minute per IP."""
    
    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for health checks
        if request.url.path in ["/health", "/api/health"]:
            return await call_next(request)
        
        if not RATE_LIMIT_ENABLED:
            return await call_next(request)
        
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        
        # Clean old entries (older than 1 minute)
        now = time()
        _rate_limit_store[client_ip] = [
            timestamp for timestamp in _rate_limit_store[client_ip]
            if now - timestamp < 60
        ]
        
        # Check rate limit
        if len(_rate_limit_store[client_ip]) >= RATE_LIMIT_RPM:
            from fastapi import HTTPException
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Maximum {RATE_LIMIT_RPM} requests per minute."
            )
        
        # Record this request
        _rate_limit_store[client_ip].append(now)
        
        return await call_next(request)

