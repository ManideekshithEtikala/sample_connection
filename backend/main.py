# -----------------------------
# SAME IMPORTS AS BEFORE
# -----------------------------
import os
import json
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.genai as genai
from sqlalchemy.orm import Session

from database import SessionLocal, engine
from model import ChatHistory, EmployeeProfileDB, JobDescription, Base

# ================= ENV =================
load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
MODEL_NAME = "gemini-2.5-flash"

client = genai.Client(api_key=API_KEY)

# ================= FASTAPI =================
app = FastAPI(title="Professional JD Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

# ================= DB =================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ================= MODELS =================
class ChatRequest(BaseModel):
    message: str

# ================= GEMINI =================
class AIClient:
    def generate(self, profile: EmployeeProfileDB) -> dict:
        prompt = f"""
Create professional ATS-friendly Job Description.

Role: {profile.current_role}
Department: {profile.department}
Experience: {profile.experience}
Responsibilities: {profile.responsibilities}
Skills: {profile.skills}
Tools: {profile.tools}
Leadership: {profile.leadership}
Reporting To: {profile.reporting_to}
Work Type: {profile.work_type}
Achievements: {profile.achievements}

Return JSON only.
"""
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config={"response_mime_type": "application/json"},
        )
        return json.loads(response.text)

ai_client = AIClient()

# ================= QUESTIONS =================
FIELDS = [
    ("current_role", "What is your current role or designation?"),
    ("department", "Which department do you work in?"),
    ("experience", "How many years of experience do you have?"),
    ("responsibilities", "Describe your main responsibilities."),
    ("tools", "Which tools or technologies do you use?"),
    ("skills", "What skills are required for your role?"),
    ("leadership", "Do you mentor or lead others?"),
    ("reporting_to", "Who do you report to?"),
    ("work_type", "Is your role remote, hybrid or onsite?"),
    ("achievements", "What are your key achievements?")
]

# ================= CHAT =================
@app.post("/agent/chat/{employee_id}/{jd_session_id}")
def chat(employee_id: str, jd_session_id: str, data: ChatRequest, db: Session = Depends(get_db)):

    # Save chat
    db.add(ChatHistory(
    employee_id=employee_id,
    jd_session_id=jd_session_id,  # NOW THIS WORKS
    sender="user",
    message=data.message
))
    db.commit()

    # Load or create profile **per session**
    profile = (
        db.query(EmployeeProfileDB)
        .filter(
            EmployeeProfileDB.employee_id == employee_id,
            EmployeeProfileDB.jd_session_id == jd_session_id
        )
        .first()
    )

    if not profile:
        profile = EmployeeProfileDB(
            employee_id=employee_id,
            jd_session_id=jd_session_id
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    # Fill next empty field
    for field, _ in FIELDS:
        if getattr(profile, field) is None:
            if field == "experience":
                setattr(profile, field, int(data.message))
            else:
                setattr(profile, field, data.message)
            db.commit()
            break

    # Ask next question
    for field, question in FIELDS:
        if getattr(profile, field) is None:
            return {
                "type": "question",
                "message": question
            }

    # Generate JD
    jd_json = ai_client.generate(profile)

    db.add(JobDescription(
        employee_id=employee_id,
        jd_session_id=jd_session_id,
        jd_json=jd_json,
        status="generated"
    ))
    db.commit()

    return {
        "type": "job_description",
        "jd_json": jd_json
    }

# ================= APPROVE =================
@app.post("/agent/approve/{employee_id}/{jd_session_id}")
def approve(employee_id: str, jd_session_id: str, db: Session = Depends(get_db)):

    jd = (
        db.query(JobDescription)
        .filter(
            JobDescription.employee_id == employee_id,
            JobDescription.jd_session_id == jd_session_id,
            JobDescription.status == "generated"
        )
        .order_by(JobDescription.created_at.desc())
        .first()
    )

    if not jd:
        return {"message": "No JD found"}

    jd.status = "approved"
    jd.approved_at = datetime.utcnow()
    db.commit()

    return {"message": "JD approved successfully"}
