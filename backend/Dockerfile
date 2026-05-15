FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Create data directory with proper permissions
RUN mkdir -p /data && chmod 777 /data

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set environment variables
ENV DATABASE_URL=sqlite:////data/sandha.db
ENV SECRET_KEY=your-production-secret-key-change-this
ENV ACCESS_TOKEN_EXPIRE_MINUTES=60

# Expose port
EXPOSE 8000

# Run the application
CMD ["python", "run.py"]