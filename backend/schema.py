from pydantic import BaseModel
from typing import List, Optional


class ChatRequest(BaseModel):
    message: str


class Project(BaseModel):
    title: str
    description: str
    technologies: List[str]


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