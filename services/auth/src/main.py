from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"service": "auth services"}  # Identifies the service

@app.get("/health")
def health_check():
    return {"status": "OK", "service": "auth services"}  # Health check endpoint
