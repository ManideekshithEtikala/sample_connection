from sqlalchemy.orm import Session
from datetime import datetime
from model import ChatHistory, JobDescription

def save_message(db: Session, employee_id: str, sender: str, message: str):
    chat = ChatHistory(
    employee_id=employee_id,
    sender=sender,
    message=message
    )
    db.add(chat)
    db.commit()






def create_jd(db: Session, employee_id: str, jd_json: dict):
    jd = JobDescription(
    employee_id=employee_id,
    jd_json=jd_json,
    status="generated"
    )
    db.add(jd)
    db.commit()
    db.refresh(jd)
    return jd

def approve_jd(db: Session, employee_id: str):
    jd = (
        db.query(JobDescription)
        .filter(JobDescription.employee_id == employee_id)
        .order_by(JobDescription.created_at.desc())
        .first()
    )
    if not jd:
        return None

    jd.status = "approved"
    jd.approved_at = datetime.utcnow()
    db.commit()
    return jd