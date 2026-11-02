"""Pre-deployment security checklist. Run:  python security_check.py"""
import os
import subprocess

from dotenv import load_dotenv

load_dotenv()

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
results = []


def add(name, ok, todo):
    results.append((name, ok, todo))


def git(*args):
    try:
        return subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True)
    except FileNotFoundError:
        return None


secret = os.getenv("JWT_SECRET_KEY", "")
add("JWT secret is long and not a placeholder",
    len(secret) >= 32 and not secret.startswith("change-this"),
    "Generate a long random JWT_SECRET_KEY in backend/.env")

add("Flask debug mode is off",
    os.getenv("FLASK_DEBUG", "0") != "1",
    "Set FLASK_DEBUG=0 in the production environment")

add("Secure cookies enabled",
    os.getenv("COOKIE_SECURE", "0") == "1",
    "Set COOKIE_SECURE=1 once the site is served over HTTPS")

add("OTP printing to the terminal is off",
    os.getenv("DEV_PRINT_OTP", "0") != "1",
    "Remove DEV_PRINT_OTP from the production environment")

add("Rate limiting is on",
    os.getenv("RATE_LIMIT_ENABLED", "1") == "1",
    "Remove RATE_LIMIT_ENABLED=0 from .env")

add("Allowed frontend origin is set and not a wildcard",
    os.getenv("FRONTEND_ORIGIN", "http://localhost:5173") not in ("", "*"),
    "Set FRONTEND_ORIGIN to your deployed frontend address")

add("Database user is not root with an empty password",
    not (os.getenv("DB_USER", "root") == "root" and os.getenv("DB_PASSWORD", "") == ""),
    "In production use a dedicated database user with a strong password")

add("SMTP password is set (OTP emails can be sent)",
    bool(os.getenv("SMTP_PASSWORD")) or os.getenv("DEV_PRINT_OTP", "0") == "1",
    "Set SMTP_USER and SMTP_PASSWORD (a Gmail app password)")

ignored = git("check-ignore", "backend/.env")
add("backend/.env is ignored by Git",
    ignored is not None and ignored.returncode == 0,
    "Add .env to .gitignore")

tracked = git("ls-files", "backend/.env")
add("backend/.env is not tracked by Git",
    tracked is not None and tracked.stdout.strip() == "",
    "Run: git rm --cached backend/.env  (and change every secret in it)")

print("\nReviewGuard AI security checklist\n" + "-" * 38)
done = 0
for name, ok, todo in results:
    if ok:
        done += 1
        print(f"[ OK ]  {name}")
    else:
        print(f"[TODO]  {name}\n          -> {todo}")
print("-" * 38)
print(f"{done}/{len(results)} checks passed")
print("Some TODO items are expected while developing locally (debug, secure cookies).")