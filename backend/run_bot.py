import asyncio
import logging
from bot import bot, dp

logging.basicConfig(level=logging.INFO)

async def main():
    if not bot:
        print("XATOLIK: Bot tokeni topilmadi yoki noto'g'ri!")
        return

    print("=======================================")
    print("💈 BarberHub Telegram Boti ishga tushdi!")
    print("Telegramda botingizga /start deb yozing.")
    print("=======================================")

    # Avvalgi eski sessiyalar yoki webhooklarni tozalaymiz
    await bot.delete_webhook(drop_pending_updates=True)
    
    # Yangi xabarlarni eshitishni boshlaymiz
    await dp.start_polling(bot)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        print("Bot to'xtatildi.")
