from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    project_title = Column(String, default="CRM Project")

class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    email = Column(String, nullable=True)
    contact_number = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    customers = relationship("Customer", back_populates="company")

class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    name = Column(String, index=True)
    contact_number = Column(String)
    email = Column(String, nullable=True)
    status = Column(String, default="Not Assigned")
    project_name = Column(String, nullable=True)
    project_location = Column(String, nullable=True)
    state = Column(String, nullable=True)
    type_of_project = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="customers")
    calls = relationship("Call", back_populates="customer")

class Call(Base):
    __tablename__ = "calls"
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    status_at_time = Column(String)
    remarks = Column(Text)
    date_time = Column(DateTime, default=datetime.utcnow)
    call_count = Column(Integer)

    customer = relationship("Customer", back_populates="calls")
