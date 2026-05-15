from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import date
from typing import List, Optional
from app.models import SandhaPayment, MealContribution, Donation, ZakathDonation, ZakathBeneficiary, Member
from app.schemas import SandhaPaymentCreate, MealContributionCreate, DonationCreate, ZakathDonationCreate, ZakathBeneficiaryCreate

class PaymentService:
    def __init__(self, db: Session):
        self.db = db

    # Sandha Payments
    def record_sandha_payment(self, memno: str, payment: SandhaPaymentCreate, recorded_by: str) -> SandhaPayment:
        db_payment = SandhaPayment(
            memno=memno,
            month=payment.month,
            amount=payment.amount,
            paid_on=payment.paid_on or date.today(),
            receipt_no=payment.receipt_no,
            recorded_by=recorded_by
        )
        self.db.add(db_payment)
        self.db.commit()
        self.db.refresh(db_payment)
        return db_payment

    def get_member_sandha_history(self, memno: str) -> List[SandhaPayment]:
        return self.db.query(SandhaPayment).filter(SandhaPayment.memno == memno).order_by(SandhaPayment.month.desc()).all()

    def get_monthly_sandha_summary(self, year: int, month: int):
        result = self.db.query(
            func.sum(SandhaPayment.amount).label('total'),
            func.count(SandhaPayment.id).label('count')
        ).filter(
            extract('year', SandhaPayment.month) == year,
            extract('month', SandhaPayment.month) == month
        ).first()
        return {"total": result.total or 0, "count": result.count or 0}

    # Meal Contributions
    def record_meal_contribution(self, memno: str, contribution: MealContributionCreate, recorded_by: str) -> MealContribution:
        db_contribution = MealContribution(
            memno=memno,
            month=contribution.month,
            amount=contribution.amount,
            paid_on=contribution.paid_on or date.today(),
            recorded_by=recorded_by
        )
        self.db.add(db_contribution)
        self.db.commit()
        self.db.refresh(db_contribution)
        return db_contribution

    def get_member_meal_history(self, memno: str) -> List[MealContribution]:
        return self.db.query(MealContribution).filter(MealContribution.memno == memno).order_by(MealContribution.month.desc()).all()

    # Donations
    def record_donation(self, donation: DonationCreate, recorded_by: str) -> Donation:
        db_donation = Donation(
            donor_type=donation.donor_type,
            donor_id=donation.donor_id,
            amount=donation.amount,
            reason=donation.reason,
            dated=donation.dated or date.today(),
            recorded_by=recorded_by
        )
        self.db.add(db_donation)
        self.db.commit()
        self.db.refresh(db_donation)
        return db_donation

    def get_donations(self, donor_type: Optional[str] = None, start_date: Optional[date] = None, end_date: Optional[date] = None):
        query = self.db.query(Donation)
        if donor_type:
            query = query.filter(Donation.donor_type == donor_type)
        if start_date:
            query = query.filter(Donation.dated >= start_date)
        if end_date:
            query = query.filter(Donation.dated <= end_date)
        return query.order_by(Donation.dated.desc()).all()

    # Zakath
    def record_zakath_donation(self, donor_memno: str, donation: ZakathDonationCreate, recorded_by: str) -> ZakathDonation:
        db_donation = ZakathDonation(
            donor_memno=donor_memno,
            year=donation.year,
            amount=donation.amount,
            dated=donation.dated or date.today(),
            recorded_by=recorded_by
        )
        self.db.add(db_donation)
        self.db.commit()
        self.db.refresh(db_donation)
        return db_donation

    def get_zakath_donations(self, year: Optional[int] = None):
        query = self.db.query(ZakathDonation)
        if year:
            query = query.filter(ZakathDonation.year == year)
        return query.order_by(ZakathDonation.year.desc()).all()

    def add_zakath_beneficiary(self, zakath_id: int, beneficiary: ZakathBeneficiaryCreate) -> ZakathBeneficiary:
        db_beneficiary = ZakathBeneficiary(
            zakath_id=zakath_id,
            memno=beneficiary.memno,
            amount=beneficiary.amount,
            pay_type=beneficiary.pay_type,
            months=beneficiary.months,
            start_month=beneficiary.start_month,
            end_month=beneficiary.end_month
        )
        self.db.add(db_beneficiary)
        self.db.commit()
        self.db.refresh(db_beneficiary)
        return db_beneficiary

    def get_zakath_beneficiaries(self, zakath_id: Optional[int] = None, is_closed: Optional[bool] = None):
        query = self.db.query(ZakathBeneficiary)
        if zakath_id:
            query = query.filter(ZakathBeneficiary.zakath_id == zakath_id)
        if is_closed is not None:
            query = query.filter(ZakathBeneficiary.is_closed == is_closed)
        return query.all()