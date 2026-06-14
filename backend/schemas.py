from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    name: Optional[str] = None
    username: str
    project_title: Optional[str] = "CRM Project"

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    project_title: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class CompanyBase(BaseModel):
    name: str
    email: Optional[str] = None
    contact_number: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    contact_number: Optional[str] = None

class Company(CompanyBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class CallBase(BaseModel):
    status_at_time: str
    remarks: str
    call_count: int

class CallCreate(CallBase):
    customer_id: int

class Call(CallBase):
    id: int
    customer_id: int
    date_time: datetime
    class Config:
        from_attributes = True

class CustomerBase(BaseModel):
    name: str
    contact_number: str
    email: Optional[str] = None
    status: str

class CustomerCreate(CustomerBase):
    company_name: str
    company_email: Optional[str] = None
    company_contact_number: Optional[str] = None

class CustomerUpdate(BaseModel):
    status: str

class Customer(CustomerBase):
    id: int
    company_id: int
    created_at: datetime
    company: Company
    calls: List[Call] = []
    class Config:
        from_attributes = True
