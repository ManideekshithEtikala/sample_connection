from sqlalchemy.orm import Session
from model import Employee
from schema import EmployeeCreate

def create_employee(db: Session, employee: EmployeeCreate):
    db_employee = Employee(
        name=employee.name,
        age=employee.age,
        Gender=employee.Gender
    )
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

def get_all_employees(db: Session):
    return db.query(Employee).all()
