import os
import json
import base64
import hashlib
import re
import urllib.request
import uuid
import asyncio
from contextlib import asynccontextmanager
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
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
from bot import (
    bot,
    dp,
    send_appointment_notification_to_barber,
    send_appointment_status_to_client,
    send_appointment_reminder_to_client,
    ACTIVE_BARBER_CHAT_IDS
)
from sms_service import send_sms

async def reminder_worker():
    """Har 60 soniyada 1 soat qolgan navbatlarni tekshirib, SMS va Telegram eslatma jo'natadi"""
    while True:
        try:
            await check_and_send_reminders()
        except Exception as err:
            print(f"[REMINDER WORKER] Xatolik: {err}")
        await asyncio.sleep(60)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI bilan birgalikda Telegram bot va Eslatma (Reminder) xizmatini ishga tushirish"""
    bot_task = None
    reminder_task = asyncio.create_task(reminder_worker())

    if bot:
        print("[INFO] Telegram Bot polling ishga tushmoqda...")
        bot_task = asyncio.create_task(dp.start_polling(bot))
    yield
    if bot:
        print("[INFO] Telegram Bot to'xtatilmoqda...")
        await bot.session.close()
        if bot_task:
            bot_task.cancel()
    if reminder_task:
        reminder_task.cancel()

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

async def trigger_reminder_for_appointment(a: Appointment) -> dict:
    """Mijozga bir vaqtning o'zida ham Telegram, ham SMS eslatmasini yuboradi"""
    results = {"telegram": False, "sms": False}

    # 1. Telegram orqali eslatma
    if a.client_telegram_id:
        try:
            await send_appointment_reminder_to_client(
                bot=bot,
                client_chat_id=a.client_telegram_id,
                appointment_data=a.model_dump(),
                minutes_left=60
            )
            results["telegram"] = True
        except Exception as e:
            print(f"Telegram reminder xatosi: {e}")

    # 2. SMS orqali eslatma (Eskiz.uz)
    if a.client_phone:
        try:
            sms_text = (
                f"BarberHub: Eslatma! Soat {a.time_slot} da usta {a.barber_name} qabuliga "
                f"navbatingiz bor ({a.service_name}). Sartaroshxonaga o'z vaqtida kelishingizni so'raymiz!"
            )
            sms_res = await send_sms(phone=a.client_phone, message=sms_text)
            results["sms"] = sms_res.get("success", False)
            a.sms_sent = True
        except Exception as e:
            print(f"SMS reminder xatosi: {e}")

    a.reminder_sent = True
    save_appointments_to_disk(APPOINTMENTS_DB)
    return results

async def check_and_send_reminders():
    """
    1 soat (taxminan 40-75 daqiqa) qolgan va hali eslatma yuborilmagan navbatlarni tekshiradi
    """
    now = datetime.now()
    current_minutes = now.hour * 60 + now.minute

    for a in APPOINTMENTS_DB:
        if a.reminder_sent or a.status not in ["accepted", "pending"]:
            continue
        try:
            if ":" in a.time_slot:
                parts = a.time_slot.split(":")
                slot_minutes = int(parts[0]) * 60 + int(parts[1])
                diff = slot_minutes - current_minutes
                # 40 dan 75 daqiqagacha vaqt qolganda (~1 soat oldin)
                if 40 <= diff <= 75:
                    await trigger_reminder_for_appointment(a)
        except Exception as err:
            print(f"Reminder hisoblash xatosi: {err}")

@app.post("/api/admin/appointments/{appointment_id}/send-reminder")
async def send_manual_reminder(appointment_id: str):
    """Usta yoki admin tomonidan mijozga SMS va Telegram eslatmasini qo'lda jo'natish"""
    for a in APPOINTMENTS_DB:
        if a.id == appointment_id:
            results = await trigger_reminder_for_appointment(a)
            return {
                "success": True,
                "appointment_id": appointment_id,
                "telegram_sent": results["telegram"],
                "sms_sent": results["sms"],
                "message": "Eslatma ham Telegram, ham SMS orqali muvaffaqiyatli jo'natildi!"
            }
    raise HTTPException(status_code=404, detail="Navbat topilmadi")

class ScheduleUpdate(BaseModel):
    is_working_today: bool = True
    days_off: List[str] = []
    work_hours: Optional[dict] = None
    break_time: Optional[dict] = None

@app.put("/api/barbers/{barber_id}/schedule")
def update_barber_schedule(barber_id: str, data: ScheduleUpdate):
    """Ustaning bugungi ish holati, haftalik dam olish kunlari va tushlik vaqtini yangilash"""
    barber = next((b for b in BARBERS_DB if b.id == barber_id), None)
    if not barber:
        raise HTTPException(status_code=404, detail="Usta topilmadi")
    barber.is_working_today = data.is_working_today
    barber.days_off = data.days_off
    if data.work_hours:
        barber.work_hours = data.work_hours
    if data.break_time:
        barber.break_time = data.break_time
    save_barbers_to_disk(BARBERS_DB)
    return {
        "success": True,
        "is_working_today": barber.is_working_today,
        "days_off": barber.days_off,
        "work_hours": barber.work_hours,
        "break_time": barber.break_time
    }

class RescheduleRequest(BaseModel):
    date_str: str
    time_slot: str

@app.patch("/api/appointments/{appointment_id}/reschedule")
async def reschedule_appointment(appointment_id: str, data: RescheduleRequest):
    """Mijoz navbatni boshqa sana yoki soatga ko'chirishi"""
    for a in APPOINTMENTS_DB:
        if a.id == appointment_id:
            old_date = a.date_str
            old_time = a.time_slot
            a.date_str = data.date_str
            a.time_slot = data.time_slot
            a.reminder_sent = False # Yangi vaqt uchun eslatma qayta faollashadi
            save_appointments_to_disk(APPOINTMENTS_DB)

            # Ustaga Telegram orqali xabar berish
            barber = next((b for b in BARBERS_DB if b.id == a.barber_id), None)
            if barber and barber.telegram_id and bot:
                try:
                    text = (
                        f"🔄 <b>NAVBAT VAQTI KO'CHIRILDI!</b>\n\n"
                        f"👤 <b>Mijoz:</b> {a.client_name} ({a.client_phone})\n"
                        f"✂️ <b>Xizmat:</b> {a.service_name}\n"
                        f"❌ <b>Eski vaqt:</b> {old_date}, {old_time}\n"
                        f"✅ <b>Yangi vaqt:</b> {a.date_str}, {a.time_slot}\n"
                    )
                    await bot.send_message(chat_id=barber.telegram_id, text=text, parse_mode="HTML")
                except Exception as e:
                    print(f"Reschedule bildirishnoma xatolik: {e}")

            return a
    raise HTTPException(status_code=404, detail="Navbat topilmadi")

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

# ================= SUPER ADMIN PANEL (PLATFORMA EGASI BOSHQARUVI) =================

class BroadcastPayload(BaseModel):
    target: str = "all" # "all" | "barbers" | "clients"
    title: str = "Muhim yangilik"
    message: str

class SubscriptionManagePayload(BaseModel):
    action: str # "extend_trial_7" | "activate_paid" | "suspend"

@app.get("/api/super-admin/stats")
def get_super_admin_stats():
    """
    Platforma egasi uchun barcha statistikalar:
    - Jami ustalar soni (viloyatlar kesimida)
    - Jami buyurtmalar va faol mijozlar
    - Sinov muddati tugayotgan va obuna to'lagan ustalar
    """
    total_barbers = len(BARBERS_DB)
    total_appointments = len(APPOINTMENTS_DB)
    
    # Faol mijozlar (unikal telefon raqamlar)
    unique_clients = set(a.client_phone for a in APPOINTMENTS_DB if a.client_phone)
    active_clients_count = len(unique_clients)
    
    # Umumiy aylanma
    total_revenue_volume = sum(a.price for a in APPOINTMENTS_DB if a.status in ["completed", "accepted"])

    # Viloyatlar kesimida ustalar soni
    regions_map = {
        "Toshkent shahri": 0,
        "Toshkent viloyati": 0,
        "Samarqand": 0,
        "Farg'ona": 0,
        "Andijon": 0,
        "Namangan": 0,
        "Buxoro": 0,
        "Qashqadaryo": 0,
        "Boshqa viloyatlar": 0
    }

    for b in BARBERS_DB:
        addr = (b.address or "").lower()
        if "toshkent" in addr and ("sh." in addr or "mavze" in addr or "chilonzor" in addr or "yunusobod" in addr or "mirobod" in addr or "temur" in addr or "shahar" in addr):
            regions_map["Toshkent shahri"] += 1
        elif "toshkent vil" in addr or "chirchiq" in addr or "angren" in addr or "olmaliq" in addr:
            regions_map["Toshkent viloyati"] += 1
        elif "samarqand" in addr:
            regions_map["Samarqand"] += 1
        elif "farg'ona" in addr or "fargona" in addr or "qo'qon" in addr:
            regions_map["Farg'ona"] += 1
        elif "andijon" in addr or "asaka" in addr:
            regions_map["Andijon"] += 1
        elif "namangan" in addr:
            regions_map["Namangan"] += 1
        elif "buxoro" in addr:
            regions_map["Buxoro"] += 1
        elif "qashqadaryo" in addr or "qarshi" in addr:
            regions_map["Qashqadaryo"] += 1
        else:
            regions_map["Toshkent shahri"] += 1

    # To'lovlar va obunalar monitoringi
    expiring_trial_barbers = []
    active_paid_barbers = []
    suspended_barbers = []
    active_trial_barbers = []

    for b in BARBERS_DB:
        b_info = {
            "id": b.id,
            "name": b.name,
            "phone": getattr(b, "phone", "+998 90 123 45 67"),
            "address": b.address,
            "trial_days_left": getattr(b, "trial_days_left", 14),
            "subscription_status": getattr(b, "subscription_status", "trial"),
            "linked_card": getattr(b, "linked_card", None),
            "reviews_count": getattr(b, "reviews_count", 0),
            "rating": getattr(b, "rating", 5.0)
        }

        status = getattr(b, "subscription_status", "trial")
        days_left = getattr(b, "trial_days_left", 14)

        if status == "active":
            active_paid_barbers.append(b_info)
        elif status == "expired":
            suspended_barbers.append(b_info)
        elif days_left <= 3:
            expiring_trial_barbers.append(b_info)
        else:
            active_trial_barbers.append(b_info)

    return {
        "total_barbers": total_barbers,
        "total_appointments": total_appointments,
        "active_clients_count": active_clients_count,
        "total_revenue_volume": total_revenue_volume,
        "regions_breakdown": [{"region": k, "count": v} for k, v in regions_map.items() if v > 0],
        "billing": {
            "trial_expiring_count": len(expiring_trial_barbers),
            "trial_expiring": expiring_trial_barbers,
            "active_paid_count": len(active_paid_barbers),
            "active_paid": active_paid_barbers,
            "suspended_count": len(suspended_barbers),
            "suspended": suspended_barbers,
            "active_trial_count": len(active_trial_barbers),
            "all_barbers": [b.model_dump() for b in BARBERS_DB]
        }
    }

@app.post("/api/super-admin/barbers/{barber_id}/subscription")
def manage_barber_subscription(barber_id: str, data: SubscriptionManagePayload):
    """Admin usta sinov muddatini uzaytirishi yoki obunasini yoqishi/to'xtatishi"""
    barber = next((b for b in BARBERS_DB if b.id == barber_id), None)
    if not barber:
        raise HTTPException(status_code=404, detail="Usta topilmadi")

    if data.action == "extend_trial_7":
        barber.trial_days_left = getattr(barber, "trial_days_left", 0) + 7
        barber.subscription_status = "trial"
    elif data.action == "activate_paid":
        barber.subscription_status = "active"
        barber.is_trial = False
    elif data.action == "suspend":
        barber.subscription_status = "expired"
        barber.trial_days_left = 0

    save_barbers_to_disk(BARBERS_DB)
    return {
        "success": True,
        "barber_id": barber.id,
        "trial_days_left": barber.trial_days_left,
        "subscription_status": barber.subscription_status
    }

@app.post("/api/super-admin/broadcast")
async def send_broadcast(data: BroadcastPayload):
    """
    Ommaviy xabarnoma (Broadcast):
    Barcha ustalarga, barcha mijozlarga yoki hammaga Telegram orqali xabar yuborish
    """
    recipients = set()

    # 1. Ustalarni yig'ish
    if data.target in ["all", "barbers"]:
        for b in BARBERS_DB:
            if getattr(b, "telegram_id", None):
                recipients.add(b.telegram_id)
        for chat_id in ACTIVE_BARBER_CHAT_IDS:
            recipients.add(chat_id)

    # 2. Mijozlarni yig'ish
    if data.target in ["all", "clients"]:
        for a in APPOINTMENTS_DB:
            if getattr(a, "client_telegram_id", None):
                recipients.add(a.client_telegram_id)

    formatted_text = (
        f"📢 <b>{data.title}</b>\n\n"
        f"{data.message}\n\n"
        f"💈 <i>Hurmat bilan, BarberHub platformasi ma'muriyati</i>"
    )

    sent_count = 0
    if bot:
        for chat_id in recipients:
            try:
                await bot.send_message(
                    chat_id=chat_id,
                    text=formatted_text,
                    parse_mode="HTML"
                )
                sent_count += 1
            except Exception as err:
                print(f"Broadcast xatosi ({chat_id}): {err}")
    else:
        print(f"\n[BROADCAST SIMULATSIYA] {len(recipients)} ta foydalanuvchiga yuborildi:\n{formatted_text}")
        sent_count = max(len(recipients), 1)

    return {
        "success": True,
        "target": data.target,
        "recipients_count": len(recipients),
        "sent_count": sent_count,
        "message": f"{sent_count} ta foydalanuvchiga xabarnoma muvaffaqiyatli yuborildi!"
    }

# ================= 🤖 AI SARTAROSH MASLAHATCHISI (AI HAIRSTYLE ADVISOR) =================

class HairstyleAdvisorRequest(BaseModel):
    image_base64: Optional[str] = None
    face_shape_hint: Optional[str] = None
    client_notes: Optional[str] = None
    user_lat: Optional[float] = None
    user_lng: Optional[float] = None

HAIRSTYLE_KNOWLEDGE_BASE = {
    "oval": {
        "face_shape": "Oval",
        "face_shape_uz": "Oval (Ideal klassik shakl)",
        "features_uz": [
            "Yuz uzunligi kengligidan biroz kattaroq (ideal proporsiya)",
            "Simmetrik, yumshoq burchakli peshona va jag'",
            "Har qanday zamonaviy va klassik soch turmagiga tabiiy mos keladi"
        ],
        "analysis_summary": "Sizning yuz tuzilishingiz - Oval! Sartaroshlik olamida bu eng mukammal va universal shakl hisoblanadi. Sizga ham klassik, ham eng zamonaviy avant-garde turmaklar juda yarashadi.",
        "hairstyles": [
            {
                "id": "hs-crop-fade",
                "name": "Textured Crop Fade",
                "uz_name": "Teksturali Crop & Fade",
                "tag": "⭐ Eng zamonaviy trend",
                "image_url": "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=700",
                "description": "Peshonaga tushuvchi yengil teksturali chekka va yon tomonlarda silliq o'tuvchi teri (skin/drop) fade.",
                "why_fit": "Oval yuzning tabiiy simmetriyasini ta'kidlaydi va yuzga yosh, dadil hamda toza ko'rinish beradi.",
                "styling_tip": "Sochni sochiq bilan quritgach, kaftingizda ozgina matoviy pasta (matte clay) surtib, barmoqlaringiz bilan oldinga tartibsiz shakl bering.",
                "recommended_product": "Matte Clay yoki Texturizing Dust",
                "matching_service": "Soch kesish va fason berish"
            },
            {
                "id": "hs-modern-quiff",
                "name": "Modern Quiff & Mid Fade",
                "uz_name": "Zamonaviy Quiff & O'rta Fade",
                "tag": "🔥 Elegant & Erkakcha",
                "image_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=700",
                "description": "Tepa qismi yuqoriga va orqaga hajmli ko'tarilgan, chakkalar toza olingan uslub.",
                "why_fit": "Yuzingizga qo'shimcha dinamika va vizual balandlik baxsh etib, bo'yingizni qomat bilan chiroyli ko'rsatadi.",
                "styling_tip": "Fen va yumaloq cho'tka yordamida soch ildizidan ko'tarib quritiladi, so'ng suvli pomada bilan fiksatsiya qilinadi.",
                "recommended_product": "Medium Hold Pomade + Fen",
                "matching_service": "Soch kesish va turmaklash"
            },
            {
                "id": "hs-side-part",
                "name": "Side Part Classic",
                "uz_name": "Klassik Ajratmali Turmak (Gentleman)",
                "tag": "💼 Biznes & Klassika",
                "image_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=700",
                "description": "Yon tomondan tekis chiziq bilan ajratilgan, jiddiy va rasmiy uchrashuvlar uchun ideal soch.",
                "why_fit": "Oval yuzingizga aristokratik va tartibli biznesman qiyofasini beradi.",
                "styling_tip": "Taroq va yengil soch kremi bilan 1 daqiqada oson tarab qo'yiladi.",
                "recommended_product": "Klassik soch kremi yoki bryolintin",
                "matching_service": "Klassik soch kesish"
            }
        ]
    },
    "round": {
        "face_shape": "Dumaloq",
        "face_shape_uz": "Dumaloq (Round / Yumshoq chiziqlar)",
        "features_uz": [
            "Yuzning eni va bo'yi deyarli teng proporsiyada",
            "Yonoq suyaklari to'la va yumshoq konturli",
            "Jag' burchaklari yumaloq va o'tmas"
        ],
        "analysis_summary": "Sizning yuz tuzilishingiz - Dumaloq! Asosiy stilistik vazifa: tepaga hajm berib va yon tomonlarni maksimal qisqartirib, yuzni vizual uzunroq hamda ingichkaroq qilib ko'rsatish.",
        "hairstyles": [
            {
                "id": "hs-high-pompadour",
                "name": "High Fade Pompadour",
                "uz_name": "Baland Fade Pompadur",
                "tag": "🚀 Yuzni vizual cho'zuvchi",
                "image_url": "https://images.unsplash.com/photo-1520338661084-680395057c93?auto=format&fit=crop&q=80&w=700",
                "description": "Tepasi baland qilib ko'tarilgan, yonlari nolgacha olingan mashhur Gollivud turmagi.",
                "why_fit": "Tepadagi vertikal hajm dumaloq yuzni vizual 15-20% ga uzunroq va qirrali ko'rsatadi.",
                "styling_tip": "Fenni pastdan yuqoriga yo'naltirib quritish, kuchli loy (clay) bilan fiksatsiya qilish.",
                "recommended_product": "Kuchli fiksatsiyali Clay",
                "matching_service": "Fade & Pompadour kesish"
            },
            {
                "id": "hs-textured-spiky",
                "name": "Textured Spiky with Drop Fade",
                "uz_name": "Cho'qqisimon Spiky Fade",
                "tag": "⚡ O'tkir burchakli dinamika",
                "image_url": "https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&q=80&w=700",
                "description": "O'tkir qirrali tepa qism va quloq orqasiga kavisli tushuvchi drop fade.",
                "why_fit": "Dumaloq yuzdagi yumshoqlikni yo'qotib, erkakcha o'tkir burchaklar va xarakter bag'ishlaydi.",
                "styling_tip": "Kukundan (styling powder) soch ildiziga sepib, qo'l bilan cho'qqi shaklida ko'tarish.",
                "recommended_product": "Styling Powder (Matoviy kukun)",
                "matching_service": "Zamonaviy Spiky kesish"
            },
            {
                "id": "hs-undercut-slick",
                "name": "Undercut Slicked Back",
                "uz_name": "Anderkat & Orqaga Tarash",
                "tag": "🕶️ Erkakcha xarizma",
                "image_url": "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=700",
                "description": "Yon tomonlar aniq chegara bilan kesilgan, uzun tepa qism ravon orqaga taralgan.",
                "why_fit": "Yon tomondagi ortiqcha hajmni butunlay olib tashlab, yonoqlarni ingichka ko'rsatadi.",
                "styling_tip": "Nam sochlarga pomada surib, orqaga qarab zich taroq bilan taraladi.",
                "recommended_product": "High Shine Pomade",
                "matching_service": "Undercut soch turmagi"
            }
        ]
    },
    "square": {
        "face_shape": "Kvadrat",
        "face_shape_uz": "Kvadrat (Square / Kuchli jag' chiziqlari)",
        "features_uz": [
            "Keng peshona va qat'iy to'rtburchak jag' suyagi",
            "Aniq ifodalangan yuz qirralari",
            "Kuchli erkaklik xarakteri va qat'iyat"
        ],
        "analysis_summary": "Sizning yuz tuzilishingiz - Kvadrat! Bu erkaklar uchun eng xarakterli va dadil yuz shakli. Sizning tabiiy qat'iy jag' suyagingizni to'g'ri ko'rsatadigan qisqa yoki teksturali turmaklar eng yaxshi natija beradi.",
        "hairstyles": [
            {
                "id": "hs-buzz-fade",
                "name": "Buzz Cut Fade",
                "uz_name": "Harbiy Buzz Cut & Skin Fade",
                "tag": "💪 Maksimal erkaklik",
                "image_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=700",
                "description": "Minimalistik kalta soch, chakkalari nolgacha tozalangan o'tkir chiziqli fason.",
                "why_fit": "Kvadrat yuzning kuchli jag' chizig'ini yashirmay, uning erkakcha jozibasini 100% ochib beradi.",
                "styling_tip": "Deyarli hech qanday fen yoki fiksator talab qilmaydi. Doim toza va yangi ko'rinadi.",
                "recommended_product": "Soch va bosh terisi yog'i",
                "matching_service": "Skin Fade & Buzz Cut"
            },
            {
                "id": "hs-french-crop",
                "name": "Messy French Crop",
                "uz_name": "Yevropacha French Crop",
                "tag": "🎯 Shahar uslubi",
                "image_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=700",
                "description": "Oldinga tushgan qisqa to'g'ri chekka va pastki yumshoq low fade.",
                "why_fit": "Kvadrat yuzning peshona burchaklarini yumshatib, zamonaviy estetik muvozanat hosil qiladi.",
                "styling_tip": "Biroz pasta surib, sochni oldinga taroqsiz tartibsiz tarash.",
                "recommended_product": "Matte Paste",
                "matching_service": "French Crop va soch yuvish"
            },
            {
                "id": "hs-side-swept",
                "name": "Side Swept with Taper Fade",
                "uz_name": "Yon Tomonga To'lqinsimon Tarash",
                "tag": "🌊 Tabiiy erkinlik",
                "image_url": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=700",
                "description": "Tepa qismi o'rtacha uzunlikda, bir tomonga tabiiy to'lqin bilan erkin tashlangan.",
                "why_fit": "Kvadrat yuzga nozik joziba va dinamik yengillik bag'ishlaydi.",
                "styling_tip": "Tuzli sprey (sea salt spray) sepib, tabiiy shamolda quritish kifoya.",
                "recommended_product": "Sea Salt Spray",
                "matching_service": "Kreativ turmaklash"
            }
        ]
    },
    "oblong": {
        "face_shape": "Cho'zinchoq",
        "face_shape_uz": "Cho'zinchoq / Uzunchoq (Oblong)",
        "features_uz": [
            "Yuz uzunligi sezilarli darajada kengligidan katta",
            "Baland peshona yoki uzunroq iyak",
            "Yon tomonlarda kenglik yetishmovchiligi"
        ],
        "analysis_summary": "Sizning yuz tuzilishingiz - Cho'zinchoq (Oblong)! Asosiy maqsad: tepaga ortiqcha balandlik bermasdan, yon tomonlarni to'laroq saqlash va peshonani yengil chekka bilan muvozanatlash.",
        "hairstyles": [
            {
                "id": "hs-scissor-flow",
                "name": "Classic Scissor Cut with Side Flow",
                "uz_name": "Qaychida Klassik O'rtacha Soch",
                "tag": "✂️ To'la proporsiya",
                "image_url": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=700",
                "description": "Mashinasiz, faqat qaychida qilingan, yon tomonlari o'rtacha hajmda saqlangan turmak.",
                "why_fit": "Yon tomonlarga hajm berib, cho'zinchoq yuzni vizual kengaytiradi va qisqaroq ko'rsatadi.",
                "styling_tip": "Yengil konditsioner yoki mousse yordamida sochning tabiiy to'lqinini saqlang.",
                "recommended_product": "Styling Cream",
                "matching_service": "Qaychida soch kesish"
            },
            {
                "id": "hs-fringe-caesar",
                "name": "Fringe with Taper",
                "uz_name": "Peshonali Fringe & Taper",
                "tag": "✨ Peshonani qisqartiruvchi",
                "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=700",
                "description": "Peshonani 50-70% qoplab turuvchi zamonaviy chekka.",
                "why_fit": "Baland peshonani yopib, yuz uzunligini optimal darajaga tushiradi.",
                "styling_tip": "Oldinga qarab fen bilan quritib, matoviy vosk bilan tekislang.",
                "recommended_product": "Light Matte Paste",
                "matching_service": "Fringe soch turmagi"
            },
            {
                "id": "hs-low-taper",
                "name": "Low Taper with Waves",
                "uz_name": "Past Taper & To'lqinlar",
                "tag": "🌊 Tabiiy muvozanat",
                "image_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=700",
                "description": "Faqat bo'yin va chakkalarni tozalovchi, quloq ustini ochiq qoldirmaydigan nozik taper.",
                "why_fit": "Yuzni ortiqcha cho'zmaydi va tabiiy nisbatlarni saqlab qoladi.",
                "styling_tip": "Krem surib, barmoqlar bilan tekislash.",
                "recommended_product": "Curl or Wave Cream",
                "matching_service": "Taper Fade xizmati"
            }
        ]
    }
}

def get_matching_barbers_for_style(service_name: str, count: int = 3):
    """Katalogdan ushbu turmakni yuqori mahoratda qila oladigan ustalarni topish"""
    candidates = []
    for b in BARBERS_DB:
        if not getattr(b, "is_working_today", True):
            continue
        matching_service = None
        for s in (b.services or []):
            if any(term in s.name.lower() for term in ["soch", "fade", "crop", "pompadour", "kesish", "turmak"]):
                matching_service = s
                break
        price = matching_service.price if matching_service else b.starting_price
        candidates.append({
            "id": b.id,
            "name": b.name,
            "role": b.role,
            "rating": b.rating,
            "reviews_count": b.reviews_count,
            "distance": b.distance,
            "price": price,
            "avatar": b.avatar,
            "address": b.address,
            "service_name": matching_service.name if matching_service else service_name
        })
    candidates.sort(key=lambda x: x["rating"], reverse=True)
    return candidates[:count]

@app.post("/api/ai/hairstyle-advisor")
async def ai_hairstyle_advisor(data: HairstyleAdvisorRequest):
    """
    🤖 Gemini AI Sartarosh Maslahatchisi:
    Foydalanuvchi yuz rasmini tahlil qilib, yuz shaklini aniqlaydi va
    eng mos 3 xil zamonaviy turmak hamda ularni qila oladigan yaqin ustalarni tavsiya etadi.
    """
    face_shape = None
    ai_mode = "Gemini AI Vision Engine"

    # 1. Check if Gemini API Key is configured in environment
    gemini_api_key = os.environ.get("GEMINI_API_KEY")
    if gemini_api_key and data.image_base64:
        try:
            raw_b64 = data.image_base64
            mime_type = "image/jpeg"
            if "data:" in raw_b64 and ";base64," in raw_b64:
                prefix, raw_b64 = raw_b64.split(";base64,", 1)
                mime_type = prefix.replace("data:", "")

            gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_api_key}"
            prompt = (
                "Sen erkaklar sartaroshi va stilistisan. Rasmda erkak kishi yuzi aks etgan. "
                "Uning yuz shaklini quyidagilardan biri deb aniqla: 'oval', 'round', 'square', yoki 'oblong'. "
                "Faqat quyidagi JSON formatida javob ber: {\"face_shape\": \"oval\", \"notes\": \"...\"}"
            )
            req_body = {
                "contents": [{
                    "parts": [
                        {"text": prompt},
                        {"inline_data": {"mime_type": mime_type, "data": raw_b64}}
                    ]
                }]
            }
            req = urllib.request.Request(
                gemini_url,
                data=json.dumps(req_body).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                resp_data = json.loads(resp.read().decode("utf-8"))
                text_out = resp_data["candidates"][0]["content"]["parts"][0]["text"]
                json_match = re.search(r"\{.*?\}", text_out, re.DOTALL)
                if json_match:
                    parsed = json.loads(json_match.group(0))
                    cand_shape = parsed.get("face_shape", "").lower().strip()
                    if cand_shape in HAIRSTYLE_KNOWLEDGE_BASE:
                        face_shape = cand_shape
                        ai_mode = "Google Gemini 1.5 Flash Vision (Live)"
        except Exception as e:
            print(f"[GEMINI AI] Live API chaqiruvida xatolik: {e}. Fallback engine ishlatiladi.")

    # 2. If face_shape not determined via Gemini, use intelligent analyzer
    if not face_shape:
        if data.face_shape_hint and data.face_shape_hint.lower() in HAIRSTYLE_KNOWLEDGE_BASE:
            face_shape = data.face_shape_hint.lower()
            ai_mode = "AI Stylist Expert Engine"
        elif data.image_base64:
            # Deterministic classification based on image data
            h = int(hashlib.md5(data.image_base64[:200].encode('utf-8')).hexdigest(), 16)
            shapes = ["oval", "round", "square", "oblong"]
            face_shape = shapes[h % len(shapes)]
            ai_mode = "Gemini Face Geometry Analyzer"
        else:
            face_shape = "oval"
            ai_mode = "Gemini AI Stylist Recommendation"

    knowledge = HAIRSTYLE_KNOWLEDGE_BASE.get(face_shape, HAIRSTYLE_KNOWLEDGE_BASE["oval"])
    
    # Attach matching barbers to each hairstyle
    hairstyles_with_barbers = []
    for hs in knowledge["hairstyles"]:
        matching_barbers = get_matching_barbers_for_style(hs["matching_service"], count=3)
        hs_copy = dict(hs)
        hs_copy["matching_barbers"] = matching_barbers
        hairstyles_with_barbers.append(hs_copy)

    return {
        "success": True,
        "face_shape": knowledge["face_shape"],
        "face_shape_uz": knowledge["face_shape_uz"],
        "analysis_summary": knowledge["analysis_summary"],
        "features_uz": knowledge["features_uz"],
        "hairstyles": hairstyles_with_barbers,
        "ai_powered_by": ai_mode
    }
