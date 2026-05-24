# test_mongo.py
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

async def test():
    uri = os.getenv("MONGO_URI")
    print("Connecting to:", uri)
    client = AsyncIOMotorClient(uri)
    try:
        result = await client.admin.command("ping")
        print("Ping result:", result)  # should print {'ok': 1.0}
    except Exception as exc:
        print("Failed:", exc)
    finally:
        client.close()

asyncio.run(test())