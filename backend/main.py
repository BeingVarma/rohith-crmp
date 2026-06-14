from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models, database, auth
from routers import auth as auth_router, metrics, customers, companies, calls

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Rohit Project API")

origins = [  "http://localhost:5173",  "https://shancom-crmp-virid.vercel.app" , "https://shancom-crmp-git-main-harshas-projects-481b016d.vercel.app/" , "https://shancom-crmp-zaw0cd17d-harshas-projects-481b016d.vercel.app/" , "https://rohithproject.shancom.in" ]
app.add_middleware(
    CORSMiddleware,
    allow_origins = origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(metrics.router)
app.include_router(customers.router)
app.include_router(companies.router)
app.include_router(calls.router)

def seed_admin():
    db = database.SessionLocal()
    admin = db.query(models.User).filter(models.User.username == "admin").first()
    if not admin:
        hashed_password = auth.get_password_hash("admin")
        new_admin = models.User(username="admin", password_hash=hashed_password)
        db.add(new_admin)
        db.commit()
    db.close()

seed_admin()
