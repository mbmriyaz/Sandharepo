from sqlalchemy.orm import Session
from sqlalchemy import func, extract, and_
from datetime import date
from typing import List, Optional, Dict, Any
from app.models import SandhaPayment, MealContribution, Member
from app.schemas import SandhaPaymentCreate, MealContributionCreate, AnnualPaymentSummary

class AnnualPaymentService:
    def __init__(self, db: Session):
        self.db = db

    def get_member_annual_summary(self, memno: str, year: int, payment_type: str = "sandha") -> AnnualPaymentSummary:
        """Get annual payment summary for a member"""
        member = self.db.query(Member).filter(Member.memno == memno).first()
        if not member:
            return None

        monthly_amount = member.sandha_amount if payment_type == "sandha" else member.meal_amount
        total_annual = monthly_amount * 12

        # Get payments for the year
        if payment_type == "sandha":
            payments = self.db.query(SandhaPayment).filter(
                SandhaPayment.memno == memno,
                SandhaPayment.year == year
            ).all()
        else:
            payments = self.db.query(MealContribution).filter(
                MealContribution.memno == memno,
                MealContribution.year == year
            ).all()

        paid_months = sorted([p.month for p in payments])
        total_paid = sum(p.amount for p in payments)
        total_unpaid = total_annual - total_paid

        all_months = set(range(1, 13))
        unpaid_months = sorted(list(all_months - set(paid_months)))

        payment_percentage = (total_paid / total_annual * 100) if total_annual > 0 else 0

        return {
            "memno": memno,
            "member_name": member.full_name,
            "year": year,
            "monthly_amount": monthly_amount,
            "total_annual_amount": total_annual,
            "total_paid": total_paid,
            "total_unpaid": max(0, total_unpaid),
            "paid_months": paid_months,
            "unpaid_months": unpaid_months,
            "payment_percentage": round(payment_percentage, 2)
        }

    def record_full_payment(self, memno: str, year: int, payment_type: str = "sandha", recorded_by: str = ""):
        """Record full annual payment"""
        member = self.db.query(Member).filter(Member.memno == memno).first()
        if not member:
            raise ValueError("Member not found")

        monthly_amount = member.sandha_amount if payment_type == "sandha" else member.meal_amount

        # Delete existing payments for the year
        if payment_type == "sandha":
            self.db.query(SandhaPayment).filter(
                SandhaPayment.memno == memno,
                SandhaPayment.year == year
            ).delete()

            # Create 12 monthly payments
            for month in range(1, 13):
                payment = SandhaPayment(
                    memno=memno,
                    year=year,
                    month=month,
                    amount=monthly_amount,
                    paid_on=date.today(),
                    payment_mode="Full",
                    recorded_by=recorded_by
                )
                self.db.add(payment)
        else:
            self.db.query(MealContribution).filter(
                MealContribution.memno == memno,
                MealContribution.year == year
            ).delete()

            for month in range(1, 13):
                payment = MealContribution(
                    memno=memno,
                    year=year,
                    month=month,
                    amount=monthly_amount,
                    paid_on=date.today(),
                    payment_mode="Full",
                    recorded_by=recorded_by
                )
                self.db.add(payment)

        self.db.commit()
        return True

    def record_partial_payment(self, memno: str, year: int, months: List[int], payment_type: str = "sandha", recorded_by: str = ""):
        """Record partial payment for selected months"""
        member = self.db.query(Member).filter(Member.memno == memno).first()
        if not member:
            raise ValueError("Member not found")

        monthly_amount = member.sandha_amount if payment_type == "sandha" else member.meal_amount

        for month in months:
            if payment_type == "sandha":
                # Check if already paid
                existing = self.db.query(SandhaPayment).filter(
                    SandhaPayment.memno == memno,
                    SandhaPayment.year == year,
                    SandhaPayment.month == month
                ).first()

                if not existing:
                    payment = SandhaPayment(
                        memno=memno,
                        year=year,
                        month=month,
                        amount=monthly_amount,
                        paid_on=date.today(),
                        payment_mode="Partial",
                        recorded_by=recorded_by
                    )
                    self.db.add(payment)
            else:
                existing = self.db.query(MealContribution).filter(
                    MealContribution.memno == memno,
                    MealContribution.year == year,
                    MealContribution.month == month
                ).first()

                if not existing:
                    payment = MealContribution(
                        memno=memno,
                        year=year,
                        month=month,
                        amount=monthly_amount,
                        paid_on=date.today(),
                        payment_mode="Partial",
                        recorded_by=recorded_by
                    )
                    self.db.add(payment)

        self.db.commit()
        return True

    def get_payment_history(self, memno: str, year: int, payment_type: str = "sandha"):
        """Get payment history for a member"""
        if payment_type == "sandha":
            return self.db.query(SandhaPayment).filter(
                SandhaPayment.memno == memno,
                SandhaPayment.year == year
            ).order_by(SandhaPayment.month).all()
        else:
            return self.db.query(MealContribution).filter(
                MealContribution.memno == memno,
                MealContribution.year == year
            ).order_by(MealContribution.month).all()

    def get_chart_data(self, memno: str, year: int, payment_type: str = "sandha") -> Dict[str, Any]:
        """Get data for pie chart"""
        summary = self.get_member_annual_summary(memno, year, payment_type)
        if not summary:
            return None

        return {
            "labels": ["Paid", "Unpaid"],
            "datasets": [{
                "data": [summary["total_paid"], summary["total_unpaid"]],
                "backgroundColor": ["#22c55e", "#ef4444"],
                "borderColor": ["#16a34a", "#dc2626"],
                "borderWidth": 1
            }]
        }