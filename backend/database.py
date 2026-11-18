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
    service_name: str
    price: int
    client_name: str
    client_phone: str
    date_str: str
    time_slot: str
    status: str = "pending" # pending | accepted | completed | cancelled
    created_at: str

# In-memory storage for rapid development & live demonstration
APPOINTMENTS_DB: List[Appointment] = []
