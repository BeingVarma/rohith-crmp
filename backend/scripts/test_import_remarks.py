import sys
import os
import io
import pandas as pd
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

# Add backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import app
from database import get_db
from models import Customer, Call, Company
import auth

# Set up test database session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_remarks_import.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

# Mock current user
def override_get_current_user():
    return {"username": "testuser", "id": 1}

app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[auth.get_current_user] = override_get_current_user

client = TestClient(app)

def setup_test_db():
    Base.metadata.create_all(bind=engine)

def teardown_test_db():
    Base.metadata.drop_all(bind=engine)
    if os.path.exists("./test_remarks_import.db"):
        os.remove("./test_remarks_import.db")

def run_tests():
    setup_test_db()
    try:
        print("Creating mock Excel file with remarks...")
        df = pd.DataFrame({
            "S.No": [1, 2],
            "Name": ["John Doe", "Jane Smith"],
            "Contact": ["1234567890", "0987654321"],
            "Project Name": ["Project A", "Project B"],
            "Remarks": ["Follow up next week", ""] # One with remark, one without
        })
        
        # Save to memory
        excel_buffer = io.BytesIO()
        df.to_excel(excel_buffer, index=False)
        excel_buffer.seek(0)
        
        print("Uploading mock Excel file to /api/customers/import ...")
        response = client.post(
            "/api/customers/import",
            files={"file": ("test_import.xlsx", excel_buffer, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
        )
        
        print("Response:", response.status_code, response.json())
        assert response.status_code == 200, "Import failed!"
        
        # Verify Database
        db = TestingSessionLocal()
        
        customer_john = db.query(Customer).filter(Customer.name == "John Doe").first()
        customer_jane = db.query(Customer).filter(Customer.name == "Jane Smith").first()
        
        assert customer_john is not None, "John Doe not imported"
        assert customer_jane is not None, "Jane Smith not imported"
        
        # Check remarks for John
        calls_john = db.query(Call).filter(Call.customer_id == customer_john.id).all()
        assert len(calls_john) == 1, "John should have 1 call logged for the remark"
        assert calls_john[0].remarks == "Follow up next week", "Remark text mismatch"
        assert calls_john[0].status_at_time == "Not Assigned", "Initial status mismatch"
        
        # Check remarks for Jane (Should have none)
        calls_jane = db.query(Call).filter(Call.customer_id == customer_jane.id).all()
        assert len(calls_jane) == 0, "Jane should have NO calls logged because remark was empty"
        
        print("✅ Excel Import with Remarks successfully tested!")
        db.close()
        
    finally:
        teardown_test_db()

if __name__ == "__main__":
    run_tests()
