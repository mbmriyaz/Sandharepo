from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_active_user
from app.models import User
from app.schemas import (
    SandhaPaymentCreate, SandhaPaymentResponse,
    MealContributionCreate, MealContributionResponse,
    DonationCreate, DonationResponse,
    ZakathDonationCreate, ZakathDonationResponse,
    ZakathBeneficiaryCreate, ZakathBeneficiaryResponse
)
from app.services.payment_service import PaymentService

router = APIRouter(prefix="/payments", tags=["Payments"])

# Sandha Payments
@router.post("/sandha/{memno}", response_model=SandhaPaymentResponse)
def record_sandha(
    memno: str,
    payment: SandhaPaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    service = PaymentService(db)
    return service.record_sandha_payment(memno, payment, current_user.username)

@router.get("/sandha/{memno}")
def get_sandha_history(
    memno: str,
    year: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    service = PaymentService(db)
    return service.get_member_sandha_history(memno, year)

@router.get("/sandha/{memno}/summary")
def get_sandha_summary(
    memno: str,
    year: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    service = PaymentService(db)
    summary = service.get_member_sandha_summary(memno, year)
    if not summary:
        raise HTTPException(status_code=404, detail="Member not found")
    return summary

# Meal Contributions
@router.post("/meal/{memno}", response_model=MealContributionResponse)
def record_meal(
    memno: str,
    contribution: MealContributionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    service = PaymentService(db)
    return service.record_meal_contribution(memno, contribution, current_user.username)

@router.get("/meal/{memno}")
def get_meal_history(
    memno: str,
    year: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    service = PaymentService(db)
    return service.get_member_meal_history(memno, year)

@router.get("/meal/{memno}/summary")
def get_meal_summary(
    memno: str,
    year: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    service = PaymentService(db)
    summary = service.get_member_meal_summary(memno, year)
    if not summary:
        raise HTTPException(status_code=404, detail="Member not found")
    return summary

# Donations
@router.post("/donations", response_model=DonationResponse)
def record_donation(
    donation: DonationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    service = PaymentService(db)
    return service.record_donation(donation, current_user.username)

@router.get("/donations", response_model=List[DonationResponse])
def get_donations(
    donor_type: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    service = PaymentService(db)
    return service.get_donations(donor_type, start_date, end_date)

# Zakath
@router.post("/zakath/{donor_memno}", response_model=ZakathDonationResponse)
def record_zakath(
    donor_memno: str,
    donation: ZakathDonationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    service = PaymentService(db)
    return service.record_zakath_donation(donor_memno, donation, current_user.username)

@router.get("/zakath")
def get_zakath_donations(
    year: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    service = PaymentService(db)
    return service.get_zakath_donations(year)

@router.post("/zakath/{zakath_id}/beneficiaries", response_model=ZakathBeneficiaryResponse)
def add_zakath_beneficiary(
    zakath_id: int,
    beneficiary: ZakathBeneficiaryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    service = PaymentService(db)
    return service.add_zakath_beneficiary(zakath_id, beneficiary)

@router.get("/zakath/beneficiaries")
def get_zakath_beneficiaries(
    zakath_id: Optional[int] = None,
    is_closed: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    service = PaymentService(db)
    return service.get_zakath_beneficiaries(zakath_id, is_closed)