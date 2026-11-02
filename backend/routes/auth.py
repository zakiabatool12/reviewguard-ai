import re
import secrets
from datetime import datetime, timedelta, timezone

import mysql.connector
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token,
    set_access_cookies,
    unset_jwt_cookies,
    jwt_required,
    get_jwt_identity,
)
from werkzeug.security import generate_password_hash, check_password_hash

from config import Config
from db import get_connection
from services.email_service import send_otp_email

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
OTP_RE = re.compile(r"^\d{6}$")


def error(message, status=400, code=None):
    body = {"error": message}
    if code:
        body["code"] = code
    return jsonify(body), status


def utcnow():
    # naive UTC time, matches DATETIME columns
    return datetime.now(timezone.utc).replace(tzinfo=None)


def seconds_until_resend(cur, user_id):
    cur.execute("SELECT last_sent_at FROM email_otps WHERE user_id = %s", (user_id,))
    row = cur.fetchone()
    if not row:
        return 0
    elapsed = (utcnow() - row["last_sent_at"]).total_seconds()
    return max(0, int(Config.OTP_RESEND_SECONDS - elapsed))


def store_new_otp(cur, user_id):
    """Create a new OTP, save only its hash, and return the plain code."""
    otp = f"{secrets.randbelow(10**6):06d}"
    now = utcnow()
    cur.execute(
        """
        INSERT INTO email_otps (user_id, otp_hash, expires_at, attempts, last_sent_at)
        VALUES (%s, %s, %s, 0, %s)
        ON DUPLICATE KEY UPDATE
          otp_hash = VALUES(otp_hash),
          expires_at = VALUES(expires_at),
          attempts = 0,
          last_sent_at = VALUES(last_sent_at)
        """,
        (
            user_id,
            generate_password_hash(otp),
            now + timedelta(minutes=Config.OTP_EXPIRY_MINUTES),
            now,
        ),
    )
    return otp


@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return error("Request body must be valid JSON.")

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    confirm = data.get("confirm")

    if not all(isinstance(v, str) for v in (name, email, password, confirm)):
        return error("Name, email, password and confirmation are required.")

    name = name.strip()
    email = email.strip().lower()

    if not 2 <= len(name) <= 100:
        return error("Name must be 2 to 100 characters.")
    if len(email) > 255 or not EMAIL_RE.match(email):
        return error("Enter a valid email address.")
    if not 8 <= len(password) <= 128:
        return error("Password must be 8 to 128 characters.")
    if password != confirm:
        return error("Passwords do not match.")

    password_hash = generate_password_hash(password)

    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT id, is_verified FROM users WHERE email = %s", (email,))
        existing = cur.fetchone()

        if existing and existing["is_verified"]:
            return error("An account with this email already exists.", 409)

        if existing:
            # Registered earlier but never verified: update details, resend code
            user_id = existing["id"]
            wait = seconds_until_resend(cur, user_id)
            if wait > 0:
                return error(f"Please wait {wait} seconds before requesting a new code.", 429)
            cur.execute(
                "UPDATE users SET name = %s, password_hash = %s WHERE id = %s",
                (name, password_hash, user_id),
            )
        else:
            cur.execute(
                "INSERT INTO users (name, email, password_hash) VALUES (%s, %s, %s)",
                (name, email, password_hash),
            )
            user_id = cur.lastrowid

        otp = store_new_otp(cur, user_id)
        conn.commit()
    except mysql.connector.Error:
        current_app.logger.exception("Database error during register")
        return error("Database error. Please try again later.", 500)
    finally:
        if conn is not None and conn.is_connected():
            conn.close()

    try:
        send_otp_email(email, name, otp)
    except Exception:
        current_app.logger.exception("Could not send verification email")
        return error(
            "Account created, but the verification email could not be sent. "
            "Use 'Resend code' in a moment.",
            502,
        )

    return jsonify({
        "message": "Account created. We sent a 6-digit code to your email.",
        "email": email,
    }), 201


@auth_bp.post("/verify-otp")
def verify_otp():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return error("Request body must be valid JSON.")

    email = data.get("email")
    otp = data.get("otp")
    if not isinstance(email, str) or not isinstance(otp, str):
        return error("Email and code are required.")
    email = email.strip().lower()
    otp = otp.strip()
    if not OTP_RE.match(otp):
        return error("The code must be 6 digits.")

    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT id, is_verified FROM users WHERE email = %s", (email,))
        user = cur.fetchone()
        if not user:
            return error("Invalid or expired code.")
        if user["is_verified"]:
            return jsonify({"message": "Email already verified. You can log in."})

        cur.execute(
            "SELECT otp_hash, expires_at, attempts FROM email_otps WHERE user_id = %s",
            (user["id"],),
        )
        row = cur.fetchone()
        if not row:
            return error("Invalid or expired code. Please request a new one.")

        if row["attempts"] >= Config.OTP_MAX_ATTEMPTS:
            return error("Too many wrong attempts. Please request a new code.", 429)

        if utcnow() > row["expires_at"]:
            return error("This code has expired. Please request a new one.")

        if not check_password_hash(row["otp_hash"], otp):
            cur.execute(
                "UPDATE email_otps SET attempts = attempts + 1 WHERE user_id = %s",
                (user["id"],),
            )
            conn.commit()
            left = Config.OTP_MAX_ATTEMPTS - row["attempts"] - 1
            return error(f"Incorrect code. {max(left, 0)} attempts left.")

        cur.execute("UPDATE users SET is_verified = 1 WHERE id = %s", (user["id"],))
        cur.execute("DELETE FROM email_otps WHERE user_id = %s", (user["id"],))
        conn.commit()
    except mysql.connector.Error:
        current_app.logger.exception("Database error during OTP verification")
        return error("Database error. Please try again later.", 500)
    finally:
        if conn is not None and conn.is_connected():
            conn.close()

    return jsonify({"message": "Email verified. You can now log in."})


@auth_bp.post("/resend-otp")
def resend_otp():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return error("Request body must be valid JSON.")

    email = data.get("email")
    if not isinstance(email, str):
        return error("Email is required.")
    email = email.strip().lower()

    # Same reply whether or not the email exists (does not reveal accounts)
    generic = jsonify({"message": "If this email needs verification, a new code has been sent."})

    conn = None
    name = None
    otp = None
    try:
        conn = get_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT id, name, is_verified FROM users WHERE email = %s", (email,))
        user = cur.fetchone()
        if not user or user["is_verified"]:
            return generic

        wait = seconds_until_resend(cur, user["id"])
        if wait > 0:
            return error(f"Please wait {wait} seconds before requesting a new code.", 429)

        name = user["name"]
        otp = store_new_otp(cur, user["id"])
        conn.commit()
    except mysql.connector.Error:
        current_app.logger.exception("Database error during resend")
        return error("Database error. Please try again later.", 500)
    finally:
        if conn is not None and conn.is_connected():
            conn.close()

    try:
        send_otp_email(email, name, otp)
    except Exception:
        current_app.logger.exception("Could not send verification email")
        return error("Could not send the email right now. Please try again later.", 502)

    return generic


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return error("Request body must be valid JSON.")

    email = data.get("email")
    password = data.get("password")
    if not isinstance(email, str) or not isinstance(password, str):
        return error("Email and password are required.")
    email = email.strip().lower()

    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute(
            "SELECT id, name, email, password_hash, is_verified FROM users WHERE email = %s",
            (email,),
        )
        user = cur.fetchone()
    except mysql.connector.Error:
        current_app.logger.exception("Database error during login")
        return error("Database error. Please try again later.", 500)
    finally:
        if conn is not None and conn.is_connected():
            conn.close()

    if not user or not check_password_hash(user["password_hash"], password):
        return error("Invalid email or password.", 401)

    if not user["is_verified"]:
        return error("Please verify your email first.", 403, code="not_verified")

    token = create_access_token(identity=str(user["id"]))
    resp = jsonify({"user": {"id": user["id"], "name": user["name"], "email": user["email"]}})
    set_access_cookies(resp, token)
    return resp


@auth_bp.post("/logout")
def logout():
    resp = jsonify({"message": "Logged out."})
    unset_jwt_cookies(resp)
    return resp


@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT id, name, email FROM users WHERE id = %s", (user_id,))
        user = cur.fetchone()
    except mysql.connector.Error:
        current_app.logger.exception("Database error in /me")
        return error("Database error. Please try again later.", 500)
    finally:
        if conn is not None and conn.is_connected():
            conn.close()

    if not user:
        return error("User not found.", 404)
    return jsonify({"user": user})