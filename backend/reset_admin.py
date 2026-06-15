import models, database
import bcrypt

db = database.SessionLocal()
admin = db.query(models.User).filter(models.User.username == "admin").first()

if admin:
    # Use bcrypt directly to avoid passlib bug on python 3.12 + bcrypt 4.x
    password = b"admin"
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password, salt).decode('utf-8')
    
    admin.password_hash = hashed
    db.commit()
    print("Admin password reset to 'admin'")
else:
    print("Admin user not found")
db.close()
