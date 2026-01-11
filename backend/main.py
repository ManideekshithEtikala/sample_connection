from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from database import engine
from model import Base
from schema import EmployeeCreate, EmployeeResponse
from crud import create_employee, get_all_employees
from dependencies import get_db
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="HR AI Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://sample-connection.vercel.app/"],  # Vite default
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables in Aiven PostgreSQL
Base.metadata.create_all(bind=engine)
@app.get("/")
def read_root():
    return {"message": "Welcome to the HR AI Backend!"}
@app.post("/employee", response_model=EmployeeResponse)
def add_employee(employee: EmployeeCreate, db: Session = Depends(get_db)):
    return create_employee(db, employee)

@app.get("/employees", response_model=list[EmployeeResponse])
def list_employees(db: Session = Depends(get_db)):
    return get_all_employees(db)
