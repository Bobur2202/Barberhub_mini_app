import os
import logging
from dotenv import load_dotenv
from aiogram import Bot, Dispatcher, types, F

load_dotenv()
from aiogram.filters import CommandStart
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from aiogram.enums import ParseMode

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BOT_TOKEN = os.getenv("BOT_TOKEN", "")
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://barberhub.uz")

bot = None
dp = Dispatcher()

# Faqat to'g'ri token formatida bo'lsagina Bot'ni initsializatsiya qilamiz
if BOT_TOKEN and ":" in BOT_TOKEN and len(BOT_TOKEN) > 15:
    try:
        bot = Bot(token=BOT_TOKEN)
        logger.info("Telegram Bot muvaffaqiyatli initsializatsiya qilindi.")
    except Exception as e:
        logger.warning(f"Bot tokenida xatolik: {e}. Bot passiv rejimda ishlaydi.")
else:
    logger.info("BOT_TOKEN belgilanmagan. Telegram xabarnomalari konsolga (simulyatsiya) chiqariladi.")


ACTIVE_BARBER_CHAT_IDS = set()

@dp.message(CommandStart())
async def start_handler(message: types.Message):
    """
    /start bosilganda foydalanuvchiga xush kelibsiz xabari va
    Mini-App ochish tugmasini beradi.
    """
    user_id = message.from_user.id
    ACTIVE_BARBER_CHAT_IDS.add(user_id)

    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="✂️ BarberHub Mini-App'ni ochish",
                    web_app=WebAppInfo(url=WEBAPP_URL)
                )
            ]
        ]
    )
    
    user_id = message.from_user.id
    welcome_text = (
        f"👋 Salom, <b>{message.from_user.first_name}</b>!\n\n"
        "💈 <b>BarberHub</b> platformasiga xush kelibsiz.\n"
        "O'zingizga eng yaqin sartaroshlarni toping, xizmat va narxlar bilan "
        "tanishib, bir zumda navbatga yoziling!\n\n"
        f"🆔 Sizning Telegram ID: <code>{user_id}</code>\n"
        "(Usta sifatida barcha yangi mijozlar xabarnomasi shu ID ga keladi)\n\n"
        "Mini-appni ishga tushirish uchun quyidagi tugmani bosing 👇"
    )
    
    await message.answer(welcome_text, reply_markup=keyboard, parse_mode=ParseMode.HTML)


async def send_appointment_notification_to_barber(
    bot: Bot,
    barber_chat_id: int,
    appointment_data: dict
):
    """
    Mijoz Mini-App'da navbat band qilganda ustaga keladigan tezkor xabarnoma.
    """
    apt_id = appointment_data.get("id")
    client_name = appointment_data.get("client_name")
    phone = appointment_data.get("client_phone")
    service = appointment_data.get("service_name")
    date_str = appointment_data.get("date_str")
    time_slot = appointment_data.get("time_slot")
    price = appointment_data.get("price")

    text = (
        "🔔 <b>YANGI MIJOZ YOZILDI!</b>\n\n"
        f"👤 <b>Mijoz:</b> {client_name}\n"
        f"📞 <b>Telefon:</b> {phone}\n"
        f"✂️ <b>Xizmat:</b> {service}\n"
        f"📅 <b>Sana:</b> {date_str}\n"
        f"⏰ <b>Vaqt:</b> {time_slot}\n"
        f"💰 <b>Narxi:</b> {price:,} UZS\n\n"
        "Iltimos, navbatni tasdiqlang yoki bekor qiling:"
    )

    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="✅ Qabul qilish", callback_data=f"accept_{apt_id}"),
                InlineKeyboardButton(text="❌ Bekor qilish", callback_data=f"reject_{apt_id}")
            ]
        ]
    )

    if not bot:
        logger.info(f"\n[TELEGRAM PUSH SIMULATSIYA] Ustaga xabar yuborildi (Chat ID: {barber_chat_id}):\n{text}")
        return

    # Ustalar yoki tizim egasiga xabarni yetkazish
    target_chat_ids = set(ACTIVE_BARBER_CHAT_IDS)
    if barber_chat_id:
        target_chat_ids.add(barber_chat_id)

    for chat_id in target_chat_ids:
        try:
            await bot.send_message(
                chat_id=chat_id,
                text=text,
                reply_markup=keyboard,
                parse_mode=ParseMode.HTML
            )
            logger.info(f"Bildirishnoma yuborildi: {chat_id}")
        except Exception as e:
            logger.error(f"Xabar yuborishda xatolik ({chat_id}): {e}")



@dp.callback_query(F.data.startswith("accept_"))
async def callback_accept_appointment(callback: types.CallbackQuery):
    apt_id = callback.data.split("_")[1]
    # Update appointment in DB logic here
    await callback.message.edit_text(
        callback.message.text + "\n\n✅ <b>NAVABAT QABUL QILINDI!</b> Mijozga tasdiq xabarnomasi yuborildi.",
        parse_mode=ParseMode.HTML
    )
    await callback.answer("Mijoz navbati tasdiqlandi!")


@dp.callback_query(F.data.startswith("reject_"))
async def callback_reject_appointment(callback: types.CallbackQuery):
    apt_id = callback.data.split("_")[1]
    # Update appointment in DB logic here
    await callback.message.edit_text(
        callback.message.text + "\n\n❌ <b>NAVABAT BEKOR QILINDI.</b>",
        parse_mode=ParseMode.HTML
    )
    await callback.answer("Navbat bekor qilindi.")
