from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

# Import Base from database.py to ensure all models use the same metadata
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String)
    role = Column(String, default="staff")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)
    last_login = Column(DateTime, nullable=True)

class Member(Base):
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, index=True)
    memno = Column(String, unique=True, index=True)
    full_name = Column(String, nullable=False)
    id_number = Column(String, nullable=True)
    mobile_number = Column(String, nullable=True)
    whatsapp_number = Column(String, nullable=True)
    permanent_address = Column(Text, nullable=True)
    date_of_birth = Column(Date, nullable=True)
    civil_status = Column(String, default="Single")
    occupation = Column(String, nullable=True)
    residence_type = Column(String, nullable=False)
    owner_name = Column(String, nullable=True)
    owner_mobile = Column(String, nullable=True)
    sandha_amount = Column(Float, default=300.0)
    meal_contribution = Column(String, default="No")
    meal_contribution_amount = Column(Float, default=0.0)
    paying_other_masjid = Column(String, default="No")
    other_masjid_details = Column(String, nullable=True)
    special_needs = Column(String, nullable=True)
    is_sub_member = Column(String, default="No")
    parent_memno = Column(String, nullable=True)
    no_of_children = Column(Integer, default=0)
    children_above_18 = Column(Integer, default=0)
    total_family_members = Column(Integer, default=1)
    has_non_related = Column(String, default="No")
    photo_url = Column(String, nullable=True)
    qr_code_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    children = relationship("MemberChild", back_populates="member", cascade="all, delete-orphan")
    non_related = relationship("NonRelatedResident", back_populates="member", cascade="all, delete-orphan")
    sandha_payments = relationship("SandhaPayment", back_populates="member", cascade="all, delete-orphan")
    meal_contributions = relationship("MealContribution", back_populates="member", cascade="all, delete-orphan")
    remarks = relationship("MemberRemark", back_populates="member", cascade="all, delete-orphan")

class MemberChild(Base):
    __tablename__ = "member_children"

    id = Column(Integer, primary_key=True, index=True)
    memno = Column(String, ForeignKey("members.memno"))
    name = Column(String, nullable=False)
    date_of_birth = Column(Date, nullable=True)
    relationship_type = Column(String, nullable=True)
    school_name = Column(String, nullable=True)
    grade = Column(String, nullable=True)
    quran_madrasa = Column(String, nullable=True)
    occupation = Column(String, nullable=True)
    contact_number = Column(String, nullable=True)

    member = relationship("Member", back_populates="children")

class NonRelatedResident(Base):
    __tablename__ = "non_related_residents"

    id = Column(Integer, primary_key=True, index=True)
    memno = Column(String, ForeignKey("members.memno"))
    name = Column(String, nullable=False)
    id_card = Column(String, nullable=True)
    address = Column(String, nullable=True)
    purpose = Column(String, nullable=True)

    member = relationship("Member", back_populates="non_related")

class SandhaPayment(Base):
    __tablename__ = "sandha_payments"

    id = Column(Integer, primary_key=True, index=True)
    memno = Column(String, ForeignKey("members.memno"))
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    amount = Column(Float, nullable=False)
    paid_on = Column(Date, nullable=True)
    payment_mode = Column(String, default="Partial")
    receipt_no = Column(String, nullable=True)
    recorded_by = Column(String, nullable=True)

    member = relationship("Member", back_populates="sandha_payments")

class MealContribution(Base):
    __tablename__ = "meal_contributions"

    id = Column(Integer, primary_key=True, index=True)
    memno = Column(String, ForeignKey("members.memno"))
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    amount = Column(Float, nullable=False)
    paid_on = Column(Date, nullable=True)
    payment_mode = Column(String, default="Partial")
    receipt_no = Column(String, nullable=True)
    recorded_by = Column(String, nullable=True)

    member = relationship("Member", back_populates="meal_contributions")

class Donation(Base):
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True, index=True)
    donor_type = Column(String, nullable=False)
    donor_id = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    reason = Column(String, nullable=True)
    dated = Column(Date, nullable=True)
    recorded_by = Column(String, nullable=True)

class ZakathDonation(Base):
    __tablename__ = "zakath_donations"

    id = Column(Integer, primary_key=True, index=True)
    donor_memno = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    amount = Column(Float, nullable=False)
    dated = Column(Date, nullable=True)
    recorded_by = Column(String, nullable=True)

class ZakathBeneficiary(Base):
    __tablename__ = "zakath_beneficiaries"

    id = Column(Integer, primary_key=True, index=True)
    zakath_id = Column(Integer, ForeignKey("zakath_donations.id"))
    memno = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    pay_type = Column(String, nullable=False)
    months = Column(Integer, default=1)
    start_month = Column(Date, nullable=True)
    end_month = Column(Date, nullable=True)
    is_closed = Column(Boolean, default=False)

class Staff(Base):
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    id_card = Column(String, nullable=True)
    address = Column(String, nullable=True)
    mobile = Column(String, nullable=True)
    date_of_birth = Column(Date, nullable=True)
    date_of_joining = Column(Date, nullable=True)
    job_category = Column(String, nullable=True)
    basic_salary = Column(Float, nullable=True)
    incentive = Column(Float, nullable=True)
    bonus = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)

class TempWorker(Base):
    __tablename__ = "temp_workers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    task = Column(String, nullable=True)
    days = Column(Float, nullable=True)
    wage_per_day = Column(Float, nullable=True)
    total = Column(Float, nullable=True)
    worked_on = Column(Date, nullable=True)
    recorded_by = Column(String, nullable=True)

class OfficeBearer(Base):
    __tablename__ = "office_bearers"

    id = Column(Integer, primary_key=True, index=True)
    post = Column(String, nullable=False)
    memno = Column(String, nullable=False)
    year_from = Column(Date, nullable=True)
    year_to = Column(Date, nullable=True)

class MemberRemark(Base):
    __tablename__ = "member_remarks"

    id = Column(Integer, primary_key=True, index=True)
    memno = Column(String, ForeignKey("members.memno"))
    remark = Column(Text, nullable=False)
    added_on = Column(Date, default=datetime.now)
    added_by = Column(String, nullable=True)

    member = relationship("Member", back_populates="remarks")
