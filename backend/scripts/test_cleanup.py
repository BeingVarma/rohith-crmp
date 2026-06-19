import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
import models

def setup_test_data(db):
    print("Setting up test data...")
    # Company 1: multiple customers
    comp1 = models.Company(name="Test Company Multiple")
    db.add(comp1)
    db.commit()
    db.refresh(comp1)

    c1 = models.Customer(name="Cust 1", contact_number="111", company_id=comp1.id)
    c2 = models.Customer(name="Cust 2", contact_number="222", company_id=comp1.id)
    db.add_all([c1, c2])
    db.commit()

    # Company 2: single customer
    comp2 = models.Company(name="Test Company Single")
    db.add(comp2)
    db.commit()
    db.refresh(comp2)

    c3 = models.Customer(name="Cust 3", contact_number="333", company_id=comp2.id)
    db.add(c3)
    db.commit()

    # Company 3: bulk delete test
    comp3 = models.Company(name="Test Company Bulk")
    db.add(comp3)
    db.commit()
    db.refresh(comp3)

    c4 = models.Customer(name="Cust 4", contact_number="444", company_id=comp3.id)
    c5 = models.Customer(name="Cust 5", contact_number="555", company_id=comp3.id)
    db.add_all([c4, c5])
    db.commit()

    # Customer 6: no company
    c6 = models.Customer(name="Cust 6 (No Co)", contact_number="666")
    db.add(c6)
    db.commit()

    db.refresh(c1)
    db.refresh(c2)
    db.refresh(c3)
    db.refresh(c4)
    db.refresh(c5)
    db.refresh(c6)

    return comp1.id, comp2.id, comp3.id, [c1.id, c2.id, c3.id, c4.id, c5.id, c6.id]

def simulate_single_delete(db, customer_id):
    db_customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not db_customer:
        return
    company_id = db_customer.company_id
    db.query(models.Call).filter(models.Call.customer_id == customer_id).delete()
    db.delete(db_customer)
    db.commit()
    
    if company_id:
        remaining = db.query(models.Customer).filter(models.Customer.company_id == company_id).count()
        if remaining == 0:
            db.query(models.Company).filter(models.Company.id == company_id).delete()
            db.commit()

def simulate_bulk_delete(db, customer_ids):
    customers = db.query(models.Customer).filter(models.Customer.id.in_(customer_ids)).all()
    company_ids = set([c.company_id for c in customers if c.company_id])
    
    db.query(models.Call).filter(models.Call.customer_id.in_(customer_ids)).delete(synchronize_session=False)
    db.query(models.Customer).filter(models.Customer.id.in_(customer_ids)).delete(synchronize_session=False)
    db.commit()
    
    if company_ids:
        for cid in company_ids:
            remaining = db.query(models.Customer).filter(models.Customer.company_id == cid).count()
            if remaining == 0:
                db.query(models.Company).filter(models.Company.id == cid).delete(synchronize_session=False)
        db.commit()

def run_tests():
    db = SessionLocal()
    try:
        comp1_id, comp2_id, comp3_id, cust_ids = setup_test_data(db)
        c1, c2, c3, c4, c5, c6 = cust_ids

        # Test 1: Delete customer from company with multiple customers
        print(f"Test 1: Deleting {c1} from company {comp1_id}...")
        simulate_single_delete(db, c1)
        comp1_exists = db.query(models.Company).filter(models.Company.id == comp1_id).first() is not None
        print(f"  Company 1 exists? {comp1_exists} (Expected: True)")
        assert comp1_exists

        # Test 2: Delete single customer, company should be deleted
        print(f"Test 2: Deleting {c3} from company {comp2_id}...")
        simulate_single_delete(db, c3)
        comp2_exists = db.query(models.Company).filter(models.Company.id == comp2_id).first() is not None
        print(f"  Company 2 exists? {comp2_exists} (Expected: False)")
        assert not comp2_exists

        # Test 3: Delete customer without company
        print(f"Test 3: Deleting {c6} (no company)...")
        simulate_single_delete(db, c6)
        print("  Deleted successfully without errors.")

        # Test 4: Bulk delete remaining customers from comp1 and comp3
        print(f"Test 4: Bulk deleting {c2}, {c4}, {c5}...")
        simulate_bulk_delete(db, [c2, c4, c5])
        comp1_exists = db.query(models.Company).filter(models.Company.id == comp1_id).first() is not None
        comp3_exists = db.query(models.Company).filter(models.Company.id == comp3_id).first() is not None
        print(f"  Company 1 exists? {comp1_exists} (Expected: False)")
        print(f"  Company 3 exists? {comp3_exists} (Expected: False)")
        assert not comp1_exists
        assert not comp3_exists

        print("\nAll tests passed successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    run_tests()
