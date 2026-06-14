from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas, database, auth

router = APIRouter(prefix="/api/calls", tags=["calls"])

@router.post("/", response_model=schemas.Call)
def create_call(call: schemas.CallCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    customer = db.query(models.Customer).filter(models.Customer.id == call.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    db_call = models.Call(
        customer_id=call.customer_id,
        status_at_time=call.status_at_time,
        remarks=call.remarks,
        call_count=call.call_count
    )
    db.add(db_call)
    
    # Update customer status
    customer.status = call.status_at_time
    
    db.commit()
    db.refresh(db_call)
    return db_call
