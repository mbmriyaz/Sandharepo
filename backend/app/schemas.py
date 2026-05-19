from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    STAFF = "staff"
    MEMBER = "member"

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class UserBase(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    role: UserRole = UserRole.STAFF

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: Optional[datetime]
    last_login: Optional[datetime]

    class Config:
        from_attributes = True

class MemberBase(BaseModel):
    full_name: str
    id_number: Optional[str] = None
    mobile_number: Optional[str] = None
    whatsapp_number: Optional[str] = None
    permanent_address: Optional[str] = None
    date_of_birth: Optional[date] = None
    civil_status: Optional[str] = None
    occupation: Optional[str] = None
    residence_type: Optional[str] = None
    owner_name: Optional[str] = None
    owner_mobile: Optional[str] = None
    sandha_amount: float = 300.0
    meal_contribution_amount: float = 0.0
    paying_other_masjid: str = "No"
    other_masjid_details: Optional[str] = None
    meal_contribution: str = "No"
    special_needs: Optional[str] = None
    is_sub_member: str = "No"
    parent_memno: Optional[str] = None

class MemberCreate(MemberBase):
    pass

class MemberResponse(MemberBase):
    memno: str
    no_of_children: int = 0
    children_above_18: int = 0
    total_family_members: int = 1
    is_sub_member: str = "No"
    parent_memno: Optional[str] = None
    has_non_related: str = "No"
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class MemberChildBase(BaseModel):
    name: str
    date_of_birth: Optional[date] = None
    relationship_type: Optional[str] = None
    school_name: Optional[str] = None
    grade: Optional[str] = None
    quran_madrasa: Optional[str] = None
    occupation: Optional[str] = None
    contact_number: Optional[str] = None

class MemberChildCreate(MemberChildBase):
    pass

class MemberChildResponse(MemberChildBase):
    id: int
    memno: str

    class Config:
        from_attributes = True

class NonRelatedResidentBase(BaseModel):
    name: str
    id_card: Optional[str] = None
    address: Optional[str] = None
    purpose: Optional[str] = None

class NonRelatedResidentCreate(NonRelatedResidentBase):
    pass

class NonRelatedResidentResponse(NonRelatedResidentBase):
    id: int
    memno: str

    class Config:
        from_attributes = True

class SandhaPaymentBase(BaseModel):
    year: int
    month: int
    amount: float
    paid_on: Optional[date] = None
    payment_mode: Optional[str] = "Partial"
    receipt_no: Optional[str] = None

class SandhaPaymentCreate(SandhaPaymentBase):
    pass

class SandhaPaymentResponse(SandhaPaymentBase):
    id: int
    memno: str
    recorded_by: Optional[str]

    class Config:
        from_attributes = True

class MealContributionBase(BaseModel):
    year: int
    month: int
    amount: float
    paid_on: Optional[date] = None
    payment_mode: Optional[str] = "Partial"
    receipt_no: Optional[str] = None

class MealContributionCreate(MealContributionBase):
    pass

class MealContributionResponse(MealContributionBase):
    id: int
    memno: str
    recorded_by: Optional[str]

    class Config:
        from_attributes = True

class DonationBase(BaseModel):
    donor_type: str
    donor_id: str
    amount: float
    reason: Optional[str] = None
    dated: Optional[date] = None

class DonationCreate(DonationBase):
    pass

class DonationResponse(DonationBase):
    id: int
    recorded_by: Optional[str]

    class Config:
        from_attributes = True

class ZakathDonationBase(BaseModel):
    year: int
    amount: float
    dated: Optional[date] = None

class ZakathDonationCreate(ZakathDonationBase):
    pass

class ZakathDonationResponse(ZakathDonationBase):
    id: int
    donor_memno: str
    recorded_by: Optional[str]

    class Config:
        from_attributes = True

class ZakathBeneficiaryBase(BaseModel):
    memno: str
    amount: float
    pay_type: str
    months: int = 1
    start_month: Optional[date] = None
    end_month: Optional[date] = None

class ZakathBeneficiaryCreate(ZakathBeneficiaryBase):
    pass

class ZakathBeneficiaryResponse(ZakathBeneficiaryBase):
    id: int
    zakath_id: int
    is_closed: bool

    class Config:
        from_attributes = True

class StaffBase(BaseModel):
    full_name: str
    id_card: Optional[str] = None
    address: Optional[str] = None
    mobile: Optional[str] = None
    date_of_birth: Optional[date] = None
    date_of_joining: Optional[date] = None
    job_category: Optional[str] = None
    basic_salary: Optional[float] = None
    incentive: Optional[float] = None
    bonus: Optional[float] = None

class StaffCreate(StaffBase):
    pass

class StaffResponse(StaffBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

class TempWorkerBase(BaseModel):
    name: str
    task: Optional[str] = None
    days: Optional[float] = None
    wage_per_day: Optional[float] = None
    total: Optional[float] = None
    worked_on: Optional[date] = None

class TempWorkerCreate(TempWorkerBase):
    pass

class TempWorkerResponse(TempWorkerBase):
    id: int
    recorded_by: Optional[str]

    class Config:
        from_attributes = True

class OfficeBearerBase(BaseModel):
    post: str
    memno: str
    year_from: Optional[date] = None
    year_to: Optional[date] = None

class OfficeBearerCreate(OfficeBearerBase):
    pass

class OfficeBearerResponse(OfficeBearerBase):
    id: int

    class Config:
        from_attributes = True

class MemberRemarkBase(BaseModel):
    remark: str
    added_on: Optional[date] = None

class MemberRemarkCreate(MemberRemarkBase):
    pass

class MemberRemarkResponse(MemberRemarkBase):
    id: int
    memno: str
    added_by: Optional[str]

    class Config:
        from_attributes = True

class ReportFilter(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    memno: Optional[str] = None
    year: Optional[int] = None

class MonthlySummary(BaseModel):
    month: str
    total_sandha: float
    total_meal: float
    total_donations: float
    total_zakath: float
