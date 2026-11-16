import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from database import Barber, Service, Review, Appointment, AppointmentCreate, APPOINTMENTS_DB
from bot import bot, send_appointment_notification_to_barber

app = FastAPI(
    title="BarberHub SaaS API",
    description="Erkaklar sartaroshxonalari Telegram Mini-App backend platformasi",
    version="1.0.0"
)

# Enable CORS for Mini-App Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock Barbers Data
INITIAL_BARBERS = [
    Barber(
        id="barber-1",
        name="Azizbek Rustamov",
        role="Erkaklar sartaroshi",
        rating=4.9,
        reviews_count=142,
        distance="1.2 km",
        starting_price=50000,
        address="Toshkent, Yunusobod 14-mavze, 23-uy",
        avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
        bio="Klassik va zamonaviy soch turmaklash bo'yicha 7 yillik tajribaga ega usta.",
        telegram_id=12345678,
        services=[
            Service(id="s1", name="Soch kesish va turmaklash", duration="35 daq", price=50000),
            Service(id="s2", name="Soch va soqol kompleks", duration="50 daq", price=80000),
            Service(id="s3", name="Talabalar uchun", duration="35 daq", price=40000, old_price=50000, is_discount=True, note="Talabalik guvohnomasi bilan")
        ]
    ),
    Barber(
        id="barber-2",
        name="Sardor Karimov",
        role="Erkaklar sartaroshi",
        rating=4.8,
        reviews_count=218,
        distance="1.8 km",
        starting_price=60000,
        address="Toshkent, Yunusobod, Amir Temur shoh ko'chasi 107",
        avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
        bio="Zamonaviy soch turmaklari va soqol parvarishi. Har bir mijozga alohida e'tibor.",
        telegram_id=87654321,
        services=[
            Service(id="s201", name="Soch kesish va turmaklash", duration="40 daq", price=60000),
            Service(id="s202", name="Soch va soqol parvarishi", duration="60 daq", price=90000),
            Service(id="s203", name="Talabalar uchun", duration="40 daq", price=50000, old_price=60000, is_discount=True, note="Talabalik guvohnomasi bilan")
        ]
    ),
    Barber(
        id="barber-3",
        name="Jasur Alimov",
        role="Erkaklar sartaroshi",
        rating=4.9,
        reviews_count=89,
        distance="2.4 km",
        starting_price=55000,
        address="Toshkent, Shahriston metrosi yaqinida",
        avatar="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250",
        bio="Fade, Crop va Pompadour uslubidagi sochlarni mukammal darajada kesish bo'yicha mutaxassis.",
        telegram_id=99988877,
        services=[
            Service(id="s301", name="Fade & Crop soch kesish", duration="45 daq", price=55000),
            Service(id="s302", name="Premium soch + soqol + maska", duration="70 daq", price=110000),
            Service(id="s303", name="Talabalar uchun", duration="40 daq", price=45000, old_price=55000, is_discount=True, note="Talabalik guvohnomasi bilan")
        ]
    )
]

@app.get("/")
def home():
    return {
        "status": "online",
        "service": "BarberHub API",
        "endpoints": ["/api/barbers", "/api/appointments"]
    }

@app.get("/api/barbers", response_model=List[Barber])
def get_barbers(query: Optional[str] = None):
    """
    Katalog uchun barcha sartaroshlarni qaytarish.
    """
    if not query:
        return INITIAL_BARBERS
    
    q = query.lower()
    return [
        b for b in INITIAL_BARBERS 
        if q in b.name.lower() or q in b.role.lower()
    ]

@app.get("/api/barbers/{barber_id}", response_model=Barber)
def get_barber_details(barber_id: str):
    for b in INITIAL_BARBERS:
        if b.id == barber_id:
            return b
    raise HTTPException(status_code=404, detail="Usta topilmadi")

@app.post("/api/appointments", response_model=Appointment)
async def create_appointment(data: AppointmentCreate):
    """
    Mijoz navbat band qilganda saqlash va Telegram orqali ustaga bildirishnoma jo'natish.
    """
    barber = next((b for b in INITIAL_BARBERS if b.id == data.barber_id), None)
    if not barber:
        raise HTTPException(status_code=404, detail="Usta topilmadi")

    service = next((s for s in barber.services if s.id == data.service_id), None)
    if not service:
        raise HTTPException(status_code=404, detail="Xizmat topilmadi")

    apt_id = f"apt-{uuid.uuid4().hex[:8]}"
    appointment = Appointment(
        id=apt_id,
        barber_id=barber.id,
        barber_name=barber.name,
        service_name=service.name,
        price=service.price,
        client_name=data.client_name,
        client_phone=data.client_phone,
        date_str=data.date_str,
        time_slot=data.time_slot,
        status="pending",
        created_at=datetime.now().strftime("%Y-%m-%d %H:%M")
    )
    
    APPOINTMENTS_DB.append(appointment)

    # Trigger Telegram Notification to Barber if token & chat_id provided
    if barber.telegram_id:
        try:
            await send_appointment_notification_to_barber(
                bot=bot,
                barber_chat_id=barber.telegram_id,
                appointment_data=appointment.model_dump()
            )
        except Exception as err:
            print(f"Telegram notification xatolik: {err}")

    return appointment

@app.get("/api/admin/appointments", response_model=List[Appointment])
def get_admin_appointments(barber_id: Optional[str] = None):
    """
    Usta kabineti uchun buyurtmalar ro'yxati.
    """
    if barber_id:
        return [a for a in APPOINTMENTS_DB if a.barber_id == barber_id]
    return APPOINTMENTS_DB

@app.patch("/api/admin/appointments/{appointment_id}/status")
def update_appointment_status(appointment_id: str, status: str = Query(...)):
    """
    Usta navbatni qabul qilishi, bekor qilishi yoki 'keldi' deb belgilashi.
    """
    for a in APPOINTMENTS_DB:
        if a.id == appointment_id:
            a.status = status
            return a
    raise HTTPException(status_code=404, detail="Navbat topilmadi")
