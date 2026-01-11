from pydantic import BaseModel

class EmployeeCreate(BaseModel):
    name: str
    age: int
    gender: str

class EmployeeResponse(EmployeeCreate):
    id: int

    class Config:
        orm_mode = True
