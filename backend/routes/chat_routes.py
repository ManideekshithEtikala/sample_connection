import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from databases.dependencies import get_db
from models.model import JobDescription
from schema.schema import ChatRequest
from services.jd_service import generate_jd

router = APIRouter(prefix="/agent")

# ============================
# FIELD-AWARE QUESTIONS
# ============================

QUESTIONS = [
    {
        "question": "What is the job title?",
        "field": "job_title",
        "input_type": "string",
    },
    {
        "question": "Write a short job summary (2–3 lines).",
        "field": "job_summary",
        "input_type": "string",
    },
    {
        "question": "Key responsibilities (comma separated).",
        "field": "key_responsibilities",
        "input_type": "array",
    },
    {
        "question": "Mandatory skills (comma separated).",
        "field": "required_skills",
        "input_type": "array",
    },
    {
        "question": "Preferred qualifications (comma separated).",
        "field": "preferred_qualifications",
        "input_type": "array",
    },
    {
        "question": "Tools & technologies used (comma separated).",
        "field": "tools_and_technologies",
        "input_type": "array",
    },
    {
        "question": "Work environment (remote / hybrid / onsite).",
        "field": "work_environment",
        "input_type": "string",
    },
    {
        "question": "Reporting structure (e.g. Engineering Manager).",
        "field": "reporting_structure",
        "input_type": "string",
    },
    {
        "question": "Expected achievements in this role.",
        "field": "achievements",
        "input_type": "string",
    },
    {
        "question": "Leadership responsibilities (if any).",
        "field": "leadership",
        "input_type": "string",
    },
]


# ============================
# CHAT ROUTE
# ============================

@router.post("/chat/{employee_id}/{jd_session_id}")
def chat(
    employee_id: str,
    jd_session_id: str,
    data: ChatRequest,
    db: Session = Depends(get_db),
):
    qa_list = data.qa or []

    # Ask next question
    if len(qa_list) < len(QUESTIONS):
        q = QUESTIONS[len(qa_list)]
        return {
            "type": "question",
            "question": q["question"],
            "field": q["field"],
            "input_type": q["input_type"],
        }

    # Generate JD
    jd_output = generate_jd({"qa": [qa.dict() for qa in qa_list]})
    jd_json = jd_output.model_dump()

    jd_record = JobDescription(
        jd_session_id=uuid.UUID(jd_session_id),
        employee_id=uuid.UUID(employee_id),
        jd_json=jd_json,
        status="generated",
    )

    db.add(jd_record)
    db.commit()
    db.refresh(jd_record)

    return {
        "type": "job_description",
        "jd_json": jd_json,
    }


# ============================
# APPROVE JD
# ============================

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

    return {"status": "approved"}
