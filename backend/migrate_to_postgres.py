import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import models

# 1. Connect to SQLite
sqlite_url = "sqlite:///./rohit_project.db"
sqlite_engine = create_engine(sqlite_url)
SqliteSession = sessionmaker(bind=sqlite_engine)
sqlite_session = SqliteSession()

import os
from dotenv import load_dotenv

load_dotenv()

postgres_url = os.environ.get("DATABASE_URL")
if not postgres_url:
    raise ValueError("DATABASE_URL environment variable is not set")
pg_engine = create_engine(postgres_url)
PgSession = sessionmaker(bind=pg_engine)
pg_session = PgSession()

from sqlalchemy import text

def migrate():
    print("Dropping all existing tables in PostgreSQL using CASCADE...")
    with pg_engine.connect() as conn:
        conn.execute(text("DROP SCHEMA public CASCADE;"))
        conn.execute(text("CREATE SCHEMA public;"))
        conn.execute(text("GRANT ALL ON SCHEMA public TO public;"))
        conn.commit()

    print("Creating tables in PostgreSQL...")
    models.Base.metadata.create_all(bind=pg_engine)
    
    print("Migrating Users...")
    users = sqlite_session.query(models.User).all()
    for u in users:
        existing = pg_session.query(models.User).filter_by(id=u.id).first()
        if not existing:
            pg_user = models.User(id=u.id, name=u.name, username=u.username, password_hash=u.password_hash, project_title=u.project_title)
            pg_session.add(pg_user)
    pg_session.commit()
    
    print("Migrating Companies...")
    companies = sqlite_session.query(models.Company).all()
    for c in companies:
        existing = pg_session.query(models.Company).filter_by(id=c.id).first()
        if not existing:
            pg_company = models.Company(id=c.id, name=c.name, email=c.email, contact_number=c.contact_number, created_at=c.created_at)
            pg_session.add(pg_company)
    pg_session.commit()
    
    print("Migrating Customers...")
    customers = sqlite_session.query(models.Customer).all()
    for c in customers:
        existing = pg_session.query(models.Customer).filter_by(id=c.id).first()
        if not existing:
            pg_customer = models.Customer(
                id=c.id, company_id=c.company_id, name=c.name, contact_number=c.contact_number, 
                email=c.email, status=c.status, project_name=c.project_name, 
                project_location=c.project_location, state=c.state, type_of_project=c.type_of_project, 
                created_at=c.created_at
            )
            pg_session.add(pg_customer)
    pg_session.commit()
    
    print("Migrating Calls...")
    calls = sqlite_session.query(models.Call).all()
    for c in calls:
        existing = pg_session.query(models.Call).filter_by(id=c.id).first()
        if not existing:
            pg_call = models.Call(
                id=c.id, customer_id=c.customer_id, status_at_time=c.status_at_time, 
                remarks=c.remarks, date_time=c.date_time, call_count=c.call_count
            )
            pg_session.add(pg_call)
    pg_session.commit()
    
    print("Migration complete!")

if __name__ == "__main__":
    migrate()
