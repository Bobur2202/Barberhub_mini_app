# 💈 BarberHub — Men's Barbershop SaaS & Telegram Mini-App Platform

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Aiogram-3.x-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white" alt="Aiogram" />
  <img src="https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
</p>

---

## 📌 Loyiha haqida (Overview)

**BarberHub** — bu erkaklar sartaroshxonalari uchun mo'ljallangan ikki tomonlama (Dual-Mode) zamonaviy **SaaS va Marketplace** platformasi. Loyiha Telegram Mini-App ekotizimida ishlashga to'liq moslashtirilgan.

* **Mijozlar uchun (Marketplace)**: O'ziga eng yaqin sartaroshlarni GPS orqali topish, xizmat narxlari va chegirmalarni ko'rish hamda 3 bosqichda navbatni band qilish.
* **Sartaroshlar uchun (SaaS Dashboard)**: Yangi buyurtmalarni Telegram orqali real-vaqtda qabul qilish/bekor qilish, kunlik navbatlarni boshqarish, xizmatlar narxini sozlash va oylik obunani uzaytirish.

---

## ✨ Asosiy Funksionallik (Features)

### 1. 📍 Haqiqiy GPS Geolokatsiya & Masofani Hisoblash (Haversine Formula)
- Qurilmaning geolokatsiyasini aniqlash (`navigator.geolocation`).
- Mijoz va sartaroshlar o'rtasidagi masofani aniq hisoblash (masalan: `750 m`, `1.4 km`).
- Toshkent tumanlari (Yunusobod, Chilonzor, Mirzo Ulug'bek...) bo'yicha tezkor saralash.

### 2. 🌐 Ko'p tilli tizim (i18n — 3 ta til)
- 🇺🇿 **O'zbek tili**
- 🇷🇺 **Русский язык**
- 🇬🇧 **English**

### 3. 📱 6 ta To'liq Ishlab Chiqilgan Ekran (Pixel-Perfect UI)
1. **Splash & Til tanlash**: Brend logotipi va til tugmalari.
2. **Katalog (Feed)**: Qidiruv, filtr chiplari (*Eng yaqin, Top reyting, Bugun bo'sh*) va usta kartochkalari.
3. **Usta profili**: Reyting, bio, xizmatlar va talaba chegirma tariflari (*slashed old price, highlighted new price*).
4. **Sana & Vaqt slotlari**: 7 kunlik gorizontal sana lentasi, 3 ustunli vaqt slotlari (Bo'sh, Tanlangan, Band).
5. **Ma'lumotlarni tasdiqlash**: Zakaz xulosasi, ism/telefon kiritish va Telegram xabarnoma simulyatsiyasi.
6. **Usta Admin Kabineti (SaaS)**: Kunlik navbatlar ro'yxati, `[Keldi]` va `[Bekor qilish]` tugmalari, xizmatlar va narxlarni tahrirlash hamda oylik obuna holati (Pro plan).

### 4. ⚡ Real-vaqt Telegram Bot Integratsiyasi (Aiogram 3.x)
- Mijoz buyurtma qilishi bilanoq ustaning shaxsiy Telegramiga tezkor inline-tugmali xabarnoma yuboriladi:
  ```text
  🔔 YANGI MIJOZ YOZILDI!
  👤 Mijoz: Sardorbek (+998 90 123 45 67)
  ✂️ Xizmat: Soch va soqol kompleks
  📅 Vaqt: 16-Noyabr, 14:45
  💰 Narxi: 80,000 UZS

  [ ✅ Qabul qilish ]  [ ❌ Bekor qilish ]
  ```

---

## 🎨 Dizayn Tizimi (Design Tokens)

| Element | Qiymat / Rang kodi | Tavsif |
|---|---|---|
| **Fon (Background)** | `#E6EDF9` | Yumshoq ko'kish-kulrang, ko'zni toliqtirmaydigan fon |
| **Birlamchi (Primary)** | `#004B86` | Klassik erkaklarga xos to'q ko'k rang |
| **Aksent (Accent)** | `#FAA100` | Yorqin harakatga chaqiruvchi sariq/oltin rang |
| **Kartalar** | `#FFFFFF` | 14px burchak radiusi, yumshoq soyalar |

---

## 🏗 Arxitektura (Project Structure)

```text
barberhub/
├── frontend/               # React + Vite + Tailwind Mini-App
│   ├── src/
│   │   ├── components/     # HeaderBar, Rejim almashtirgich
│   │   ├── data/           # Mock ma'lumotlar & Haversine geolokatsiya formulasi
│   │   ├── i18n/           # UZ / RU / EN tarjimalar
│   │   ├── pages/          # 6 ta to'liq ekran
│   │   ├── services/       # FastAPI bilan bog'lovchi API client
│   │   ├── App.jsx         # Asosiy state & Telegram WebApp SDK
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/                # Python FastAPI + Aiogram Bot
│   ├── main.py             # REST API endpointlari (/api/barbers, /api/appointments)
│   ├── bot.py              # Aiogram 3.x Telegram boti & xabarnomalari
│   ├── database.py         # Pydantic modellar
│   └── requirements.txt
│
├── start_all.bat           # Bitta bosishda hammasini ishga tushiruvchi fayl
├── start_frontend.bat      # Frontendni alohida ishga tushirish
├── start_backend.bat       # Backendni alohida ishga tushirish
└── README.md
```

---

## 🚀 O'rnatish va Ishga Tushirish (Quick Start)

### 1-usul: Bitta bosishda (Windows)
Loyiha ildizidagi **`start_all.bat`** faylini 2 marta bosing.

### 2-usul: Qo'lda ishga tushirish

#### Frontend (React + Vite):
```bash
cd frontend
npm install
npm run dev
```
👉 `http://localhost:5173` yoki telefon orqali `http://192.168.1.103:5173`

#### Backend (FastAPI):
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
👉 API Hujjati (Swagger): `http://localhost:8000/docs`

---

## 👨‍💻 Muallif va Portfolio
Ushbu loyiha zamonaviy Full-Stack arxitekturasi, Telegram WebApp imkoniyatlari va SaaS biznes modelini namoyish etuvchi amaliy portfolio loyihasidir.
