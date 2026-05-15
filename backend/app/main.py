from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import auth, members, payments, reports

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Masjidh Sandha API",
    description="API for managing masjid membership, payments, and reports",
    version="1.0.0"
)

# CORS middleware - allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(members.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(reports.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Welcome to Masjidh Sandha API", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}