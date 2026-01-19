from sqlalchemy import Column, Integer, String, DateTime, JSON
from datetime import datetime
from databases.database import Base

class ChatHistory(Base):
    __tablename__ = "chat_history"
    id: Column[int] = Column(Integer, primary_key=True)
    employee_id = Column(String, index=True)
    jd_session_id = Column(String, index=True)
    sender = Column(String)
    message = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)



class JobDescription(Base):
    __tablename__ = "job_descriptions"
    id: Column[int] = Column(Integer, primary_key=True)
    jd_session_id = Column(String, nullable=False)
    employee_id: Column[str] = Column(String, index=True)
    jd_json: Column[Base] = Column(JSON)
    status: Column[str] = Column(String, default="generated")
    created_at: Column[datetime] = Column(DateTime, default=datetime.utcnow)
    approved_at: Column[datetime] = Column(DateTime, nullable=True)

class EmployeeProfileDB(Base):
    __tablename__ = "employee_profiles"

    id = Column(Integer, primary_key=True)
    employee_id = Column(String, index=True)
    jd_session_id = Column(String, index=True)  # <-- Add this

    current_role = Column(String)
    department = Column(String)
    experience = Column(Integer)
    responsibilities = Column(String)
    tools = Column(String)
    skills = Column(String)
    leadership = Column(String)
    reporting_to = Column(String)
    work_type = Column(String)
    achievements = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)

