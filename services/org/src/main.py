from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"service": "org"}  # Identifies the service

@app.get("/health")
def health_check():
    return {"status": "OK", "service": "org"}  # Health check endpoint
