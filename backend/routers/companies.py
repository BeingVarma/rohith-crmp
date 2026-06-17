from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import models, schemas, database, auth

router = APIRouter(prefix="/api/companies", tags=["companies"])

@router.get("/", response_model=List[schemas.Company])
def get_companies(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    companies = db.query(models.Company).order_by(models.Company.name.asc()).offset(skip).limit(limit).all()
    return companies

@router.post("/", response_model=schemas.Company)
def create_company(company: schemas.CompanyCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    existing = db.query(models.Company).filter(func.lower(models.Company.name) == company.name.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Company with this name already exists")
    
    db_company = models.Company(
        name=company.name,
        email=company.email,
        contact_number=company.contact_number
    )
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

@router.get("/data")
def get_company_data(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    companies = db.query(models.Company).order_by(models.Company.name.asc()).offset(skip).limit(limit).all()
    
    return [
        {
            "id": c.id, 
            "name": c.name,
            "email": c.email,
            "contact_number": c.contact_number,
            "customer_count": len(c.customers),
            "customers": sorted([{"id": cust.id, "name": cust.name, "contact_number": cust.contact_number, "status": cust.status} for cust in c.customers], key=lambda x: x['name'].lower() if x['name'] else '')
        } 
        for c in companies
    ]

@router.put("/{company_id}")
def update_company(company_id: int, company_update: schemas.CompanyUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_company = db.query(models.Company).filter(models.Company.id == company_id).first()
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")
        
    if company_update.name is not None:
        db_company.name = company_update.name
    if company_update.email is not None:
        db_company.email = company_update.email
    if company_update.contact_number is not None:
        db_company.contact_number = company_update.contact_number
        
    db.commit()
    db.refresh(db_company)
    return db_company
