import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
import google as genai
import time
from google import exceptions
ServiceUnavailable =exceptions.ServiceUnavailable
# ================= ENV =================
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise RuntimeError("GEMINI_API_KEY not found")

client = genai.Client(api_key=api_key)

MODEL_NAME = "gemini-2.5-flash"

# ================= FASTAPI =================
app = FastAPI(title="Professional JD Generator (Gemini)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= MODELS =================
class UserInput(BaseModel):
    message: str

class EmployeeProfile(BaseModel):
    current_role: Optional[str] = None
    department: Optional[str] = None
    experience: Optional[int] = None
    responsibilities: Optional[str] = None
    tools: Optional[str] = None
    skills: Optional[str] = None
    leadership: Optional[str] = None
    reporting_to: Optional[str] = None
    work_type: Optional[str] = None
    achievements: Optional[str] = None

# ================= IN-MEMORY STORE =================
employees: dict[str, EmployeeProfile] = {}

# ================= AI CLIENT =================
class AIClient:

    # ---- NORMAL TEXT CALL (NO JSON MODE) ----
    def call_text_llm(self, prompt: str, retries: int = 3) -> str:
        delay = 1  # seconds

        for attempt in range(retries):
            try:
                response = client.models.generate_content(
                    model=MODEL_NAME,
                    contents=prompt,
                )
                return response.text.strip()

            except ServiceUnavailable:
                if attempt == retries - 1:
                    raise HTTPException(
                        status_code=503,
                        detail="AI service is currently overloaded. Please try again in a few moments."
                    )
                time.sleep(delay)
                delay *= 2  # exponential backoff

            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))
    # ---- JSON MODE CALL (FIX 3) ----
    def call_json_llm(self, prompt: str) -> dict:
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
                config={
                    "response_mime_type": "application/json"
                }
            )
            return json.loads(response.text)
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Invalid JSON from Gemini")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    # ---- JD TEXT ----
    def generate_jd_text(self, profile: dict) -> str:
        prompt = f"""
You are a senior HR professional.

Write a professional, ATS-friendly Job Description.
Do not use bullet symbols, markdown, or special formatting.
Use clear paragraphs and formal corporate language.

Employee Information:
Role: {profile.get("current_role")}
Department: {profile.get("department")}
Experience: {profile.get("experience")} years
Responsibilities: {profile.get("responsibilities")}
Skills: {profile.get("skills")}
Tools: {profile.get("tools")}
Leadership: {profile.get("leadership")}
Reporting To: {profile.get("reporting_to")}
Work Type: {profile.get("work_type")}
Achievements: {profile.get("achievements")}

Structure:
Job Title
Job Summary
Key Responsibilities
Required Skills and Qualifications
Preferred Qualifications
Tools and Technologies
Work Environment
Reporting Structure
Impact and Contributions
"""
        return self.call_text_llm(prompt)

    # ---- JD → JSON (FIX 3) ----
    def convert_jd_to_json(self, jd_text: str) -> dict:
        prompt = f"""
You are a JSON generator.

Return ONLY valid JSON.
No explanations. No markdown. No extra text.

Schema:
{{
  "job_title": "",
  "job_summary": "",
  "key_responsibilities": [],
  "required_skills": [],
  "preferred_qualifications": [],
  "tools_and_technologies": [],
  "work_environment": "",
  "reporting_structure": "",
  "impact_and_contributions": []
}}

Convert the following Job Description into JSON:

{jd_text}
"""
        return self.call_json_llm(prompt)

    def generate_jd(self, profile: dict) -> dict:
        jd_text = self.generate_jd_text(profile)
        jd_json = self.convert_jd_to_json(jd_text)

        # Optional: log only JSON for debugging
        print("Generated JD JSON:", jd_json)
        return jd_json

ai_client = AIClient()

# ================= QUESTION FLOW =================
def get_next_question(profile: EmployeeProfile):
    exp = profile.experience or 0

    if not profile.current_role:
        return "What is your current role or designation?"
    if not profile.department:
        return "Which department do you work in?"
    if profile.experience is None:
        return "How many years of professional experience do you have?"
    if not profile.responsibilities:
        return "Describe your main day-to-day responsibilities."
    if not profile.tools:
        return "Which tools or technologies do you use regularly?"
    if not profile.skills:
        return "What key skills are required for your role?"
    if exp >= 3 and not profile.leadership:
        return "Do you lead or mentor others?"
    if not profile.reporting_to:
        return "Who do you report to?"
    if not profile.work_type:
        return "Is your work remote, hybrid, or onsite?"
    if not profile.achievements:
        return "What are your key achievements or contributions?"
    return None

def update_profile(profile: EmployeeProfile, answer: str):
    for field in profile.__fields__:
        if getattr(profile, field) in [None, ""]:
            if field == "experience":
                try:
                    setattr(profile, field, int(answer))
                except ValueError:
                    raise HTTPException(status_code=400, detail="Experience must be a number")
            else:
                setattr(profile, field, answer)
            break

# ================= API =================
@app.post("/agent/chat/{employee_id}")
def chat(employee_id: str, user_input: UserInput):
    if employee_id not in employees:
        employees[employee_id] = EmployeeProfile()

    profile = employees[employee_id]
    update_profile(profile, user_input.message)

    next_q = get_next_question(profile)
    if next_q:
        return {"type": "question", "message": next_q}

    jd_json = ai_client.generate_jd(profile.dict())

    return {
        "type": "job_description",
        "data": jd_json
    }