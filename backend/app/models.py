from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Text, ForeignKey, Boolean, Enum
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    STAFF = "staff"
    MEMBER = "member"

class Member(Base):
    __tablename__ = "members"

    memno = Column(String, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    id_number = Column(String, nullable=True)
    mobile_number = Column(String)
    whatsapp_number = Column(String)
    permanent_address = Column(Text)
    date_of_birth = Column(Date)
    civil_status = Column(String)
    occupation = Column(String)
    residence_type = Column(String)
    owner_name = Column(String)
    owner_mobile = Column(String)
    sandha_amount = Column(Float, default=300.0)
    paying_other_masjid = Column(String, default="No")
    other_masjid_details = Column(Text)
    meal_contribution = Column(String, default="No")
    special_needs = Column(Text)
    no_of_children = Column(Integer, default=0)
    children_above_18 = Column(Integer, default=0)
    total_family_members = Column(Integer, default=1)
    has_non_related = Column(String, default="No")
    created_at = Column(DateTime)
    updated_at = Column(DateTime)

    children = relationship("MemberChild", back_populates="member")
    non_related = relationship("NonRelatedResident", back_populates="member")
    sandha_payments = relationship("SandhaPayment", back_populates="member")
    meal_contributions = relationship("MealContribution", back_populates="member")
    # donations relationship removed - Donation.donor_id is not a ForeignKey
    zakath_donations = relationship("ZakathDonation", back_populates="member")
    remarks = relationship("MemberRemark", back_populates="member")

class MemberChild(Base):
    __tablename__ = "member_children"

    id = Column(Integer, primary_key=True, index=True)
    memno = Column(String, ForeignKey("members.memno"))
    name = Column(String, nullable=False)
    date_of_birth = Column(Date)
    relationship_type = Column(String)
    school_name = Column(String)
    grade = Column(String)
    quran_madrasa = Column(String)
    occupation = Column(String)
    contact_number = Column(String)

    member = relationship("Member", back_populates="children")

class NonRelatedResident(Base):
    __tablename__ = "non_related_residents"

    id = Column(Integer, primary_key=True, index=True)
    memno = Column(String, ForeignKey("members.memno"))
    name = Column(String, nullable=False)
    id_card = Column(String)
    address = Column(Text)
    purpose = Column(Text)

    member = relationship("Member", back_populates="non_related")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(Enum(UserRole), default=UserRole.STAFF)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime)
    last_login = Column(DateTime)

class SandhaPayment(Base):
    __tablename__ = "sandha_payments"

    id = Column(Integer, primary_key=True, index=True)
    memno = Column(String, ForeignKey("members.memno"))
    month = Column(Date, nullable=False)
    amount = Column(Float, nullable=False)
    paid_on = Column(Date)
    receipt_no = Column(String)
    recorded_by = Column(String)

    member = relationship("Member", back_populates="sandha_payments")

class MealContribution(Base):
    __tablename__ = "meal_contributions"

    id = Column(Integer, primary_key=True, index=True)
    memno = Column(String, ForeignKey("members.memno"))
    month = Column(Date, nullable=False)
    amount = Column(Float, nullable=False)
    paid_on = Column(Date)
    recorded_by = Column(String)

    member = relationship("Member", back_populates="meal_contributions")

class Donation(Base):
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True, index=True)
    donor_type = Column(String)  # Member or NonMember
    donor_id = Column(String)    # memno or name
    amount = Column(Float, nullable=False)
    reason = Column(String)
    dated = Column(Date)
    recorded_by = Column(String)

    # member relationship removed - donor_id is not a ForeignKey (can be non-member)

class ZakathDonation(Base):
    __tablename__ = "zakath_donations"

    id = Column(Integer, primary_key=True, index=True)
    donor_memno = Column(String, ForeignKey("members.memno"))
    year = Column(Integer, nullable=False)
    amount = Column(Float, nullable=False)
    dated = Column(Date)
    recorded_by = Column(String)

    member = relationship("Member", back_populates="zakath_donations")
    beneficiaries = relationship("ZakathBeneficiary", back_populates="zakath")

class ZakathBeneficiary(Base):
    __tablename__ = "zakath_beneficiaries"

    id = Column(Integer, primary_key=True, index=True)
    zakath_id = Column(Integer, ForeignKey("zakath_donations.id"))
    memno = Column(String, ForeignKey("members.memno"))
    amount = Column(Float)
    pay_type = Column(String)  # OneTime or Monthly
    months = Column(Integer, default=1)
    start_month = Column(Date)
    end_month = Column(Date)
    is_closed = Column(Boolean, default=False)

    zakath = relationship("ZakathDonation", back_populates="beneficiaries")

class Staff(Base):
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    id_card = Column(String)
    address = Column(Text)
    mobile = Column(String)
    date_of_birth = Column(Date)
    date_of_joining = Column(Date)
    job_category = Column(String)
    basic_salary = Column(Float)
    incentive = Column(Float)
    bonus = Column(Float)
    is_active = Column(Boolean, default=True)

class TempWorker(Base):
    __tablename__ = "temp_workers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    task = Column(String)
    days = Column(Float)
    wage_per_day = Column(Float)
    total = Column(Float)
    worked_on = Column(Date)
    recorded_by = Column(String)

class OfficeBearer(Base):
    __tablename__ = "office_bearers"

    id = Column(Integer, primary_key=True, index=True)
    post = Column(String, unique=True)
    memno = Column(String, ForeignKey("members.memno"))
    year_from = Column(Date)
    year_to = Column(Date)

class MemberRemark(Base):
    __tablename__ = "member_remarks"

    id = Column(Integer, primary_key=True, index=True)
    memno = Column(String, ForeignKey("members.memno"))
    remark = Column(Text)
    added_by = Column(String)
    added_on = Column(Date)

    member = relationship("Member", back_populates="remarks")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    table_name = Column(String)
    row_id = Column(String)
    action = Column(String)
    old_value = Column(Text)
    new_value = Column(Text)
    changed_by = Column(String)
    changed_on = Column(DateTime)