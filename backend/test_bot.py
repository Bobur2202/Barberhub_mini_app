import asyncio
from bot import bot

async def check():
    me = await bot.get_me()
    print("SUCCESS: Bot muvaffaqiyatli ulandi!")
    print(f"Bot nomi: {me.first_name}")
    print(f"Bot username: @{me.username}")
    await bot.session.close()

if __name__ == "__main__":
    asyncio.run(check())
