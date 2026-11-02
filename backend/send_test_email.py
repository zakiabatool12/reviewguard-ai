import os
import smtplib
from email.message import EmailMessage

from dotenv import load_dotenv

load_dotenv()

host = os.getenv("SMTP_HOST", "smtp.gmail.com")
port = int(os.getenv("SMTP_PORT", "587"))
user = os.getenv("SMTP_USER", "")
password = os.getenv("SMTP_PASSWORD", "")
sender = os.getenv("MAIL_FROM", "") or user

print("Host:", host, "Port:", port)
print("User:", user)
print("Password length:", len(password), "(Gmail app password should be 16)")
print("From:", sender)

if not user or not password:
    raise SystemExit("SMTP_USER or SMTP_PASSWORD is empty in backend/.env (check for a leading #)")

to = input("Send test email to: ").strip()

msg = EmailMessage()
msg["Subject"] = "ReviewGuard AI test email"
msg["From"] = sender
msg["To"] = to
msg.set_content("If you can read this, email sending works.")

try:
    with smtplib.SMTP(host, port, timeout=20) as server:
        server.starttls()
        server.login(user, password)
        server.send_message(msg)
    print("SENT. Check the inbox and the Spam folder.")
except Exception as exc:
    print("FAILED:", type(exc).__name__, exc)