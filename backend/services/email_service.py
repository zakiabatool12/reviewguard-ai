import smtplib
from email.message import EmailMessage

from config import Config


def send_otp_email(to_email, name, otp):
    """Send the verification code. Raises an exception if sending fails."""
    if not Config.SMTP_USER or not Config.SMTP_PASSWORD:
        if Config.DEV_PRINT_OTP:
            # Development only: show the code in the backend terminal.
            print(f"[DEV ONLY] Verification code for {to_email}: {otp}")
            return
        raise RuntimeError("Email sending is not configured.")

    msg = EmailMessage()
    msg["Subject"] = "Your ReviewGuard AI verification code"
    msg["From"] = Config.MAIL_FROM
    msg["To"] = to_email
    msg.set_content(
        f"Hi {name},\n\n"
        f"Your ReviewGuard AI verification code is: {otp}\n\n"
        f"It expires in {Config.OTP_EXPIRY_MINUTES} minutes. "
        f"If you did not create an account, you can ignore this email.\n"
    )

    with smtplib.SMTP(Config.SMTP_HOST, Config.SMTP_PORT, timeout=15) as server:
        server.starttls()
        server.login(Config.SMTP_USER, Config.SMTP_PASSWORD)
        server.send_message(msg)