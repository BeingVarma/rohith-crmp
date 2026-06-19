import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
import models
from routers.companies import delete_company

def run_tests():
    db = SessionLocal()
    try:
        # 1. Create a company with multiple customers and calls
        print("Setting up test data...")
        comp1 = models.Company(name="Test Cascade Company")
        db.add(comp1)
        db.commit()
        db.refresh(comp1)

        c1 = models.Customer(name="Cascade Cust 1", contact_number="111", company_id=comp1.id)
        c2 = models.Customer(name="Cascade Cust 2", contact_number="222", company_id=comp1.id)
        db.add_all([c1, c2])
        db.commit()
        db.refresh(c1)
        db.refresh(c2)

        call1 = models.Call(customer_id=c1.id, status_at_time="Hotlist", remarks="Test Call 1")
        call2 = models.Call(customer_id=c2.id, status_at_time="Not Assigned", remarks="Test Call 2")
        db.add_all([call1, call2])
        db.commit()

        c1_id = c1.id
        c2_id = c2.id
        comp1_id = comp1.id

        # Verify setup
        assert db.query(models.Company).filter(models.Company.id == comp1_id).first() is not None
        assert db.query(models.Customer).filter(models.Customer.company_id == comp1_id).count() == 2
        assert db.query(models.Call).filter(models.Call.customer_id.in_([c1_id, c2_id])).count() == 2

        # 2. Test company deletion cascade
        print(f"Deleting company {comp1_id}...")
        
        # Simulate router endpoint functionality
        delete_company(comp1_id, db=db, current_user=None)

        # 3. Verify cascading deletion
        comp_exists = db.query(models.Company).filter(models.Company.id == comp1_id).first() is not None
        customers_count = db.query(models.Customer).filter(models.Customer.company_id == comp1_id).count()
        calls_count = db.query(models.Call).filter(models.Call.customer_id.in_([c1_id, c2_id])).count()

        print(f"  Company exists? {comp_exists} (Expected: False)")
        print(f"  Remaining customers for this company? {customers_count} (Expected: 0)")
        print(f"  Remaining calls for deleted customers? {calls_count} (Expected: 0)")

        assert not comp_exists
        assert customers_count == 0
        assert calls_count == 0

        # 4. Test missing company
        try:
            from fastapi import HTTPException
            delete_company(99999, db=db, current_user=None)
            assert False, "Should have raised HTTPException for missing company"
        except HTTPException as e:
            print(f"  Missing company caught correctly: {e.detail} (Expected: Company not found)")
            assert e.status_code == 404

        print("\nAll company deletion tests passed successfully!")

    finally:
        db.close()

if __name__ == "__main__":
    run_tests()
