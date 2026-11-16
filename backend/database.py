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
