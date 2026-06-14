import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
import models
from datetime import datetime, timedelta
import random

def seed_data():
    db = SessionLocal()

    # Clear existing data except users
    db.query(models.Call).delete()
    db.query(models.Customer).delete()
    db.query(models.Company).delete()
    
    # Create Companies
    companies_data = ["TechNova Inc.", "Global Solutions", "Apex Industries", "Quantum Corp"]
    companies = []
    for name in companies_data:
        company = models.Company(name=name)
        db.add(company)
        companies.append(company)
    
    db.commit()
    for company in companies:
        db.refresh(company)

    # Create Customers
    statuses = ["Hotlist", "Confirmed List", "Not Responding List", "Callback List", "Rejected List"]
    
    customers_data = [
        {"name": "Alice Smith", "contact": "555-0101", "email": "alice@technova.com", "company": companies[0]},
        {"name": "Bob Johnson", "contact": "555-0102", "email": "bob@technova.com", "company": companies[0]},
        {"name": "Charlie Davis", "contact": "555-0103", "email": "charlie@globalsolutions.com", "company": companies[1]},
        {"name": "Diana Prince", "contact": "555-0104", "email": "diana@apex.com", "company": companies[2]},
        {"name": "Evan Wright", "contact": "555-0105", "email": "evan@quantum.com", "company": companies[3]},
        {"name": "Fiona Gallagher", "contact": "555-0106", "email": "fiona@quantum.com", "company": companies[3]}
    ]

    customers = []
    for data in customers_data:
        status = random.choice(statuses)
        customer = models.Customer(
            company_id=data["company"].id,
            name=data["name"],
            contact_number=data["contact"],
            email=data["email"],
            status=status
        )
        db.add(customer)
        customers.append(customer)
    
    db.commit()
    for customer in customers:
        db.refresh(customer)

    # Create Calls
    for customer in customers:
        num_calls = random.randint(1, 3)
        for i in range(num_calls):
            call_status = random.choice(statuses)
            call = models.Call(
                customer_id=customer.id,
                status_at_time=call_status if i < num_calls - 1 else customer.status,
                remarks=f"Discussion regarding the {call_status.lower()}.",
                call_count=i + 1,
                date_time=datetime.utcnow() - timedelta(days=random.randint(1, 30))
            )
            db.add(call)

    db.commit()
    db.close()
    print("Example data seeded successfully.")

if __name__ == "__main__":
    seed_data()
