import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set.")

if not SUPABASE_URL:
    raise ValueError("SUPABASE_URL is not set.")

if not SUPABASE_KEY:
    raise ValueError("SUPABASE_KEY is not set.")