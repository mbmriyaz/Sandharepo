import os

# CRITICAL: Create data directory BEFORE importing anything from app/
data_dir = "/data"
if not os.path.exists(data_dir):
    os.makedirs(data_dir, exist_ok=True)
    print(f"Created data directory: {data_dir}")

import uvicorn
from app.database import engine, Base, SessionLocal
from app.models import User

def init_db():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully")

    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            # Use bcrypt directly with proper handling
            import bcrypt
            password = "admin"
            # bcrypt has 72-byte limit, but "admin" is only 5 bytes so this is fine
            hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

            admin_user = User(
                username="admin",
                email="admin@masjidh.com",
                full_name="System Administrator",
                hashed_password=hashed,
                role="admin",
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            print("✅ Default admin user created (admin/admin)")
        else:
            print("✅ Admin user already exists")
    except Exception as e:
        print(f"❌ Error creating admin: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Initializing Masjidh Sandha API...")
    init_db()
    print("🚀 Starting Uvicorn server...")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)