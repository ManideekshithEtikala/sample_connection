import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, String, DateTime, JSON
from databases.database import Base
from datetime import datetime, timezone
from sqlalchemy import Integer, DateTime, String, Column, JSON 

class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    jd_session_id = Column(
        UUID(as_uuid=True),
        nullable=False
    )

    employee_id = Column(
        UUID(as_uuid=True),
        nullable=False
    )

    jd_json = Column(JSON, nullable=False)

    status = Column(String, default="generated")

    created_at = Column(DateTime, default=datetime.utcnow())
    approved_at = Column(DateTime, nullable=True)

class ChatHistory(Base):
    __tablename__ = "chat_history"
    id: Column[int] = Column(Integer, primary_key=True)
    employee_id = Column(String, index=True)
    jd_session_id = Column(String, index=True)
    sender = Column(String)
    message = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


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

