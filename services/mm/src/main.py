from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"service": "mm"}  # Identifies the service

@app.get("/health")
def health_check():
    return {"status": "OK", "service": "mm"}  # Health check endpoint
