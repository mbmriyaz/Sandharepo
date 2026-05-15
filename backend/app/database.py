import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import get_settings

settings = get_settings()

# Resolve database URL - ensure directory exists
database_url = settings.database_url
if database_url.startswith("sqlite:///"):
    db_path = database_url.replace("sqlite:///", "")

    # Handle absolute vs relative paths
    if db_path.startswith("/"):
        # Absolute path (Docker /data/sandha.db)
        db_dir = os.path.dirname(db_path)
    else:
        # Relative path - resolve to app directory
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        db_path = os.path.join(base_dir, db_path)
        db_dir = os.path.dirname(db_path)
        database_url = f"sqlite:///{db_path}"

    # Create directory if it doesn't exist
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir, exist_ok=True)
        print(f"Created database directory: {db_dir}")

engine = create_engine(
    database_url, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()