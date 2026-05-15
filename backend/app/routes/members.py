from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_active_user, get_admin_user
from app.models import Member, MemberChild, NonRelatedResident, MemberRemark, User
from app.schemas import (
    MemberCreate, MemberResponse, MemberChildCreate, MemberChildResponse,
    NonRelatedResidentCreate, NonRelatedResidentResponse,
    MemberRemarkCreate, MemberRemarkResponse
)

router = APIRouter(prefix="/members", tags=["Members"])

@router.post("/", response_model=MemberResponse)
def create_member(
    member: MemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Generate new member ID with PER/REN prefix based on residence type
    # For special cases (adding sub-members to existing), use suffix A, B, C...
    prefix = "PER" if member.residence_type == "Own" else "REN"

    # Check if this is a special case (sub-member of existing)
    # For now, standard sequential numbering
    last_member = db.query(Member).filter(Member.memno.like(f"{prefix}%")).order_by(Member.memno.desc()).first()
    if last_member:
        # Extract numeric part (e.g., "PER00001" -> 1, "PER00001A" -> 1)
        import re
        match = re.match(rf"{prefix}(\d+)", last_member.memno)
        if match:
            last_num = int(match.group(1))
            new_id = last_num + 1
        else:
            new_id = 1
    else:
        new_id = 1

    new_memno = f"{prefix}{new_id:05d}"

    # Check if id_number already exists
    if member.id_number:
        existing = db.query(Member).filter(Member.id_number == member.id_number).first()
        if existing:
            raise HTTPException(status_code=400, detail=f"Member with ID number {member.id_number} already exists (Member No: {existing.memno})")

    # Calculate total family members (1 for head of household + children)
    # For now, set to 1 (head of household), will update after adding children
    member_data = member.dict()
    member_data['total_family_members'] = 1  # Head of household

    db_member = Member(
        memno=new_memno,
        **member_data,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member

@router.get("/", response_model=List[MemberResponse])
def get_members(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(Member)
    if search:
        query = query.filter(
            Member.full_name.contains(search) | 
            Member.memno.contains(search) |
            Member.mobile_number.contains(search)
        )
    members = query.offset(skip).limit(limit).all()
    return members

@router.get("/{memno}", response_model=MemberResponse)
def get_member(
    memno: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    member = db.query(Member).filter(Member.memno == memno).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return member

@router.put("/{memno}", response_model=MemberResponse)
def update_member(
    memno: str,
    member_update: MemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    member = db.query(Member).filter(Member.memno == memno).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    for field, value in member_update.dict(exclude_unset=True).items():
        setattr(member, field, value)
    member.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(member)
    return member

@router.delete("/{memno}")
def delete_member(
    memno: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    member = db.query(Member).filter(Member.memno == memno).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    db.delete(member)
    db.commit()
    return {"message": "Member deleted successfully"}

# Children endpoints
@router.post("/{memno}/children", response_model=MemberChildResponse)
def add_child(
    memno: str,
    child: MemberChildCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    member = db.query(Member).filter(Member.memno == memno).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    db_child = MemberChild(memno=memno, **child.dict())
    db.add(db_child)
    db.commit()

    # Recalculate counts
    all_children = db.query(MemberChild).filter(MemberChild.memno == memno).all()
    member.no_of_children = len(all_children)

    # Calculate children above 18
    from datetime import date
    today = date.today()
    above_18_count = 0
    for c in all_children:
        if c.date_of_birth:
            age = today.year - c.date_of_birth.year
            if (today.month, today.day) < (c.date_of_birth.month, c.date_of_birth.day):
                age -= 1
            if age >= 18:
                above_18_count += 1

    member.children_above_18 = above_18_count

    # Total family = 1 (head) + children + non-related
    non_related_count = db.query(NonRelatedResident).filter(NonRelatedResident.memno == memno).count()
    member.total_family_members = 1 + len(all_children) + non_related_count

    db.commit()
    db.refresh(db_child)
    return db_child

@router.get("/{memno}/children", response_model=List[MemberChildResponse])
def get_children(
    memno: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return db.query(MemberChild).filter(MemberChild.memno == memno).all()

# Non-related residents endpoints
@router.post("/{memno}/non-related", response_model=NonRelatedResidentResponse)
def add_non_related(
    memno: str,
    resident: NonRelatedResidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    member = db.query(Member).filter(Member.memno == memno).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    db_resident = NonRelatedResident(memno=memno, **resident.dict())
    db.add(db_resident)
    member.has_non_related = "Yes"
    db.commit()

    # Recalculate total family members
    children_count = db.query(MemberChild).filter(MemberChild.memno == memno).count()
    non_related_count = db.query(NonRelatedResident).filter(NonRelatedResident.memno == memno).count()
    member.total_family_members = 1 + children_count + non_related_count

    db.commit()
    db.refresh(db_resident)
    return db_resident

@router.get("/{memno}/non-related", response_model=List[NonRelatedResidentResponse])
def get_non_related(
    memno: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return db.query(NonRelatedResident).filter(NonRelatedResident.memno == memno).all()

# Remarks endpoints
@router.post("/{memno}/remarks", response_model=MemberRemarkResponse)
def add_remark(
    memno: str,
    remark: MemberRemarkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    member = db.query(Member).filter(Member.memno == memno).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    db_remark = MemberRemark(
        memno=memno,
        remark=remark.remark,
        added_by=current_user.username,
        added_on=datetime.utcnow().date()
    )
    db.add(db_remark)
    db.commit()
    db.refresh(db_remark)
    return db_remark

@router.get("/{memno}/remarks", response_model=List[MemberRemarkResponse])
def get_remarks(
    memno: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return db.query(MemberRemark).filter(MemberRemark.memno == memno).order_by(MemberRemark.added_on.desc()).all()