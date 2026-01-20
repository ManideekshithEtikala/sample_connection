from typing import List, Optional, Any
from pydantic import BaseModel

class QA(BaseModel):
    field: str
    answer: Any


class ChatRequest(BaseModel):
    qa: List[QA] = []

class Project(BaseModel):
    project_name: str
    description: str
    technologies_used: List[str]
    role: str
    duration: str

class JDJson(BaseModel):
    inferred_job_title: str
    seniority: str
    job_title: str
    job_summary: str
    key_responsibilities: List[str]
    required_skills: List[str]
    preferred_qualifications: List[str]
    tools_and_technologies: List[str]
    work_environment: str
    reporting_structure: str
    achievements: str
    leadership: str
    projects: Optional[List[Project]] = []

class JDOutput(BaseModel):
    job_title: str
    job_summary: str
    key_responsibilities: List[str]
    required_skills: List[str]
    preferred_qualifications: List[str]
    tools_and_technologies: List[str]
    employment_type: str
    location: str


