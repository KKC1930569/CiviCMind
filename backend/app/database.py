from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def ensure_sqlite_columns():
    """
    Safely adds any missing intelligence columns to SQLite without dropping data.
    """
    with engine.connect() as conn:
        # Check reports table columns
        try:
            res = conn.execute(text("PRAGMA table_info(reports)"))
            cols = [row[1] for row in res.fetchall()]
            if cols:
                report_new_cols = [
                    ("case_id", "VARCHAR(50)"),
                    ("defect_type", "VARCHAR(100)"),
                    ("ai_confidence", "FLOAT"),
                    ("priority_level", "VARCHAR(50) DEFAULT 'MEDIUM'"),
                    ("severity", "VARCHAR(50) DEFAULT 'MEDIUM'"),
                    ("factor_breakdown", "TEXT"),
                    ("reasons", "TEXT"),
                    ("accessibility_barrier", "VARCHAR(100) DEFAULT 'NONE'"),
                    ("affects_mobility_impaired", "BOOLEAN DEFAULT 0"),
                    ("location_context", "VARCHAR(100) DEFAULT 'GENERAL'"),
                    ("is_repeated_issue", "BOOLEAN DEFAULT 0"),
                    ("repeat_count", "INTEGER DEFAULT 0"),
                    ("is_demo_data", "BOOLEAN DEFAULT 0"),
                ]
                for col_name, col_type in report_new_cols:
                    if col_name not in cols:
                        conn.execute(text(f"ALTER TABLE reports ADD COLUMN {col_name} {col_type}"))
                conn.commit()
        except Exception as e:
            print(f"Notice on reports migration: {e}")

        # Check evidence table columns
        try:
            res = conn.execute(text("PRAGMA table_info(evidence)"))
            cols = [row[1] for row in res.fetchall()]
            if cols:
                ev_new_cols = [
                    ("capture_source", "VARCHAR(50) DEFAULT 'UPLOAD'"),
                    ("file_hash", "VARCHAR(64)"),
                    ("has_gps_metadata", "BOOLEAN DEFAULT 0"),
                    ("evidence_confidence", "VARCHAR(50) DEFAULT 'MEDIUM'"),
                    ("confidence_reasons", "TEXT"),
                    ("ai_detections", "TEXT"),
                ]
                for col_name, col_type in ev_new_cols:
                    if col_name not in cols:
                        conn.execute(text(f"ALTER TABLE evidence ADD COLUMN {col_name} {col_type}"))
                conn.commit()
        except Exception as e:
            print(f"Notice on evidence migration: {e}")
