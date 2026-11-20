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
    role: str = "Erkaklar sartaroshi"
    rating: float = 5.0
    reviews_count: int = 1
    distance: str = "0.8 km"
    starting_price: int = 50000
    address: str = "Toshkent shahri"
    avatar: str = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250"
    bio: str = "Tajribali erkaklar sartaroshi. Zamonaviy soch turmaklari va soqol parvarishi."
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
    break_time: Optional[dict] = {"enabled": True, "start": "13:00", "end": "14:00"}
    salon_photos: List[str] = []
    # Dam olish kunlari va ish holati
    is_working_today: bool = True
    days_off: List[str] = [] # e.g. ["Dush", "Yak"]
    # Before & After Portfolio Gallery
    before_after_gallery: List[dict] = []
    # Virtual Sadoqat Dasturi (Loyalty Stamp)
    loyalty_program: Optional[dict] = {
        "enabled": True,
        "required_visits": 5,
        "reward": "5-tashrifda 50% chegirma yoki bepul soqol/maska"
    }

class AppointmentCreate(BaseModel):
    barber_id: str
    service_id: str
    client_name: str
    client_phone: str
    client_telegram_id: Optional[int] = None
    date_str: str
    time_slot: str
    notes: Optional[str] = None
    # 👨‍👦 Multi-person booking
    is_multi_person: bool = False
    multi_person_details: Optional[dict] = None # {"companion_type": "child|friend", "companion_title": "...", "companion_service": "...", "second_slot": "15:45", "second_price": 40000}

class Appointment(BaseModel):
    id: str
    barber_id: str
    barber_name: str
    barber_avatar: Optional[str] = None
    service_name: str
    price: int
    client_name: str
    client_phone: str
    client_telegram_id: Optional[int] = None
    date_str: str
    time_slot: str
    status: str = "pending" # pending | accepted | completed | cancelled
    reviewed: bool = False
    client_rating: Optional[int] = None
    client_comment: Optional[str] = None
    reminder_sent: bool = False
    sms_sent: bool = False
    created_at: str
    # 👨‍👦 Multi-person booking
    is_multi_person: bool = False
    multi_person_details: Optional[dict] = None
    # ⏳ Jonli Navbat Radari (Live Queue Status)
    queue_status: str = "waiting" # waiting | in_progress | ready_call | completed
    estimated_wait_minutes: Optional[int] = 20

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
