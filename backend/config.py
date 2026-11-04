import os
from datetime import timedelta
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
    MAX_CONTENT_LENGTH = 100 * 1024
    DEBUG = os.getenv("FLASK_DEBUG", "0") == "1"

    # Database
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = int(os.getenv("DB_PORT", "3306"))
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_NAME = os.getenv("DB_NAME", "reviewguard_db")

    # Auth (JWT stored in HttpOnly cookies)
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_TOKEN_LOCATION = ["cookies"]
    JWT_COOKIE_SECURE = os.getenv("COOKIE_SECURE", "0") == "1"
    JWT_COOKIE_SAMESITE = "Lax"
    JWT_COOKIE_CSRF_PROTECT = True
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=2)

    # Email / OTP
    SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
    BREVO_API_KEY = os.getenv("BREVO_API_KEY", "")
    MAIL_FROM = os.getenv("MAIL_FROM", "") or os.getenv("SMTP_USER", "")
    DEV_PRINT_OTP = os.getenv("DEV_PRINT_OTP", "0") == "1"
    OTP_EXPIRY_MINUTES = 10
    OTP_MAX_ATTEMPTS = 5
    OTP_RESEND_SECONDS = 60

    # Rate limiting (set RATE_LIMIT_ENABLED=0 in .env only while testing)
    RATELIMIT_ENABLED = os.getenv("RATE_LIMIT_ENABLED", "1") == "1"
    RATELIMIT_STORAGE_URI = os.getenv("RATELIMIT_STORAGE_URI", "memory://")
    RATELIMIT_HEADERS_ENABLED = True
    # Database SSL (needed by Aiven)
        # Database SSL (needed by Aiven)
    DB_SSL = os.getenv("DB_SSL", "0") == "1"
    _ca = os.getenv("DB_SSL_CA", "")
    DB_SSL_CA = _ca if (not _ca or os.path.isabs(_ca)) else os.path.join(BASE_DIR, _ca)