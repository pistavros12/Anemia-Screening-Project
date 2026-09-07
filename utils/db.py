import sqlite3
import os
from datetime import datetime
import hashlib

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
os.makedirs(DATA_DIR, exist_ok=True)

USERS_DB = os.path.join(DATA_DIR, "users.db")
SCREENINGS_DB = os.path.join(DATA_DIR, "screenings.db")

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def init_db():
    # Users database
    with sqlite3.connect(USERS_DB) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                full_name TEXT NOT NULL,
                facility_name TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        # Create default health worker if none exists
        cursor.execute("SELECT COUNT(*) FROM users")
        if cursor.fetchone()[0] == 0:
            cursor.execute(
                "INSERT INTO users (username, password_hash, full_name, facility_name) VALUES (?, ?, ?, ?)",
                ("hw_nurse", hash_password("health2025"), "Sr. Almaz Bekele", "Addis Ababa Health Center")
            )
        conn.commit()

    # Screenings database
    with sqlite3.connect(SCREENINGS_DB) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS screenings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_name TEXT NOT NULL,
                patient_age INTEGER,
                patient_gender TEXT,
                health_worker TEXT NOT NULL,
                location_name TEXT,
                latitude REAL,
                longitude REAL,
                elevation_m REAL NOT NULL,
                raw_hb REAL NOT NULL,
                adjusted_hb REAL NOT NULL,
                classification_prob REAL NOT NULL,
                anemia_status TEXT NOT NULL,
                severity TEXT NOT NULL,
                confidence_gated INTEGER DEFAULT 0,
                timestamp TEXT NOT NULL,
                photo_thumbnail TEXT
            )
        """)
        conn.commit()

def verify_user(username, password):
    init_db()
    with sqlite3.connect(USERS_DB) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, username, full_name, facility_name FROM users WHERE username = ? AND password_hash = ?",
                       (username, hash_password(password)))
        return cursor.fetchone()

def register_user(username, password, full_name, facility_name=""):
    init_db()
    try:
        with sqlite3.connect(USERS_DB) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO users (username, password_hash, full_name, facility_name) VALUES (?, ?, ?, ?)",
                (username, hash_password(password), full_name, facility_name)
            )
            conn.commit()
            return True, "User registered successfully."
    except sqlite3.IntegrityError:
        return False, "Username already exists."

def save_screening(record: dict):
    init_db()
    with sqlite3.connect(SCREENINGS_DB) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO screenings (
                patient_name, patient_age, patient_gender, health_worker,
                location_name, latitude, longitude, elevation_m,
                raw_hb, adjusted_hb, classification_prob, anemia_status,
                severity, confidence_gated, timestamp, photo_thumbnail
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            record.get("patient_name"),
            record.get("patient_age"),
            record.get("patient_gender"),
            record.get("health_worker"),
            record.get("location_name", "Ethiopia"),
            record.get("latitude", 9.145),
            record.get("longitude", 40.489),
            record.get("elevation_m", 0.0),
            record.get("raw_hb", 0.0),
            record.get("adjusted_hb", 0.0),
            record.get("classification_prob", 0.0),
            record.get("anemia_status", "Normal"),
            record.get("severity", "Normal"),
            1 if record.get("confidence_gated", False) else 0,
            record.get("timestamp", datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
            record.get("photo_thumbnail", "")
        ))
        conn.commit()
        return cursor.lastrowid

def get_screenings_summary(health_worker=None):
    init_db()
    with sqlite3.connect(SCREENINGS_DB) as conn:
        cursor = conn.cursor()
        if health_worker:
            cursor.execute("SELECT COUNT(*), MAX(timestamp) FROM screenings WHERE health_worker = ?", (health_worker,))
        else:
            cursor.execute("SELECT COUNT(*), MAX(timestamp) FROM screenings")
        row = cursor.fetchone()
        return {
            "total_screenings": row[0] or 0,
            "last_screening_date": row[1] or "None recorded"
        }

def get_screenings_list(search_query="", limit=50):
    init_db()
    with sqlite3.connect(SCREENINGS_DB) as conn:
        cursor = conn.cursor()
        if search_query:
            q = f"%{search_query}%"
            cursor.execute("""
                SELECT id, patient_name, patient_age, patient_gender, health_worker,
                       location_name, elevation_m, raw_hb, adjusted_hb, anemia_status,
                       severity, confidence_gated, timestamp
                FROM screenings
                WHERE patient_name LIKE ? OR location_name LIKE ?
                ORDER BY timestamp DESC LIMIT ?
            """, (q, q, limit))
        else:
            cursor.execute("""
                SELECT id, patient_name, patient_age, patient_gender, health_worker,
                       location_name, elevation_m, raw_hb, adjusted_hb, anemia_status,
                       severity, confidence_gated, timestamp
                FROM screenings
                ORDER BY timestamp DESC LIMIT ?
            """, (limit,))
        return cursor.fetchall()
