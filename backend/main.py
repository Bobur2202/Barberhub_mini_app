import uuid
import asyncio
from contextlib import asynccontextmanager
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from database import (
    Barber,
    Service,
    Review,
    Appointment,
    AppointmentCreate,
    APPOINTMENTS_DB,
    load_barbers_from_disk,
    save_barbers_to_disk,
    save_appointments_to_disk
)
from bot import bot, dp, send_appointment_notification_to_barber, send_appointment_status_to_client

@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI bilan birgalikda Telegram botni ham ishga tushirish"""
    bot_task = None
    if bot:
        print("[INFO] Telegram Bot polling ishga tushmoqda...")
        bot_task = asyncio.create_task(dp.start_polling(bot))
    yield
    if bot:
        print("[INFO] Telegram Bot to'xtatilmoqda...")
        await bot.session.close()
        if bot_task:
            bot_task.cancel()

app = FastAPI(
    title="BarberHub SaaS API",
    description="Erkaklar sartaroshxonalari Telegram Mini-App backend platformasi",
    version="1.0.0",
    lifespan=lifespan
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
        work_hours={"start": "09:00", "end": "22:00"},
        salon_photos=[
            "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=700",
            "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=700"
        ],
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
        work_hours={"start": "09:00", "end": "22:00"},
        salon_photos=[
            "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=700",
            "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=700"
        ],
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
        work_hours={"start": "10:00", "end": "21:00"},
        salon_photos=[
            "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=700"
        ],
        services=[
            Service(id="s301", name="Fade & Crop soch kesish", duration="45 daq", price=55000),
            Service(id="s302", name="Premium soch + soqol + maska", duration="70 daq", price=110000),
            Service(id="s303", name="Talabalar uchun", duration="40 daq", price=45000, old_price=55000, is_discount=True, note="Talabalik guvohnomasi bilan")
        ]
    )
]

# Doimiy xotiradan (JSON fayldan) yuklangan ustalar bazasi
BARBERS_DB: List[Barber] = load_barbers_from_disk(INITIAL_BARBERS)

@app.get("/")
def home():
    return {
        "status": "online",
        "service": "BarberHub API",
        "endpoints": ["/api/barbers", "/api/appointments", "/api/barbers/by-telegram/{telegram_id}"]
    }

@app.get("/api/barbers", response_model=List[Barber])
def get_barbers(query: Optional[str] = None):
    """
    Katalog uchun barcha sartaroshlarni qaytarish.
    """
    if not query:
        return BARBERS_DB
    
    q = query.lower()
    return [
        b for b in BARBERS_DB 
        if q in b.name.lower() or q in b.role.lower()
    ]

@app.get("/api/barbers/by-telegram/{telegram_id}", response_model=Barber)
def get_barber_by_telegram_id(telegram_id: int):
    """
    Usta botdan chiqib ketgan, tarixni tozalagan yoki qaytadan botga kirgan taqdirda ham,
    uning Telegram ID si orqali barcha ma'lumotlarini (reyting, izohlar, rasmlar, xizmatlar) tiklash.
    """
    for b in BARBERS_DB:
        if b.telegram_id and int(b.telegram_id) == int(telegram_id):
            return b
    raise HTTPException(status_code=404, detail="Bu Telegram ID ga tegishli usta topilmadi")

@app.get("/api/barbers/{barber_id}", response_model=Barber)
def get_barber_details(barber_id: str):
    for b in BARBERS_DB:
        if b.id == barber_id:
            return b
    raise HTTPException(status_code=404, detail="Usta topilmadi")

@app.post("/api/appointments", response_model=Appointment)
async def create_appointment(data: AppointmentCreate):
    """
    Mijoz navbat band qilganda saqlash va Telegram orqali ustaga bildirishnoma jo'natish.
    """
    barber = next((b for b in BARBERS_DB if b.id == data.barber_id), None)
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
        barber_avatar=barber.avatar,
        service_name=service.name,
        price=service.price,
        client_name=data.client_name,
        client_phone=data.client_phone,
        client_telegram_id=data.client_telegram_id,
        date_str=data.date_str,
        time_slot=data.time_slot,
        status="pending",
        reviewed=False,
        created_at=datetime.now().strftime("%Y-%m-%d %H:%M")
    )
    
    APPOINTMENTS_DB.append(appointment)
    save_appointments_to_disk(APPOINTMENTS_DB)

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
async def update_appointment_status(appointment_id: str, status: str = Query(...)):
    """
    Usta navbatni qabul qilishi, bekor qilishi yoki 'keldi' deb belgilashi.
    Mijozga avtomatik tarzda Telegram orqali xabar boradi!
    """
    for a in APPOINTMENTS_DB:
        if a.id == appointment_id:
            a.status = status
            save_appointments_to_disk(APPOINTMENTS_DB)

            # Agar mijozning Telegram ID si mavjud bo'lsa, xabar jo'natamiz
            if a.client_telegram_id:
                try:
                    await send_appointment_status_to_client(
                        bot=bot,
                        client_chat_id=a.client_telegram_id,
                        appointment_data=a.model_dump(),
                        status=status
                    )
                except Exception as err:
                    print(f"Mijozga bildirishnoma xatolik: {err}")

            return a
    raise HTTPException(status_code=404, detail="Navbat topilmadi")

class ScheduleUpdate(BaseModel):
    is_working_today: bool = True
    days_off: List[str] = []

@app.put("/api/barbers/{barber_id}/schedule")
def update_barber_schedule(barber_id: str, data: ScheduleUpdate):
    """Ustaning bugungi ish holati va haftalik dam olish kunlarini yangilash"""
    barber = next((b for b in BARBERS_DB if b.id == barber_id), None)
    if not barber:
        raise HTTPException(status_code=404, detail="Usta topilmadi")
    barber.is_working_today = data.is_working_today
    barber.days_off = data.days_off
    save_barbers_to_disk(BARBERS_DB)
    return {"success": True, "is_working_today": barber.is_working_today, "days_off": barber.days_off}

@app.get("/api/appointments/client", response_model=List[Appointment])
def get_client_appointments(phone: Optional[str] = None):
    """Mijozning o'z navbatlari ro'yxatini olish"""
    if phone:
        clean_phone = phone.replace(" ", "").replace("-", "")
        return [
            a for a in APPOINTMENTS_DB 
            if a.client_phone.replace(" ", "").replace("-", "") == clean_phone
        ]
    return APPOINTMENTS_DB

@app.patch("/api/appointments/{appointment_id}/cancel")
def client_cancel_appointment(appointment_id: str):
    """Mijoz navbatni bekor qilishi"""
    for a in APPOINTMENTS_DB:
        if a.id == appointment_id:
            a.status = "cancelled"
            save_appointments_to_disk(APPOINTMENTS_DB)
            return a
    raise HTTPException(status_code=404, detail="Navbat topilmadi")

# ================= MIJOZ TOMONIDAN IZOH VA REYTING (REVIEWS) =================

class ReviewCreate(BaseModel):
    author: str
    rating: int  # 1 to 5
    comment: str
    appointment_id: Optional[str] = None

@app.post("/api/barbers/{barber_id}/reviews")
def add_barber_review(barber_id: str, data: ReviewCreate):
    """
    Mijoz xizmatdan foydalangandan so'ng ustaga izoh va baho (1-5) berishi.
    Ustaning umumiy reytingi va izohlar soni avtomatik qayta hisoblanadi.
    """
    barber = next((b for b in BARBERS_DB if b.id == barber_id), None)
    if not barber:
        raise HTTPException(status_code=404, detail="Usta topilmadi")

    rating_val = max(1, min(5, data.rating))

    new_review = Review(
        id=f"rev-{uuid.uuid4().hex[:8]}",
        author=data.author or "Mijoz",
        rating=rating_val,
        date=datetime.now().strftime("%d-%m-%Y"),
        comment=data.comment or "Xizmat a'lo darajada!"
    )

    if not hasattr(barber, 'reviews') or barber.reviews is None:
        barber.reviews = []
    
    barber.reviews.insert(0, new_review)

    # Reytingni qayta hisoblash
    all_ratings = [r.rating for r in barber.reviews if r.rating > 0]
    if all_ratings:
        barber.rating = round(sum(all_ratings) / len(all_ratings), 1)
    barber.reviews_count = len(barber.reviews)

    save_barbers_to_disk(BARBERS_DB)

    # Agar appointment_id berilgan bo'lsa, navbatni "izoh qoldirilgan" deb belgilaymiz
    if data.appointment_id:
        for apt in APPOINTMENTS_DB:
            if apt.id == data.appointment_id:
                apt.reviewed = True
                apt.client_rating = rating_val
                apt.client_comment = data.comment
                save_appointments_to_disk(APPOINTMENTS_DB)
                break

    return {
        "success": True,
        "new_rating": barber.rating,
        "reviews_count": barber.reviews_count,
        "review": new_review
    }

# ================= USTA XIZMATLARINI BOSHQARISH (CRUD) =================

@app.post("/api/barbers", response_model=Barber)
def register_barber(barber: Barber):
    """Yangi usta ro'yxatdan o'tganda katalogga va doimiy faylga qo'shish"""
    BARBERS_DB.append(barber)
    save_barbers_to_disk(BARBERS_DB)
    return barber

@app.delete("/api/barbers/{barber_id}")
def delete_barber_account(barber_id: str):
    """
    Ustaning o'z xohishi bilan akkauntini butunlay o'chirishi (Delete Account).
    """
    global BARBERS_DB, APPOINTMENTS_DB
    barber = next((b for b in BARBERS_DB if b.id == barber_id), None)
    if not barber:
        raise HTTPException(status_code=404, detail="Usta topilmadi")
    
    BARBERS_DB = [b for b in BARBERS_DB if b.id != barber_id]
    save_barbers_to_disk(BARBERS_DB)

    APPOINTMENTS_DB = [a for a in APPOINTMENTS_DB if a.barber_id != barber_id]
    save_appointments_to_disk(APPOINTMENTS_DB)

    return {"success": True, "message": "Akkaunt muvaffaqiyatli o'chirildi"}

@app.post("/api/barbers/{barber_id}/services", response_model=Service)
def add_barber_service(barber_id: str, service: Service):
    """Usta o'z profiliga yangi xizmat qo'shishi"""
    barber = next((b for b in BARBERS_DB if b.id == barber_id), None)
    if not barber:
        raise HTTPException(status_code=404, detail="Usta topilmadi")
    barber.services.append(service)
    save_barbers_to_disk(BARBERS_DB)
    return service

@app.put("/api/barbers/{barber_id}/services/{service_id}", response_model=Service)
def update_barber_service(barber_id: str, service_id: str, updated_service: Service):
    """Usta o'z xizmatini tahrirlashi (narx, chegirma, aksiya)"""
    barber = next((b for b in BARBERS_DB if b.id == barber_id), None)
    if not barber:
        raise HTTPException(status_code=404, detail="Usta topilmadi")
    
    for idx, s in enumerate(barber.services):
        if s.id == service_id:
            barber.services[idx] = updated_service
            save_barbers_to_disk(BARBERS_DB)
            return updated_service
    raise HTTPException(status_code=404, detail="Xizmat topilmadi")

@app.delete("/api/barbers/{barber_id}/services/{service_id}")
def delete_barber_service(barber_id: str, service_id: str):
    """Usta xizmatni o'chirishi"""
    barber = next((b for b in BARBERS_DB if b.id == barber_id), None)
    if not barber:
        raise HTTPException(status_code=404, detail="Usta topilmadi")
    
    barber.services = [s for s in barber.services if s.id != service_id]
    save_barbers_to_disk(BARBERS_DB)
    return {"success": True, "message": "Xizmat o'chirildi"}

# ================= TO'LOV VA USTA KARTASINI BOSHQARISH =================

class CardLinkRequest(BaseModel):
    card_number: str
    card_expiry: str
    card_holder: Optional[str] = "USTA"

class SubscriptionRequest(BaseModel):
    plan_id: str # monthly, 3_months, yearly
    payment_method: str # click, payme, uzumbank, paynet, stars, auto_debit
    amount: int

@app.post("/api/barbers/{barber_id}/card")
def link_barber_card(barber_id: str, data: CardLinkRequest):
    """Ustaning bank kartasini (Uzcard / Humo) avtomatik to'lov uchun ulash"""
    barber = next((b for b in BARBERS_DB if b.id == barber_id), None)
    if not barber:
        raise HTTPException(status_code=404, detail="Usta topilmadi")
    
    clean_num = data.card_number.replace(" ", "")
    masked_number = f"{clean_num[:4]} **** **** {clean_num[-4:]}"
    card_type = "Uzcard" if clean_num.startswith("8600") else ("Humo" if clean_num.startswith("9860") else "Bank Card")

    barber.linked_card = {
        "number": masked_number,
        "expiry": data.card_expiry,
        "holder": data.card_holder,
        "bank": card_type,
        "linked_at": datetime.now().strftime("%Y-%m-%d %H:%M")
    }
    save_barbers_to_disk(BARBERS_DB)
    return {"success": True, "card": barber.linked_card}

@app.delete("/api/barbers/{barber_id}/card")
def unlink_barber_card(barber_id: str):
    """Ustaning ulangan kartasini o'chirish/almashtirish"""
    barber = next((b for b in BARBERS_DB if b.id == barber_id), None)
    if not barber:
        raise HTTPException(status_code=404, detail="Usta topilmadi")
    barber.linked_card = None
    save_barbers_to_disk(BARBERS_DB)
    return {"success": True, "message": "Karta muvaffaqiyatli o'chirildi"}

@app.post("/api/barbers/{barber_id}/subscription")
def pay_subscription(barber_id: str, data: SubscriptionRequest):
    """Tarif to'lovini amalga oshirish (Click, Payme, Uzum, Paynet, Stars, Auto-Debit)"""
    barber = next((b for b in BARBERS_DB if b.id == barber_id), None)
    if not barber:
        raise HTTPException(status_code=404, detail="Usta topilmadi")
    
    barber.subscription_status = "active"
    barber.is_trial = False
    barber.payment_method = data.payment_method
    save_barbers_to_disk(BARBERS_DB)
    return {
        "success": True,
        "message": f"{data.payment_method.capitalize()} orqali to'lov qabul qilindi. Obuna faollashtirildi!",
        "status": barber.subscription_status
    }

# ================= USTA PROFILI, ISH VAQTI VA SALON RASMLARI =================

class WorkHoursUpdate(BaseModel):
    start: str = "09:00"
    end: str = "22:00"

class AvatarUpdate(BaseModel):
    avatar_url: str

class SalonPhotoAdd(BaseModel):
    photo_url: str

@app.put("/api/barbers/{barber_id}/work-hours")
def update_work_hours(barber_id: str, data: WorkHoursUpdate):
    """Ustaning ish vaqtini yangilash (masalan 09:00 dan 22:00 gacha)"""
    barber = next((b for b in BARBERS_DB if b.id == barber_id), None)
    if not barber:
        raise HTTPException(status_code=404, detail="Usta topilmadi")
    barber.work_hours = {"start": data.start, "end": data.end}
    save_barbers_to_disk(BARBERS_DB)
    return {"success": True, "work_hours": barber.work_hours}

@app.put("/api/barbers/{barber_id}/avatar")
def update_barber_avatar(barber_id: str, data: AvatarUpdate):
    """Ustaning profil rasmini yangilash"""
    barber = next((b for b in BARBERS_DB if b.id == barber_id), None)
    if not barber:
        raise HTTPException(status_code=404, detail="Usta topilmadi")
    barber.avatar = data.avatar_url
    save_barbers_to_disk(BARBERS_DB)
    return {"success": True, "avatar": barber.avatar}

@app.post("/api/barbers/{barber_id}/salon-photos")
def add_salon_photo(barber_id: str, data: SalonPhotoAdd):
    """Sartaroshxona galereyasiga yangi rasm qo'shish"""
    barber = next((b for b in BARBERS_DB if b.id == barber_id), None)
    if not barber:
        raise HTTPException(status_code=404, detail="Usta topilmadi")
    if not hasattr(barber, 'salon_photos') or barber.salon_photos is None:
        barber.salon_photos = []
    barber.salon_photos.insert(0, data.photo_url)
    save_barbers_to_disk(BARBERS_DB)
    return {"success": True, "salon_photos": barber.salon_photos}

@app.delete("/api/barbers/{barber_id}/salon-photos")
def delete_salon_photo(barber_id: str, photo_url: str = Query(...)):
    """Sartaroshxona galereyasidan rasmni o'chirish"""
    barber = next((b for b in BARBERS_DB if b.id == barber_id), None)
    if not barber:
        raise HTTPException(status_code=404, detail="Usta topilmadi")
    if hasattr(barber, 'salon_photos') and barber.salon_photos:
        barber.salon_photos = [p for p in barber.salon_photos if p != photo_url]
    save_barbers_to_disk(BARBERS_DB)
    return {"success": True, "salon_photos": barber.salon_photos}
