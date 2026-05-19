from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
from datetime import datetime, date
from pydantic import BaseModel
import os
import qrcode
from PIL import Image
import io
import shutil

from ..database import get_db
from ..models import Member, MemberChild, NonRelatedResident

router = APIRouter(prefix="/members", tags=["members"])

# Create upload directories - LOCAL (not in Docker)
UPLOAD_DIR = "uploads"
PHOTO_DIR = os.path.join(UPLOAD_DIR, "member_photos")
QR_DIR = os.path.join(UPLOAD_DIR, "qr_codes")
os.makedirs(PHOTO_DIR, exist_ok=True)
os.makedirs(QR_DIR, exist_ok=True)

class MemberCreate(BaseModel):
    full_name: str
    id_number: Optional[str] = None
    mobile_number: Optional[str] = None
    whatsapp_number: Optional[str] = None
    permanent_address: Optional[str] = None
    date_of_birth: Optional[str] = None
    civil_status: Optional[str] = "Single"
    occupation: Optional[str] = None
    residence_type: str
    owner_name: Optional[str] = None
    owner_mobile: Optional[str] = None
    sandha_amount: Optional[float] = 300.0
    meal_contribution: Optional[str] = "No"
    meal_contribution_amount: Optional[float] = 0.0
    paying_other_masjid: Optional[str] = "No"
    other_masjid_details: Optional[str] = None
    special_needs: Optional[str] = None
    is_sub_member: Optional[str] = "No"
    parent_memno: Optional[str] = None
    memno: Optional[str] = None
    send_whatsapp: Optional[bool] = False

def parse_date(date_str):
    """Convert string date to Python date object"""
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except:
        return None

def generate_qr_code(memno, name, output_path):
    """Generate QR code and save to file"""
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(f"ID:{memno}|NAME:{name}")
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    img.save(output_path)
    return output_path

@router.get("/")
def get_members(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    members = db.query(Member).offset(skip).limit(limit).all()
    return members

@router.post("/")
async def create_member(
    full_name: str = Form(...),
    id_number: Optional[str] = Form(None),
    mobile_number: Optional[str] = Form(None),
    whatsapp_number: Optional[str] = Form(None),
    permanent_address: Optional[str] = Form(None),
    date_of_birth: Optional[str] = Form(None),
    civil_status: Optional[str] = Form("Single"),
    occupation: Optional[str] = Form(None),
    residence_type: str = Form(...),
    owner_name: Optional[str] = Form(None),
    owner_mobile: Optional[str] = Form(None),
    sandha_amount: Optional[float] = Form(300.0),
    meal_contribution: Optional[str] = Form("No"),
    meal_contribution_amount: Optional[float] = Form(0.0),
    paying_other_masjid: Optional[str] = Form("No"),
    other_masjid_details: Optional[str] = Form(None),
    special_needs: Optional[str] = Form(None),
    is_sub_member: Optional[str] = Form("No"),
    parent_memno: Optional[str] = Form(None),
    memno: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """Create new member with optional photo upload and auto-generated QR code"""

    # Generate memno if not provided
    if not memno:
        prefix = "PER" if residence_type == "Own" else "REN"
        last_member = db.query(Member).filter(Member.memno.like(f"{prefix}%")).order_by(Member.memno.desc()).first()
        if last_member:
            try:
                last_num = int(last_member.memno.replace(prefix, ""))
                memno = f"{prefix}{str(last_num + 1).zfill(5)}"
            except:
                memno = f"{prefix}00001"
        else:
            memno = f"{prefix}00001"

    # Handle sub-member ID generation
    if is_sub_member == "Yes" and parent_memno:
        last_sub = db.query(Member).filter(
            Member.parent_memno == parent_memno,
            Member.memno.like(f"{parent_memno}%")
        ).order_by(Member.memno.desc()).first()

        if last_sub:
            last_suffix = last_sub.memno.replace(parent_memno, "")
            if last_suffix and len(last_suffix) == 1:
                next_char = chr(ord(last_suffix) + 1)
                memno = f"{parent_memno}{next_char}"
            else:
                memno = f"{parent_memno}A"
        else:
            memno = f"{parent_memno}A"

    # Handle photo upload
    photo_url = None
    if photo and photo.filename:
        file_extension = os.path.splitext(photo.filename)[1] or ".jpg"
        photo_filename = f"{memno}{file_extension}"
        photo_path = os.path.join(PHOTO_DIR, photo_filename)

        with open(photo_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)

        photo_url = f"/uploads/member_photos/{photo_filename}"

    # Generate QR Code
    qr_filename = f"qr_{memno}.png"
    qr_path = os.path.join(QR_DIR, qr_filename)
    generate_qr_code(memno, full_name, qr_path)
    qr_code_url = f"/uploads/qr_codes/{qr_filename}"

    # Create member
    db_member = Member()
    db_member.memno = memno
    db_member.full_name = full_name
    db_member.id_number = id_number
    db_member.mobile_number = mobile_number
    db_member.whatsapp_number = whatsapp_number
    db_member.permanent_address = permanent_address
    db_member.date_of_birth = parse_date(date_of_birth)
    db_member.civil_status = civil_status
    db_member.occupation = occupation
    db_member.residence_type = residence_type
    db_member.owner_name = owner_name
    db_member.owner_mobile = owner_mobile
    db_member.sandha_amount = sandha_amount
    db_member.meal_contribution = meal_contribution
    db_member.meal_contribution_amount = meal_contribution_amount
    db_member.paying_other_masjid = paying_other_masjid
    db_member.other_masjid_details = other_masjid_details
    db_member.special_needs = special_needs
    db_member.is_sub_member = is_sub_member
    db_member.parent_memno = parent_memno
    db_member.no_of_children = 0
    db_member.children_above_18 = 0
    db_member.total_family_members = 1
    db_member.has_non_related = "No"
    db_member.photo_url = photo_url
    db_member.qr_code_url = qr_code_url
    db_member.created_at = datetime.now()
    db_member.updated_at = datetime.now()

    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member

@router.get("/{memno}")
def get_member(memno: str, db: Session = Depends(get_db)):
    member = db.query(Member).filter(Member.memno == memno).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return member

@router.post("/{memno}/children")
def add_child(memno: str, child_data: dict, db: Session = Depends(get_db)):
    """Add family member/child - handles date string conversion"""
    if "date_of_birth" in child_data and child_data["date_of_birth"]:
        child_data["date_of_birth"] = parse_date(child_data["date_of_birth"])

    db_child = MemberChild(
        memno=memno,
        name=child_data.get("name"),
        date_of_birth=child_data.get("date_of_birth"),
        relationship_type=child_data.get("relationship_type"),
        school_name=child_data.get("school_name"),
        grade=child_data.get("grade"),
        quran_madrasa=child_data.get("quran_madrasa"),
        occupation=child_data.get("occupation"),
        contact_number=child_data.get("contact_number")
    )
    db.add(db_child)
    db.commit()
    return db_child

@router.get("/{memno}/children")
def get_children(memno: str, db: Session = Depends(get_db)):
    """Get all children/family members for a member"""
    children = db.query(MemberChild).filter(MemberChild.memno == memno).all()
    return children

@router.post("/{memno}/non-related")
def add_non_related(memno: str, resident_data: dict, db: Session = Depends(get_db)):
    """Add non-related resident"""
    db_resident = NonRelatedResident(
        memno=memno,
        name=resident_data.get("name"),
        id_card=resident_data.get("id_card"),
        address=resident_data.get("address"),
        purpose=resident_data.get("purpose")
    )
    db.add(db_resident)
    db.commit()
    return db_resident
