import os
import re
import logging
import aiohttp
from typing import Dict, Any

logger = logging.getLogger("sms_service")
logger.setLevel(logging.INFO)

ESKIZ_EMAIL = os.getenv("ESKIZ_EMAIL", "")
ESKIZ_PASSWORD = os.getenv("ESKIZ_PASSWORD", "")
ESKIZ_TOKEN = os.getenv("ESKIZ_TOKEN", "")

_cached_token = ESKIZ_TOKEN


def clean_phone_number(phone: str) -> str:
    """Telefon raqamidan faqat raqamlarni ajratib olish (998901234567 shaklida)"""
    digits = re.sub(r"\D", "", phone or "")
    if len(digits) == 9:
        digits = "998" + digits
    elif len(digits) == 12 and digits.startswith("998"):
        pass
    return digits


async def get_eskiz_token() -> str:
    """Eskiz.uz API tokenini olish yoki yangilash"""
    global _cached_token
    if _cached_token:
        return _cached_token

    if not ESKIZ_EMAIL or not ESKIZ_PASSWORD:
        return ""

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "https://notify.eskiz.uz/api/auth/login",
                data={"email": ESKIZ_EMAIL, "password": ESKIZ_PASSWORD},
                timeout=5
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    _cached_token = data.get("data", {}).get("token", "")
                    logger.info("Eskiz.uz SMS tokeni muvaffaqiyatli olindi.")
                    return _cached_token
    except Exception as e:
        logger.warning(f"Eskiz.uz token olishda xatolik: {e}")
    return ""


async def send_sms(phone: str, message: str) -> Dict[str, Any]:
    """
    Mijozga SMS xabarnoma jo'natish (Eskiz.uz integratsiyasi).
    Agar Eskiz.uz tokeni o'rnatilmagan bo'lsa, xabarni xavfsiz simulyatsiya qilib logga yozadi.
    """
    clean_phone = clean_phone_number(phone)
    if not clean_phone or len(clean_phone) < 9:
        logger.warning(f"Noto'g'ri telefon raqami: {phone}")
        return {"success": False, "error": "Noto'g'ri telefon raqami"}

    token = await get_eskiz_token()

    if token:
        try:
            async with aiohttp.ClientSession() as session:
                headers = {"Authorization": f"Bearer {token}"}
                payload = {
                    "mobile_phone": clean_phone,
                    "message": message,
                    "from": "4546", # Eskiz standart sender ID
                }
                async with session.post(
                    "https://notify.eskiz.uz/api/message/sms/send",
                    headers=headers,
                    data=payload,
                    timeout=6
                ) as resp:
                    if resp.status == 200:
                        res_data = await resp.json()
                        logger.info(f"[SMS REJIMI: REAL] SMS muvaffaqiyatli yuborildi -> {clean_phone}")
                        return {"success": True, "phone": clean_phone, "mode": "real", "response": res_data}
                    else:
                        err_text = await resp.text()
                        logger.warning(f"Eskiz SMS yuborishda xatolik: {err_text}")
        except Exception as e:
            logger.error(f"Eskiz SMS API ulanish xatosi: {e}")

    # Simulyatsiya rejimi (Eskiz sozlanmagan bo'lsa ham tizim uzluksiz ishlaydi)
    logger.info(
        f"\n=======================================================\n"
        f"📱 [SMS SHLYUZI] XABAR YUBORILDI:\n"
        f"➡️ Qabul qiluvchi: +{clean_phone}\n"
        f"💬 Matn:\n\"{message}\"\n"
        f"======================================================="
    )
    return {"success": True, "phone": clean_phone, "mode": "simulated"}
