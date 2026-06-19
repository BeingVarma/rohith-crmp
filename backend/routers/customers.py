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
    customers = db.query(models.Customer).order_by(models.Customer.name.asc()).offset(skip).limit(limit).all()
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
        status=customer.status,
        project_name=customer.project_name,
        project_location=customer.project_location,
        state=customer.state,
        type_of_project=customer.type_of_project
    )
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

@router.put("/{customer_id}", response_model=schemas.Customer)
def update_customer(customer_id: int, customer_update: schemas.CustomerUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    old_status = db_customer.status
    
    update_data = customer_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_customer, key, value)
    
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
        
    company_id = db_customer.company_id
        
    db.query(models.Call).filter(models.Call.customer_id == customer_id).delete()
    db.delete(db_customer)
    db.commit()
    
    # Cleanup orphaned company
    if company_id:
        remaining_customers = db.query(models.Customer).filter(models.Customer.company_id == company_id).count()
        if remaining_customers == 0:
            db.query(models.Company).filter(models.Company.id == company_id).delete()
            db.commit()
            
    return {"message": "Customer deleted successfully"}

@router.post("/bulk-delete")
def bulk_delete_customers(request: schemas.CustomerBulkDelete, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    if not request.customer_ids:
        raise HTTPException(status_code=400, detail="No customer IDs provided")
        
    # Get associated company IDs before deletion
    customers_to_delete = db.query(models.Customer).filter(models.Customer.id.in_(request.customer_ids)).all()
    company_ids = set([c.company_id for c in customers_to_delete if c.company_id])
        
    # Delete associated calls first to avoid foreign key constraints errors
    db.query(models.Call).filter(models.Call.customer_id.in_(request.customer_ids)).delete(synchronize_session=False)
    
    # Delete customers
    deleted_count = db.query(models.Customer).filter(models.Customer.id.in_(request.customer_ids)).delete(synchronize_session=False)
    db.commit()
    
    # Cleanup orphaned companies
    if company_ids:
        for cid in company_ids:
            remaining = db.query(models.Customer).filter(models.Customer.company_id == cid).count()
            if remaining == 0:
                db.query(models.Company).filter(models.Company.id == cid).delete(synchronize_session=False)
        db.commit()
    
    return {"message": f"Successfully deleted {deleted_count} customers"}

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
            'Email': ['email', 'email address', 'e-mail'],
            'Project Name': ['project name', 'project', 'site name'],
            'Project Location': ['project location', 'location', 'site location'],
            'State': ['state', 'region', 'province'],
            'Type of Project': ['type of project', 'project type', 'type'],
            'Remarks': ['remarks', 'remark', 'notes', 'note']
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
        
        total_records = 0
        success_count = 0
        skipped_count = 0
        failed_count = 0

        for _, row in df.iterrows():
            total_records += 1
            try:
                customer_name = str(row[col_map['Customer Name']]).strip()
                contact_number = str(row[col_map['Contact Number']]).strip()
                
                # Check for duplicate
                existing_customer = db.query(models.Customer).filter(
                    models.Customer.name == customer_name,
                    models.Customer.contact_number == contact_number
                ).first()
                
                if existing_customer:
                    skipped_count += 1
                    continue

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
                    
                project_name_val = None
                if col_map['Project Name'] and pd.notna(row[col_map['Project Name']]):
                    project_name_val = str(row[col_map['Project Name']]).strip()
                    
                project_location_val = None
                if col_map['Project Location'] and pd.notna(row[col_map['Project Location']]):
                    project_location_val = str(row[col_map['Project Location']]).strip()
                    
                state_val = None
                if col_map['State'] and pd.notna(row[col_map['State']]):
                    state_val = str(row[col_map['State']]).strip()
                    
                type_of_project_val = None
                if col_map['Type of Project'] and pd.notna(row[col_map['Type of Project']]):
                    type_of_project_val = str(row[col_map['Type of Project']]).strip()
                    
                db_customer = models.Customer(
                    company_id=company.id,
                    name=customer_name,
                    contact_number=contact_number,
                    email=email_val if email_val and email_val.lower() != 'nan' else None,
                    status="Not Assigned",
                    project_name=project_name_val if project_name_val and project_name_val.lower() != 'nan' else None,
                    project_location=project_location_val if project_location_val and project_location_val.lower() != 'nan' else None,
                    state=state_val if state_val and state_val.lower() != 'nan' else None,
                    type_of_project=type_of_project_val if type_of_project_val and type_of_project_val.lower() != 'nan' else None
                )
                db.add(db_customer)
                db.flush()

                # Check for remarks and create initial Call if present
                remarks_val = None
                if col_map['Remarks'] and pd.notna(row[col_map['Remarks']]):
                    remarks_val = str(row[col_map['Remarks']]).strip()
                    
                if remarks_val and remarks_val.lower() != 'nan':
                    db_call = models.Call(
                        customer_id=db_customer.id,
                        status_at_time="Not Assigned",
                        remarks=remarks_val,
                        call_count=1
                    )
                    db.add(db_call)
                    
                success_count += 1
            except Exception as row_error:
                failed_count += 1
                db.rollback()  # Rollback any failed partial row changes (like Company creation)

        db.commit()
        return {
            "message": "Import completed successfully",
            "summary": {
                "total": total_records,
                "success": success_count,
                "skipped": skipped_count,
                "failed": failed_count
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
