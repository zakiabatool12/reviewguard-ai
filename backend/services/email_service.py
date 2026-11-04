import smtplib
from email.message import EmailMessage

import requests

from config import Config


def _body(name, otp):
    return (
        f"Hi {name},\n\n"
        f"Your ReviewGuard AI verification code is: {otp}\n\n"
        f"It expires in {Config.OTP_EXPIRY_MINUTES} minutes. "
        f"If you did not create an account, you can ignore this email.\n"
    )


def _send_via_brevo_api(to_email, name, otp):
    """Online: send through Brevo's HTTPS API (SMTP ports are blocked on free hosts)."""
    resp = requests.post(
        "https://api.brevo.com/v3/smtp/email",
        headers={
            "api-key": Config.BREVO_API_KEY,
            "accept": "application/json",
            "content-type": "application/json",
        },
        json={
            "sender": {"name": "ReviewGuard AI", "email": Config.MAIL_FROM},
            "to": [{"email": to_email, "name": name}],
            "subject": "Your ReviewGuard AI verification code",
            "textContent": _body(name, otp),
        },
        timeout=15,
    )
    resp.raise_for_status()


def send_otp_email(to_email, name, otp):
    """Send the verification code. Raises an exception if sending fails."""
    if Config.BREVO_API_KEY:
        if not Config.MAIL_FROM:
            raise RuntimeError("MAIL_FROM must be set to a verified Brevo sender.")
        _send_via_brevo_api(to_email, name, otp)
        return

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
    msg.set_content(_body(name, otp))

    with smtplib.SMTP(Config.SMTP_HOST, Config.SMTP_PORT, timeout=15) as server:
        server.starttls()
        server.login(Config.SMTP_USER, Config.SMTP_PASSWORD)
        server.send_message(msg)