FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc python3-dev && \
    rm -rf /var/lib/apt/lists/*

# First copy requirements for caching
COPY services/org/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Then copy source files
COPY services/org/src/ src/

EXPOSE 8002
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8002"]
