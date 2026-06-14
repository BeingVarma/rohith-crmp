from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy import func
import models, schemas, database, auth

router = APIRouter(prefix="/api/metrics", tags=["metrics"])

@router.get("/")
def get_dashboard_metrics(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    company_count = db.query(models.Company).count()
    customer_count = db.query(models.Customer).count()
    
    status_counts = db.query(models.Customer.status, func.count(models.Customer.id)).group_by(models.Customer.status).all()
    
    metrics = {
        "Company Data": company_count,
        "Customer Data": customer_count,
        "Not Assigned": 0,
        "Hotlist": 0,
        "Confirmed List": 0,
        "Not Responding List": 0,
        "Callback List": 0,
        "Rejected List": 0
    }
    
    for status, count in status_counts:
        if status in metrics:
            metrics[status] = count
            
    return metrics
