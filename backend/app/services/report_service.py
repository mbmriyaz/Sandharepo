from sqlalchemy.orm import Session
from sqlalchemy import func, extract, text
from datetime import date
from typing import List, Dict, Any
from app.models import (
    Member, SandhaPayment, MealContribution, Donation, 
    ZakathDonation, ZakathBeneficiary, Staff, TempWorker
)

class ReportService:
    def __init__(self, db: Session):
        self.db = db

    def get_monthly_income_summary(self, year: int, month: int) -> Dict[str, Any]:
        sandha = self.db.query(func.sum(SandhaPayment.amount)).filter(
            extract('year', SandhaPayment.month) == year,
            extract('month', SandhaPayment.month) == month
        ).scalar() or 0

        meal = self.db.query(func.sum(MealContribution.amount)).filter(
            extract('year', MealContribution.month) == year,
            extract('month', MealContribution.month) == month
        ).scalar() or 0

        donations = self.db.query(func.sum(Donation.amount)).filter(
            extract('year', Donation.dated) == year,
            extract('month', Donation.dated) == month
        ).scalar() or 0

        zakath = self.db.query(func.sum(ZakathDonation.amount)).filter(
            extract('year', ZakathDonation.dated) == year,
            extract('month', ZakathDonation.dated) == month
        ).scalar() or 0

        return {
            "year": year,
            "month": month,
            "total_sandha": float(sandha),
            "total_meal": float(meal),
            "total_donations": float(donations),
            "total_zakath": float(zakath),
            "grand_total": float(sandha + meal + donations + zakath)
        }

    def get_member_payment_history(self, memno: str) -> Dict[str, Any]:
        member = self.db.query(Member).filter(Member.memno == memno).first()
        if not member:
            return None

        sandha = self.db.query(SandhaPayment).filter(SandhaPayment.memno == memno).all()
        meal = self.db.query(MealContribution).filter(MealContribution.memno == memno).all()
        donations = self.db.query(Donation).filter(Donation.donor_id == memno).all()

        return {
            "member": member,
            "sandha_payments": sandha,
            "meal_contributions": meal,
            "donations": donations
        }

    def get_sandha_defaulters(self, year: int, month: int) -> List[Member]:
        paid_members = self.db.query(SandhaPayment.memno).filter(
            extract('year', SandhaPayment.month) == year,
            extract('month', SandhaPayment.month) == month
        ).subquery()

        return self.db.query(Member).filter(~Member.memno.in_(paid_members)).all()

    def get_meal_contributors(self, year: int, month: int) -> List[Dict[str, Any]]:
        contributors = self.db.query(Member, MealContribution).join(
            MealContribution, Member.memno == MealContribution.memno
        ).filter(
            extract('year', MealContribution.month) == year,
            extract('month', MealContribution.month) == month
        ).all()

        return [
            {
                "memno": m.memno,
                "name": m.full_name,
                "amount": mc.amount,
                "paid_on": mc.paid_on
            }
            for m, mc in contributors
        ]

    def get_staff_salary_sheet(self) -> List[Dict[str, Any]]:
        staff = self.db.query(Staff).filter(Staff.is_active == True).all()
        return [
            {
                "id": s.id,
                "name": s.full_name,
                "category": s.job_category,
                "basic_salary": s.basic_salary,
                "incentive": s.incentive,
                "bonus": s.bonus,
                "total": (s.basic_salary or 0) + (s.incentive or 0) + (s.bonus or 0)
            }
            for s in staff
        ]

    def get_zakath_summary(self, year: int) -> Dict[str, Any]:
        total_collected = self.db.query(func.sum(ZakathDonation.amount)).filter(
            ZakathDonation.year == year
        ).scalar() or 0

        total_distributed = self.db.query(func.sum(ZakathBeneficiary.amount)).join(
            ZakathDonation
        ).filter(ZakathDonation.year == year).scalar() or 0

        beneficiaries = self.db.query(ZakathBeneficiary).join(
            ZakathDonation
        ).filter(ZakathDonation.year == year).all()

        return {
            "year": year,
            "total_collected": float(total_collected),
            "total_distributed": float(total_distributed),
            "remaining": float(total_collected - total_distributed),
            "beneficiary_count": len(beneficiaries)
        }

    def get_temp_worker_summary(self, start_date: date, end_date: date) -> List[Dict[str, Any]]:
        workers = self.db.query(TempWorker).filter(
            TempWorker.worked_on >= start_date,
            TempWorker.worked_on <= end_date
        ).all()

        return [
            {
                "id": w.id,
                "name": w.name,
                "task": w.task,
                "days": w.days,
                "wage_per_day": w.wage_per_day,
                "total": w.total,
                "worked_on": w.worked_on
            }
            for w in workers
        ]

    def get_audit_trail(self, table_name: str = None, start_date: date = None, end_date: date = None):
        from app.models import AuditLog
        query = self.db.query(AuditLog)
        if table_name:
            query = query.filter(AuditLog.table_name == table_name)
        if start_date:
            query = query.filter(AuditLog.changed_on >= start_date)
        if end_date:
            query = query.filter(AuditLog.changed_on <= end_date)
        return query.order_by(AuditLog.changed_on.desc()).all()