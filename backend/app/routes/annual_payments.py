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
    AnnualPaymentSummary
)
from app.services.annual_payment_service import AnnualPaymentService

router = APIRouter(prefix="/payments", tags=["Payments"])

# Annual Sandha Payments
@router.get("/sandha/annual-summary/{memno}")
def get_sandha_annual_summary(
    memno: str,
    year: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    service = AnnualPaymentService(db)
    return service.get_member_annual_summary(memno, year, "sandha")

@router.post("/sandha/full/{memno}")
def pay_sandha_full(
    memno: str,
    year: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    service = AnnualPaymentService(db)
    service.record_full_payment(memno, year, "sandha", current_user.username)
    return {"message": f"Full annual sandha payment recorded for {year}"}

@router.post("/sandha/partial/{memno}")
def pay_sandha_partial(
    memno: str,
    year: int,
    months: List[int],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    service = AnnualPaymentService(db)
    service.record_partial_payment(memno, year, months, "sandha", current_user.username)
    return {"message": f"Partial sandha payment recorded for months: {months}"}

@router.get("/sandha/history/{memno}")
def get_sandha_history(
    memno: str,
    year: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    service = AnnualPaymentService(db)
    return service.get_payment_history(memno, year, "sandha")

@router.get("/sandha/chart/{memno}")
def get_sandha_chart(
    memno: str,
    year: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    service = AnnualPaymentService(db)
    return service.get_chart_data(memno, year, "sandha")

# Annual Meal Contributions
@router.get("/meal/annual-summary/{memno}")
def get_meal_annual_summary(
    memno: str,
    year: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    service = AnnualPaymentService(db)
    return service.get_member_annual_summary(memno, year, "meal")

@router.post("/meal/full/{memno}")
def pay_meal_full(
    memno: str,
    year: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    service = AnnualPaymentService(db)
    service.record_full_payment(memno, year, "meal", current_user.username)
    return {"message": f"Full annual meal payment recorded for {year}"}

@router.post("/meal/partial/{memno}")
def pay_meal_partial(
    memno: str,
    year: int,
    months: List[int],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    service = AnnualPaymentService(db)
    service.record_partial_payment(memno, year, months, "meal", current_user.username)
    return {"message": f"Partial meal payment recorded for months: {months}"}

@router.get("/meal/history/{memno}")
def get_meal_history(
    memno: str,
    year: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    service = AnnualPaymentService(db)
    return service.get_payment_history(memno, year, "meal")

@router.get("/meal/chart/{memno}")
def get_meal_chart(
    memno: str,
    year: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    service = AnnualPaymentService(db)
    return service.get_chart_data(memno, year, "meal")