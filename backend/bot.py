import os
import json
import logging
from dotenv import load_dotenv
from aiogram import Bot, Dispatcher, types, F

load_dotenv()
from aiogram.filters import CommandStart, Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo, MenuButtonWebApp
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

# Foydalanuvchilar tilini saqlash fayli
USER_LANG_FILE = os.path.join(os.path.dirname(__file__), "data", "user_languages.json")

def load_user_languages() -> dict:
    if os.path.exists(USER_LANG_FILE):
        try:
            with open(USER_LANG_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_user_language(user_id: int, lang: str):
    data = load_user_languages()
    data[str(user_id)] = lang
    try:
        os.makedirs(os.path.dirname(USER_LANG_FILE), exist_ok=True)
        with open(USER_LANG_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        logger.error(f"Tilni saqlashda xatolik: {e}")

def get_user_language(user_id: int) -> str:
    data = load_user_languages()
    return data.get(str(user_id), "uz")


def get_language_selection_keyboard():
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="🇺🇿 O'zbekcha", callback_data="setlang_uz"),
                InlineKeyboardButton(text="🇷🇺 Русский", callback_data="setlang_ru"),
                InlineKeyboardButton(text="🇬🇧 English", callback_data="setlang_en"),
            ]
        ]
    )


def get_welcome_content(lang: str, first_name: str, user_id: int):
    first_name = first_name or "Foydalanuvchi"
    
    if lang == "ru":
        text = (
            f"👋 Здравствуйте, <b>{first_name}</b>!\n\n"
            "💈 Добро пожаловать в <b>BarberHub</b> — экосистему лучших барбершопов и онлайн-записи!\n\n"
            "📍 <b>Вы клиент?</b> Найдите лучших мастеров поблизости, смотрите живую очередь и записывайтесь в 1 клик.\n"
            "✂️ <b>Вы мастер?</b> Добавьте свой барбершоп в каталог, привлекайте новых клиентов и управляйте записями.\n\n"
            f"🆔 Ваш Telegram ID: <code>{user_id}</code>\n"
            "(Если вы мастер, все уведомления о новых записях будут приходить на этот ID)\n\n"
            "Нажмите кнопку ниже, чтобы открыть приложение 👇"
        )
        keyboard = InlineKeyboardMarkup(
            inline_keyboard=[
                [
                    InlineKeyboardButton(
                        text="✂️ Открыть BarberHub",
                        web_app=WebAppInfo(url=f"{WEBAPP_URL}?lang=ru")
                    )
                ],
                [
                    InlineKeyboardButton(
                        text="ℹ️ О боте и сервисе",
                        callback_data="about_bot_ru"
                    ),
                    InlineKeyboardButton(
                        text="🌐 Сменить язык",
                        callback_data="choose_lang"
                    )
                ]
            ]
        )
    elif lang == "en":
        text = (
            f"👋 Welcome, <b>{first_name}</b>!\n\n"
            "💈 Welcome to <b>BarberHub</b> — premier barbershop network and live booking ecosystem!\n\n"
            "📍 <b>Are you a client?</b> Discover top barbers nearby, check live queues and book appointments in 1 click.\n"
            "✂️ <b>Are you a barber?</b> Join the directory, grow your client base and manage appointments effortlessly.\n\n"
            f"🆔 Your Telegram ID: <code>{user_id}</code>\n"
            "(As a barber, all booking alerts will arrive at this ID)\n\n"
            "Tap below to start the Mini App 👇"
        )
        keyboard = InlineKeyboardMarkup(
            inline_keyboard=[
                [
                    InlineKeyboardButton(
                        text="✂️ Open BarberHub App",
                        web_app=WebAppInfo(url=f"{WEBAPP_URL}?lang=en")
                    )
                ],
                [
                    InlineKeyboardButton(
                        text="ℹ️ About the Bot",
                        callback_data="about_bot_en"
                    ),
                    InlineKeyboardButton(
                        text="🌐 Change Language",
                        callback_data="choose_lang"
                    )
                ]
            ]
        )
    else:  # 'uz' default
        text = (
            f"👋 Assalomu alaykum, <b>{first_name}</b>!\n\n"
            "💈 <b>BarberHub</b> — erkaklar sartaroshxonalari tarmog'i va qulay onlayn navbat ekotizimiga xush kelibsiz!\n\n"
            "📍 <b>Mijozmisiz?</b> Yaqin atrofdagi eng mohir ustalarni toping, jonli navbatni ko'ring va 1 bosishda oldindan band qiling.\n"
            "✂️ <b>Ustamisiz?</b> O'z sartaroshxonangizni katalogga qo'shing, yangi mijozlar oqimini jalb qiling va buyurtmalarni boshqaring.\n\n"
            f"🆔 Sizning Telegram ID: <code>{user_id}</code>\n"
            "(Usta sifatida barcha yangi mijozlar xabarnomasi shu ID ga keladi)\n\n"
            "Batafsil ma'lumot olish yoki ilovani ishga tushirish uchun quyidagi tugmani bosing 👇"
        )
        keyboard = InlineKeyboardMarkup(
            inline_keyboard=[
                [
                    InlineKeyboardButton(
                        text="✂️ BarberHub Ilovasini Ochish",
                        web_app=WebAppInfo(url=f"{WEBAPP_URL}?lang=uz")
                    )
                ],
                [
                    InlineKeyboardButton(
                        text="ℹ️ Bot haqida ma'lumot",
                        callback_data="about_bot_uz"
                    ),
                    InlineKeyboardButton(
                        text="🌐 Tilni o'zgartirish",
                        callback_data="choose_lang"
                    )
                ]
            ]
        )
    return text, keyboard


def get_about_bot_content(lang: str):
    if lang == "ru":
        text = (
            "💈 <b>О платформе BarberHub:</b>\n\n"
            "<b>BarberHub</b> — современная платформа для барбершопов, избавляющая от живых очередей и полностью автоматизирующая процесс записи.\n\n"
            "✨ <b>Преимущества для клиентов:</b>\n"
            "• 📍 <b>GPS и карта:</b> Моментальный поиск ближайших мастеров и расчет времени пешком.\n"
            "• ⭐️ <b>Честное портфолио:</b> Реальные фотоработы мастеров, цены и отзывы.\n"
            "• ⏰ <b>Живая очередь:</b> Просмотр занятости и бронирование удобного времени без звонков.\n"
            "• 🔔 <b>Напоминания:</b> Автоматическое оповещение за 30-60 минут до визита.\n"
            "• 👨‍👦 <b>Парная запись:</b> Запись для себя и друга или ребенка в смежные слоты.\n"
            "• 🤖 <b>AI Стилист:</b> Подбор идеальной стрижки под вашу форму лица через нейросеть.\n\n"
            "💼 <b>Для мастеров и барбершопов:</b>\n"
            "• 📈 Поток новых клиентов и бесплатное подключение.\n"
            "• 📲 Мгновенные пуш-уведомления в Telegram о каждой новой записи.\n"
            "• 💰 Кассовый учет, статистика за день и надежное облачное хранилище.\n\n"
            "🚀 <i>Использование приложения абсолютно бесплатно!</i>"
        )
        keyboard = InlineKeyboardMarkup(
            inline_keyboard=[
                [
                    InlineKeyboardButton(
                        text="✂️ Открыть BarberHub",
                        web_app=WebAppInfo(url=f"{WEBAPP_URL}?lang=ru")
                    )
                ],
                [
                    InlineKeyboardButton(
                        text="⬅️ Назад в меню",
                        callback_data="back_to_menu"
                    )
                ]
            ]
        )
    elif lang == "en":
        text = (
            "💈 <b>About BarberHub Platform:</b>\n\n"
            "<b>BarberHub</b> is a cutting-edge platform designed to eliminate waiting queues and automate barbershop scheduling.\n\n"
            "✨ <b>Client Benefits:</b>\n"
            "• 📍 <b>GPS & Map:</b> Instant discovery of nearby barbers with walking distances.\n"
            "• ⭐️ <b>Verified Portfolio:</b> Genuine gallery photos, honest prices and reviews.\n"
            "• ⏰ <b>Live Queue:</b> Real-time slot availability and effortless 1-tap booking.\n"
            "• 🔔 <b>Automated Reminders:</b> Notifications delivered 30-60 mins prior to appointment.\n"
            "• 👨‍👦 <b>Duo Booking:</b> Book consecutive slots for yourself and a friend/child.\n"
            "• 🤖 <b>AI Hairstyle Advisor:</b> Smart haircut suggestions tailored to your face shape.\n\n"
            "💼 <b>For Barbers & Salons:</b>\n"
            "• 📈 Client acquisition stream and quick setup.\n"
            "• 📲 Instant Telegram alerts for every booking.\n"
            "• 💰 Daily revenue tracking, receipt generation, and cloud sync.\n\n"
            "🚀 <i>The application is completely free to use!</i>"
        )
        keyboard = InlineKeyboardMarkup(
            inline_keyboard=[
                [
                    InlineKeyboardButton(
                        text="✂️ Open BarberHub App",
                        web_app=WebAppInfo(url=f"{WEBAPP_URL}?lang=en")
                    )
                ],
                [
                    InlineKeyboardButton(
                        text="⬅️ Back to Menu",
                        callback_data="back_to_menu"
                    )
                ]
            ]
        )
    else:  # 'uz'
        text = (
            "💈 <b>BarberHub Platformasi Haqida:</b>\n\n"
            "<b>BarberHub</b> — sartaroshxonalarda navbat kutish vaqtini yo'qotish va jarayonni to'liq avtomatlashtirish uchun ishlab chiqilgan zamonaviy platforma.\n\n"
            "✨ <b>Mijozlar uchun afzalliklar:</b>\n"
            "• 📍 <b>GPS va Xarita:</b> Eng yaqin sartaroshlarni va piyoda yurish vaqtini bir zumda aniqlash.\n"
            "• ⭐️ <b>Haqiqiy portfolio:</b> Ustalarning bajargan ishlari, narxlar va mijozlar sharhlari.\n"
            "• ⏰ <b>Jonli Navbat:</b> Salonga bormasdan oldin jonli navbatni ko'rish va o'zingizga qulay vaqtni band qilish.\n"
            "• 🔔 <b>Tezkor Eslatmalar:</b> Navbatga 30 daqiqa qolganda bot orqali avtomatik ogohlantirish.\n"
            "• 👨‍👦 <b>Birga yozilish:</b> O'zingiz va do'stingiz yoki farzandingiz uchun ketma-ket joy band qilish.\n"
            "• 🤖 <b>AI Maslahatchi:</b> Yuz tuzilishingizga mos soch turmagini sun'iy intellekt orqali tavsiya qilish.\n\n"
            "💼 <b>Ustalar va Barbershoplar uchun:</b>\n"
            "• 📈 Yangi mijozlar oqimi va bepul ro'yxatdan o'tish.\n"
            "• 📲 Har bir yangi buyurtma haqida Telegram bot orqali qo'ng'iroqdek darhol xabar olish.\n"
            "• 💰 Kunlik tushum, kassa hisoboti va mijozlar bazasini xavfsiz saqlash.\n\n"
            "🚀 <i>Ilovadan foydalanish mutlaqo bepul!</i>"
        )
        keyboard = InlineKeyboardMarkup(
            inline_keyboard=[
                [
                    InlineKeyboardButton(
                        text="✂️ BarberHub Ilovasini Ochish",
                        web_app=WebAppInfo(url=f"{WEBAPP_URL}?lang=uz")
                    )
                ],
                [
                    InlineKeyboardButton(
                        text="⬅️ Menyoga qaytish",
                        callback_data="back_to_menu"
                    )
                ]
            ]
        )
    return text, keyboard


@dp.message(CommandStart())
async def start_handler(message: types.Message):
    """
    /start bosilganda foydalanuvchiga birinchi bo'lib til tanlash tugmalari taqdim etiladi.
    Til tanlangach, Mini App o'sha tanlangan tilda ochiladi!
    """
    user_id = message.from_user.id
    ACTIVE_BARBER_CHAT_IDS.add(user_id)

    prompt_text = (
        "👋 <b>Assalomu alaykum! Iltimos, muloqot tilini tanlang:</b>\n"
        "Здравствуйте! Пожалуйста, выберите язык обслуживания:\n"
        "Welcome! Please choose your preferred language:"
    )
    await message.answer(prompt_text, reply_markup=get_language_selection_keyboard(), parse_mode=ParseMode.HTML)


@dp.message(Command(commands=["language", "til", "lang"]))
async def command_language(message: types.Message):
    """Tilni o'zgartirish buyrug'i"""
    prompt_text = (
        "🌐 <b>Iltimos, yangi tilni tanlang:</b>\n"
        "Пожалуйста, выберите новый язык:\n"
        "Please select a new language:"
    )
    await message.answer(prompt_text, reply_markup=get_language_selection_keyboard(), parse_mode=ParseMode.HTML)


@dp.callback_query(F.data.startswith("setlang_"))
async def callback_set_language(callback: types.CallbackQuery):
    lang = callback.data.split("_")[1]
    user_id = callback.from_user.id
    save_user_language(user_id, lang)

    # Telegram Chat Menu tugmasini ham tanlangan til bo'yicha yangilaymiz
    if bot:
        try:
            btn_title = "✂️ BarberHub" if lang == "uz" else "✂️ Открыть BarberHub" if lang == "ru" else "✂️ Open BarberHub"
            await bot.set_chat_menu_button(
                chat_id=user_id,
                menu_button=MenuButtonWebApp(
                    text=btn_title,
                    web_app=WebAppInfo(url=f"{WEBAPP_URL}?lang={lang}")
                )
            )
        except Exception as e:
            logger.warning(f"Menu tugmasini yangilashda xatolik: {e}")

    welcome_text, keyboard = get_welcome_content(lang, callback.from_user.first_name, user_id)
    try:
        await callback.message.edit_text(welcome_text, reply_markup=keyboard, parse_mode=ParseMode.HTML)
    except Exception:
        await callback.message.answer(welcome_text, reply_markup=keyboard, parse_mode=ParseMode.HTML)
    await callback.answer()


@dp.callback_query(F.data == "choose_lang")
async def callback_choose_lang(callback: types.CallbackQuery):
    prompt_text = (
        "🌐 <b>Iltimos, tilni tanlang:</b>\n"
        "Пожалуйста, выберите язык:\n"
        "Please choose your language:"
    )
    try:
        await callback.message.edit_text(prompt_text, reply_markup=get_language_selection_keyboard(), parse_mode=ParseMode.HTML)
    except Exception:
        await callback.message.answer(prompt_text, reply_markup=get_language_selection_keyboard(), parse_mode=ParseMode.HTML)
    await callback.answer()


@dp.callback_query(F.data == "back_to_menu")
async def callback_back_to_menu(callback: types.CallbackQuery):
    user_id = callback.from_user.id
    lang = get_user_language(user_id)
    welcome_text, keyboard = get_welcome_content(lang, callback.from_user.first_name, user_id)
    try:
        await callback.message.edit_text(welcome_text, reply_markup=keyboard, parse_mode=ParseMode.HTML)
    except Exception:
        await callback.message.answer(welcome_text, reply_markup=keyboard, parse_mode=ParseMode.HTML)
    await callback.answer()


@dp.callback_query(F.data.startswith("about_bot"))
async def about_bot_callback(callback: types.CallbackQuery):
    """Bot haqida to'liq ma'lumot beruvchi callback xabari"""
    data = callback.data
    user_id = callback.from_user.id
    if data == "about_bot_ru":
        lang = "ru"
    elif data == "about_bot_en":
        lang = "en"
    elif data == "about_bot_uz":
        lang = "uz"
    else:
        lang = get_user_language(user_id)

    about_text, keyboard = get_about_bot_content(lang)
    try:
        await callback.message.edit_text(about_text, reply_markup=keyboard, parse_mode=ParseMode.HTML)
    except Exception:
        await callback.message.answer(about_text, reply_markup=keyboard, parse_mode=ParseMode.HTML)
    await callback.answer()


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

    multi_info = ""
    if appointment_data.get("is_multi_person"):
        mp = appointment_data.get("multi_person_details") or {}
        multi_info = (
            f"👨‍👦 <b>Buyurtma turi:</b> 2 kishi ({mp.get('companion_title', 'Ota-bola')})\n"
            f"➕ <b>2-xizmat:</b> {mp.get('companion_service', '')} ({mp.get('second_slot', '')})\n"
        )

    text = (
        "🔔 <b>YANGI MIJOZ YOZILDI!</b>\n\n"
        f"👤 <b>Mijoz:</b> {client_name}\n"
        f"📞 <b>Telefon:</b> {phone}\n"
        f"{multi_info}"
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


async def send_appointment_status_to_client(
    bot: Bot,
    client_chat_id: int,
    appointment_data: dict,
    status: str  # "accepted" | "rejected" | "cancelled" | "completed"
):
    """
    Usta navbatni qabul qilganda, rad etganda yoki yakunlaganda mijozga Telegram orqali boradigan tezkor xabar.
    Mijoz tiliga mos holda yuboriladi.
    """
    if not client_chat_id:
        return

    lang = get_user_language(client_chat_id)
    barber_name = appointment_data.get("barber_name", "Usta")
    service = appointment_data.get("service_name", "Xizmat")
    date_str = appointment_data.get("date_str", "")
    time_slot = appointment_data.get("time_slot", "")
    price = appointment_data.get("price", 0)

    if lang == "ru":
        if status == "accepted":
            text = (
                "🎉 <b>ВАША ЗАПИСЬ ПОДТВЕРЖДЕНА!</b>\n\n"
                f"💈 <b>Мастер:</b> {barber_name}\n"
                f"✂️ <b>Услуга:</b> {service}\n"
                f"📅 <b>Дата:</b> {date_str}\n"
                f"⏰ <b>Время:</b> {time_slot}\n"
                f"💰 <b>Стоимость:</b> {price:,} UZS\n\n"
                "✅ Мастер ждет вас в назначенное время. Пожалуйста, приходите вовремя!"
            )
        elif status in ["rejected", "cancelled"]:
            text = (
                "❌ <b>ЗАПИСЬ ОТМЕНЕНА</b>\n\n"
                f"Уважаемый клиент, мастер <b>{barber_name}</b> отменил запись на {date_str} {time_slot}.\n\n"
                "Пожалуйста, выберите другое свободное время или другого мастера."
            )
        elif status == "completed":
            text = (
                "✨ <b>УСЛУГА ЗАВЕРШЕНА!</b>\n\n"
                f"💈 <b>Мастер:</b> {barber_name}\n"
                f"✂️ <b>Услуга:</b> {service}\n\n"
                "Спасибо за визит! Оцените работу мастера в приложении ⭐"
            )
        else:
            text = f"Статус вашей записи обновлен: {status}"
    elif lang == "en":
        if status == "accepted":
            text = (
                "🎉 <b>APPOINTMENT CONFIRMED!</b>\n\n"
                f"💈 <b>Barber:</b> {barber_name}\n"
                f"✂️ <b>Service:</b> {service}\n"
                f"📅 <b>Date:</b> {date_str}\n"
                f"⏰ <b>Time:</b> {time_slot}\n"
                f"💰 <b>Price:</b> {price:,} UZS\n\n"
                "✅ The barber is expecting you on time. Please arrive punctually!"
            )
        elif status in ["rejected", "cancelled"]:
            text = (
                "❌ <b>APPOINTMENT CANCELLED</b>\n\n"
                f"Dear client, barber <b>{barber_name}</b> has cancelled your booking for {date_str} {time_slot}.\n\n"
                "Please choose another time slot or another barber."
            )
        elif status == "completed":
            text = (
                "✨ <b>SERVICE COMPLETED!</b>\n\n"
                f"💈 <b>Barber:</b> {barber_name}\n"
                f"✂️ <b>Service:</b> {service}\n\n"
                "Thank you for visiting! Please rate your experience in the Mini App ⭐"
            )
        else:
            text = f"Appointment status updated: {status}"
    else:  # uz
        if status == "accepted":
            text = (
                "🎉 <b>NAVBATINGIZ QABUL QILINDI!</b>\n\n"
                f"💈 <b>Usta:</b> {barber_name}\n"
                f"✂️ <b>Xizmat:</b> {service}\n"
                f"📅 <b>Sana:</b> {date_str}\n"
                f"⏰ <b>Vaqt:</b> {time_slot}\n"
                f"💰 <b>Narxi:</b> {price:,} UZS\n\n"
                "✅ Usta sizni belgilangan vaqtda kutadi. Sartaroshxonaga o'z vaqtida kelishingizni so'raymiz!"
            )
        elif status in ["rejected", "cancelled"]:
            text = (
                "❌ <b>NAVBAT BEKOR QILINDI</b>\n\n"
                f"Hurmatli mijoz, usta <b>{barber_name}</b> {date_str} {time_slot} dagi navbatingizni bekor qildi.\n\n"
                "Iltimos, boshqa bo'sh vaqt yoki boshqa ustani tanlang."
            )
        elif status == "completed":
            text = (
                "✨ <b>XIZMAT YAKUNLANDI!</b>\n\n"
                f"💈 <b>Usta:</b> {barber_name}\n"
                f"✂️ <b>Xizmat:</b> {service}\n\n"
                "Tashrifingiz uchun tashakkur! Iltimos, Mini-App'ga kirib ustaga o'z baho va fikringizni bildiring ⭐"
            )
        else:
            text = f"Navbatingiz holati yangilandi: {status}"

    if not bot:
        logger.info(f"\n[TELEGRAM PUSH SIMULATSIYA] Mijozga xabar yuborildi (Chat ID: {client_chat_id}):\n{text}")
        return

    try:
        await bot.send_message(
            chat_id=client_chat_id,
            text=text,
            parse_mode=ParseMode.HTML
        )
        logger.info(f"Mijozga xabarnoma yuborildi: {client_chat_id}")
    except Exception as e:
        logger.error(f"Mijozga xabar yuborishda xatolik ({client_chat_id}): {e}")


async def send_appointment_reminder_to_client(bot, client_chat_id: int, appointment_data: dict, minutes_left: int = 60):
    """
    Navbatga 1 soat (yoki belgilangan vaqt) qolganda mijozga Telegram eslatmasi
    """
    if not client_chat_id:
        return

    lang = get_user_language(client_chat_id)
    barber_name = appointment_data.get("barber_name", "Sartarosh")
    service = appointment_data.get("service_name", "Soch turmaklash")
    date_str = appointment_data.get("date_str", "Bugun")
    time_slot = appointment_data.get("time_slot", "15:00")
    client_name = appointment_data.get("client_name", "Mijoz")

    if lang == "ru":
        text = (
            f"⏰ <b>ДО ВАШЕЙ ЗАПИСИ ОСТАЛСЯ 1 ЧАС!</b>\n\n"
            f"Уважаемый(ая) <b>{client_name}</b>,\n"
            f"Напоминаем, что через 1 час у вас запись к мастеру <b>{barber_name}</b>.\n\n"
            f"💈 <b>Мастер:</b> {barber_name}\n"
            f"✂️ <b>Услуга:</b> {service}\n"
            f"🕒 <b>Время:</b> {date_str}, {time_slot}\n\n"
            f"📍 Пожалуйста, приходите вовремя! ✂️"
        )
    elif lang == "en":
        text = (
            f"⏰ <b>1 HOUR UNTIL YOUR APPOINTMENT!</b>\n\n"
            f"Dear <b>{client_name}</b>,\n"
            f"This is a reminder that your appointment with <b>{barber_name}</b> is in approximately 1 hour.\n\n"
            f"💈 <b>Barber:</b> {barber_name}\n"
            f"✂️ <b>Service:</b> {service}\n"
            f"🕒 <b>Time:</b> {date_str}, {time_slot}\n\n"
            f"📍 Please arrive on time! ✂️"
        )
    else:  # uz
        text = (
            f"⏰ <b>QABULINGIZGA 1 SOAT QOLDI!</b>\n\n"
            f"Hurmatli <b>{client_name}</b>,\n"
            f"Sizning <b>{barber_name}</b> qabuliga yozilgan navbatingizga taxminan 1 soat vaqt qoldi.\n\n"
            f"💈 <b>Usta:</b> {barber_name}\n"
            f"✂️ <b>Xizmat:</b> {service}\n"
            f"🕒 <b>Vaqti:</b> {date_str}, {time_slot}\n\n"
            f"📍 Sartaroshxonaga o'z vaqtida yetib kelishingizni so'raymiz! ✂️"
        )

    if not bot:
        logger.info(f"\n[TELEGRAM ESLATMA SIMULATSIYA] Mijozga eslatma yuborildi (Chat ID: {client_chat_id}):\n{text}")
        return

    try:
        await bot.send_message(
            chat_id=client_chat_id,
            text=text,
            parse_mode=ParseMode.HTML
        )
        logger.info(f"Mijozga 1 soatlik eslatma yuborildi: {client_chat_id}")
    except Exception as e:
        logger.error(f"Mijozga eslatma yuborishda xatolik ({client_chat_id}): {e}")


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
