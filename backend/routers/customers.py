from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List
import pandas as pd
import io
import models, schemas, database, auth
from utils.email_service import send_confirmation_email

router = APIRouter(prefix="/api/customers", tags=["customers"])

@router.get("/", response_model=List[schemas.Customer])
def get_customers(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    customers = db.query(models.Customer).offset(skip).limit(limit).all()
    return customers

@router.post("/", response_model=schemas.Customer)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    company = db.query(models.Company).filter(models.Company.name == customer.company_name).first()
    if not company:
        company = models.Company(
            name=customer.company_name,
            email=customer.company_email,
            contact_number=customer.company_contact_number
        )
        db.add(company)
        db.commit()
        db.refresh(company)
    
    db_customer = models.Customer(
        company_id=company.id,
        name=customer.name,
        contact_number=customer.contact_number,
        email=customer.email,
        status=customer.status
    )
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

@router.put("/{customer_id}", response_model=schemas.Customer)
def update_customer_status(customer_id: int, customer_update: schemas.CustomerUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    old_status = db_customer.status
    db_customer.status = customer_update.status
    
    # Check if status is changed to Confirmed List
    if old_status != "Confirmed List" and customer_update.status == "Confirmed List":
        # Check if the associated company has an email
        company = db.query(models.Company).filter(models.Company.id == db_customer.company_id).first()
        if company and company.email:
            # Trigger the email logic
            send_confirmation_email(
                company_email=company.email,
                company_name=company.name,
                customer_name=db_customer.name
            )

    db.commit()
    db.refresh(db_customer)
    return db_customer

@router.delete("/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    db.query(models.Call).filter(models.Call.customer_id == customer_id).delete()
    db.delete(db_customer)
    db.commit()
    return {"message": "Customer deleted successfully"}

@router.post("/import")
async def import_customers(file: UploadFile = File(...), db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    if not file.filename.endswith(('.xlsx', '.csv')):
        raise HTTPException(status_code=400, detail="Invalid file format")
    
    try:
        contents = await file.read()
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
            
        # Normalize column names in dataframe (lowercase, strip whitespace)
        df_cols_normalized = {col: str(col).strip().lower() for col in df.columns}
        
        # Define acceptable variations for the required and optional columns
        required_mappings = {
            'Customer Name': ['customer name', 'name', 'client name', 'contact name', 'customer'],
            'Contact Number': ['contact number', 'phone number', 'phone', 'contact', 'mobile', 'mobile number']
        }
        
        optional_mappings = {
            'Company Name': ['company name', 'company', 'organization', 'client company'],
            'Email': ['email', 'email address', 'e-mail']
        }
        
        # Map actual dataframe columns to our required columns
        col_map = {}
        for req_col, variations in required_mappings.items():
            found = False
            for actual_col, norm_col in df_cols_normalized.items():
                if norm_col in variations:
                    col_map[req_col] = actual_col
                    found = True
                    break
            if not found:
                raise HTTPException(status_code=400, detail=f"Missing required column: {req_col}. Expected similar to: {variations[0]}")
                
        # Map optional columns
        for opt_col, variations in optional_mappings.items():
            col_map[opt_col] = None
            for actual_col, norm_col in df_cols_normalized.items():
                if norm_col in variations:
                    col_map[opt_col] = actual_col
                    break
        
        count = 0
        for _, row in df.iterrows():
            if col_map['Company Name'] and pd.notna(row[col_map['Company Name']]):
                company_name = str(row[col_map['Company Name']]).strip()
            else:
                company_name = "Unknown"
                
            if not company_name or company_name.lower() == 'nan':
                company_name = "Unknown"
                
            company = db.query(models.Company).filter(models.Company.name == company_name).first()
            if not company:
                company = models.Company(name=company_name)
                db.add(company)
                db.commit()
                db.refresh(company)
            
            if col_map['Email'] and pd.notna(row[col_map['Email']]):
                email_val = str(row[col_map['Email']]).strip()
            else:
                email_val = None
                
            db_customer = models.Customer(
                company_id=company.id,
                name=str(row[col_map['Customer Name']]).strip(),
                contact_number=str(row[col_map['Contact Number']]).strip(),
                email=email_val if email_val and email_val.lower() != 'nan' else None,
                status="Not Assigned"
            )
            db.add(db_customer)
            count += 1
        db.commit()
        return {"message": f"Successfully imported {count} customers"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
