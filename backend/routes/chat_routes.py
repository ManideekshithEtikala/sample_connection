import uuid
import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from databases.dependencies import get_db
from models.model import JobDescription
from schema.schema import ChatRequest
from services.jd_service import generate_jd

router = APIRouter(prefix="/agent")

QUESTIONS = [
    "What is the job title?",
    "What are the key responsibilities?",
    "What skills are mandatory?",
    "Which tools or technologies are used?",
    "Is this remote, hybrid, or onsite?",
    "Who does this role report to?",
]


@router.post("/chat/{employee_id}/{jd_session_id}")
def chat(
    employee_id: str,
    jd_session_id: str,
    data: ChatRequest,
    db: Session = Depends(get_db),
):

    qa_list = data.qa or []

    # 🔹 Ask questions
    if len(qa_list) < len(QUESTIONS):
        return {"type": "question", "message": QUESTIONS[len(qa_list)]}

    # 🔹 Generate JD
    jd_json = generate_jd({"qa": [qa.dict() for qa in qa_list]})

    # 🔹 Save to database
    jd_record = JobDescription(
        jd_session_id=uuid.UUID(jd_session_id),
        employee_id=uuid.UUID(employee_id),
        jd_json=jd_json,
        status="generated",
    )

    db.add(jd_record)
    db.commit()
    db.refresh(jd_record)

    return {"type": "job_description", "jd_json": jd_json}


# ===========================
# APPROVE JD
# ===========================
@router.post("/approve/{employee_id}/{jd_session_id}")
def approve_jd(employee_id: str, jd_session_id: str, db: Session = Depends(get_db)):
    jd = (
        db.query(JobDescription)
        .filter_by(employee_id=employee_id, jd_session_id=jd_session_id)
        .first()
    )

    if not jd:
        raise HTTPException(status_code=404, detail="JD not found")

    jd.status = "approved"
    jd.approved_at = datetime.datetime.utcnow()

    db.commit()

    return {"status": "success"}
