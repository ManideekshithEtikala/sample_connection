import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from databases.dependencies import get_db
from services.jd_service import generate_jd
from models.model import JobDescription
from schema.schema import ChatRequest

router = APIRouter(prefix="/agent")


QUESTIONS = [
    "What is the job title?",
    "Describe the key responsibilities?",
    "List the required skills?",
    "What tools or technologies are required?",
    "What is the work environment?",
    "Who does this role report to?"
]


@router.post("/chat/{employee_id}/{jd_session_id}")
def chat(
    employee_id: str,
    jd_session_id: str,
    data: ChatRequest,
    db: Session = Depends(get_db)
):

    qa_list = data.qa or []

    # ======================
    # ASK QUESTIONS FIRST
    # ======================
    if len(qa_list) < len(QUESTIONS):
        return {
            "type": "question",
            "message": QUESTIONS[len(qa_list)],
            "step": len(qa_list) + 1,
            "total": len(QUESTIONS)
        }

    # ======================
    # SAFE ANSWER PARSING
    # ======================
    answers = {}

    for qa in qa_list:
        if isinstance(qa, dict):
            q = qa.get("question")
            a = qa.get("answer")
            if q and a:
                answers[q] = a

    # ======================
    # GENERATE JD
    # ======================
    jd = generate_jd({
        "employee_id": employee_id,
        "jd_session_id": jd_session_id,
        "answers": answers
    })

    return {
        "type": "job_description",
        "jd_json": jd
    }

# ===========================
# APPROVE JD
# ===========================
@router.post("/approve/{employee_id}/{jd_session_id}")
def approve_jd(
    employee_id: str,
    jd_session_id: str,
    db: Session = Depends(get_db)
):
    jd_record = db.query(JobDescription).filter_by(
        employee_id=employee_id,
        jd_session_id=jd_session_id
    ).first()

    if not jd_record:
        raise HTTPException(status_code=404, detail="JD not found")

    jd_record.status = "approved"
    jd_record.approved_at = datetime.datetime.utcnow()
    db.commit()

    return {
        "status": "success",
        "message": "JD approved successfully"
    }
