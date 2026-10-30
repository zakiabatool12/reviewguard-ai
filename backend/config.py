import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class Config:
    MODEL_PATH = os.getenv(
        "MODEL_PATH",
        os.path.join(BASE_DIR, "..", "ml", "review_model.pkl"),
    )
    FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    MAX_REVIEW_LENGTH = 5000
    MAX_CONTENT_LENGTH = 100 * 1024  # request body max 100 KB
    DEBUG = os.getenv("FLASK_DEBUG", "0") == "1"