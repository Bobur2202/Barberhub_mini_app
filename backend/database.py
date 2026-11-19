from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Service(BaseModel):
    id: str
    name: str
    duration: str
    price: int
    old_price: Optional[int] = None
    is_discount: bool = False
    note: Optional[str] = None

class Review(BaseModel):
    id: str
    author: str
    rating: int
    date: str
    comment: str

class Barber(BaseModel):
    id: str
    name: str
    role: str
    rating: float
    reviews_count: int
    distance: str
    starting_price: int
    address: str
    avatar: str
    bio: str
    telegram_id: Optional[int] = None # Barbershop usta telegram id
    services: List[Service] = []
    reviews: List[Review] = []
    # Subscription & Trial
    trial_days_left: int = 14
    is_trial: bool = True
    subscription_status: str = "trial" # "trial" | "active" | "expired"
    linked_card: Optional[dict] = None # {"number": "8600 **** **** 1234", "expiry": "12/28", "holder": "USTA NOMI", "bank": "Uzcard/Humo"}
    payment_method: Optional[str] = None
    # Working Hours & Salon Photos
    work_hours: Optional[dict] = {"start": "09:00", "end": "22:00"}
    salon_photos: List[str] = []

class AppointmentCreate(BaseModel):
    barber_id: str
    service_id: str
    client_name: str
    client_phone: str
    date_str: str
    time_slot: str
    notes: Optional[str] = None

class Appointment(BaseModel):
    id: str
    barber_id: str
    barber_name: str
    barber_avatar: Optional[str] = None
    service_name: str
    price: int
    client_name: str
    client_phone: str
    date_str: str
    time_slot: str
    status: str = "pending" # pending | accepted | completed | cancelled
    reviewed: bool = False
    client_rating: Optional[int] = None
    client_comment: Optional[str] = None
    created_at: str

# Persistent JSON Storage Setup
import os
import json

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(DATA_DIR, exist_ok=True)

BARBERS_FILE = os.path.join(DATA_DIR, "barbers.json")
APPOINTMENTS_FILE = os.path.join(DATA_DIR, "appointments.json")

def load_barbers_from_disk(fallback_barbers: List[Barber]) -> List[Barber]:
    """Fayldan barcha ustalarni yuklash (Server o'chib yonsa ham ma'lumotlar saqlanadi)"""
    if os.path.exists(BARBERS_FILE):
        try:
            with open(BARBERS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                return [Barber(**item) for item in data]
        except Exception as e:
            print(f"[DB] Barbers load error: {e}")
    # Agar fayl bo'lmasa yoki xato bo'lsa boshlang'ich ustalarni saqlab qo'yamiz
    save_barbers_to_disk(fallback_barbers)
    return fallback_barbers

def save_barbers_to_disk(barbers: List[Barber]):
    """Barcha ustalarni (izohlari, reytingi, rasmlari, ish vaqti) doimiy faylga saqlash"""
    try:
        with open(BARBERS_FILE, "w", encoding="utf-8") as f:
            json.dump([b.model_dump() for b in barbers], f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"[DB] Barbers save error: {e}")

def load_appointments_from_disk() -> List[Appointment]:
    """Fayldan buyurtmalarni yuklash"""
    if os.path.exists(APPOINTMENTS_FILE):
        try:
            with open(APPOINTMENTS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                return [Appointment(**item) for item in data]
        except Exception as e:
            print(f"[DB] Appointments load error: {e}")
    return []

def save_appointments_to_disk(appointments: List[Appointment]):
    """Buyurtmalarni doimiy faylga saqlash"""
    try:
        with open(APPOINTMENTS_FILE, "w", encoding="utf-8") as f:
            json.dump([a.model_dump() for a in appointments], f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"[DB] Appointments save error: {e}")

# In-memory working list (initialized from disk)
APPOINTMENTS_DB: List[Appointment] = load_appointments_from_disk()
