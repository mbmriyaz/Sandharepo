from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Import ALL models BEFORE Base.metadata.create_all()
from app.database import engine, Base
from app.models import (
    User, Member, MemberChild, NonRelatedResident, 
    SandhaPayment, MealContribution, Donation, 
    ZakathDonation, ZakathBeneficiary, Staff, 
    TempWorker, OfficeBearer, MemberRemark
)

# Create tables
Base.metadata.create_all(bind=engine)

from app.routes import auth, members, payments, reports

app = FastAPI(
    title="Masjidh Sandha API",
    description="API for managing masjid membership, payments, and reports",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files (photos and QR codes)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

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
