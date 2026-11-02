import mysql.connector
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash

from db import get_connection

profile_bp = Blueprint("profile", __name__, url_prefix="/api")


def error(message, status=400):
    return jsonify({"error": message}), status


def close(conn):
    if conn is not None and conn.is_connected():
        conn.close()


@profile_bp.patch("/profile")
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return error("Request body must be valid JSON.")

    name = data.get("name")
    if not isinstance(name, str):
        return error("Name is required.")
    name = name.strip()
    if not 2 <= len(name) <= 100:
        return error("Name must be 2 to 100 characters.")

    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute("UPDATE users SET name = %s WHERE id = %s", (name, user_id))
        conn.commit()
        cur.execute("SELECT id, name, email FROM users WHERE id = %s", (user_id,))
        user = cur.fetchone()
    except mysql.connector.Error:
        current_app.logger.exception("Database error in update_profile")
        return error("Database error. Please try again later.", 500)
    finally:
        close(conn)

    return jsonify({"user": user, "message": "Profile updated."})


@profile_bp.post("/change-password")
@jwt_required()
def change_password():
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return error("Request body must be valid JSON.")

    current = data.get("current_password")
    new = data.get("new_password")
    confirm = data.get("confirm")
    if not all(isinstance(v, str) for v in (current, new, confirm)):
        return error("All password fields are required.")
    if not 8 <= len(new) <= 128:
        return error("New password must be 8 to 128 characters.")
    if new != confirm:
        return error("New passwords do not match.")
    if new == current:
        return error("New password must be different from the current one.")

    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT password_hash FROM users WHERE id = %s", (user_id,))
        row = cur.fetchone()
        if not row or not check_password_hash(row["password_hash"], current):
            return error("Current password is incorrect.", 400)
        cur.execute(
            "UPDATE users SET password_hash = %s WHERE id = %s",
            (generate_password_hash(new), user_id),
        )
        conn.commit()
    except mysql.connector.Error:
        current_app.logger.exception("Database error in change_password")
        return error("Database error. Please try again later.", 500)
    finally:
        close(conn)

    return jsonify({"message": "Password changed."})


@profile_bp.delete("/history")
@jwt_required()
def delete_all_history():
    user_id = int(get_jwt_identity())
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM analyses WHERE user_id = %s", (user_id,))
        conn.commit()
        count = cur.rowcount
    except mysql.connector.Error:
        current_app.logger.exception("Database error in delete_all_history")
        return error("Database error. Please try again later.", 500)
    finally:
        close(conn)

    return jsonify({"message": "All analyses deleted.", "deleted": count})