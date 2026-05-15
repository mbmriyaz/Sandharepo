from typing import Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_active_user, get_admin_user
from app.models import User
from app.schemas import ReportFilter
from app.services.report_service import ReportService
from fastapi.responses import StreamingResponse
import csv
import io

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/monthly-summary")
def monthly_summary(
    year: int,
    month: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    service = ReportService(db)
    return service.get_monthly_income_summary(year, month)

@router.get("/member-history/{memno}")
def member_history(
    memno: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    service = ReportService(db)
    history = service.get_member_payment_history(memno)
    if not history:
        raise HTTPException(status_code=404, detail="Member not found")
    return history

@router.get("/sandha-defaulters")
def sandha_defaulters(
    year: int,
    month: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    service = ReportService(db)
    return service.get_sandha_defaulters(year, month)

@router.get("/meal-contributors")
def meal_contributors(
    year: int,
    month: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    service = ReportService(db)
    return service.get_meal_contributors(year, month)

@router.get("/staff-salary")
def staff_salary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    service = ReportService(db)
    return service.get_staff_salary_sheet()

@router.get("/zakath-summary")
def zakath_summary(
    year: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    service = ReportService(db)
    return service.get_zakath_summary(year)

@router.get("/temp-workers")
def temp_workers(
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    service = ReportService(db)
    return service.get_temp_worker_summary(start_date, end_date)

@router.get("/export-csv")
def export_csv(
    report_type: str,
    year: Optional[int] = None,
    month: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    service = ReportService(db)

    # Generate data based on report type
    if report_type == "monthly-summary" and year and month:
        data = [service.get_monthly_income_summary(year, month)]
        headers = ["year", "month", "total_sandha", "total_meal", "total_donations", "total_zakath", "grand_total"]
    elif report_type == "staff-salary":
        data = service.get_staff_salary_sheet()
        headers = ["id", "name", "category", "basic_salary", "incentive", "bonus", "total"]
    else:
        raise HTTPException(status_code=400, detail="Invalid report type or missing parameters")

    # Create CSV
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=headers)
    writer.writeheader()
    writer.writerows(data)
    output.seek(0)

    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={report_type}.csv"}
    )