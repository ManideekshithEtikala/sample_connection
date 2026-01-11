from pydantic import BaseModel

class EmployeeCreate(BaseModel):
    name: str
    age: int
    Gender: str

class EmployeeResponse(EmployeeCreate):
    id: int

    class Config:
        orm_mode = True
